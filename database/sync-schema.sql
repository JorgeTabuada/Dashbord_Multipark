-- Schema completo para sincronização com Firebase
-- Sistema de gestão de parques MULTIPARK

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela principal de reservas (sincronizada com Firebase clients)
CREATE TABLE IF NOT EXISTS reservations (
  id BIGSERIAL PRIMARY KEY,
  
  -- Identificadores Firebase
  firebase_id VARCHAR(50) UNIQUE NOT NULL,
  city VARCHAR(50) NOT NULL,
  park_brand VARCHAR(50) NOT NULL,
  
  -- Informação da campanha
  campaign_id VARCHAR(100),
  campaign_name VARCHAR(200),
  campaign_requires_payment BOOLEAN DEFAULT true,
  
  -- Detalhes da reserva
  booking_date TIMESTAMP WITH TIME ZONE,
  parking_type VARCHAR(100),
  parking_details JSONB,
  parking_price DECIMAL(10,2),
  delivery_location VARCHAR(200),
  delivery_price DECIMAL(10,2),
  delivery_location_url TEXT,
  extra_services JSONB,
  booking_price DECIMAL(10,2),
  corrected_price DECIMAL(10,2),
  price_on_delivery DECIMAL(10,2),
  
  -- Detalhes do veículo e cliente
  license_plate VARCHAR(20) NOT NULL,
  car_info TEXT,
  client_first_name VARCHAR(100),
  client_last_name VARCHAR(100),
  client_email VARCHAR(200),
  client_phone VARCHAR(50),
  return_flight VARCHAR(50),
  payment_method VARCHAR(100),
  invoice_name VARCHAR(200),
  tax_number VARCHAR(50),
  
  -- Timing
  check_in_datetime TIMESTAMP WITH TIME ZONE,
  check_out_datetime TIMESTAMP WITH TIME ZONE,
  firebase_checkin_timestamp TIMESTAMP WITH TIME ZONE,
  
  -- Status e localização física
  status VARCHAR(50) NOT NULL DEFAULT 'reservado',
  physical_park VARCHAR(100),
  parking_row VARCHAR(20),
  parking_spot VARCHAR(20),
  allocation_number VARCHAR(50),
  
  -- Tracking de movimento
  car_location_url TEXT,
  checkin_video_url TEXT,
  pickup_driver VARCHAR(200),
  delivery_driver VARCHAR(200),
  
  -- Campos de auditoria
  last_action_user VARCHAR(200),
  last_action_date TIMESTAMP WITH TIME ZONE,
  last_action_description VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  canceled_at TIMESTAMP WITH TIME ZONE,
  
  -- Tracking de sincronização Firebase
  firebase_last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sync_status VARCHAR(20) DEFAULT 'synced',
  
  -- Constraints
  CONSTRAINT valid_status CHECK (status IN (
    'reservado', 'em_recolha', 'recolhido', 'em_entrega', 
    'em_movimento', 'entregue', 'cancelado'
  )),
  CONSTRAINT valid_sync_status CHECK (sync_status IN ('synced', 'pending', 'error'))
);

-- Tabela de parques
CREATE TABLE IF NOT EXISTS parks (
  id BIGSERIAL PRIMARY KEY,
  city VARCHAR(50) NOT NULL,
  brand VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  available_rows INTEGER[],
  available_spots INTEGER[],
  unavailable_spots JSONB,
  parking_types JSONB,
  delivery_options JSONB,
  allocation_ranges JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(city, brand, name)
);

-- Tabela de campanhas
CREATE TABLE IF NOT EXISTS campaigns (
  id BIGSERIAL PRIMARY KEY,
  firebase_id VARCHAR(100),
  city VARCHAR(50) NOT NULL,
  brand VARCHAR(50) NOT NULL,
  name VARCHAR(200) NOT NULL,
  requires_payment BOOLEAN DEFAULT true,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(city, brand, firebase_id)
);

-- Tabela de utilizadores da aplicação
CREATE TABLE IF NOT EXISTS app_users (
  id BIGSERIAL PRIMARY KEY,
  firebase_uid VARCHAR(100) UNIQUE,
  email VARCHAR(200) NOT NULL,
  user_type VARCHAR(50) NOT NULL,
  accessible_cities TEXT[],
  accessible_parks TEXT[],
  selected_city VARCHAR(50),
  blocked_by_license_plate VARCHAR(20),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_user_type CHECK (user_type IN (
    'SuperAdmin', 'Admin', 'SuperVisor', 'Chefe', 'Condutor', 'Junior'
  ))
);

-- Histórico de reservas
CREATE TABLE IF NOT EXISTS reservation_history (
  id BIGSERIAL PRIMARY KEY,
  reservation_firebase_id VARCHAR(50) NOT NULL,
  action_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  action_user VARCHAR(200),
  action_description VARCHAR(500),
  reservation_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  FOREIGN KEY (reservation_firebase_id) REFERENCES reservations(firebase_id) ON DELETE CASCADE
);

-- Definições de sistema
CREATE TABLE IF NOT EXISTS system_settings (
  id BIGSERIAL PRIMARY KEY,
  setting_category VARCHAR(100) NOT NULL,
  setting_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(setting_category)
);

-- Tabela de log de sincronização
CREATE TABLE IF NOT EXISTS sync_logs (
  id BIGSERIAL PRIMARY KEY,
  sync_type VARCHAR(50) NOT NULL, -- 'firebase_to_supabase', 'supabase_to_firebase'
  table_name VARCHAR(100) NOT NULL,
  record_id VARCHAR(100),
  operation VARCHAR(20) NOT NULL, -- 'create', 'update', 'delete'
  success BOOLEAN NOT NULL,
  error_message TEXT,
  sync_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_reservations_firebase_id ON reservations(firebase_id);
CREATE INDEX IF NOT EXISTS idx_reservations_city_brand ON reservations(city, park_brand);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_license_plate ON reservations(license_plate);
CREATE INDEX IF NOT EXISTS idx_reservations_client_email ON reservations(client_email);
CREATE INDEX IF NOT EXISTS idx_reservations_sync_status ON reservations(sync_status);
CREATE INDEX IF NOT EXISTS idx_reservations_updated_at ON reservations(updated_at);
CREATE INDEX IF NOT EXISTS idx_reservation_history_firebase_id ON reservation_history(reservation_firebase_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_created_at ON sync_logs(created_at);

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar timestamps automaticamente
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parks_updated_at BEFORE UPDATE ON parks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_users_updated_at BEFORE UPDATE ON app_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - ativar para todas as tabelas
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE parks ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (podem ser refinadas conforme necessário)
CREATE POLICY "Enable all for authenticated users" ON reservations
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON parks
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON campaigns
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON app_users
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON reservation_history
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON system_settings
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON sync_logs
  FOR ALL USING (auth.role() = 'authenticated');

-- Inserir dados iniciais de configuração
INSERT INTO system_settings (setting_category, setting_data) VALUES
('cities', '{"lisbon": ["Airpark", "Redpark"], "porto": ["SkyPark", "TopParking"]}'),
('payment_types', '{"all": ["Dinheiro", "Multibanco", "MBWay", "Cartão de Crédito", "PayPal", "Transferência Bancária"]}'),
('cancellation_types', '{"all": ["Cliente", "Técnico", "Overbooking", "Força Maior"]}'),
('occurrence_types', '{"all": ["Dano no Veículo", "Atraso", "Problema Técnico", "Cliente Não Compareceu"]}')
ON CONFLICT (setting_category) DO NOTHING;

-- Comentários para documentação
COMMENT ON TABLE reservations IS 'Tabela principal de reservas sincronizada com Firebase';
COMMENT ON TABLE parks IS 'Configuração e informação dos parques de estacionamento';
COMMENT ON TABLE campaigns IS 'Campanhas de marketing ativas';
COMMENT ON TABLE app_users IS 'Utilizadores da aplicação com permissões';
COMMENT ON TABLE reservation_history IS 'Histórico de todas as alterações às reservas';
COMMENT ON TABLE system_settings IS 'Configurações globais do sistema';
COMMENT ON TABLE sync_logs IS 'Log de todas as operações de sincronização';