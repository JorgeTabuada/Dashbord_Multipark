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
    await db.update(multiparkBookings).set({
      deliveryType: typeof b.deliveryType === "string" && b.deliveryType ? b.deliveryType : null,
      returnFlight: typeof b.returnFlight === "string" && b.returnFlight ? b.returnFlight : null,
      departingFlight: typeof b.departingFlight === "string" && b.departingFlight ? b.departingFlight : null,
      remarks: typeof b.remarks === "string" && b.remarks ? b.remarks.slice(0, 512) : null,
      enrichedAt: nowMysql(),
    }).where(eq(multiparkBookings.externalId, externalId));
    return true;
  } catch {
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
  enriched: number;
  errors: string[];
}> {
  const actionTypes = opts.actionTypes || ["creation", "checkin", "checkout", "cancelation"];
  const projectMap = await getProjectMap();

  let totalProcessed = 0;
  let totalCreated = 0;
  let totalUpdated = 0;
  let totalEnriched = 0;
  const errors: string[] = [];

  const parks = getConfiguredParks();
  const parksToSync = parks.length > 0 ? parks : [null]; // null = use global key

  for (const park of parksToSync) {
    const apiKey = park ? getParkApiKey(park) : undefined;
    const parkLabel = park ? `${park.name} ${park.city}` : "global";

    // IDs únicos a enriquecer para este parque (apanha de qualquer actionType)
    const toEnrich = new Set<string>();

    for (const actionType of actionTypes) {
      try {
        const report = await getBookingsReport(opts.startDate, opts.endDate, actionType, apiKey);

        if (!report?.bookings?.length) continue;

        for (const booking of report.bookings) {
          try {
            const record = bookingToRecord(booking, projectMap);
            const result = await upsertMultiparkBooking(record);
            totalProcessed++;
            if (result?.action === "created") totalCreated++;
            else totalUpdated++;
            toEnrich.add(booking.id);
          } catch (err: any) {
            errors.push(`Booking ${booking.id}: ${err.message}`);
          }
        }
      } catch (err: any) {
        errors.push(`${parkLabel}/${actionType}: ${err.message}`);
      }
    }

    // Enriquece com /bookings/:id (deliveryType, flights, remarks).
    // Idempotente: salta as que já têm enrichedAt preenchido.
    // Cap global por sync run para evitar timeout do Vercel (60s).
    const remainingBudget = ENRICH_MAX_PER_SYNC - totalEnriched;
    if (apiKey && toEnrich.size > 0 && remainingBudget > 0) {
      const ids = Array.from(toEnrich).slice(0, remainingBudget);
      let enrichedThisPark = 0;
      await runConcurrent(ids, ENRICH_CONCURRENCY, async (id) => {
        const ok = await enrichBookingIfNeeded(id, apiKey);
        if (ok) enrichedThisPark++;
      });
      totalEnriched += enrichedThisPark;
      if (enrichedThisPark > 0) {
        console.log(`[BookingSync] ${parkLabel}: ${enrichedThisPark}/${ids.length} reservas enriquecidas (budget: ${remainingBudget})`);
      }
    }
  }

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
    enriched: totalEnriched,
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
