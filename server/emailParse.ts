// server/emailParse.ts
// Parsing PURO de emails inbound (sem dependências de DB) — testável isoladamente.
// Usado por server/jobs/emailInboundSync.ts.
//
// Contexto: a caixa reservas@multipark.pt recebe (1) notificações automáticas de
// reserva da SkyPark (corpo estruturado com etiquetas *Nome:* *Email:* ...) e
// (2) emails que o backoffice REENCAMINHA para os aliases temáticos
// (criticas@/reclamacoes@/perdidos@/recursos-humanos@). O remetente real do
// cliente vem mascarado no cabeçalho (info@multipark.pt) mas está sempre no CORPO.

export type InboundAlias = "criticas" | "reclamacoes" | "perdidos" | "recursos-humanos";

const ALIASES: InboundAlias[] = ["criticas", "reclamacoes", "perdidos", "recursos-humanos"];

// ── ROTEAMENTO ──────────────────────────────────────────────────────────────
// Determina o alias temático a partir dos headers de entrega. O Delivered-To é
// o mais fiável (o reenvio para o alias chega sempre com Delivered-To=<alias>@…);
// X-Forwarded-For e To servem de fallback.
export function routeAlias(headers: {
  deliveredTo?: string | null;
  to?: string | null;
  cc?: string | null;
  xForwardedFor?: string | null;
}): InboundAlias | null {
  const hay = [headers.deliveredTo, headers.xForwardedFor, headers.to, headers.cc]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  for (const a of ALIASES) {
    if (hay.includes(`${a}@multipark.pt`)) return a;
  }
  return null;
}

// ── FILTRO DE RUÍDO ─────────────────────────────────────────────────────────
// Emails de sistema/automáticos que NÃO devem gerar registo.
export function isSystemEmail(from?: string | null, subject?: string | null): boolean {
  const f = (from || "").toLowerCase();
  if (/forwarding-noreply@google\.com/.test(f)) return true;
  if (/mailer-daemon|postmaster@/.test(f)) return true;
  const s = (subject || "").toLowerCase();
  // confirmações de encaminhamento do Gmail ("(Gmail Confirmação de Encaminhamento…")
  if (/confirma\w+ de encaminhamento|forwarding confirmation/.test(s)) return true;
  return false;
}

// Notificação automática de nova reserva (não é reclamação/perdido/crítica;
// estas reservas já entram pela sync da API Multipark). Detetada pelo assunto.
export function isReservationNotification(subject?: string | null, from?: string | null): boolean {
  const s = (subject || "").toLowerCase();
  const f = (from || "").toLowerCase();
  return /nova reserva/.test(s) || /nova reserva\s*-\s*skypark/.test(f);
}

// ── EXTRAÇÃO DE CAMPOS DO CORPO ─────────────────────────────────────────────
export type ParsedClient = {
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  vehiclePlate?: string;
  bookingRef?: string;
  parkingType?: string;
  deliveryLocation?: string;
  checkIn?: string;
  checkOut?: string;
  flight?: string;
  vehicleInfo?: string;
  nif?: string;
  total?: string;
  campaign?: string;
  isReservation: boolean;
};

const EMAIL_RE = /[\w.\-+]+@[\w.\-]+\.\w{2,}/;

// Procura o valor de uma etiqueta (ex: "Nome:") na 1ª ocorrência. O corpo é
// pré-normalizado (markdown * removido) antes de chamar.
function labelValue(text: string, labels: string[]): string | undefined {
  for (const lab of labels) {
    const re = new RegExp(`${lab}\\s*:\\s*([^\\n\\r]+)`, "i");
    const m = text.match(re);
    if (m) {
      const v = m[1].replace(/^[-•\s]+/, "").trim();
      if (v) return v;
    }
  }
  return undefined;
}

// Extrai o remetente real de um email REENCAMINHADO ("De: Nome <email>").
export function parseForwardedSender(rawBody: string): { name?: string; email?: string } {
  const text = rawBody.replace(/\*+/g, "").replace(/\r/g, "");
  let m = text.match(/^\s*(?:De|From)\s*:\s*(.+?)\s*<([^>]+)>/im);
  if (m) return { name: m[1].trim() || undefined, email: m[2].trim() };
  m = text.match(/^\s*(?:De|From)\s*:\s*([\w.\-+]+@[\w.\-]+\.\w{2,})/im);
  if (m) return { email: m[1].trim() };
  return {};
}

// Extrai os dados do cliente do corpo. Funciona para notificações de reserva
// estruturadas (etiquetas) e, em fallback, para emails reencaminhados (cabeçalho
// "De:" + primeiro email não-interno do corpo).
export function parseInboundBody(rawBody: string): ParsedClient {
  const text = (rawBody || "").replace(/\*+/g, "").replace(/\r/g, "");
  const get = (labels: string[]) => labelValue(text, labels);

  let clientEmail = get(["Email", "E-mail", "Correio"]);
  if (clientEmail) {
    const m = clientEmail.match(EMAIL_RE);
    clientEmail = m ? m[0] : undefined;
  }
  const clientName = get(["Nome do cliente", "Nome"]);
  const clientPhone = get(["Contacto Telefónico", "Contacto Telefonico", "Telefone", "Telemóvel", "Contacto"]);
  const vehiclePlate = get(["Matrícula", "Matricula"]);
  const bookingRef = get(["Referência", "Referencia", "Reserva", "Booking"]);
  const parkingType = get(["Tipo de Estacionamento"]);
  const deliveryLocation = get(["Local de Entrega"]);
  const checkIn = get(["Check-in", "Check in", "Entrada"]);
  const checkOut = get(["Check-out", "Check out", "Saída", "Saida"]);
  const flight = get(["Voo/Cidade de Regresso", "Voo de Regresso", "Voo"]);
  const vehicleInfo = get(["Informações do Carro", "Informacoes do Carro", "Veículo", "Veiculo"]);
  const nif = get(["NIF", "Contribuinte"]);
  const total = get(["Total"]);
  const campaign = get(["Campanha"]);

  const isReservation = !!(clientName && (clientEmail || vehiclePlate));

  // Fallback para emails reencaminhados sem etiquetas estruturadas.
  let name = clientName;
  let mail = clientEmail;
  if (!isReservation) {
    const fwd = parseForwardedSender(rawBody);
    name = name || fwd.name;
    mail = mail || fwd.email;
    if (!mail) {
      // primeiro email no corpo que não seja interno
      const all = text.match(new RegExp(EMAIL_RE.source, "gi")) || [];
      mail = all.find((e) => !/multipark\.pt|skypark\.pt|google\.com/i.test(e));
    }
  }

  return {
    clientName: name,
    clientEmail: mail,
    clientPhone,
    vehiclePlate,
    bookingRef,
    parkingType,
    deliveryLocation,
    checkIn,
    checkOut,
    flight,
    vehicleInfo,
    nif,
    total,
    campaign,
    isReservation,
  };
}
