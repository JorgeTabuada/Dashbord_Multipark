// Migration 0047 — Campanhas internas (das reservas Multipark).
// 3 tabelas: internal_campaigns (campanha lógica), internal_campaign_keys
// (campaignId/nome/url que lhe pertencem) e internal_campaign_costs (gasto/dia).
// Aplicada via endpoint admin one-shot (runMigration0047), idempotente.

export const MIGRATION_0047_NAME = "0047_internal_campaigns";

export const MIGRATION_0047_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS \`internal_campaigns\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`name\` VARCHAR(256) NOT NULL,
    \`city\` VARCHAR(64) NULL,
    \`brand\` VARCHAR(32) NULL,
    \`campaignStatus\` ENUM('active','paused','completed') NOT NULL DEFAULT 'active',
    \`notes\` TEXT NULL,
    \`createdById\` INT NULL,
    \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updatedAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS \`internal_campaign_keys\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`campaignId\` INT NOT NULL,
    \`keyType\` ENUM('campaign_id','campaign_name','url_pattern') NOT NULL,
    \`keyValue\` VARCHAR(512) NOT NULL,
    \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE INDEX \`internal_campaign_keys_type_value_unique\` (\`keyType\`, \`keyValue\`),
    INDEX \`idx_internal_campaign_keys_campaign\` (\`campaignId\`)
  )`,

  `CREATE TABLE IF NOT EXISTS \`internal_campaign_costs\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`campaignId\` INT NOT NULL,
    \`costDate\` VARCHAR(10) NOT NULL,
    \`amount\` DECIMAL(10,2) NOT NULL,
    \`notes\` VARCHAR(255) NULL,
    \`createdById\` INT NULL,
    \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE INDEX \`internal_campaign_costs_campaign_date_unique\` (\`campaignId\`, \`costDate\`)
  )`,
];

export const IDEMPOTENT_ERROR_CODES_0047 = new Set([
  "ER_DUP_FIELDNAME",
  "ER_DUP_KEYNAME",
  "ER_TABLE_EXISTS_ERROR",
  "ER_DUP_ENTRY",
]);
