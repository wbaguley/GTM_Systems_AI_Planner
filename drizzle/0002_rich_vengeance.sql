CREATE TABLE `subscription_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`stripe_price_id` varchar(255) NOT NULL,
	`stripe_product_id` varchar(255) NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`interval` enum('month','year') NOT NULL DEFAULT 'month',
	`features` text,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscription_plans_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscription_plans_stripe_price_id_unique` UNIQUE(`stripe_price_id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`plan_id` int NOT NULL,
	`stripe_subscription_id` varchar(255),
	`stripe_customer_id` varchar(255) NOT NULL,
	`status` enum('active','canceled','past_due','unpaid','trialing','incomplete','incomplete_expired') NOT NULL DEFAULT 'incomplete',
	`current_period_start` timestamp,
	`current_period_end` timestamp,
	`cancel_at_period_end` boolean NOT NULL DEFAULT false,
	`canceled_at` timestamp,
	`trial_start` timestamp,
	`trial_end` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptions_stripe_subscription_id_unique` UNIQUE(`stripe_subscription_id`)
);
--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_plan_id_subscription_plans_id_fk` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans`(`id`) ON DELETE no action ON UPDATE no action;