# 🔑 Credenciais para Configurar no Vercel

## 📋 Environment Variables para Adicionar

**Vai ao Vercel Dashboard → Projeto → Settings → Environment Variables**

### 🗄️ **Supabase (Base de Dados Principal)**
```
NEXT_PUBLIC_SUPABASE_URL = https://ioftqsvjqwjeprsckeym.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvZnRxc3ZqcXdqZXByc2NrZXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNTYwNzQsImV4cCI6MjA2MjczMjA3NH0.TXDfhioMFVNxLhjKgpXAxnKCPOl5n8QWpOkX2eafbYw
```

### 🔥 **Firebase (Dados Existentes)**
```
NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_PROJECT_ID = admin-multipark
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = admin-multipark.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL = https://admin-multipark-default-rtdb.europe-west1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = admin-multipark.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 123456789012
NEXT_PUBLIC_FIREBASE_APP_ID = 1:123456789012:web:abcdefghijklmnop
```

### 🔐 **Firebase Admin (Opcional - Para Acesso Total)**
```
FIREBASE_SERVICE_ACCOUNT_KEY = {"type":"service_account","project_id":"admin-multipark",...}
```

## 🚀 Como Configurar

### **Método 1: Interface Web (Recomendado)**
1. Vai a https://vercel.com/dashboard
2. Encontra o projeto `dashbord-multipark`
3. **Settings** → **Environment Variables**
4. **Add New** para cada variável acima
5. **Save** e **Redeploy**

### **Método 2: Vercel CLI**
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
# ... etc
```

## 🔍 **Como Verificar se Funcionou**

Depois de configurar:
1. **Redeploy** o projeto no Vercel
2. Vai a https://dashbord-multipark.vercel.app/
3. **Entra como Demo**
4. Vai a **Reservas** → Deve carregar dados reais
5. Vai a **Caixa** → Deve mostrar transações

## ⚠️ **Notas Importantes**

- **Supabase**: Dados principais e novos registos
- **Firebase**: Dados históricos existentes (milhares de reservas)
- **Sincronização**: O sistema usa ambos automaticamente
- **Performance**: Firebase para leitura, Supabase para escrita

## 🐛 **Se Não Funcionar**

1. **Verifica logs**: Vercel Dashboard → Deployments → View Function Logs
2. **Testa localmente**: 
   ```bash
   cp CREDENCIAIS_VERCEL.md .env.local
   # Edita .env.local com as credenciais
   pnpm dev
   ```
3. **Redeploy**: Force redeploy no Vercel

## 📊 **Dados Esperados**

Com as credenciais corretas deves ver:
- **~2000+ reservas** do Firebase
- **Estatísticas reais** de Lisboa/Porto
- **Filtros funcionais** por estado/parque
- **Pesquisa ativa** por matrícula/cliente

---

**🎯 Objetivo**: Ter os dados reais a aparecer no dashboard online!
