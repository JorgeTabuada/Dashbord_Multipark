ALTER TABLE `api_keys` DROP INDEX `api_keys_apiKey_unique`;--> statement-breakpoint
ALTER TABLE `extra_rates` DROP INDEX `extra_rates_level_unique`;--> statement-breakpoint
ALTER TABLE `invite_tokens` DROP INDEX `invite_tokens_token_unique`;--> statement-breakpoint
ALTER TABLE `multipark_bookings` DROP INDEX `multipark_bookings_externalId_unique`;--> statement-breakpoint
ALTER TABLE `users` DROP INDEX `users_openId_unique`;--> statement-breakpoint
ALTER TABLE `vehicles` DROP INDEX `vehicles_plate_unique`;--> statement-breakpoint
ALTER TABLE `activity_logs` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `annual_reports` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `api_keys` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `campaign_daily_stats` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `campaigns` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `career_exam_attempts` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `career_exam_questions` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `career_exams` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `complaint_messages` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `complaint_photos` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `complaints` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `daily_driver_history` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `employee_documents` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `employees` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `expense_categories` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `expenses` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `extra_rates` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `faqs` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `google_reviews` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `gps_alerts` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `incidents` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `invite_tokens` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `invoices` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `lost_found_items` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `lost_found_messages` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `lost_found_photos` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `marketing_expenses` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `multipark_bookings` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `multipark_daily_snapshots` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `multipark_sync_logs` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `partnership_invoices` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `partnership_transactions` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `partnerships` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `payslip_history` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `pda_checkins` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `pdas` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `performance_evaluations` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `project_employees` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `projects` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `quiz_attempts` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `quiz_questions` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `radio_transcriptions` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `schedules` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `services` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `speed_alerts` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `speed_limits` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `speed_violations` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `task_assignees` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `tasks` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `time_records` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `training_categories` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `training_manuals` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `training_videos` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `users` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `vehicle_movements` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `vehicles` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `activity_logs` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `annual_reports` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `api_keys` MODIFY COLUMN `active` tinyint NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `api_keys` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `campaign_daily_stats` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `campaigns` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `career_exam_attempts` MODIFY COLUMN `passed` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `career_exam_attempts` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `career_exams` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `complaint_messages` MODIFY COLUMN `isInternal` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `complaint_messages` MODIFY COLUMN `isInternal` tinyint NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `complaint_messages` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `complaint_photos` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `complaints` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `daily_driver_history` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `employee_documents` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `employees` MODIFY COLUMN `isActive` tinyint NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `employees` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `expense_categories` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `expenses` MODIFY COLUMN `extractedByAi` tinyint;--> statement-breakpoint
ALTER TABLE `expenses` MODIFY COLUMN `extractedByAi` tinyint DEFAULT 0;--> statement-breakpoint
ALTER TABLE `expenses` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `faqs` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `google_reviews` MODIFY COLUMN `aiResponseApproved` tinyint;--> statement-breakpoint
ALTER TABLE `google_reviews` MODIFY COLUMN `aiResponseApproved` tinyint DEFAULT 0;--> statement-breakpoint
ALTER TABLE `google_reviews` MODIFY COLUMN `sourceEmailId` varchar(100);--> statement-breakpoint
ALTER TABLE `google_reviews` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `gps_alerts` MODIFY COLUMN `notificationSent` tinyint;--> statement-breakpoint
ALTER TABLE `gps_alerts` MODIFY COLUMN `notificationSent` tinyint DEFAULT 0;--> statement-breakpoint
ALTER TABLE `gps_alerts` MODIFY COLUMN `acknowledged` tinyint;--> statement-breakpoint
ALTER TABLE `gps_alerts` MODIFY COLUMN `acknowledged` tinyint DEFAULT 0;--> statement-breakpoint
ALTER TABLE `gps_alerts` MODIFY COLUMN `occurredAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `gps_alerts` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `incidents` MODIFY COLUMN `sourceEmailId` varchar(100);--> statement-breakpoint
ALTER TABLE `incidents` MODIFY COLUMN `gpsLatitude` varchar(20);--> statement-breakpoint
ALTER TABLE `incidents` MODIFY COLUMN `gpsLongitude` varchar(20);--> statement-breakpoint
ALTER TABLE `incidents` MODIFY COLUMN `reservationLink` text;--> statement-breakpoint
ALTER TABLE `incidents` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `invite_tokens` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `invoices` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `lost_found_items` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `lost_found_messages` MODIFY COLUMN `isInternal` tinyint NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `lost_found_messages` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `lost_found_photos` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `marketing_expenses` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `multipark_bookings` MODIFY COLUMN `syncedAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `multipark_daily_snapshots` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `multipark_sync_logs` MODIFY COLUMN `startedAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `partnership_invoices` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `partnership_transactions` MODIFY COLUMN `transactionDate` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `partnership_transactions` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `partnerships` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `payslip_history` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `pda_checkins` MODIFY COLUMN `checkinAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `pda_checkins` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `pdas` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `performance_evaluations` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `project_employees` MODIFY COLUMN `assignedAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `projects` MODIFY COLUMN `isActive` tinyint NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `projects` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `quiz_attempts` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `quiz_questions` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `radio_transcriptions` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `schedules` MODIFY COLUMN `isWorkDay` tinyint NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `schedules` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `services` MODIFY COLUMN `serviceDate` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `services` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `speed_alerts` MODIFY COLUMN `acknowledged` tinyint;--> statement-breakpoint
ALTER TABLE `speed_alerts` MODIFY COLUMN `acknowledged` tinyint DEFAULT 0;--> statement-breakpoint
ALTER TABLE `speed_alerts` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `speed_limits` MODIFY COLUMN `isDefault` tinyint;--> statement-breakpoint
ALTER TABLE `speed_limits` MODIFY COLUMN `isDefault` tinyint DEFAULT 0;--> statement-breakpoint
ALTER TABLE `speed_limits` MODIFY COLUMN `isActive` tinyint DEFAULT 1;--> statement-breakpoint
ALTER TABLE `speed_limits` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `speed_limits` MODIFY COLUMN `updatedAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `speed_violations` MODIFY COLUMN `notificationSent` tinyint;--> statement-breakpoint
ALTER TABLE `speed_violations` MODIFY COLUMN `notificationSent` tinyint DEFAULT 0;--> statement-breakpoint
ALTER TABLE `speed_violations` MODIFY COLUMN `acknowledged` tinyint;--> statement-breakpoint
ALTER TABLE `speed_violations` MODIFY COLUMN `acknowledged` tinyint DEFAULT 0;--> statement-breakpoint
ALTER TABLE `speed_violations` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `task_assignees` MODIFY COLUMN `assignedAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `tasks` MODIFY COLUMN `notifiedOverdue` tinyint;--> statement-breakpoint
ALTER TABLE `tasks` MODIFY COLUMN `notifiedOverdue` tinyint DEFAULT 0;--> statement-breakpoint
ALTER TABLE `tasks` MODIFY COLUMN `notifiedComplete` tinyint;--> statement-breakpoint
ALTER TABLE `tasks` MODIFY COLUMN `notifiedComplete` tinyint DEFAULT 0;--> statement-breakpoint
ALTER TABLE `tasks` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `time_records` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `training_categories` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `training_manuals` MODIFY COLUMN `published` tinyint DEFAULT 1;--> statement-breakpoint
ALTER TABLE `training_manuals` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `training_videos` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `isActive` tinyint NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `lastSignedIn` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `vehicle_movements` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `vehicles` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `google_reviews` ADD `sourceEmailDate` timestamp;--> statement-breakpoint
ALTER TABLE `incidents` ADD `sourceEmailDate` timestamp;--> statement-breakpoint
ALTER TABLE `incidents` ADD `aiSeverity` enum('low','medium','high','critical');--> statement-breakpoint
CREATE INDEX `api_keys_apiKey_unique` ON `api_keys` (`apiKey`);--> statement-breakpoint
CREATE INDEX `extra_rates_level_unique` ON `extra_rates` (`level`);--> statement-breakpoint
CREATE INDEX `invite_tokens_token_unique` ON `invite_tokens` (`token`);--> statement-breakpoint
CREATE INDEX `multipark_bookings_externalId_unique` ON `multipark_bookings` (`externalId`);--> statement-breakpoint
CREATE INDEX `users_openId_unique` ON `users` (`openId`);--> statement-breakpoint
CREATE INDEX `vehicles_plate_unique` ON `vehicles` (`plate`);