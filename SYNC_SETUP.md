# Guia de Configuração da Sincronização Firebase ↔ Supabase

Este sistema permite sincronização bidirecional em tempo real entre o sistema Firebase (Backoffice React) e o sistema Supabase (Next.js).

## 📋 Pré-requisitos

### 1. Firebase (Sistema Backoffice)
- Acesso ao projeto Firebase do Backoffice
- Permissões para ler/escrever na base de dados
- Configuração de webhooks (opcional, para tempo real)

### 2. Supabase (Sistema Next.js)
- Projeto Supabase configurado
- Service Role Key para operações administrativas
- Base de dados configurada com as novas tabelas

## 🔧 Configuração

### 1. Executar Schema da Base de Dados

```sql
-- Executar no Supabase SQL Editor
-- Ficheiro: database/sync-schema.sql
```

O schema cria as seguintes tabelas:
- `reservations` - Tabela principal sincronizada com Firebase clients
- `parks` - Configuração de parques
- `campaigns` - Campanhas de marketing
- `app_users` - Utilizadores da aplicação
- `reservation_history` - Histórico de alterações
- `system_settings` - Configurações do sistema
- `sync_logs` - Logs de sincronização

### 2. Variáveis de Ambiente

Copiar `.env.example` para `.env.local` e configurar:

```bash
# Configuração Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Configuração Firebase (copiar do sistema Backoffice)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123...

# Configuração de Webhooks (opcional)
FIREBASE_WEBHOOK_SECRET=secure-token-here
FIREBASE_WEBHOOK_URL=https://backoffice-system-url/api/webhook
FIREBASE_WEBHOOK_TOKEN=bearer-token-for-firebase

# Scheduler (sincronização automática)
AUTO_START_SYNC=true
SYNC_INTERVAL_MS=300000  # 5 minutos
```

### 3. Instalação de Dependências

```bash
npm install firebase @supabase/supabase-js
```

## 🚀 Utilização

### Sincronização Automática

O sistema inicia automaticamente em produção:

```typescript
import { syncScheduler } from '@/lib/sync-scheduler'

// Iniciar manualmente
syncScheduler.start()

// Parar
syncScheduler.stop()

// Sincronização manual
await syncScheduler.forceSyncAll()
```

### APIs Disponíveis

#### 1. Sincronização Firebase → Supabase
```bash
POST /api/sync/firebase
```

```json
{
  "type": "single_reservation",
  "data": {
    "idClient": "1699123456789",
    "city": "lisbon",
    "parkBrand": "airpark",
    "stats": "reservado",
    // ... outros campos
  }
}
```

#### 2. Sincronização Supabase → Firebase
```bash
POST /api/sync/supabase
```

```json
{
  "type": "status_change",
  "data": {
    "firebase_id": "1699123456789",
    "new_status": "recolhido",
    "user_id": "user123",
    "notes": "Veículo recolhido com sucesso"
  }
}
```

#### 3. Webhook Firebase
```bash
POST /api/webhooks/firebase
```

#### 4. Monitorização
```bash
GET /api/sync/firebase?action=stats
GET /api/sync/supabase?limit=50
```

### Interface de Monitorização

Aceder a `/sync` para ver:
- Estatísticas de sincronização
- Reservas pendentes
- Logs em tempo real
- Controlo manual

## 📊 Mapeamento de Dados

### Estados de Reserva
| Firebase | Supabase | Descrição |
|----------|----------|-----------|
| `reservado` | `reservado` | Reserva inicial |
| `em recolha` | `em_recolha` | Recolha iniciada |
| `recolhido` | `recolhido` | Veículo recolhido |
| `em entrega` | `em_entrega` | Entrega iniciada |
| `em movimento` | `em_movimento` | Em trânsito |
| `entregue` | `entregue` | Entregue ao cliente |
| `cancelado` | `cancelado` | Cancelado |

### Campos Principais
| Firebase | Supabase | Transformação |
|----------|----------|---------------|
| `idClient` | `firebase_id` | Direto |
| `licensePlate` | `license_plate` | Maiúsculas |
| `bookingPrice` | `booking_price` | String → Decimal |
| `checkIn` | `check_in_datetime` | DD/MM/YYYY → ISO |
| `stats` | `status` | Mapeamento de estados |

## 🔄 Fluxos de Sincronização

### 1. Firebase → Supabase (Entrada de Dados)
1. Webhook recebe mudança do Firebase
2. Dados transformados e validados
3. Upsert na tabela `reservations`
4. Log da operação em `sync_logs`

### 2. Supabase → Firebase (Saída de Dados)
1. Mudança detectada no Supabase
2. Estado marcado como `pending`
3. Scheduler processa mudanças pendentes
4. Update enviado para Firebase
5. Estado marcado como `synced`

### 3. Resolução de Conflitos
- Last-write-wins com timestamps
- Log de conflitos para revisão manual
- Fallback para estado de erro

## 🚨 Monitorização e Alertas

### Estados de Sincronização
- `synced` - Sincronizado com sucesso
- `pending` - Aguardando sincronização
- `error` - Erro de sincronização

### Logs Disponíveis
- Operações de sincronização
- Erros e exceções
- Estatísticas de performance
- Histórico completo de alterações

### Dashboard de Monitorização
- Estatísticas em tempo real
- Alertas visuais para erros
- Controlo manual de sincronização
- Histórico de operações

## 🛠️ Resolução de Problemas

### Erro: "Reserva não encontrada"
- Verificar se Firebase ID existe
- Confirmar formato correto do ID
- Verificar permissões Firebase

### Erro: "Falha na sincronização"
- Verificar conectividade de rede
- Confirmar credenciais Firebase/Supabase
- Verificar logs de erro detalhados

### Performance Lenta
- Verificar índices da base de dados
- Ajustar intervalo do scheduler
- Otimizar queries Firebase

## 📝 Desenvolvimento

### Adicionar Novos Campos
1. Atualizar interfaces TypeScript
2. Modificar funções de transformação
3. Atualizar schema Supabase se necessário
4. Testar sincronização bidirecional

### Testes
```bash
# Testar APIs
curl -X POST http://localhost:3000/api/sync/firebase \
  -H "Content-Type: application/json" \
  -d '{"type": "single_reservation", "data": {...}}'

# Verificar logs
curl http://localhost:3000/api/sync/firebase?action=stats
```

## 🔐 Segurança

- Tokens de webhook seguros
- Service Role Keys protegidas
- Validação de origem nos webhooks
- Row Level Security no Supabase
- Logs de auditoria completos

## 📞 Suporte

Para problemas ou questões:
1. Verificar logs em `/sync`
2. Consultar documentação das APIs
3. Verificar configuração de ambiente
4. Testar conectividade Firebase/Supabase