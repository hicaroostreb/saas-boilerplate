import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Environment loading
const envPaths = [
  '../../.env.local',
  '../../../.env.local', 
  '.env.local',
];

let envLoaded = false;
for (const envPath of envPaths) {
  try {
    config({ path: envPath, override: false });
    if (process.env.DATABASE_URL) {
      console.log(`Drizzle config loaded env from: ${envPath}`);
      envLoaded = true;
      break;
    }
  } catch (error) {
    continue;
  }
}

if (!envLoaded) {
  console.warn('Drizzle config: No .env.local found, using system env vars');
}

export default defineConfig({
  schema: './src/schemas/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },

  verbose: process.env.NODE_ENV === 'development',
  strict: true,
  breakpoints: true,

  tablesFilter: [
    'users',
    'accounts', 
    'sessions',
    'verification_tokens',
    'organizations',
    'memberships',
    'invitations', 
    'projects',
    'contacts',
    'auth_audit_logs',
    'rate_limits',
    'password_reset_tokens',
    'activity_logs',
  ],

  schemaFilter: ['public'],
});

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

if (process.env.NODE_ENV === 'development') {
  console.log('Drizzle Kit Enterprise Configuration:');
  console.log('   Schema: ./src/schemas/index.ts');
  console.log('   Output: ./drizzle');
  console.log('   Database: PostgreSQL (Multi-tenant)');
  console.log('   Tables: 13 tracked enterprise tables');
}
