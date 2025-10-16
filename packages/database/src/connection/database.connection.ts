// packages/database/src/connection/database.connection.ts
// ============================================
// DATABASE CONNECTION - SUPABASE POOLER (ENTERPRISE)
// ============================================

import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { RLSRepositoryWrapper } from '../repositories/rls-wrapper';

// Schema imports
import * as activitySchemas from '../schemas/activity';
import * as authSchemas from '../schemas/auth';
import * as businessSchemas from '../schemas/business';
import * as securitySchemas from '../schemas/security';

const allSchemas = {
  ...authSchemas,
  ...businessSchemas,
  ...securitySchemas,
  ...activitySchemas,
};

export type Database = PostgresJsDatabase<typeof allSchemas>;
// ✅ ADICIONADO: Tipo seguro que força uso de RLS wrapper
export type DatabaseWrapper = RLSRepositoryWrapper;

export class DatabaseConnection {
  private static instance: DatabaseConnection | null = null;
  private client: ReturnType<typeof postgres> | null = null;
  private drizzleDb: Database | null = null;
  private isConnecting = false;

  private constructor() {}

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  async connect(): Promise<Database> {
    // Se já está conectado, retorna
    if (this.drizzleDb) {
      return this.drizzleDb;
    }

    // Evita múltiplas conexões simultâneas
    if (this.isConnecting) {
      await new Promise(resolve => setTimeout(resolve, 100));
      return this.connect();
    }

    this.isConnecting = true;

    try {
      // Usar DATABASE_URL (pooler) em runtime
      const databaseUrl =
        process.env.DATABASE_URL || process.env.DIRECT_DATABASE_URL;

      if (!databaseUrl) {
        throw new Error(
          'DATABASE_URL or DIRECT_DATABASE_URL must be set in environment variables'
        );
      }

      // ✅ Detectar pooler APENAS pela porta :6543
      const isSupabasePooler = databaseUrl.includes(':6543');

      if (isSupabasePooler) {
        console.log('✅ Using Supabase Pooler (PgBouncer) - port 6543');
      } else {
        console.log('✅ Using Direct Connection - port 5432');
      }

      this.client = postgres(databaseUrl, {
        max: isSupabasePooler ? 10 : 20,
        idle_timeout: 20,
        connect_timeout: 10,
        prepare: !isSupabasePooler, // Disable prepared statements com pooler
        onnotice: () => {}, // Silenciar notices
      });

      this.drizzleDb = drizzle(this.client, {
        schema: allSchemas,
        logger: false,
      });

      console.log('✅ Database connected successfully');
      return this.drizzleDb;
    } catch (error) {
      const err = error as Error;
      console.error('❌ Database connection failed:', err.message);
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  /**
   * ✅ ADICIONADO: Retorna wrapper RLS seguro
   * Este é o método padrão para acesso ao banco em aplicações
   */
  getWrapper(): DatabaseWrapper {
    if (!this.drizzleDb) {
      throw new Error('Database not initialized. Call await getDb() first.');
    }
    return new RLSRepositoryWrapper(this.drizzleDb);
  }

  /**
   * Retorna instância raw do Drizzle (sem RLS wrapper)
   * ⚠️ USO INTERNO - Apenas para migrations, seeders e testes
   */
  getDbRaw(): Database {
    if (!this.drizzleDb) {
      throw new Error('Database not initialized. Call await getDb() first.');
    }
    return this.drizzleDb;
  }

  async closeConnection(): Promise<void> {
    if (this.client) {
      await this.client.end();
      this.client = null;
      this.drizzleDb = null;
      console.log('✅ Database connection closed');
    }
  }

  async healthCheck(): Promise<{
    healthy: boolean;
    latency_ms: number;
    pool_size: number;
  }> {
    try {
      const db = await this.connect();
      const start = performance.now();
      await db.execute('SELECT 1');
      const latency = performance.now() - start;

      return {
        healthy: true,
        latency_ms: Math.round(latency),
        pool_size: 10,
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return { healthy: false, latency_ms: 0, pool_size: 0 };
    }
  }
}

// ============================================
// EXPORTS SEGUROS
// ============================================

export const getDatabaseConnection = () => DatabaseConnection.getInstance();

/**
 * ✅ PRINCIPAL: Retorna wrapper RLS seguro
 * Use este método em TODA aplicação (APIs, services, repositories)
 *
 * Exemplo:
 * ```
 * const db = await getDb();
 * const repos = await createRepositories(db);
 * const users = await repos.user.findAll(); // Automaticamente filtrado por tenant
 * ```
 */
export const getDb = async (): Promise<DatabaseWrapper> => {
  const connection = getDatabaseConnection();
  await connection.connect();
  return connection.getWrapper();
};

/**
 * ✅ ADICIONADO: Acesso raw ao database (SEM RLS wrapper)
 * ⚠️ APENAS para migrations, seeders e scripts de infraestrutura
 * ⚠️ NUNCA use em código de aplicação (APIs, services)
 *
 * Exemplo válido:
 * ```
 * // scripts/seed.ts
 * const db = await getDbRaw();
 * await db.insert(users).values([...]); // Sem tenant_id automático
 * ```
 */
export const getDbRaw = async (): Promise<Database> => {
  const connection = getDatabaseConnection();
  await connection.connect();
  return connection.getDbRaw();
};

// ❌ REMOVIDO: Proxy db singleton (inseguro)
// Forçar uso de await getDb() ou await getDbRaw()

export const healthCheck = async () => {
  return getDatabaseConnection().healthCheck();
};

export const closeConnection = async () => {
  return getDatabaseConnection().closeConnection();
};

export const getConnectionInfo = () => {
  const url = process.env.DATABASE_URL || '';
  const isPooler = url.includes(':6543'); // Detectar apenas pela porta

  return {
    type: isPooler ? 'pooler' : 'direct',
    port: isPooler ? '6543' : '5432',
    pooling: isPooler ? 'PgBouncer' : 'Direct',
  };
};
