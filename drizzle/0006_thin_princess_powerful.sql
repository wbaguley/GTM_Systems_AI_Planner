CREATE TABLE `sops` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(500) NOT NULL,
	`content` text NOT NULL,
	`sourceFileName` varchar(500),
	`sourceFileUrl` varchar(1000),
	`sourceFileKey` varchar(1000),
	`chatHistory` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sops_id` PRIMARY KEY(`id`)
);
