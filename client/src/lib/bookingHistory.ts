// Filtragem do histórico de movimentos de uma reserva (API Multipark).
//
// Há dois contextos com regras diferentes:
//  • Reclamações — mostra só os movimentos físicos relevantes; esconde ações
//    administrativas (recolha pendente, atualização, fecho/validação de caixa,
//    validação de condutores, alterações de consulta/reserva).
//  • Roubos (Perdidos & Achados) — o objetivo é ver QUEM mexeu no carro (o
//    potencial ladrão). Esconde MENOS: só recolha pendente, fecho de caixa,
//    validação de caixa e validação de condutores. Mantém tudo o resto (trocas
//    de condutor, atualizações, etc.), que são formas de alguém trocar de
//    condutor / mexer no carro.
//
// O changeType da API pode vir como código (EN) ou texto (PT); normalizamos e
// classificamos por palavras-chave. Se algum tipo escapar, ajustar aqui.

function norm(s: unknown): string {
  return String(s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}

export type HistoryCategory =
  | "recolha_pendente" | "atualizacao" | "fecho_caixa" | "validacao_caixa"
  | "validacao_condutor" | "alteracao_consulta" | "alteracao_reserva" | "outro";

export function changeCategory(changeType: unknown): HistoryCategory {
  const s = norm(changeType);
  if (!s) return "outro";
  if (/recolha pendente|pending.?check.?in|pending.?pickup/.test(s)) return "recolha_pendente";
  if (/fecho.*caixa|cash.?close|close.?cash|cashier.?clos/.test(s)) return "fecho_caixa";
  if (/(valida|validation).*caixa|cash.*valid|cashier.*valid/.test(s)) return "validacao_caixa";
  if (/(valida|validation).*condutor|driver.*valid/.test(s)) return "validacao_condutor";
  if (/altera.*consulta|consult/.test(s)) return "alteracao_consulta";
  if (/altera.*reserva|booking.?update|reservation.?update/.test(s)) return "alteracao_reserva";
  if (/atualiza|^update/.test(s)) return "atualizacao";
  return "outro";
}

// Reclamações: esconde as administrativas (lista longa).
const COMPLAINT_HIDE = new Set<HistoryCategory>([
  "recolha_pendente", "atualizacao", "fecho_caixa", "validacao_caixa",
  "validacao_condutor", "alteracao_consulta", "alteracao_reserva",
]);

// Roubos: esconde só as 4; mantém tudo o resto (para ver quem mexeu no carro).
const THEFT_HIDE = new Set<HistoryCategory>([
  "recolha_pendente", "fecho_caixa", "validacao_caixa", "validacao_condutor",
]);

export function filterBookingHistory<T extends { changeType?: unknown }>(
  items: T[] | null | undefined,
  mode: "complaint" | "theft",
): T[] {
  const hide = mode === "theft" ? THEFT_HIDE : COMPLAINT_HIDE;
  return (items ?? []).filter(h => !hide.has(changeCategory(h.changeType)));
}
