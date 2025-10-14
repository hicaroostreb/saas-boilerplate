// packages/database/src/index.ts
// ============================================
// DATABASE PACKAGE MAIN EXPORTS - ENTERPRISE
// ============================================

// Connection and database
export {
  getDb,
  getDatabaseConnection,
  type Database,
  DatabaseError,
} from './connection';

// Schemas
export * from './schemas';

// Entities
export * from './entities';

// Repositories
export {
  createRepositoryFactory,
  createRepositories,
  type RepositoryFactory,
  type RepositoryRegistry,
  type IUserRepository,
  type ISessionRepository,
  type IOrganizationRepository,
  type IAuditRepository,
  type IRateLimitRepository,
  DrizzleUserRepository,
  DrizzleSessionRepository,
  DrizzleOrganizationRepository,
  DrizzleAuditRepository,
  DrizzleRateLimitRepository,
} from './repositories';

// Seeders
export {
  developmentSeeder,
  productionSeeder,
  runTestingSeed,
  runSeeder,
  type SeedResult,
} from './seeders';

// Scripts
export {
  runSeed,
} from './scripts/seed';

// Types and utilities
export type {
  SeedOptions,
} from './types';
