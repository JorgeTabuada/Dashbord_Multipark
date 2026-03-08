CREATE TABLE `task_assignees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskId` int NOT NULL,
	`employeeId` int NOT NULL,
	`assignedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `task_assignees_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `projects` ADD `budget` decimal(12,2);--> statement-breakpoint
ALTER TABLE `tasks` ADD `notifiedOverdue` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `tasks` ADD `notifiedComplete` boolean DEFAULT false;