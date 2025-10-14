// packages/database/src/index.ts
// ============================================
// DATABASE PACKAGE MAIN EXPORTS - ENTERPRISE COMPLETE
// ============================================

// Connection exports
export {
  closeConnection,
  getDb,
  healthCheck,
  type Database,
} from './connection';

export {
  DatabaseError,
  isDuplicateKeyError,
  isForeignKeyError,
  isNotNullError,
  isCheckConstraintError,
  withQueryPerformance,
} from './connection';

// Schema exports
export {
  users,
  sessions,
  accounts,
  verification_tokens,
  organizations,
  memberships,
  projects,
  contacts,
  invitations,
  password_reset_tokens,
  rate_limits,
  auth_audit_logs,
  activity_logs,
} from './schemas';

export type {
  User,
  CreateUser,
  PublicUser,
  UserProfile,
  Session,
  CreateSession,
  Account,
  CreateAccount,
  Organization,
  CreateOrganization,
  PublicOrganization,
  Membership,
  CreateMembership,
  MemberRole,
  Project,
  CreateProject,
  Contact,
  CreateContact,
  Invitation,
  CreateInvitation,
  PasswordResetToken,
  RateLimit,
  AuthAuditLog,
  ActivityLog,
  CreateActivityLog,
} from './schemas';

// Entity exports
export {
  UserEntity,
} from './entities/auth/user.entity';

// Repository exports
export {
  createRepositoryFactory,
  createRepositories,
  type RepositoryFactory,
  type RepositoryRegistry,
} from './repositories';

export type {
  IUserRepository,
  ISessionRepository,
  IOrganizationRepository,
  IAuditRepository,
  IRateLimitRepository,
  UserQueryOptions,
  UserFilterOptions,
  SecurityMetrics,
} from './repositories';

// Import healthCheck for use in function
import { healthCheck } from './connection';

// Health check function
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  details?: string;
}> {
  try {
    const isHealthy = await healthCheck();
    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export const DATABASE_PACKAGE_VERSION = '2.0.0';
export const DATABASE_SCHEMA_VERSION = '2.0';

// SeedOptions type for seeders
export interface SeedOptions {
  environment: 'development' | 'testing' | 'production';
  force?: boolean;
  verbose?: boolean;
}
