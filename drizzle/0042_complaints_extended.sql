-- Notificações in-app por utilizador
CREATE TABLE `app_notifications` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userId` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `body` TEXT,
  `kind` VARCHAR(32) DEFAULT 'info',
  `link` VARCHAR(512),
  `isRead` TINYINT NOT NULL DEFAULT 0,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_app_notifications_user_unread` (`userId`, `isRead`, `createdAt`),
  INDEX `idx_app_notifications_kind` (`kind`)
);

-- Condutores que estavam de serviço quando a reserva da reclamação correu
-- (alimentado por findDriversOnDuty cruzando reservationRef com extras-dia
-- e multipark_booking_history). penaltyPointsApplied = guardado para
-- futuro scoring; por agora apenas registo.
CREATE TABLE `complaint_drivers_on_duty` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `complaintId` INT NOT NULL,
  `employeeId` INT,
  `employeeName` VARCHAR(256) NOT NULL,
  `roleAtTime` VARCHAR(64),
  `source` VARCHAR(32) NOT NULL,
  `penaltyPointsApplied` INT NOT NULL DEFAULT 0,
  `notes` VARCHAR(512),
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_cdod_complaint` (`complaintId`),
  INDEX `idx_cdod_employee` (`employeeId`)
);

-- Penalty pontos base por tipo de reclamação (config global)
CREATE TABLE `complaint_penalty_config` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `complaintType` VARCHAR(32) NOT NULL,
  `basePoints` INT NOT NULL DEFAULT 0,
  `description` VARCHAR(255),
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_complaint_type` (`complaintType`)
);

-- Default config
INSERT INTO `complaint_penalty_config` (`complaintType`, `basePoints`, `description`) VALUES
  ('damage',     -10, 'Dano no veículo'),
  ('dirt',       -3,  'Sujidade'),
  ('delay',      -5,  'Atraso na entrega/recolha'),
  ('overcharge', -2,  'Valor incorreto'),
  ('staff',      -7,  'Problema com funcionário'),
  ('other',      -1,  'Outro');

ALTER TABLE `complaints`
  ADD COLUMN `penaltyPoints` INT NOT NULL DEFAULT 0,
  ADD COLUMN `clientEmailSentAt` TIMESTAMP NULL,
  ADD COLUMN `clientEmailSubject` VARCHAR(255),
  ADD COLUMN `clientEmailBody` TEXT;
