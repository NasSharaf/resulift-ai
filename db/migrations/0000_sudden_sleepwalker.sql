CREATE TABLE `jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`job_description` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `resumes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`original_text` text,
	`tailored_text` text,
	`created_at` integer NOT NULL
);
