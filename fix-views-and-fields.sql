-- Script para corrigir tamanhos de campos removendo views dependentes
-- Execute este script no Supabase SQL Editor

-- 1. Primeiro, identificar e guardar a definição das views dependentes
-- Vamos salvá-las para recriar depois
DO $$
DECLARE
    view_definition TEXT;
BEGIN
    -- Guardar definição da view se existir
    SELECT pg_get_viewdef('reservas_with_id', true) INTO view_definition;
    RAISE NOTICE 'View definition saved: %', view_definition;
EXCEPTION
    WHEN undefined_table THEN
        RAISE NOTICE 'View reservas_with_id does not exist';
END $$;

-- 2. Remover views que dependem da tabela reservas
DROP VIEW IF EXISTS reservas_with_id CASCADE;
DROP VIEW IF EXISTS v_reservas_sync CASCADE;
DROP VIEW IF EXISTS v_sync_status CASCADE;

-- 3. Agora podemos alterar os campos da tabela
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
ALTER COLUMN car_info TYPE TEXT,
ALTER COLUMN car_location TYPE TEXT,
ALTER COLUMN park_name TYPE TEXT,
ALTER COLUMN name_cliente TYPE TEXT,
ALTER COLUMN lastname_cliente TYPE TEXT,
ALTER COLUMN email_cliente TYPE TEXT,
ALTER COLUMN phone_number_cliente TYPE TEXT,
ALTER COLUMN nome_fiscal_cliente TYPE TEXT;

-- 4. Adicionar campos que podem estar em falta
ALTER TABLE public.reservas 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'synced',
ADD COLUMN IF NOT EXISTS sync_errors JSONB,
ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMP WITH TIME ZONE;

-- 5. Recriar a view reservas_with_id (versão básica)
CREATE OR REPLACE VIEW reservas_with_id AS
SELECT 
    *,
    COALESCE(id_pk::text, booking_id, '') as unique_id
FROM public.reservas;

-- 6. Recriar view de sincronização se necessário
CREATE OR REPLACE VIEW v_reservas_sync AS
SELECT 
  r.*,
  CASE 
    WHEN r.booking_id IS NOT NULL THEN 'synced'
    ELSE 'not_synced'
  END as sync_state
FROM public.reservas r;

-- 7. Criar view de status se não existir
CREATE OR REPLACE VIEW v_sync_status AS
SELECT 
  'reservas' as tabela,
  COUNT(*) as total,
  COUNT(CASE WHEN source = 'firebase_sync' THEN 1 END) as firebase_sync,
  COUNT(CASE WHEN source = 'manual' THEN 1 END) as manual,
  MAX(updated_at_db) as ultima_atualizacao
FROM public.reservas;

-- 8. Verificar resultado
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'reservas'
  AND column_name IN ('booking_id', 'license_plate', 'estado_reserva_atual')
ORDER BY ordinal_position;

-- 9. Testar inserção com ID longo
DO $$
BEGIN
    -- Tentar inserir um registro com ID longo para testar
    INSERT INTO public.reservas (
        booking_id,
        license_plate,
        estado_reserva_atual,
        created_at_db,
        updated_at_db
    ) VALUES (
        '1757087919722955_TEST_' || extract(epoch from now())::text,
        'TEST-99-99',
        'teste_campo_longo_para_verificar_se_funciona',
        NOW(),
        NOW()
    );
    
    -- Se chegou aqui, funcionou! Deletar o teste
    DELETE FROM public.reservas WHERE license_plate = 'TEST-99-99';
    
    RAISE NOTICE '✅ Campos alterados com sucesso! Agora suportam valores longos.';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Erro ao testar: %', SQLERRM;
END $$;

-- 10. Mostrar estatísticas
SELECT 
    'Total de Reservas' as info,
    COUNT(*) as valor
FROM public.reservas
UNION ALL
SELECT 
    'Reservas com booking_id',
    COUNT(*) 
FROM public.reservas 
WHERE booking_id IS NOT NULL
UNION ALL
SELECT 
    'Tamanho máximo de booking_id',
    MAX(LENGTH(booking_id))
FROM public.reservas
WHERE booking_id IS NOT NULL;
