CREATE TABLE `readings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`birth_year` int NOT NULL,
	`birth_month` int NOT NULL,
	`birth_day` int NOT NULL,
	`is_lunar` int NOT NULL DEFAULT 0,
	`inner_card_id` int NOT NULL,
	`outer_card_id` int NOT NULL,
	`core_card_id` int NOT NULL,
	`benefactor_inner_card_id` int NOT NULL,
	`benefactor_outer_card_id` int NOT NULL,
	`benefactor_core_card_id` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `readings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tarot_cards` (
	`id` int NOT NULL,
	`name` varchar(50) NOT NULL,
	`positive_traits` text NOT NULL,
	`negative_traits` text NOT NULL,
	`meaning` text NOT NULL,
	`upright` text NOT NULL,
	`reversed` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tarot_cards_id` PRIMARY KEY(`id`)
);
