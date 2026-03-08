-- Add new fields to multipark_bookings for API sync data
ALTER TABLE `multipark_bookings` ADD COLUMN `parkId` varchar(128);
ALTER TABLE `multipark_bookings` ADD COLUMN `parkName` varchar(128);
ALTER TABLE `multipark_bookings` ADD COLUMN `city` varchar(64);
ALTER TABLE `multipark_bookings` ADD COLUMN `projectId` int;
ALTER TABLE `multipark_bookings` ADD COLUMN `deliveryService` tinyint DEFAULT 0;
ALTER TABLE `multipark_bookings` ADD COLUMN `deliveryAddress` varchar(256);
ALTER TABLE `multipark_bookings` ADD COLUMN `pickupAddress` varchar(256);
ALTER TABLE `multipark_bookings` ADD COLUMN `campaign` varchar(128);
ALTER TABLE `multipark_bookings` ADD COLUMN `parkingPrice` decimal(10,2);
ALTER TABLE `multipark_bookings` ADD COLUMN `deliveryCharges` decimal(10,2);
ALTER TABLE `multipark_bookings` ADD COLUMN `extrasTotal` decimal(10,2);
ALTER TABLE `multipark_bookings` ADD COLUMN `discount` decimal(10,2);
ALTER TABLE `multipark_bookings` ADD COLUMN `remainingToPay` decimal(10,2);
ALTER TABLE `multipark_bookings` ADD COLUMN `cancelledAt` timestamp;
ALTER TABLE `multipark_bookings` ADD COLUMN `cancelReason` text;

-- Index for hierarchy lookups
ALTER TABLE `multipark_bookings` ADD INDEX `idx_mb_city` (`city`);
ALTER TABLE `multipark_bookings` ADD INDEX `idx_mb_parkName` (`parkName`);
ALTER TABLE `multipark_bookings` ADD INDEX `idx_mb_projectId` (`projectId`);
ALTER TABLE `multipark_bookings` ADD INDEX `idx_mb_status` (`status`);
ALTER TABLE `multipark_bookings` ADD INDEX `idx_mb_checkIn` (`checkIn`);
ALTER TABLE `multipark_bookings` ADD INDEX `idx_mb_campaign` (`campaign`);
