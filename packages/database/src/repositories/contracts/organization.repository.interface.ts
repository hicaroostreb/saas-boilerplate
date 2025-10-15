// packages/database/src/repositories/contracts/organization.repository.interface.ts
// ============================================
// ORGANIZATION REPOSITORY CONTRACT - ENTERPRISE
// ============================================

export interface IOrganizationRepository {
  // Core CRUD operations
  findById(id: string): Promise<any | null>;
  findBySlug(slug: string): Promise<any | null>;
  create(organization: any): Promise<any>;
  update(organization: any): Promise<any>;
  delete(id: string): Promise<void>;

  // Multi-tenant operations
  findByTenantId(tenant_id: string): Promise<any[]>;
  findPublicOrganizations(): Promise<any[]>;

  // Search and filtering
  findMany(options: any): Promise<any[]>;
  count(filters?: any): Promise<number>;

  // Membership related
  findUserOrganizations(user_id: string): Promise<any[]>;

  // Soft delete operations
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<any | null>;
}
