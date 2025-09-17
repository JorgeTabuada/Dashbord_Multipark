-- 📊 QUERIES PARA MONITORAR SINCRONIZAÇÃO
-- ========================================

-- 1. Ver quantas reservas foram sincronizadas
SELECT 
    COUNT(*) as total_reservas,
    COUNT(CASE WHEN source = 'firebase_sync' THEN 1 END) as do_firebase,
    COUNT(CASE WHEN source != 'firebase_sync' OR source IS NULL THEN 1 END) as outras_fontes
FROM public.reservas;

-- 2. Ver distribuição por cidade e parque
SELECT 
    cidade_cliente,
    park_name,
    COUNT(*) as total_reservas,
    SUM(booking_price) as receita_total
FROM public.reservas
WHERE source = 'firebase_sync'
GROUP BY cidade_cliente, park_name
ORDER BY cidade_cliente, park_name;

-- 3. Ver últimas reservas sincronizadas
SELECT 
    booking_id,
    name_cliente || ' ' || lastname_cliente as cliente,
    license_plate,
    cidade_cliente,
    park_name,
    estado_reserva_atual,
    booking_price,
    last_sync_at
FROM public.reservas
WHERE source = 'firebase_sync'
ORDER BY last_sync_at DESC
LIMIT 20;

-- 4. Verificar problemas (reservas sem dados importantes)
SELECT 
    COUNT(*) FILTER (WHERE license_plate IS NULL OR license_plate = '') as sem_matricula,
    COUNT(*) FILTER (WHERE name_cliente IS NULL) as sem_nome,
    COUNT(*) FILTER (WHERE booking_price IS NULL OR booking_price = 0) as sem_preco,
    COUNT(*) FILTER (WHERE check_in_previsto IS NULL) as sem_checkin,
    COUNT(*) FILTER (WHERE cidade_cliente IS NULL) as sem_cidade
FROM public.reservas
WHERE source = 'firebase_sync';

-- 5. Ver estados das reservas
SELECT 
    estado_reserva_atual,
    COUNT(*) as total,
    ROUND(COUNT(*)::numeric * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentagem
FROM public.reservas
WHERE source = 'firebase_sync'
GROUP BY estado_reserva_atual
ORDER BY total DESC;

-- 6. Verificar duplicados
SELECT 
    booking_id,
    COUNT(*) as num_duplicados
FROM public.reservas
WHERE source = 'firebase_sync'
GROUP BY booking_id
HAVING COUNT(*) > 1;

-- 7. Progresso por hora (para ver velocidade de sincronização)
SELECT 
    DATE_TRUNC('hour', last_sync_at) as hora,
    COUNT(*) as reservas_sincronizadas
FROM public.reservas
WHERE source = 'firebase_sync'
    AND last_sync_at > NOW() - INTERVAL '24 hours'
GROUP BY hora
ORDER BY hora DESC;

-- 8. Totais por marca (as nossas marcas)
SELECT 
    park_name,
    COUNT(*) as total_reservas,
    COUNT(DISTINCT cidade_cliente) as cidades_diferentes,
    MIN(check_in_previsto) as primeira_reserva,
    MAX(check_in_previsto) as ultima_reserva
FROM public.reservas
WHERE source = 'firebase_sync'
    AND park_name IN ('AirPark', 'RedPark', 'SkyPark', 'TopParking', 'LisPark')
GROUP BY park_name
ORDER BY total_reservas DESC;
