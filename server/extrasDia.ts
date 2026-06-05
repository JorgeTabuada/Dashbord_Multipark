/**
 * Extras Dia — Daily Forecast & Driver Allocation
 *
 * Lisbon-only forecast based on whatever bookings are currently in the
 * `multipark_bookings` table (no live API calls). City filter is permissive
 * (LIKE '%lisb%') so it matches "Lisboa", "Lisbon", "LISBON" etc.
 *
 *   - Hourly check-ins / check-outs for tomorrow (or chosen base date + 1)
 *   - Lavagem (wash) counts for context days
 *   - Driver shift suggestion (3 cars/hour productivity, 3–12h shift bounds)
 *
 * Driver levels are flat — all do everything — so the cheapest tier wins.
 */

import { and, asc, eq, gte, lte, sql } from "drizzle-orm";
import { getDb } from "./db";
import { multiparkBookings, extrasDiaAssignments, employees } from "../drizzle/schema";

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

const CITY_PATTERN = "%lisb%"; // matches Lisboa, Lisbon, LISBON, lisbôa, ...
const PARK_ID_PREFIX = "LISBON_%"; // backup: when city was not set on the row
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

function toMysqlDateTime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function hourOf(ts: string | null | undefined): number | null {
  if (!ts) return null;
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

// ─── Forecast (DB-based) ─────────────────────────────────────────────────────

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
  source: "db";
  parksQueried: string[]; // distinct parkName values found
  parksFailed: { park: string; error: string }[]; // always empty for DB mode (kept for UI compat)
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

type BookingRow = {
  checkIn: string | null;
  checkOut: string | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  rawJson: string | null;
  parkName: string | null;
  city: string | null;
};

async function fetchBookingsInRange(
  field: "checkIn" | "checkOut",
  startInclusive: Date,
  endExclusive: Date,
): Promise<BookingRow[]> {
  const db = await getDb();
  if (!db) return [];

  const col = field === "checkIn" ? multiparkBookings.checkIn : multiparkBookings.checkOut;
  const startStr = toMysqlDateTime(startInclusive);
  const endStr = toMysqlDateTime(endExclusive);

  return db
    .select({
      checkIn: multiparkBookings.checkIn,
      checkOut: multiparkBookings.checkOut,
      checkInTime: multiparkBookings.checkInTime,
      checkOutTime: multiparkBookings.checkOutTime,
      rawJson: multiparkBookings.rawJson,
      parkName: multiparkBookings.parkName,
      city: multiparkBookings.city,
    })
    .from(multiparkBookings)
    .where(
      and(
        gte(col, startStr),
        lte(col, endStr),
        sql`${multiparkBookings.status} != 'CANCELLED'`,
        sql`(LOWER(${multiparkBookings.city}) LIKE ${CITY_PATTERN} OR ${multiparkBookings.parkId} LIKE ${PARK_ID_PREFIX})`,
      ),
    )
    .limit(20000);
}

function parseScheduledHour(timeStr: string | null, fallbackIso: string | null): number | null {
  if (timeStr && /^\d{1,2}:\d{2}/.test(timeStr)) {
    const h = parseInt(timeStr.split(":")[0], 10);
    if (h >= 0 && h < 24) return h;
  }
  return hourOf(fallbackIso);
}

// ─── Assignments (gestor escala pessoas a turnos) ────────────────────────────

export interface Assignment {
  id: number;
  assignmentDate: string;
  employeeId: number | null;
  personName: string;
  level: DriverLevelId;
  startHour: number;
  endHour: number;
  sentHomeHour: number | null;
  notes: string | null;
  hoursBilled: number;
  cost: number;
}

function computeAssignmentCost(row: {
  level: DriverLevelId;
  startHour: number;
  endHour: number;
  sentHomeHour: number | null;
}): { hoursBilled: number; cost: number } {
  const end = row.sentHomeHour ?? row.endHour;
  const hours = Math.max(0, end - row.startHour);
  const rate = DRIVER_LEVELS.find(l => l.id === row.level)?.hourlyRate ?? 0;
  return { hoursBilled: hours, cost: hours * rate };
}

function rowToAssignment(r: typeof extrasDiaAssignments.$inferSelect): Assignment {
  const level = r.level as DriverLevelId;
  const computed = computeAssignmentCost({
    level,
    startHour: r.startHour,
    endHour: r.endHour,
    sentHomeHour: r.sentHomeHour,
  });
  return {
    id: r.id,
    assignmentDate: r.assignmentDate,
    employeeId: r.employeeId,
    personName: r.personName,
    level,
    startHour: r.startHour,
    endHour: r.endHour,
    sentHomeHour: r.sentHomeHour,
    notes: r.notes,
    ...computed,
  };
}

export async function listAssignments(date: string): Promise<Assignment[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select()
    .from(extrasDiaAssignments)
    .where(eq(extrasDiaAssignments.assignmentDate, date))
    .orderBy(asc(extrasDiaAssignments.startHour));
  return rows.map(rowToAssignment);
}

export interface UpsertAssignmentInput {
  id?: number;
  assignmentDate: string;
  employeeId?: number | null;
  personName: string;
  level: DriverLevelId;
  startHour: number;
  endHour: number;
  sentHomeHour?: number | null;
  notes?: string | null;
  createdById?: number | null;
}

export async function upsertAssignment(input: UpsertAssignmentInput): Promise<Assignment | null> {
  const db = await getDb();
  if (!db) return null;

  const payload = {
    assignmentDate: input.assignmentDate,
    employeeId: input.employeeId ?? null,
    personName: input.personName,
    level: input.level,
    startHour: input.startHour,
    endHour: input.endHour,
    sentHomeHour: input.sentHomeHour ?? null,
    notes: input.notes ?? null,
  };

  if (input.id) {
    await db.update(extrasDiaAssignments).set(payload).where(eq(extrasDiaAssignments.id, input.id));
    const [row] = await db
      .select()
      .from(extrasDiaAssignments)
      .where(eq(extrasDiaAssignments.id, input.id))
      .limit(1);
    return row ? rowToAssignment(row) : null;
  }

  const [result] = await db
    .insert(extrasDiaAssignments)
    .values({ ...payload, createdById: input.createdById ?? null })
    .$returningId();
  const newId = (result as any).id;
  const [row] = await db
    .select()
    .from(extrasDiaAssignments)
    .where(eq(extrasDiaAssignments.id, newId))
    .limit(1);
  return row ? rowToAssignment(row) : null;
}

export async function deleteAssignment(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(extrasDiaAssignments).where(eq(extrasDiaAssignments.id, id));
}

// ─── Driver candidates (para dropdown na UI) ─────────────────────────────────

export interface DriverCandidate {
  id: number;
  fullName: string;
  position: string;
  extraLevel: number | null;
  suggestedLevel: DriverLevelId;
}

const POSITION_TO_LEVEL: Record<string, DriverLevelId> = {
  driver: "junior",
  senior_driver: "senior",
  team_leader: "terminal",
  supervisor: "master",
  director: "master",
};

function suggestLevel(position: string | null | undefined, extraLevel: number | null | undefined): DriverLevelId {
  if (typeof extraLevel === "number") {
    if (extraLevel >= 4) return "master";
    if (extraLevel >= 3) return "terminal";
    if (extraLevel >= 2) return "senior";
    return "junior";
  }
  return POSITION_TO_LEVEL[(position ?? "").toLowerCase()] ?? "junior";
}

export async function listDriverCandidates(): Promise<DriverCandidate[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      id: employees.id,
      fullName: employees.fullName,
      position: employees.position,
      extraLevel: employees.extraLevel,
      isActive: employees.isActive,
    })
    .from(employees)
    .where(eq(employees.isActive, 1))
    .orderBy(asc(employees.fullName));
  return rows.map(r => ({
    id: r.id,
    fullName: r.fullName,
    position: r.position,
    extraLevel: r.extraLevel,
    suggestedLevel: suggestLevel(r.position, r.extraLevel),
  }));
}

function countWashes(rows: BookingRow[]): number {
  let n = 0;
  for (const r of rows) if (bookingHasLavagem(r.rawJson)) n++;
  return n;
}

function distinctParks(rows: BookingRow[]): string[] {
  const set = new Set<string>();
  for (const r of rows) {
    const label = [r.parkName, r.city].filter(Boolean).join(" / ");
    if (label) set.add(label);
  }
  return Array.from(set).sort();
}

export async function getExtrasDiaForecast(baseDateInput?: string): Promise<ExtrasDiaForecast> {
  const baseDate = baseDateInput ? new Date(baseDateInput) : new Date();
  const baseStart = startOfDay(baseDate);
  const targetStart = addDays(baseStart, 1);
  const nextStart = addDays(baseStart, 2);
  const nextEnd = addDays(baseStart, 3);

  const [targetCheckins, baseCheckouts, targetCheckouts, nextCheckouts] = await Promise.all([
    fetchBookingsInRange("checkIn", targetStart, nextStart),
    fetchBookingsInRange("checkOut", baseStart, targetStart),
    fetchBookingsInRange("checkOut", targetStart, nextStart),
    fetchBookingsInRange("checkOut", nextStart, nextEnd),
  ]);

  const hourly: HourlyRow[] = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    checkins: 0,
    checkouts: 0,
    driversNeeded: 0,
  }));

  for (const r of targetCheckins) {
    const h = parseScheduledHour(r.checkInTime, r.checkIn);
    if (h !== null) hourly[h].checkins++;
  }
  for (const r of targetCheckouts) {
    const h = parseScheduledHour(r.checkOutTime, r.checkOut);
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

  const allParks = new Set<string>();
  for (const r of [...targetCheckins, ...baseCheckouts, ...targetCheckouts, ...nextCheckouts]) {
    const label = [r.parkName, r.city].filter(Boolean).join(" / ");
    if (label) allParks.add(label);
  }

  return {
    baseDate: dateKey(baseStart),
    targetDate: dateKey(targetStart),
    city: "Lisboa",
    source: "db",
    parksQueried: Array.from(allParks).sort(),
    parksFailed: [],
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
