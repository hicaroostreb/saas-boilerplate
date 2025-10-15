// packages/database/src/repositories/factory.ts
// ============================================
// REPOSITORY FACTORY - ENTERPRISE DI PATTERN (ALIGNED)
// ============================================

import type { Database } from '../connection';
import { DrizzleUserRepository } from './implementations/drizzle-user.repository';
import { DrizzleSessionRepository } from './implementations/drizzle-session.repository';
import { DrizzleOrganizationRepository } from './implementations/drizzle-organization.repository';
import { DrizzleAuditRepository, type IAuditRepository } from './implementations/drizzle-audit.repository';
import { DrizzleRateLimitRepository, type IRateLimitRepository } from './implementations/drizzle-rate-limit.repository';
import type { 
  IUserRepository, 
  ISessionRepository, 
  IOrganizationRepository,
} from './contracts';

export interface RepositoryRegistry {
  userRepository: IUserRepository;
  sessionRepository: ISessionRepository;
  organizationRepository: IOrganizationRepository;
  auditRepository: IAuditRepository;
  rateLimitRepository: IRateLimitRepository;
}

export interface RepositoryFactory {
  createUserRepository(): IUserRepository;
  createSessionRepository(): ISessionRepository;
  createOrganizationRepository(): IOrganizationRepository;
  createAuditRepository(): IAuditRepository;
  createRateLimitRepository(): IRateLimitRepository;
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
  };
}

export async function createRepositories(database: Database): Promise<RepositoryRegistry> {
  const factory = createRepositoryFactory(database);

  return {
    userRepository: factory.createUserRepository(),
    sessionRepository: factory.createSessionRepository(),
    organizationRepository: factory.createOrganizationRepository(),
    auditRepository: factory.createAuditRepository(),
    rateLimitRepository: factory.createRateLimitRepository(),
  };
}
