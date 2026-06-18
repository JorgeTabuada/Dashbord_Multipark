// Migration 0050 — Tabela extras_availability.
// Disponibilidade semanal declarada pelos próprios extras: cada linha = um dia
// da semana para um extra, com turnos (manhã/noite) e/ou horas custom.
// O extra preenche na app (página /disponibilidade, autenticado com o login dele);
// o backoffice envia o pedido por email uma vez por semana e vê o resumo.
// UNIQUE (employeeId, day) → upsert por dia. Aplicada via runMigration0050, idempotente.

export const MIGRATION_0050_NAME = "0050_extras_availability";

export const MIGRATION_0050_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS \`extras_availability\` (
    \`id\` INT NOT NULL AUTO_INCREMENT,
    \`employeeId\` INT NOT NULL,
    \`weekStart\` VARCHAR(10) NOT NULL,
    \`day\` VARCHAR(10) NOT NULL,
    \`morning\` TINYINT NOT NULL DEFAULT 0,
    \`night\` TINYINT NOT NULL DEFAULT 0,
    \`fromHour\` INT NULL,
    \`toHour\` INT NULL,
    \`note\` VARCHAR(300) NULL,
    \`createdById\` INT NULL,
    \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updatedAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`extras_availability_emp_day_unique\` (\`employeeId\`, \`day\`),
    KEY \`extras_availability_week_idx\` (\`weekStart\`),
    KEY \`extras_availability_emp_idx\` (\`employeeId\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
];

export const IDEMPOTENT_ERROR_CODES_0050 = new Set([
  "ER_TABLE_EXISTS_ERROR",
  "ER_DUP_KEYNAME",
  "ER_DUP_FIELDNAME",
]);
