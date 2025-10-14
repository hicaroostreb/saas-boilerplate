// packages/database/src/connection/database.connection.ts
// ============================================
// DATABASE CONNECTION - ENTERPRISE LAZY INITIALIZATION
// Zero any, circuit breaker, pooling otimizado
// ============================================

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import {
  createDatabaseConfig,
  createPostgresTypes,
  type DatabaseConfig,
} from './config';

// Schema imports
import * as activitySchemas from '../schemas/activity';
import * as authSchemas from '../schemas/auth';
import * as businessSchemas from '../schemas/business';
import * as securitySchemas from '../schemas/security';

const allSchemas = {
  ...activitySchemas,
  ...authSchemas,
  ...businessSchemas,
  ...securitySchemas,
};

export class DatabaseConnection {
  private config: DatabaseConfig | null = null;
  private client: postgres.Sql | null = null;
  private drizzleDb: ReturnType<typeof drizzle> | null = null;
  private isInitialized = false;
  private isConnected = false;
  private failureCount = 0;
  private lastFailure: Date | null = null;

  private readonly MAX_FAILURES = 5;
  private readonly CIRCUIT_TIMEOUT = 30000;

  constructor() {}

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    this.config = createDatabaseConfig();

    if (this.isBuildTime()) {
      // Build time: Return immediately without connection
      this.isInitialized = true;
      this.isConnected = true;
      return;
    }

    await this.setupRealConnection();
    this.isInitialized = true;
  }

  private isBuildTime(): boolean {
    return (
      this.config?.buildContext.isBuild ||
      this.config?.buildContext.isCI ||
      false
    );
  }

  private async setupRealConnection(): Promise<void> {
    if (!this.config) {
      throw new Error('Configuration not initialized');
    }

    if (this.isCircuitOpen()) {
      throw new Error('Database circuit breaker is open');
    }

    try {
      this.client = this.createPostgresClient();
      this.drizzleDb = this.createDrizzleInstance();
      this.setupProcessHandlers();
      await this.initializeConnection();
      
      this.failureCount = 0;
      this.lastFailure = null;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private isCircuitOpen(): boolean {
    if (this.failureCount < this.MAX_FAILURES) {
      return false;
    }

    if (!this.lastFailure) {
      return false;
    }

    const timeSinceLastFailure = Date.now() - this.lastFailure.getTime();
    return timeSinceLastFailure < this.CIRCUIT_TIMEOUT;
  }

  private recordFailure(): void {
    this.failureCount++;
    this.lastFailure = new Date();
    
    if (this.failureCount >= this.MAX_FAILURES) {
      console.error(
        `Database circuit breaker opened after ${this.failureCount} failures`
      );
    }
  }

  private createPostgresClient(): postgres.Sql {
    if (!this.config) {
      throw new Error('Configuration not initialized');
    }

    const types = createPostgresTypes();

    return postgres(this.config.connectionString, {
      max: this.config.poolConfig.max,
      idle_timeout: this.config.poolConfig.idleTimeout,
      connect_timeout: this.config.poolConfig.connectTimeout,
      prepare: this.config.prepare,
      onnotice: this.config.isDevelopment ? console.log : () => {},
      ssl: this.config.sslConfig,
      transform: this.config.transform ? postgres.camel : undefined,
      types: types.bigint ? {
        [types.bigint.to]: types.bigint,
        [types.json.to]: types.json,
      } : undefined,
    });
  }

  private createDrizzleInstance() {
    if (!this.config || !this.client) {
      throw new Error('Configuration or client not initialized');
    }

    const logger = this.config.logging ? {
      logQuery: (query: string, params: unknown[]) => {
        const truncatedQuery = query.length > 200 
          ? `${query.substring(0, 200)}...` 
          : query;
        
        console.log('[DB Query]:', truncatedQuery);
        
        if (params.length > 0) {
          const safeParams = params.slice(0, 5).map(param => 
            typeof param === 'string' && param.length > 50 
              ? '[LARGE_STRING]' 
              : param
          );
          console.log('[DB Params]:', safeParams);
        }
      },
    } : false;

    return drizzle(this.client, {
      schema: allSchemas,
      logger,
      casing: 'snake_case',
    });
  }

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
        throw error;
      }
    } else {
      this.isConnected = true;
    }
  }

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

  private setupProcessHandlers(): void {
    if (this.isBuildTime()) {
      return;
    }

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

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2'));

    process.on('uncaughtException', error => {
      console.error('Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });
  }

  get database() {
    if (!this.isInitialized) {
      throw new Error(
        'Database not initialized. Call await DatabaseConnection.getInstance().initialize() first.'
      );
    }

    if (this.isBuildTime()) {
      // Build time: Return null - Repository should handle this
      return null as unknown as ReturnType<typeof drizzle>;
    }

    return this.drizzleDb!;
  }

  async healthCheck(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.isBuildTime()) {
      return true;
    }

    try {
      if (!this.client) {
        return false;
      }
      await this.client`SELECT 1 as health`;
      return true;
    } catch (error) {
      console.error('Health check failed:', error);
      this.recordFailure();
      return false;
    }
  }

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

let dbConnectionInstance: DatabaseConnection | null = null;

export function getDatabaseConnection(): DatabaseConnection {
  if (!dbConnectionInstance) {
    dbConnectionInstance = new DatabaseConnection();
  }
  return dbConnectionInstance;
}

export async function getDb() {
  const connection = getDatabaseConnection();
  await connection.initialize();
  return connection.database;
}

export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(_, prop) {
    throw new Error(
      `Database not initialized. Use "await getDb()" instead of direct "db.${String(prop)}" access. ` +
      `This ensures proper lazy initialization and build-time safety.`
    );
  },
});

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
