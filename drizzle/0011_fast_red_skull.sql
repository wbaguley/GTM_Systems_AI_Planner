CREATE TABLE `playbook_drawings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`playbook_id` int NOT NULL,
	`path` json NOT NULL,
	`color` varchar(50) NOT NULL DEFAULT '#3b82f6',
	`width` int NOT NULL DEFAULT 3,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `playbook_drawings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `playbook_drawings` ADD CONSTRAINT `playbook_drawings_playbook_id_playbooks_id_fk` FOREIGN KEY (`playbook_id`) REFERENCES `playbooks`(`id`) ON DELETE cascade ON UPDATE no action;