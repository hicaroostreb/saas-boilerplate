// ============================================
// CONNECTION BARREL EXPORTS - SRP: APENAS EXPORTS
// ============================================

// ============================================
// MAIN DATABASE EXPORTS
// ============================================

export {
  closeConnection,
  db,
  getConnectionInfo,
  getDatabaseConnection,
  healthCheck,
  type Database,
} from './database.connection';

export {
  createDatabaseConfig,
  createPostgresTypes,
  getConnectionInfo as getConfigInfo,
  validateEnvironment,
  type DatabaseConfig,
} from './config';

// ============================================
// DRIZZLE ORM RE-EXPORTS
// ============================================

// Core query builders
export {
  and,
  between,
  eq,
  exists,
  gt,
  gte,
  ilike,
  inArray,
  isNotNull,
  isNull,
  like,
  lt,
  lte,
  ne,
  not,
  notExists,
  notInArray,
  or,
} from 'drizzle-orm';

// Aggregation functions
export { avg, count, max, min, sum } from 'drizzle-orm';

// Sorting and utilities
export { asc, desc, placeholder, sql } from 'drizzle-orm';

// ============================================
// DRIZZLE TYPE EXPORTS
// ============================================

export type {
  InferInsertModel,
  InferSelectModel,
  Placeholder,
  SQL,
} from 'drizzle-orm';

// ============================================
// CONNECTION UTILITIES
// ============================================

import { healthCheck as dbHealthCheck } from './database.connection';

// Performance monitoring wrapper
export function withQueryPerformance<T>(
  queryName: string,
  query: () => Promise<T>
): Promise<T> {
  if (process.env.NODE_ENV !== 'development') {
    return query();
  }

  const start = performance.now();
  console.log(`🔍 [DB] Starting: ${queryName}`);

  return query()
    .then(result => {
      const duration = Math.round(performance.now() - start);
      console.log(`✅ [DB] Completed: ${queryName} (${duration}ms)`);
      return result;
    })
    .catch(error => {
      const duration = Math.round(performance.now() - start);
      console.error(
        `❌ [DB] Failed: ${queryName} (${duration}ms)`,
        error.message
      );
      throw error;
    });
}

// Database error types
export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public constraint?: string,
    public table?: string,
    public column?: string
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Error type guards
export function isDuplicateKeyError(error: any): boolean {
  return (
    error?.code === '23505' ||
    error?.message?.includes('duplicate key') ||
    error?.message?.includes('already exists')
  );
}

export function isForeignKeyError(error: any): boolean {
  return (
    error?.code === '23503' ||
    error?.message?.includes('foreign key') ||
    error?.message?.includes('violates foreign key constraint')
  );
}

export function isNotNullError(error: any): boolean {
  return (
    error?.code === '23502' ||
    error?.message?.includes('null value') ||
    error?.message?.includes('violates not-null constraint')
  );
}

export function isCheckConstraintError(error: any): boolean {
  return (
    error?.code === '23514' || error?.message?.includes('check constraint')
  );
}

// ============================================
// DEVELOPMENT UTILITIES
// ============================================

// Initialize development utilities
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Database connection module loaded in development mode');

  // Auto-run health check in development
  setTimeout(async () => {
    try {
      const isHealthy = await dbHealthCheck();
      if (isHealthy) {
        console.log('💚 Initial health check passed');
      }
    } catch (error) {
      console.error('💥 Initial health check failed:', error);
    }
  }, 1000);
}
