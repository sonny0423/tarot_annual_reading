ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `subscriptionStart` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `subscriptionStatus` enum('active','suspended','expired') NOT NULL DEFAULT 'active';--> statement-breakpoint
