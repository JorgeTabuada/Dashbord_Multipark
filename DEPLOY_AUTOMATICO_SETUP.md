# 🚀 Setup de Deploy Automático GitHub → Vercel

## ✅ O que foi configurado

Criei uma **GitHub Action** que faz deploy automático para o Vercel sempre que fizeres push para a branch `main`.

## 🔧 Como configurar (só precisas fazer uma vez)

### 1. **Criar projeto no Vercel**
1. Vai a https://vercel.com/new
2. Importa o repositório `JorgeTabuada/Dashbord_Multipark`
3. Configura as environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`

### 2. **Obter tokens do Vercel**
1. Vai a https://vercel.com/account/tokens
2. Cria um novo token (guarda-o)
3. Vai às settings do projeto no Vercel
4. Copia o **Project ID** e **Org ID**

### 3. **Configurar secrets no GitHub**
1. Vai ao repositório no GitHub
2. Settings → Secrets and variables → Actions
3. Adiciona estes secrets:
   - `VERCEL_TOKEN` (o token que criaste)
   - `VERCEL_PROJECT_ID` (do projeto Vercel)
   - `VERCEL_ORG_ID` (da organização Vercel)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`

## 🎯 Como funciona

1. **Push para main** → GitHub Action ativa
2. **Build automático** → Testa se o código compila
3. **Deploy para Vercel** → Publica automaticamente
4. **URL disponível** → Recebes o link do site

## 📱 Alternativa Simples (Recomendada)

Se preferires algo mais simples:

1. **Conecta o repositório diretamente no Vercel**:
   - Vai a https://vercel.com/new
   - Escolhe "Import Git Repository"
   - Seleciona `JorgeTabuada/Dashbord_Multipark`
   - Configura as environment variables
   - Deploy automático fica ativo!

2. **Cada push para main** faz deploy automático

## 🔗 Links úteis

- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Actions**: https://github.com/JorgeTabuada/Dashbord_Multipark/actions
- **Documentação Vercel**: https://vercel.com/docs

---

**Nota**: Depois de configurares uma vez, todos os pushes futuros fazem deploy automático! 🎉
