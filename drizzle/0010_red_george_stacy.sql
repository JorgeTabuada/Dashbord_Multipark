CREATE TABLE `lost_found_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int,
	`vehiclePlate` varchar(20),
	`clientName` varchar(255) NOT NULL,
	`clientEmail` varchar(320),
	`clientPhone` varchar(50),
	`bookingRef` varchar(100),
	`itemType` enum('money','electronics','clothing','documents','accessories','other') NOT NULL DEFAULT 'other',
	`description` text NOT NULL,
	`estimatedValue` int,
	`status` enum('new','investigating','found','returned','closed') NOT NULL DEFAULT 'new',
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`assignedTo` int,
	`resolution` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lost_found_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lost_found_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`itemId` int NOT NULL,
	`userId` int NOT NULL,
	`userName` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`isInternal` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lost_found_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lost_found_photos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`itemId` int NOT NULL,
	`url` text NOT NULL,
	`fileKey` text NOT NULL,
	`caption` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lost_found_photos_id` PRIMARY KEY(`id`)
);
