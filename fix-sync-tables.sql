-- Script SQL para adicionar campos necessários para sincronização
-- Execute este script no Supabase SQL Editor

-- 1. Adicionar campo 'source' à tabela reservas se não existir
ALTER TABLE public.reservas 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

-- 2. Adicionar campos adicionais que podem estar em falta
ALTER TABLE public.reservas 
ADD COLUMN IF NOT EXISTS car_info TEXT,
ADD COLUMN IF NOT EXISTS car_location TEXT,
ADD COLUMN IF NOT EXISTS park_name TEXT,
ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'synced',
ADD COLUMN IF NOT EXISTS sync_errors JSONB,
ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMP WITH TIME ZONE;

-- 3. Criar índice para melhor performance nas queries de sincronização
CREATE INDEX IF NOT EXISTS idx_reservas_source ON public.reservas(source);
CREATE INDEX IF NOT EXISTS idx_reservas_sync_status ON public.reservas(sync_status);

-- 4. Adicionar campo 'source' às outras tabelas usadas na sincronização
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

ALTER TABLE public.caixa_transacoes_validadas 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS firebase_reservation_id TEXT;

ALTER TABLE public.odoo_transacoes_importadas 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS firebase_reservation_id TEXT;

ALTER TABLE public.comportamentos_metricas_diarias 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

ALTER TABLE public.comportamentos_relatorios_gerados 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

ALTER TABLE public.produtividade_condutores_diaria 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

ALTER TABLE public.produtividade_auditorias_condutores 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

ALTER TABLE public.faturacao_clientes 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS firebase_reservation_id TEXT;

ALTER TABLE public.faturacao_agenda_cobrancas 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

ALTER TABLE public.faturacao_relatorio_receitas 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

ALTER TABLE public.campanhas_marketing 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

ALTER TABLE public.leads_marketing 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

ALTER TABLE public.comentarios_reclamacoes 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS reservation_id TEXT;

-- 5. Criar view para monitorizar sincronização
CREATE OR REPLACE VIEW public.v_sync_status AS
SELECT 
  'reservas' as tabela,
  COUNT(*) as total,
  COUNT(CASE WHEN source = 'firebase_sync' THEN 1 END) as firebase_sync,
  COUNT(CASE WHEN source = 'manual' THEN 1 END) as manual,
  MAX(updated_at_db) as ultima_atualizacao
FROM public.reservas
UNION ALL
SELECT 
  'profiles' as tabela,
  COUNT(*) as total,
  COUNT(CASE WHEN source = 'firebase_sync' THEN 1 END) as firebase_sync,
  COUNT(CASE WHEN source = 'manual' THEN 1 END) as manual,
  MAX(updated_at) as ultima_atualizacao
FROM public.profiles;

-- 6. Função para limpar dados de teste/duplicados
CREATE OR REPLACE FUNCTION cleanup_sync_duplicates()
RETURNS void AS $$
BEGIN
  -- Remover reservas duplicadas mantendo a mais recente
  DELETE FROM public.reservas a
  USING public.reservas b
  WHERE a.booking_id = b.booking_id
    AND a.id_pk < b.id_pk;
    
  -- Limpar profiles duplicados
  DELETE FROM public.profiles a
  USING public.profiles b
  WHERE a.display_name = b.display_name
    AND a.source = 'firebase_sync'
    AND b.source = 'firebase_sync'
    AND a.id < b.id;
END;
$$ LANGUAGE plpgsql;

-- 7. Garantir que as tabelas de log existem
CREATE TABLE IF NOT EXISTS public.sync_logs (
  id SERIAL PRIMARY KEY,
  sync_type TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  operation TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_logs_created_at ON public.sync_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_logs_success ON public.sync_logs(success);

-- 8. Garantir campos corretos em profiles
ALTER TABLE public.profiles
ALTER COLUMN display_name TYPE TEXT,
ALTER COLUMN email TYPE TEXT;

-- 9. Adicionar RLS policies se necessário
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura de todas as reservas
CREATE POLICY "Permitir leitura de reservas" ON public.reservas
  FOR SELECT USING (true);

-- Política para permitir inserção via sincronização
CREATE POLICY "Permitir inserção via sync" ON public.reservas
  FOR INSERT WITH CHECK (true);

-- Política para permitir atualização via sincronização
CREATE POLICY "Permitir atualização via sync" ON public.reservas
  FOR UPDATE USING (true);

-- 10. Verificar estrutura final
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'reservas'
ORDER BY ordinal_position;
