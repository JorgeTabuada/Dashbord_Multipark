# 🧪 **Guia de Testes - APIs Multipark**

Como testar se as APIs estão a funcionar corretamente.

## 🚀 **Setup Inicial**

### 1. Configurar Environment Variables
Cria o ficheiro `.env.local` na raiz do projeto:

```bash
# Copia o template
cp .env.example .env.local
```

Edita `.env.local` com as chaves reais do Supabase:
```env
# Dashboard Multipark (Base Operacional)
NEXT_PUBLIC_SUPABASE_DASHBOARD_URL=https://ioftqsvjqwjeprsckeym.supabase.co
NEXT_PUBLIC_SUPABASE_DASHBOARD_ANON_KEY=sua-chave-anon-dashboard
SUPABASE_DASHBOARD_SERVICE_ROLE_KEY=sua-chave-service-dashboard

# Ferramentas Multipark (Base RH e Analytics)
NEXT_PUBLIC_SUPABASE_FERRAMENTAS_URL=https://dzdeewebxsfxeabdxtiq.supabase.co
NEXT_PUBLIC_SUPABASE_FERRAMENTAS_ANON_KEY=sua-chave-anon-ferramentas
SUPABASE_FERRAMENTAS_SERVICE_ROLE_KEY=sua-chave-service-ferramentas
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Iniciar o Servidor
```bash
npm run dev
```

---

## 🔍 **Executar Testes**

### **Teste Rápido - Health Check**
```bash
# Terminal 1: Servidor rodando
npm run dev

# Terminal 2: Teste básico
curl http://localhost:3000/api/health
```

**Resposta esperada:**
```json
{
  "status": "healthy",
  "checks": {
    "dashboard": true,
    "ferramentas": true
  },
  "version": "2.0.0",
  "environment": "development"
}
```

### **Testes Automatizados**

#### 1. Teste Geral das APIs
```bash
npm run test:apis
```

**O que testa:**
- ✅ Health check
- ✅ Segurança (401 sem token)
- ✅ Métodos não permitidos (405)
- ✅ Estrutura de resposta
- ✅ Permissões de admin

#### 2. Teste Específico Excel Upload
```bash
npm run test:excel
```

**O que testa:**
- ✅ Estrutura dos ficheiros Excel
- ✅ Validação dos dados
- ✅ Segurança da API de upload
- ✅ Validações de input

#### 3. Todos os Testes
```bash
npm run test:all
```

---

## 🎯 **Testes Manuais**

### **1. Testar Health Check**
```bash
curl -X GET http://localhost:3000/api/health
```

### **2. Testar Segurança (deve dar 401)**
```bash
curl -X GET http://localhost:3000/api/dashboard/reservas
curl -X GET http://localhost:3000/api/ferramentas/rh/colaboradores
```

### **3. Testar Métodos Não Permitidos (deve dar 405)**
```bash
curl -X POST http://localhost:3000/api/health
curl -X DELETE http://localhost:3000/api/unified/dashboard
```

### **4. Testar Upload sem Autenticação (deve dar 401)**
```bash
curl -X POST http://localhost:3000/api/dashboard/caixa/upload \
  -F "file=@test.xlsx" \
  -F "parqueId=lisboa" \
  -F "tipo=caixa"
```

---

## 🔧 **Testes com Autenticação Real**

### **1. Obter Token de Autenticação**

No browser, vai para `http://localhost:3000` e faz login. Depois, no console:

```javascript
// Obter token atual
const token = (await supabase.auth.getSession()).data.session?.access_token;
console.log('Token:', token);
```

### **2. Testar APIs com Token**

```bash
# Substitui YOUR_TOKEN pelo token obtido
TOKEN="YOUR_TOKEN_AQUI"

# Testar perfil do utilizador
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"

# Testar dashboard unificado
curl -X GET "http://localhost:3000/api/unified/dashboard?parqueId=lisboa" \
  -H "Authorization: Bearer $TOKEN"

# Testar reservas
curl -X GET "http://localhost:3000/api/dashboard/reservas?parqueId=lisboa" \
  -H "Authorization: Bearer $TOKEN"
```

### **3. Testar Upload de Excel**

```bash
# Upload para caixa
curl -X POST http://localhost:3000/api/dashboard/caixa/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@caixa30_05_2025.xlsx" \
  -F "parqueId=lisboa" \
  -F "tipo=caixa"

# Upload para entregas
curl -X POST http://localhost:3000/api/dashboard/caixa/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@entregas30_05_2025.xlsx" \
  -F "parqueId=lisboa" \
  -F "tipo=entregas"
```

---

## 📊 **Monitorização Durante os Testes**

### **1. Logs do Servidor**
No terminal onde tens `npm run dev`, vês:
```
✓ Ready in 2.3s
○ Local:    http://localhost:3000
○ Network:  http://192.168.1.100:3000

# Logs das APIs aparecem aqui
```

### **2. Logs das Bases de Dados**
Vai aos dashboards do Supabase:
- [Dashboard Multipark](https://supabase.com/dashboard/project/ioftqsvjqwjeprsckeym)
- [Ferramentas Multipark](https://supabase.com/dashboard/project/dzdeewebxsfxeabdxtiq)

Verifica logs em **Logs & queries** para ver se as queries estão a funcionar.

---

## 🚨 **Problemas Comuns e Soluções**

### **Error: Variables de ambiente em falta**
```
❌ Erro: Variáveis de ambiente em falta: NEXT_PUBLIC_SUPABASE_DASHBOARD_URL
```
**Solução:** Verifica se o `.env.local` está configurado corretamente.

### **Error: CORS / Network**
```
❌ Network Error: fetch failed
```
**Solução:** Confirma se o servidor está a correr em `http://localhost:3000`.

### **Error: 401 Unauthorized**
```json
{"error": "Token de autorização obrigatório"}
```
**Solução:** Normal para APIs protegidas. Usa um token válido.

### **Error: Connection refused**
```
❌ conexão recusada ao servidor
```
**Solução:** Verifica se as chaves do Supabase estão corretas.

### **Error: 403 Forbidden**
```json
{"error": "Acesso negado - Sem permissões RH"}
```
**Solução:** Normal. O utilizador não tem as permissões necessárias.

---

## ✅ **Resultados Esperados**

### **Se tudo estiver a funcionar:**
```
🚀 Iniciando testes das APIs Multipark...
==========================================

📊 1. Testando Health Check
ℹ️  Testing: GET /api/health
✅ /api/health - Status: 200
ℹ️  Bases conectadas: Dashboard=true, Ferramentas=true

🔐 2. Testando Segurança (deve dar 401)
✅ /api/dashboard/reservas - Segurança OK (401 sem token)
✅ /api/dashboard/caixa - Segurança OK (401 sem token)
✅ /api/ferramentas/rh/colaboradores - Segurança OK (401 sem token)

📋 RESUMO DOS TESTES
==================
Total de testes: 15
✅ Testes passaram: 15
Taxa de sucesso: 100.0% 🎉

✨ Sistema parece estar funcionando bem!
```

### **Se houver problemas:**
```
❌ /api/health - Status: 500 - Erro interno do servidor
❌ Bases conectadas: Dashboard=false, Ferramentas=false
⚠️  Taxa de sucesso: 60.0% ⚠️
🔧 Sistema funcional mas precisa de ajustes
```

---

## 🎯 **Próximos Passos Após Testes**

### **Se os testes passaram (>90%):**
1. ✅ **Integrar com app Caixa existente**
2. ✅ **Criar React hooks para consumo**
3. ✅ **Deploy para produção**

### **Se os testes falharam (< 70%):**
1. 🔧 **Verificar configurações Supabase**
2. 🔧 **Corrigir erros específicos**
3. 🔧 **Validar structure da base de dados**

---

## 📞 **Como Reportar Problemas**

Se encontrares erros, guarda:

1. **Output completo dos testes**
2. **Logs do servidor (`npm run dev`)**
3. **Configuração do `.env.local` (sem as chaves)**
4. **Erro específico que aparecer**

Assim posso ajudar-te a resolver rapidamente! 🚀