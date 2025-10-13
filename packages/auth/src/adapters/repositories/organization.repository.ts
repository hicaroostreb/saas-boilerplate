// ORGANIZATION REPOSITORY - BUILD-TIME SAFE + SCHEMA CORRETO
import {
  and,
  desc,
  eq,
  getDb,
  isNull,
  memberships,
  organizations,
  sql,
  users,
  type CreateOrganization,
  type Organization,
} from '@workspace/database';

export class OrganizationRepository {
  async findById(id: string): Promise<Organization | null> {
    try {
      const db = await getDb();
      const [organization] = await db
        .select()
        .from(organizations)
        .where(and(eq(organizations.id, id), isNull(organizations.deletedAt)))
        .limit(1);
      return organization ?? null;
    } catch (error) {
      console.error('❌ OrganizationRepository findById error:', error);
      return null;
    }
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    try {
      const db = await getDb();
      const [organization] = await db
        .select()
        .from(organizations)
        .where(
          and(eq(organizations.slug, slug), isNull(organizations.deletedAt))
        )
        .limit(1);
      return organization ?? null;
    } catch (error) {
      console.error('❌ OrganizationRepository findBySlug error:', error);
      return null;
    }
  }

  async create(data: CreateOrganization): Promise<Organization> {
    try {
      const db = await getDb();
      const [organization] = await db
        .insert(organizations)
        .values({
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      if (!organization) {
        throw new Error('Failed to create organization');
      }
      return organization;
    } catch (error) {
      console.error('❌ OrganizationRepository create error:', error);
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<
    Array<{
      id: string;
      name: string;
      slug: string;
      logoUrl: string | null;
      role: string;
      status: string;
    }>
  > {
    try {
      const db = await getDb();
      const userOrganizations = await db
        .select({
          id: organizations.id,
          name: organizations.name,
          slug: organizations.slug,
          logoUrl: organizations.logoUrl,
          role: memberships.role,
          status: memberships.status,
        })
        .from(organizations)
        .innerJoin(
          memberships,
          eq(memberships.organizationId, organizations.id)
        )
        .where(
          and(
            eq(memberships.userId, userId),
            isNull(organizations.deletedAt),
            eq(memberships.status, 'active')
          )
        )
        .orderBy(desc(memberships.createdAt)); // ✅ CORRETO - acceptedAt existe mas createdAt é mais universal

      return userOrganizations.map(org => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        logoUrl: org.logoUrl,
        role: org.role,
        status: org.status,
      }));
    } catch (error) {
      console.error('❌ OrganizationRepository findByUserId error:', error);
      return [];
    }
  }

  // ✅ ALIAS PARA COMPATIBILIDADE
  async findUserOrganizations(userId: string) {
    return this.findByUserId(userId);
  }

  async findMembers(organizationId: string): Promise<
    Array<{
      id: string;
      userId: string;
      email: string;
      name: string | null;
      role: string;
      status: string;
    }>
  > {
    try {
      const db = await getDb();
      const members = await db
        .select({
          id: memberships.id,
          userId: users.id,
          email: users.email,
          name: users.name,
          role: memberships.role,
          status: memberships.status,
        })
        .from(memberships)
        .innerJoin(users, eq(users.id, memberships.userId))
        .where(
          and(
            eq(memberships.organizationId, organizationId),
            isNull(users.deletedAt)
          )
        )
        .orderBy(desc(memberships.createdAt)); // ✅ CORRETO

      return members.map(member => ({
        id: member.id,
        userId: member.userId,
        email: member.email,
        name: member.name,
        role: member.role,
        status: member.status,
      }));
    } catch (error) {
      console.error('❌ OrganizationRepository findMembers error:', error);
      return [];
    }
  }

  async findMembership(userId: string, organizationId: string) {
    try {
      const db = await getDb();
      const [membership] = await db
        .select()
        .from(memberships)
        .where(
          and(
            eq(memberships.userId, userId),
            eq(memberships.organizationId, organizationId)
          )
        )
        .limit(1);
      return membership ?? null;
    } catch (error) {
      console.error('❌ OrganizationRepository findMembership error:', error);
      return null;
    }
  }

  async existsBySlug(slug: string): Promise<boolean> {
    try {
      const db = await getDb();
      const [result] = await db
        .select({ count: sql<number>`count(*)` })
        .from(organizations)
        .where(
          and(eq(organizations.slug, slug), isNull(organizations.deletedAt))
        )
        .limit(1);
      return Number(result?.count ?? 0) > 0;
    } catch (error) {
      console.error('❌ OrganizationRepository existsBySlug error:', error);
      return false;
    }
  }

  async update(id: string, data: Partial<Organization>): Promise<Organization> {
    try {
      const db = await getDb();
      const [organization] = await db
        .update(organizations)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(and(eq(organizations.id, id), isNull(organizations.deletedAt)))
        .returning();

      if (!organization) {
        throw new Error('Organization not found or update failed');
      }
      return organization;
    } catch (error) {
      console.error('❌ OrganizationRepository update error:', error);
      throw error;
    }
  }

  async softDelete(id: string): Promise<void> {
    try {
      const db = await getDb();
      await db
        .update(organizations)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(organizations.id, id));
      console.warn('✅ OrganizationRepository: Organization soft deleted:', id);
    } catch (error) {
      console.error('❌ OrganizationRepository softDelete error:', error);
      throw error;
    }
  }

  async countTotal(): Promise<number> {
    try {
      const db = await getDb();
      const [result] = await db
        .select({ count: sql<number>`count(*)` })
        .from(organizations)
        .where(isNull(organizations.deletedAt));
      return Number(result?.count ?? 0);
    } catch (error) {
      console.error('❌ OrganizationRepository countTotal error:', error);
      return 0;
    }
  }
}
