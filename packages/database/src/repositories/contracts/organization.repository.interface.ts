// packages/database/src/repositories/contracts/organization.repository.interface.ts
// ============================================
// ORGANIZATION REPOSITORY CONTRACT - ENTERPRISE (REFACTORED)
// ============================================

import type { OrganizationUsage } from '../../entities/business';
import type { Organization } from '../../schemas/business';

export interface OrganizationFilterOptions {
  is_active?: boolean;
  is_public?: boolean;
  plan_type?: string;
  search?: string;
  limit?: number;
  offset?: number;
  include_deleted?: boolean;
}

export interface IOrganizationRepository {
  // Core CRUD operations
  findById(id: string): Promise<Organization | null>;
  findBySlug(slug: string): Promise<Organization | null>;
  create(
    organization: Omit<Organization, 'created_at' | 'updated_at'>
  ): Promise<Organization>;
  update(
    organization: Organization,
    requestingUserId?: string
  ): Promise<Organization>;
  delete(id: string, requestingUserId?: string): Promise<void>;

  // Multi-tenant operations
  findByTenantId(tenant_id: string): Promise<Organization[]>;
  findPublicOrganizations(): Promise<Organization[]>;

  // User operations
  findUserOrganizations(user_id: string): Promise<Organization[]>;
  findByOwner(owner_id: string): Promise<Organization[]>;

  // Search and filtering
  findMany(options: OrganizationFilterOptions): Promise<Organization[]>;
  count(
    filters?: Pick<
      OrganizationFilterOptions,
      'is_active' | 'is_public' | 'plan_type'
    >
  ): Promise<number>;

  // Soft delete operations
  softDelete(id: string, requestingUserId?: string): Promise<void>;
  restore(id: string): Promise<Organization | null>;

  // Plan management
  updatePlan(
    id: string,
    plan_type: string,
    requestingUserId?: string
  ): Promise<Organization | null>;

  // Quota validation
  getUsageStats(id: string): Promise<OrganizationUsage>;
  canAddMember(organizationId: string): Promise<boolean>;
  canAddProject(organizationId: string): Promise<boolean>;
  validateMemberQuota(organizationId: string): Promise<void>;
  validateProjectQuota(organizationId: string): Promise<void>;

  // Existence checks
  existsBySlug(slug: string, excludeId?: string): Promise<boolean>;
}
