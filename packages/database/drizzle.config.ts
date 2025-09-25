import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';
import path from 'path';

// Carregar .env.local da raiz do projeto
config({ path: path.resolve(__dirname, '../../.env.local') });

export default defineConfig({
  schema: './src/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
