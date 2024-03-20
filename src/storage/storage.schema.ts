import {
  sqliteTable,
  uniqueIndex,
  text,
  integer,
} from "drizzle-orm/sqlite-core";

export const assistants = sqliteTable(
  "assistants",
  {
    id: text("id").primaryKey(),
    foreignId: text("foreign_id").notNull(),
    serializedConfig: text("serialized_config", { mode: "json" }).notNull(),
    version: integer("version").notNull().default(0),
  },
  (assistant) => ({
    foreignIdIdx: uniqueIndex("assistant_foreign_id_idx").on(
      assistant.foreignId,
    ),
  }),
);

export const threads = sqliteTable(
  "threads",
  {
    id: text("id").notNull().primaryKey(),
    foreignId: text("foreign_key").notNull(),
  },
  (thread) => ({
    foreignIdIdx: uniqueIndex("threads_foreign_id_idx").on(thread.foreignId),
  }),
);
