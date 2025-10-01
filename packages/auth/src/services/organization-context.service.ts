// packages/auth/src/services/organization-context.service.ts - ORGANIZATION CONTEXT (FINAL)

import { OrganizationRepository } from '../repositories/organization.repository';
import type { MemberRole } from '../types';

/**
 * ✅ ENTERPRISE: Simplified Organization Context (Foundation)
 */
export interface EnhancedOrganizationContext {
  organization: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    settings?: Record<string, unknown> | null;
    features?: Record<string, unknown> | null;
  };
  membership: {
    id: string;
    role: MemberRole;
    permissions: string[];
    createdAt: Date;
    status: 'active' | 'inactive';
  };
}

/**
 * ✅ ENTERPRISE: Organization Context Service (Foundation)
 */
export class OrganizationContextService {
  private organizationRepository: OrganizationRepository;

  constructor() {
    this.organizationRepository = new OrganizationRepository();
  }

  /**
   * ✅ GET: Enhanced organization context (simplified)
   */
  async getEnhancedOrganizationContext(
    userId: string,
    organizationSlug: string
  ): Promise<EnhancedOrganizationContext | null> {
    try {
      // Get organization
      const organization =
        await this.organizationRepository.findBySlug(organizationSlug);
      if (!organization) {
        return null;
      }

      if (!organization.isActive) {
        return null;
      }

      const membership = await this.organizationRepository.findMembership(
        organization.id,
        userId
      );

      if (!membership) {
        return null;
      }

      return {
        organization: {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          isActive: organization.isActive,
          createdAt: organization.createdAt,
          updatedAt: organization.updatedAt,
          settings: null,
          features: null,
        },
        membership: {
          id: membership.id,
          role: membership.role,
          permissions: membership.permissions,
          createdAt: membership.createdAt,
          status: membership.status,
        },
      };
    } catch (error) {
      console.error(
        '❌ OrganizationContextService getEnhancedOrganizationContext error:',
        error
      );
      return null;
    }
  }

  /**
   * ✅ GET: Organization context (alias for server.ts compatibility)
   */
  async getOrganizationContext(
    userId: string,
    organizationSlug: string
  ): Promise<EnhancedOrganizationContext | null> {
    return this.getEnhancedOrganizationContext(userId, organizationSlug);
  }

  /**
   * ✅ GET: User organizations (simplified return type)
   */
  async getUserOrganizations(userId: string): Promise<
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
      return await this.organizationRepository.findUserOrganizations(userId);
    } catch (error) {
      console.error(
        '❌ OrganizationContextService getUserOrganizations error:',
        error
      );
      return [];
    }
  }

  /**
   * ✅ GET: Primary organization (with null checks)
   */
  async getPrimaryOrganization(userId: string): Promise<{
    id: string;
    name: string;
    slug: string;
    role: string;
  } | null> {
    try {
      const orgs =
        await this.organizationRepository.findUserOrganizations(userId);

      if (orgs.length > 0) {
        const primary = orgs[0];
        // ✅ FIX: Add null check for primary
        if (primary) {
          return {
            id: primary.id,
            name: primary.name,
            slug: primary.slug,
            role: primary.role,
          };
        }
      }

      return null;
    } catch (error) {
      console.error(
        '❌ OrganizationContextService getPrimaryOrganization error:',
        error
      );
      return null;
    }
  }

  /**
   * ✅ CHECK: User membership in organization
   */
  async hasOrganizationAccess(
    userId: string,
    organizationSlug: string
  ): Promise<boolean> {
    try {
      const context = await this.getEnhancedOrganizationContext(
        userId,
        organizationSlug
      );
      return !!context;
    } catch (error) {
      console.error(
        '❌ OrganizationContextService hasOrganizationAccess error:',
        error
      );
      return false;
    }
  }

  /**
   * ✅ GET: User role in organization
   */
  async getUserRole(
    userId: string,
    organizationSlug: string
  ): Promise<MemberRole | null> {
    try {
      const context = await this.getEnhancedOrganizationContext(
        userId,
        organizationSlug
      );
      return context?.membership.role ?? null;
    } catch (error) {
      console.error('❌ OrganizationContextService getUserRole error:', error);
      return null;
    }
  }

  /**
   * ✅ CHECK: If user is organization owner
   */
  async isOwner(userId: string, organizationSlug: string): Promise<boolean> {
    try {
      const role = await this.getUserRole(userId, organizationSlug);
      return role === 'owner';
    } catch (error) {
      console.error('❌ OrganizationContextService isOwner error:', error);
      return false;
    }
  }

  /**
   * ✅ CHECK: If user is organization admin
   */
  async isAdmin(userId: string, organizationSlug: string): Promise<boolean> {
    try {
      const role = await this.getUserRole(userId, organizationSlug);
      return role === 'admin' || role === 'owner';
    } catch (error) {
      console.error('❌ OrganizationContextService isAdmin error:', error);
      return false;
    }
  }
}
