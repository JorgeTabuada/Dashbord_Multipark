/**
 * MultiPark Booking Sync Job
 *
 * Periodically fetches bookings from the MultiPark API and stores them locally.
 * Runs every 15 minutes, fetching the last 2 days of data for each action type:
 * - creation: new bookings
 * - checkin: car arrivals
 * - checkout: car departures (when revenue is confirmed)
 * - cancelation: cancelled bookings
 *
 * Also supports manual sync for a custom date range.
 */

import {
  getBookingsReport,
  getBooking,
  getBookingHistory,
  getAgentHistory,
  isMultiparkConfigured,
  getConfiguredParks,
  getParkApiKey,
  type MultiparkBooking,
  type BookingActionType,
  type ParkConfig,
} from "../multipark";
import {
  upsertMultiparkBooking,
  upsertBookingExtras,
  createSyncLog,
  getProjects,
  getDb,
} from "../db";
import { eq } from "drizzle-orm";
import { multiparkBookings, multiparkBookingHistory } from "../../drizzle/schema";
import { classifyAllocation } from "../spotClassification";

// ─── Map park name/city to projectId ─────────────────────────────────────────

let projectMapCache: Map<string, number> | null = null;
let projectMapCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getProjectMap(): Promise<Map<string, number>> {
  if (projectMapCache && Date.now() - projectMapCacheTime < CACHE_TTL) {
    return projectMapCache;
  }
  const projects = await getProjects();
  const map = new Map<string, number>();

  for (const p of projects) {
    // Match by project name (case-insensitive), supports patterns like:
    // "Skypark Lisboa", "Top Parking Porto", "Multipark Lisboa"
    const key = p.name.toLowerCase().trim();
    map.set(key, p.id);
  }

  projectMapCache = map;
  projectMapCacheTime = Date.now();
  return map;
}

// ─── Alias resolver: lookup de partnerId/paymentMethod → nome do parceiro ──
// Cada parceiro tem normalmente vários códigos (1 por cidade × marca). A
// tabela partner_aliases guarda essas associações. Antes de gravar uma
// reserva nova no sync, resolvemos o partnerId raw da API contra os aliases
// e, se encontrarmos, definimos campaign = nome do parceiro automaticamente.
// Assim deixa de ser preciso clicar "Associar" manualmente para cada nova
// reserva com um código já conhecido.
let aliasResolverCache: Map<string, string> | null = null;
let aliasResolverCacheTime = 0;

async function getAliasResolver(): Promise<Map<string, string>> {
  if (aliasResolverCache && Date.now() - aliasResolverCacheTime < CACHE_TTL) {
    return aliasResolverCache;
  }
  const db = await getDb();
  const map = new Map<string, string>();
  if (!db) {
    aliasResolverCache = map;
    aliasResolverCacheTime = Date.now();
    return map;
  }
  const { partnerAliases, partnerships } = await import("../../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  const rows = await db
    .select({
      aliasType: partnerAliases.aliasType,
      aliasValue: partnerAliases.aliasValue,
      partnerName: partnerships.name,
    })
    .from(partnerAliases)
    .leftJoin(partnerships, eq(partnerships.id, partnerAliases.partnershipId));
  for (const r of rows) {
    if (!r.partnerName) continue;
    const key = `${r.aliasType}:${(r.aliasValue ?? "").trim().toLowerCase()}`;
    map.set(key, r.partnerName);
  }
  aliasResolverCache = map;
  aliasResolverCacheTime = Date.now();
  return map;
}

function resolvePartnerCampaign(
  booking: MultiparkBooking,
  pricing: any,
  aliases: Map<string, string>,
  fallback: string | null,
): string | null {
  // 1. Tenta o partnerId da Multipark (no rawJson, propriedade nivel topo)
  const partnerId = (booking as any).partnerId ?? (booking as any).partner?.id ?? null;
  if (partnerId) {
    const hit = aliases.get(`multipark_partner_id:${String(partnerId).trim().toLowerCase()}`);
    if (hit) return hit;
  }
  // 2. Tenta o paymentMethod
  const pm = typeof pricing?.paymentMethod === "string" ? pricing.paymentMethod : null;
  if (pm) {
    const hit = aliases.get(`payment_method:${pm.trim().toLowerCase()}`);
    if (hit) return hit;
  }
  return fallback;
}

function findProjectId(
  parkName: string | undefined,
  city: string | undefined,
  projectMap: Map<string, number>
): number | undefined {
  if (!parkName) return undefined;

  const parkLower = parkName.toLowerCase().trim();
  // Normalize: "Airpark - Faro" -> "airpark faro"
  const parkNorm = parkLower.replace(/\s*-\s*/g, " ");

  // Try composite "ParkName City" match first (e.g. "airpark lisboa", "airpark faro")
  if (city) {
    const cityLower = city.toLowerCase().trim();
    const composite = `${parkNorm} ${cityLower}`;
    if (projectMap.has(composite)) return projectMap.get(composite);
    // Also try with original format
    const composite2 = `${parkLower} ${cityLower}`;
    if (projectMap.has(composite2)) return projectMap.get(composite2);
  }

  // Try normalized exact match (e.g. "airpark faro" matches project "airpark faro")
  if (projectMap.has(parkNorm)) return projectMap.get(parkNorm);

  // Try exact match
  if (projectMap.has(parkLower)) return projectMap.get(parkLower);

  // Try partial match — prefer longest (most specific) match
  let bestMatch: { key: string; id: number } | null = null;
  for (const [key, id] of projectMap) {
    if (key.includes(parkNorm) || parkNorm.includes(key)) {
      if (!bestMatch || key.length > bestMatch.key.length) {
        bestMatch = { key, id };
      }
    }
  }
  if (bestMatch) return bestMatch.id;

  // Try matching city + park fragments
  if (city) {
    const cityLower = city.toLowerCase().trim();
    for (const [key, id] of projectMap) {
      if (key.includes(parkNorm) && key.includes(cityLower)) return id;
    }
  }

  return undefined;
}

// ─── Parse date from MultiPark format "DD/MM/YYYY, HH:mm" ────────────────────

function parseMultiparkDate(dateStr: string | undefined | null): string | null {
  if (!dateStr) return null;
  // Format: "07/03/2026, 14:15"
  const match = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4}),?\s*(\d{2}):(\d{2})/);
  let d: Date | null = null;
  if (match) {
    const [, day, month, year, hours, minutes] = match;
    d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
  } else {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) d = parsed;
  }
  return d ? d.toISOString().slice(0, 19).replace("T", " ") : null;
}

// ─── Convert API booking to DB record ────────────────────────────────────────

function bookingToRecord(
  booking: MultiparkBooking,
  projectMap: Map<string, number>,
  aliasResolver: Map<string, string>,
) {
  const client = booking.customer || booking.client;
  const pricing = booking.pricing;
  const park = booking.park;
  const parkName = park?.name || booking.parkName;
  const city = park?.city;
  const projectId = findProjectId(parkName, city, projectMap);

  // Resolução automática do parceiro: se a API ainda devolve "Unknown User"
  // mas o partnerId/paymentMethod já está associado a um parceiro nosso, usa
  // o nome do parceiro em vez do fallback.
  const rawFallback = (booking as any).partnerName || booking.discountCode || booking.campaign || null;
  const isUnknown = typeof rawFallback === "string" && /unknown/i.test(rawFallback);
  const effectiveFallback = isUnknown ? null : rawFallback;
  const resolvedCampaign = resolvePartnerCampaign(booking, pricing, aliasResolver, effectiveFallback);

  return {
    externalId: booking.id,
    bookingNumber: booking.bookingNumber || booking.allocation || null,
    status: booking.status || null,
    checkIn: parseMultiparkDate(booking.checkInDate || booking.checkIn),
    checkOut: parseMultiparkDate(booking.checkOutDate || booking.checkOut),
    checkInTime: booking.checkInTime || null,
    checkOutTime: booking.checkOutTime || null,
    parkingType: booking.parkingType || (park?.types?.[0]) || null,
    vehicleType: booking.vehicle?.type || booking.vehicleType || null,
    clientFirstName: client?.firstName || null,
    clientLastName: client?.lastName || null,
    clientEmail: client?.email || null,
    clientPhone: client?.phoneNumber || null,
    clientNif: client?.nif || null,
    licensePlate: booking.vehicle?.licensePlate || null,
    vehicleBrand: booking.vehicle?.brand || null,
    vehicleModel: booking.vehicle?.model || null,
    vehicleColor: booking.vehicle?.color || null,
    totalPrice: pricing?.totalPrice?.toString() ?? pricing?.total?.toString() ?? null,
    currency: pricing?.currency || "EUR",
    parkId: park?.id || booking.parkId || null,
    parkName: parkName || null,
    city: city || null,
    projectId: projectId || null,
    deliveryService: booking.deliveryService ? 1 : 0,
    deliveryAddress: booking.deliveryAddress || null,
    pickupAddress: booking.pickupAddress || null,
    campaign: resolvedCampaign,
    parkingPrice: pricing?.parkingPrice?.toString() ?? null,
    deliveryCharges: pricing?.deliveryCharges?.toString() ?? null,
    extrasTotal: pricing?.extraServicesTotal?.toString() ?? null,
    discount: pricing?.discount?.toString() ?? null,
    remainingToPay: pricing?.remainingToPay?.toString() ?? null,
    arrivalFlight: booking.flightInfo?.arrivalFlight || booking.arrivalFlight || null,
    departureFlight: booking.flightInfo?.departureFlight || booking.departureFlight || null,
    cancelledAt: parseMultiparkDate(booking.cancelledAt),
    cancelReason: booking.cancelReason || null,
    notes: booking.notes || null,
    rawJson: JSON.stringify(booking),
    bookingCreatedAt: parseMultiparkDate(booking.createdAt),
    paymentMethod: typeof (pricing as any)?.paymentMethod === "string"
      ? (pricing as any).paymentMethod.slice(0, 128)
      : null,
    totalPaid: (pricing as any)?.totalPaid?.toString() ?? null,
    pro: (booking as any).pro ? 1 : 0,
    partnerId: (booking as any).partnerId ? String((booking as any).partnerId).slice(0, 128) : null,
    // partnerName no /report vem mascarado ("Unknown User") — filtra-o; o nome
    // real (quando existe) vem do enrichment. partnerId é o que casa com o alias.
    partnerName: (() => {
      const pn = (booking as any).partnerName;
      return typeof pn === "string" && pn && !/unknown/i.test(pn) ? pn.slice(0, 256) : null;
    })(),
    // campaignId/campaignName NÃO existem no /report — só no /bookings/:id.
    // São preenchidos no enrichment (não aqui, senão o sync sobrescrevia-os com null).
    cashValidatedByName: typeof (booking as any).cashValidatedByName === "string" ? (booking as any).cashValidatedByName.slice(0, 256) : null,
    driverValidatedByName: typeof (booking as any).driverValidatedByName === "string" ? (booking as any).driverValidatedByName.slice(0, 256) : null,
    cashierClosedByName: typeof (booking as any).cashierClosedByName === "string" ? (booking as any).cashierClosedByName.slice(0, 256) : null,
    ...classifyAllocation((booking as any).allocation),
  };
}

// ─── Enrichment via /bookings/:id (apanha deliveryType, flights, remarks) ────

const ENRICH_CONCURRENCY = 5;
const ENRICH_MAX_PER_SYNC = 30; // cap to fit within Vercel function timeout

function nowMysql(): string {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

/**
 * Chama /bookings/:id para obter os campos que /bookings/report não devolve
 * (deliveryType, returnFlight, departingFlight, remarks) e persiste em DB.
 * Idempotente: se enrichedAt já estiver preenchido, salta.
 *
 * Marca SEMPRE enrichedAt (mesmo em erro 404 ou key errada) para não voltar
 * a tentar a mesma reserva ad infinitum — o batch ficaria preso a falhar
 * sempre nos mesmos IDs.
 */
async function enrichBookingIfNeeded(externalId: string, apiKey: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const [current] = await db
    .select({ enrichedAt: multiparkBookings.enrichedAt })
    .from(multiparkBookings)
    .where(eq(multiparkBookings.externalId, externalId))
    .limit(1);
  if (current?.enrichedAt) return false; // already enriched

  try {
    const detailed = await getBooking(externalId, apiKey);
    const b: any = detailed;

    // Cliente + veículo só são preenchidos se vierem (o report mascara estes
    // campos para reservas de parceiros; o /bookings/:id devolve-os reais).
    const update: Record<string, any> = {
      deliveryType: typeof b.deliveryType === "string" && b.deliveryType ? b.deliveryType : null,
      returnFlight: typeof b.returnFlight === "string" && b.returnFlight ? b.returnFlight : null,
      departingFlight: typeof b.departingFlight === "string" && b.departingFlight ? b.departingFlight : null,
      remarks: typeof b.remarks === "string" && b.remarks ? b.remarks.slice(0, 512) : null,
      enrichedAt: nowMysql(),
    };
    if (b.client?.firstName) update.clientFirstName = b.client.firstName;
    if (b.client?.lastName) update.clientLastName = b.client.lastName;
    if (b.client?.email) update.clientEmail = b.client.email;
    if (b.client?.phoneNumber) update.clientPhone = b.client.phoneNumber;
    if (b.vehicle?.licensePlate) update.licensePlate = b.vehicle.licensePlate;
    if (b.vehicle?.brand) update.vehicleBrand = b.vehicle.brand;
    if (b.vehicle?.model) update.vehicleModel = b.vehicle.model;
    if (b.vehicle?.color) update.vehicleColor = b.vehicle.color;
    if (b.vehicle?.vehicleType) update.vehicleType = b.vehicle.vehicleType;
    if (typeof b.origin === "string" && b.origin) update.origin = b.origin.slice(0, 64);
    if (typeof b.originUrl === "string" && b.originUrl) update.originUrl = b.originUrl.slice(0, 512);
    // Campanha só existe no detalhe (/bookings/:id), não no /report.
    if (typeof b.campaignId === "string" && b.campaignId) update.campaignId = b.campaignId.slice(0, 128);
    if (typeof b.campaignName === "string" && b.campaignName) update.campaignName = b.campaignName.slice(0, 256);
    // Nome real do parceiro (o /report mascara como "Unknown User").
    if (typeof b.partnerId === "string" && b.partnerId) update.partnerId = b.partnerId.slice(0, 128);
    if (typeof b.partnerName === "string" && b.partnerName && !/unknown/i.test(b.partnerName)) update.partnerName = b.partnerName.slice(0, 256);

    await db.update(multiparkBookings).set(update).where(eq(multiparkBookings.externalId, externalId));
    return true;
  } catch {
    // API falhou (404, key errada, etc.) — marca como tentado para sair da fila.
    try {
      await db.update(multiparkBookings).set({ enrichedAt: nowMysql() })
        .where(eq(multiparkBookings.externalId, externalId));
    } catch {}
    return false;
  }
}

/** Corre N tarefas em paralelo com limite de concorrência. */
async function runConcurrent<T>(items: T[], limit: number, fn: (item: T) => Promise<void>): Promise<void> {
  let idx = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (idx < items.length) {
        const i = idx++;
        try { await fn(items[i]); } catch {}
      }
    }),
  );
}

/**
 * Vai buscar a timeline de uma reserva (GET /bookings/:id/history) e
 * persiste na tabela multipark_booking_history. Também extrai resumos
 * (currentGarage/Spot, agente de check-in/out, última quilometragem)
 * para a tabela principal.
 */
function parseMpDate(s: string | null | undefined): string | null {
  if (!s || typeof s !== "string") return null;
  // ISO: "2025-01-15T11:00:00.000Z"
  if (s.includes("T")) {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 19).replace("T", " ");
  }
  // Multipark format: "15/01/2025, 11:00"
  const m = s.match(/(\d{2})\/(\d{2})\/(\d{4}),?\s*(\d{2}):(\d{2})/);
  if (!m) return null;
  return `${m[3]}-${m[2]}-${m[1]} ${m[4]}:${m[5]}:00`;
}

export async function syncBookingHistory(externalId: string, apiKey: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  try {
    const response = await getBookingHistory(externalId, apiKey);
    const items = response?.history ?? [];

    let checkinAgentName: string | null = null;
    let checkinAgentUserId: string | null = null;
    let checkoutAgentName: string | null = null;
    let checkoutAgentUserId: string | null = null;
    let currentGarage: string | null = null;
    let currentSpot: string | null = null;
    let lastKnownMileage: number | null = null;

    for (const item of items as any[]) {
      const historyId = item.id ?? null;
      if (!historyId) continue;
      const actionTime = parseMpDate(item.actionTime);
      const agentName = item.agentName ?? null;
      const agentUserId = item.userId ?? item.user?.id ?? null;
      const agentEmail = item.user?.email ?? null;
      const modifiedFields = item.modifiedFields ? String(item.modifiedFields) : null;
      const changeType = item.changeType ?? null;
      const platform = item.platform ?? null;
      const remarks = item.remarks ?? null;

      // Upsert idempotente — UNIQUE em (bookingExternalId, historyId)
      try {
        await db.insert(multiparkBookingHistory).values({
          bookingExternalId: externalId,
          historyId: String(historyId).slice(0, 128),
          changeType: changeType ? String(changeType).slice(0, 32) : null,
          actionTime,
          remarks,
          agentName: agentName ? String(agentName).slice(0, 256) : null,
          agentUserId: agentUserId ? String(agentUserId).slice(0, 128) : null,
          agentEmail,
          modifiedFields,
          platform: platform ? String(platform).slice(0, 32) : null,
        });
      } catch (err: any) {
        if (!String(err.message).includes("Duplicate")) throw err;
      }

      // Extrair resumos
      if (changeType === "CHECK_IN") {
        if (agentName) checkinAgentName = agentName;
        if (agentUserId) checkinAgentUserId = agentUserId;
      } else if (changeType === "CHECK_OUT") {
        if (agentName) checkoutAgentName = agentName;
        if (agentUserId) checkoutAgentUserId = agentUserId;
      }
      if (modifiedFields) {
        try {
          const mf = JSON.parse(modifiedFields);
          if (mf.garagem) currentGarage = String(mf.garagem).slice(0, 64);
          if (mf.lugar) currentSpot = String(mf.lugar).slice(0, 64);
          if (mf.km !== undefined) {
            const km = parseInt(String(mf.km), 10);
            if (Number.isFinite(km)) lastKnownMileage = km;
          }
        } catch {}
      }
    }

    // Updade resumo na reserva
    const update: Record<string, any> = { historyFetchedAt: nowMysql() };
    if (checkinAgentName) update.checkinAgentName = checkinAgentName;
    if (checkinAgentUserId) update.checkinAgentUserId = checkinAgentUserId;
    if (checkoutAgentName) update.checkoutAgentName = checkoutAgentName;
    if (checkoutAgentUserId) update.checkoutAgentUserId = checkoutAgentUserId;
    if (currentGarage) update.currentGarage = currentGarage;
    if (currentSpot) update.currentSpot = currentSpot;
    if (lastKnownMileage !== null) update.lastKnownMileage = lastKnownMileage;

    await db.update(multiparkBookings)
      .set(update)
      .where(eq(multiparkBookings.externalId, externalId));
    return true;
  } catch {
    // Marca tentativa para sair da fila (assim como o enrichment)
    try {
      await db.update(multiparkBookings)
        .set({ historyFetchedAt: nowMysql() })
        .where(eq(multiparkBookings.externalId, externalId));
    } catch {}
    return false;
  }
}

/**
 * Endpoint separado que enriquece um lote de reservas (deliveryType, flights,
 * remarks) chamando /bookings/:id por reserva. Usa o parkId guardado em DB
 * para escolher a chave de API correcta sem ter de tentar todos os parques.
 * Limite default 30 para caber no timeout do Vercel.
 */
export async function enrichBookingsBatch(
  arg: number | { externalIds?: string[]; limit?: number } = 100,
): Promise<{
  scanned: number;
  enriched: number;
  errors: number;
  noKey: number;
}> {
  const db = await getDb();
  if (!db) return { scanned: 0, enriched: 0, errors: 0, noKey: 0 };

  const opts = typeof arg === "number" ? { limit: arg } : arg;
  const limit = opts.limit ?? 100;
  const targetIds = opts.externalIds;
  // Alvo explícito mas vazio → nada a enriquecer.
  if (targetIds && targetIds.length === 0) return { scanned: 0, enriched: 0, errors: 0, noKey: 0 };

  // Mapa parkId (interno) → ParkConfig descobre-se sob procura, vamos tentar
  // todos os parques para cada booking sem perder muito tempo.
  const { isNull, and, inArray } = await import("drizzle-orm");

  // Só reservas ainda não enriquecidas (enrichedAt IS NULL). Se vier uma lista
  // de alvos (as que acabaram de entrar/mudar no ciclo), restringe a essas —
  // enriquecimento imediato e direcionado em vez de varrer o backlog todo.
  const whereCond = targetIds && targetIds.length
    ? and(isNull(multiparkBookings.enrichedAt), inArray(multiparkBookings.externalId, targetIds))
    : isNull(multiparkBookings.enrichedAt);

  const pending = await db
    .select({
      externalId: multiparkBookings.externalId,
      parkName: multiparkBookings.parkName,
      city: multiparkBookings.city,
    })
    .from(multiparkBookings)
    .where(whereCond)
    .limit(limit);

  if (pending.length === 0) return { scanned: 0, enriched: 0, errors: 0, noKey: 0 };

  const parks = getConfiguredParks();
  // Normaliza nomes de cidade que vêm em variantes (EN vs PT).
  const CITY_NORMALIZE: Record<string, string> = {
    lisbon: "lisboa",
    lisboa: "lisboa",
    oporto: "porto",
    porto: "porto",
    faro: "faro",
  };
  // Cache: (parkName|city) lowercase → apiKey.
  // Algumas reservas têm parkName="Airpark" e city="lisbon", outras têm
  // parkName="Airpark - Lisboa" e city="Lisboa". Damos ambos os caminhos.
  const keyCache = new Map<string, string | null>();
  function pickApiKey(parkName: string | null, city: string | null): string | null {
    if (!parkName) return null;
    const cacheKey = `${parkName.toLowerCase()}|${(city ?? "").toLowerCase()}`;
    if (keyCache.has(cacheKey)) return keyCache.get(cacheKey) ?? null;

    const pl = parkName.toLowerCase();
    const cityNorm = city ? (CITY_NORMALIZE[city.toLowerCase()] ?? city.toLowerCase()) : "";

    // 1) parkName contém o nome do parque E a cidade
    let match = parks.find(p =>
      pl.includes(p.name.toLowerCase()) && pl.includes(p.city.toLowerCase()),
    );
    // 2) parkName tem só o nome; usa a coluna city para desempatar
    if (!match && cityNorm) {
      match = parks.find(p =>
        pl.includes(p.name.toLowerCase()) && p.city.toLowerCase() === cityNorm,
      );
    }

    const key = match ? getParkApiKey(match) ?? null : null;
    keyCache.set(cacheKey, key);
    return key;
  }

  let enriched = 0;
  let errs = 0;
  let noKey = 0;
  await runConcurrent(pending, ENRICH_CONCURRENCY, async (p) => {
    const apiKey = pickApiKey(p.parkName, p.city);
    if (!apiKey) {
      noKey++;
      // marca como tentado para sair da fila e não voltar a aparecer
      const db = await getDb();
      if (db) {
        try {
          await db.update(multiparkBookings)
            .set({ enrichedAt: nowMysql() })
            .where(eq(multiparkBookings.externalId, p.externalId));
        } catch {}
      }
      return;
    }
    const ok = await enrichBookingIfNeeded(p.externalId, apiKey);
    if (ok) enriched++; else errs++;
  });

  return { scanned: pending.length, enriched, errors: errs, noKey };
}

/**
 * Vai buscar history de um agente (por nome) num dia, para CADA parque
 * configurado. Persiste em multipark_booking_history. Útil para avaliar
 * a atividade de um extra num dia específico.
 */
export async function fetchAgentHistoryByName(
  agentName: string,
  date: string, // YYYY-MM-DD
): Promise<{
  parks: number;
  totalEntries: number;
  byType: Record<string, number>;
  perPark: Array<{ park: string; entries: number }>;
}> {
  const db = await getDb();
  const parks = getConfiguredParks();
  const byType: Record<string, number> = {};
  let totalEntries = 0;
  const perPark: Array<{ park: string; entries: number }> = [];

  await runConcurrent(parks, ENRICH_CONCURRENCY, async (park) => {
    const apiKey = getParkApiKey(park);
    if (!apiKey) return;
    try {
      const response = await getAgentHistory({
        agentName,
        startDate: date,
        endDate: date,
        apiKey,
      });
      const items = (response?.history ?? []) as any[];
      perPark.push({ park: `${park.name} ${park.city}`, entries: items.length });
      totalEntries += items.length;
      if (!db || items.length === 0) return;

      for (const item of items) {
        const historyId = item.id ?? null;
        const bookingExternalId = item.booking?.id ?? null;
        if (!historyId || !bookingExternalId) continue;
        const changeType = item.changeType ?? null;
        if (changeType) byType[changeType] = (byType[changeType] ?? 0) + 1;
        try {
          await db.insert(multiparkBookingHistory).values({
            bookingExternalId: String(bookingExternalId).slice(0, 128),
            historyId: String(historyId).slice(0, 128),
            changeType: changeType ? String(changeType).slice(0, 32) : null,
            actionTime: parseMpDate(item.actionTime),
            remarks: item.remarks ?? null,
            agentName: item.agentName ?? agentName,
            agentUserId: item.userId ?? item.user?.id ?? null,
            agentEmail: item.user?.email ?? null,
            modifiedFields: item.modifiedFields ? String(item.modifiedFields) : null,
            platform: item.platform ?? null,
          });
        } catch (err: any) {
          if (!String(err.message).includes("Duplicate")) throw err;
        }
      }
    } catch {
      perPark.push({ park: `${park.name} ${park.city}`, entries: 0 });
    }
  });

  return { parks: parks.length, totalEntries, byType, perPark };
}

/**
 * Vai buscar history das reservas que ainda não tinham. Mesma estratégia
 * do enrich: lote pequeno por execução para caber no timeout do Vercel.
 */
export async function syncBookingHistoryBatch(limit = 50): Promise<{
  scanned: number;
  fetched: number;
  errors: number;
  noKey: number;
}> {
  const db = await getDb();
  if (!db) return { scanned: 0, fetched: 0, errors: 0, noKey: 0 };

  const { isNull, and: andOp, gte } = await import("drizzle-orm");

  // Prioriza reservas com checkIn nos próximos 30 dias OU últimos 7
  const now = new Date();
  const cutPast = new Date(now);
  cutPast.setDate(cutPast.getDate() - 7);
  const cutFuture = new Date(now);
  cutFuture.setDate(cutFuture.getDate() + 30);

  const fmt = (d: Date) => d.toISOString().slice(0, 19).replace("T", " ");

  const pending = await db
    .select({
      externalId: multiparkBookings.externalId,
      parkName: multiparkBookings.parkName,
      city: multiparkBookings.city,
    })
    .from(multiparkBookings)
    .where(
      andOp(
        isNull(multiparkBookings.historyFetchedAt),
        gte(multiparkBookings.checkIn, fmt(cutPast)),
      ),
    )
    .limit(limit);

  if (pending.length === 0) return { scanned: 0, fetched: 0, errors: 0, noKey: 0 };

  const parks = getConfiguredParks();
  const CITY_NORMALIZE: Record<string, string> = {
    lisbon: "lisboa", lisboa: "lisboa", porto: "porto", oporto: "porto", faro: "faro",
  };
  const keyCache = new Map<string, string | null>();
  function pickApiKey(parkName: string | null, city: string | null): string | null {
    if (!parkName) return null;
    const cacheKey = `${parkName.toLowerCase()}|${(city ?? "").toLowerCase()}`;
    if (keyCache.has(cacheKey)) return keyCache.get(cacheKey) ?? null;
    const pl = parkName.toLowerCase();
    const cityNorm = city ? (CITY_NORMALIZE[city.toLowerCase()] ?? city.toLowerCase()) : "";
    let match = parks.find(p =>
      pl.includes(p.name.toLowerCase()) && pl.includes(p.city.toLowerCase()),
    );
    if (!match && cityNorm) {
      match = parks.find(p =>
        pl.includes(p.name.toLowerCase()) && p.city.toLowerCase() === cityNorm,
      );
    }
    const key = match ? getParkApiKey(match) ?? null : null;
    keyCache.set(cacheKey, key);
    return key;
  }

  let fetched = 0;
  let errs = 0;
  let noKey = 0;
  await runConcurrent(pending, ENRICH_CONCURRENCY, async (p) => {
    const apiKey = pickApiKey(p.parkName, p.city);
    if (!apiKey) {
      noKey++;
      try {
        await db.update(multiparkBookings)
          .set({ historyFetchedAt: nowMysql() })
          .where(eq(multiparkBookings.externalId, p.externalId));
      } catch {}
      return;
    }
    const ok = await syncBookingHistory(p.externalId, apiKey);
    if (ok) fetched++; else errs++;
  });

  return { scanned: pending.length, fetched, errors: errs, noKey };
}

// ─── Core sync function ──────────────────────────────────────────────────────

export async function syncBookings(opts: {
  startDate: string;
  endDate: string;
  actionTypes?: BookingActionType[];
  triggeredById?: number;
}): Promise<{
  success: boolean;
  processed: number;
  created: number;
  updated: number;
  errors: string[];
  enrichTargets: string[];
}> {
  const actionTypes = opts.actionTypes || ["creation", "checkin", "checkout", "cancelation"];
  const projectMap = await getProjectMap();
  const aliasResolver = await getAliasResolver();

  const errors: string[] = [];

  const parks = getConfiguredParks();
  const parksToSync = parks.length > 0 ? parks : [null]; // null = use global key

  // Corre todas as combinações (parque × actionType) em paralelo. As chamadas
  // /bookings/report têm rate-limit handling embutido (backoff 429) e a Vercel
  // tem 60s — paralelizar tudo é a única forma de caber em janelas largas.
  type Job = { park: ParkConfig | null; actionType: BookingActionType };
  const jobs: Job[] = [];
  for (const park of parksToSync) {
    for (const actionType of actionTypes) {
      jobs.push({ park, actionType });
    }
  }

  const perParkResults = await Promise.allSettled(jobs.map(async ({ park, actionType }) => {
    const apiKey = park ? getParkApiKey(park) : undefined;
    const parkLabel = park ? `${park.name} ${park.city}` : "global";
    let processed = 0, created = 0, updated = 0;
    const parkErrors: string[] = [];
    const enrichIds: string[] = []; // reservas novas ou com mudança de estado

    try {
      const report = await getBookingsReport(opts.startDate, opts.endDate, actionType, apiKey);
      if (report?.bookings?.length) {
        for (const booking of report.bookings) {
          try {
            const record = bookingToRecord(booking, projectMap, aliasResolver);
            const result = await upsertMultiparkBooking(record);
            await upsertBookingExtras(booking.id, (booking as any).extraServices);
            processed++;
            if (result?.action === "created") created++;
            else updated++;
            // Marca para enriquecimento imediato: novas, ou as que mudaram de
            // estado (o detalhe foi reaberto via enrichedAt=null no upsert).
            if (result?.action === "created" || result?.statusChanged) {
              enrichIds.push(booking.id);
            }
          } catch (err: any) {
            parkErrors.push(`Booking ${booking.id}: ${err.message}`);
          }
        }
      }
    } catch (err: any) {
      parkErrors.push(`${parkLabel}/${actionType}: ${err.message}`);
    }
    return { processed, created, updated, errors: parkErrors, enrichIds };
  }));

  let totalProcessed = 0;
  let totalCreated = 0;
  let totalUpdated = 0;
  const enrichTargets = new Set<string>();
  for (const r of perParkResults) {
    if (r.status === "fulfilled") {
      totalProcessed += r.value.processed;
      totalCreated += r.value.created;
      totalUpdated += r.value.updated;
      errors.push(...r.value.errors);
      for (const id of r.value.enrichIds) enrichTargets.add(id);
    } else {
      errors.push(`Park task failed: ${r.reason?.message ?? r.reason}`);
    }
  }
  // Nota: enrichment com /bookings/:id corre num endpoint separado
  // (multipark.enrichBatch) para evitar timeout do Vercel no sync.

  // Log the sync operation
  await createSyncLog({
    syncType: "api_sync",
    status: errors.length === 0 ? "success" : "partial",
    recordsProcessed: totalProcessed,
    recordsCreated: totalCreated,
    recordsUpdated: totalUpdated - totalCreated,
    errorMessage: errors.length > 0 ? errors.join("; ") : undefined,
    triggeredById: opts.triggeredById ?? undefined,
  });

  return {
    success: errors.length === 0,
    processed: totalProcessed,
    created: totalCreated,
    updated: totalUpdated - totalCreated,
    errors,
    enrichTargets: Array.from(enrichTargets),
  };
}

// ─── Automatic scheduler ─────────────────────────────────────────────────────

const SYNC_INTERVAL = 15 * 60 * 1000; // 15 minutes

export function startBookingSyncScheduler() {
  async function runSync() {
    if (!isMultiparkConfigured()) {
      console.log("[BookingSync] Skipped — MULTIPARK_API_KEY not configured");
      return;
    }
    try {
      const today = new Date();
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const thirtyDaysAhead = new Date(today);
      thirtyDaysAhead.setDate(thirtyDaysAhead.getDate() + 30);

      const pastStart = twoDaysAgo.toISOString().split("T")[0];
      const todayStr = today.toISOString().split("T")[0];
      const futureEnd = thirtyDaysAhead.toISOString().split("T")[0];

      // Past window: realized events (creation/checkin/checkout/cancelation) over the last 2 days.
      console.log(`[BookingSync] Past window ${pastStart} → ${todayStr}`);
      const past = await syncBookings({ startDate: pastStart, endDate: todayStr });
      console.log(
        `[BookingSync] Past done: ${past.processed} processed, ${past.created} new, ${past.updated} updated` +
          (past.errors.length > 0 ? `, ${past.errors.length} errors` : "")
      );

      // Future window: scheduled check-ins/check-outs for the next 30 days.
      // Needed so /extras-dia can plan ahead with reservations booked any time.
      console.log(`[BookingSync] Future window ${todayStr} → ${futureEnd}`);
      const future = await syncBookings({
        startDate: todayStr,
        endDate: futureEnd,
        actionTypes: ["checkin", "checkout"],
      });
      console.log(
        `[BookingSync] Future done: ${future.processed} processed, ${future.created} new, ${future.updated} updated` +
          (future.errors.length > 0 ? `, ${future.errors.length} errors` : "")
      );
    } catch (error) {
      console.error("[BookingSync] Scheduler error:", error);
    }
  }

  // Run immediately on startup, then every 15 minutes
  setTimeout(runSync, 10_000); // 10s after startup
  setInterval(runSync, SYNC_INTERVAL);
  console.log("[BookingSync] Scheduler started — runs every 15 minutes");
}

// ─── Cron wrappers (Vercel Cron Jobs chama os endpoints HTTP) ─────────────────

/** Sync recente: report dos últimos N minutos + enrich em paralelo + history.
 *  Chamado pelo Vercel Cron cada 15 minutos. Toda a função tem que caber no
 *  maxDuration da função (60s configurado em vercel.json).
 *
 *  windowMinutes deve cobrir o intervalo entre runs + margem (default: 30 para
 *  cobrir o cron de 15 min com 100% de margem se um falhar). */
export async function runRecentCronSync(windowMinutes = 30): Promise<{
  report: { processed: number; created: number; updated: number; errors: string[] };
  enriched: number;
  historyFetched: number;
  durationMs: number;
}> {
  const t0 = Date.now();

  // Janela: agora - N min → agora. As datas YYYY-MM-DD são granularidade
  // de dia para o /bookings/report (a API filtra internamente por tempo).
  const now = new Date();
  const since = new Date(now.getTime() - windowMinutes * 60_000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  // Fase 1: report (puxa o que estiver novo/alterado)
  const report = await syncBookings({
    startDate: fmt(since),
    endDate: fmt(now),
  });

  // Fase 2a: enrichment IMEDIATO e direcionado às reservas que acabaram de
  // entrar/mudar neste ciclo — vai já buscar ao /bookings/:id a origem, o nome
  // real do parceiro e o detalhe de pagamento. É o "automático daquelas
  // reservas" logo a seguir ao report.
  const targeted = await enrichBookingsBatch({
    externalIds: report.enrichTargets,
    // Cap para caber no maxDuration do Vercel num burst; o resto fica enrichedAt
    // NULL e é apanhado pelo backlog nos ciclos seguintes.
    limit: Math.min(Math.max(report.enrichTargets.length, 1), 120),
  });

  // Fase 2b + 3 em paralelo: limpa um resto de backlog (reservas antigas ainda
  // por enriquecer) + history. Limitados para caber no maxDuration do Vercel.
  const [backlogResult, historyResult] = await Promise.allSettled([
    enrichBookingsBatch(20),
    syncBookingHistoryBatch(30),
  ]);

  const backlogEnriched = backlogResult.status === "fulfilled" ? backlogResult.value.enriched : 0;
  const enriched = targeted.enriched + backlogEnriched;
  const historyFetched = historyResult.status === "fulfilled" ? historyResult.value.fetched : 0;

  return {
    report,
    enriched,
    historyFetched,
    durationMs: Date.now() - t0,
  };
}

/** Sync de janela futura (próximas 4 semanas) para Extras Dia planear.
 *  Mais leve — só checkin/checkout, sem enrich/history. */
export async function runFutureCronSync(weeksAhead = 4): Promise<{
  report: { processed: number; created: number; updated: number; errors: string[] };
  durationMs: number;
}> {
  const t0 = Date.now();
  const now = new Date();
  const end = new Date(now.getTime() + weeksAhead * 7 * 86_400_000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const report = await syncBookings({
    startDate: fmt(now),
    endDate: fmt(end),
    actionTypes: ["checkin", "checkout"],
  });
  return { report, durationMs: Date.now() - t0 };
}
