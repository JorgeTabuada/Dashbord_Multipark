-- Um parceiro pode ter vários identificadores na API Multipark:
--   * múltiplos partnerId (um por agente/utilizador do parceiro)
--   * múltiplos paymentMethod (variações: "Parkos", "parkos", etc.)
-- Para reservas sem partnerId, o paymentMethod é a única forma de identificar.

CREATE TABLE `partner_aliases` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `partnershipId` INT NOT NULL,
  `aliasType` ENUM('multipark_partner_id','payment_method') NOT NULL,
  `aliasValue` VARCHAR(128) NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_alias` (`aliasType`, `aliasValue`),
  INDEX `idx_partner_aliases_partnership` (`partnershipId`)
);
