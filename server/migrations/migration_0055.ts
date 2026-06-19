// Migration 0055 — Condutores anexados a um caso de Perdidos & Achados (roubos).
// Permite anexar a um caso o condutor que mexeu no carro (do histórico da API) ou
// qualquer colaborador (manual), guardando um resumo das movimentações desse dia
// — para investigar quem teve acesso ao carro e cruzar entre casos.

export const MIGRATION_0055_NAME = "0055_lostfound_attached_drivers";

export const MIGRATION_0055_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS \`lost_found_attached_drivers\` (
    \`id\` INT NOT NULL AUTO_INCREMENT,
    \`itemId\` INT NOT NULL,
    \`employeeId\` INT NULL,
    \`driverName\` VARCHAR(256) NOT NULL,
    \`source\` VARCHAR(32) NOT NULL DEFAULT 'manual',
    \`movementDate\` VARCHAR(10) NULL,
    \`movementsSummary\` VARCHAR(512) NULL,
    \`notes\` VARCHAR(512) NULL,
    \`attachedById\` INT NULL,
    \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    KEY \`idx_lfad_item\` (\`itemId\`),
    KEY \`idx_lfad_employee\` (\`employeeId\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
];

export const IDEMPOTENT_ERROR_CODES_0055 = new Set([
  "ER_TABLE_EXISTS_ERROR",
  "ER_DUP_KEYNAME",
  "ER_DUP_FIELDNAME",
]);
