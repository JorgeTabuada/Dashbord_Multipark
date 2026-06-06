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
  isMultiparkConfigured,
  getConfiguredParks,
  getParkApiKey,
  type MultiparkBooking,
  type BookingActionType,
  type ParkConfig,
} from "../multipark";
import {
  upsertMultiparkBooking,
  createSyncLog,
  getProjects,
  getDb,
} from "../db";
import { eq } from "drizzle-orm";
import { multiparkBookings } from "../../drizzle/schema";
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

function parseMultiparkDate(dateStr: string | undefined | null): Date | null {
  if (!dateStr) return null;
  // Format: "07/03/2026, 14:15"
  const match = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4}),?\s*(\d{2}):(\d{2})/);
  if (match) {
    const [, day, month, year, hours, minutes] = match;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
  }
  // Try ISO format fallback
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

// ─── Convert API booking to DB record ────────────────────────────────────────

function bookingToRecord(booking: MultiparkBooking, projectMap: Map<string, number>) {
  const client = booking.customer || booking.client;
  const pricing = booking.pricing;
  const park = booking.park;
  const parkName = park?.name || booking.parkName;
  const city = park?.city;
  const projectId = findProjectId(parkName, city, projectMap);

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
    campaign: (booking as any).partnerName || booking.discountCode || booking.campaign || null,
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
    paymentMethod: typeof pricing?.paymentMethod === "string"
      ? pricing.paymentMethod.slice(0, 128)
      : null,
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
 * Endpoint separado que enriquece um lote de reservas (deliveryType, flights,
 * remarks) chamando /bookings/:id por reserva. Usa o parkId guardado em DB
 * para escolher a chave de API correcta sem ter de tentar todos os parques.
 * Limite default 30 para caber no timeout do Vercel.
 */
export async function enrichBookingsBatch(limit = 100): Promise<{
  scanned: number;
  enriched: number;
  errors: number;
  noKey: number;
}> {
  const db = await getDb();
  if (!db) return { scanned: 0, enriched: 0, errors: 0 };

  // Mapa parkId (interno) → ParkConfig descobre-se sob procura, vamos tentar
  // todos os parques para cada booking sem perder muito tempo.
  const { isNull } = await import("drizzle-orm");

  const pending = await db
    .select({
      externalId: multiparkBookings.externalId,
      parkName: multiparkBookings.parkName,
      city: multiparkBookings.city,
    })
    .from(multiparkBookings)
    .where(isNull(multiparkBookings.enrichedAt))
    .limit(limit);

  if (pending.length === 0) return { scanned: 0, enriched: 0, errors: 0 };

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
}> {
  const actionTypes = opts.actionTypes || ["creation", "checkin", "checkout", "cancelation"];
  const projectMap = await getProjectMap();

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

    try {
      const report = await getBookingsReport(opts.startDate, opts.endDate, actionType, apiKey);
      if (report?.bookings?.length) {
        for (const booking of report.bookings) {
          try {
            const record = bookingToRecord(booking, projectMap);
            const result = await upsertMultiparkBooking(record);
            processed++;
            if (result?.action === "created") created++;
            else updated++;
          } catch (err: any) {
            parkErrors.push(`Booking ${booking.id}: ${err.message}`);
          }
        }
      }
    } catch (err: any) {
      parkErrors.push(`${parkLabel}/${actionType}: ${err.message}`);
    }
    return { processed, created, updated, errors: parkErrors };
  }));

  let totalProcessed = 0;
  let totalCreated = 0;
  let totalUpdated = 0;
  for (const r of perParkResults) {
    if (r.status === "fulfilled") {
      totalProcessed += r.value.processed;
      totalCreated += r.value.created;
      totalUpdated += r.value.updated;
      errors.push(...r.value.errors);
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
    errorMessage: errors.length > 0 ? errors.join("; ") : null,
    triggeredById: opts.triggeredById || null,
  });

  return {
    success: errors.length === 0,
    processed: totalProcessed,
    created: totalCreated,
    updated: totalUpdated - totalCreated,
    errors,
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
