ALTER TABLE `multipark_bookings`
  ADD COLUMN `paymentMethod` VARCHAR(32) NULL;

CREATE INDEX `idx_multipark_bookings_payment_method`
  ON `multipark_bookings` (`paymentMethod`);
