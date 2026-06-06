-- Timeline completa de cada reserva (check-in, check-out, movimentos, etc.).
-- Vem de GET /bookings/:id/history e GET /agent/history.

CREATE TABLE `multipark_booking_history` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `bookingExternalId` VARCHAR(128) NOT NULL,
  `historyId` VARCHAR(128) NOT NULL,
  `changeType` VARCHAR(32),
  `actionTime` TIMESTAMP NULL,
  `remarks` TEXT,
  `agentName` VARCHAR(256),
  `agentUserId` VARCHAR(128),
  `agentEmail` VARCHAR(320),
  `modifiedFields` TEXT,
  `platform` VARCHAR(32),
  `fetchedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_booking_history` (`bookingExternalId`, `historyId`),
  INDEX `idx_bh_booking` (`bookingExternalId`),
  INDEX `idx_bh_agent` (`agentUserId`),
  INDEX `idx_bh_actionTime` (`actionTime`),
  INDEX `idx_bh_changeType` (`changeType`)
);

-- Resumos extraídos do history que afixamos directamente na reserva
-- (para queries rápidas sem JOIN ao history).
ALTER TABLE `multipark_bookings`
  ADD COLUMN `currentGarage` VARCHAR(64) NULL,
  ADD COLUMN `currentSpot` VARCHAR(64) NULL,
  ADD COLUMN `lastKnownMileage` INT NULL,
  ADD COLUMN `checkinAgentName` VARCHAR(256) NULL,
  ADD COLUMN `checkinAgentUserId` VARCHAR(128) NULL,
  ADD COLUMN `checkoutAgentName` VARCHAR(256) NULL,
  ADD COLUMN `checkoutAgentUserId` VARCHAR(128) NULL,
  ADD COLUMN `historyFetchedAt` TIMESTAMP NULL;

CREATE INDEX `idx_mb_checkin_agent` ON `multipark_bookings` (`checkinAgentUserId`);
CREATE INDEX `idx_mb_checkout_agent` ON `multipark_bookings` (`checkoutAgentUserId`);
