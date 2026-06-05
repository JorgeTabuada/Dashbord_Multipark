/**
 * Extras Dia — Daily Forecast & Driver Allocation
 *
 * Lisbon-only forecast based on synced multipark bookings:
 *   - Hourly check-ins / check-outs for tomorrow (or chosen base date + 1)
 *   - Lavagem (wash) counts for context days
 *   - Driver shift suggestion (3 cars/hour productivity, 3–12h shift bounds)
 *
 * Driver levels are flat — all do everything — so the cheapest tier wins.
 */

import { and, gte, lte, sql } from "drizzle-orm";
import { getDb } from "./db";
import { multiparkBookings } from "../drizzle/schema";

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

function toMysqlDateTime(d: Date): string {
  // MySQL DATETIME string: "YYYY-MM-DD HH:mm:ss" in local time
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function hourOf(ts: string | null): number | null {
  if (!ts) return null;
  // ts can be "YYYY-MM-DD HH:mm:ss" or ISO. Parse defensively.
  const d = new Date(ts.includes("T") ? ts : ts.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return null;
  return d.getHours();
}

function bookingHasLavagem(rawJson: string | null): boolean {
  if (!rawJson) return false;
  try {
    const data = JSON.parse(rawJson);
    const extras = data?.extraServices;
    if (!Array.isArray(extras)) return false;
    return extras.some((e: any) => {
      const name = typeof e === "string" ? e : e?.name;
      return typeof name === "string" && LAVAGEM_RE.test(name);
    });
  } catch {
    return false;
  }
}

// ─── Driver allocation ───────────────────────────────────────────────────────

export interface DriverShift {
  startHour: number;
  endHour: number; // exclusive
  hours: number;
  level: DriverLevelId;
  label: string;
  hourlyRate: number;
  cost: number;
}

/**
 * Build shifts that cover the hourly driver demand.
 *
 * Strategy: each "concurrent driver slot" gets one shift spanning the first
 * to last hour they are needed (extended to MIN_SHIFT_HOURS if shorter, split
 * into MAX_SHIFT_HOURS chunks if longer). All drivers allocated to the
 * cheapest level (Júnior) — caller can re-allocate if they want a mix.
 */
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
    const end = active[active.length - 1] + 1; // exclusive
    let span = end - start;
    if (span < MIN_SHIFT_HOURS) span = MIN_SHIFT_HOURS;

    // Split into MAX_SHIFT_HOURS chunks if needed
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

// ─── Forecast ────────────────────────────────────────────────────────────────

export interface HourlyRow {
  hour: number;
  checkins: number;
  checkouts: number;
  driversNeeded: number; // ceil((checkins + checkouts) / 3)
}

export interface DailyWash {
  date: string; // YYYY-MM-DD
  exitsWithWash: number; // check-outs that have lavagem in extras
}

export interface ExtrasDiaForecast {
  baseDate: string; // YYYY-MM-DD (the "today" the user picked)
  targetDate: string; // YYYY-MM-DD (baseDate + 1) — main hourly view
  city: string;
  hourly: HourlyRow[]; // 24 rows for targetDate
  totals: {
    checkins: number;
    checkouts: number;
    operations: number; // checkins + checkouts
  };
  washes: {
    base: DailyWash; // baseDate exits with wash
    target: DailyWash; // baseDate+1 exits with wash
    next: DailyWash; // baseDate+2 exits with wash (cars to wash for D+2)
  };
  allocation: {
    cheapest: ReturnType<typeof suggestShifts>;
    bySingleLevel: { level: DriverLevelId; label: string; totalCost: number; totalHours: number }[];
  };
}

async function fetchBookingsInRange(field: "checkIn" | "checkOut", startInclusive: Date, endExclusive: Date) {
  const db = await getDb();
  if (!db) return [] as Array<{ checkIn: string | null; checkOut: string | null; rawJson: string | null; city: string | null; status: string | null }>;

  const col = field === "checkIn" ? multiparkBookings.checkIn : multiparkBookings.checkOut;
  const startStr = toMysqlDateTime(startInclusive);
  const endStr = toMysqlDateTime(endExclusive);

  return db
    .select({
      checkIn: multiparkBookings.checkIn,
      checkOut: multiparkBookings.checkOut,
      rawJson: multiparkBookings.rawJson,
      city: multiparkBookings.city,
      status: multiparkBookings.status,
    })
    .from(multiparkBookings)
    .where(
      and(
        gte(col, startStr),
        lte(col, endStr),
        sql`${multiparkBookings.status} != 'CANCELLED'`,
        sql`LOWER(${multiparkBookings.city}) = LOWER(${CITY})`,
      ),
    )
    .limit(10000);
}

function countWashes(rows: Array<{ rawJson: string | null }>): number {
  let n = 0;
  for (const r of rows) if (bookingHasLavagem(r.rawJson)) n++;
  return n;
}

function dateKey(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export async function getExtrasDiaForecast(baseDateInput?: string): Promise<ExtrasDiaForecast> {
  const baseDate = baseDateInput ? new Date(baseDateInput) : new Date();
  const baseStart = startOfDay(baseDate);
  const targetStart = addDays(baseStart, 1);
  const nextStart = addDays(baseStart, 2);
  const nextEnd = addDays(baseStart, 3);

  // Pull check-ins for target day (D+1) and check-outs for base/target/next.
  const [targetCheckins, baseCheckouts, targetCheckouts, nextCheckouts] = await Promise.all([
    fetchBookingsInRange("checkIn", targetStart, nextStart),
    fetchBookingsInRange("checkOut", baseStart, targetStart),
    fetchBookingsInRange("checkOut", targetStart, nextStart),
    fetchBookingsInRange("checkOut", nextStart, nextEnd),
  ]);

  // Build 24 hourly buckets for D+1
  const hourly: HourlyRow[] = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    checkins: 0,
    checkouts: 0,
    driversNeeded: 0,
  }));

  for (const r of targetCheckins) {
    const h = hourOf(r.checkIn);
    if (h !== null) hourly[h].checkins++;
  }
  for (const r of targetCheckouts) {
    const h = hourOf(r.checkOut);
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
    hourly,
    totals: {
      checkins: hourly.reduce((s, h) => s + h.checkins, 0),
      checkouts: hourly.reduce((s, h) => s + h.checkouts, 0),
      operations: hourly.reduce((s, h) => s + h.checkins + h.checkouts, 0),
    },
    washes: {
      base: { date: dateKey(baseStart), exitsWithWash: countWashes(baseCheckouts) },
      target: { date: dateKey(targetStart), exitsWithWash: countWashes(targetCheckouts) },
      next: { date: dateKey(nextStart), exitsWithWash: countWashes(nextCheckouts) },
    },
    allocation: { cheapest, bySingleLevel },
  };
}
