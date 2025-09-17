-- Script SQL para corrigir campos com tamanho insuficiente
-- Execute este no Supabase SQL Editor

-- 1. Aumentar tamanho dos campos que podem estar limitados
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
ALTER COLUMN park_name TYPE TEXT;

-- 2. Verificar e ajustar campos de nome/email se necessário
ALTER TABLE public.reservas
ALTER COLUMN name_cliente TYPE TEXT,
ALTER COLUMN lastname_cliente TYPE TEXT,
ALTER COLUMN email_cliente TYPE TEXT,
ALTER COLUMN phone_number_cliente TYPE TEXT,
ALTER COLUMN nome_fiscal_cliente TYPE TEXT;

-- 3. Verificar estrutura atual
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'reservas'
  AND data_type LIKE '%char%'
ORDER BY ordinal_position;
