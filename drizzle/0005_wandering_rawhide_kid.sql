CREATE TABLE `platform_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`platform_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` enum('sop','contract','guide','other') NOT NULL DEFAULT 'other',
	`file_url` text NOT NULL,
	`file_key` varchar(512) NOT NULL,
	`file_name` varchar(255) NOT NULL,
	`file_size` int NOT NULL,
	`mime_type` varchar(100) NOT NULL,
	`uploaded_by` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `platform_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `platform_documents` ADD CONSTRAINT `platform_documents_platform_id_platforms_id_fk` FOREIGN KEY (`platform_id`) REFERENCES `platforms`(`id`) ON DELETE cascade ON UPDATE no action;