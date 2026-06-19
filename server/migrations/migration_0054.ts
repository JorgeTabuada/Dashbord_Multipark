// Migration 0054 — Notas/dados adicionais do cliente nas Reclamações e Perdidos.
// Campo livre para guardar mais informação que temos do cliente além do básico.
// Aplicada via runMigration0054 + auto-apply idempotente no getDb.

export const MIGRATION_0054_NAME = "0054_client_notes";

export const MIGRATION_0054_STATEMENTS: string[] = [
  `ALTER TABLE \`complaints\` ADD COLUMN \`clientNotes\` TEXT NULL`,
  `ALTER TABLE \`lost_found_items\` ADD COLUMN \`clientNotes\` TEXT NULL`,
];

export const IDEMPOTENT_ERROR_CODES_0054 = new Set([
  "ER_TABLE_EXISTS_ERROR",
  "ER_DUP_KEYNAME",
  "ER_DUP_FIELDNAME",
]);
