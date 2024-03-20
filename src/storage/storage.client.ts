import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { join } from "path";
import * as schema from "./storage.schema.js";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { __rootDir } from "../node.utils.js";
import { existsSync, mkdirSync } from "fs";

const dataFolderPath = join(__rootDir, "data");
const dbPath = join(dataFolderPath, "./data.db");
const migrationsFolder = join(__rootDir, "drizzle");

if (!existsSync(dataFolderPath)) mkdirSync(dataFolderPath);

const sqlite = new Database(dbPath);
const _db = drizzle(sqlite, { schema });
await migrate(_db, { migrationsFolder });

export const db = _db;
