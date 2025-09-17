-- Fix para ampliar campo license_plate que está muito pequeno
-- Execute este script no Supabase SQL Editor

-- Ampliar campo license_plate de VARCHAR(20) para VARCHAR(100)
-- para suportar IDs Firebase longos que podem estar sendo usados como license plates

ALTER TABLE reservations 
ALTER COLUMN license_plate TYPE VARCHAR(100);

-- Verificar se funcionou
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'reservations' 
AND column_name = 'license_plate';

-- Mostrar algumas reservas para debug
SELECT firebase_id, license_plate, status, city, park_brand
FROM reservations
LIMIT 10;