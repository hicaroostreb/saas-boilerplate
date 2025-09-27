import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';
import path from 'path';

// ✅ Carregar .env.local da raiz do projeto
config({ path: path.resolve(__dirname, '../../.env.local') });

export default defineConfig({
  schema: './src/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',

  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },

  // ✅ ENTERPRISE: Configuration otimizadas
  verbose: process.env.NODE_ENV === 'development',
  strict: true,

  // ✅ MIGRATIONS: Configurações robustas
  migrations: {
    table: 'drizzle_migrations',
    schema: 'public',
  },

  // ✅ INTROSPECTION: Para sync com banco existente
  introspect: {
    casing: 'snake_case',
  },

  // ✅ TABLESFILTER: Evitar conflitos com outras tabelas
  tablesFilter: [
    'user',
    'account',
    'session',
    'verificationToken',
    'organizations',
    'memberships',
    'invitations',
    'projects',
    'contacts',
    'activity_logs',
    'password_reset_tokens',
  ],

  // ✅ SCHEMA GENERATION: Para melhor DX
  schemaFilter: ['public'],
});
