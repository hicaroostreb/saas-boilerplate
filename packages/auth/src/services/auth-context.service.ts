// packages/auth/src/services/auth-context.service.ts - AUTH CONTEXT SERVICE

import { db, memberships, organizations, users } from '@workspace/database';
import { and, eq } from 'drizzle-orm';
import { auth } from '../config/auth.config';
import type { DeviceType, SecurityLevel } from '../types';

/**
 * ✅ ENTERPRISE: Enhanced Auth Context
 */
export interface EnhancedAuthContext {
  user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    isActive: boolean;
    isSuperAdmin: boolean;
    isEmailVerified: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    securityLevel: SecurityLevel;
    twoFactorEnabled: boolean;
    accountLocked: boolean;
    preferences: Record<string, unknown> | null;
    metadata: Record<string, unknown> | null;
    mfaRequired: boolean;
  };
  session: {
    sessionToken: string | null;
    expires: Date;
    userId: string;
    organizationId: string | null;
    lastAccessedAt: Date | null;
    deviceInfo: {
      name: string | null;
      type: DeviceType;
      fingerprint: string | null;
    } | null;
    geolocation: {
      country: string | null;
      city: string | null;
      timezone: string | null;
    } | null;
    enterprise: {
      organizationId: string | null;
      organizationSlug: string | null;
      role: string | null;
      permissions: string[] | null;
      sessionId: string | null;
      lastAccessedAt: Date | null;
      deviceInfo: unknown | null;
      geolocation: unknown | null;
      securityLevel: SecurityLevel;
      riskScore: number;
    };
  };
  organizations: Array<{
    id: string;
    name: string;
    slug: string;
    role: string;
    isActive: boolean;
  }>;
  currentOrganization: {
    id: string;
    name: string;
    slug: string;
    role: string;
    isActive: boolean;
  } | null;
}

/**
 * ✅ ENTERPRISE: Auth Context Service
 * Single Responsibility: Authentication context management
 */
export class AuthContextService {
  /**
   * ✅ GET: Required auth context (throws if not authenticated)
   */
  async getRequiredAuthContext(): Promise<EnhancedAuthContext> {
    const context = await this.getOptionalAuthContext();
    if (!context) {
      throw new Error('Authentication required');
    }
    return context;
  }

  /**
   * ✅ GET: Optional auth context (returns null if not authenticated)
   */
  async getOptionalAuthContext(): Promise<EnhancedAuthContext | null> {
    try {
      const session = await auth();
      if (!session?.user?.id) {
        return null;
      }

      // Get complete user data
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, session.user.id))
        .limit(1);

      if (!user) {
        return null;
      }

      // Build enhanced user object with safe defaults
      const enhancedUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        isActive: user.isActive,
        isSuperAdmin: user.isSuperAdmin,
        isEmailVerified: user.isEmailVerified,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,

        // Safe defaults for fields that don't exist in DB
        securityLevel: 'normal' as SecurityLevel,
        twoFactorEnabled: false,
        preferences: null,
        metadata: null,

        // Security status
        accountLocked: false,
        mfaRequired: false,
      };

      // Get user's organizations
      const userOrganizations = await db
        .select({
          id: organizations.id,
          name: organizations.name,
          slug: organizations.slug,
          role: memberships.role,
          isActive: organizations.isActive,
        })
        .from(memberships)
        .innerJoin(
          organizations,
          eq(organizations.id, memberships.organizationId)
        )
        .where(
          and(eq(memberships.userId, user.id), eq(organizations.isActive, true))
        )
        .orderBy(memberships.createdAt);

      // Build enhanced session
      const enhancedSession = {
        sessionToken: null,
        expires: session.expires
          ? new Date(session.expires)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        userId: user.id,
        organizationId: userOrganizations[0]?.id ?? null,
        lastAccessedAt: new Date(),
        deviceInfo: null,
        geolocation: null,
        enterprise: {
          organizationId: userOrganizations[0]?.id ?? null,
          organizationSlug: userOrganizations[0]?.slug ?? null,
          role: userOrganizations[0]?.role ?? null,
          permissions: [],
          sessionId: null,
          lastAccessedAt: new Date(),
          deviceInfo: null,
          geolocation: null,
          securityLevel: 'normal' as SecurityLevel,
          riskScore: 0,
        },
      };

      return {
        user: enhancedUser,
        session: enhancedSession,
        organizations: userOrganizations,
        currentOrganization: userOrganizations[0] ?? null,
      };
    } catch (error) {
      console.error(
        '❌ AuthContextService getOptionalAuthContext error:',
        error
      );
      return null;
    }
  }

  /**
   * ✅ GET: User security information (with safe type conversion)
   */
  async getUserSecurityInfo(userId: string): Promise<{
    securityLevel: SecurityLevel;
    accountLocked: boolean;
    twoFactorEnabled: boolean;
    lastLoginAt: Date | null;
    loginAttempts: number;
    riskScore: number;
  } | null> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        return null;
      }

      // Safely convert loginAttempts to number
      const loginAttempts =
        typeof user.loginAttempts === 'number'
          ? user.loginAttempts
          : (parseInt(String(user.loginAttempts ?? 0), 10) ?? 0);

      return {
        securityLevel: 'normal',
        accountLocked: false,
        twoFactorEnabled: false,
        lastLoginAt: user.lastLoginAt,
        loginAttempts, // Now guaranteed to be a number
        riskScore: 0,
      };
    } catch (error) {
      console.error('❌ AuthContextService getUserSecurityInfo error:', error);
      return null;
    }
  }

  /**
   * ✅ UPDATE: User last access time
   */
  async updateLastAccess(userId: string): Promise<void> {
    try {
      await db
        .update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error('❌ AuthContextService updateLastAccess error:', error);
    }
  }

  /**
   * ✅ CHECK: If user has valid session
   */
  async hasValidSession(): Promise<boolean> {
    try {
      const session = await auth();
      return !!session?.user?.id;
    } catch (error) {
      console.error('❌ AuthContextService hasValidSession error:', error);
      return false;
    }
  }

  /**
   * ✅ GET: Current user ID (convenience method)
   */
  async getCurrentUserId(): Promise<string | null> {
    try {
      const session = await auth();
      return session?.user?.id ?? null;
    } catch (error) {
      console.error('❌ AuthContextService getCurrentUserId error:', error);
      return null;
    }
  }

  /**
   * ✅ CHECK: If current user is super admin
   */
  async isSuperAdmin(): Promise<boolean> {
    try {
      const context = await this.getOptionalAuthContext();
      return context?.user?.isSuperAdmin ?? false;
    } catch (error) {
      console.error('❌ AuthContextService isSuperAdmin error:', error);
      return false;
    }
  }

  /**
   * ✅ GET: User's primary organization
   */
  async getPrimaryOrganization(userId?: string): Promise<{
    id: string;
    name: string;
    slug: string;
    role: string;
  } | null> {
    try {
      const actualUserId = userId ?? (await this.getCurrentUserId());
      if (!actualUserId) return null;

      const [membership] = await db
        .select({
          id: organizations.id,
          name: organizations.name,
          slug: organizations.slug,
          role: memberships.role,
        })
        .from(memberships)
        .innerJoin(
          organizations,
          eq(organizations.id, memberships.organizationId)
        )
        .where(
          and(
            eq(memberships.userId, actualUserId),
            eq(organizations.isActive, true)
          )
        )
        .orderBy(memberships.createdAt)
        .limit(1);

      return membership ?? null;
    } catch (error) {
      console.error(
        '❌ AuthContextService getPrimaryOrganization error:',
        error
      );
      return null;
    }
  }
}
