// ============================================
// ORGANIZATION REPOSITORY CONTRACT - SRP: APENAS ORGANIZATION INTERFACE
// ============================================

import type { CreateOrganization, Organization } from '../../schemas/business';

export interface IOrganizationRepository {
  // ============================================
  // BASIC CRUD OPERATIONS
  // ============================================

  findById(id: string): Promise<Organization | null>;
  findBySlug(slug: string): Promise<Organization | null>;
  findByIds(ids: string[]): Promise<Organization[]>;

  create(data: CreateOrganization): Promise<Organization>;
  update(id: string, data: Partial<Organization>): Promise<Organization>;
  delete(id: string): Promise<void>;

  // ============================================
  // QUERY OPERATIONS
  // ============================================

  findByOwnerId(ownerId: string): Promise<Organization[]>;

  findByMemberId(userId: string): Promise<Organization[]>;

  findPublic(options?: {
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<Organization[]>;

  findByPlanType(planType: string): Promise<Organization[]>;

  // ============================================
  // BUSINESS OPERATIONS
  // ============================================

  findAvailableSlug(baseSlug: string): Promise<string>;

  findByIndustry(industry: string, limit?: number): Promise<Organization[]>;

  findExpiringSoon(days?: number): Promise<Organization[]>;

  findOverLimit(
    limitType: 'members' | 'projects' | 'storage'
  ): Promise<Organization[]>;

  // ============================================
  // ANALYTICS & REPORTING
  // ============================================

  countTotal(): Promise<number>;
  countActive(): Promise<number>;
  countByPlan(): Promise<Record<string, number>>;

  getGrowthStats(days?: number): Promise<
    {
      date: string;
      count: number;
    }[]
  >;

  // ============================================
  // SEARCH OPERATIONS
  // ============================================

  search(
    query: string,
    options?: {
      limit?: number;
      offset?: number;
      includePrivate?: boolean;
    }
  ): Promise<Organization[]>;

  // ============================================
  // EXISTENCE CHECKS
  // ============================================

  existsBySlug(slug: string): Promise<boolean>;
  existsById(id: string): Promise<boolean>;
}
