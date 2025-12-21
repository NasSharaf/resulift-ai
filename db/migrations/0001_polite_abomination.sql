CREATE TABLE `stripe_events` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`processed_at` integer NOT NULL
);
--> statement-breakpoint
DROP INDEX "user_profiles_referral_code_unique";--> statement-breakpoint
ALTER TABLE `user_profiles` ALTER COLUMN "free_credits" TO "free_credits" integer NOT NULL DEFAULT 3;--> statement-breakpoint
CREATE UNIQUE INDEX `user_profiles_referral_code_unique` ON `user_profiles` (`referral_code`);