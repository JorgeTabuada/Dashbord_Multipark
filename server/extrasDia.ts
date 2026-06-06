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
import { getBookingTryAllParks } from "./multipark";

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
export const TL_WORKING_DAYS_PER_MONTH = 15;
export const SLOT_MINUTES = 20;
export const SLOTS_PER_HOUR = 60 / SLOT_MINUTES; // 3
export const SLOTS_PER_DAY = 24 * SLOTS_PER_HOUR; // 72
// O forecast cobre 27h: 00:00–24:00 do dia alvo + 00:00–03:00 do seguinte
// (para o turno da noite que vai até às 03:00).
export const FORECAST_HOURS = 27;
export const FORECAST_SLOTS = FORECAST_HOURS * SLOTS_PER_HOUR; // 81

/**
 * Quantos slots de 20min uma reserva consome consoante o deliveryType.
 * - T1/VIP/sem info: 20min → consome 1 slot completo.
 * - T2: 30min → consome 1 slot inteiro + meio do seguinte (1.5).
 * - Outro (Partidas genérico, Oriente, Rossio, Faro, ...): 60min → 3 slots.
 */
export function deliverySlotSpread(deliveryType: string | null | undefined): number[] {
  const cls = classifyDeliveryType(deliveryType);
  if (cls === "t2") return [1, 0.5];
  if (cls === "other") return [1, 1, 1];
  return [1]; // t1 | vip | unknown
}

export type ShiftId = "morning" | "night";

// Manhã: 03:00 → 15:00 (12h). Noite: 15:00 → 03:00 do dia seguinte (12h).
export const SHIFT_BOUNDS: Record<ShiftId, { startHour: number; endHour: number }> = {
  morning: { startHour: 3, endHour: 15 },
  night: { startHour: 15, endHour: 27 }, // 27 = 03h do dia seguinte
};

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

function minuteOf(ts: string | null | undefined): number | null {
  if (!ts) return null;
  const d = new Date(ts.includes("T") ? ts : ts.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return null;
  return d.getMinutes();
}

function parseScheduledHM(
  timeStr: string | null,
  fallbackIso: string | null,
): { hour: number; minute: number } | null {
  if (timeStr && /^\d{1,2}:\d{2}/.test(timeStr)) {
    const [hh, mm] = timeStr.split(":");
    const h = parseInt(hh, 10);
    const m = parseInt(mm, 10);
    if (h >= 0 && h < 24 && m >= 0 && m < 60) return { hour: h, minute: m };
  }
  const h = hourOf(fallbackIso);
  const m = minuteOf(fallbackIso);
  if (h !== null && m !== null) return { hour: h, minute: m };
  return null;
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
    for (let h = 0; h < driversPerHour.length; h++) if (driversPerHour[h] > slot) active.push(h);
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
  hasT2: boolean; // alguma reserva com Terminal 2
  hasOther: boolean; // alguma reserva fora de T1/T2/VIP (Partidas, Oriente, Rossio, Faro, ...)
  slots: Slot20Row[]; // 3 slots per hour
}

export type DeliveryClass = "t1" | "t2" | "vip" | "other" | "unknown";

export function classifyDeliveryType(dt: string | null | undefined): DeliveryClass {
  if (!dt) return "unknown";
  const x = dt.toLowerCase();
  if (x.includes("terminal 1")) return "t1";
  if (x.includes("terminal 2")) return "t2";
  if (x === "vip" || x.endsWith(" vip")) return "vip";
  return "other";
}

export interface Slot20Row {
  hour: number;
  slot: number; // 0, 1, or 2 (00-19, 20-39, 40-59 minutes)
  checkins: number;
  checkouts: number;
  // Procura "pesada" — tem em conta T2 (30min) e Outro (60min) ocupando o slot
  // mesmo quando a reserva começa noutro slot anterior.
  weightedDemand: number;
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
  id: number;
  externalId: string;
  bookingNumber: string | null;
  clientFirstName: string | null;
  clientLastName: string | null;
  licensePlate: string | null;
  checkIn: string | null;
  checkOut: string | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  rawJson: string | null;
  parkName: string | null;
  city: string | null;
  deliveryType: string | null;
  enrichedAt: string | null;
};

export interface BookingSummary {
  id: number;
  externalId: string;
  bookingNumber: string | null;
  clientName: string;
  licensePlate: string | null;
  parkName: string | null;
  time: string; // HH:mm
  deliveryType: string | null;
}

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
      id: multiparkBookings.id,
      externalId: multiparkBookings.externalId,
      bookingNumber: multiparkBookings.bookingNumber,
      clientFirstName: multiparkBookings.clientFirstName,
      clientLastName: multiparkBookings.clientLastName,
      licensePlate: multiparkBookings.licensePlate,
      checkIn: multiparkBookings.checkIn,
      checkOut: multiparkBookings.checkOut,
      checkInTime: multiparkBookings.checkInTime,
      checkOutTime: multiparkBookings.checkOutTime,
      rawJson: multiparkBookings.rawJson,
      parkName: multiparkBookings.parkName,
      city: multiparkBookings.city,
      deliveryType: multiparkBookings.deliveryType,
      enrichedAt: multiparkBookings.enrichedAt,
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

// ─── Assignments (gestor escala pessoas a turnos) ────────────────────────────

export interface Assignment {
  id: number;
  assignmentDate: string;
  employeeId: number | null;
  personName: string;
  level: DriverLevelId | null; // null when TL
  isTeamLeader: boolean;
  shift: ShiftId;
  startHour: number;
  endHour: number;
  sentHomeHour: number | null;
  notes: string | null;
  hoursBilled: number;
  cost: number;
}

function computeAssignmentCost(row: {
  level: DriverLevelId | null;
  isTeamLeader: boolean;
  startHour: number;
  endHour: number;
  sentHomeHour: number | null;
  tlDailyCost?: number; // monthlySalary / 15
}): { hoursBilled: number; cost: number } {
  const end = row.sentHomeHour ?? row.endHour;
  const hours = Math.max(0, end - row.startHour);
  if (row.isTeamLeader) {
    // TL: fixed daily cost; ignore hours.
    return { hoursBilled: hours, cost: row.tlDailyCost ?? 0 };
  }
  const rate = DRIVER_LEVELS.find(l => l.id === row.level)?.hourlyRate ?? 0;
  return { hoursBilled: hours, cost: hours * rate };
}

function rowToAssignment(
  r: typeof extrasDiaAssignments.$inferSelect,
  tlDailyCost?: number,
): Assignment {
  const isTL = r.isTeamLeader === 1;
  const level = (r.level as DriverLevelId | null) ?? null;
  const computed = computeAssignmentCost({
    level,
    isTeamLeader: isTL,
    startHour: r.startHour,
    endHour: r.endHour,
    sentHomeHour: r.sentHomeHour,
    tlDailyCost,
  });
  return {
    id: r.id,
    assignmentDate: r.assignmentDate,
    employeeId: r.employeeId,
    personName: r.personName,
    level,
    isTeamLeader: isTL,
    shift: (r.shift as ShiftId) ?? "morning",
    startHour: r.startHour,
    endHour: r.endHour,
    sentHomeHour: r.sentHomeHour,
    notes: r.notes,
    ...computed,
  };
}

async function getEmployeeDailyCost(employeeId: number | null): Promise<number> {
  if (!employeeId) return 0;
  const db = await getDb();
  if (!db) return 0;
  const [row] = await db
    .select({ monthlySalary: employees.monthlySalary })
    .from(employees)
    .where(eq(employees.id, employeeId))
    .limit(1);
  if (!row?.monthlySalary) return 0;
  const monthly = parseFloat(String(row.monthlySalary));
  if (!Number.isFinite(monthly)) return 0;
  return monthly / TL_WORKING_DAYS_PER_MONTH;
}

export async function listAssignments(date: string): Promise<Assignment[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select()
    .from(extrasDiaAssignments)
    .where(eq(extrasDiaAssignments.assignmentDate, date))
    .orderBy(asc(extrasDiaAssignments.startHour));

  // Resolve TL daily cost for each TL row (employees.monthlySalary / 15)
  const result: Assignment[] = [];
  for (const r of rows) {
    let tlCost: number | undefined;
    if (r.isTeamLeader === 1) {
      tlCost = await getEmployeeDailyCost(r.employeeId);
    }
    result.push(rowToAssignment(r, tlCost));
  }
  return result;
}

export interface UpsertAssignmentInput {
  id?: number;
  assignmentDate: string;
  employeeId?: number | null;
  personName: string;
  level?: DriverLevelId | null;
  isTeamLeader?: boolean;
  shift: ShiftId;
  startHour: number;
  endHour: number;
  sentHomeHour?: number | null;
  notes?: string | null;
  createdById?: number | null;
}

export async function upsertAssignment(input: UpsertAssignmentInput): Promise<Assignment | null> {
  const db = await getDb();
  if (!db) return null;

  const isTL = !!input.isTeamLeader;

  // 1 TL per (date, shift).
  if (isTL) {
    const existing = await db
      .select({ id: extrasDiaAssignments.id })
      .from(extrasDiaAssignments)
      .where(
        and(
          eq(extrasDiaAssignments.assignmentDate, input.assignmentDate),
          eq(extrasDiaAssignments.shift, input.shift),
          eq(extrasDiaAssignments.isTeamLeader, 1),
        ),
      );
    const other = existing.find(e => e.id !== (input.id ?? -1));
    if (other) {
      const label = input.shift === "morning" ? "manhã" : "noite";
      throw new Error(`Já existe um Team Leader para o turno da ${label} deste dia.`);
    }
  }

  const payload = {
    assignmentDate: input.assignmentDate,
    employeeId: input.employeeId ?? null,
    personName: input.personName,
    level: isTL ? null : (input.level ?? "junior"),
    isTeamLeader: isTL ? 1 : 0,
    shift: input.shift,
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
    if (!row) return null;
    const tlCost = row.isTeamLeader === 1 ? await getEmployeeDailyCost(row.employeeId) : undefined;
    return rowToAssignment(row, tlCost);
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
  if (!row) return null;
  const tlCost = row.isTeamLeader === 1 ? await getEmployeeDailyCost(row.employeeId) : undefined;
  return rowToAssignment(row, tlCost);
}

export async function deleteAssignment(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(extrasDiaAssignments).where(eq(extrasDiaAssignments.id, id));
}

// ─── Drill-down: reservas num slot de 20min ──────────────────────────────────

export async function getBookingsInSlot(
  targetDate: string,
  hour: number,
  slot: number,
  type: "checkin" | "checkout",
): Promise<BookingSummary[]> {
  const day = new Date(targetDate + "T00:00:00");
  const targetStartLocal = startOfDay(day);
  // Para hours 0-23 fica no mesmo dia; para 24-26 (=00-02 de D+1) busca D+1.
  const dayOffset = Math.floor(hour / 24);
  const dayStart = addDays(targetStartLocal, dayOffset);
  const dayEnd = addDays(dayStart, 1);
  const hourLocal = hour % 24;
  const field = type === "checkin" ? "checkIn" : "checkOut";
  const rows = await fetchBookingsInRange(field, dayStart, dayEnd);

  const slotStart = slot * SLOT_MINUTES;
  const slotEnd = slotStart + SLOT_MINUTES;

  type Pending = { row: BookingRow; summary: BookingSummary };
  const pendings: Pending[] = [];
  for (const r of rows) {
    const hm = type === "checkin"
      ? parseScheduledHM(r.checkInTime, r.checkIn)
      : parseScheduledHM(r.checkOutTime, r.checkOut);
    if (!hm || hm.hour !== hourLocal) continue;
    if (hm.minute < slotStart || hm.minute >= slotEnd) continue;
    const name = [r.clientFirstName, r.clientLastName].filter(Boolean).join(" ").trim();
    const pad = (n: number) => String(n).padStart(2, "0");
    pendings.push({
      row: r,
      summary: {
        id: r.id,
        externalId: r.externalId,
        bookingNumber: r.bookingNumber,
        clientName: name || "—",
        licensePlate: r.licensePlate,
        parkName: r.parkName,
        time: `${pad(hm.hour)}:${pad(hm.minute)}`,
        deliveryType: r.deliveryType,
      },
    });
  }

  // Enriquece em paralelo as reservas que ainda não foram enriquecidas
  // (chama /bookings/:id que tem deliveryType, returnFlight, etc.) e persiste.
  const toEnrich = pendings.filter(p => !p.row.enrichedAt);
  if (toEnrich.length > 0) {
    await Promise.allSettled(toEnrich.map(async p => {
      const enriched = await enrichBookingFromApi(p.row.externalId);
      if (enriched?.deliveryType) p.summary.deliveryType = enriched.deliveryType;
    }));
  }

  return pendings.map(p => p.summary).sort((a, b) => a.time.localeCompare(b.time));
}

/**
 * Chama /bookings/:id na API Multipark e persiste deliveryType/returnFlight/
 * departingFlight/remarks na DB. Set enrichedAt=now para evitar repetir.
 */
async function enrichBookingFromApi(externalId: string): Promise<{
  deliveryType: string | null;
  returnFlight: string | null;
  departingFlight: string | null;
  remarks: string | null;
} | null> {
  try {
    const found = await getBookingTryAllParks(externalId);
    if (!found) return null;
    const b: any = found.booking;
    const deliveryType = typeof b.deliveryType === "string" ? b.deliveryType : null;
    const returnFlight = typeof b.returnFlight === "string" && b.returnFlight ? b.returnFlight : null;
    const departingFlight = typeof b.departingFlight === "string" && b.departingFlight ? b.departingFlight : null;
    const remarks = typeof b.remarks === "string" && b.remarks ? b.remarks.slice(0, 512) : null;

    const db = await getDb();
    if (db) {
      await db.update(multiparkBookings).set({
        deliveryType,
        returnFlight,
        departingFlight,
        remarks,
        enrichedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
      }).where(eq(multiparkBookings.externalId, externalId));
    }

    return { deliveryType, returnFlight, departingFlight, remarks };
  } catch {
    return null;
  }
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
  // Limite superior do forecast: 03:00 do dia D+2 (= targetStart + 27h),
  // para o turno da noite cobrir até às 03:00 do dia seguinte.
  const targetEndPlus3h = new Date(targetStart.getTime() + FORECAST_HOURS * 60 * 60 * 1000);

  const [targetCheckins, baseCheckouts, targetCheckouts, nextCheckouts] = await Promise.all([
    fetchBookingsInRange("checkIn", targetStart, targetEndPlus3h),
    fetchBookingsInRange("checkOut", baseStart, targetStart),
    fetchBookingsInRange("checkOut", targetStart, targetEndPlus3h),
    fetchBookingsInRange("checkOut", nextStart, nextEnd),
  ]);

  const hourly: HourlyRow[] = Array.from({ length: FORECAST_HOURS }, (_, h) => ({
    hour: h,
    checkins: 0,
    checkouts: 0,
    driversNeeded: 0,
    hasT2: false,
    hasOther: false,
    slots: Array.from({ length: SLOTS_PER_HOUR }, (_, s) => ({
      hour: h,
      slot: s,
      checkins: 0,
      checkouts: 0,
      weightedDemand: 0,
      driversNeeded: 0,
    })),
  }));

  // Acumulador da procura "pesada" por slot global (0..80). Cada reserva
  // espalha 1, 1.5 ou 3 unidades consoante o deliveryType.
  const weightedBySlot: number[] = Array.from({ length: FORECAST_SLOTS }, () => 0);

  // O "dia operacional" vai de 03:00 a 03:00 (24h reais). Hora efectiva:
  //   • bookings em D+1 hora 3–23 → 3–23
  //   • bookings em D+2 hora 0–2  → 24–26
  //   • bookings em D+1 hora 0–2  → DESCARTADOS (pertencem ao plano do dia anterior)
  function bookingEffectiveHM(
    timeStr: string | null,
    fallbackIso: string | null,
  ): { hour: number; minute: number } | null {
    const hm = parseScheduledHM(timeStr, fallbackIso);
    if (!hm) return null;
    if (!fallbackIso) return hm.hour >= 3 ? hm : null;
    const date = new Date(fallbackIso.includes("T") ? fallbackIso : fallbackIso.replace(" ", "T"));
    if (Number.isNaN(date.getTime())) return hm.hour >= 3 ? hm : null;
    const dayStartLocal = startOfDay(date);
    const offsetDays = Math.round((dayStartLocal.getTime() - targetStart.getTime()) / (24 * 60 * 60 * 1000));
    const effectiveHour = hm.hour + 24 * offsetDays;
    // janela do dia operacional: 3 ≤ effectiveHour < 27
    if (effectiveHour < 3 || effectiveHour >= FORECAST_HOURS) return null;
    return { hour: effectiveHour, minute: hm.minute };
  }

  function addToSlot(
    startHour: number,
    startMinute: number,
    deliveryType: string | null,
    type: "checkin" | "checkout",
  ) {
    const startSlot = startHour * SLOTS_PER_HOUR + Math.floor(startMinute / SLOT_MINUTES);
    const cls = classifyDeliveryType(deliveryType);
    // Regra: T2 só conta como 30min (1.5 slots) em CHECK-IN.
    // Em check-out, T2 trata-se como T1 (20min normal).
    let spread: number[];
    if (cls === "t2" && type === "checkin") spread = [1, 0.5];
    else if (cls === "other") spread = [1, 1, 1]; // Outro: aplica em ambos
    else spread = [1];
    for (let i = 0; i < spread.length; i++) {
      const s = startSlot + i;
      if (s >= 0 && s < FORECAST_SLOTS) weightedBySlot[s] += spread[i];
    }
  }

  function markHourClass(hour: number, deliveryType: string | null, type: "checkin" | "checkout") {
    const cls = classifyDeliveryType(deliveryType);
    if (cls === "t2" && type === "checkin") hourly[hour].hasT2 = true;
    else if (cls === "other") hourly[hour].hasOther = true;
  }

  for (const r of targetCheckins) {
    const hm = bookingEffectiveHM(r.checkInTime, r.checkIn);
    if (hm) {
      const slot = Math.floor(hm.minute / SLOT_MINUTES);
      hourly[hm.hour].checkins++;
      hourly[hm.hour].slots[slot].checkins++;
      addToSlot(hm.hour, hm.minute, r.deliveryType, "checkin");
      markHourClass(hm.hour, r.deliveryType, "checkin");
    }
  }
  for (const r of targetCheckouts) {
    const hm = bookingEffectiveHM(r.checkOutTime, r.checkOut);
    if (hm) {
      const slot = Math.floor(hm.minute / SLOT_MINUTES);
      hourly[hm.hour].checkouts++;
      hourly[hm.hour].slots[slot].checkouts++;
      addToSlot(hm.hour, hm.minute, r.deliveryType, "checkout");
      markHourClass(hm.hour, r.deliveryType, "checkout");
    }
  }
  for (const row of hourly) {
    // Driver demand HORÁRIO: soma da procura pesada dos 3 slots, dividida
    // por 3 (porque cada condutor "vale" 3 unidades de slot por hora).
    let hourWeighted = 0;
    for (const s of row.slots) {
      const idx = s.hour * SLOTS_PER_HOUR + s.slot;
      s.weightedDemand = weightedBySlot[idx];
      s.driversNeeded = Math.ceil(s.weightedDemand);
      hourWeighted += s.weightedDemand;
    }
    row.driversNeeded = Math.ceil(hourWeighted / SLOTS_PER_HOUR);
  }

  // Para sugestão de turnos usa a procura pesada agregada por hora.
  const hourlyCars = hourly.map(h => h.slots.reduce((acc, s) => acc + s.weightedDemand, 0));
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
