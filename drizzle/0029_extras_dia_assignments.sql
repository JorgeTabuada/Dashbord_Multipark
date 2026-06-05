-- Extras Dia: turnos atribuídos pelo gestor por dia.
-- Cada linha = uma pessoa escalada para um turno num determinado dia.
-- sentHomeHour: quando preenchido, a pessoa foi mandada para casa antes do endHour.
-- Custo no servidor: (sentHomeHour ?? endHour - startHour) * rate(level).

CREATE TABLE `extras_dia_assignments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `assignmentDate` VARCHAR(10) NOT NULL,
  `employeeId` INT NULL,
  `personName` VARCHAR(128) NOT NULL,
  `level` ENUM('junior','senior','terminal','master') NOT NULL DEFAULT 'junior',
  `startHour` INT NOT NULL,
  `endHour` INT NOT NULL,
  `sentHomeHour` INT NULL,
  `notes` VARCHAR(255) NULL,
  `createdById` INT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_extras_dia_date` (`assignmentDate`)
);
