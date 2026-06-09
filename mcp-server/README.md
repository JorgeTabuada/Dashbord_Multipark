# Multipark Dashboard — MCP Server

Servidor MCP (stdio) que permite ao Claude **controlar a Dashboard Multipark
completamente** — todos os parques e cidades (Lisboa, Faro, Porto) — através da
API REST `/api/v1` da dashboard.

## Como funciona

```
Claude (Desktop/Code)  ──stdio──►  este MCP server  ──HTTPS──►  /api/v1 (Vercel)  ──►  BD + API Multipark
```

A autenticação é por **API key** (header `X-API-Key`). Cada chave tem um
**scope** que limita o que pode fazer:

| Scope (campo `permissions` da chave) | Pode |
|---|---|
| `read` | Ler tudo (reservas, reclamações, reviews, stats, RH) |
| `read,write` (ou `write`) | O acima + criar/editar reclamações e reviews, disparar syncs |
| `admin` (ou `*`) | Tudo, incluindo **apagar** reclamações e cleanup de duplicados |

> `admin` implica `write` implica `read`.

## 1. Criar a API key

Na base de dados (tabela `api_keys`), cria uma chave com o `permissions` que
queres. Exemplo SQL para controlo total:

```sql
INSERT INTO api_keys (name, apiKey, permissions, active)
VALUES ('Claude MCP', '<gera-uma-string-aleatória-longa>', 'admin', 1);
```

Gera a chave com, por exemplo: `openssl rand -hex 32`.

## 2. Instalar

```bash
cd mcp-server
npm install
```

## 3. Registar no Claude

### Claude Desktop — `claude_desktop_config.json`

```json
{
  "mcpServers": {
    "multipark-dashboard": {
      "command": "node",
      "args": ["/caminho/absoluto/para/Dashbord_Multipark/mcp-server/index.mjs"],
      "env": {
        "MULTIPARK_API_URL": "https://dashbord-multipark.vercel.app/api/v1",
        "MULTIPARK_API_KEY": "a-tua-api-key"
      }
    }
  }
}
```

### Claude Code (CLI)

```bash
claude mcp add multipark-dashboard \
  --env MULTIPARK_API_URL=https://dashbord-multipark.vercel.app/api/v1 \
  --env MULTIPARK_API_KEY=a-tua-api-key \
  -- node /caminho/absoluto/para/mcp-server/index.mjs
```

Reinicia o Claude e as tools aparecem.

## Tools disponíveis

| Tool | Scope | Descrição |
|---|---|---|
| `list_parks` | read | Todos os parques/cidades |
| `dashboard_summary` | read | Visão cruzada (reservas + reclamações + por cidade) |
| `list_bookings` | read | Reservas com filtros (city, parkId, status, datas, search) |
| `booking_stats` | read | Estatísticas de reservas |
| `get_booking` | read | Detalhe de reserva (local + ao vivo da API Multipark) |
| `list_complaints` | read | Reclamações |
| `complaint_stats` | read | Stats de reclamações |
| `get_complaint` | read | Detalhe (mensagens + fotos) |
| `create_complaint` | write | Criar reclamação |
| `update_complaint` | write | Atualizar reclamação |
| `add_complaint_message` | write | Adicionar mensagem/nota |
| `delete_complaint` | **admin** | Apagar reclamação |
| `list_reviews` | read | Avaliações Google |
| `create_review` | write | Registar avaliação |
| `list_vehicles` | read | Viaturas |
| `list_employees` | read | Colaboradores |
| `sync_recent` | write | Sincronizar reservas recentes |
| `sync_future` | write | Sincronizar janela futura |
| `sync_day` | write | Sincronizar um dia (backfill) |
| `cleanup_duplicates` | **admin** | Apagar reservas duplicadas |

## Notas de segurança

- A API key dá acesso programático à operação. **Guarda-a como um segredo**
  (não a metas em repositórios). Roda-a com `UPDATE api_keys SET active=0` se
  for comprometida.
- Para um MCP só de leitura, cria a chave com `permissions='read'`.
- Os endpoints `/api/v1` validam o scope a cada chamada; uma chave `read`
  recebe `403` em qualquer escrita.
