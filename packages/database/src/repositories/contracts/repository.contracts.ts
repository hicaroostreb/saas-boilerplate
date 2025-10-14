// packages/database/src/repositories/contracts/repository.contracts.ts
// ============================================
// REPOSITORY CONTRACTS - PERFECT MATCH WITH IMPLEMENTATIONS (FINAL)
// ============================================

import type { User, CreateUser, Session, CreateSession, Organization } from '../../schemas';
import type { UserEntity } from '../../entities';

// Define UserFilterOptions to match the implementation
export interface UserFilterOptions {
  limit?: number;
  offset?: number;
  organizationId?: string;
  isActive?: boolean;
  search?: string;
}

// User repository contract - PERFECT match with DrizzleUserRepository
export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  create(userData: CreateUser): Promise<UserEntity>;
  update(user: UserEntity): Promise<UserEntity>;
  delete(id: string): Promise<void>;
  findMany(options: UserFilterOptions): Promise<UserEntity[]>;
  findByIds(ids: string[]): Promise<UserEntity[]>;
  updateMany(userEntities: UserEntity[]): Promise<UserEntity[]>;
  softDelete(id: string): Promise<void>;
  // FIXED: DrizzleUserRepository.restore() can return null
  restore(id: string): Promise<UserEntity | null>;
  count(): Promise<number>;
}

// Session repository contract - EXACT match with DrizzleSessionRepository
export interface ISessionRepository {
  create(sessionData: CreateSession): Promise<Session>;
  deleteExpired(): Promise<number>;
}

// Organization repository contract - EXACT match with DrizzleOrganizationRepository  
export interface IOrganizationRepository {
  findById(id: string): Promise<Organization | null>;
  findBySlug(slug: string): Promise<Organization | null>;
  create(orgData: any): Promise<Organization>;
  update(organization: Organization): Promise<Organization>;
  delete(id: string): Promise<void>;
  findByOwner(ownerId: string): Promise<Organization[]>;
  findMany(options?: any): Promise<Organization[]>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<Organization | null>;
}
