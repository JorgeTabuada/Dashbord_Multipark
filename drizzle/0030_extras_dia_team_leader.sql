-- Adiciona flag de team leader às atribuições e permite level NULL para TL.
-- TL não conta para os condutores (não transporta carros), tem o seu próprio custo
-- calculado a partir de employees.monthlySalary / 15 dias úteis.

ALTER TABLE `extras_dia_assignments`
  ADD COLUMN `isTeamLeader` TINYINT NOT NULL DEFAULT 0;

ALTER TABLE `extras_dia_assignments`
  MODIFY COLUMN `level` ENUM('junior','senior','terminal','master') NULL;
