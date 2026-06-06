-- O /bookings/:id devolve origin e originUrl com info de UTM/canal.
-- Antes guardávamos os outros campos enriquecidos mas não estes.

ALTER TABLE `multipark_bookings`
  ADD COLUMN `origin` VARCHAR(64) NULL,
  ADD COLUMN `originUrl` VARCHAR(512) NULL;

CREATE INDEX `idx_multipark_bookings_origin` ON `multipark_bookings` (`origin`);
