CREATE TABLE `radio_transcriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`audioUrl` text,
	`transcription` text,
	`summary` text,
	`employeeId` int,
	`vehicleId` int,
	`duration` int,
	`transcribedAt` timestamp,
	`createdById` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `radio_transcriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `speed_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vehicleId` int NOT NULL,
	`employeeId` int,
	`speed` int NOT NULL,
	`speedLimit` int NOT NULL,
	`latitude` decimal(10,7),
	`longitude` decimal(10,7),
	`roadName` varchar(255),
	`acknowledged` boolean DEFAULT false,
	`acknowledgedById` int,
	`acknowledgedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `speed_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vehicle_movements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vehicleId` int NOT NULL,
	`employeeId` int NOT NULL,
	`movementType` enum('pickup','return') NOT NULL,
	`kmReading` int,
	`latitude` decimal(10,7),
	`longitude` decimal(10,7),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vehicle_movements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`plate` varchar(20) NOT NULL,
	`brand` varchar(100),
	`model` varchar(100),
	`year` int,
	`color` varchar(50),
	`vehicleStatus` enum('active','maintenance','inactive') NOT NULL DEFAULT 'active',
	`projectId` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vehicles_id` PRIMARY KEY(`id`),
	CONSTRAINT `vehicles_plate_unique` UNIQUE(`plate`)
);
