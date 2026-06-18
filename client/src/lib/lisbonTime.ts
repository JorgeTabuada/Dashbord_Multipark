// Conversão das horas das reservas para hora de Lisboa.
//
// A API Multipark devolve as datas/horas em UTC (ex.: check-in que o cliente vê
// como 07:00 em Lisboa vem da API como "06:00"). Guardamos o valor da API (UTC).
// Para mostrar a hora real de Lisboa convertemos UTC → Europe/Lisbon usando o
// fuso (Intl), por isso fica correto tanto no verão (UTC+1) como no inverno
// (UTC+0) — sem números fixos.
//
// ⚠️ Só para horas de RESERVAS (check-in/out). Timestamps do nosso sistema
// (movimentações, ocorrências, etc.) já estão na hora certa.

function parseUtc(s: string): Date | null {
  const m = s.match(/(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!m) return null;
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], m[6] ? +m[6] : 0));
}

const DATETIME_FMT = new Intl.DateTimeFormat("pt-PT", {
  timeZone: "Europe/Lisbon",
  day: "2-digit", month: "2-digit", year: "numeric",
  hour: "2-digit", minute: "2-digit", hour12: false,
});
const DATE_FMT = new Intl.DateTimeFormat("pt-PT", {
  timeZone: "Europe/Lisbon",
  day: "2-digit", month: "2-digit", year: "numeric",
});

/** Data+hora da reserva em hora de Lisboa: "dd/mm/aaaa, hh:mm". */
export function fmtBookingDateTime(s: string | null | undefined): string {
  if (!s) return "—";
  const d = parseUtc(s);
  if (!d) return new Date(s).toLocaleString("pt-PT");
  return DATETIME_FMT.format(d);
}

/** Só a data, em hora de Lisboa. */
export function fmtBookingDate(s: string | null | undefined): string {
  if (!s) return "—";
  const d = parseUtc(s);
  if (!d) return new Date(s).toLocaleDateString("pt-PT");
  return DATE_FMT.format(d);
}

const TIME_FMT = new Intl.DateTimeFormat("pt-PT", {
  timeZone: "Europe/Lisbon", hour: "2-digit", minute: "2-digit", hour12: false,
});

/** Hora "HH:mm" solta da API (UTC) → Lisboa. Sem data própria usa-se a de hoje
 *  para o DST (as reservas mostradas são de datas próximas). Na prática este
 *  campo (checkInTime) vem quase sempre vazio e a hora vem do check-in completo. */
export function fmtBookingHHmm(hhmm: string | null | undefined): string {
  if (!hhmm) return "";
  const m = hhmm.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return hhmm;
  const t = new Date();
  const d = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate(), +m[1], +m[2]));
  return TIME_FMT.format(d);
}
