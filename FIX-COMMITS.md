# 🔧 Fix para Commits Não Assinados no Vercel

## Problema
O erro "commit não assinado" no Vercel acontece porque os commits não têm assinatura GPG.

## ⚡ Soluções Rápidas

### Opção 1: Configurar GPG (Recomendado)
1. Executa o script: `chmod +x setup-gpg.sh && ./setup-gpg.sh`
2. Segue as instruções para gerar e configurar a chave GPG
3. Adiciona a chave pública no GitHub

### Opção 2: Usar SSH Signing (Mais Simples)
```bash
# Se já tens SSH configurado
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_rsa.pub  # ou a tua chave SSH
git config --global commit.gpgsign true
```

### Opção 3: Reconfigurar Vercel
O `vercel.json` foi atualizado para tentar contornar este problema.

## 🚀 Teste
Após configurar, faz um commit de teste:
```bash
git commit --amend --no-edit -S  # assina o último commit
git push --force-with-lease
```

## 📖 Links Úteis
- [GitHub GPG Setup](https://docs.github.com/en/authentication/managing-commit-signature-verification)
- [Vercel Git Integration](https://vercel.com/docs/git)
