-- partnerType passa de ENUM fixo a VARCHAR livre, para permitir
-- adicionar tipos novos sem mexer no schema.
ALTER TABLE `partnerships`
  MODIFY COLUMN `partnerType` VARCHAR(64) NOT NULL DEFAULT 'other';
