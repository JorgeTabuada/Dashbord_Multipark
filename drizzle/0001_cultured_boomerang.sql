CREATE TABLE `activity_logs` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`action` varchar(64) NOT NULL,
	`entity` varchar(64) NOT NULL,
	`entityId` int,
	`details` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expense_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`department` varchar(128),
	`color` varchar(16) DEFAULT '#6366f1',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `expense_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`supplier` varchar(256),
	`description` text,
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(8) NOT NULL DEFAULT 'EUR',
	`paymentMethod` enum('cash','card','transfer','check','other') DEFAULT 'card',
	`expenseDate` timestamp NOT NULL,
	`paymentDueDate` timestamp,
	`paidAt` timestamp,
	`status` enum('pending','paid','overdue','cancelled') NOT NULL DEFAULT 'pending',
	`categoryId` int,
	`projectId` int,
	`buyerId` int,
	`insertedById` int NOT NULL,
	`invoiceImageUrl` text,
	`invoiceImageKey` varchar(512),
	`extractedByAi` boolean DEFAULT false,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `expenses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`description` text,
	`parentId` int,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('super_admin','admin','team_leader','backoffice','frontoffice','supervisor','extra','user') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `department` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `isActive` boolean DEFAULT true NOT NULL;