-- A coluna campaignKey foi declarada no schema.ts mas nunca foi criada na DB,
-- partindo tudo o que é SELECT em partnerships porque drizzle pede o campo.
ALTER TABLE `partnerships`
  ADD COLUMN `campaignKey` VARCHAR(128) NULL;
