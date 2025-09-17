-- 🚀 SCRIPT COMPLETO DE MIGRAÇÃO - MULTIPARK DASHBOARD
-- =====================================================
-- Execute este script no Supabase SQL Editor
-- Data: 2025-09-12

-- ========================================
-- 1. TABELA: reservas (principal)
-- ========================================
CREATE TABLE IF NOT EXISTS public.reservas (
  id_pk UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id TEXT UNIQUE,
  name_cliente TEXT,
  lastname_cliente TEXT,
  email_cliente TEXT,
  phone_number_cliente TEXT,
  cidade_cliente TEXT,
  license_plate TEXT NOT NULL,
  estado_reserva_atual TEXT DEFAULT 'reservado',
  booking_price DECIMAL(10,2),
  check_in_previsto TIMESTAMP WITH TIME ZONE,
  check_out_previsto TIMESTAMP WITH TIME ZONE,
  check_in_real TIMESTAMP WITH TIME ZONE,
  check_out_real TIMESTAMP WITH TIME ZONE,
  parque_id INTEGER,
  parking_type TEXT,
  spot_number TEXT,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pendente',
  created_at_db TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at_db TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  synced_from_firebase BOOLEAN DEFAULT false,
  observacoes TEXT,
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_reservas_booking_id ON public.reservas(booking_id);
CREATE INDEX IF NOT EXISTS idx_reservas_license_plate ON public.reservas(license_plate);
CREATE INDEX IF NOT EXISTS idx_reservas_estado ON public.reservas(estado_reserva_atual);
CREATE INDEX IF NOT EXISTS idx_reservas_dates ON public.reservas(check_in_previsto, check_out_previsto);

-- ========================================
-- 2. TABELA: comentarios_reclamacoes
-- ========================================
CREATE TABLE IF NOT EXISTS public.comentarios_reclamacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT CHECK (tipo IN ('comentario', 'reclamacao', 'sugestao')) DEFAULT 'comentario',
  cliente TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  assunto TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  categoria TEXT CHECK (categoria IN ('atendimento', 'entrega', 'produto', 'tecnologia', 'pagamento', 'outro')) DEFAULT 'outro',
  prioridade TEXT CHECK (prioridade IN ('baixa', 'media', 'alta')) DEFAULT 'media',
  status TEXT CHECK (status IN ('pendente', 'em_andamento', 'fechado')) DEFAULT 'pendente',
  avaliacao INTEGER CHECK (avaliacao >= 1 AND avaliacao <= 5),
  data TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responsavel TEXT,
  resposta TEXT,
  reservation_id TEXT,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comentarios_tipo ON public.comentarios_reclamacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_comentarios_status ON public.comentarios_reclamacoes(status);
CREATE INDEX IF NOT EXISTS idx_comentarios_reservation ON public.comentarios_reclamacoes(reservation_id);

-- ========================================
-- 3. TABELA: funcionarios (recursos humanos)
-- ========================================
CREATE TABLE IF NOT EXISTS public.funcionarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_completo TEXT NOT NULL,
  morada TEXT,
  data_nascimento DATE,
  nif TEXT UNIQUE,
  doc_id_tipo TEXT CHECK (doc_id_tipo IN ('CC', 'Passaporte', 'Outro')),
  doc_id_numero TEXT,
  foto TEXT,
  funcao TEXT,
  data_entrada DATE NOT NULL,
  data_saida DATE,
  parque_principal TEXT,
  supervisor_direto TEXT,
  tipo_colaborador TEXT CHECK (tipo_colaborador IN ('Efetivo', 'Temporario', 'Estagiario', 'Consultor')),
  ordenado_bruto DECIMAL(10,2),
  horario_trabalho TEXT,
  nivel_extra TEXT,
  valor_hora_extra DECIMAL(10,2),
  status TEXT CHECK (status IN ('ativo', 'inativo', 'ferias', 'baixa')) DEFAULT 'ativo',
  contacto TEXT,
  email TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_funcionarios_nif ON public.funcionarios(nif);
CREATE INDEX IF NOT EXISTS idx_funcionarios_status ON public.funcionarios(status);

-- ========================================
-- 4. TABELA: parques
-- ========================================
CREATE TABLE IF NOT EXISTS public.parques (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  cidade TEXT NOT NULL,
  endereco TEXT,
  capacidade_total INTEGER DEFAULT 0,
  lugares_ocupados INTEGER DEFAULT 0,
  lugares_disponiveis INTEGER GENERATED ALWAYS AS (capacidade_total - lugares_ocupados) STORED,
  tipo TEXT CHECK (tipo IN ('aeroporto', 'cidade', 'praia', 'evento')),
  ativo BOOLEAN DEFAULT true,
  horario_abertura TIME,
  horario_fecho TIME,
  coordenadas JSONB,
  tarifas JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parques_cidade ON public.parques(cidade);
CREATE INDEX IF NOT EXISTS idx_parques_ativo ON public.parques(ativo);

-- ========================================
-- 5. TABELA: veiculos
-- ========================================
CREATE TABLE IF NOT EXISTS public.veiculos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  matricula TEXT UNIQUE NOT NULL,
  marca TEXT,
  modelo TEXT,
  cor TEXT,
  tipo TEXT CHECK (tipo IN ('ligeiro', 'suv', 'moto', 'van', 'camiao')),
  ano INTEGER,
  cliente_id TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_veiculos_matricula ON public.veiculos(matricula);
CREATE INDEX IF NOT EXISTS idx_veiculos_cliente ON public.veiculos(cliente_id);

-- ========================================
-- 6. TABELA: sync_logs
-- ========================================
CREATE TABLE IF NOT EXISTS public.sync_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT CHECK (operation IN ('insert', 'update', 'delete')),
  record_id TEXT,
  firebase_id TEXT,
  status TEXT CHECK (status IN ('pending', 'success', 'error')) DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON public.sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_sync_logs_table ON public.sync_logs(table_name);

-- ========================================
-- 7. TRIGGERS para updated_at
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT unnest(ARRAY[
            'reservas', 
            'comentarios_reclamacoes', 
            'funcionarios', 
            'parques', 
            'veiculos'
        ])
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%s_updated_at ON public.%s;
            CREATE TRIGGER update_%s_updated_at
                BEFORE UPDATE ON public.%s
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        ', tbl, tbl, tbl, tbl);
    END LOOP;
END $$;

-- ========================================
-- 8. RLS (Row Level Security)
-- ========================================
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comentarios_reclamacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parques ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura para todos
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT unnest(ARRAY[
            'reservas', 
            'comentarios_reclamacoes', 
            'funcionarios', 
            'parques', 
            'veiculos',
            'sync_logs'
        ])
    LOOP
        EXECUTE format('
            DROP POLICY IF EXISTS "Enable read access for all users" ON public.%s;
            CREATE POLICY "Enable read access for all users" 
                ON public.%s FOR SELECT 
                USING (true);
        ', tbl, tbl);
        
        EXECUTE format('
            DROP POLICY IF EXISTS "Enable insert for all users" ON public.%s;
            CREATE POLICY "Enable insert for all users" 
                ON public.%s FOR INSERT 
                WITH CHECK (true);
        ', tbl, tbl);
        
        EXECUTE format('
            DROP POLICY IF EXISTS "Enable update for all users" ON public.%s;
            CREATE POLICY "Enable update for all users" 
                ON public.%s FOR UPDATE 
                USING (true);
        ', tbl, tbl);
    END LOOP;
END $$;

-- ========================================
-- 9. VIEWS para estatísticas
-- ========================================
CREATE OR REPLACE VIEW reservas_stats AS
SELECT 
    COUNT(*) as total_reservas,
    COUNT(DISTINCT parque_id) as total_parques,
    COUNT(CASE WHEN estado_reserva_atual = 'reservado' THEN 1 END) as reservas_pendentes,
    COUNT(CASE WHEN estado_reserva_atual = 'entregue' THEN 1 END) as reservas_concluidas,
    COUNT(CASE WHEN estado_reserva_atual = 'cancelado' THEN 1 END) as reservas_canceladas,
    SUM(booking_price) as receita_total,
    DATE(created_at_db) as data
FROM public.reservas
GROUP BY DATE(created_at_db);

CREATE OR REPLACE VIEW comentarios_stats AS
SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN tipo = 'comentario' THEN 1 END) as total_comentarios,
    COUNT(CASE WHEN tipo = 'reclamacao' THEN 1 END) as total_reclamacoes,
    COUNT(CASE WHEN tipo = 'sugestao' THEN 1 END) as total_sugestoes,
    COUNT(CASE WHEN status = 'pendente' THEN 1 END) as pendentes,
    AVG(avaliacao) as avaliacao_media,
    DATE(data) as data_ref
FROM public.comentarios_reclamacoes
GROUP BY DATE(data);

-- ========================================
-- 10. GRANTS
-- ========================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;

-- ========================================
-- 11. Migração de dados antigos (se existirem)
-- ========================================
DO $$
BEGIN
    -- Migrar de reservations para reservas se existir
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reservations') THEN
        INSERT INTO public.reservas (
            booking_id,
            name_cliente,
            lastname_cliente,
            email_cliente,
            phone_number_cliente,
            cidade_cliente,
            license_plate,
            estado_reserva_atual,
            booking_price,
            check_in_previsto,
            check_out_previsto,
            parque_id
        )
        SELECT 
            firebase_id,
            client_first_name,
            client_last_name,
            client_email,
            client_phone,
            city,
            license_plate,
            status,
            booking_price,
            check_in_datetime::timestamp with time zone,
            check_out_datetime::timestamp with time zone,
            park_id
        FROM public.reservations
        ON CONFLICT (booking_id) DO NOTHING;
        
        RAISE NOTICE 'Dados migrados de reservations para reservas';
    END IF;
END $$;

-- ========================================
-- ✅ SCRIPT COMPLETO EXECUTADO!
-- ========================================
-- Agora execute: npm run dev
-- E acede a: http://localhost:3000
