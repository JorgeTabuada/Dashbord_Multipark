// Correção de fuso das horas vindas da API Multipark.
//
// A API devolve as horas em "hora europeia" (CET/CEST, UTC+1), mas a operação é
// em Lisboa (WET/WEST). Como a diferença CET↔Lisboa é SEMPRE 1h (ambas mudam de
// hora no mesmo dia), basta subtrair 1h — sem depender de verão/inverno nem do
// fuso do browser. Toda a aritmética é feita em UTC para ser determinística.
//
// ⚠️ Aplicar APENAS a horas de RESERVAS (check-in/out, deliveryType, etc.) —
// NUNCA a timestamps gravados pelo nosso sistema (movimentações reais, GPS,
// ocorrências, createdAt), que já estão na hora certa.

export const MULTIPARK_HOUR_OFFSET = -1;

function parseNaiveToUtcMs(s: string): number | null {
  const m = s.match(/(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!m) return null;
  return Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], m[6] ? +m[6] : 0);
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Data+hora de uma reserva, corrigida para hora de Lisboa: "dd/mm/aaaa hh:mm". */
export function fmtBookingDateTime(s: string | null | undefined): string {
  if (!s) return "—";
  const ms = parseNaiveToUtcMs(s);
  if (ms == null) return new Date(s).toLocaleString("pt-PT");
  const d = new Date(ms + MULTIPARK_HOUR_OFFSET * 3600_000);
  return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

/** Só a data (a correção de -1h pode mudar o dia à meia-noite). */
export function fmtBookingDate(s: string | null | undefined): string {
  if (!s) return "—";
  const ms = parseNaiveToUtcMs(s);
  if (ms == null) return new Date(s).toLocaleDateString("pt-PT");
  const d = new Date(ms + MULTIPARK_HOUR_OFFSET * 3600_000);
  return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
}

/** Hora "HH:mm" (string solta da API) corrigida -1h. */
export function fmtBookingHHmm(hhmm: string | null | undefined): string {
  if (!hhmm) return "";
  const m = hhmm.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return hhmm;
  const h = (((+m[1] + MULTIPARK_HOUR_OFFSET) % 24) + 24) % 24;
  return `${pad(h)}:${m[2]}`;
}
