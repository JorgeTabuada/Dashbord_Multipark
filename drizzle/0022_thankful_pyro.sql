ALTER TABLE `google_reviews` ADD `sourceEmailId` varchar(200);--> statement-breakpoint
ALTER TABLE `google_reviews` ADD `importedAt` timestamp;--> statement-breakpoint
ALTER TABLE `incidents` ADD `sourceEmailId` varchar(200);--> statement-breakpoint
ALTER TABLE `incidents` ADD `aiClassification` text;--> statement-breakpoint
ALTER TABLE `incidents` ADD `gpsLatitude` varchar(30);--> statement-breakpoint
ALTER TABLE `incidents` ADD `gpsLongitude` varchar(30);--> statement-breakpoint
ALTER TABLE `incidents` ADD `reservationLink` varchar(500);--> statement-breakpoint
ALTER TABLE `incidents` ADD `importedAt` timestamp;