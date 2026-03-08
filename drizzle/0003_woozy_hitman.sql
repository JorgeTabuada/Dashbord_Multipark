CREATE TABLE `project_employees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`employeeId` int NOT NULL,
	`role` varchar(64) DEFAULT 'member',
	`assignedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `project_employees_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(256) NOT NULL,
	`description` text,
	`projectId` int,
	`assigneeId` int,
	`createdById` int NOT NULL,
	`taskStatus` enum('backlog','todo','in_progress','review','done') NOT NULL DEFAULT 'todo',
	`taskPriority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`dueDate` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `projects` ADD `level` enum('group','brand','city','project') DEFAULT 'project' NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `color` varchar(16) DEFAULT '#6366f1';--> statement-breakpoint
ALTER TABLE `projects` ADD `managerId` int;