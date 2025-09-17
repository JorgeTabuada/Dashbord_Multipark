#!/bin/bash

# Script para configurar assinatura GPG no Git
echo "🔑 Configurando assinatura GPG para commits..."

# Gerar nova chave GPG
echo "Gerando nova chave GPG..."
gpg --full-generate-key

# Listar chaves GPG
echo "Chaves GPG disponíveis:"
gpg --list-secret-keys --keyid-format=long

echo ""
echo "📋 Copia o ID da chave (linha que começa com 'sec') e executa:"
echo "git config --global user.signingkey [KEY_ID]"
echo "git config --global commit.gpgsign true"
echo ""
echo "🚀 Depois exporta a chave pública para adicionar ao GitHub:"
echo "gpg --armor --export [KEY_ID]"
echo ""
echo "📖 Vai a GitHub.com > Settings > SSH and GPG keys > New GPG key"
