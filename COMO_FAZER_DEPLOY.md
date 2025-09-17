# 🚀 Como Fazer Deploy no Vercel (Método Simples)

## 📋 Passos para Deploy

### 1. **Aceder ao Vercel**
- Vai a: https://vercel.com/new
- Faz login (GitHub, Google ou email)

### 2. **Importar o Repositório**
- Clica em "Import Git Repository"
- Procura por: `JorgeTabuada/Dashbord_Multipark`
- Clica em "Import"

### 3. **Configurar o Projeto**
- **Project Name**: `dashbord-multipark` (ou o que quiseres)
- **Framework Preset**: Next.js (deve detetar automaticamente)
- **Root Directory**: `./` (deixar como está)

### 4. **Environment Variables (Importante!)**
Adiciona estas variáveis:

```
NEXT_PUBLIC_SUPABASE_URL=https://teu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tua-chave-anonima
NEXT_PUBLIC_FIREBASE_API_KEY=tua-api-key-firebase
NEXT_PUBLIC_FIREBASE_PROJECT_ID=teu-projeto-firebase
```

### 5. **Deploy**
- Clica em "Deploy"
- Aguarda 2-3 minutos
- ✅ Site online!

## 🔄 Deploy Automático

Depois de configurares uma vez:
- **Cada push para `main`** → Deploy automático
- **Cada pull request** → Preview deploy
- **Rollback fácil** → Se algo correr mal

## 🌐 URLs do Projeto

Depois do deploy vais ter:
- **URL de produção**: `https://dashbord-multipark.vercel.app`
- **URL de preview**: Para cada branch/PR
- **Dashboard**: https://vercel.com/dashboard

## ⚡ Vantagens

✅ **Deploy em 2-3 minutos**  
✅ **SSL automático** (HTTPS)  
✅ **CDN global** (site rápido em todo o mundo)  
✅ **Deploy automático** (push → site atualizado)  
✅ **Preview de branches** (testar antes de publicar)  
✅ **Rollback instantâneo** (voltar versão anterior)  

## 🆘 Se der erro

1. **Build Error**: Verifica se o projeto compila localmente (`pnpm build`)
2. **Environment Variables**: Confirma se estão todas configuradas
3. **Node Version**: Usa Node.js 20+ (já configurado no `package.json`)

## 📞 Suporte

- **Vercel Docs**: https://vercel.com/docs
- **Status**: https://vercel-status.com
- **Community**: https://github.com/vercel/vercel/discussions

---

**🎯 Resultado**: Site online em poucos minutos com deploy automático! 🚀
