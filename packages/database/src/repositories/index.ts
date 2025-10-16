// packages/database/src/repositories/index.ts
// ============================================
// REPOSITORIES BARREL EXPORTS (REFACTORED - SECURE)
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

// Guards
export { AuthorizationGuard, ForbiddenError } from './authorization-guard';

// ❌ REMOVIDO: export { RLSRepositoryWrapper } - Interno, não deve ser público
// ❌ REMOVIDO: export { validateTenantResult } - Interno
// ✅ MANTIDO: RLSViolationError (erro público)
// ✅ MANTIDO: createTenantFilterSQL (utilitário público)

export { RLSViolationError, createTenantFilterSQL } from './rls-wrapper';
