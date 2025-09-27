import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import path from 'path';
import postgres from 'postgres';
import { fileURLToPath } from 'url';
import * as schema from './schema';

// ============================================
// ENVIRONMENT CONFIGURATION
// ============================================

// ✅ ESM COMPATIBILITY: Get __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ ROBUST: Multiple path resolution strategies
const envPaths = [
  path.resolve(process.cwd(), '../../.env.local'), // From packages/database
  path.resolve(process.cwd(), '.env.local'), // From root
  path.resolve(__dirname, '../../../.env.local'), // From dist
];

// Try loading from multiple locations
let envLoaded = false;
for (const envPath of envPaths) {
  try {
    config({ path: envPath, override: false });
    if (process.env.DATABASE_URL) {
      console.log(`✅ Environment loaded from: ${envPath}`);
      envLoaded = true;
      break;
    }
  } catch (error) {
    continue; // Try next path
  }
}

if (!envLoaded && process.env.NODE_ENV !== 'production') {
  console.warn('⚠️  No .env.local found, using environment variables');
}

// ============================================
// DATABASE CONNECTION
// ============================================

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL not found');
  console.log('📁 Current working directory:', process.cwd());
  console.log('🔍 Tried loading from:');
  envPaths.forEach(p => console.log(`   - ${p}`));
  console.log(
    '🌍 Available env vars:',
    Object.keys(process.env).filter(
      k => k.includes('DB') || k.includes('DATABASE')
    )
  );
  throw new Error('DATABASE_URL environment variable is required');
}

console.log('✅ Database connection string loaded');

// ✅ ENTERPRISE: Production-grade connection config
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// Create PostgreSQL connection with optimized settings
const client = postgres(connectionString, {
  // ✅ CONNECTION POOLING: Optimized for production
  max: isProduction ? 20 : 5, // More connections in prod
  idle_timeout: isProduction ? 20 : 10, // Seconds
  max_lifetime: isProduction ? 60 * 60 : 60 * 30, // 1h prod, 30m dev

  // ✅ PERFORMANCE: Connection optimization
  connect_timeout: 30, // Connection timeout
  prepare: false, // Disable prepared statements for better compatibility

  // ✅ RELIABILITY: Error handling
  onnotice: isDevelopment ? console.log : () => {}, // Log notices in dev only

  // ✅ SSL: Production security
  ssl: isProduction ? { rejectUnauthorized: false } : false,

  // ✅ TRANSFORM: Handle special column types
  transform: postgres.camel, // Convert snake_case to camelCase

  // ✅ TYPES: Enhanced type handling (FORMATO CORRETO)
  types: {
    // BigInt type (OID 20) - handle as number for compatibility
    20: {
      to: 20,
      from: [20],
      serialize: (x: any) => x.toString(),
      parse: (x: string) => parseInt(x, 10),
    },
    // JSON/JSONB types (OID 114, 3802) - handle JSON parsing
    114: {
      to: 114,
      from: [114, 3802],
      serialize: (x: any) => JSON.stringify(x),
      parse: (x: string) => {
        try {
          return JSON.parse(x);
        } catch {
          return x;
        }
      },
    },
  },
});

// ✅ LOGGING: Enhanced development logging
const logger = isDevelopment
  ? {
      logQuery: (query: string, params: unknown[]) => {
        console.log('🔍 [DB Query]:', query);
        if (params.length > 0) {
          console.log('📋 [DB Params]:', params);
        }
      },
    }
  : false;

// ✅ Create Drizzle instance with enhanced config
export const db = drizzle(client, {
  schema,
  logger,
  // Enable prepared statements for better performance
  casing: 'snake_case', // Handle DB naming conventions
});

export type Database = typeof db;

// ============================================
// CONNECTION UTILITIES
// ============================================

// ✅ HEALTH CHECK: Database connectivity test
export async function healthCheck(): Promise<boolean> {
  try {
    await client`SELECT 1 as health`;
    console.log('💚 Database health check: OK');
    return true;
  } catch (error) {
    console.error('💥 Database health check failed:', error);
    return false;
  }
}

// ✅ CONNECTION INFO: Get database connection details
export async function getConnectionInfo() {
  try {
    const [result] = await client`
      SELECT 
        current_database() as database,
        current_user as user,
        version() as version,
        current_setting('server_version') as server_version
    `;

    console.log('📊 Database Info:', {
      database: result.database,
      user: result.user,
      version: result.server_version,
    });

    return result;
  } catch (error) {
    console.error('❌ Failed to get connection info:', error);
    return null;
  }
}

// ✅ GRACEFUL SHUTDOWN: Proper connection cleanup
export async function closeConnection(): Promise<void> {
  try {
    await client.end();
    console.log('✅ Database connection closed gracefully');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
  }
}

// ✅ PROCESS CLEANUP: Handle app termination
if (typeof process !== 'undefined') {
  process.on('SIGINT', closeConnection);
  process.on('SIGTERM', closeConnection);
  process.on('exit', closeConnection);
}

// ============================================
// ENHANCED DRIZZLE EXPORTS
// ============================================

// Re-export ALL Drizzle utilities with organization
export {
  // ✅ LOGICAL OPERATORS
  and,
  // ✅ SORTING
  asc,
  avg,
  // ✅ RANGE OPERATORS
  between,
  // ✅ AGGREGATION FUNCTIONS
  count,
  desc,
  // ✅ COMPARISON OPERATORS
  eq,
  exists,
  gt,
  gte,
  ilike,

  // ✅ ARRAY OPERATORS
  inArray,
  isNotNull,
  // ✅ NULL OPERATORS
  isNull,
  // ✅ STRING OPERATORS
  like,
  lt,
  lte,
  max,
  min,
  ne,
  not,
  notExists,
  notInArray,
  or,
  placeholder,
  // ✅ ADVANCED
  sql,
  sum,
} from 'drizzle-orm';

// ✅ TYPE EXPORTS
export type {
  InferInsertModel,
  InferSelectModel,
  Placeholder,
  SQL,
} from 'drizzle-orm';

// ============================================
// DEVELOPMENT UTILITIES
// ============================================

// ✅ DEV ONLY: Log database queries in development
if (isDevelopment) {
  console.log('🚀 Database client initialized in development mode');

  // Test connection on startup
  healthCheck().catch(console.error);

  // Log connection info
  getConnectionInfo().catch(console.error);
}
