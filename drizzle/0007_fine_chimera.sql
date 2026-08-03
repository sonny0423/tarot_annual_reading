ALTER TABLE `users` ADD `subscriptionStart` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionStatus` enum('active','suspended','expired') NOT NULL DEFAULT 'active';--> statement-breakpoint
