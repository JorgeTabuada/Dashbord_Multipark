// Formatação de horas guardadas (UTC) → fuso da operação.
//
// A API Multipark e os nossos timestamps (new Date().toISOString()) são gravados
// em UTC. Para mostrar a hora real convertemos UTC → fuso, via Intl (com DST).
//
// O fuso NÃO está fixo em Lisboa: há um fuso ATIVO da sessão (default
// Europe/Lisbon) que se pode mudar com setAppTimeZone() — para quando a operação
// expandir a outros países. Para horas de RESERVA, usa-se de preferência o fuso
// do PARQUE (cityTimeZone(booking.city)), porque o carro está fisicamente lá.

// ── Fuso ativo da sessão (mudável; default Portugal) ──────────────────────────
let appTimeZone = "Europe/Lisbon";
export function setAppTimeZone(tz: string | null | undefined): void {
  appTimeZone = tz && tz.trim() ? tz.trim() : "Europe/Lisbon";
}
export function getAppTimeZone(): string {
  return appTimeZone;
}

// Cidade/país → fuso (para horas de reserva no fuso do parque). Extensível: ao
// abrir um novo país basta acrescentar aqui (ex.: madrid: "Europe/Madrid").
const CITY_TZ: Record<string, string> = {
  lisbon: "Europe/Lisbon", lisboa: "Europe/Lisbon",
  porto: "Europe/Lisbon", oporto: "Europe/Lisbon",
  faro: "Europe/Lisbon",
};
export function cityTimeZone(city?: string | null): string {
  if (!city) return appTimeZone;
  return CITY_TZ[city.trim().toLowerCase()] ?? appTimeZone;
}

function toInstant(input: string | number | Date | null | undefined): Date | null {
  if (input == null || input === "") return null;
  if (typeof input === "number") return new Date(input);
  if (input instanceof Date) return Number.isNaN(input.getTime()) ? null : input;
  const m = String(input).match(/(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
  if (m) return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], m[6] ? +m[6] : 0));
  const d = new Date(String(input));
  return Number.isNaN(d.getTime()) ? null : d;
}

type Kind = "datetime" | "date" | "time";
const OPTS: Record<Kind, Intl.DateTimeFormatOptions> = {
  datetime: { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false },
  date: { day: "2-digit", month: "2-digit", year: "numeric" },
  time: { hour: "2-digit", minute: "2-digit", hour12: false },
};
const _cache = new Map<string, Intl.DateTimeFormat>();
function fmt(kind: Kind, tz: string): Intl.DateTimeFormat {
  const key = kind + "|" + tz;
  let f = _cache.get(key);
  if (!f) {
    try { f = new Intl.DateTimeFormat("pt-PT", { timeZone: tz, ...OPTS[kind] }); }
    catch { f = new Intl.DateTimeFormat("pt-PT", { timeZone: "Europe/Lisbon", ...OPTS[kind] }); }
    _cache.set(key, f);
  }
  return f;
}

// ── Helpers genéricos: QUALQUER timestamp guardado (UTC) → fuso (default sessão).
// `tz` opcional permite o fuso do parque (ex.: cityTimeZone(b.city)).
export function fmtPTDateTime(input: string | number | Date | null | undefined, tz: string = appTimeZone): string {
  const d = toInstant(input);
  return d ? fmt("datetime", tz).format(d) : "—";
}
export function fmtPTDate(input: string | number | Date | null | undefined, tz: string = appTimeZone): string {
  const d = toInstant(input);
  return d ? fmt("date", tz).format(d) : "—";
}
export function fmtPTTime(input: string | number | Date | null | undefined, tz: string = appTimeZone): string {
  const d = toInstant(input);
  return d ? fmt("time", tz).format(d) : "—";
}

// ── Aliases para horas de RESERVA (mantêm os nomes usados nas páginas). ────────
export const fmtBookingDateTime = (s: string | null | undefined, tz: string = appTimeZone) => fmtPTDateTime(s, tz);
export const fmtBookingDate = (s: string | null | undefined, tz: string = appTimeZone) => fmtPTDate(s, tz);

/** Hora "HH:mm" solta (UTC) → fuso. Sem data usa a de hoje para o DST. */
export function fmtBookingHHmm(hhmm: string | null | undefined, tz: string = appTimeZone): string {
  if (!hhmm) return "";
  const m = hhmm.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return hhmm;
  const t = new Date();
  const d = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate(), +m[1], +m[2]));
  return fmt("time", tz).format(d);
}
