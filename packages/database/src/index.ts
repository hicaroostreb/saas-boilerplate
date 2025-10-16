// packages/database/src/index.ts
// ============================================
// DATABASE PACKAGE MAIN BARREL (REFACTORED - SECURE)
// ============================================

// ============================================
// SCHEMAS & TYPES
// ============================================
export * from './schemas';

// ============================================
// ENTITIES
// ============================================
export { MembershipEntity, OrganizationEntity, UserEntity } from './entities';
export type {
  MemberPermission,
  OrganizationLimits,
  OrganizationQuotaStatus,
  OrganizationUsage,
  ResourceType,
} from './entities';

// ============================================
// REPOSITORIES
// ============================================
export type {
  IOrganizationRepository,
  ISessionRepository,
  IUserRepository,
} from './repositories/contracts';

export {
  DrizzleAuditRepository,
  DrizzleOrganizationRepository,
  DrizzleRateLimitRepository,
  DrizzleSessionRepository,
  DrizzleUserRepository,
  QuotaExceededError,
} from './repositories';

export type { IAuditRepository, IRateLimitRepository } from './repositories';

export {
  createRepositories,
  createRepositoryFactory,
  type RepositoryFactory,
  type RepositoryRegistry,
} from './repositories';

export {
  AuthorizationGuard,
  ForbiddenError,
  RLSViolationError,
  createTenantFilterSQL,
} from './repositories';

// ❌ NÃO EXPORTAR: RLSRepositoryWrapper (interno)
// ❌ NÃO EXPORTAR: validateTenantResult (interno)

// ============================================
// CONNECTION (APENAS ESSENCIAIS)
// ============================================
export {
  closeConnection,
  getConnectionInfo,
  getDatabaseConnection,
  getDb, // ✅ Retorna DatabaseWrapper (seguro)
  getDbRaw, // ✅ Acesso raw (apenas migrations/seeders)
  healthCheck,
  type Database,
  type DatabaseWrapper,
} from './connection';

// ❌ NÃO EXPORTAR: db singleton (inseguro)

export {
  AllowSystemContext,
  RequiresTenantContext,
  TenantContextError,
  tenantContext,
  type TenantContext,
} from './connection';

export {
  DatabaseError,
  formatDatabaseError,
  isCheckConstraintError,
  isConnectionError,
  isDeadlockError,
  isDuplicateKeyError,
  isForeignKeyError,
  isNotNullError,
  isUniqueConstraintError,
  withQueryPerformance,
} from './connection';

export {
  createDatabaseConfig,
  type BuildContext,
  type DatabaseConfig,
  type PoolConfig,
  type SSLConfig,
} from './connection';

// ============================================
// TYPES RE-EXPORTS (CONVENIÊNCIA)
// ============================================
export type {
  ActivityLog,
  AuthAuditLog,
  Contact,
  Membership,
  Organization,
  Project,
  RateLimit,
  Session,
  User,
} from './schemas';

// ============================================
// UTILITIES
// ============================================
export { createTenantLogger, logger, type ILogger } from './utils/logger';
