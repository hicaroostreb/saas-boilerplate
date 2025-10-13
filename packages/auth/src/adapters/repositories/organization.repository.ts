// packages/auth/src/repositories/organization.repository.ts - ORGANIZATION DATA ACCESS

import { db, memberships, organizations, users } from '@workspace/database';
import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import type { MemberRole } from '../../types';

/**
 * ✅ ENTERPRISE: Organization Repository (Database Compatible)
 * Single Responsibility: Organization and membership data access operations
 */
export class OrganizationRepository {
  /**
   * ✅ GET: Organization by slug
   */
  async findBySlug(slug: string): Promise<{
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  } | null> {
    try {
      const [organization] = await db
        .select({
          id: organizations.id,
          name: organizations.name,
          slug: organizations.slug,
          isActive: organizations.isActive,
          createdAt: organizations.createdAt,
          updatedAt: organizations.updatedAt,
        })
        .from(organizations)
        .where(
          and(
            eq(organizations.slug, slug),
            eq(organizations.isActive, true),
            isNull(organizations.deletedAt)
          )
        )
        .limit(1);

      return organization ?? null;
    } catch (error) {
      console.error('❌ OrganizationRepository findBySlug error:', error);
      return null;
    }
  }

  /**
   * ✅ GET: User's organizations with membership info
   */
  async findUserOrganizations(userId: string): Promise<
    Array<{
      id: string;
      name: string;
      slug: string;
      logoUrl: string | null;
      role: MemberRole;
      joinedAt: Date;
      status: 'active' | 'inactive';
    }>
  > {
    try {
      const userOrganizations = await db
        .select({
          // Organization fields
          id: organizations.id,
          name: organizations.name,
          slug: organizations.slug,
          logoUrl: organizations.logoUrl,

          // Membership fields
          role: memberships.role,
          joinedAt: memberships.createdAt,
          status: memberships.status,
        })
        .from(memberships)
        .innerJoin(
          organizations,
          eq(organizations.id, memberships.organizationId)
        )
        .where(
          and(
            eq(memberships.userId, userId),
            eq(organizations.isActive, true),
            isNull(organizations.deletedAt)
          )
        )
        .orderBy(desc(memberships.createdAt));

      return userOrganizations.map(
        (org: {
          id: string;
          name: string;
          slug: string;
          logoUrl: string | null;
          role: string;
          joinedAt: Date;
          status: string;
        }) => ({
          id: org.id,
          name: org.name,
          slug: org.slug,
          logoUrl: org.logoUrl,
          role: org.role as MemberRole,
          joinedAt: org.joinedAt,
          status: (org.status as 'active' | 'inactive') ?? 'active',
        })
      );
    } catch (error) {
      console.error(
        '❌ OrganizationRepository findUserOrganizations error:',
        error
      );
      return [];
    }
  }

  /**
   * ✅ GET: Organization membership for user
   */
  async findMembership(
    organizationId: string,
    userId: string
  ): Promise<{
    id: string;
    role: MemberRole;
    permissions: string[];
    status: 'active' | 'inactive';
    createdAt: Date;
  } | null> {
    try {
      const [membership] = await db
        .select({
          id: memberships.id,
          role: memberships.role,
          permissions: memberships.permissions,
          status: memberships.status,
          createdAt: memberships.createdAt,
        })
        .from(memberships)
        .where(
          and(
            eq(memberships.organizationId, organizationId),
            eq(memberships.userId, userId)
          )
        )
        .limit(1);

      if (!membership) {
        return null;
      }

      return {
        id: membership.id,
        role: membership.role as MemberRole,
        permissions: Array.isArray(membership.permissions)
          ? membership.permissions
          : [],
        status: (membership.status as 'active' | 'inactive') ?? 'active',
        createdAt: membership.createdAt,
      };
    } catch (error) {
      console.error('❌ OrganizationRepository findMembership error:', error);
      return null;
    }
  }

  /**
   * ✅ GET: Organization members with user info
   */
  async findMembers(organizationId: string): Promise<
    Array<{
      id: string;
      userId: string;
      email: string;
      name: string | null;
      role: MemberRole;
      status: 'active' | 'inactive';
      joinedAt: Date;
      lastActivityAt: Date | null;
    }>
  > {
    try {
      const members = await db
        .select({
          id: memberships.id,
          userId: memberships.userId,
          email: users.email,
          name: users.name,
          role: memberships.role,
          status: memberships.status,
          joinedAt: memberships.createdAt,
          lastActivityAt: memberships.lastActivityAt,
        })
        .from(memberships)
        .innerJoin(users, eq(users.id, memberships.userId))
        .where(eq(memberships.organizationId, organizationId))
        .orderBy(desc(memberships.createdAt));

      return members.map(
        (member: {
          id: string;
          userId: string;
          email: string;
          name: string | null;
          role: string;
          status: string;
          joinedAt: Date;
          lastActivityAt: Date | null;
        }) => ({
          id: member.id,
          userId: member.userId,
          email: member.email,
          name: member.name,
          role: member.role as MemberRole,
          status: (member.status as 'active' | 'inactive') ?? 'active',
          joinedAt: member.joinedAt,
          lastActivityAt: member.lastActivityAt,
        })
      );
    } catch (error) {
      console.error('❌ OrganizationRepository findMembers error:', error);
      return [];
    }
  }

  /**
   * ✅ UPDATE: Membership role
   */
  async updateMemberRole(
    membershipId: string,
    newRole: MemberRole,
    _updatedBy: string
  ): Promise<boolean> {
    try {
      await db
        .update(memberships)
        .set({
          role: newRole,
          updatedAt: new Date(),
        })
        .where(eq(memberships.id, membershipId));

      console.warn(
        `✅ OrganizationRepository: Updated member role to ${newRole}`
      );
      return true;
    } catch (error) {
      console.error('❌ OrganizationRepository updateMemberRole error:', error);
      return false;
    }
  }

  /**
   * ✅ UPDATE: Membership permissions (using SQL for JSON array)
   */
  async updateMemberPermissions(
    membershipId: string,
    permissions: string[],
    _updatedBy: string
  ): Promise<boolean> {
    try {
      // Use SQL to properly handle JSON array insertion
      await db
        .update(memberships)
        .set({
          permissions: sql`${JSON.stringify(permissions)}::json`,
          updatedAt: new Date(),
        })
        .where(eq(memberships.id, membershipId));

      console.warn(`✅ OrganizationRepository: Updated member permissions`);
      return true;
    } catch (error) {
      console.error(
        '❌ OrganizationRepository updateMemberPermissions error:',
        error
      );
      return false;
    }
  }

  /**
   * ✅ REMOVE: Member from organization
   */
  async removeMember(
    organizationId: string,
    userId: string,
    _removedBy: string
  ): Promise<boolean> {
    try {
      await db
        .update(memberships)
        .set({
          status: 'inactive',
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(memberships.organizationId, organizationId),
            eq(memberships.userId, userId)
          )
        );

      console.warn(
        `✅ OrganizationRepository: Removed member from organization`
      );
      return true;
    } catch (error) {
      console.error('❌ OrganizationRepository removeMember error:', error);
      return false;
    }
  }

  /**
   * ✅ COUNT: Organization members
   */
  async getMemberCount(organizationId: string): Promise<number> {
    try {
      const result = await db
        .select({
          count: sql<number>`count(*)`,
        })
        .from(memberships)
        .where(
          and(
            eq(memberships.organizationId, organizationId),
            eq(memberships.status, 'active'),
            isNull(memberships.deletedAt)
          )
        );

      return Number(result[0]?.count ?? 0);
    } catch (error) {
      console.error('❌ OrganizationRepository getMemberCount error:', error);
      return 0;
    }
  }

  /**
   * ✅ CHECK: If user is organization owner
   */
  async isOwner(organizationId: string, userId: string): Promise<boolean> {
    try {
      const [membership] = await db
        .select({ role: memberships.role })
        .from(memberships)
        .where(
          and(
            eq(memberships.organizationId, organizationId),
            eq(memberships.userId, userId),
            eq(memberships.status, 'active'),
            isNull(memberships.deletedAt)
          )
        )
        .limit(1);

      return membership?.role === 'owner';
    } catch (error) {
      console.error('❌ OrganizationRepository isOwner error:', error);
      return false;
    }
  }

  /**
   * ✅ CHECK: If user has role in organization
   */
  async hasRole(
    organizationId: string,
    userId: string,
    role: MemberRole
  ): Promise<boolean> {
    try {
      const [membership] = await db
        .select({ role: memberships.role })
        .from(memberships)
        .where(
          and(
            eq(memberships.organizationId, organizationId),
            eq(memberships.userId, userId),
            eq(memberships.status, 'active'),
            isNull(memberships.deletedAt)
          )
        )
        .limit(1);

      return membership?.role === role;
    } catch (error) {
      console.error('❌ OrganizationRepository hasRole error:', error);
      return false;
    }
  }
}
