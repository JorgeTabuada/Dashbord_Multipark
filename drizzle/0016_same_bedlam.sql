CREATE TABLE `payslip_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int,
	`employeeName` varchar(255),
	`year` int NOT NULL,
	`month` int NOT NULL,
	`payslip_type` enum('individual','payroll','timesheet') NOT NULL,
	`url` text NOT NULL,
	`fileName` varchar(512),
	`generatedById` int NOT NULL,
	`generatedByName` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payslip_history_id` PRIMARY KEY(`id`)
);
