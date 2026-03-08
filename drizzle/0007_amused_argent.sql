CREATE TABLE `complaint_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`complaintId` int NOT NULL,
	`message` text NOT NULL,
	`isInternal` boolean NOT NULL DEFAULT false,
	`authorId` int,
	`authorName` varchar(200),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `complaint_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `complaint_photos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`complaintId` int NOT NULL,
	`url` varchar(500) NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`label` varchar(100),
	`uploadedById` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `complaint_photos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `complaints` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`complaint_type` enum('damage','wash','delay','lost_item','overcharge','other') NOT NULL,
	`complaint_status` enum('new','analyzing','waiting_client','resolved','closed') NOT NULL DEFAULT 'new',
	`complaint_priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`clientName` varchar(200),
	`clientEmail` varchar(320),
	`clientPhone` varchar(50),
	`reservationRef` varchar(100),
	`reservationStart` timestamp,
	`reservationEnd` timestamp,
	`vehicleId` int,
	`vehiclePlate` varchar(20),
	`driversInvolved` text,
	`slaDeadline` timestamp,
	`resolvedAt` timestamp,
	`projectId` int,
	`assignedToId` int,
	`createdById` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `complaints_id` PRIMARY KEY(`id`)
);
