CREATE TABLE `assistants` (
	`id` text PRIMARY KEY NOT NULL,
	`foreign_id` text NOT NULL,
	`serialized_config` text NOT NULL,
	`version` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `threads` (
	`id` text PRIMARY KEY NOT NULL,
	`foreign_key` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `assistant_foreign_id_idx` ON `assistants` (`foreign_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `threads_foreign_id_idx` ON `threads` (`foreign_key`);