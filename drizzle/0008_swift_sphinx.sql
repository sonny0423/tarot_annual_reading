ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `approvalStatus` enum('pending','approved','rejected') DEFAULT 'approved' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `reviewedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `reviewedBy` int;