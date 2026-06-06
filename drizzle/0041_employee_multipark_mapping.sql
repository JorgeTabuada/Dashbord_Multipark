-- Multipark API devolve só primeiro + último nome do condutor.
-- Para nomes longos ou com diacríticos diferentes do que está em RH,
-- permitimos override manual + guardar o userId quando conhecido.

ALTER TABLE `employees`
  ADD COLUMN `multiparkAgentName` VARCHAR(256) NULL,
  ADD COLUMN `multiparkAgentUserId` VARCHAR(128) NULL;

CREATE INDEX `idx_employees_multipark_agent_userid` ON `employees` (`multiparkAgentUserId`);
