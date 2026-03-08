CREATE TABLE `employee_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`docType` enum('id_card','residence_permit','driving_license','nib_proof','address_proof','contract','extra_contract','contract_annex','responsibility_term','work_accident_insurance','photo','other') NOT NULL,
	`label` varchar(256),
	`fileUrl` text NOT NULL,
	`fileKey` varchar(512) NOT NULL,
	`mimeType` varchar(128),
	`uploadedById` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `employee_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fullName` varchar(256) NOT NULL,
	`email` varchar(320),
	`phone` varchar(32),
	`nif` varchar(20),
	`nib` varchar(30),
	`address` text,
	`birthDate` timestamp,
	`nationality` varchar(64),
	`photoUrl` text,
	`photoKey` varchar(512),
	`position` enum('director','supervisor','team_leader','backoffice','frontoffice','senior_driver','driver','extra') NOT NULL DEFAULT 'driver',
	`extraLevel` int,
	`department` varchar(128),
	`projectId` int,
	`contractType` enum('permanent','fixed_term','extra') DEFAULT 'permanent',
	`contractStart` timestamp,
	`contractEnd` timestamp,
	`monthlySalary` decimal(10,2),
	`isActive` boolean NOT NULL DEFAULT true,
	`userId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employees_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `extra_rates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`level` int NOT NULL,
	`hourlyRate` decimal(6,2) NOT NULL,
	`label` varchar(64),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `extra_rates_id` PRIMARY KEY(`id`),
	CONSTRAINT `extra_rates_level_unique` UNIQUE(`level`)
);
--> statement-breakpoint
CREATE TABLE `schedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`weekday` int NOT NULL,
	`startTime` varchar(8) NOT NULL,
	`endTime` varchar(8) NOT NULL,
	`isWorkDay` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `schedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `time_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`type` enum('check_in','check_out') NOT NULL,
	`recordedAt` timestamp NOT NULL,
	`photoUrl` text,
	`photoKey` varchar(512),
	`latitude` decimal(10,7),
	`longitude` decimal(10,7),
	`locationName` varchar(256),
	`hoursWorked` decimal(6,2),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `time_records_id` PRIMARY KEY(`id`)
);
