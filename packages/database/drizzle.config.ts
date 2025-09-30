import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// ============================================
// ENVIRONMENT CONFIGURATION - ✅ FIXED: No __dirname
// ============================================

// ✅ ENTERPRISE: Multi-path .env loading strategy (ESM compatible)
const envPaths = [
  '../../.env.local', // From packages/database
  '../../../.env.local', // Alternative depth
  '.env.local', // Current directory
];

// Load environment with fallback strategy
let envLoaded = false;
for (const envPath of envPaths) {
  try {
    config({ path: envPath, override: false });
    if (process.env.DATABASE_URL) {
      console.log(`✅ Drizzle config loaded env from: ${envPath}`);
      envLoaded = true;
      break;
    }
  } catch (error) {
    continue; // Try next path
  }
}

if (!envLoaded) {
  console.warn(
    '⚠️  Drizzle config: No .env.local found, using system env vars'
  );
}

// ============================================
// DRIZZLE CONFIGURATION
// ============================================

export default defineConfig({
  // ✅ FIXED: New enterprise schema structure
  schema: './src/schemas/index.ts', // Single entry point for all domains

  out: './drizzle',
  dialect: 'postgresql',

  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },

  // ✅ ENTERPRISE: Environment-aware configuration
  verbose: process.env.NODE_ENV === 'development',
  strict: true,

  // ✅ MIGRATIONS: Enhanced configuration
  migrations: {
    table: '__drizzle_migrations', // Prefix to avoid conflicts
    schema: 'public',
  },

  // ✅ INTROSPECTION: For sync with existing database
  introspect: {
    casing: 'snake_case',
  },

  // ✅ ENTERPRISE: Comprehensive tables filter (updated)
  tablesFilter: [
    // Auth domain
    'user',
    'account',
    'session',
    'verificationToken',

    // Business domain
    'organizations',
    'memberships',
    'invitations',
    'projects',
    'contacts',

    // Security domain
    'auth_audit_logs',
    'rate_limits',
    'password_reset_tokens',

    // Activity domain
    'activity_logs',

    // System tables
    '__drizzle_migrations',
  ],

  // ✅ SCHEMA GENERATION: Production-ready settings
  schemaFilter: ['public'],

  // ✅ ENTERPRISE: Additional optimizations
  breakpoints: true, // Enable migration breakpoints
});

// ============================================
// CONFIGURATION VALIDATION
// ============================================

// Validate required environment variables
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

// Log configuration summary in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Drizzle Kit Configuration:');
  console.log(`   📊 Schema: ./src/schemas/index.ts`);
  console.log(`   📁 Output: ./drizzle`);
  console.log(`   🗃️  Database: PostgreSQL`);
  console.log(`   📋 Tables: 12 tracked tables`);
}
