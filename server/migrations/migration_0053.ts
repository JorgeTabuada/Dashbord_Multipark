// Migration 0053 — Atribuição (prazo) + auditoria nas Reclamações e Perdidos&Achados.
// Grupo = projectId (já existe) · pessoa = assignedToId/assignedTo (já existe).
// Acrescenta: dueDate (prazo dado pelo responsável), investigatedById (quem
// investigou) e closedById/closedAt (quem fechou e quando).
// Aplicada via runMigration0053 + auto-apply idempotente no getDb.

export const MIGRATION_0053_NAME = "0053_case_assignment_audit";

export const MIGRATION_0053_STATEMENTS: string[] = [
  // Reclamações
  `ALTER TABLE \`complaints\` ADD COLUMN \`dueDate\` TIMESTAMP NULL`,
  `ALTER TABLE \`complaints\` ADD COLUMN \`investigatedById\` INT NULL`,
  `ALTER TABLE \`complaints\` ADD COLUMN \`closedById\` INT NULL`,
  `ALTER TABLE \`complaints\` ADD COLUMN \`closedAt\` TIMESTAMP NULL`,
  // Perdidos & Achados
  `ALTER TABLE \`lost_found_items\` ADD COLUMN \`dueDate\` TIMESTAMP NULL`,
  `ALTER TABLE \`lost_found_items\` ADD COLUMN \`investigatedById\` INT NULL`,
  `ALTER TABLE \`lost_found_items\` ADD COLUMN \`closedById\` INT NULL`,
  `ALTER TABLE \`lost_found_items\` ADD COLUMN \`closedAt\` TIMESTAMP NULL`,
];

export const IDEMPOTENT_ERROR_CODES_0053 = new Set([
  "ER_TABLE_EXISTS_ERROR",
  "ER_DUP_KEYNAME",
  "ER_DUP_FIELDNAME",
]);
