// Migration 0045 — Re-aplicar dedup de multipark_bookings + UNIQUE constraint.
// A migration 0043 supostamente criou o UNIQUE, mas algo no caminho perdeu-o
// (provavelmente o sync com `onDuplicateKeyUpdate` numa coluna sem UNIQUE
// gerou novas inserções em vez de updates). Re-aplica de forma idempotente.

export const MIGRATION_0045_NAME = "0045_fix_multipark_bookings_dedup";

export const MIGRATION_0045_STATEMENTS: string[] = [
  // 1) Apaga duplicados, mantendo o registo com updatedAt mais recente
  //    (em empate, o id mais alto = inserção mais recente).
  `DELETE b1 FROM multipark_bookings b1
   INNER JOIN multipark_bookings b2
     ON b1.externalId = b2.externalId
    AND (
          b1.updatedAt < b2.updatedAt
       OR (b1.updatedAt = b2.updatedAt AND b1.id < b2.id)
    )`,

  // 2) Drop do índice antigo (pode ser não-UNIQUE). Se não existir, ignora.
  `ALTER TABLE multipark_bookings DROP INDEX multipark_bookings_externalId_unique`,

  // 3) Cria como UNIQUE
  `ALTER TABLE multipark_bookings ADD UNIQUE INDEX multipark_bookings_externalId_unique (externalId)`,
];

export const IDEMPOTENT_ERROR_CODES_0045 = new Set([
  // ER_CANT_DROP_FIELD_OR_KEY: índice não existia
  "ER_CANT_DROP_FIELD_OR_KEY",
  // ER_DUP_KEYNAME: índice já existe (UNIQUE estava lá)
  "ER_DUP_KEYNAME",
  // ER_DUP_ENTRY: tabela já tinha o constraint e há duplicados — não deve
  // acontecer porque acabámos de fazer DELETE; mas seguro.
  "ER_DUP_ENTRY",
]);
