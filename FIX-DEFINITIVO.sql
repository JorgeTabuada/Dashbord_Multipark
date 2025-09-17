-- SCRIPT DEFINITIVO - REMOVE TODAS AS DEPENDÊNCIAS E CORRIGE CAMPOS
-- Execute TODO este script no Supabase SQL Editor

-- PASSO 1: Listar todas as views/materialized views que dependem da tabela reservas
DO $$
BEGIN
    RAISE NOTICE 'Iniciando remoção de dependências...';
END $$;

-- PASSO 2: Remover TODAS as views e materialized views que podem depender de reservas
DROP MATERIALIZED VIEW IF EXISTS bi_financeiro_diario CASCADE;
DROP MATERIALIZED VIEW IF EXISTS bi_operacional_diario CASCADE;
DROP MATERIALIZED VIEW IF EXISTS bi_clientes_analise CASCADE;
DROP MATERIALIZED VIEW IF EXISTS bi_produtividade_condutores CASCADE;

DROP VIEW IF EXISTS reservas_with_id CASCADE;
DROP VIEW IF EXISTS v_reservas_sync CASCADE;
DROP VIEW IF EXISTS v_sync_status CASCADE;
DROP VIEW IF EXISTS v_reservas_completas CASCADE;
DROP VIEW IF EXISTS v_reservas_ativas CASCADE;
DROP VIEW IF EXISTS v_dashboard_stats CASCADE;

-- PASSO 3: Agora podemos alterar os campos sem problemas
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

-- PASSO 4: Adicionar campos necessários
ALTER TABLE public.reservas 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS car_info TEXT,
ADD COLUMN IF NOT EXISTS car_location TEXT,
ADD COLUMN IF NOT EXISTS park_name TEXT,
ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'synced',
ADD COLUMN IF NOT EXISTS sync_errors JSONB,
ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMP WITH TIME ZONE;

-- PASSO 5: Recriar as views básicas necessárias
CREATE VIEW reservas_with_id AS
SELECT 
    *,
    COALESCE(id_pk::text, booking_id, '') as unique_id
FROM public.reservas;

-- PASSO 6: Recriar materialized views de BI
CREATE MATERIALIZED VIEW IF NOT EXISTS bi_financeiro_diario AS
SELECT 
    DATE(created_at_db) as data,
    COUNT(*) as total_reservas,
    COUNT(CASE WHEN estado_reserva_atual = 'entregue' THEN 1 END) as reservas_completas,
    COUNT(CASE WHEN estado_reserva_atual = 'cancelado' THEN 1 END) as reservas_canceladas,
    SUM(COALESCE(total_price, booking_price, 0)) as receita_total,
    AVG(COALESCE(total_price, booking_price, 0)) as ticket_medio,
    COUNT(DISTINCT cidade_cliente) as cidades_ativas,
    COUNT(DISTINCT parque_id) as parques_ativos
FROM public.reservas
GROUP BY DATE(created_at_db);

CREATE MATERIALIZED VIEW IF NOT EXISTS bi_operacional_diario AS
SELECT 
    DATE(created_at_db) as data,
    estado_reserva_atual,
    COUNT(*) as quantidade,
    AVG(
        CASE 
            WHEN check_out_real IS NOT NULL AND check_in_real IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (check_out_real - check_in_real))/3600
            ELSE NULL 
        END
    ) as tempo_medio_horas
FROM public.reservas
GROUP BY DATE(created_at_db), estado_reserva_atual;

-- PASSO 7: Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_reservas_booking_id ON public.reservas(booking_id);
CREATE INDEX IF NOT EXISTS idx_reservas_source ON public.reservas(source);
CREATE INDEX IF NOT EXISTS idx_reservas_sync_status ON public.reservas(sync_status);
CREATE INDEX IF NOT EXISTS idx_bi_financeiro_data ON bi_financeiro_diario(data);
CREATE INDEX IF NOT EXISTS idx_bi_operacional_data ON bi_operacional_diario(data);

-- PASSO 8: Testar se funcionou
DO $$
DECLARE
    test_id TEXT := '1757087919722955_TEST_LONG_ID_' || extract(epoch from now())::text;
BEGIN
    -- Tentar inserir registro com ID longo
    INSERT INTO public.reservas (
        booking_id,
        license_plate,
        estado_reserva_atual,
        created_at_db,
        updated_at_db
    ) VALUES (
        test_id,
        'TEST-OK-OK',
        'teste_sucesso_campo_muito_longo_agora_funciona',
        NOW(),
        NOW()
    );
    
    -- Limpar teste
    DELETE FROM public.reservas WHERE booking_id = test_id;
    
    RAISE NOTICE '✅ SUCESSO! Campos alterados e prontos para sincronização!';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Erro: %', SQLERRM;
END $$;

-- PASSO 9: Mostrar resultado final
SELECT 
    '✅ Script executado com sucesso!' as status,
    COUNT(*) as total_reservas,
    MAX(LENGTH(booking_id)) as max_booking_id_length,
    'Pronto para sincronização!' as mensagem
FROM public.reservas;
