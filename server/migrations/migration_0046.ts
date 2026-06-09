// Migration 0046 — Captura de campos novos do /bookings/report
// (validação cash/driver/cashier, pro, totalPaid, partnerId, campaignId) +
// tabela-filha multipark_booking_extras para os extraServices itemizados.
// Aplicada via endpoint admin one-shot (runMigration0046), tal como a 0044.
// Cada entrada é um SQL statement individual, enviado via sql.raw().

export const MIGRATION_0046_NAME = "0046_multipark_report_extra_fields";

export const MIGRATION_0046_STATEMENTS: string[] = [
  // ── 1. Novas colunas em multipark_bookings ────────────────────────────────
  `ALTER TABLE \`multipark_bookings\` ADD COLUMN \`totalPaid\` DECIMAL(10,2) NULL`,
  `ALTER TABLE \`multipark_bookings\` ADD COLUMN \`pro\` TINYINT DEFAULT 0`,
  `ALTER TABLE \`multipark_bookings\` ADD COLUMN \`partnerId\` VARCHAR(128) NULL`,
  `ALTER TABLE \`multipark_bookings\` ADD COLUMN \`partnerName\` VARCHAR(256) NULL`,
  `ALTER TABLE \`multipark_bookings\` ADD COLUMN \`campaignId\` VARCHAR(128) NULL`,
  `ALTER TABLE \`multipark_bookings\` ADD COLUMN \`campaignName\` VARCHAR(256) NULL`,
  `ALTER TABLE \`multipark_bookings\` ADD COLUMN \`cashValidatedByName\` VARCHAR(256) NULL`,
  `ALTER TABLE \`multipark_bookings\` ADD COLUMN \`driverValidatedByName\` VARCHAR(256) NULL`,
  `ALTER TABLE \`multipark_bookings\` ADD COLUMN \`cashierClosedByName\` VARCHAR(256) NULL`,

  // ── 2. Tabela-filha dos extraServices itemizados ──────────────────────────
  `CREATE TABLE IF NOT EXISTS \`multipark_booking_extras\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`bookingExternalId\` VARCHAR(128) NOT NULL,
    \`extraId\` VARCHAR(128) NULL,
    \`name\` VARCHAR(256) NULL,
    \`description\` VARCHAR(512) NULL,
    \`price\` DECIMAL(10,2) NULL,
    \`done\` TINYINT DEFAULT 0,
    \`syncedAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX \`idx_mp_booking_extras_booking\` (\`bookingExternalId\`)
  )`,
];

export const IDEMPOTENT_ERROR_CODES_0046 = new Set([
  "ER_DUP_FIELDNAME",      // ADD COLUMN onde já existe
  "ER_DUP_KEYNAME",        // CREATE INDEX onde já existe
  "ER_TABLE_EXISTS_ERROR", // CREATE TABLE (mesmo com IF NOT EXISTS é seguro)
  "ER_DUP_ENTRY",          // INSERT duplicado
]);
