CREATE TABLE `invite_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`token` varchar(128) NOT NULL,
	`email` varchar(320) NOT NULL,
	`userId` int NOT NULL,
	`invitedById` int NOT NULL,
	`invite_status` enum('pending','accepted','expired') NOT NULL DEFAULT 'pending',
	`expiresAt` timestamp NOT NULL,
	`acceptedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invite_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `invite_tokens_token_unique` UNIQUE(`token`)
);
