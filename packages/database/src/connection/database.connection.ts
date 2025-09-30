// ============================================
// DATABASE CONNECTION - SRP: APENAS CONNECTION
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

// Combine all schemas for Drizzle
const allSchemas = {
  ...authSchemas,
  ...businessSchemas,
  ...securitySchemas,
  ...activitySchemas,
};

// ============================================
// DATABASE CONNECTION CLASS
// ============================================

export class DatabaseConnection {
  private config: DatabaseConfig;
  private client: postgres.Sql;
  private drizzleDb: ReturnType<typeof drizzle>;
  private isConnected: boolean = false;

  constructor() {
    this.config = createDatabaseConfig();
    this.client = this.createPostgresClient();
    this.drizzleDb = this.createDrizzleInstance();

    this.setupProcessHandlers();
    this.initializeConnection();
  }

  // ============================================
  // POSTGRES CLIENT CREATION
  // ============================================

  private createPostgresClient(): postgres.Sql {
    const types = createPostgresTypes();

    return postgres(this.config.connectionString, {
      // Connection pooling
      max: this.config.poolConfig.max,
      idle_timeout: this.config.poolConfig.idleTimeout,
      max_lifetime: this.config.poolConfig.maxLifetime,
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
  // DRIZZLE INSTANCE CREATION
  // ============================================

  private createDrizzleInstance() {
    const logger = this.config.logging
      ? {
          logQuery: (query: string, params: unknown[]) => {
            console.log(
              '🔍 [DB Query]:',
              query.substring(0, 200) + (query.length > 200 ? '...' : '')
            );
            if (params.length > 0) {
              console.log('📋 [DB Params]:', params.slice(0, 5));
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
  // CONNECTION INITIALIZATION
  // ============================================

  private async initializeConnection(): Promise<void> {
    if (this.config.isDevelopment) {
      try {
        await this.runHealthCheck();
        await this.logConnectionInfo();
        this.isConnected = true;
        console.log('🚀 Database connection initialized successfully');
      } catch (error) {
        console.error('❌ Database initialization failed:', error);
        this.isConnected = false;
      }
    } else {
      // In production, assume connection is valid
      this.isConnected = true;
    }
  }

  // ============================================
  // HEALTH CHECK & MONITORING
  // ============================================

  private async runHealthCheck(): Promise<void> {
    const [result] = await this.client`SELECT 1 as health, NOW() as timestamp`;

    if (!result?.health) {
      throw new Error('Database health check failed');
    }

    console.log('💚 Database health check: OK');
  }

  private async logConnectionInfo(): Promise<void> {
    try {
      const [result] = await this.client`
        SELECT 
          current_database() as database,
          current_user as "user",
          current_setting('server_version') as server_version,
          current_setting('max_connections') as max_connections
      `;

      console.log('📊 Database Info:', {
        database: result?.database ?? 'unknown',
        user: result?.user ?? 'unknown',
        version: result?.server_version ?? 'unknown',
        maxConnections: result?.max_connections ?? 'unknown',
      });
    } catch (error) {
      console.warn('⚠️  Could not retrieve database info:', error);
    }
  }

  // ============================================
  // PROCESS HANDLERS & CLEANUP
  // ============================================

  private setupProcessHandlers(): void {
    const gracefulShutdown = async (signal: string) => {
      console.log(`📡 Received ${signal}, closing database connection...`);

      try {
        await this.close();
        console.log('✅ Database connection closed gracefully');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during graceful shutdown:', error);
        process.exit(1);
      }
    };

    // Handle various termination signals
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // nodemon

    // Handle uncaught exceptions
    process.on('uncaughtException', error => {
      console.error('💥 Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });
  }

  // ============================================
  // PUBLIC METHODS
  // ============================================

  // Get database instance
  get database() {
    if (!this.isConnected) {
      console.warn('⚠️  Database may not be connected');
    }
    return this.drizzleDb;
  }

  // Get raw postgres client
  get connection() {
    return this.client;
  }

  // Connection status
  get connected() {
    return this.isConnected;
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      await this.client`SELECT 1 as health`;
      return true;
    } catch (error) {
      console.error('💥 Health check failed:', error);
      return false;
    }
  }

  // Connection info
  async getConnectionInfo() {
    try {
      const [result] = await this.client`
        SELECT 
          current_database() as database,
          current_user as "user",
          version() as version,
          current_setting('server_version') as server_version
      `;
      return result;
    } catch (error) {
      console.error('❌ Failed to get connection info:', error);
      return null;
    }
  }

  // Graceful shutdown
  async close(): Promise<void> {
    try {
      await this.client.end();
      this.isConnected = false;
      console.log('🔌 Database connection closed');
    } catch (error) {
      console.error('❌ Error closing database connection:', error);
      throw error;
    }
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let dbConnectionInstance: DatabaseConnection | null = null;

export function getDatabaseConnection(): DatabaseConnection {
  if (!dbConnectionInstance) {
    dbConnectionInstance = new DatabaseConnection();
  }
  return dbConnectionInstance;
}

// ============================================
// MAIN EXPORTS
// ============================================

const dbConnection = getDatabaseConnection();

// Export main database instance
export const db = dbConnection.database;
export type Database = typeof db;

// Export utility methods
export const healthCheck = () => dbConnection.healthCheck();
export const closeConnection = () => dbConnection.close();
export const getConnectionInfo = () => dbConnection.getConnectionInfo();
