-- 0044 — Revamp RH:
-- 1. Tabela de ausências (férias, baixa) por funcionário
-- 2. Histórico de salários (mínimo 2 anos)
-- 3. Penalizações por falta no extras-dia
-- 4. Reorganiza extra_rates: 4 níveis com nomes do extras-dia, mínimo €4,50
-- 5. Flags em employees para bloqueio por docs em falta

-- ── 1. Férias / baixas ──────────────────────────────────────────────────────
CREATE TABLE `employee_leaves` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `employeeId` INT NOT NULL,
  `leaveType` ENUM('vacation','sick','unpaid','other') NOT NULL DEFAULT 'vacation',
  `fromDate` VARCHAR(10) NOT NULL,
  `toDate` VARCHAR(10) NOT NULL,
  `notes` VARCHAR(255) NULL,
  `createdById` INT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_employee_leaves_emp` (`employeeId`),
  INDEX `idx_employee_leaves_dates` (`fromDate`, `toDate`)
);

-- ── 2. Histórico salários ───────────────────────────────────────────────────
CREATE TABLE `employee_salary_history` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `employeeId` INT NOT NULL,
  `monthlySalary` DECIMAL(10, 2) NULL,
  `mealAllowancePerDay` DECIMAL(6, 2) NULL,
  `effectiveFrom` VARCHAR(10) NOT NULL,
  `effectiveUntil` VARCHAR(10) NULL,
  `changedById` INT NULL,
  `notes` VARCHAR(255) NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_salary_history_emp` (`employeeId`),
  INDEX `idx_salary_history_from` (`effectiveFrom`)
);

-- Snapshot inicial: copia o salário actual de cada funcionário com base
-- na data de início do contrato (ou primeiro do ano se não tiver).
INSERT INTO `employee_salary_history` (`employeeId`, `monthlySalary`, `mealAllowancePerDay`, `effectiveFrom`, `notes`)
SELECT
  `id`,
  `monthlySalary`,
  `mealAllowancePerDay`,
  COALESCE(DATE_FORMAT(`contractStart`, '%Y-%m-%d'), '2024-01-01'),
  'Snapshot inicial (migração 0044)'
FROM `employees`
WHERE `isActive` = 1 AND (`monthlySalary` IS NOT NULL OR `mealAllowancePerDay` IS NOT NULL);

-- ── 3. Penalizações ─────────────────────────────────────────────────────────
CREATE TABLE `employee_penalties` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `employeeId` INT NOT NULL,
  `reason` ENUM('no_show_extra_dia','speeding','lost_found_investigation','complaint_investigation','other') NOT NULL,
  `severity` ENUM('warning','penalty','serious') NOT NULL DEFAULT 'penalty',
  `points` INT NOT NULL DEFAULT 1,
  `relatedId` INT NULL,
  `notes` VARCHAR(512) NULL,
  `clearedAt` TIMESTAMP NULL,
  `clearedById` INT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_employee_penalties_emp` (`employeeId`),
  INDEX `idx_employee_penalties_open` (`employeeId`, `clearedAt`)
);

-- ── 4. Reorganiza extra_rates ───────────────────────────────────────────────
-- Adiciona coluna levelName (mapping com extras_dia_assignments.level)
ALTER TABLE `extra_rates` ADD COLUMN `levelName` VARCHAR(32) NULL;

-- Apaga tudo o que estava lá e regrava 4 níveis com nomes do extras-dia.
-- Mantém o esquema `level` int (1=junior...4=master) por compatibilidade.
DELETE FROM `extra_rates`;
INSERT INTO `extra_rates` (`level`, `levelName`, `hourlyRate`, `label`) VALUES
  (1, 'junior',   4.50, 'Extra Junior'),
  (2, 'senior',   5.00, 'Extra Senior'),
  (3, 'terminal', 5.50, 'Extra Terminal'),
  (4, 'master',   6.00, 'Extra Master');

CREATE INDEX `idx_extra_rates_levelname` ON `extra_rates` (`levelName`);

-- Funcionários com extraLevel=5 (já não existe) → cai para 1 (junior, mais barato)
UPDATE `employees` SET `extraLevel` = 1 WHERE `extraLevel` = 5;

-- ── 5. Flags de bloqueio por docs ──────────────────────────────────────────
ALTER TABLE `employees`
  ADD COLUMN `docsWarningAt` TIMESTAMP NULL,
  ADD COLUMN `loginBlocked` TINYINT NOT NULL DEFAULT 0,
  ADD COLUMN `loginBlockedReason` VARCHAR(255) NULL;
