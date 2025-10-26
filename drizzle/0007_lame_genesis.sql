CREATE TABLE `llm_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`useCustomLLM` boolean NOT NULL DEFAULT false,
	`provider` varchar(50),
	`model` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `llm_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `llm_settings_userId_unique` UNIQUE(`userId`)
);
