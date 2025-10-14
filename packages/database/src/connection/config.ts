// packages/database/src/connection/config.ts
// ============================================
// DATABASE CONFIGURATION - ENTERPRISE
// ============================================

export interface PoolConfig {
  max: number;
  idleTimeout: number;
  connectTimeout: number;
}

export interface SSLConfig {
  rejectUnauthorized: boolean;
  ca?: string;
  key?: string;
  cert?: string;
}

export interface BuildContext {
  isBuild: boolean;
  isCI: boolean;
  environment: string;
}

export interface DatabaseConfig {
  connectionString: string;
  poolConfig: PoolConfig;
  sslConfig: SSLConfig | false;
  logging: boolean;
  prepare: boolean;
  transform: boolean;
  isDevelopment: boolean;
  buildContext: BuildContext;
}

export function createDatabaseConfig(): DatabaseConfig {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const isDevelopment = process.env.NODE_ENV !== 'production';
  const isCI = process.env.CI === 'true';
  const isBuild = process.env.NEXT_PHASE === 'phase-production-build';

  return {
    connectionString,
    poolConfig: {
      max: parseInt(process.env.DATABASE_MAX_CONNECTIONS || '10', 10),
      idleTimeout: parseInt(process.env.DATABASE_IDLE_TIMEOUT || '30', 10),
      connectTimeout: parseInt(process.env.DATABASE_CONNECT_TIMEOUT || '10', 10),
    },
    sslConfig: createSSLConfig(),
    logging: isDevelopment && process.env.DATABASE_LOGGING !== 'false',
    prepare: process.env.DATABASE_PREPARE !== 'false',
    transform: process.env.DATABASE_TRANSFORM_KEYS === 'true',
    isDevelopment,
    buildContext: {
      isBuild,
      isCI,
      environment: process.env.NODE_ENV || 'development',
    },
  };
}

function createSSLConfig(): SSLConfig | false {
  if (process.env.DATABASE_SSL === 'false') {
    return false;
  }

  // Production defaults to SSL
  if (process.env.NODE_ENV === 'production') {
    return {
      rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false',
      ca: process.env.DATABASE_SSL_CA,
      key: process.env.DATABASE_SSL_KEY,
      cert: process.env.DATABASE_SSL_CERT,
    };
  }

  // Development SSL optional
  if (process.env.DATABASE_SSL === 'true') {
    return {
      rejectUnauthorized: false,
    };
  }

  return false;
}

export function createPostgresTypes() {
  return {
    bigint: process.env.DATABASE_BIGINT_AS_NUMBER === 'true' ? {
      to: 20,
      from: [20],
      parse: (value: string) => parseInt(value, 10),
      serialize: (value: number) => value.toString(),
    } : null,
    json: {
      to: 114,
      from: [114, 3802],
      parse: (value: string) => {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      },
      serialize: JSON.stringify,
    },
  };
}
