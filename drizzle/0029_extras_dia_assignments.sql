-- Extras Dia: turnos atribuídos pelo gestor por dia.
-- Cada linha = uma pessoa escalada para um turno num determinado dia.
-- sent_home_hour: quando preenchido, a pessoa foi mandada para casa antes do endHour.
-- Custo no servidor: (sent_home_hour ?? end_hour - start_hour) * rate(level).

CREATE TABLE `extras_dia_assignments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `assignment_date` VARCHAR(10) NOT NULL,
  `employee_id` INT NULL,
  `person_name` VARCHAR(128) NOT NULL,
  `level` ENUM('junior','senior','terminal','master') NOT NULL DEFAULT 'junior',
  `start_hour` INT NOT NULL,
  `end_hour` INT NOT NULL,
  `sent_home_hour` INT NULL,
  `notes` VARCHAR(255) NULL,
  `created_by_id` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_extras_dia_date` (`assignment_date`)
);
