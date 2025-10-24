CREATE TABLE `platforms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`platform` varchar(255) NOT NULL,
	`useCase` text,
	`website` varchar(500),
	`logoUrl` varchar(500),
	`costOwner` enum('Client','GTM Planetary','Both') NOT NULL,
	`status` enum('Active','Inactive','Cancelled') NOT NULL DEFAULT 'Active',
	`billingType` enum('Monthly','Yearly','OneTime','Usage','Free Plan','Pay as you go'),
	`licenses` varchar(100),
	`monthlyAmount` int DEFAULT 0,
	`yearlyAmount` int DEFAULT 0,
	`oneTimeAmount` int DEFAULT 0,
	`balanceUsage` int DEFAULT 0,
	`renewalDate` date,
	`renewalDay` int,
	`isMyToolbelt` boolean DEFAULT false,
	`isInternalBusiness` boolean DEFAULT false,
	`isSolutionPartner` boolean DEFAULT false,
	`notesForManus` text,
	`notesForStaff` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `platforms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `api_keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`provider` varchar(50) NOT NULL,
	`apiKey` text,
	`serverUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `api_keys_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE `gtm_assessment_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessmentId` int NOT NULL,
	`questionId` int NOT NULL,
	`responseValue` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gtm_assessment_responses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gtm_assessment_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessmentId` int NOT NULL,
	`overallScore` int NOT NULL,
	`categoryScores` json,
	`strengths` json,
	`gaps` json,
	`recommendations` json,
	`actionPlan` json,
	`aiAnalysis` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gtm_assessment_results_id` PRIMARY KEY(`id`),
	CONSTRAINT `gtm_assessment_results_assessmentId_unique` UNIQUE(`assessmentId`)
);
--> statement-breakpoint
CREATE TABLE `gtm_assessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`frameworkId` int NOT NULL,
	`companyName` varchar(255),
	`industry` varchar(255),
	`status` varchar(50) NOT NULL DEFAULT 'in_progress',
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gtm_assessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gtm_framework_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`frameworkId` int NOT NULL,
	`category` varchar(255) NOT NULL,
	`questionText` text NOT NULL,
	`questionType` varchar(50) NOT NULL,
	`options` json,
	`orderIndex` int NOT NULL DEFAULT 0,
	`isRequired` int NOT NULL DEFAULT 1,
	`helpText` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gtm_framework_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gtm_frameworks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text NOT NULL,
	`category` varchar(100) NOT NULL,
	`icon` varchar(50),
	`colorScheme` varchar(50),
	`expertTrainingData` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gtm_frameworks_id` PRIMARY KEY(`id`),
	CONSTRAINT `gtm_frameworks_name_unique` UNIQUE(`name`),
	CONSTRAINT `gtm_frameworks_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `playbook_connections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`playbook_id` int NOT NULL,
	`source_node_id` int NOT NULL,
	`target_node_id` int NOT NULL,
	`label` varchar(255),
	`condition` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `playbook_connections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `playbook_executions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`playbook_id` int NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`client_name` varchar(255),
	`status` varchar(50) NOT NULL DEFAULT 'active',
	`current_node_id` int,
	`started_at` timestamp NOT NULL DEFAULT (now()),
	`completed_at` timestamp,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `playbook_executions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `playbook_node_executions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`execution_id` int NOT NULL,
	`node_id` int NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`started_at` timestamp,
	`completed_at` timestamp,
	`notes` text,
	`completed_by` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `playbook_node_executions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `playbook_nodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`playbook_id` int NOT NULL,
	`node_type` varchar(50) NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text,
	`content` text,
	`position` json NOT NULL,
	`data` json,
	`duration` varchar(100),
	`owner` varchar(255),
	`status` varchar(50) DEFAULT 'pending',
	`order_index` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `playbook_nodes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `playbooks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text,
	`type` varchar(50) NOT NULL,
	`category` varchar(100),
	`is_template` boolean NOT NULL DEFAULT false,
	`status` varchar(50) NOT NULL DEFAULT 'draft',
	`tags` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `playbooks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `icp_assessment_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`section_id` int NOT NULL,
	`category` varchar(255) NOT NULL,
	`question` text NOT NULL,
	`question_type` varchar(50) NOT NULL,
	`options` json,
	`help_text` text,
	`required` boolean NOT NULL DEFAULT true,
	`order` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `icp_assessment_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `icp_assessment_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessment_id` int NOT NULL,
	`question_id` int NOT NULL,
	`response` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `icp_assessment_responses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `icp_assessment_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessment_id` int NOT NULL,
	`overall_score` int NOT NULL,
	`icp_clarity_score` int,
	`methodology_maturity_score` int,
	`enablement_maturity_score` int,
	`category_scores` json,
	`executive_summary` text NOT NULL,
	`strengths` json,
	`gaps` json,
	`recommendations` json,
	`action_plan` json,
	`primary_methodology` varchar(255),
	`secondary_methodologies` json,
	`methodology_rationale` text,
	`enablement_priorities` json,
	`quick_wins` json,
	`medium_term_goals` json,
	`long_term_goals` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `icp_assessment_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `icp_assessment_sections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`order` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `icp_assessment_sections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `icp_assessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`company_name` varchar(255) NOT NULL,
	`industry` varchar(255),
	`company_size` varchar(50),
	`revenue` varchar(50),
	`status` varchar(50) NOT NULL DEFAULT 'draft',
	`completed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `icp_assessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `icp_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessment_id` int NOT NULL,
	`profile_name` varchar(255) NOT NULL,
	`vertical` varchar(255),
	`description` text NOT NULL,
	`pain_points` json,
	`buying_behaviors` json,
	`decision_criteria` json,
	`recommended_methodology` varchar(255),
	`recommended_marketing` varchar(255),
	`channels` json,
	`messaging_framework` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `icp_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `icp_references` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessment_id` int NOT NULL,
	`reference_type` varchar(100) NOT NULL,
	`reference_id` int,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `icp_references_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `playbook_connections` ADD CONSTRAINT `playbook_connections_playbook_id_playbooks_id_fk` FOREIGN KEY (`playbook_id`) REFERENCES `playbooks`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `playbook_connections` ADD CONSTRAINT `playbook_connections_source_node_id_playbook_nodes_id_fk` FOREIGN KEY (`source_node_id`) REFERENCES `playbook_nodes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `playbook_connections` ADD CONSTRAINT `playbook_connections_target_node_id_playbook_nodes_id_fk` FOREIGN KEY (`target_node_id`) REFERENCES `playbook_nodes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `playbook_executions` ADD CONSTRAINT `playbook_executions_playbook_id_playbooks_id_fk` FOREIGN KEY (`playbook_id`) REFERENCES `playbooks`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `playbook_executions` ADD CONSTRAINT `playbook_executions_current_node_id_playbook_nodes_id_fk` FOREIGN KEY (`current_node_id`) REFERENCES `playbook_nodes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `playbook_node_executions` ADD CONSTRAINT `playbook_node_executions_execution_id_playbook_executions_id_fk` FOREIGN KEY (`execution_id`) REFERENCES `playbook_executions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `playbook_node_executions` ADD CONSTRAINT `playbook_node_executions_node_id_playbook_nodes_id_fk` FOREIGN KEY (`node_id`) REFERENCES `playbook_nodes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `playbook_nodes` ADD CONSTRAINT `playbook_nodes_playbook_id_playbooks_id_fk` FOREIGN KEY (`playbook_id`) REFERENCES `playbooks`(`id`) ON DELETE cascade ON UPDATE no action;