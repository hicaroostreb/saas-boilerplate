import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// ============================================
// ENVIRONMENT CONFIGURATION - ESM COMPATIBLE
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
// DRIZZLE CONFIGURATION - ENTERPRISE MULTI-TENANT
// ============================================

export default defineConfig({
  // ✅ ENTERPRISE: Single entry point for all domains
  schema: './src/schemas/index.ts',

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
    table: '__drizzle_migrations',
    schema: 'public',
  },

  // ✅ INTROSPECTION: For sync with existing database
  introspect: {
    casing: 'snake_case',
  },

  // ✅ ENTERPRISE: Comprehensive tables filter (updated with multi-tenancy)
  tablesFilter: [
    // Auth domain
    'user',
    'account',
    'session',
    'verificationToken',

    // Business domain (multi-tenant)
    'organizations',
    'memberships',
    'invitations',
    'projects',
    'contacts',

    // Security domain (enterprise audit)
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
  console.log('🔧 Drizzle Kit Enterprise Configuration:');
  console.log(`   📊 Schema: ./src/schemas/index.ts`);
  console.log(`   📁 Output: ./drizzle`);
  console.log(`   🗃️  Database: PostgreSQL (Multi-tenant)`);
  console.log(`   📋 Tables: 12 tracked enterprise tables`);
  console.log(`   🏗️  Features: Soft Delete, Audit Trail, Multi-tenancy`);
}
