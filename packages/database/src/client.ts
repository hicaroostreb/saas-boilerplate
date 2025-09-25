import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import path from 'path';
import postgres from 'postgres';
import * as schema from './schema';

// CORRIGIR: Subir até a raiz do projeto
// De packages/database -> para raiz
config({ path: path.resolve(process.cwd(), '../../.env.local') });

// Connection string
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL not found');
  console.log('📁 Current working directory:', process.cwd());
  console.log(
    '🔍 Looking for .env.local at:',
    path.resolve(process.cwd(), '../../.env.local')
  );
  throw new Error('DATABASE_URL environment variable is required');
}

console.log('✅ Database connection string loaded');

// Create PostgreSQL connection
const client = postgres(connectionString, {
  max: process.env.NODE_ENV === 'production' ? 10 : 1,
  idle_timeout: 20,
  max_lifetime: 60 * 30,
});

// Create Drizzle instance
export const db = drizzle(client, {
  schema,
  logger: process.env.NODE_ENV === 'development',
});

export type Database = typeof db;

// Re-export Drizzle utilities
export {
  and,
  asc,
  desc,
  eq,
  ilike,
  inArray,
  isNotNull,
  isNull,
  like,
  not,
  notInArray,
  or,
  sql,
} from 'drizzle-orm';

export type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
