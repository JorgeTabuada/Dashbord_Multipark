-- deliveryType vem só de /bookings/:id (não de /bookings/report).
-- Exemplos vistos: "Aeroporto Terminal 1", "Aeroporto Terminal 2", "Oriente", "Rossio".

ALTER TABLE `multipark_bookings`
  ADD COLUMN `deliveryType` VARCHAR(64) NULL,
  ADD COLUMN `returnFlight` VARCHAR(32) NULL,
  ADD COLUMN `departingFlight` VARCHAR(32) NULL,
  ADD COLUMN `remarks` VARCHAR(512) NULL,
  ADD COLUMN `enrichedAt` TIMESTAMP NULL;

CREATE INDEX `idx_multipark_bookings_delivery_type` ON `multipark_bookings` (`deliveryType`);
