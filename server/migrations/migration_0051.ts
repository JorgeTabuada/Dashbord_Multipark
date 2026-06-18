// Migration 0051 — Threading de emails inbound.
// Adiciona à inbound_emails o id de thread do Gmail (X-GM-THRID) e as referências
// de cabeçalho (In-Reply-To + References). Permite agrupar RESPOSTAS do cliente
// na mesma reclamação/perdido, mesmo quando o corpo não traz o email estruturado.
// Aplicada via runMigration0051, idempotente (ADD COLUMN/INDEX já existente = skip).

export const MIGRATION_0051_NAME = "0051_inbound_email_threading";

export const MIGRATION_0051_STATEMENTS: string[] = [
  `ALTER TABLE \`inbound_emails\` ADD COLUMN \`gmThreadId\` VARCHAR(64) NULL`,
  `ALTER TABLE \`inbound_emails\` ADD COLUMN \`headerRefs\` TEXT NULL`,
  `CREATE INDEX \`inbound_emails_gm_thread_idx\` ON \`inbound_emails\` (\`gmThreadId\`)`,
];

export const IDEMPOTENT_ERROR_CODES_0051 = new Set([
  "ER_TABLE_EXISTS_ERROR",
  "ER_DUP_KEYNAME",
  "ER_DUP_FIELDNAME",
]);
