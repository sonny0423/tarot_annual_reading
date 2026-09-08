ALTER TABLE `users` ADD `approvalStatus` enum('pending','approved','rejected') DEFAULT 'approved' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `reviewedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `reviewedBy` int;