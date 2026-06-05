-- Cada dia tem dois turnos: manhã (03:00-15:00) e noite (15:00-03:00 do dia seguinte).
-- Cada turno tem o seu próprio TL e condutores.

ALTER TABLE `extras_dia_assignments`
  ADD COLUMN `shift` ENUM('morning','night') NOT NULL DEFAULT 'morning';

CREATE INDEX `idx_extras_dia_date_shift` ON `extras_dia_assignments` (`assignmentDate`, `shift`);
