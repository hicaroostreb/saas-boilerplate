// packages/database/src/repositories/index.ts
// ============================================
// REPOSITORIES BARREL EXPORTS - ENTERPRISE COMPLETE
// ============================================

// Factory exports
export {
  createRepositoryFactory,
  createRepositories,
  type RepositoryFactory,
  type RepositoryRegistry,
} from './factory';

// Contract exports
export type {
  IUserRepository,
  UserQueryOptions,
  UserFilterOptions,
  ISessionRepository,
  SessionData,
  CreateSessionData,
  SessionListItem,
  IOrganizationRepository,
  IAuditRepository,
  SecurityMetrics,
  IRateLimitRepository,
} from './contracts';

// Implementation exports
export {
  DrizzleUserRepository,
  DrizzleSessionRepository,
  DrizzleOrganizationRepository,
  DrizzleAuditRepository,
  DrizzleRateLimitRepository,
} from './implementations';
