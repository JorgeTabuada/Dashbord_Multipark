-- partnerships ganha o partnerId vindo da API Multipark, para mapear
-- "Unknown User" + partnerId real → nome do parceiro nosso.

ALTER TABLE `partnerships`
  ADD COLUMN `multiparkPartnerId` VARCHAR(128) NULL;

CREATE INDEX `idx_partnerships_multipark_partner_id`
  ON `partnerships` (`multiparkPartnerId`);
