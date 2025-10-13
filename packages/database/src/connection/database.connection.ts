// ============================================
// DATABASE CONNECTION - LAZY INITIALIZATION ENTERPRISE
// ============================================

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import {
  createDatabaseConfig,
  createPostgresTypes,
  type DatabaseConfig,
} from './config';

// ============================================
// SCHEMA IMPORTS (ORGANIZED BY DOMAIN)
// ============================================

import * as activitySchemas from '../schemas/activity';
import * as authSchemas from '../schemas/auth';
import * as businessSchemas from '../schemas/business';
import * as securitySchemas from '../schemas/security';

// Combine all schemas
const allSchemas = {
  ...activitySchemas,
  ...authSchemas,
  ...businessSchemas,
  ...securitySchemas,
};

// ============================================
// DATABASE CONNECTION CLASS - LAZY ENTERPRISE
// ============================================

export class DatabaseConnection {
  private config: DatabaseConfig | null = null;
  private client: postgres.Sql | null = null;
  private drizzleDb: ReturnType<typeof drizzle> | null = null;
  private isInitialized: boolean = false;
  private isConnected: boolean = false;

  // ✅ NO SIDE EFFECTS CONSTRUCTOR
  constructor() {
    // Defer all initialization to explicit initialize() call
  }

  // ============================================
  // LAZY INITIALIZATION - ENTERPRISE PATTERN
  // ============================================

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return; // Already initialized
    }

    this.config = createDatabaseConfig();

    // BUILD-TIME: Mock setup
    if (this.isBuildTime()) {
      this.setupMockConnection();
    } else {
      // RUNTIME: Real setup
      this.client = this.createPostgresClient();
      this.drizzleDb = this.createDrizzleInstance();
      this.setupProcessHandlers();
      await this.initializeConnection();
    }

    this.isInitialized = true;
  }

  private isBuildTime(): boolean {
    return (
      this.config?.buildContext.isBuild ||
      this.config?.buildContext.isCI ||
      false
    );
  }

  // ============================================
  // MOCK CONNECTION FOR BUILD-TIME
  // ============================================

  private setupMockConnection(): void {
    // Create mock Drizzle instance for build-time
    this.drizzleDb = new Proxy({} as any, {
      get(target, prop) {
        if (prop === 'transaction') {
          return (callback: any) =>
            Promise.resolve(
              callback(
                new Proxy(
                  {},
                  {
                    get: () => () => Promise.resolve([]),
                  }
                )
              )
            );
        }
        if (
          prop === 'select' ||
          prop === 'insert' ||
          prop === 'update' ||
          prop === 'delete'
        ) {
          return () =>
            new Proxy(
              {},
              {
                get: () => () => Promise.resolve([]),
              }
            );
        }
        return () => Promise.resolve([]);
      },
    });

    this.isConnected = true;

    if (this.config?.buildContext.environment === 'ci') {
      console.log(' Mock database connection initialized for CI');
    }
  }

  // ============================================
  // POSTGRES CLIENT CREATION - RUNTIME ONLY
  // ============================================

  private createPostgresClient(): postgres.Sql {
    if (!this.config) {
      throw new Error('Configuration not initialized');
    }

    const types = createPostgresTypes();

    return postgres(this.config.connectionString, {
      // Connection pool settings
      max: this.config.poolConfig.max,
      idle_timeout: this.config.poolConfig.idleTimeout,
      connect_timeout: this.config.poolConfig.connectTimeout,

      // Performance settings
      prepare: this.config.prepare,

      // Development logging
      onnotice: this.config.isDevelopment ? console.log : () => {},

      // SSL configuration
      ssl: this.config.sslConfig,

      // Transform snake_case to camelCase
      transform: this.config.transform ? postgres.camel : undefined,

      // Enhanced type handling
      types: {
        [types.bigint.to]: types.bigint,
        [types.json.to]: types.json,
      },
    });
  }

  // ============================================
  // DRIZZLE INSTANCE CREATION - RUNTIME ONLY
  // ============================================

  private createDrizzleInstance() {
    if (!this.config || !this.client) {
      throw new Error('Configuration or client not initialized');
    }

    const logger = this.config.logging
      ? {
          logQuery: (query: string, params: unknown[]) => {
            console.log(
              '[DB Query]:',
              query.substring(0, 200) + (query.length > 200 ? '...' : '')
            );
            if (params.length > 0) {
              console.log('[DB Params]:', params.slice(0, 5));
            }
          },
        }
      : false;

    return drizzle(this.client, {
      schema: allSchemas,
      logger,
      casing: 'snake_case', // Handle DB naming conventions
    });
  }

  // ============================================
  // CONNECTION INITIALIZATION - RUNTIME ONLY
  // ============================================

  private async initializeConnection(): Promise<void> {
    if (!this.config) {
      throw new Error('Configuration not initialized');
    }

    if (this.config.isDevelopment) {
      try {
        await this.runHealthCheck();
        await this.logConnectionInfo();
        this.isConnected = true;
        console.log('Database connection initialized successfully');
      } catch (error) {
        console.error('Database initialization failed:', error);
        this.isConnected = false;
      }
    } else {
      // In production, assume connection is valid
      this.isConnected = true;
    }
  }

  // ============================================
  // HEALTH CHECK & MONITORING - RUNTIME ONLY
  // ============================================

  private async runHealthCheck(): Promise<void> {
    if (!this.client) {
      throw new Error('Client not initialized');
    }

    const [result] = await this.client`SELECT 1 as health`;

    if (!result?.health) {
      throw new Error('Database health check failed');
    }

    console.log('Database health check: OK');
  }

  private async logConnectionInfo(): Promise<void> {
    if (!this.client) {
      return;
    }

    try {
      const [result] = await this.client`
        SELECT
          current_database() as database,
          current_user as "user",
          current_setting('server_version') as server_version,
          current_setting('max_connections') as max_connections
      `;

      console.log('Database Info:', {
        database: result?.database ?? 'unknown',
        user: result?.user ?? 'unknown',
        version: result?.server_version ?? 'unknown',
        maxConnections: result?.max_connections ?? 'unknown',
      });
    } catch (error) {
      console.warn('Could not retrieve database info:', error);
    }
  }

  // ============================================
  // PROCESS HANDLERS - RUNTIME ONLY
  // ============================================

  private setupProcessHandlers(): void {
    if (this.isBuildTime()) {
      return; // Skip process handlers during build
    }

    // Increase max listeners to prevent warnings
    process.setMaxListeners(20);

    const gracefulShutdown = async (signal: string) => {
      console.log(`Received ${signal}, closing database connection...`);

      try {
        await this.close();
        console.log('Database connection closed gracefully');
        process.exit(0);
      } catch (error) {
        console.error('Error during graceful shutdown:', error);
        process.exit(1);
      }
    };

    // Handle various termination signals
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // nodemon

    // Handle uncaught exceptions
    process.on('uncaughtException', error => {
      console.error('Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });
  }

  // ============================================
  // PUBLIC METHODS - INITIALIZATION SAFE
  // ============================================

  // Get database instance
  get database() {
    if (!this.isInitialized) {
      throw new Error(
        'Database not initialized. Call await DatabaseConnection.getInstance().initialize() first.'
      );
    }
    return this.drizzleDb!;
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.isBuildTime()) {
      return true; // Mock health check for build time
    }

    try {
      if (!this.client) {
        return false;
      }
      await this.client`SELECT 1 as health`;
      return true;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Connection info
  async getConnectionInfo() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.isBuildTime()) {
      return {
        build: true,
        environment: this.config?.buildContext.environment,
      };
    }

    try {
      if (!this.client) {
        return null;
      }

      const [result] = await this.client`
        SELECT
          current_database() as database,
          current_user as "user",
          version() as version,
          current_setting('server_version') as server_version
      `;
      return result;
    } catch (error) {
      console.error('Failed to get connection info:', error);
      return null;
    }
  }

  // Graceful shutdown
  async close(): Promise<void> {
    if (!this.isInitialized || this.isBuildTime()) {
      return;
    }

    try {
      if (this.client) {
        await this.client.end();
      }
      this.isConnected = false;
      console.log('Database connection closed');
    } catch (error) {
      console.error('Error closing database connection:', error);
      throw error;
    }
  }
}

// ============================================
// SINGLETON INSTANCE - LAZY INITIALIZATION
// ============================================

let dbConnectionInstance: DatabaseConnection | null = null;

export function getDatabaseConnection(): DatabaseConnection {
  if (!dbConnectionInstance) {
    dbConnectionInstance = new DatabaseConnection();
  }
  return dbConnectionInstance;
}

// ============================================
// SAFE EXPORTS - NO SIDE EFFECTS
// ============================================

// ✅ LAZY DATABASE GETTER
export async function getDb() {
  const connection = getDatabaseConnection();
  await connection.initialize();
  return connection.database;
}

// ✅ SAFE PROXY EXPORT FOR BACKWARD COMPATIBILITY
export const db = new Proxy({} as any, {
  get(target, prop) {
    throw new Error(
      `Database not initialized. Use "await getDb()" instead of direct "db.${String(prop)}" access. ` +
        `This ensures proper lazy initialization and build-time safety.`
    );
  },
});

// ✅ SAFE UTILITY EXPORTS
export const healthCheck = async () => {
  const connection = getDatabaseConnection();
  return connection.healthCheck();
};

export const closeConnection = async () => {
  const connection = getDatabaseConnection();
  return connection.close();
};

export const getConnectionInfo = async () => {
  const connection = getDatabaseConnection();
  return connection.getConnectionInfo();
};

export type Database = Awaited<ReturnType<typeof getDb>>;
