-- ============================================================================
-- VALIDAÇÃO da migration 0046 + captura dos campos novos do /bookings/report
-- Correr na BD de PRODUÇÃO (MySQL/Railway) DEPOIS de:
--   1) deploy verde,  2) botão "DB: 0046",  3) pelo menos 1 sync (ou backfill)
-- Ordenado da query mais decisiva (F/E) à mais geral.
-- ============================================================================


-- ── F. DECISIVA: que nomes de campo a API REALMENTE devolve? ─────────────────
-- rawJson = JSON.stringify(booking) tal como veio da API. JSON_KEYS revela os
-- nomes exactos. Se eu errei um nome (ex: "cashValidated" vs "cashValidatedByName"),
-- vê-se aqui. Funciona MESMO em reservas antigas (rawJson sempre foi gravado).
SELECT
  externalId,
  JSON_KEYS(rawJson)                              AS chaves_topo,
  JSON_KEYS(JSON_EXTRACT(rawJson, '$.pricing'))   AS chaves_pricing
FROM multipark_bookings
WHERE rawJson IS NOT NULL
ORDER BY updatedAt DESC
LIMIT 5;


-- ── E. Os valores existem no rawJson com os nomes que assumi? ────────────────
-- Se uma coluna j_* vier sempre NULL mas a reserva tinha o dado → nome errado.
-- (compara depois com o que a query F mostrou)
SELECT
  externalId,
  JSON_EXTRACT(rawJson, '$.cashValidatedByName')        AS j_cashVal,
  JSON_EXTRACT(rawJson, '$.driverValidatedByName')      AS j_driverVal,
  JSON_EXTRACT(rawJson, '$.cashierClosedByName')        AS j_cashierClosed,
  JSON_EXTRACT(rawJson, '$.pro')                        AS j_pro,
  JSON_EXTRACT(rawJson, '$.partnerId')                  AS j_partnerId,
  JSON_EXTRACT(rawJson, '$.campaignId')                 AS j_campaignId,
  JSON_EXTRACT(rawJson, '$.pricing.totalPaid')          AS j_totalPaid,
  JSON_LENGTH(JSON_EXTRACT(rawJson, '$.extraServices')) AS j_n_extras
FROM multipark_bookings
WHERE rawJson IS NOT NULL
ORDER BY updatedAt DESC
LIMIT 10;


-- ── D. As 7 colunas novas existem mesmo? (deve devolver 7 linhas) ────────────
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME   = 'multipark_bookings'
  AND COLUMN_NAME IN ('totalPaid','pro','partnerId','campaignId',
                      'cashValidatedByName','driverValidatedByName','cashierClosedByName');


-- ── A. COBERTURA: das reservas sincronizadas no último dia, quantas têm cada ──
-- campo preenchido? Se um contador = 0 com total_recentes alto → campo não chega
-- à coluna (provável nome errado no mapping; confirmar com F/E).
SELECT
  COUNT(*)                                  AS total_recentes,
  SUM(cashValidatedByName   IS NOT NULL)    AS cash_val,
  SUM(driverValidatedByName IS NOT NULL)    AS driver_val,
  SUM(cashierClosedByName   IS NOT NULL)    AS cashier_closed,
  SUM(pro = 1)                              AS pro_true,
  SUM(totalPaid  IS NOT NULL)               AS total_paid,
  SUM(partnerId  IS NOT NULL)               AS partner_id,
  SUM(campaignId IS NOT NULL)               AS campaign_id
FROM multipark_bookings
WHERE updatedAt >= (NOW() - INTERVAL 1 DAY);


-- ── B. Amostra das colunas novas já gravadas ────────────────────────────────
SELECT externalId, status, parkName, totalPrice, totalPaid, pro,
       partnerId, campaignId,
       cashValidatedByName, driverValidatedByName, cashierClosedByName,
       updatedAt
FROM multipark_bookings
WHERE updatedAt >= (NOW() - INTERVAL 1 DAY)
ORDER BY updatedAt DESC
LIMIT 20;


-- ── C. Tabela-filha dos extras: existe e está a popular? ────────────────────
SELECT
  COUNT(*)                            AS total_linhas_extras,
  COUNT(DISTINCT bookingExternalId)   AS reservas_com_extras,
  SUM(done = 1)                       AS servicos_feitos,
  SUM(done = 0)                       AS servicos_por_fazer
FROM multipark_booking_extras;

-- Amostra com join à reserva
SELECT e.bookingExternalId, b.parkName, e.name, e.description, e.price, e.done, e.syncedAt
FROM multipark_booking_extras e
LEFT JOIN multipark_bookings b ON b.externalId = e.bookingExternalId
ORDER BY e.syncedAt DESC
LIMIT 20;
