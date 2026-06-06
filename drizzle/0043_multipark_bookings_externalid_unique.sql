-- Fix: multipark_bookings duplicados por externalId
--
-- O índice "multipark_bookings_externalId_unique" existia mas não era
-- UNIQUE — só um índice normal. Em consequência, o upsertMultiparkBooking
-- (SELECT existente + INSERT) sofre race condition quando o sync corre
-- várias action types em paralelo (Promise.allSettled): duas inserções
-- concorrentes do mesmo booking passam ambas. Isto provoca duplicados na
-- DB e inflação da receita produzida (visto em Airpark Lisboa).
--
-- Esta migration:
--  1) Apaga duplicados, mantendo o registo com updatedAt mais recente
--     (e em empate o id mais alto, que é o mais novo).
--  2) Recria o índice como UNIQUE para que daqui para a frente o upsert
--     possa usar INSERT ... ON DUPLICATE KEY UPDATE de forma atómica.

-- 1) Apaga duplicados
DELETE b1 FROM multipark_bookings b1
INNER JOIN multipark_bookings b2
  ON b1.externalId = b2.externalId
 AND (
       b1.updatedAt < b2.updatedAt
    OR (b1.updatedAt = b2.updatedAt AND b1.id < b2.id)
 );

-- 2) Substituir o índice por UNIQUE
ALTER TABLE multipark_bookings DROP INDEX multipark_bookings_externalId_unique;
ALTER TABLE multipark_bookings ADD UNIQUE INDEX multipark_bookings_externalId_unique (externalId);
