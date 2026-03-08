CREATE TABLE `api_keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`apiKey` varchar(64) NOT NULL,
	`permissions` text,
	`active` boolean NOT NULL DEFAULT true,
	`lastUsedAt` timestamp,
	`createdById` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `api_keys_id` PRIMARY KEY(`id`),
	CONSTRAINT `api_keys_apiKey_unique` UNIQUE(`apiKey`)
);
