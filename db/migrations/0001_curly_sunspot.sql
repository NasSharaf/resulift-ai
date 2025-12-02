ALTER TABLE `jobs` RENAME COLUMN "job_description" TO "description";--> statement-breakpoint
ALTER TABLE `resumes` RENAME COLUMN "tailored_text" TO "extracted_text";--> statement-breakpoint
CREATE TABLE `tailored_resumes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`resume_id` text NOT NULL,
	`job_id` text NOT NULL,
	`tailored_text` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`first_name` text,
	`last_name` text,
	`email` text,
	`plan` text DEFAULT 'free' NOT NULL,
	`credits` integer DEFAULT 50 NOT NULL
);
--> statement-breakpoint
ALTER TABLE `jobs` ALTER COLUMN "description" TO "description" text NOT NULL;--> statement-breakpoint
ALTER TABLE `resumes` ADD `title` text;--> statement-breakpoint
ALTER TABLE `resumes` ADD `blob_url` text;--> statement-breakpoint
ALTER TABLE `resumes` DROP COLUMN `original_text`;