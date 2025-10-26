ALTER TABLE `users` ADD `isActive` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `isGlobalAdmin` boolean DEFAULT false NOT NULL;