import * as dotenv from 'dotenv';
import type { Config } from 'drizzle-kit';
import { resolve } from 'path';

// Load .env.local from root do monorepo
dotenv.config({ path: resolve(__dirname, '../../.env.local') });

// ✅ Usar DIRECT_DATABASE_URL para migrations (porta 5432)
const databaseUrl = process.env.DIRECT_DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    '❌ DIRECT_DATABASE_URL is required for migrations.\n' +
      'Add to .env.local:\n' +
      'DIRECT_DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"'
  );
}

console.log(
  '✅ Using DIRECT connection for migrations:',
  databaseUrl.replace(/:[^:@]+@/, ':***@')
);

export default {
  // ✅ IMPORTANTE: Usar src/ não dist/ (Drizzle lê TypeScript direto)
  schema: './src/schemas/**/*.schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
  verbose: true,
  strict: true,
} satisfies Config;
