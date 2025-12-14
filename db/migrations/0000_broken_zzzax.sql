CREATE TABLE `user_profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`first_name` text,
	`last_name` text,
	`email` text,
	`plan` text DEFAULT 'free' NOT NULL,
	`free_credits` integer DEFAULT 7 NOT NULL,
	`free_used` integer DEFAULT 0 NOT NULL,
	`referral_code` text,
	`referred_by` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_profiles_referral_code_unique` ON `user_profiles` (`referral_code`);