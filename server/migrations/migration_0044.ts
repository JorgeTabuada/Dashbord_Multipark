// Migration 0044 — Revamp RH (aplicada via endpoint admin one-shot)
// Cada entrada é um SQL statement individual; o runner envia-os
// um a um via drizzle.execute(sql.raw(stmt)).

export const MIGRATION_0044_NAME = "0044_rh_revamp";

export const MIGRATION_0044_STATEMENTS: string[] = [
  // ── 1. Férias / baixas ────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS \`employee_leaves\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`employeeId\` INT NOT NULL,
    \`leaveType\` ENUM('vacation','sick','unpaid','other') NOT NULL DEFAULT 'vacation',
    \`fromDate\` VARCHAR(10) NOT NULL,
    \`toDate\` VARCHAR(10) NOT NULL,
    \`notes\` VARCHAR(255) NULL,
    \`createdById\` INT NULL,
    \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX \`idx_employee_leaves_emp\` (\`employeeId\`),
    INDEX \`idx_employee_leaves_dates\` (\`fromDate\`, \`toDate\`)
  )`,

  // ── 2. Histórico salários ─────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS \`employee_salary_history\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`employeeId\` INT NOT NULL,
    \`monthlySalary\` DECIMAL(10, 2) NULL,
    \`mealAllowancePerDay\` DECIMAL(6, 2) NULL,
    \`effectiveFrom\` VARCHAR(10) NOT NULL,
    \`effectiveUntil\` VARCHAR(10) NULL,
    \`changedById\` INT NULL,
    \`notes\` VARCHAR(255) NULL,
    \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX \`idx_salary_history_emp\` (\`employeeId\`),
    INDEX \`idx_salary_history_from\` (\`effectiveFrom\`)
  )`,

  // Snapshot inicial: copia o salário actual de cada colaborador.
  // INSERT IGNORE evita falhar se a migration correr 2× (não duplica).
  `INSERT INTO \`employee_salary_history\` (\`employeeId\`, \`monthlySalary\`, \`mealAllowancePerDay\`, \`effectiveFrom\`, \`notes\`)
   SELECT e.\`id\`, e.\`monthlySalary\`, e.\`mealAllowancePerDay\`,
          COALESCE(DATE_FORMAT(e.\`contractStart\`, '%Y-%m-%d'), '2024-01-01'),
          'Snapshot inicial (migração 0044)'
   FROM \`employees\` e
   LEFT JOIN \`employee_salary_history\` h ON h.\`employeeId\` = e.\`id\`
   WHERE e.\`isActive\` = 1
     AND (e.\`monthlySalary\` IS NOT NULL OR e.\`mealAllowancePerDay\` IS NOT NULL)
     AND h.\`id\` IS NULL`,

  // ── 3. Penalizações ──────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS \`employee_penalties\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`employeeId\` INT NOT NULL,
    \`reason\` ENUM('no_show_extra_dia','speeding','lost_found_investigation','complaint_investigation','other') NOT NULL,
    \`severity\` ENUM('warning','penalty','serious') NOT NULL DEFAULT 'penalty',
    \`points\` INT NOT NULL DEFAULT 1,
    \`relatedId\` INT NULL,
    \`notes\` VARCHAR(512) NULL,
    \`clearedAt\` TIMESTAMP NULL,
    \`clearedById\` INT NULL,
    \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX \`idx_employee_penalties_emp\` (\`employeeId\`),
    INDEX \`idx_employee_penalties_open\` (\`employeeId\`, \`clearedAt\`)
  )`,

  // ── 4. extra_rates: adicionar levelName se não existir ───────────────────
  // MySQL antigo não tem IF NOT EXISTS em ADD COLUMN. Verificamos via
  // information_schema antes (statement separado mais à frente, na app).
  // Para tornar idempotente, fazemos um UPDATE seguro depois.
  // 1ª tentativa: ADD COLUMN. Se já existir, o runner ignora o erro.
  `ALTER TABLE \`extra_rates\` ADD COLUMN \`levelName\` VARCHAR(32) NULL`,

  // Limpa e regrava os 4 níveis canónicos
  `DELETE FROM \`extra_rates\``,

  `INSERT INTO \`extra_rates\` (\`level\`, \`levelName\`, \`hourlyRate\`, \`label\`) VALUES
    (1, 'junior',   4.50, 'Extra Junior'),
    (2, 'senior',   5.00, 'Extra Senior'),
    (3, 'terminal', 5.50, 'Extra Terminal'),
    (4, 'master',   6.00, 'Extra Master')`,

  // CREATE INDEX falha se já existe — wrapped em try/catch no runner
  `CREATE INDEX \`idx_extra_rates_levelname\` ON \`extra_rates\` (\`levelName\`)`,

  // Migra extras de nível 5 para 1 (junior)
  `UPDATE \`employees\` SET \`extraLevel\` = 1 WHERE \`extraLevel\` = 5`,

  // ── 5. employees: flags de bloqueio por docs ─────────────────────────────
  `ALTER TABLE \`employees\` ADD COLUMN \`docsWarningAt\` TIMESTAMP NULL`,

  `ALTER TABLE \`employees\` ADD COLUMN \`loginBlocked\` TINYINT NOT NULL DEFAULT 0`,

  `ALTER TABLE \`employees\` ADD COLUMN \`loginBlockedReason\` VARCHAR(255) NULL`,
];

/** Erros que indicam idempotência (já aplicado) — ignorar no runner */
export const IDEMPOTENT_ERROR_CODES = new Set([
  "ER_DUP_FIELDNAME",      // ADD COLUMN onde já existe
  "ER_DUP_KEYNAME",        // CREATE INDEX onde já existe
  "ER_TABLE_EXISTS_ERROR", // CREATE TABLE (mesmo com IF NOT EXISTS é seguro)
  "ER_DUP_ENTRY",          // INSERT duplicado
]);
