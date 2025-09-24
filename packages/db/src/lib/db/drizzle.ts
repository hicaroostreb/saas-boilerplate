import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";
import { config } from "dotenv";
import path from "path";

// Ir duas pastas acima do packages/db para chegar na raiz
const rootPath = path.resolve(process.cwd(), "../../.env.local");
config({ path: rootPath });

const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const sql = postgres(connectionString, {
  idle_timeout: 60,
  prepare: false,
});

export const db = drizzle(sql, { schema });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
