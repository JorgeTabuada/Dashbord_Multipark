// Migration 0048 — Métricas diárias nas campanhas (internal_campaign_costs).
// Acrescenta impressões, cliques, CTR, conversões e valor de conversões ao
// registo de gasto diário, para o botão "Atualizar campanhas" do Marketing.
// Aplicada via endpoint admin one-shot (runMigration0048), idempotente.

export const MIGRATION_0048_NAME = "0048_campaign_daily_metrics";

export const MIGRATION_0048_STATEMENTS: string[] = [
  "ALTER TABLE `internal_campaign_costs` ADD COLUMN `impressions` INT NULL AFTER `amount`",
  "ALTER TABLE `internal_campaign_costs` ADD COLUMN `clicks` INT NULL AFTER `impressions`",
  "ALTER TABLE `internal_campaign_costs` ADD COLUMN `ctr` DECIMAL(7,3) NULL AFTER `clicks`",
  "ALTER TABLE `internal_campaign_costs` ADD COLUMN `conversions` DECIMAL(10,2) NULL AFTER `ctr`",
  "ALTER TABLE `internal_campaign_costs` ADD COLUMN `conversionValue` DECIMAL(10,2) NULL AFTER `conversions`",
];

export const IDEMPOTENT_ERROR_CODES_0048 = new Set([
  "ER_DUP_FIELDNAME",
  "ER_DUP_KEYNAME",
]);
