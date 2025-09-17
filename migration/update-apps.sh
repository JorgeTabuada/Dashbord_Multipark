#!/bin/bash
# 🔄 Script para atualizar todas as apps com a nova estrutura de tabelas

echo "🚀 Iniciando atualização das apps..."

# Lista de ficheiros a atualizar
FILES=(
    "app/reservas/page.tsx"
    "app/reservas-externas/page.tsx"
    "app/operacoes/page.tsx"
    "app/sync/page.tsx"
    "lib/supabase.ts"
    "lib/sync-utils.ts"
)

# Backup primeiro
echo "📦 Criando backup..."
cp -r app app.backup.$(date +%Y%m%d_%H%M%S)

echo "🔧 Atualizando ficheiros..."

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✏️ Atualizando $file..."
        
        # Substituir nomes de tabelas
        sed -i 's/reservations/reservas/g' "$file"
        
        # Substituir campos antigos pelos novos
        sed -i 's/firebase_id/booking_id/g' "$file"
        sed -i 's/client_first_name/name_cliente/g' "$file"
        sed -i 's/client_last_name/lastname_cliente/g' "$file"
        sed -i 's/client_email/email_cliente/g' "$file"
        sed -i 's/client_phone/phone_number_cliente/g' "$file"
        sed -i 's/city/cidade_cliente/g' "$file"
        sed -i 's/status/estado_reserva_atual/g' "$file"
        sed -i 's/check_in_datetime/check_in_previsto/g' "$file"
        sed -i 's/check_out_datetime/check_out_previsto/g' "$file"
        sed -i 's/park_id/parque_id/g' "$file"
        sed -i 's/created_at/created_at_db/g' "$file"
        sed -i 's/updated_at/updated_at_db/g' "$file"
    fi
done

echo "✅ Atualização concluída!"
echo "🔍 Verifica os ficheiros e testa a aplicação"
