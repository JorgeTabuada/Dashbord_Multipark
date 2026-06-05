/**
 * Extras Dia — Daily Forecast & Driver Allocation
 *
 * Lisbon-only forecast that hits the MultiPark API directly (no DB sync needed):
 *   - Hourly check-ins / check-outs for tomorrow (or chosen base date + 1)
 *   - Lavagem (wash) counts for context days
 *   - Driver shift suggestion (3 cars/hour productivity, 3–12h shift bounds)
 *
 * Driver levels are flat — all do everything — so the cheapest tier wins.
 */

import {
  PARK_CONFIGS,
  getBookingsReportForPark,
  getParkApiKey,
  type MultiparkBooking,
  type ParkConfig,
} from "./multipark";

// ─── Constants ───────────────────────────────────────────────────────────────

export const DRIVER_LEVELS = [
  { id: "junior", label: "Júnior", hourlyRate: 4 },
  { id: "senior", label: "Sénior", hourlyRate: 5 },
  { id: "terminal", label: "Terminal", hourlyRate: 5.5 },
  { id: "master", label: "Master", hourlyRate: 6 },
] as const;

export type DriverLevelId = (typeof DRIVER_LEVELS)[number]["id"];

export const CARS_PER_HOUR_PER_DRIVER = 3;
export const MIN_SHIFT_HOURS = 3;
export const MAX_SHIFT_HOURS = 12;

const CITY = "Lisboa";
const LAVAGEM_RE = /lavag|wash/i;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function dateKey(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function hourOf(ts: string | null | undefined): number | null {
  if (!ts) return null;
  const d = new Date(ts.includes("T") ? ts : ts.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return null;
  return d.getHours();
}

function bookingHasLavagem(booking: MultiparkBooking): boolean {
  const extras = booking.extraServices;
  if (!Array.isArray(extras)) return false;
  return extras.some((e: any) => {
    const name = typeof e === "string" ? e : e?.name;
    return typeof name === "string" && LAVAGEM_RE.test(name);
  });
}

// ─── Driver allocation ───────────────────────────────────────────────────────

export interface DriverShift {
  startHour: number;
  endHour: number;
  hours: number;
  level: DriverLevelId;
  label: string;
  hourlyRate: number;
  cost: number;
}

export function suggestShifts(
  hourlyCars: number[],
  level: DriverLevelId = "junior",
): { shifts: DriverShift[]; totalCost: number; peakDrivers: number; totalDriverHours: number } {
  const rateInfo = DRIVER_LEVELS.find(l => l.id === level)!;
  const driversPerHour = hourlyCars.map(c => Math.ceil(c / CARS_PER_HOUR_PER_DRIVER));
  const peak = Math.max(0, ...driversPerHour);

  if (peak === 0) {
    return { shifts: [], totalCost: 0, peakDrivers: 0, totalDriverHours: 0 };
  }

  const shifts: DriverShift[] = [];

  for (let slot = 0; slot < peak; slot++) {
    const active: number[] = [];
    for (let h = 0; h < 24; h++) if (driversPerHour[h] > slot) active.push(h);
    if (active.length === 0) continue;

    const start = active[0];
    const end = active[active.length - 1] + 1;
    let span = end - start;
    if (span < MIN_SHIFT_HOURS) span = MIN_SHIFT_HOURS;

    let cursor = start;
    while (span > 0) {
      const chunk = Math.min(span, MAX_SHIFT_HOURS);
      shifts.push({
        startHour: cursor,
        endHour: cursor + chunk,
        hours: chunk,
        level: rateInfo.id,
        label: rateInfo.label,
        hourlyRate: rateInfo.hourlyRate,
        cost: chunk * rateInfo.hourlyRate,
      });
      cursor += chunk;
      span -= chunk;
    }
  }

  const totalDriverHours = shifts.reduce((s, x) => s + x.hours, 0);
  const totalCost = shifts.reduce((s, x) => s + x.cost, 0);
  return { shifts, totalCost, peakDrivers: peak, totalDriverHours };
}

// ─── Forecast (API direct, no DB) ────────────────────────────────────────────

export interface HourlyRow {
  hour: number;
  checkins: number;
  checkouts: number;
  driversNeeded: number;
}

export interface DailyWash {
  date: string;
  exitsWithWash: number;
}

export interface ExtrasDiaForecast {
  baseDate: string;
  targetDate: string;
  city: string;
  source: "api"; // marker
  parksQueried: string[];
  parksFailed: { park: string; error: string }[];
  hourly: HourlyRow[];
  totals: {
    checkins: number;
    checkouts: number;
    operations: number;
  };
  washes: {
    base: DailyWash;
    target: DailyWash;
    next: DailyWash;
  };
  allocation: {
    cheapest: ReturnType<typeof suggestShifts>;
    bySingleLevel: { level: DriverLevelId; label: string; totalCost: number; totalHours: number }[];
  };
}

function getLisbonParks(): ParkConfig[] {
  return PARK_CONFIGS.filter(p => p.city === CITY && !!getParkApiKey(p));
}

/**
 * Fetch bookings for one park + actionType + day. Filters out CANCELLED.
 * The MultiPark API treats actionType=checkin/checkout as scheduled date.
 */
async function fetchBookings(
  park: ParkConfig,
  actionType: "checkin" | "checkout",
  day: Date,
): Promise<MultiparkBooking[]> {
  const startDate = dateKey(day);
  const endDate = dateKey(day);
  const report = await getBookingsReportForPark(park, startDate, endDate, actionType);
  return (report.bookings || []).filter(b => b.status !== "CANCELLED");
}

export async function getExtrasDiaForecast(baseDateInput?: string): Promise<ExtrasDiaForecast> {
  const baseDate = baseDateInput ? new Date(baseDateInput) : new Date();
  const baseStart = startOfDay(baseDate);
  const targetStart = addDays(baseStart, 1);
  const nextStart = addDays(baseStart, 2);

  const parks = getLisbonParks();
  const parksQueried = parks.map(p => `${p.name} ${p.city}`);
  const parksFailed: { park: string; error: string }[] = [];

  // We need 4 collections across all Lisbon parks:
  //   - target checkins (D+1) → hourly buckets
  //   - base checkouts (D) → wash count
  //   - target checkouts (D+1) → hourly buckets + wash count
  //   - next checkouts (D+2) → wash count
  type FetchKey = "targetCheckins" | "baseCheckouts" | "targetCheckouts" | "nextCheckouts";

  const jobs: Array<{ key: FetchKey; park: ParkConfig; action: "checkin" | "checkout"; day: Date }> = [];
  for (const park of parks) {
    jobs.push({ key: "targetCheckins", park, action: "checkin", day: targetStart });
    jobs.push({ key: "baseCheckouts", park, action: "checkout", day: baseStart });
    jobs.push({ key: "targetCheckouts", park, action: "checkout", day: targetStart });
    jobs.push({ key: "nextCheckouts", park, action: "checkout", day: nextStart });
  }

  const buckets: Record<FetchKey, MultiparkBooking[]> = {
    targetCheckins: [],
    baseCheckouts: [],
    targetCheckouts: [],
    nextCheckouts: [],
  };

  const results = await Promise.allSettled(
    jobs.map(j => fetchBookings(j.park, j.action, j.day).then(bs => ({ key: j.key, park: j.park, bs }))),
  );

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const j = jobs[i];
    if (r.status === "fulfilled") {
      buckets[r.value.key].push(...r.value.bs);
    } else {
      parksFailed.push({
        park: `${j.park.name} ${j.park.city} (${j.action} ${dateKey(j.day)})`,
        error: r.reason?.message || String(r.reason),
      });
    }
  }

  // Hourly buckets for D+1
  const hourly: HourlyRow[] = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    checkins: 0,
    checkouts: 0,
    driversNeeded: 0,
  }));

  for (const b of buckets.targetCheckins) {
    // MultiPark booking has `checkInTime` (HH:mm) or full `checkIn` ISO.
    const h = parseScheduledHour(b.checkInTime, b.checkIn);
    if (h !== null) hourly[h].checkins++;
  }
  for (const b of buckets.targetCheckouts) {
    const h = parseScheduledHour(b.checkOutTime, b.checkOut);
    if (h !== null) hourly[h].checkouts++;
  }
  for (const row of hourly) {
    row.driversNeeded = Math.ceil((row.checkins + row.checkouts) / CARS_PER_HOUR_PER_DRIVER);
  }

  const hourlyCars = hourly.map(h => h.checkins + h.checkouts);
  const cheapest = suggestShifts(hourlyCars, "junior");
  const bySingleLevel = DRIVER_LEVELS.map(l => {
    const r = suggestShifts(hourlyCars, l.id);
    return { level: l.id, label: l.label, totalCost: r.totalCost, totalHours: r.totalDriverHours };
  });

  return {
    baseDate: dateKey(baseStart),
    targetDate: dateKey(targetStart),
    city: CITY,
    source: "api",
    parksQueried,
    parksFailed,
    hourly,
    totals: {
      checkins: hourly.reduce((s, h) => s + h.checkins, 0),
      checkouts: hourly.reduce((s, h) => s + h.checkouts, 0),
      operations: hourly.reduce((s, h) => s + h.checkins + h.checkouts, 0),
    },
    washes: {
      base: { date: dateKey(baseStart), exitsWithWash: buckets.baseCheckouts.filter(bookingHasLavagem).length },
      target: { date: dateKey(targetStart), exitsWithWash: buckets.targetCheckouts.filter(bookingHasLavagem).length },
      next: { date: dateKey(nextStart), exitsWithWash: buckets.nextCheckouts.filter(bookingHasLavagem).length },
    },
    allocation: { cheapest, bySingleLevel },
  };
}

function parseScheduledHour(timeStr: string | null | undefined, fallbackIso: string | null | undefined): number | null {
  // Prefer "HH:mm" string when present
  if (timeStr && /^\d{1,2}:\d{2}/.test(timeStr)) {
    const h = parseInt(timeStr.split(":")[0], 10);
    if (h >= 0 && h < 24) return h;
  }
  return hourOf(fallbackIso ?? null);
}
