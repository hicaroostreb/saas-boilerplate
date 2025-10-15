// packages/database/src/repositories/factory.ts
// ============================================
// REPOSITORY FACTORY - ENTERPRISE DI PATTERN (REFACTORED)
// ============================================

import type { Database } from '../connection';
import { AuthorizationGuard } from './authorization-guard';
import type {
  IOrganizationRepository,
  ISessionRepository,
  IUserRepository,
} from './contracts';
import {
  DrizzleAuditRepository,
  type IAuditRepository,
} from './implementations/drizzle-audit.repository';
import { DrizzleOrganizationRepository } from './implementations/drizzle-organization.repository';
import {
  DrizzleRateLimitRepository,
  type IRateLimitRepository,
} from './implementations/drizzle-rate-limit.repository';
import { DrizzleSessionRepository } from './implementations/drizzle-session.repository';
import { DrizzleUserRepository } from './implementations/drizzle-user.repository';
import { RLSRepositoryWrapper } from './rls-wrapper';

export interface RepositoryRegistry {
  userRepository: IUserRepository;
  sessionRepository: ISessionRepository;
  organizationRepository: IOrganizationRepository;
  auditRepository: IAuditRepository;
  rateLimitRepository: IRateLimitRepository;
  authorizationGuard: AuthorizationGuard;
  rlsWrapper: RLSRepositoryWrapper;
}

export interface RepositoryFactory {
  createUserRepository(): IUserRepository;
  createSessionRepository(): ISessionRepository;
  createOrganizationRepository(): IOrganizationRepository;
  createAuditRepository(): IAuditRepository;
  createRateLimitRepository(): IRateLimitRepository;
  createAuthorizationGuard(): AuthorizationGuard;
  createRLSWrapper(): RLSRepositoryWrapper;
}

export function createRepositoryFactory(database: Database): RepositoryFactory {
  return {
    createUserRepository(): IUserRepository {
      return new DrizzleUserRepository(database);
    },

    createSessionRepository(): ISessionRepository {
      return new DrizzleSessionRepository(database);
    },

    createOrganizationRepository(): IOrganizationRepository {
      return new DrizzleOrganizationRepository(database);
    },

    createAuditRepository(): IAuditRepository {
      return new DrizzleAuditRepository(database);
    },

    createRateLimitRepository(): IRateLimitRepository {
      return new DrizzleRateLimitRepository(database);
    },

    createAuthorizationGuard(): AuthorizationGuard {
      return new AuthorizationGuard(database);
    },

    createRLSWrapper(): RLSRepositoryWrapper {
      return new RLSRepositoryWrapper(database);
    },
  };
}

export async function createRepositories(
  database: Database
): Promise<RepositoryRegistry> {
  const factory = createRepositoryFactory(database);

  return {
    userRepository: factory.createUserRepository(),
    sessionRepository: factory.createSessionRepository(),
    organizationRepository: factory.createOrganizationRepository(),
    auditRepository: factory.createAuditRepository(),
    rateLimitRepository: factory.createRateLimitRepository(),
    authorizationGuard: factory.createAuthorizationGuard(),
    rlsWrapper: factory.createRLSWrapper(),
  };
}
