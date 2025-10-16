// packages/database/src/repositories/index.ts
// ============================================
// REPOSITORIES BARREL EXPORTS (REFACTORED)
// ============================================

// Contracts
export type {
  IOrganizationRepository,
  ISessionRepository,
  IUserRepository,
} from './contracts';

// Implementations
export { DrizzleUserRepository } from './implementations/drizzle-user.repository';

export { DrizzleSessionRepository } from './implementations/drizzle-session.repository';

export {
  DrizzleOrganizationRepository,
  QuotaExceededError,
} from './implementations/drizzle-organization.repository';

export { DrizzleAuditRepository } from './implementations/drizzle-audit.repository';

export type { IAuditRepository } from './implementations/drizzle-audit.repository';

export { DrizzleRateLimitRepository } from './implementations/drizzle-rate-limit.repository';

export type { IRateLimitRepository } from './implementations/drizzle-rate-limit.repository';

// Factory
export {
  createRepositories,
  createRepositoryFactory,
  type RepositoryFactory,
  type RepositoryRegistry,
} from './factory';

// Guards and wrappers
export { AuthorizationGuard, ForbiddenError } from './authorization-guard';

export {
  RLSRepositoryWrapper,
  RLSViolationError,
  createTenantFilterSQL,
  validateTenantResult,
} from './rls-wrapper';
