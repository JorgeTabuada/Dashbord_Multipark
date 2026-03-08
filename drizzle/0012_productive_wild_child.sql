ALTER TABLE `training_manuals` MODIFY COLUMN `type` enum('manual','update','news','procedure') NOT NULL DEFAULT 'manual';--> statement-breakpoint
ALTER TABLE `training_manuals` ADD `fileUrl` text;--> statement-breakpoint
ALTER TABLE `training_manuals` ADD `fileKey` text;--> statement-breakpoint
ALTER TABLE `training_manuals` ADD `fileName` varchar(255);--> statement-breakpoint
ALTER TABLE `training_manuals` ADD `fileMimeType` varchar(100);