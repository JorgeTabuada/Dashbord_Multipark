# Dashboard Multipark - Sistema Multi-Database

Dashboard moderno integrado com duas bases de dados Supabase para gestão completa da Multipark.

## 🎯 Sistema Híbrido

Este repositório contém **duas versões** que coexistem:

### 📱 **Versão HTML Atual** (Mantida)
- ✅ Todos os ficheiros `.html` existentes funcionam normalmente
- ✅ Acesso direto via browser
- ✅ Sistema JavaScript vanilla
- 📁 Localização: ficheiros raiz (ex: `index.html`, `reservas.html`)

### 🚀 **Nova Versão React/Next.js** (Multi-Database)
- ✅ Integração com 2 bases Supabase
- ✅ Autenticação unificada
- ✅ APIs modernas
- ✅ Sistema de componentes React
- 📁 Localização: estrutura Next.js

---

## 📊 **Bases de Dados Integradas**

### 🏢 **Dashboard Multipark** (Operacional)
- **ID**: `ioftqsvjqwjeprsckeym`
- **URL**: https://ioftqsvjqwjeprsckeym.supabase.co
- **Tabelas**: reservas, parques, caixa, movimentações
- **Foco**: Operações diárias do negócio

### 🛠️ **Ferramentas Multipark** (RH e Analytics)
- **ID**: `dzdeewebxsfxeabdxtiq`  
- **URL**: https://dzdeewebxsfxeabdxtiq.supabase.co
- **Tabelas**: rh_colaboradores, formação, auditoria, mapas
- **Foco**: Recursos humanos e análise

---

## ⚡ **Quick Start - Nova Versão**

### 1. Configurar Environment
```bash
cp .env.example .env.local
# Editar .env.local com as chaves Supabase
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Executar
```bash
npm run dev
# Aceder a http://localhost:3000
```

### 4. Obter Chaves Supabase
- **Dashboard**: https://supabase.com/dashboard/project/ioftqsvjqwjeprsckeym/settings/api
- **Ferramentas**: https://supabase.com/dashboard/project/dzdeewebxsfxeabdxtiq/settings/api

---

## 📁 **Estrutura do Projeto**

```
Dashbord_Multipark/
├── 📄 index.html              # Dashboard HTML atual
├── 📄 reservas.html           # Sistema reservas HTML
├── 📄 *.html                  # Todos os módulos HTML
├── 
├── 📁 lib/                    # Nova versão React
│   ├── supabase/
│   │   ├── config.ts          # Configuração multi-DB
│   │   ├── clients.ts         # Clientes Supabase
│   │   └── types/             # TypeScript types
│   └── services/
│       └── database.service.ts # Serviços unificados
├── 
├── 📁 components/             # React components
├── 📁 pages/                  # Next.js pages & APIs
├── 📁 hooks/                  # Custom React hooks
└── 📁 css/, js/, sql/         # Assets atuais
```

---

## 🔧 **Funcionalidades**

### ✅ **Sistema HTML Atual**
- Dashboard operacional
- Gestão de reservas
- Recursos humanos
- Caixa e faturação
- Todos os módulos existentes

### 🆕 **Nova Integração Multi-Database**
- ✅ Acesso unificado às 2 bases
- ✅ Autenticação sincronizada
- ✅ Dashboard em tempo real
- ✅ APIs REST modernas
- ✅ Hooks React especializados
- ✅ Sync automático entre bases

---

## 🚀 **Deploy**

### Vercel (Recomendado)
```bash
vercel --prod
```

### GitHub Pages (HTML apenas)
Os ficheiros HTML continuam a funcionar via GitHub Pages.

---

## 📈 **Migração Gradual**

1. **Fase 1**: Sistema HTML mantido (✅ Atual)
2. **Fase 2**: Nova versão React em paralelo (🔄 Em desenvolvimento)
3. **Fase 3**: Migração gradual de módulos
4. **Fase 4**: Substituição completa (futuro)

---

## 🔗 **Links Úteis**

- 🌐 **HTML Atual**: Abrir `index.html` no browser
- 🚀 **Nova Versão**: `npm run dev` → http://localhost:3000
- 📊 **Dashboard Supabase**: https://supabase.com/dashboard
- 📚 **Documentação**: Ver ficheiros `/docs/`

---

## 🤝 **Suporte**

- **Repositório**: https://github.com/JorgeTabuada/Dashbord_Multipark
- **Issues**: GitHub Issues
- **Tech Lead**: Jorge Tabuada

---

**🎉 Ambos os sistemas funcionam perfeitamente em paralelo!**