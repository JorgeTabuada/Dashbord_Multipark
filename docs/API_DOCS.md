# 📚 **API Documentation - Ferramentas Multipark**

Sistema de APIs unificado para gestão multi-database das operações Multipark.

## 🏗️ **Arquitetura**

```
📁 pages/api/
├── 🗂️ dashboard/           # Base operacional (Dashboard)
│   ├── reservas.ts         # CRUD reservas
│   ├── caixa.ts           # Transações e sessões caixa
│   └── caixa/upload.ts    # Upload Excel caixa/entregas
├── 🗂️ ferramentas/        # Base RH e Analytics
│   └── rh/colaboradores.ts # Gestão colaboradores
├── 🗂️ sync/               # Sincronização entre bases
│   └── parques.ts         # Sync parques
├── 🗂️ unified/            # APIs cross-database
│   └── dashboard.ts       # Dashboard unificado
├── 🗂️ auth/               # Autenticação
│   └── profile.ts         # Perfil utilizador
└── health.ts              # Health check
```

---

## 🔐 **Autenticação**

Todas as APIs requerem autenticação via token JWT:

```bash
Authorization: Bearer <supabase_jwt_token>
```

### **Endpoints de Auth**

#### `GET /api/auth/profile`
Obter perfil do utilizador em ambas as bases
- **Response**: Perfil completo com permissões

---

## 📊 **Dashboard APIs**

### **Reservas** - `/api/dashboard/reservas`

#### `GET /api/dashboard/reservas`
Listar reservas com filtros
- **Query Params**:
  - `parqueId` - ID do parque (ou "todos")
  - `dataInicio` - Data início (YYYY-MM-DD)
  - `dataFim` - Data fim (YYYY-MM-DD)
  - `estado` - Estado da reserva

#### `POST /api/dashboard/reservas`
Criar nova reserva
- **Body**: Dados da reserva

#### `PUT /api/dashboard/reservas?id=<id>`
Atualizar reserva existente
- **Body**: Campos a atualizar

### **Caixa** - `/api/dashboard/caixa`

#### `GET /api/dashboard/caixa`
Buscar transações ou sessão específica
- **Query Params**:
  - `tipo=sessao` + `parqueId` + `data` - Sessão específica
  - `parqueId` + `dataInicio` + `dataFim` - Transações do período

#### `POST /api/dashboard/caixa`
Criar nova transação
- **Body**: Dados da transação

### **Upload Excel** - `/api/dashboard/caixa/upload`

#### `POST /api/dashboard/caixa/upload`
Upload de ficheiros Excel
- **Content-Type**: `multipart/form-data`
- **Form Data**:
  - `file` - Ficheiro Excel
  - `parqueId` - ID do parque
  - `tipo` - "caixa" ou "entregas"

**Exemplo Excel Caixa:**
```
| Matrícula | Valor | Método        | Observações |
|-----------|-------|---------------|-------------|
| 12-AB-34  | 45.50 | multibanco    | Pagamento ok|
| 56-CD-78  | 32.00 | numerario     | Troco dado  |
```

**Exemplo Excel Entregas:**
```
| Matrícula | Data Entrega          | Observações     |
|-----------|-----------------------|-----------------|
| 12-AB-34  | 2025-05-31T15:30:00   | Entrega normal  |
| 56-CD-78  | 2025-05-31T16:00:00   | Cliente atrasado|
```

---

## 👥 **Ferramentas APIs (RH)**

### **Colaboradores** - `/api/ferramentas/rh/colaboradores`

#### `GET /api/ferramentas/rh/colaboradores`
Listar colaboradores
- **Permissões**: admin, rh_manager, rh_user

#### `POST /api/ferramentas/rh/colaboradores`
Criar colaborador
- **Body**: Dados do colaborador

---

## 🔄 **Sincronização**

### **Parques** - `/api/sync/parques`

#### `POST /api/sync/parques`
Sincronizar parques entre as duas bases
- **Permissões**: admin apenas
- **Headers**: `x-user-role: admin`

---

## 🎯 **Dashboard Unificado**

### **Dados Agregados** - `/api/unified/dashboard`

#### `GET /api/unified/dashboard?parqueId=<id>`
Dashboard com dados de ambas as bases
- **Response**:
```json
{
  "success": true,
  "data": {
    "reservasHoje": [...],
    "ocupacao": {...},
    "colaboradores": [...],
    "campanhas": [...],
    "transacoesCaixa": [...],
    "estatisticas": {
      "totalReservas": 25,
      "totalTransacoes": 18,
      "totalColaboradores": 12
    }
  }
}
```

---

## 🏥 **Health Check**

### **Status Sistema** - `/api/health`

#### `GET /api/health`
Verificar estado das conexões
- **Response**:
```json
{
  "status": "healthy",
  "checks": {
    "dashboard": true,
    "ferramentas": true
  },
  "version": "2.0.0"
}
```

---

## 🚨 **Códigos de Erro**

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Erro nos dados enviados |
| 401 | Token inválido ou em falta |
| 403 | Sem permissões |
| 405 | Método não permitido |
| 500 | Erro interno do servidor |
| 503 | Serviço indisponível |

---

## 📝 **Formato de Response**

### **Sucesso**
```json
{
  "success": true,
  "data": {...},
  "count": 10,
  "timestamp": "2025-05-31T16:30:00Z"
}
```

### **Erro**
```json
{
  "error": "Descrição do erro",
  "details": {...}  // Apenas em desenvolvimento
}
```

---

## 🔧 **Como usar**

### **1. Obter Token**
```javascript
const { data } = await supabase.auth.signInWithPassword({
  email: 'user@multipark.com',
  password: 'password'
});
const token = data.session.access_token;
```

### **2. Fazer Request**
```javascript
const response = await fetch('/api/dashboard/reservas', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const result = await response.json();
```

### **3. Upload Excel**
```javascript
const formData = new FormData();
formData.append('file', file);
formData.append('parqueId', 'lisboa');
formData.append('tipo', 'caixa');

const response = await fetch('/api/dashboard/caixa/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

---

## 🎯 **Próximos Passos**

1. ✅ APIs básicas criadas
2. 🔄 Adicionar mais endpoints específicos
3. 📱 Criar React hooks para consumo
4. 🧪 Testes automatizados
5. 📋 Validação com Zod
6. 🚀 Deploy e monitorização