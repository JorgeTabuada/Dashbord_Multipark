CREATE TABLE `annual_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int,
	`month` int NOT NULL,
	`year` int NOT NULL,
	`totalRevenue` int DEFAULT 0,
	`totalExpenses` int DEFAULT 0,
	`partnerShare` int DEFAULT 0,
	`companyShare` int DEFAULT 0,
	`splitRatio` varchar(10) DEFAULT '60/40',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `annual_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `incidents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int,
	`vehiclePlate` varchar(20),
	`employeeId` int,
	`reportedBy` int,
	`incidentType` enum('vidro_aberto','mal_estacionado','dano','chave_errada','combustivel','limpeza','documentos','outro') NOT NULL DEFAULT 'outro',
	`severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`description` text NOT NULL,
	`status` enum('open','investigating','resolved','dismissed') NOT NULL DEFAULT 'open',
	`resolution` text,
	`resolvedAt` timestamp,
	`resolvedBy` int,
	`weekNumber` int,
	`yearNumber` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `incidents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int,
	`invoiceNumber` varchar(100) NOT NULL,
	`clientName` varchar(255),
	`clientNif` varchar(20),
	`issueDate` timestamp NOT NULL,
	`dueDate` timestamp,
	`totalAmount` int NOT NULL DEFAULT 0,
	`taxAmount` int DEFAULT 0,
	`status` enum('draft','issued','paid','overdue','cancelled') NOT NULL DEFAULT 'draft',
	`paymentMethod` varchar(50),
	`notes` text,
	`fileUrl` text,
	`fileKey` text,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partnership_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`partnershipId` int NOT NULL,
	`projectId` int,
	`transactionType` enum('booking','commission','payment','adjustment') NOT NULL DEFAULT 'booking',
	`description` varchar(500),
	`amount` int NOT NULL DEFAULT 0,
	`transactionDate` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `partnership_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partnerships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`partnerType` enum('aggregator','agency','pro_client','other') NOT NULL DEFAULT 'other',
	`contactName` varchar(255),
	`contactEmail` varchar(320),
	`contactPhone` varchar(50),
	`commissionRate` int DEFAULT 0,
	`billingAgreement` text,
	`partnerStatus` enum('active','inactive','pending') NOT NULL DEFAULT 'active',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partnerships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `performance_evaluations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`weekNumber` int NOT NULL,
	`yearNumber` int NOT NULL,
	`hoursWorked` int DEFAULT 0,
	`movementsCount` int DEFAULT 0,
	`movementsPerHour` int DEFAULT 0,
	`speedAlerts` int DEFAULT 0,
	`incidentsPositive` int DEFAULT 0,
	`incidentsNegative` int DEFAULT 0,
	`positivePoints` int DEFAULT 0,
	`negativePoints` int DEFAULT 0,
	`totalPoints` int DEFAULT 0,
	`notes` text,
	`evaluatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `performance_evaluations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int,
	`employeeId` int,
	`serviceType` enum('lavagem','carregamento_eletrico','valet_flex','outro') NOT NULL DEFAULT 'lavagem',
	`clientName` varchar(255),
	`vehiclePlate` varchar(20),
	`bookingRef` varchar(100),
	`revenue` int DEFAULT 0,
	`cost` int DEFAULT 0,
	`commission` int DEFAULT 0,
	`notes` text,
	`serviceDate` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `services_id` PRIMARY KEY(`id`)
);
