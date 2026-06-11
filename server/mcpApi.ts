/**
 * MCP Control API — superfície REST completa para controlar a Dashboard Multipark
 * a partir de um servidor MCP (ou qualquer cliente HTTP).
 *
 * Montado em /api/v1. Autenticação por header X-API-Key (tabela api_keys).
 * Cada chave tem um campo `permissions` que define o scope:
 *   - "read"           → só leituras
 *   - "read,write"     → leituras + escrita operacional (criar/editar, syncs)
 *   - "admin" ou "*"   → tudo, incluindo operações destrutivas
 * (admin implica write implica read). Chaves sem permissions não acedem aqui.
 *
 * Cobre todos os parques e cidades (PARK_CONFIGS).
 */
import { Router, Request, Response, NextFunction } from "express";
import { and, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { apiKeys, multiparkBookings } from "../drizzle/schema";
import {
  getMultiparkBookings,
  getMultiparkBookingByExternalId,
  getMultiparkBookingStats,
  getComplaints,
  getComplaintById,
  getComplaintMessages,
  getComplaintPhotos,
  createComplaint,
  updateComplaint,
  deleteComplaint,
  addComplaintMessage,
  getComplaintStats,
  getGoogleReviews,
  createGoogleReview,
  getVehicles,
  getAllEmployees,
  logActivity,
} from "./db";

let _db: ReturnType<typeof drizzle> | null = null;
async function db() {
  if (!_db && process.env.DATABASE_URL) _db = drizzle(process.env.DATABASE_URL);
  return _db;
}

// ─── AUTH + SCOPES ────────────────────────────────────────────────────────────

type Scope = "read" | "write" | "admin";

function scopesFor(permissions: string | null | undefined): Set<Scope> {
  const s = new Set<Scope>();
  if (!permissions) return s;
  let parts: string[] = [];
  try {
    const parsed = JSON.parse(permissions);
    parts = Array.isArray(parsed) ? parsed.map(String) : String(parsed).split(/[,\s]+/);
  } catch {
    parts = permissions.split(/[,\s]+/);
  }
  const set = new Set(parts.map(p => p.trim().toLowerCase()).filter(Boolean));
  if (set.has("*") || set.has("admin") || set.has("full")) { s.add("read"); s.add("write"); s.add("admin"); return s; }
  if (set.has("write")) { s.add("read"); s.add("write"); }
  if (set.has("read")) s.add("read");
  return s;
}

async function validateApiKey(req: Request, res: Response, next: NextFunction) {
  const key = req.headers["x-api-key"] as string;
  if (!key) return res.status(401).json({ error: "Missing X-API-Key header" });
  const d = await db();
  if (!d) return res.status(500).json({ error: "Database unavailable" });
  const rows = await d.select().from(apiKeys).where(and(eq(apiKeys.apiKey, key), eq(apiKeys.active, 1))).limit(1);
  if (rows.length === 0) return res.status(403).json({ error: "Invalid or inactive API key" });
  await d.update(apiKeys).set({ lastUsedAt: new Date().toISOString().slice(0, 19).replace("T", " ") }).where(eq(apiKeys.id, rows[0].id));
  (req as any).apiKeyInfo = rows[0];
  (req as any).scopes = scopesFor(rows[0].permissions);
  next();
}

function requireScope(scope: Scope) {
  return (req: Request, res: Response, next: NextFunction) => {
    const scopes: Set<Scope> = (req as any).scopes ?? new Set();
    if (!scopes.has(scope)) {
      return res.status(403).json({
        error: `Esta API key não tem o scope '${scope}'. Scopes da chave: [${Array.from(scopes).join(", ") || "nenhum"}].`,
      });
    }
    next();
  };
}

// helper para apanhar erros sem repetir try/catch
const h = (fn: (req: Request, res: Response) => Promise<any>) =>
  (req: Request, res: Response) => fn(req, res).catch((e: any) => res.status(500).json({ error: e?.message || String(e) }));

function parseDate(v: any): Date | undefined {
  if (!v) return undefined;
  const d = new Date(String(v));
  return isNaN(d.getTime()) ? undefined : d;
}

// ─── ROUTER ─────────────────────────────────────────────────────────────────

export function createMcpApiRouter(): Router {
  const r = Router();
  r.use(validateApiKey);

  // Índice / capacidades
  r.get("/", (req: Request, res: Response) => {
    res.json({
      service: "Multipark Dashboard MCP Control API",
      version: "1",
      yourScopes: Array.from((req as any).scopes ?? []),
      endpoints: {
        read: [
          "GET /parks", "GET /bookings", "GET /bookings/stats", "GET /bookings/:externalId",
          "GET /complaints", "GET /complaints/stats", "GET /complaints/:id",
          "GET /reviews", "GET /vehicles", "GET /employees", "GET /dashboard/summary",
        ],
        write: [
          "POST /complaints", "PATCH /complaints/:id", "POST /complaints/:id/messages",
          "POST /reviews", "POST /sync/recent", "POST /sync/future", "POST /sync/day",
        ],
        admin: ["DELETE /complaints/:id", "POST /admin/cleanup-duplicates"],
      },
    });
  });

  // ── PARQUES / CIDADES ───────────────────────────────────────────────────────
  r.get("/parks", requireScope("read"), h(async (_req, res) => {
    const { PARK_CONFIGS } = await import("./multipark");
    const cities = Array.from(new Set(PARK_CONFIGS.map((p: any) => p.city)));
    res.json({
      success: true,
      cities,
      parks: PARK_CONFIGS.map((p: any) => ({ id: p.id, name: p.name, city: p.city, closed: !!p.closed })),
    });
  }));

  // ── RESERVAS (todos os parques/cidades) ──────────────────────────────────────
  r.get("/bookings", requireScope("read"), h(async (req, res) => {
    const q = req.query;
    const list = await getMultiparkBookings({
      status: q.status ? String(q.status) : undefined,
      parkingType: q.parkingType ? String(q.parkingType) : undefined,
      city: q.city ? String(q.city) : undefined,
      parkId: q.parkId ? String(q.parkId) : undefined,
      from: parseDate(q.from),
      to: parseDate(q.to),
      search: q.search ? String(q.search) : undefined,
      limit: q.limit ? Math.min(Number(q.limit), 500) : 100,
      offset: q.offset ? Number(q.offset) : 0,
    });
    res.json({ success: true, count: list.length, data: list });
  }));

  r.get("/bookings/stats", requireScope("read"), h(async (req, res) => {
    const q = req.query;
    const stats = await getMultiparkBookingStats({
      from: q.from ? String(q.from) : undefined,
      to: q.to ? String(q.to) : undefined,
      projectId: q.projectId ? Number(q.projectId) : undefined,
    });
    res.json({ success: true, data: stats });
  }));

  r.get("/bookings/:externalId", requireScope("read"), h(async (req, res) => {
    const ext = req.params.externalId;
    const local = await getMultiparkBookingByExternalId(ext);
    let live: any = null;
    let park: any = null;
    try {
      const { getBookingTryAllParks } = await import("./multipark");
      const found = await getBookingTryAllParks(ext);
      if (found) { live = found.booking; park = { id: found.parkConfig.id, name: found.parkConfig.name, city: found.parkConfig.city }; }
    } catch { /* API pode falhar; devolvemos o local na mesma */ }
    if (!local && !live) return res.status(404).json({ error: "Reserva não encontrada (local nem API)" });
    res.json({ success: true, local: local ?? null, live, park });
  }));

  // ── RECLAMAÇÕES ───────────────────────────────────────────────────────────────
  r.get("/complaints", requireScope("read"), h(async (req, res) => {
    const q = req.query;
    const list = await getComplaints({
      status: q.status ? String(q.status) : undefined,
      type: q.type ? String(q.type) : undefined,
      projectId: q.projectId ? Number(q.projectId) : undefined,
      assignedToId: q.assignedToId ? Number(q.assignedToId) : undefined,
    });
    res.json({ success: true, count: list.length, data: list });
  }));

  r.get("/complaints/stats", requireScope("read"), h(async (req, res) => {
    const projectId = req.query.projectId ? Number(req.query.projectId) : undefined;
    res.json({ success: true, data: await getComplaintStats(projectId) });
  }));

  r.get("/complaints/:id", requireScope("read"), h(async (req, res) => {
    const id = Number(req.params.id);
    const complaint = await getComplaintById(id);
    if (!complaint) return res.status(404).json({ error: "Reclamação não encontrada" });
    res.json({
      success: true,
      data: { complaint, messages: await getComplaintMessages(id), photos: await getComplaintPhotos(id) },
    });
  }));

  r.post("/complaints", requireScope("write"), h(async (req, res) => {
    const b = req.body ?? {};
    if (!b.title) return res.status(400).json({ error: "title é obrigatório" });
    if (!b.type) return res.status(400).json({ error: "type é obrigatório (damage|dirt|delay|overcharge|staff|other)" });
    const slaHours = b.slaHours ? Number(b.slaHours) : null;
    const slaDeadline = slaHours ? new Date(Date.now() + slaHours * 3600000).toISOString().slice(0, 19).replace("T", " ") : null;
    const id = await createComplaint({
      title: String(b.title),
      description: b.description ?? null,
      complaintType: b.type,
      complaintPriority: b.priority ?? "medium",
      complaintStatus: "new",
      clientName: b.clientName ?? null,
      clientEmail: b.clientEmail ?? null,
      clientPhone: b.clientPhone ?? null,
      reservationRef: b.reservationRef ?? null,
      vehiclePlate: b.vehiclePlate ?? null,
      slaDeadline,
      projectId: b.projectId ? Number(b.projectId) : null,
      assignedToId: b.assignedToId ? Number(b.assignedToId) : null,
      createdById: (req as any).apiKeyInfo?.createdById ?? null,
    } as any);
    await logActivity({ userId: 0, action: "create", entity: "complaint", entityId: id, details: `[MCP] ${b.title}` });
    res.json({ success: true, id });
  }));

  r.patch("/complaints/:id", requireScope("write"), h(async (req, res) => {
    const id = Number(req.params.id);
    const b = req.body ?? {};
    const data: any = {};
    if (b.title !== undefined) data.title = b.title;
    if (b.description !== undefined) data.description = b.description;
    if (b.type !== undefined) data.complaintType = b.type;
    if (b.status !== undefined) data.complaintStatus = b.status;
    if (b.priority !== undefined) data.complaintPriority = b.priority;
    if (b.assignedToId !== undefined) data.assignedToId = b.assignedToId === null ? null : Number(b.assignedToId);
    if (b.penaltyPoints !== undefined) data.penaltyPoints = Number(b.penaltyPoints);
    if (b.slaHours !== undefined) data.slaDeadline = Number(b.slaHours) > 0 ? new Date(Date.now() + Number(b.slaHours) * 3600000) : null;
    if (b.status === "resolved") data.resolvedAt = new Date();
    if (Object.keys(data).length === 0) return res.status(400).json({ error: "Nada para atualizar" });
    await updateComplaint(id, data);
    await logActivity({ userId: 0, action: "update", entity: "complaint", entityId: id, details: `[MCP] update` });
    res.json({ success: true });
  }));

  r.post("/complaints/:id/messages", requireScope("write"), h(async (req, res) => {
    const complaintId = Number(req.params.id);
    const b = req.body ?? {};
    if (!b.message) return res.status(400).json({ error: "message é obrigatório" });
    const msgId = await addComplaintMessage({
      complaintId,
      message: String(b.message),
      isInternal: b.isInternal ? 1 : 0,
      authorId: (req as any).apiKeyInfo?.createdById ?? null,
      authorName: b.authorName ?? "MCP",
    } as any);
    res.json({ success: true, id: msgId });
  }));

  r.delete("/complaints/:id", requireScope("admin"), h(async (req, res) => {
    const id = Number(req.params.id);
    await deleteComplaint(id);
    await logActivity({ userId: 0, action: "delete", entity: "complaint", entityId: id, details: `[MCP] delete` });
    res.json({ success: true });
  }));

  // ── GOOGLE REVIEWS ────────────────────────────────────────────────────────────
  r.get("/reviews", requireScope("read"), h(async (req, res) => {
    const q = req.query;
    const list = await getGoogleReviews({
      rating: q.rating ? Number(q.rating) : undefined,
      status: q.status ? String(q.status) : undefined,
      projectId: q.projectId ? Number(q.projectId) : undefined,
    });
    res.json({ success: true, count: list.length, data: list });
  }));

  r.post("/reviews", requireScope("write"), h(async (req, res) => {
    const b = req.body ?? {};
    if (!b.reviewerName || !b.rating) return res.status(400).json({ error: "reviewerName e rating são obrigatórios" });
    const reviewDate = (b.reviewDate ? new Date(b.reviewDate) : new Date()).toISOString().slice(0, 19).replace("T", " ");
    const id = await createGoogleReview({
      reviewerName: String(b.reviewerName),
      reviewerEmail: b.reviewerEmail ?? null,
      rating: Number(b.rating),
      reviewText: b.reviewText ?? null,
      reviewDate,
      projectId: b.projectId ? Number(b.projectId) : null,
      vehiclePlate: b.vehiclePlate ?? null,
      createdById: (req as any).apiKeyInfo?.createdById ?? null,
    } as any);
    res.json({ success: true, id });
  }));

  // ── VIATURAS / COLABORADORES ──────────────────────────────────────────────────
  r.get("/vehicles", requireScope("read"), h(async (_req, res) => {
    const list = await getVehicles();
    res.json({ success: true, count: list.length, data: list.map((v: any) => ({ id: v.id, plate: v.plate, brand: v.brand, model: v.model, status: v.status, projectId: v.projectId })) });
  }));

  r.get("/employees", requireScope("read"), h(async (_req, res) => {
    const list = await getAllEmployees();
    res.json({ success: true, count: list.length, data: list.map((e: any) => ({ id: e.employee.id, fullName: e.employee.fullName, position: e.employee.position, projectId: e.employee.projectId })) });
  }));

  // ── SYNC (controlar a sincronização) ────────────────────────────────────────
  r.post("/sync/recent", requireScope("write"), h(async (req, res) => {
    const { runRecentCronSync } = await import("./jobs/multiparkBookingSync");
    const windowMinutes = req.body?.windowMinutes ? Number(req.body.windowMinutes) : 30;
    res.json({ success: true, ...(await runRecentCronSync(windowMinutes)) });
  }));

  r.post("/sync/future", requireScope("write"), h(async (req, res) => {
    const { runFutureCronSync } = await import("./jobs/multiparkBookingSync");
    const weeks = req.body?.weeksAhead ? Number(req.body.weeksAhead) : 4;
    res.json({ success: true, ...(await runFutureCronSync(weeks)) });
  }));

  // Sincroniza um dia específico (report + enrich + history) — para backfill
  r.post("/sync/day", requireScope("write"), h(async (req, res) => {
    const date = String(req.body?.date ?? "").slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ error: "date (YYYY-MM-DD) é obrigatório" });
    const { syncBookings, enrichBookingsBatch, syncBookingHistoryBatch } = await import("./jobs/multiparkBookingSync");
    const report = await syncBookings({ startDate: date, endDate: date });
    const [enrichRes, historyRes] = await Promise.allSettled([enrichBookingsBatch(100), syncBookingHistoryBatch(50)]);
    res.json({
      success: true,
      date,
      report,
      enriched: enrichRes.status === "fulfilled" ? (enrichRes.value as any).enriched : 0,
      historyFetched: historyRes.status === "fulfilled" ? (historyRes.value as any).fetched : 0,
    });
  }));

  // ── ADMIN (destrutivo) ──────────────────────────────────────────────────────
  // One-shot, idempotente: colunas de métricas diárias nas campanhas (0048).
  r.post("/admin/migrate-0048", requireScope("admin"), h(async (_req, res) => {
    const { MIGRATION_0048_STATEMENTS, IDEMPOTENT_ERROR_CODES_0048 } = await import("./migrations/migration_0048");
    const d = await db();
    if (!d) return res.status(500).json({ error: "DB unavailable" });
    let ok = 0, skipped = 0;
    const errors: string[] = [];
    for (const stmt of MIGRATION_0048_STATEMENTS) {
      try {
        await d.execute(sql.raw(stmt));
        ok++;
      } catch (e: any) {
        // drizzle embrulha o erro do mysql2 — o code fica em e.cause
        const code = e?.code ?? e?.cause?.code;
        const msg = String(e?.cause?.message ?? e?.message ?? e);
        if ((code && IDEMPOTENT_ERROR_CODES_0048.has(code)) || /duplicate column/i.test(msg)) skipped++;
        else errors.push(`${code ?? "ERR"}: ${msg.slice(0, 200)}`);
      }
    }
    res.json({ success: errors.length === 0, ok, skipped, errors });
  }));

  r.post("/admin/cleanup-duplicates", requireScope("admin"), h(async (_req, res) => {
    const d = await db();
    if (!d) return res.status(500).json({ error: "DB unavailable" });
    const result = await d.execute(sql`
      DELETE FROM multipark_bookings WHERE id IN (
        SELECT id FROM (
          SELECT b1.id FROM multipark_bookings b1
          INNER JOIN multipark_bookings b2
            ON b1.externalId = b2.externalId
           AND (b1.updatedAt < b2.updatedAt OR (b1.updatedAt = b2.updatedAt AND b1.id < b2.id))
          LIMIT 5000
        ) AS t
      )`) as any;
    const meta = Array.isArray(result[0]) ? result[0] : result;
    res.json({ success: true, deleted: Number((meta as any)?.affectedRows ?? 0) });
  }));

  // ── DASHBOARD SUMMARY (visão cruzada, todos os parques) ──────────────────────
  r.get("/dashboard/summary", requireScope("read"), h(async (req, res) => {
    const d = await db();
    const q = req.query;
    const from = q.from ? String(q.from) : undefined;
    const to = q.to ? String(q.to) : undefined;
    const [bookingStats, complaintStats] = await Promise.all([
      getMultiparkBookingStats({ from, to }),
      getComplaintStats(),
    ]);
    let byCity: any[] = [];
    if (d) {
      const conds: any[] = [];
      if (from) conds.push(sql`${multiparkBookings.checkIn} >= ${from}`);
      if (to) conds.push(sql`${multiparkBookings.checkIn} <= ${to}`);
      byCity = await d
        .select({ city: multiparkBookings.city, count: sql<number>`COUNT(*)`, revenue: sql<number>`COALESCE(SUM(${multiparkBookings.totalPrice}),0)` })
        .from(multiparkBookings)
        .where(conds.length ? (and(...conds) as any) : undefined)
        .groupBy(multiparkBookings.city);
    }
    res.json({ success: true, bookings: bookingStats, complaints: complaintStats, byCity });
  }));

  return r;
}
