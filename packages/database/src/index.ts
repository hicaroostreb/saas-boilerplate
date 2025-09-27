// ============================================
// CORE DATABASE EXPORTS
// ============================================

// Main database client
export { db } from './client';

// ✅ SCHEMA: All tables and relations
export * from './schema';

// ============================================
// DRIZZLE ORM UTILITIES
// ============================================

// Core query utilities
export {
  and,
  asc,
  avg,
  between,
  count,
  desc,
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
  max,
  min,
  ne,
  notExists,
  notInArray,
  or,
  placeholder,
  sql,
  sum,
} from 'drizzle-orm';

// ✅ TYPE UTILITIES: Enhanced TypeScript support
export type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

// ============================================
// BUSINESS LOGIC UTILITIES
// ============================================

// ✅ PAGINATION: Utility for consistent pagination
export interface PaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// ✅ HELPERS: Common query patterns
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export function createPaginationParams(options: PaginationOptions = {}) {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, options.limit || DEFAULT_PAGE_SIZE)
  );
  const offset = options.offset ?? (page - 1) * limit;

  return { page, limit, offset };
}

// ============================================
// VALIDATION UTILITIES
// ============================================

// ✅ UUID VALIDATION: Validate UUID strings
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// ✅ SLUG VALIDATION: Validate URL-safe slugs
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 100;
}

// ✅ EMAIL VALIDATION: Basic email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ============================================
// AUDIT LOGGING UTILITIES
// ============================================

// ✅ ACTIVITY LOG: Helper for consistent activity logging
export interface ActivityLogParams {
  organizationId: string;
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  entityName?: string;
  description: string;
  changes?: Record<string, { from: any; to: any }>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

// ============================================
// ERROR UTILITIES
// ============================================

// ✅ DATABASE ERRORS: Enhanced error handling
export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public constraint?: string,
    public table?: string
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export function isDuplicateKeyError(error: any): boolean {
  return error?.code === '23505' || error?.message?.includes('duplicate key');
}

export function isForeignKeyError(error: any): boolean {
  return error?.code === '23503' || error?.message?.includes('foreign key');
}

export function isNotFoundError(error: any): boolean {
  return error?.code === '02000' || error?.message?.includes('no data found');
}

// ============================================
// PERFORMANCE UTILITIES
// ============================================

// ✅ QUERY PERFORMANCE: Monitoring and optimization
export function withQueryLogging<T>(
  queryName: string,
  query: () => Promise<T>
): Promise<T> {
  if (process.env.NODE_ENV !== 'development') {
    return query();
  }

  const start = Date.now();
  console.log(`🔍 [DB] Starting query: ${queryName}`);

  return query()
    .then(result => {
      const duration = Date.now() - start;
      console.log(`✅ [DB] Query completed: ${queryName} (${duration}ms)`);
      return result;
    })
    .catch(error => {
      const duration = Date.now() - start;
      console.error(
        `❌ [DB] Query failed: ${queryName} (${duration}ms)`,
        error
      );
      throw error;
    });
}
