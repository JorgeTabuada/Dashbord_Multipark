-- Classificação derivada do número de allocation (5 dígitos).
-- 1º dígito = marca (1=airpark, 2=redpark, 3=skypark)
-- Resto: 0000-4999=descoberto, 5000-7999=coberto, 8000-9999=indoor
-- Para parques com allocation em letras (Top-Parking, etc.): unknown.

ALTER TABLE `multipark_bookings`
  ADD COLUMN `spotType` ENUM('covered','uncovered','indoor','unknown') NULL,
  ADD COLUMN `parkBrand` VARCHAR(16) NULL;

CREATE INDEX `idx_multipark_bookings_spot_type` ON `multipark_bookings` (`spotType`);
