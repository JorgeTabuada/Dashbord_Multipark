-- SCRIPT COMPLETO PARA CORRIGIR ERROS DE SINCRONIZAÇÃO
-- Execute TODO este script no Supabase SQL Editor de uma vez

-- PASSO 1: Remover views que impedem alteração
DROP VIEW IF EXISTS reservas_with_id CASCADE;
DROP VIEW IF EXISTS v_reservas_sync CASCADE;
DROP VIEW IF EXISTS v_sync_status CASCADE;

-- PASSO 2: Alterar TODOS os campos para TEXT (sem limite de tamanho)
ALTER TABLE public.reservas 
ALTER COLUMN booking_id TYPE TEXT,
ALTER COLUMN license_plate TYPE TEXT,
ALTER COLUMN estado_reserva_atual TYPE TEXT,
ALTER COLUMN parque_id TYPE TEXT,
ALTER COLUMN cidade_cliente TYPE TEXT,
ALTER COLUMN payment_method TYPE TEXT,
ALTER COLUMN payment_intent_id TYPE TEXT,
ALTER COLUMN nif_cliente TYPE TEXT,
ALTER COLUMN parking_type TYPE TEXT,
ALTER COLUMN name_cliente TYPE TEXT,
ALTER COLUMN lastname_cliente TYPE TEXT,
ALTER COLUMN email_cliente TYPE TEXT,
ALTER COLUMN phone_number_cliente TYPE TEXT,
ALTER COLUMN nome_fiscal_cliente TYPE TEXT;

-- PASSO 3: Adicionar campos necessários para sincronização
ALTER TABLE public.reservas 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS car_info TEXT,
ADD COLUMN IF NOT EXISTS car_location TEXT,
ADD COLUMN IF NOT EXISTS park_name TEXT,
ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'synced',
ADD COLUMN IF NOT EXISTS sync_errors JSONB,
ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMP WITH TIME ZONE;

-- PASSO 4: Recriar views necessárias
CREATE VIEW reservas_with_id AS
SELECT 
    *,
    COALESCE(id_pk::text, booking_id, '') as unique_id
FROM public.reservas;

-- PASSO 5: Verificar se funcionou
SELECT '✅ Script executado com sucesso!' as resultado;
