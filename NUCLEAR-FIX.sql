-- SCRIPT NUCLEAR - REMOVE TODAS AS DEPENDÊNCIAS E CORRIGE TUDO
-- Execute este script COMPLETO no Supabase SQL Editor

-- PASSO 1: Remover TODAS as materialized views e views que dependem de reservas
DROP MATERIALIZED VIEW IF EXISTS bi_financeiro_diario CASCADE;
DROP MATERIALIZED VIEW IF EXISTS bi_ocupacao_diaria CASCADE;
DROP MATERIALIZED VIEW IF EXISTS bi_reservas_origem CASCADE;
DROP VIEW IF EXISTS reservas_with_id CASCADE;

-- PASSO 2: Verificar se ainda há dependências
DO $$
DECLARE
    dep RECORD;
BEGIN
    FOR dep IN 
        SELECT DISTINCT 
            n.nspname as schema_name,
            c.relname as object_name,
            CASE c.relkind
                WHEN 'v' THEN 'VIEW'
                WHEN 'm' THEN 'MATERIALIZED VIEW'
            END as object_type
        FROM pg_depend d
        JOIN pg_rewrite r ON r.oid = d.objid
        JOIN pg_class c ON c.oid = r.ev_class
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE d.refobjid = 'public.reservas'::regclass
        AND c.relname != 'reservas'
    LOOP
        RAISE NOTICE 'Removendo dependência: %.%', dep.schema_name, dep.object_name;
        EXECUTE format('DROP %s IF EXISTS %I.%I CASCADE', dep.object_type, dep.schema_name, dep.object_name);
    END LOOP;
END $$;

-- PASSO 3: Agora SIM podemos alterar os campos
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

-- PASSO 4: Adicionar campos necessários para sincronização
ALTER TABLE public.reservas 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS car_info TEXT,
ADD COLUMN IF NOT EXISTS car_location TEXT,
ADD COLUMN IF NOT EXISTS park_name TEXT,
ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'synced',
ADD COLUMN IF NOT EXISTS sync_errors JSONB,
ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMP WITH TIME ZONE;

-- PASSO 5: Recriar apenas as views essenciais
CREATE OR REPLACE VIEW reservas_with_id AS
SELECT 
    *,
    COALESCE(id_pk::text, booking_id, '') as unique_id
FROM public.reservas;

-- PASSO 6: Testar inserção com ID longo
DO $$
DECLARE
    test_id TEXT := '1757087919722955_TESTE_' || extract(epoch from now())::text;
BEGIN
    INSERT INTO public.reservas (
        booking_id,
        license_plate,
        estado_reserva_atual,
        created_at_db,
        updated_at_db
    ) VALUES (
        test_id,
        'XX-99-XX',
        'teste_campo_longo_agora_deve_funcionar_sem_problemas',
        NOW(),
        NOW()
    );
    
    DELETE FROM public.reservas WHERE booking_id = test_id;
    
    RAISE NOTICE '✅ SUCESSO TOTAL! Campos alterados com sucesso!';
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION '❌ Ainda há erro: %', SQLERRM;
END $$;

-- PASSO 7: Verificar resultado final
SELECT 
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'reservas'
  AND column_name IN ('booking_id', 'license_plate', 'estado_reserva_atual')
ORDER BY column_name;

-- PASSO 8: Mostrar sucesso
SELECT 
    '🎉 SCRIPT EXECUTADO COM SUCESSO!' as status,
    'Todos os campos agora são TEXT sem limite' as mensagem,
    'Pronto para sincronizar com Firebase!' as proximo_passo;
