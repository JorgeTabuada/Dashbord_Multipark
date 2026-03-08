CREATE TABLE `partnership_invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`partnershipId` int NOT NULL,
	`invoiceNumber` varchar(50),
	`amount` int NOT NULL DEFAULT 0,
	`referenceMonth` int NOT NULL,
	`referenceYear` int NOT NULL,
	`invoiceStatus` enum('draft','sent','paid','overdue','cancelled') NOT NULL DEFAULT 'draft',
	`sentAt` timestamp,
	`dueDate` timestamp,
	`paidAt` timestamp,
	`invoiceNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partnership_invoices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `partnerships` MODIFY COLUMN `partnerType` enum('aggregator','agency','pro_client','other','corporate','retainer') NOT NULL DEFAULT 'other';--> statement-breakpoint
ALTER TABLE `partnerships` ADD `partner_nif` varchar(20);--> statement-breakpoint
ALTER TABLE `partnerships` ADD `monthlyFee` int DEFAULT 0;