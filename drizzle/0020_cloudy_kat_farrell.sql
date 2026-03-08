CREATE TABLE `speed_limits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`maxSpeed` int NOT NULL,
	`tolerancePercent` int NOT NULL DEFAULT 10,
	`isDefault` boolean DEFAULT false,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `speed_limits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `speed_violations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`zelloUsername` varchar(255) NOT NULL,
	`displayName` varchar(255),
	`speed` decimal(8,2) NOT NULL,
	`speedLimit` int NOT NULL,
	`excessPercent` decimal(5,2) NOT NULL,
	`latitude` decimal(10,7),
	`longitude` decimal(10,7),
	`heading` decimal(6,2),
	`notificationSent` boolean DEFAULT false,
	`acknowledged` boolean DEFAULT false,
	`acknowledgedById` int,
	`acknowledgedAt` timestamp,
	`notes` text,
	`occurredAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `speed_violations_id` PRIMARY KEY(`id`)
);
