// ============================================
// DATABASE CONFIGURATION - SRP: APENAS CONFIG
// ============================================

import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// CONFIGURATION INTERFACES
// ============================================

export interface DatabaseConfig {
  connectionString: string;
  isProduction: boolean;
  isDevelopment: boolean;
  poolConfig: {
    max: number;
    idleTimeout: number;
    maxLifetime: number;
    connectTimeout: number;
  };
  sslConfig:
    | {
        rejectUnauthorized: boolean;
      }
    | false;
  logging: boolean;
  prepare: boolean;
  transform: boolean;
}

export interface PostgresTypeConfig {
  bigint: {
    to: number;
    from: number[];
    serialize: (x: any) => string;
    parse: (x: string) => number;
  };
  json: {
    to: number;
    from: number[];
    serialize: (x: any) => string;
    parse: (x: string) => any;
  };
}

// ============================================
// ENVIRONMENT LOADING
// ============================================

function loadEnvironment(): boolean {
  const envPaths = [
    path.resolve(process.cwd(), '../../.env.local'), // From packages/database
    path.resolve(process.cwd(), '.env.local'), // From root
    path.resolve(__dirname, '../../../.env.local'), // From dist
    path.resolve(__dirname, '../../../../.env.local'), // Fallback
  ];

  let envLoaded = false;

  for (const envPath of envPaths) {
    try {
      config({ path: envPath, override: false });
      if (process.env.DATABASE_URL) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Environment loaded from: ${envPath}`);
        }
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

  return envLoaded;
}

// ============================================
// CONFIGURATION VALIDATION
// ============================================

function validateDatabaseUrl(): string {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ DATABASE_URL not found');
    console.log('📁 Current working directory:', process.cwd());
    console.log(
      '🔍 Available env vars with DB:',
      Object.keys(process.env)
        .filter(k => k.includes('DB') || k.includes('DATABASE'))
        .join(', ') || 'none'
    );
    throw new Error('DATABASE_URL environment variable is required');
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Database connection string validated');
  }

  return connectionString;
}

// ============================================
// CONFIGURATION FACTORY
// ============================================

export function createDatabaseConfig(): DatabaseConfig {
  // Load environment
  loadEnvironment();

  // Validate required vars
  const connectionString = validateDatabaseUrl();

  // Environment detection
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isTest = process.env.NODE_ENV === 'test';

  return {
    connectionString,
    isProduction,
    isDevelopment,
    poolConfig: {
      max: isProduction ? 20 : isTest ? 2 : 5,
      idleTimeout: isProduction ? 20 : 10,
      maxLifetime: isProduction ? 60 * 60 : 60 * 30, // 1h prod, 30m dev
      connectTimeout: 30,
    },
    sslConfig: isProduction ? { rejectUnauthorized: false } : false,
    logging: isDevelopment,
    prepare: false, // Better compatibility
    transform: true, // Enable camelCase transform
  };
}

// ============================================
// POSTGRES TYPE CONFIGURATION
// ============================================

export function createPostgresTypes(): PostgresTypeConfig {
  return {
    // BigInt type (OID 20) - handle as number
    bigint: {
      to: 20,
      from: [20],
      serialize: (x: any) => x.toString(),
      parse: (x: string) => parseInt(x, 10),
    },
    // JSON/JSONB types (OID 114, 3802)
    json: {
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
  };
}

// ============================================
// CONFIGURATION VALIDATION HELPERS
// ============================================

export function validateEnvironment(): void {
  const required = ['DATABASE_URL'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

export function getConnectionInfo() {
  const config = createDatabaseConfig();

  return {
    isProduction: config.isProduction,
    isDevelopment: config.isDevelopment,
    poolSize: config.poolConfig.max,
    sslEnabled: !!config.sslConfig,
    loggingEnabled: config.logging,
  };
}
