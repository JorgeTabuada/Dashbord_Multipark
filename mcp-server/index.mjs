#!/usr/bin/env node
/**
 * Multipark Dashboard MCP Server (stdio)
 *
 * Expõe a Dashboard Multipark como tools MCP, falando com a API REST /api/v1.
 * Cobre todos os parques e cidades. O que cada tool pode fazer depende do
 * scope da API key (read / write / admin) — ver README.
 *
 * Configuração via variáveis de ambiente:
 *   MULTIPARK_API_URL  (default: https://dashbord-multipark.vercel.app/api/v1)
 *   MULTIPARK_API_KEY  (obrigatório)
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const BASE_URL = (process.env.MULTIPARK_API_URL || "https://dashbord-multipark.vercel.app/api/v1").replace(/\/$/, "");
const API_KEY = process.env.MULTIPARK_API_KEY;

if (!API_KEY) {
  console.error("[multipark-mcp] Falta a variável de ambiente MULTIPARK_API_KEY.");
  process.exit(1);
}

async function api(method, path, { query, body } = {}) {
  let url = BASE_URL + path;
  if (query) {
    const qs = new URLSearchParams(
      Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== "").map(([k, v]) => [k, String(v)])
    ).toString();
    if (qs) url += "?" + qs;
  }
  const res = await fetch(url, {
    method,
    headers: { "X-API-Key": API_KEY, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  if (!res.ok) {
    const msg = (data && data.error) || text || res.statusText;
    throw new Error(`HTTP ${res.status} — ${msg}`);
  }
  return data;
}

// Cada tool: { name, description, inputSchema, run(args) }
const tools = [
  {
    name: "list_parks",
    description: "Lista todos os parques e cidades Multipark (Lisboa, Faro, Porto).",
    inputSchema: { type: "object", properties: {} },
    run: () => api("GET", "/parks"),
  },
  {
    name: "dashboard_summary",
    description: "Visão cruzada de toda a operação: stats de reservas, reclamações e totais por cidade. Opcional: from/to (YYYY-MM-DD).",
    inputSchema: { type: "object", properties: { from: { type: "string" }, to: { type: "string" } } },
    run: (a) => api("GET", "/dashboard/summary", { query: a }),
  },
  {
    name: "list_bookings",
    description: "Lista reservas (todos os parques/cidades). Filtros: city, parkId, status, parkingType, from, to (YYYY-MM-DD), search, limit (máx 500), offset.",
    inputSchema: {
      type: "object",
      properties: {
        city: { type: "string" }, parkId: { type: "string" }, status: { type: "string" },
        parkingType: { type: "string" }, from: { type: "string" }, to: { type: "string" },
        search: { type: "string" }, limit: { type: "number" }, offset: { type: "number" },
      },
    },
    run: (a) => api("GET", "/bookings", { query: a }),
  },
  {
    name: "booking_stats",
    description: "Estatísticas agregadas de reservas. Opcional: from, to (YYYY-MM-DD), projectId.",
    inputSchema: { type: "object", properties: { from: { type: "string" }, to: { type: "string" }, projectId: { type: "number" } } },
    run: (a) => api("GET", "/bookings/stats", { query: a }),
  },
  {
    name: "get_booking",
    description: "Detalhe de uma reserva pelo externalId (local + ao vivo da API Multipark, tentando todos os parques).",
    inputSchema: { type: "object", properties: { externalId: { type: "string" } }, required: ["externalId"] },
    run: (a) => api("GET", `/bookings/${encodeURIComponent(a.externalId)}`),
  },
  {
    name: "list_complaints",
    description: "Lista reclamações. Filtros: status, type, projectId, assignedToId.",
    inputSchema: { type: "object", properties: { status: { type: "string" }, type: { type: "string" }, projectId: { type: "number" }, assignedToId: { type: "number" } } },
    run: (a) => api("GET", "/complaints", { query: a }),
  },
  {
    name: "complaint_stats",
    description: "Estatísticas das reclamações (por estado, em atraso). Opcional: projectId.",
    inputSchema: { type: "object", properties: { projectId: { type: "number" } } },
    run: (a) => api("GET", "/complaints/stats", { query: a }),
  },
  {
    name: "get_complaint",
    description: "Detalhe completo de uma reclamação (mensagens + fotos) pelo id.",
    inputSchema: { type: "object", properties: { id: { type: "number" } }, required: ["id"] },
    run: (a) => api("GET", `/complaints/${a.id}`),
  },
  {
    name: "create_complaint",
    description: "Cria uma reclamação. type: damage|dirt|delay|overcharge|staff|other. priority: low|medium|high|urgent.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string" }, type: { type: "string" }, priority: { type: "string" },
        description: { type: "string" }, clientName: { type: "string" }, clientEmail: { type: "string" },
        clientPhone: { type: "string" }, reservationRef: { type: "string" }, vehiclePlate: { type: "string" },
        slaHours: { type: "number" }, projectId: { type: "number" }, assignedToId: { type: "number" },
      },
      required: ["title", "type"],
    },
    run: (a) => api("POST", "/complaints", { body: a }),
  },
  {
    name: "update_complaint",
    description: "Atualiza uma reclamação. Campos: title, description, type, status (new|analyzing|waiting_client|resolved|closed), priority, assignedToId, penaltyPoints, slaHours.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "number" }, title: { type: "string" }, description: { type: "string" },
        type: { type: "string" }, status: { type: "string" }, priority: { type: "string" },
        assignedToId: { type: "number" }, penaltyPoints: { type: "number" }, slaHours: { type: "number" },
      },
      required: ["id"],
    },
    run: (a) => { const { id, ...body } = a; return api("PATCH", `/complaints/${id}`, { body }); },
  },
  {
    name: "add_complaint_message",
    description: "Adiciona uma mensagem/nota a uma reclamação. isInternal=true para nota interna (não visível ao cliente).",
    inputSchema: {
      type: "object",
      properties: { id: { type: "number" }, message: { type: "string" }, isInternal: { type: "boolean" }, authorName: { type: "string" } },
      required: ["id", "message"],
    },
    run: (a) => { const { id, ...body } = a; return api("POST", `/complaints/${id}/messages`, { body }); },
  },
  {
    name: "delete_complaint",
    description: "Apaga uma reclamação (destrutivo — requer scope admin).",
    inputSchema: { type: "object", properties: { id: { type: "number" } }, required: ["id"] },
    run: (a) => api("DELETE", `/complaints/${a.id}`),
  },
  {
    name: "list_reviews",
    description: "Lista avaliações Google. Filtros: rating (1-5), status, projectId.",
    inputSchema: { type: "object", properties: { rating: { type: "number" }, status: { type: "string" }, projectId: { type: "number" } } },
    run: (a) => api("GET", "/reviews", { query: a }),
  },
  {
    name: "create_review",
    description: "Regista uma avaliação Google. reviewerName e rating (1-5) obrigatórios.",
    inputSchema: {
      type: "object",
      properties: { reviewerName: { type: "string" }, rating: { type: "number" }, reviewText: { type: "string" }, reviewerEmail: { type: "string" }, reviewDate: { type: "string" }, projectId: { type: "number" }, vehiclePlate: { type: "string" } },
      required: ["reviewerName", "rating"],
    },
    run: (a) => api("POST", "/reviews", { body: a }),
  },
  {
    name: "list_vehicles",
    description: "Lista as viaturas internas.",
    inputSchema: { type: "object", properties: {} },
    run: () => api("GET", "/vehicles"),
  },
  {
    name: "list_employees",
    description: "Lista os colaboradores (RH).",
    inputSchema: { type: "object", properties: {} },
    run: () => api("GET", "/employees"),
  },
  {
    name: "sync_recent",
    description: "Dispara a sincronização recente de reservas (report + enrich + history). Opcional: windowMinutes (default 30).",
    inputSchema: { type: "object", properties: { windowMinutes: { type: "number" } } },
    run: (a) => api("POST", "/sync/recent", { body: a }),
  },
  {
    name: "sync_future",
    description: "Sincroniza a janela futura de reservas. Opcional: weeksAhead (default 4).",
    inputSchema: { type: "object", properties: { weeksAhead: { type: "number" } } },
    run: (a) => api("POST", "/sync/future", { body: a }),
  },
  {
    name: "sync_day",
    description: "Sincroniza um dia específico (report + enrich + history) — útil para backfill histórico. date obrigatório (YYYY-MM-DD).",
    inputSchema: { type: "object", properties: { date: { type: "string" } }, required: ["date"] },
    run: (a) => api("POST", "/sync/day", { body: a }),
  },
  {
    name: "cleanup_duplicates",
    description: "Apaga reservas duplicadas (destrutivo — requer scope admin).",
    inputSchema: { type: "object", properties: {} },
    run: () => api("POST", "/admin/cleanup-duplicates"),
  },
];

const toolByName = new Map(tools.map((t) => [t.name, t]));

const server = new Server(
  { name: "multipark-dashboard", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: tools.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })),
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const tool = toolByName.get(req.params.name);
  if (!tool) {
    return { isError: true, content: [{ type: "text", text: `Tool desconhecida: ${req.params.name}` }] };
  }
  try {
    const result = await tool.run(req.params.arguments ?? {});
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  } catch (err) {
    return { isError: true, content: [{ type: "text", text: `Erro: ${err?.message || String(err)}` }] };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error(`[multipark-mcp] ligado a ${BASE_URL} — ${tools.length} tools disponíveis.`);
