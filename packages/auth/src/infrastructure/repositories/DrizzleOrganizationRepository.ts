import type { OrganizationRepositoryPort } from '../../domain/ports/OrganizationRepositoryPort';
import { Organization } from '../../domain/entities/Organization';
import { OrganizationRepository } from '../../adapters/repositories/organization.repository';

/**
 * Adaptador para OrganizationRepository implementando OrganizationRepositoryPort
 */
export class DrizzleOrganizationRepository implements OrganizationRepositoryPort {
  private orgRepo: OrganizationRepository;

  constructor() {
    this.orgRepo = new OrganizationRepository();
  }

  async findById(id: string): Promise<Organization | null> {
    const dbOrg = await this.orgRepo.findById(id);
    return dbOrg ? this.mapToDomainEntity(dbOrg) : null;
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    const dbOrg = await this.orgRepo.findBySlug(slug);
    return dbOrg ? this.mapToDomainEntity(dbOrg) : null;
  }

  async create(organization: Organization): Promise<Organization> {
    const dbOrg = await this.orgRepo.create({
      id: organization.id,
      tenant_id: organization.tenantId,
      name: organization.name,
      slug: organization.slug,
      description: organization.description,
      owner_id: organization.ownerId,
      is_active: organization.isActive,
      is_verified: organization.isVerified,
      plan_type: organization.planType as any,
      member_limit: organization.memberLimit,
    });

    return this.mapToDomainEntity(dbOrg);
  }

  async existsBySlug(slug: string): Promise<boolean> {
    return this.orgRepo.existsBySlug(slug);
  }

  async findByUserId(userId: string): Promise<Array<{
    organization: Organization;
    role: string;
    status: string;
  }>> {
    const userOrgs = await this.orgRepo.findByUserId(userId);
    
    const results = await Promise.all(
      userOrgs.map(async (userOrg) => {
        const org = await this.findById(userOrg.id);
        if (!org) throw new Error('Organization not found');
        
        return {
          organization: org,
          role: userOrg.role,
          status: userOrg.status,
        };
      })
    );

    return results;
  }

  private mapToDomainEntity(dbOrg: any): Organization {
    return Organization.reconstitute({
      id: dbOrg.id,
      tenantId: dbOrg.tenant_id || dbOrg.tenantId,
      name: dbOrg.name,
      slug: dbOrg.slug,
      description: dbOrg.description,
      ownerId: dbOrg.owner_id || dbOrg.ownerId,
      isActive: dbOrg.is_active !== undefined ? dbOrg.is_active : dbOrg.isActive,
      isVerified: dbOrg.is_verified !== undefined ? dbOrg.is_verified : dbOrg.isVerified,
      planType: (dbOrg.plan_type || dbOrg.planType || 'free') as any,
      memberLimit: dbOrg.member_limit || dbOrg.memberLimit || 10,
      createdAt: dbOrg.created_at || dbOrg.createdAt,
      updatedAt: dbOrg.updated_at || dbOrg.updatedAt,
    });
  }
}
