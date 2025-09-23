import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);
const connectionString = `${supabaseUrl.replace("https://", "postgresql://")}?sslmode=require`;
const sql = postgres(connectionString, { idle_timeout: 60 });
export const db = drizzle(sql);
