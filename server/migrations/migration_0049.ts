// Migration 0049 — Tabela inbound_emails.
// Guarda todos os emails lidos por IMAP da reservas@multipark.pt e roteados para
// os módulos (Críticas/Reclamações/Perdidos/RH). Serve de log + dedup (messageId
// único) + fonte da aba "Recrutamento" do RH.
// Aplicada via endpoint admin one-shot (runMigration0049), idempotente.

export const MIGRATION_0049_NAME = "0049_inbound_emails";

export const MIGRATION_0049_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS \`inbound_emails\` (
    \`id\` INT NOT NULL AUTO_INCREMENT,
    \`messageId\` VARCHAR(255) NOT NULL,
    \`alias\` VARCHAR(40) NOT NULL,
    \`fromName\` VARCHAR(255) NULL,
    \`fromEmail\` VARCHAR(320) NULL,
    \`clientName\` VARCHAR(255) NULL,
    \`clientEmail\` VARCHAR(320) NULL,
    \`clientPhone\` VARCHAR(50) NULL,
    \`vehiclePlate\` VARCHAR(20) NULL,
    \`bookingRef\` VARCHAR(100) NULL,
    \`subject\` VARCHAR(500) NULL,
    \`bodyText\` TEXT NULL,
    \`attachmentsJson\` TEXT NULL,
    \`targetModule\` VARCHAR(40) NULL,
    \`targetId\` INT NULL,
    \`taskId\` INT NULL,
    \`status\` ENUM('processed','skipped','error') NOT NULL DEFAULT 'processed',
    \`errorMsg\` VARCHAR(500) NULL,
    \`receivedAt\` TIMESTAMP NULL,
    \`processedAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`inbound_emails_message_id_unique\` (\`messageId\`),
    KEY \`inbound_emails_alias_idx\` (\`alias\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
];

export const IDEMPOTENT_ERROR_CODES_0049 = new Set([
  "ER_TABLE_EXISTS_ERROR",
  "ER_DUP_KEYNAME",
  "ER_DUP_FIELDNAME",
]);
