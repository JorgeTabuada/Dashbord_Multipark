# 🚀 Deploy no Vercel - Guia Completo

## ⚠️ IMPORTANTE - Configurar Environment Variables

**No Vercel Dashboard:**

1. Vai ao teu projeto no Vercel
2. **Settings → Environment Variables**
3. Adiciona estas variáveis:

```
NEXT_PUBLIC_SUPABASE_URL = https://ioftqsvjqwjeprsckeym.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvZnRxc3ZqcXdqZXByc2NrZXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNTYwNzQsImV4cCI6MjA2MjczMjA3NH0.TXDfhioMFVNxLhjKgpXAxnKCPOl5n8QWpOkX2eafbYw
```

## 🔧 Problemas Resolvidos

✅ **Supabase version fixed** (`^2.48.0` em vez de `latest`)
✅ **Build commands otimizados** 
✅ **Environment variables configuradas corretamente**
✅ **Framework definido como Next.js**

## 🎯 Como Fazer Deploy

1. **Conecta o repositório** no Vercel Dashboard
2. **Adiciona as environment variables** (passo acima)
3. **Deploy automático** acontece quando fazes push

## 🐛 Se continuar a dar erro:

1. Verifica se as env vars estão corretas no Vercel
2. Vai a **Deployments** e vê o log de erro específico
3. Tenta fazer **Redeploy** do último commit

## 📱 Teste Local
```bash
cp .env.example .env.local
# Edita .env.local com as tuas credenciais
pnpm dev
```

---
**Nota**: O `.env.local` foi removido do git por segurança. As credenciais agora só ficam no Vercel.
