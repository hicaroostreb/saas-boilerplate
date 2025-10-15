// packages/database/src/index.ts - CLIENT-SAFE EXPORTS ONLY
// ============================================
// DATABASE PACKAGE MAIN EXPORTS - ENTERPRISE
// ============================================

// Connection and database
export {
  DatabaseError,
  getDatabaseConnection,
  getDb,
  type Database,
} from './connection';

// Schemas
export * from './schemas';

// Entities
export * from './entities';

// Repositories
export {
  DrizzleAuditRepository,
  DrizzleOrganizationRepository,
  DrizzleRateLimitRepository,
  DrizzleSessionRepository,
  DrizzleUserRepository,
  createRepositories,
  createRepositoryFactory,
  type IAuditRepository,
  type IOrganizationRepository,
  type IRateLimitRepository,
  type ISessionRepository,
  type IUserRepository,
  type RepositoryFactory,
  type RepositoryRegistry,
} from './repositories';

// ❌ REMOVED: Seeders and Scripts (server-only, causing Next.js build issues)
// Use direct imports for seeding:
// import { runSeed } from '@workspace/database/src/scripts/seed';
// import { developmentSeeder } from '@workspace/database/src/seeders';

// Types and utilities (keeping only client-safe types)
export type { SeedOptions } from './types';
