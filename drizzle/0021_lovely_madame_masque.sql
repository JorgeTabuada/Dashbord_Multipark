CREATE TABLE `daily_driver_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`zelloUsername` varchar(255) NOT NULL,
	`displayName` varchar(255),
	`employeeId` int,
	`date` timestamp NOT NULL,
	`totalKm` decimal(10,2) DEFAULT '0',
	`hoursWorked` decimal(6,2) DEFAULT '0',
	`hoursStopped` decimal(6,2) DEFAULT '0',
	`totalHoursOnline` decimal(6,2) DEFAULT '0',
	`avgSpeed` decimal(6,2) DEFAULT '0',
	`maxSpeed` decimal(6,2) DEFAULT '0',
	`speedViolations` int DEFAULT 0,
	`avgBattery` int DEFAULT 0,
	`minBattery` int DEFAULT 0,
	`gpsPointsCount` int DEFAULT 0,
	`geoJsonUrl` text,
	`rawDataUrl` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `daily_driver_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gps_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`zelloUsername` varchar(255) NOT NULL,
	`displayName` varchar(255),
	`employeeId` int,
	`alertType` enum('gps_off','zello_off','battery_low','no_signal') NOT NULL,
	`message` text,
	`latitude` decimal(10,7),
	`longitude` decimal(10,7),
	`batteryLevel` int,
	`notificationSent` boolean DEFAULT false,
	`acknowledged` boolean DEFAULT false,
	`acknowledgedById` int,
	`acknowledgedAt` timestamp,
	`occurredAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gps_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pda_checkins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pdaId` int NOT NULL,
	`employeeId` int,
	`zelloUsername` varchar(255),
	`teamLeaderId` int,
	`photoEntryUrl` text,
	`photoExitUrl` text,
	`mobileDataMbStart` int,
	`mobileDataMbEnd` int,
	`checkinAt` timestamp NOT NULL DEFAULT (now()),
	`checkoutAt` timestamp,
	`checkin_status` enum('checked_in','checked_out') NOT NULL DEFAULT 'checked_in',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pda_checkins_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pdas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`phoneNumber` varchar(50),
	`imei` varchar(50),
	`model` varchar(255),
	`status` enum('active','inactive','maintenance','lost') NOT NULL DEFAULT 'active',
	`photoUrl` text,
	`simDataPlan` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pdas_id` PRIMARY KEY(`id`)
);
