CREATE TABLE `applications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`job_id` text NOT NULL,
	`tailored_resume_id` text NOT NULL,
	`company_name` text,
	`job_title` text,
	`application_status` text DEFAULT 'generated' NOT NULL,
	`applied_at` integer,
	`ats_score_before` integer,
	`ats_score_after` integer,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `tailored_resumes` ADD `ats_score_before` integer;--> statement-breakpoint
ALTER TABLE `tailored_resumes` ADD `ats_score_after` integer;