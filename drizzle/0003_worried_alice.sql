CREATE TABLE `custom_field_values` (
	`id` int AUTO_INCREMENT NOT NULL,
	`platformId` int NOT NULL,
	`fieldKey` varchar(100) NOT NULL,
	`value` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `custom_field_values_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `custom_fields` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fieldKey` varchar(100) NOT NULL,
	`label` varchar(255) NOT NULL,
	`fieldType` varchar(50) NOT NULL,
	`placeholder` text,
	`required` int NOT NULL DEFAULT 0,
	`options` text,
	`displayOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `custom_fields_id` PRIMARY KEY(`id`)
);
