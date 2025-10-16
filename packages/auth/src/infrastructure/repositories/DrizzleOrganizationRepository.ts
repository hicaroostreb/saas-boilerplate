import {
  getDb,
  memberships,
  organizations,
  type CreateOrganization,
} from '@workspace/database';
import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import { Organization } from '../../domain/entities/Organization';
import type { OrganizationRepositoryPort } from '../../domain/ports/OrganizationRepositoryPort';

/**
 * Implementação concreta do OrganizationRepositoryPort usando Drizzle
 */
export class DrizzleOrganizationRepository
  implements OrganizationRepositoryPort
{
  async findById(id: string): Promise<Organization | null> {
    try {
      const db = await getDb();
      const [dbOrg] = await db
        .select()
        .from(organizations)
        .where(and(eq(organizations.id, id), isNull(organizations.deleted_at)))
        .limit(1);

      return dbOrg ? this.mapToDomainEntity(dbOrg) : null;
    } catch (error) {
      console.error('❌ DrizzleOrganizationRepository findById error:', error);
      return null;
    }
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    try {
      const db = await getDb();
      const [dbOrg] = await db
        .select()
        .from(organizations)
        .where(
          and(eq(organizations.slug, slug), isNull(organizations.deleted_at))
        )
        .limit(1);

      return dbOrg ? this.mapToDomainEntity(dbOrg) : null;
    } catch (error) {
      console.error(
        '❌ DrizzleOrganizationRepository findBySlug error:',
        error
      );
      return null;
    }
  }

  async create(organization: Organization): Promise<Organization> {
    try {
      const db = await getDb();

      const createData: CreateOrganization = {
        id: organization.id,
        tenant_id: organization.tenantId,
        name: organization.name,
        slug: organization.slug,
        description: organization.description,
        owner_id: organization.ownerId,
        plan_type: organization.planType as
          | 'free'
          | 'professional'
          | 'enterprise',
        is_active: organization.isActive,
        is_verified: organization.isVerified,
        created_at: organization.createdAt,
        updated_at: organization.updatedAt,
      };

      const [dbOrg] = await db
        .insert(organizations)
        .values(createData)
        .returning();

      if (!dbOrg) {
        throw new Error('Failed to create organization');
      }

      return this.mapToDomainEntity(dbOrg);
    } catch (error) {
      console.error('❌ DrizzleOrganizationRepository create error:', error);
      throw error;
    }
  }

  async existsBySlug(slug: string): Promise<boolean> {
    try {
      const db = await getDb();
      const [result] = await db
        .select({ count: sql<number>`count(*)` })
        .from(organizations)
        .where(
          and(eq(organizations.slug, slug), isNull(organizations.deleted_at))
        )
        .limit(1);

      return Number(result?.count ?? 0) > 0;
    } catch (error) {
      console.error(
        '❌ DrizzleOrganizationRepository existsBySlug error:',
        error
      );
      return false;
    }
  }

  async findByUserId(userId: string): Promise<
    Array<{
      organization: Organization;
      role: string;
      status: string;
    }>
  > {
    try {
      const db = await getDb();

      const userOrgs = await db
        .select({
          organization: organizations,
          role: memberships.role,
          status: memberships.status,
        })
        .from(organizations)
        .innerJoin(
          memberships,
          eq(memberships.organization_id, organizations.id)
        )
        .where(
          and(
            eq(memberships.user_id, userId),
            isNull(organizations.deleted_at),
            eq(memberships.status, 'active')
          )
        )
        .orderBy(desc(memberships.created_at));

      return userOrgs.map(userOrg => ({
        organization: this.mapToDomainEntity(userOrg.organization),
        role: userOrg.role,
        status: userOrg.status,
      }));
    } catch (error) {
      console.error(
        '❌ DrizzleOrganizationRepository findByUserId error:',
        error
      );
      return [];
    }
  }

  private mapToDomainEntity(
    dbOrg: typeof organizations.$inferSelect
  ): Organization {
    // member_limit foi removido do schema - usar valor padrão ou extrair de settings
    const settings = dbOrg.settings ? JSON.parse(dbOrg.settings) : {};
    const memberLimit = settings.limits?.members ?? 10;

    return Organization.reconstitute({
      id: dbOrg.id,
      tenantId: dbOrg.tenant_id,
      name: dbOrg.name,
      slug: dbOrg.slug,
      description: dbOrg.description,
      ownerId: dbOrg.owner_id,
      isActive: dbOrg.is_active ?? true,
      isVerified: dbOrg.is_verified ?? false,
      planType: dbOrg.plan_type ?? 'free',
      memberLimit,
      createdAt: dbOrg.created_at,
      updatedAt: dbOrg.updated_at,
    });
  }
}
