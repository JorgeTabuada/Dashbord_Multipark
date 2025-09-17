-- 🔄 SCRIPT DE MIGRAÇÃO COMPLETO PARA TABELA RESERVAS
-- =====================================================

-- 1. Criar a tabela reservas com a estrutura correta
CREATE TABLE IF NOT EXISTS public.reservas (
  -- IDs principais
  id_pk UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id TEXT UNIQUE, -- ID do Firebase
  
  -- Dados do cliente
  name_cliente TEXT,
  lastname_cliente TEXT,
  email_cliente TEXT,
  phone_number_cliente TEXT,
  cidade_cliente TEXT,
  license_plate TEXT NOT NULL,
  
  -- Dados da reserva
  estado_reserva_atual TEXT DEFAULT 'reservado',
  booking_price DECIMAL(10,2),
  check_in_previsto TIMESTAMP WITH TIME ZONE,
  check_out_previsto TIMESTAMP WITH TIME ZONE,
  check_in_real TIMESTAMP WITH TIME ZONE,
  check_out_real TIMESTAMP WITH TIME ZONE,
  
  -- Dados do parque
  parque_id INTEGER,
  parking_type TEXT,
  spot_number TEXT,
  
  -- Dados de pagamento
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pendente',
  
  -- Metadata
  created_at_db TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at_db TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  synced_from_firebase BOOLEAN DEFAULT false,
  
  -- Campos extras
  observacoes TEXT,
  metadata JSONB
);

-- 2. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_reservas_booking_id ON public.reservas(booking_id);
CREATE INDEX IF NOT EXISTS idx_reservas_license_plate ON public.reservas(license_plate);
CREATE INDEX IF NOT EXISTS idx_reservas_estado ON public.reservas(estado_reserva_atual);
CREATE INDEX IF NOT EXISTS idx_reservas_parque ON public.reservas(parque_id);
CREATE INDEX IF NOT EXISTS idx_reservas_dates ON public.reservas(check_in_previsto, check_out_previsto);

-- 3. Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at_db = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_reservas_updated_at ON public.reservas;
CREATE TRIGGER update_reservas_updated_at
    BEFORE UPDATE ON public.reservas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. RLS (Row Level Security)
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;

-- Política para leitura (todos podem ler)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.reservas;
CREATE POLICY "Enable read access for all users" 
    ON public.reservas FOR SELECT 
    USING (true);

-- Política para inserção/atualização (apenas autenticados)
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.reservas;
CREATE POLICY "Enable insert for authenticated users" 
    ON public.reservas FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.reservas;
CREATE POLICY "Enable update for authenticated users" 
    ON public.reservas FOR UPDATE 
    USING (true);

-- 5. View para estatísticas
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

-- 6. Migrar dados se houver tabela antiga
DO $$
BEGIN
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
            parque_id,
            created_at_db,
            updated_at_db
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
            park_id,
            created_at,
            updated_at
        FROM public.reservations
        ON CONFLICT (booking_id) DO NOTHING;
        
        RAISE NOTICE 'Dados migrados de reservations para reservas';
    END IF;
END $$;

-- 7. Criar função para sincronizar com Firebase
CREATE OR REPLACE FUNCTION sync_firebase_reservation(
    p_booking_id TEXT,
    p_license_plate TEXT,
    p_name TEXT,
    p_lastname TEXT,
    p_email TEXT,
    p_phone TEXT,
    p_city TEXT,
    p_status TEXT,
    p_price DECIMAL,
    p_check_in TIMESTAMP WITH TIME ZONE,
    p_check_out TIMESTAMP WITH TIME ZONE,
    p_parque_id INTEGER
)
RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO public.reservas (
        booking_id,
        license_plate,
        name_cliente,
        lastname_cliente,
        email_cliente,
        phone_number_cliente,
        cidade_cliente,
        estado_reserva_atual,
        booking_price,
        check_in_previsto,
        check_out_previsto,
        parque_id,
        synced_from_firebase
    ) VALUES (
        p_booking_id,
        p_license_plate,
        p_name,
        p_lastname,
        p_email,
        p_phone,
        p_city,
        p_status,
        p_price,
        p_check_in,
        p_check_out,
        p_parque_id,
        true
    )
    ON CONFLICT (booking_id) 
    DO UPDATE SET
        license_plate = EXCLUDED.license_plate,
        name_cliente = EXCLUDED.name_cliente,
        lastname_cliente = EXCLUDED.lastname_cliente,
        email_cliente = EXCLUDED.email_cliente,
        phone_number_cliente = EXCLUDED.phone_number_cliente,
        cidade_cliente = EXCLUDED.cidade_cliente,
        estado_reserva_atual = EXCLUDED.estado_reserva_atual,
        booking_price = EXCLUDED.booking_price,
        check_in_previsto = EXCLUDED.check_in_previsto,
        check_out_previsto = EXCLUDED.check_out_previsto,
        parque_id = EXCLUDED.parque_id,
        updated_at_db = NOW()
    RETURNING id_pk INTO v_id;
    
    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- 8. Grants necessários
GRANT ALL ON public.reservas TO authenticated;
GRANT ALL ON public.reservas TO service_role;
GRANT SELECT ON reservas_stats TO authenticated;

-- 9. Comentários na tabela
COMMENT ON TABLE public.reservas IS 'Tabela principal de reservas sincronizada com Firebase';
COMMENT ON COLUMN public.reservas.booking_id IS 'ID único da reserva no Firebase';
COMMENT ON COLUMN public.reservas.estado_reserva_atual IS 'Estados: reservado, em_recolha, recolhido, em_entrega, entregue, cancelado';

-- ✅ Script completo! Execute este SQL no Supabase
