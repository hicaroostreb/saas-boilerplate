// packages/database/src/repositories/index.ts
// ============================================
// REPOSITORIES BARREL EXPORTS (FIXED)
// ============================================

// Factory and registry
export {
  createRepositoryFactory,
  createRepositories,
  type RepositoryFactory,
  type RepositoryRegistry,
} from './factory';

// Contracts (only existing ones)
export type {
  IUserRepository,
  ISessionRepository,
  IOrganizationRepository,
  IAuditRepository,
  IRateLimitRepository,
} from './contracts';

// Implementations
export {
  DrizzleUserRepository,
  DrizzleSessionRepository,
  DrizzleOrganizationRepository,
  DrizzleAuditRepository,
  DrizzleRateLimitRepository,
} from './implementations';
