// packages/database/src/repositories/factory.ts
// ============================================
// REPOSITORY FACTORY - ENTERPRISE DI PATTERN (FINAL)
// ============================================

import type { DatabaseWrapper } from '../connection';
import { AuthorizationGuard } from './authorization-guard';
import type { IOrganizationRepository, IUserRepository } from './contracts';
import {
  DrizzleAuditRepository,
  type IAuditRepository,
} from './implementations/drizzle-audit.repository';
import { DrizzleOrganizationRepository } from './implementations/drizzle-organization.repository';
import {
  DrizzleRateLimitRepository,
  type IRateLimitRepository,
} from './implementations/drizzle-rate-limit.repository';
import {
  DrizzleSessionRepository,
  type ISessionRepository, // ✅ CORRIGIDO: Import da implementação
} from './implementations/drizzle-session.repository';
import { DrizzleUserRepository } from './implementations/drizzle-user.repository';

export interface RepositoryRegistry {
  user: IUserRepository;
  session: ISessionRepository;
  organization: IOrganizationRepository;
  audit: IAuditRepository;
  rateLimit: IRateLimitRepository;
  authorizationGuard: AuthorizationGuard;
}

export interface RepositoryFactory {
  createUserRepository(): IUserRepository;
  createSessionRepository(): ISessionRepository;
  createOrganizationRepository(): IOrganizationRepository;
  createAuditRepository(): IAuditRepository;
  createRateLimitRepository(): IRateLimitRepository;
  createAuthorizationGuard(): AuthorizationGuard;
}

export function createRepositoryFactory(
  rls: DatabaseWrapper
): RepositoryFactory {
  return {
    createUserRepository(): IUserRepository {
      return new DrizzleUserRepository(rls);
    },

    createSessionRepository(): ISessionRepository {
      return new DrizzleSessionRepository(rls);
    },

    createOrganizationRepository(): IOrganizationRepository {
      return new DrizzleOrganizationRepository(rls);
    },

    createAuditRepository(): IAuditRepository {
      return new DrizzleAuditRepository(rls);
    },

    createRateLimitRepository(): IRateLimitRepository {
      return new DrizzleRateLimitRepository(rls);
    },

    createAuthorizationGuard(): AuthorizationGuard {
      return new AuthorizationGuard(rls);
    },
  };
}

export async function createRepositories(
  rls: DatabaseWrapper
): Promise<RepositoryRegistry> {
  const factory = createRepositoryFactory(rls);

  return {
    user: factory.createUserRepository(),
    session: factory.createSessionRepository(),
    organization: factory.createOrganizationRepository(),
    audit: factory.createAuditRepository(),
    rateLimit: factory.createRateLimitRepository(),
    authorizationGuard: factory.createAuthorizationGuard(),
  };
}
