CREATE TABLE `campaign_daily_stats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`date` timestamp NOT NULL,
	`spend` decimal(10,2) NOT NULL DEFAULT '0',
	`impressions` int DEFAULT 0,
	`clicks` int DEFAULT 0,
	`conversions` int DEFAULT 0,
	`conversionValue` decimal(10,2) DEFAULT '0',
	`cpc` decimal(8,4),
	`ctr` decimal(6,4),
	`costPerConversion` decimal(10,2),
	`importedById` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `campaign_daily_stats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`platform` enum('google_ads','meta_ads','instagram','other') NOT NULL,
	`projectId` int,
	`campaignStatus` enum('active','paused','completed') NOT NULL DEFAULT 'active',
	`startDate` timestamp,
	`endDate` timestamp,
	`budget` decimal(10,2),
	`notes` text,
	`createdById` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketing_expenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`description` varchar(512) NOT NULL,
	`mktCategory` enum('google_ads','meta_ads','influencer','print','merchandise','event','other') NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`date` timestamp NOT NULL,
	`projectId` int,
	`supplier` varchar(256),
	`invoiceUrl` text,
	`invoiceKey` varchar(512),
	`notes` text,
	`createdById` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marketing_expenses_id` PRIMARY KEY(`id`)
);
