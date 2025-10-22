CREATE TABLE `module_fields` (
	`id` int AUTO_INCREMENT NOT NULL,
	`moduleId` int NOT NULL,
	`fieldKey` varchar(100) NOT NULL,
	`label` varchar(255) NOT NULL,
	`fieldType` enum('text','longtext','number','percentage','currency','checkbox','url','email','phone','date','datetime','select','multiselect','lookup','file','image') NOT NULL,
	`placeholder` varchar(255),
	`helpText` text,
	`isRequired` boolean NOT NULL DEFAULT false,
	`isUnique` boolean NOT NULL DEFAULT false,
	`defaultValue` text,
	`options` json,
	`validation` json,
	`displayOrder` int NOT NULL DEFAULT 0,
	`sectionId` int,
	`columnSpan` int NOT NULL DEFAULT 2,
	`isSystem` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `module_fields_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `module_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`moduleId` int NOT NULL,
	`userId` int NOT NULL,
	`data` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdBy` int,
	`updatedBy` int,
	CONSTRAINT `module_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `module_sections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`moduleId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`displayOrder` int NOT NULL DEFAULT 0,
	`isCollapsible` boolean NOT NULL DEFAULT true,
	`isCollapsedByDefault` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `module_sections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `modules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`singularName` varchar(255) NOT NULL,
	`pluralName` varchar(255) NOT NULL,
	`icon` varchar(100),
	`description` text,
	`isSystem` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `modules_id` PRIMARY KEY(`id`)
);
