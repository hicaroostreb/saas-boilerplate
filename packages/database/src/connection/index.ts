// ============================================
// CONNECTION BARREL EXPORTS - BUILD-TIME SAFE
// ============================================

// Main database exports
export {
  closeConnection,
  getConnectionInfo,
  getDatabaseConnection,
  getDb,
  healthCheck,
  type Database,
} from './database.connection';

// Configuration exports
export {
  createDatabaseConfig,
  createPostgresTypes,
  detectBuildContext,
  getConnectionInfo as getConfigInfo,
  validateEnvironment,
  type BuildContext,
  type DatabaseConfig,
  type PostgresTypeConfig,
} from './config';

// Drizzle ORM re-exports
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

// Type utilities
export type {
  InferInsertModel,
  InferSelectModel,
  Placeholder,
  SQL,
} from 'drizzle-orm';

// Connection utilities
export function withQueryPerformance<T>(
  queryName: string,
  query: () => Promise<T>
): Promise<T> {
  if (process.env.NODE_ENV !== 'development') {
    return query();
  }

  const start = performance.now();
  console.log(`[DB] Starting: ${queryName}`);

  return query()
    .then(result => {
      const duration = Math.round(performance.now() - start);
      console.log(`[DB] Completed: ${queryName} (${duration}ms)`);
      return result;
    })
    .catch(error => {
      const duration = Math.round(performance.now() - start);
      console.error(`[DB] Failed: ${queryName} (${duration}ms)`, error.message);
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
export function isDuplicateKeyError(error: unknown): boolean {
  const err = error as { code?: string; message?: string };
  return Boolean(
    err?.code === '23505' ||
      err?.message?.includes('duplicate key') ||
      err?.message?.includes('already exists')
  );
}

export function isForeignKeyError(error: unknown): boolean {
  const err = error as { code?: string; message?: string };
  return Boolean(
    err?.code === '23503' ||
      err?.message?.includes('foreign key') ||
      err?.message?.includes('violates foreign key constraint')
  );
}

export function isNotNullError(error: unknown): boolean {
  const err = error as { code?: string; message?: string };
  return Boolean(
    err?.code === '23502' ||
      err?.message?.includes('null value') ||
      err?.message?.includes('violates not-null constraint')
  );
}

export function isCheckConstraintError(error: unknown): boolean {
  const err = error as { code?: string; message?: string };
  return Boolean(
    err?.code === '23514' || err?.message?.includes('check constraint')
  );
}
