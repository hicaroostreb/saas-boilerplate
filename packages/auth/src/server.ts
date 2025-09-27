// packages/auth/src/server.ts - SERVER-ONLY FUNCTIONS

import type { Membership, Organization } from '@workspace/database';
import { db, memberships, organizations, users } from '@workspace/database';
import { and, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import type { EnterpriseSessionData } from './session';
import { EnterpriseSessionService } from './session';
import type { EnterpriseUser, SecurityLevel } from './types';

// ✅ CORRIGIDO: Import NextAuth diretamente
import NextAuth from 'next-auth';
import { authConfig } from './config';

// ============================================
// NEXTAUTH INSTANCE (SERVER-ONLY)
// ============================================

const nextAuth = NextAuth(authConfig);

export const auth: typeof nextAuth.auth = nextAuth.auth;
export const handlers: typeof nextAuth.handlers = nextAuth.handlers;
export const signIn: typeof nextAuth.signIn = nextAuth.signIn;
export const signOut: typeof nextAuth.signOut = nextAuth.signOut;
export { authConfig };

// ============================================
// SERVER-ONLY AUTH CONTEXT
// ============================================

const dedupedAuth = cache(auth) as typeof auth;
const enterpriseSessionService = EnterpriseSessionService;

// ✅ ACHROMATIC: Enhanced auth context with enterprise features
export async function getAuthContext() {
  const session = await dedupedAuth();

  console.log('🔍 ACHROMATIC: getAuthContext detailed debug:', {
    hasSession: !!session,
    hasUser: !!session?.user,
    userId: session?.user?.id,
    userEmail: session?.user?.email,
    hasEnterprise: !!(session as any)?.enterprise,
    isCredentialsUser: (session as any)?.enterprise?.isCredentialsUser,
    enterpriseSessionId: (session as any)?.enterprise?.sessionId,
  });

  if (!session?.user?.id || !session?.user?.email) {
    console.log('❌ ACHROMATIC: No valid session in context, redirecting');
    redirect('/auth/sign-in');
  }

  // ✅ ENTERPRISE: Get enhanced user data
  const [enhancedUser] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      image: users.image,
      emailVerified: users.emailVerified,
      isActive: users.isActive,
      securityLevel: users.securityLevel,
      twoFactorEnabled: users.twoFactorEnabled,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
      preferences: users.preferences,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!enhancedUser || !enhancedUser.isActive) {
    console.log('❌ ACHROMATIC: User not found or inactive, redirecting');
    redirect('/auth/sign-in');
  }

  // ✅ ENTERPRISE: Get enhanced session data for credentials users
  let enterpriseSessionData: EnterpriseSessionData | null = null;
  const enterpriseContext = (session as any)?.enterprise;

  if (enterpriseContext?.isCredentialsUser && enterpriseContext?.sessionId) {
    try {
      enterpriseSessionData = await enterpriseSessionService.validateSession(
        enterpriseContext.sessionId
      );

      if (!enterpriseSessionData) {
        console.log('❌ ACHROMATIC: Enterprise session invalid, redirecting');
        redirect('/auth/sign-in');
      }
    } catch (error) {
      console.error(
        '❌ ACHROMATIC: Error validating enterprise session:',
        error
      );
      redirect('/auth/sign-in');
    }
  }

  return {
    session: {
      ...session,
      user: {
        id: enhancedUser.id,
        email: enhancedUser.email,
        name: enhancedUser.name || null,
        image: enhancedUser.image || null,
        emailVerified: enhancedUser.emailVerified,
        isActive: enhancedUser.isActive,
        securityLevel:
          (enhancedUser.securityLevel as SecurityLevel) || 'normal',
        twoFactorEnabled: enhancedUser.twoFactorEnabled,
        lastLoginAt: enhancedUser.lastLoginAt,
        preferences: enhancedUser.preferences as Record<string, any> | null,
      } as EnterpriseUser,
      enterprise: {
        sessionId: enterpriseContext?.sessionId || null,
        organizationId: enterpriseContext?.organizationId || null,
        organizationSlug: enterpriseContext?.organizationSlug || null,
        securityLevel: enterpriseContext?.securityLevel || 'normal',
        isCredentialsUser: enterpriseContext?.isCredentialsUser || false,
        provider: enterpriseContext?.provider || 'unknown',
        twoFactorEnabled: enhancedUser.twoFactorEnabled,
        lastAccessedAt: enterpriseSessionData?.lastAccessedAt || null,
        deviceInfo: enterpriseSessionData
          ? {
              name: enterpriseSessionData.deviceName,
              type: enterpriseSessionData.deviceType,
              fingerprint: enterpriseSessionData.deviceFingerprint,
            }
          : null,
        geolocation: enterpriseSessionData
          ? {
              country: enterpriseSessionData.country,
              city: enterpriseSessionData.city,
              timezone: enterpriseSessionData.timezone,
            }
          : null,
        riskScore: enterpriseSessionData?.riskScore || 0,
      },
    },
  } as const;
}

// ✅ ACHROMATIC: Enhanced organization context
export async function getAuthOrganizationContext(slug?: string) {
  const { session } = await getAuthContext();

  let organizationId: string | undefined;

  // ✅ ENTERPRISE: Get organization ID from session or slug
  if (slug) {
    const [org] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(
        and(eq(organizations.slug, slug), eq(organizations.isActive, true))
      )
      .limit(1);
    organizationId = org?.id;
  } else {
    organizationId = session.enterprise.organizationId || undefined;
  }

  if (!organizationId) {
    throw new Error('No organization found');
  }

  // ✅ ACHROMATIC: Get organization with membership data
  const [organization] = await db
    .select({
      // Organization fields
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      description: organizations.description,
      image: organizations.image,
      website: organizations.website,
      ownerId: organizations.ownerId,
      planId: organizations.planId,
      planName: organizations.planName,
      subscriptionStatus: organizations.subscriptionStatus,
      maxMembers: organizations.maxMembers,
      maxProjects: organizations.maxProjects,
      maxStorage: organizations.maxStorage,
      currentMembers: organizations.currentMembers,
      currentProjects: organizations.currentProjects,
      currentStorage: organizations.currentStorage,
      settings: organizations.settings,
      features: organizations.features,
      isActive: organizations.isActive,
      isVerified: organizations.isVerified,
      createdAt: organizations.createdAt,
      updatedAt: organizations.updatedAt,
    })
    .from(organizations)
    .where(
      and(
        eq(organizations.id, organizationId),
        eq(organizations.isActive, true)
      )
    )
    .limit(1);

  if (!organization) {
    throw new Error('Organization not found or inactive');
  }

  // ✅ ENTERPRISE: Get user's membership in this organization
  const [membership] = await db
    .select({
      id: memberships.id,
      userId: memberships.userId,
      organizationId: memberships.organizationId,
      role: memberships.role,
      permissions: memberships.permissions,
      customPermissions: memberships.customPermissions,
      isActive: memberships.isActive,
      createdAt: memberships.createdAt,
      metadata: memberships.metadata,
    })
    .from(memberships)
    .where(
      and(
        eq(memberships.userId, session.user.id),
        eq(memberships.organizationId, organizationId),
        eq(memberships.isActive, true)
      )
    )
    .limit(1);

  if (!membership) {
    throw new Error('User is not a member of this organization');
  }

  return {
    session,
    organization: {
      ...organization,
      settings: organization.settings as Record<string, any> | null,
      features: organization.features as Record<string, any> | null,
    },
    membership: {
      ...membership,
      permissions: membership.permissions as string[] | null,
      customPermissions: membership.customPermissions as Record<
        string,
        boolean
      > | null,
      metadata: membership.metadata as Record<string, any> | null,
    },
  } as const;
}

// ✅ ACHROMATIC: Optional auth context (no redirect)
export async function getOptionalAuthContext() {
  try {
    const session = await dedupedAuth();

    console.log('🔍 ACHROMATIC: getOptionalAuthContext debug:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
    });

    if (!session?.user?.id || !session?.user?.email) {
      return null;
    }

    // ✅ ENTERPRISE: Get enhanced user data
    const [enhancedUser] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        image: users.image,
        emailVerified: users.emailVerified,
        isActive: users.isActive,
        securityLevel: users.securityLevel,
        twoFactorEnabled: users.twoFactorEnabled,
        lastLoginAt: users.lastLoginAt,
        preferences: users.preferences,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!enhancedUser || !enhancedUser.isActive) {
      return null;
    }

    const enterpriseContext = (session as any)?.enterprise;

    return {
      session: {
        ...session,
        user: {
          id: enhancedUser.id,
          email: enhancedUser.email,
          name: enhancedUser.name || null,
          image: enhancedUser.image || null,
          emailVerified: enhancedUser.emailVerified,
          isActive: enhancedUser.isActive,
          securityLevel:
            (enhancedUser.securityLevel as SecurityLevel) || 'normal',
          twoFactorEnabled: enhancedUser.twoFactorEnabled,
          lastLoginAt: enhancedUser.lastLoginAt,
          preferences: enhancedUser.preferences as Record<string, any> | null,
        } as EnterpriseUser,
        enterprise: {
          sessionId: enterpriseContext?.sessionId || null,
          organizationId: enterpriseContext?.organizationId || null,
          organizationSlug: enterpriseContext?.organizationSlug || null,
          securityLevel: enterpriseContext?.securityLevel || 'normal',
          isCredentialsUser: enterpriseContext?.isCredentialsUser || false,
          provider: enterpriseContext?.provider || 'unknown',
          twoFactorEnabled: enhancedUser.twoFactorEnabled,
          riskScore: 0,
          lastAccessedAt: null,
          deviceInfo: null,
          geolocation: null,
        },
      },
    } as const;
  } catch (error) {
    console.error('❌ ACHROMATIC: Error in getOptionalAuthContext:', error);
    return null;
  }
}

// ✅ ENTERPRISE: Session management functions
export async function revokeSession(sessionId: string, reason?: string) {
  const { session } = await getAuthContext();

  if (session.enterprise.isCredentialsUser && session.enterprise.sessionId) {
    await enterpriseSessionService.revokeSession(
      session.enterprise.sessionId,
      session.user.id,
      reason || 'user_request'
    );
  }
}

export async function revokeAllSessions(keepCurrent: boolean = true) {
  const { session } = await getAuthContext();

  await enterpriseSessionService.revokeAllUserSessions(
    session.user.id,
    keepCurrent ? session.enterprise.sessionId || undefined : undefined
  );
}

export async function getUserActiveSessions() {
  const { session } = await getAuthContext();

  return await enterpriseSessionService.getUserActiveSessions(session.user.id);
}

// ============================================
// LEGACY FUNCTIONS (SERVER-ONLY)
// ============================================

export async function requireAuth() {
  const { session } = await getAuthContext();
  return session;
}

export async function getCurrentUserOrganizations() {
  const { session } = await getAuthContext();

  return await db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      image: organizations.image,
      role: memberships.role,
      isActive: organizations.isActive,
    })
    .from(organizations)
    .innerJoin(memberships, eq(memberships.organizationId, organizations.id))
    .where(
      and(
        eq(memberships.userId, session.user.id),
        eq(memberships.isActive, true),
        eq(organizations.isActive, true)
      )
    );
}

// ============================================
// RE-EXPORTS (SERVER-ONLY MODULES)
// ============================================

export * from './audit';
export * from './password';
export * from './security';
export * from './session';

// ============================================
// SERVER-ONLY TYPES
// ============================================

export type AuthContext = Awaited<ReturnType<typeof getAuthContext>>;
export type OptionalAuthContext = Awaited<
  ReturnType<typeof getOptionalAuthContext>
>;
export type AuthOrganizationContext = Awaited<
  ReturnType<typeof getAuthOrganizationContext>
>;

// ============================================
// COMPATIBILITY FUNCTIONS
// ============================================

// ✅ ACHROMATIC: Get server session (compatibilidade com API routes)
export async function getServerSession() {
  try {
    // ✅ Usar a função opcional que não redireciona
    const authContext = await getOptionalAuthContext();

    if (!authContext?.session?.user) {
      return null;
    }

    return {
      user: {
        id: authContext.session.user.id,
        email: authContext.session.user.email,
        name: authContext.session.user.name,
      },
    };
  } catch (error) {
    console.error('❌ ACHROMATIC: Error getting server session:', error);
    return null;
  }
}
