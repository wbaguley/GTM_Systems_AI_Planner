ALTER TABLE `playbook_nodes` ADD `width` int DEFAULT 200;--> statement-breakpoint
ALTER TABLE `playbook_nodes` ADD `height` int DEFAULT 100;--> statement-breakpoint
ALTER TABLE `playbook_nodes` ADD `color` varchar(50) DEFAULT '#3b82f6';--> statement-breakpoint
ALTER TABLE `playbook_nodes` ADD `shape` varchar(50) DEFAULT 'rectangle';