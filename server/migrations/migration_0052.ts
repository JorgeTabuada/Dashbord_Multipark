// Migration 0052 — Devolução estruturada + email ao cliente nos Perdidos & Achados.
// Acrescenta à lost_found_items: onde/quem encontrou, dados da devolução
// (método, data, foto/assinatura) e tracking do email ao cliente.
// Aplicada via runMigration0052 + auto-apply idempotente no getDb.

export const MIGRATION_0052_NAME = "0052_lostfound_return_fields";

export const MIGRATION_0052_STATEMENTS: string[] = [
  `ALTER TABLE \`lost_found_items\` ADD COLUMN \`foundLocation\` VARCHAR(255) NULL`,
  `ALTER TABLE \`lost_found_items\` ADD COLUMN \`foundByName\` VARCHAR(255) NULL`,
  `ALTER TABLE \`lost_found_items\` ADD COLUMN \`returnMethod\` VARCHAR(100) NULL`,
  `ALTER TABLE \`lost_found_items\` ADD COLUMN \`returnedAt\` TIMESTAMP NULL`,
  `ALTER TABLE \`lost_found_items\` ADD COLUMN \`returnPhotoUrl\` TEXT NULL`,
  `ALTER TABLE \`lost_found_items\` ADD COLUMN \`returnPhotoKey\` VARCHAR(512) NULL`,
  `ALTER TABLE \`lost_found_items\` ADD COLUMN \`clientEmailSentAt\` TIMESTAMP NULL`,
];

export const IDEMPOTENT_ERROR_CODES_0052 = new Set([
  "ER_TABLE_EXISTS_ERROR",
  "ER_DUP_KEYNAME",
  "ER_DUP_FIELDNAME",
]);
