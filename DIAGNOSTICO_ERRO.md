# 🔍 Diagnóstico do Erro "Function Runtimes must have a valid version"

## 📋 Resumo do Problema

O repositório **Dashbord_Multipark** está a apresentar o erro:
```
Error: Function Runtimes must have a valid version, for example `now-php@1.0.0`.
```

## 🔎 Análise da Configuração Atual

### Ficheiro `vercel.json` (Problemático)
```json
{
  "buildCommand": "pnpm install --no-frozen-lockfile && pnpm build",
  "installCommand": "pnpm install --no-frozen-lockfile",
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "nodejs20.x"
    }
  },
  "git": {
    "deploymentEnabled": {
      "main": true
    }
  }
}
```

### Estrutura do Projeto
- **Framework**: Next.js 15.2.4
- **Runtime**: Node.js (React 19, TypeScript)
- **APIs**: 22 ficheiros de API em `app/api/`
- **Dependências**: Supabase, Firebase, Radix UI, etc.

## 🚨 Causa Raiz do Problema

Baseado na investigação da comunidade Vercel, o problema ocorre porque:

1. **Sintaxe Incorreta**: A sintaxe `"runtime": "nodejs20.x"` no `vercel.json` não é válida
2. **Conflito de Versões**: O Vercel está a interpretar a configuração como v1 em vez de v2
3. **Redundância**: Para aplicações Next.js, o `vercel.json` é opcional e pode causar conflitos

## 💡 Soluções Identificadas

### Solução 1: Remover Runtime do vercel.json (Recomendada)
- Remover a secção `functions` do `vercel.json`
- Usar apenas o `package.json` para definir a versão do Node.js

### Solução 2: Usar engines no package.json
- Adicionar campo `engines` no `package.json`
- Especificar a versão do Node.js de forma padrão

### Solução 3: Simplificar vercel.json
- Manter apenas configurações essenciais
- Remover configurações redundantes para Next.js

## 📊 Impacto
- **Severidade**: Alta (bloqueia deployment)
- **Urgência**: Alta (aplicação não consegue ser deployada)
- **Complexidade da Fix**: Baixa (alteração simples de configuração)
