CREATE TABLE `category_breakdown` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`district_id` integer NOT NULL,
	`data_date` text NOT NULL,
	`category_name` text NOT NULL,
	`percentage` integer NOT NULL,
	`work_count` integer NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`district_id`) REFERENCES `districts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `district_performance` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`district_id` integer NOT NULL,
	`data_date` text NOT NULL,
	`work_completed` integer NOT NULL,
	`funds_utilized_percentage` integer NOT NULL,
	`active_workers` integer NOT NULL,
	`average_wage` integer NOT NULL,
	`work_completion_rate` integer NOT NULL,
	`fund_utilization_rate` integer NOT NULL,
	`worker_participation_rate` integer NOT NULL,
	`target_works` integer NOT NULL,
	`achievement_works` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`district_id`) REFERENCES `districts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `districts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`district_code` text NOT NULL,
	`district_name_en` text NOT NULL,
	`district_name_hi` text NOT NULL,
	`state_name` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `districts_district_code_unique` ON `districts` (`district_code`);--> statement-breakpoint
CREATE TABLE `monthly_trends` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`district_id` integer NOT NULL,
	`month` integer NOT NULL,
	`year` integer NOT NULL,
	`work_completed` integer NOT NULL,
	`funds_utilized` integer NOT NULL,
	`active_workers` integer NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`district_id`) REFERENCES `districts`(`id`) ON UPDATE no action ON DELETE no action
);
