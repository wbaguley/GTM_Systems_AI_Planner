CREATE TABLE `gtm_assessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`companyName` varchar(255),
	`industry` varchar(255),
	`assessmentDate` timestamp NOT NULL DEFAULT (now()),
	`overallScore` int DEFAULT 0,
	`marketStrategyScore` int DEFAULT 0,
	`salesProcessScore` int DEFAULT 0,
	`marketingOpsScore` int DEFAULT 0,
	`customerSuccessScore` int DEFAULT 0,
	`revenueOpsScore` int DEFAULT 0,
	`teamEnablementScore` int DEFAULT 0,
	`responses` json,
	`strengths` text,
	`gaps` text,
	`recommendations` text,
	`actionPlan` text,
	`status` varchar(50) DEFAULT 'in_progress',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gtm_assessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gtm_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category` varchar(100) NOT NULL,
	`question` text NOT NULL,
	`questionType` varchar(50) NOT NULL,
	`options` json,
	`weight` int DEFAULT 1,
	`displayOrder` int DEFAULT 0,
	`isActive` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gtm_questions_id` PRIMARY KEY(`id`)
);
