CREATE TABLE `career_exam_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`examId` int NOT NULL,
	`employeeId` int NOT NULL,
	`totalQuestions` int NOT NULL,
	`correctAnswers` int NOT NULL,
	`score` int NOT NULL,
	`passed` boolean NOT NULL,
	`timeSpentSeconds` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `career_exam_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `career_exam_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`examId` int NOT NULL,
	`question` text NOT NULL,
	`optionA` text NOT NULL,
	`optionB` text NOT NULL,
	`optionC` text NOT NULL,
	`optionD` text NOT NULL,
	`correctOption` enum('A','B','C','D') NOT NULL,
	`explanation` text,
	`points` int NOT NULL DEFAULT 10,
	CONSTRAINT `career_exam_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `career_exams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`level` enum('extra','condutor','senior','team_leader','supervisor') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`passingScore` int NOT NULL,
	`timeLimitMinutes` int DEFAULT 30,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `career_exams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `faqs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoryId` int,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `faqs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`totalQuestions` int NOT NULL,
	`correctAnswers` int NOT NULL,
	`score` int NOT NULL,
	`timeSpentSeconds` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quiz_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoryId` int,
	`question` text NOT NULL,
	`optionA` text NOT NULL,
	`optionB` text NOT NULL,
	`optionC` text NOT NULL,
	`optionD` text NOT NULL,
	`correctOption` enum('A','B','C','D') NOT NULL,
	`explanation` text,
	`difficulty` enum('easy','medium','hard') NOT NULL DEFAULT 'medium',
	`points` int NOT NULL DEFAULT 10,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quiz_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `training_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`icon` varchar(50),
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `training_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `training_manuals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoryId` int,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`type` enum('manual','update','news') NOT NULL DEFAULT 'manual',
	`published` boolean DEFAULT true,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `training_manuals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `training_videos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoryId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`videoUrl` text NOT NULL,
	`thumbnailUrl` text,
	`durationMinutes` int,
	`sortOrder` int DEFAULT 0,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `training_videos_id` PRIMARY KEY(`id`)
);
