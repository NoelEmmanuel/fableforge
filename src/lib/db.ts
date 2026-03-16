import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/db/schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Add it to your env for Drizzle.");
}

const pool = new Pool({
  connectionString,
});

export const db = drizzle(pool, { schema });
export type DB = typeof db;

