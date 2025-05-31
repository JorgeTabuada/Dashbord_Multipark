# 🚀 **Dashboard Multipark v2.0**

Sistema unificado de gestão multi-database para operações de parques de estacionamento em Portugal.

## 🏗️ **Arquitetura Multi-Database**

```
📊 Dashboard Multipark (Operacional)
├── Reservas & Check-ins
├── Caixa & Transações
├── Movimentações de Veículos
└── Gestão Operacional

👥 Ferramentas Multipark (RH & Analytics)  
├── Recursos Humanos
├── Formação & Conhecimento
├── Auditoria & Qualidade
└── Marketing & Analytics
```

---

## ✨ **Funcionalidades**

### **🎯 APIs Implementadas**
- ✅ **Reservas** - CRUD completo com filtros avançados
- ✅ **Caixa** - Transações e sessões diárias
- ✅ **Upload Excel** - Processamento automático dos 3 ficheiros da caixa
- ✅ **RH Colaboradores** - Gestão de recursos humanos
- ✅ **Dashboard Unificado** - Dados agregados de ambas as bases
- ✅ **Sincronização** - Manter parques alinhados entre bases
- ✅ **Autenticação** - Sistema cross-database com permissões

### **🛡️ Segurança**
- 🔐 Autenticação JWT com Supabase
- 🛂 Middleware de permissões por rota
- 🏗️ Row Level Security (RLS) ativo
- 📝 Logs de auditoria

### **📤 Upload de Ficheiros**
- 📊 **Caixa Excel** - Transações de pagamento
- 🚗 **Entregas Excel** - Registos de entrega de veículos  
- 📋 **Sale Booking** - Reservas importadas
- ✅ Validação automática e mapeamento de campos

---

## 🚀 **Quick Start**

### **1. Clone & Install**
```bash
git clone https://github.com/JorgeTabuada/Dashbord_Multipark.git
cd Dashbord_Multipark
npm install
```

### **2. Configure Environment**
```bash
cp .env.example .env.local
# Edita .env.local com as chaves do Supabase
```

### **3. Start Development**
```bash
npm run dev
# → http://localhost:3000
```

### **4. Test APIs**
```bash
# Teste básico
npm run test:apis

# Teste upload Excel
npm run test:excel

# Todos os testes
npm run test:all
```

---

## 📊 **Bases de Dados**

### **Dashboard Multipark** 
`https://ioftqsvjqwjeprsckeym.supabase.co`
- **Foco**: Operações diárias do negócio
- **Tabelas**: `reservas`, `caixa_transacoes`, `movimentacoes_veiculos`

### **Ferramentas Multipark**
`https://dzdeewebxsfxeabdxtiq.supabase.co`  
- **Foco**: RH, formação e analytics
- **Tabelas**: `rh_colaboradores`, `formacao_conteudos`, `auditoria_sessoes`

---

## 🔌 **APIs Disponíveis**

### **Operacionais (Dashboard)**
```bash
GET    /api/dashboard/reservas        # Listar reservas
POST   /api/dashboard/reservas        # Criar reserva
PUT    /api/dashboard/reservas?id=X   # Atualizar reserva

GET    /api/dashboard/caixa           # Transações/Sessões
POST   /api/dashboard/caixa           # Nova transação

POST   /api/dashboard/caixa/upload    # Upload Excel
```

### **RH & Analytics (Ferramentas)**
```bash
GET    /api/ferramentas/rh/colaboradores  # Listar colaboradores  
POST   /api/ferramentas/rh/colaboradores  # Criar colaborador
```

### **Sistema**
```bash
GET    /api/health                    # Health check
GET    /api/unified/dashboard         # Dashboard unificado
GET    /api/auth/profile              # Perfil utilizador
POST   /api/sync/parques              # Sincronizar parques
```

---

## 📤 **Como Usar Upload Excel**

### **Formato Excel Caixa**
```
| Matrícula | Valor | Método     | Observações |
|-----------|-------|------------|-------------|
| 12-AB-34  | 45.50 | multibanco | Pagamento ok|
| 56-CD-78  | 32.00 | numerario  | Troco dado  |
```

### **Formato Excel Entregas**
```
| Matrícula | Data Entrega        | Observações     |
|-----------|---------------------|-----------------|
| 12-AB-34  | 2025-05-31T15:30:00 | Entrega normal  |
| 56-CD-78  | 2025-05-31T16:00:00 | Cliente atrasado|
```

### **Upload via API**
```bash
curl -X POST http://localhost:3000/api/dashboard/caixa/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@caixa30_05_2025.xlsx" \
  -F "parqueId=lisboa" \
  -F "tipo=caixa"
```

---

## 🧪 **Testes**

### **Scripts Disponíveis**
```bash
npm run test:apis     # Testa todas as APIs (segurança, endpoints)
npm run test:excel    # Testa upload de Excel (validação, estrutura) 
npm run test:all      # Executa todos os testes
npm run type-check    # Verificação TypeScript
```

### **Health Check Rápido**
```bash
curl http://localhost:3000/api/health
```

**Resposta esperada:**
```json
{
  "status": "healthy",
  "checks": { "dashboard": true, "ferramentas": true },
  "version": "2.0.0"
}
```

---

## 📁 **Estrutura do Projeto**

```
📁 Dashbord_Multipark/
├── 📁 pages/api/              # Next.js API routes
│   ├── 📁 dashboard/          # APIs base operacional  
│   ├── 📁 ferramentas/        # APIs base RH
│   ├── 📁 unified/            # APIs cross-database
│   └── 📁 sync/               # Sincronização
├── 📁 lib/
│   ├── 📁 supabase/           # Configuração multi-database
│   └── 📁 services/           # Database service layer
├── 📁 scripts/                # Scripts de teste
├── 📁 docs/                   # Documentação
├── middleware.ts              # Auth middleware
└── Legacy HTML files          # Dashboard HTML original
```

---

## 🔧 **Configuração**

### **Environment Variables**
```bash
# Dashboard (Operacional)
NEXT_PUBLIC_SUPABASE_DASHBOARD_URL=https://ioftqsvjqwjeprsckeym.supabase.co
NEXT_PUBLIC_SUPABASE_DASHBOARD_ANON_KEY=...
SUPABASE_DASHBOARD_SERVICE_ROLE_KEY=...

# Ferramentas (RH)  
NEXT_PUBLIC_SUPABASE_FERRAMENTAS_URL=https://dzdeewebxsfxeabdxtiq.supabase.co
NEXT_PUBLIC_SUPABASE_FERRAMENTAS_ANON_KEY=...
SUPABASE_FERRAMENTAS_SERVICE_ROLE_KEY=...
```

### **Como obter as chaves:**
1. [Dashboard Settings](https://supabase.com/dashboard/project/ioftqsvjqwjeprsckeym/settings/api)
2. [Ferramentas Settings](https://supabase.com/dashboard/project/dzdeewebxsfxeabdxtiq/settings/api)

---

## 🚀 **Deploy**

### **Vercel (Recomendado)**
```bash
# Configura as environment variables no Vercel
vercel env add NEXT_PUBLIC_SUPABASE_DASHBOARD_URL
vercel env add NEXT_PUBLIC_SUPABASE_DASHBOARD_ANON_KEY
# ... etc

# Deploy
vercel --prod
```

### **Docker**
```bash
docker build -t multipark-dashboard .
docker run -p 3000:3000 multipark-dashboard
```

---

## 📚 **Documentação**

- 📖 [**API Documentation**](docs/API_DOCS.md) - Referência completa das APIs
- 🧪 [**Testing Guide**](docs/TESTING_GUIDE.md) - Como testar tudo
- 🗄️ [**Database Analysis**](database_analysis.md) - Análise das duas bases

---

## 🎯 **Roadmap**

### **✅ Fase 1 - APIs Foundation (Concluída)**
- ✅ Estrutura multi-database
- ✅ APIs CRUD básicas  
- ✅ Sistema de autenticação
- ✅ Upload de ficheiros Excel
- ✅ Testes automatizados

### **🔄 Fase 2 - Frontend Integration (Em Curso)**
- 🔄 React hooks para consumo das APIs
- 🔄 Migração dashboard HTML para Next.js
- 🔄 Integração com app Caixa existente

### **📋 Fase 3 - Advanced Features**
- 📋 Real-time subscriptions
- 📋 Advanced analytics
- 📋 Mobile app integration
- 📋 Automated reporting

---

## 🤝 **Contribuição**

1. Fork o projeto
2. Cria branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'Adicionar nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Pull Request

---

## 📞 **Suporte**

- **Autor**: Jorge Tabuada  
- **Email**: jorgetabuada@airpark.pt
- **GitHub**: [@JorgeTabuada](https://github.com/JorgeTabuada)

---

## 📄 **Licença**

MIT License - vê [LICENSE](LICENSE) para detalhes.

---

**🎉 Sistema pronto para usar! Basta configurar as environment variables e começar a testar! 🚀**