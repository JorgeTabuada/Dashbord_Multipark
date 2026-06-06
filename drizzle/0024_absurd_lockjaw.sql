CREATE TABLE `booking_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`historyId` varchar(128) NOT NULL,
	`bookingId` varchar(128) NOT NULL,
	`changeType` varchar(128) NOT NULL,
	`userName` varchar(128),
	`userLastName` varchar(128),
	`userEmail` varchar(320),
	`remarks` text,
	`actionDate` timestamp,
	`parkName` varchar(128),
	`licensePlate` varchar(32),
	`bookingStatus` varchar(64),
	`importedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `booking_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `extras_dia_assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assignmentDate` varchar(10) NOT NULL,
	`employeeId` int,
	`personName` varchar(128) NOT NULL,
	`level` enum('junior','senior','terminal','master') NOT NULL DEFAULT 'junior',
	`startHour` int NOT NULL,
	`endHour` int NOT NULL,
	`sentHomeHour` int,
	`notes` varchar(255),
	`createdById` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `extras_dia_assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
DROP INDEX `users_openId_unique` ON `users`;--> statement-breakpoint
ALTER TABLE `activity_logs` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `annual_reports` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `api_keys` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `campaign_daily_stats` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `campaigns` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `career_exam_attempts` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `career_exams` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `complaint_messages` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `complaint_photos` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `complaints` MODIFY COLUMN `complaint_type` enum('damage','dirt','delay','overcharge','staff','other') NOT NULL;--> statement-breakpoint
ALTER TABLE `complaints` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `daily_driver_history` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `employee_documents` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `employees` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `expense_categories` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `expenses` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `faqs` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `google_reviews` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `gps_alerts` MODIFY COLUMN `occurredAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `gps_alerts` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `incidents` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `invite_tokens` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `invoices` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `lost_found_items` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `lost_found_messages` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `lost_found_photos` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `marketing_expenses` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `multipark_bookings` MODIFY COLUMN `syncedAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `multipark_daily_snapshots` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `multipark_sync_logs` MODIFY COLUMN `startedAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `partnership_invoices` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `partnership_transactions` MODIFY COLUMN `transactionDate` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `partnership_transactions` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `partnerships` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `payslip_history` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `pda_checkins` MODIFY COLUMN `checkinAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `pda_checkins` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `pdas` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `performance_evaluations` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `project_employees` MODIFY COLUMN `assignedAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `projects` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `quiz_attempts` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `quiz_questions` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `radio_transcriptions` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `schedules` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `services` MODIFY COLUMN `serviceDate` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `services` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `speed_alerts` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `speed_limits` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `speed_limits` MODIFY COLUMN `updatedAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `speed_violations` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `task_assignees` MODIFY COLUMN `assignedAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `tasks` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `time_records` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `training_categories` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `training_manuals` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `training_videos` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `lastSignedIn` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `vehicle_movements` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `vehicles` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `activity_logs` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `annual_reports` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `api_keys` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `campaign_daily_stats` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `campaigns` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `career_exam_attempts` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `career_exam_questions` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `career_exams` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `complaint_messages` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `complaint_photos` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `complaints` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `daily_driver_history` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `employee_documents` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `employees` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `expense_categories` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `expenses` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `extra_rates` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `faqs` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `google_reviews` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `gps_alerts` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `incidents` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `invite_tokens` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `invoices` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `lost_found_items` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `lost_found_messages` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `lost_found_photos` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `marketing_expenses` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `multipark_bookings` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `multipark_daily_snapshots` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `multipark_sync_logs` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `partnership_invoices` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `partnership_transactions` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `partnerships` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `payslip_history` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `pda_checkins` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `pdas` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `performance_evaluations` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `project_employees` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `projects` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `quiz_attempts` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `quiz_questions` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `radio_transcriptions` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `schedules` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `services` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `speed_alerts` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `speed_limits` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `speed_violations` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `task_assignees` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `tasks` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `time_records` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `training_categories` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `training_manuals` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `training_videos` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `users` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `vehicle_movements` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `vehicles` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `multipark_bookings` ADD `parkId` varchar(128);--> statement-breakpoint
ALTER TABLE `multipark_bookings` ADD `parkName` varchar(128);--> statement-breakpoint
ALTER TABLE `multipark_bookings` ADD `city` varchar(64);--> statement-breakpoint
ALTER TABLE `multipark_bookings` ADD `projectId` int;--> statement-breakpoint
ALTER TABLE `multipark_bookings` ADD `deliveryService` tinyint DEFAULT 0;--> statement-breakpoint
ALTER TABLE `multipark_bookings` ADD `deliveryAddress` varchar(256);--> statement-breakpoint
ALTER TABLE `multipark_bookings` ADD `pickupAddress` varchar(256);--> statement-breakpoint
ALTER TABLE `multipark_bookings` ADD `campaign` varchar(128);--> statement-breakpoint
ALTER TABLE `multipark_bookings` ADD `parkingPrice` decimal(10,2);--> statement-breakpoint
ALTER TABLE `multipark_bookings` ADD `deliveryCharges` decimal(10,2);--> statement-breakpoint
ALTER TABLE `multipark_bookings` ADD `extrasTotal` decimal(10,2);--> statement-breakpoint
ALTER TABLE `multipark_bookings` ADD `discount` decimal(10,2);--> statement-breakpoint
ALTER TABLE `multipark_bookings` ADD `remainingToPay` decimal(10,2);--> statement-breakpoint
ALTER TABLE `multipark_bookings` ADD `cancelledAt` timestamp;--> statement-breakpoint
ALTER TABLE `multipark_bookings` ADD `cancelReason` text;--> statement-breakpoint
ALTER TABLE `multipark_bookings` ADD `bookingCreatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `partnerships` ADD `campaignKey` varchar(128);--> statement-breakpoint
ALTER TABLE `projects` ADD `partnerName` varchar(200);--> statement-breakpoint
ALTER TABLE `projects` ADD `partnerPercent` decimal(5,2);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_openId_unique` UNIQUE(`openId`);--> statement-breakpoint
CREATE INDEX `bh_booking_idx` ON `booking_history` (`bookingId`);--> statement-breakpoint
CREATE INDEX `bh_plate_idx` ON `booking_history` (`licensePlate`);--> statement-breakpoint
CREATE INDEX `bh_user_idx` ON `booking_history` (`userName`);--> statement-breakpoint
CREATE INDEX `bh_type_idx` ON `booking_history` (`changeType`);--> statement-breakpoint
CREATE INDEX `idx_extras_dia_date` ON `extras_dia_assignments` (`assignmentDate`);