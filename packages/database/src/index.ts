// ============================================
// DATABASE PACKAGE - MAIN EXPORTS ENTERPRISE
// ============================================

// ============================================
// CONNECTION LAYER
// ============================================

// Main database connection
export {
  closeConnection,
  db,
  getConnectionInfo,
  getDatabaseConnection,
  healthCheck,
  type Database,
} from './connection';

// Connection utilities
export {
  DatabaseError,
  isCheckConstraintError,
  isDuplicateKeyError,
  isForeignKeyError,
  isNotNullError,
  withQueryPerformance,
} from './connection';

// ============================================
// SCHEMA LAYER
// ============================================

// Schema exports by domain
export * from './schemas';

// ============================================
// ENTITY LAYER (DOMAIN OBJECTS)
// ============================================

// Domain entities
export * from './entities';

// ============================================
// REPOSITORY LAYER (DATA ACCESS)
// ============================================

// Repository patterns
export * from './repositories';

// ============================================
// DRIZZLE ORM UTILITIES
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
} from './connection';

// Aggregation functions
export { avg, count, max, min, sum } from './connection';

// Sorting and utilities
export { asc, desc, placeholder, sql } from './connection';

// Type utilities
export type {
  InferInsertModel,
  InferSelectModel,
  Placeholder,
  SQL,
} from './connection';

// ============================================
// BUSINESS UTILITIES
// ============================================

// Pagination utilities
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

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export function createPaginationParams(options: PaginationOptions = {}) {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, options.limit || DEFAULT_PAGE_SIZE)
  );
  const offset = options.offset || (page - 1) * limit;

  return { page, limit, offset };
}

export function createPaginationResult<T>(
  data: T[],
  total: number,
  options: { page: number; limit: number }
): PaginationResult<T> {
  const { page, limit } = options;
  const totalPages = Math.ceil(total / limit);
  const hasMore = page < totalPages;

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore,
    },
  };
}

// ============================================
// VALIDATION UTILITIES
// ============================================

// UUID validation
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Slug validation
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 100;
}

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Slug generation
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// ============================================
// SEED UTILITIES
// ============================================

import { runAllSeeders } from './seeders';

export interface SeedOptions {
  force?: boolean; // Force reseed even if data exists
  verbose?: boolean; // Log detailed information
}

export async function seedDatabase(options: SeedOptions = {}): Promise<void> {
  const { verbose = false } = options;

  if (verbose) {
    console.log('Starting database seed...');
  }

  try {
    await runAllSeeders(options);

    if (verbose) {
      console.log('Database seed completed successfully');
    }
  } catch (error) {
    console.error('Database seed failed:', error);
    throw error;
  }
}

// ============================================
// TRANSACTION UTILITIES
// ============================================

import { db } from './connection';

export async function withTransaction<T>(
  callback: Parameters<typeof db.transaction>[0]
): Promise<T> {
  return db.transaction(callback) as Promise<T>;
}

// ============================================
// HEALTH CHECK UTILITIES
// ============================================

import {
  getConnectionInfo as dbGetConnectionInfo,
  healthCheck as dbHealthCheck,
} from './connection';

export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  details: Record<string, unknown>;
}> {
  try {
    const isHealthy = await dbHealthCheck();
    const connectionInfo = await dbGetConnectionInfo();

    return {
      healthy: isHealthy,
      details: {
        connected: isHealthy,
        connectionInfo,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      healthy: false,
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
    };
  }
}

// ============================================
// PACKAGE INFO
// ============================================

export const packageInfo = {
  name: '@workspace/database',
  version: '1.0.0',
  description: 'Enterprise database layer with Clean Architecture',

  // Architecture layers
  layers: {
    connection: 'Database connection and configuration',
    schemas: 'Drizzle table definitions organized by domain',
    entities: 'Domain objects with business logic',
    repositories: 'Data access layer with Repository Pattern',
  },

  // Features
  features: [
    'Clean Architecture',
    'Repository Pattern',
    'Domain-Driven Design',
    'Single Responsibility Principle',
    'Dependency Inversion',
    'Type Safety',
    'Performance Optimized',
    'Enterprise Scalable',
    'Lazy Loading',
    'Singleton Pattern',
  ],

  // Tech stack
  techStack: {
    orm: 'Drizzle ORM',
    database: 'PostgreSQL',
    architecture: 'Clean Architecture + DDD-Lite',
    patterns: ['Repository', 'Entity', 'Factory', 'Singleton', 'Lazy Loading'],
    principles: ['SRP', 'DIP', 'ISP'],
  },
} as const;

// Export schema info for introspection
export { schemaInfo } from './schemas';
