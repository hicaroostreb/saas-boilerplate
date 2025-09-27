// packages/auth/src/context.ts - ACHROMATIC ENTERPRISE CONTEXT CORRIGIDO

import type { Membership, Organization, User } from '@workspace/database';
import { db, memberships, organizations, users } from '@workspace/database';
import { and, eq } from 'drizzle-orm';
import type { Session } from 'next-auth';
import { redirect } from 'next/navigation';
import type { EnterpriseUser, MemberRole, SecurityLevel } from './types';

// ✅ IMPORT CORRETO - usar auth diretamente em vez de dedupedAuth
import { auth } from './config';

// ============================================
// ENHANCED INTERFACES
// ============================================

export interface EnterpriseContext {
  sessionId: string | null;
  organizationId: string | null;
  organizationSlug: string | null;
  securityLevel: SecurityLevel;
  isCredentialsUser: boolean;
  provider: string;
  twoFactorEnabled: boolean;
  lastAccessedAt: Date | null;
  deviceInfo: {
    name: string | null;
    type: string | null;
    fingerprint: string | null;
  } | null;
  geolocation: {
    country: string | null;
    city: string | null;
    timezone: string | null;
  } | null;
  riskScore: number;
}

export interface AuthContext {
  session: Session & {
    user: EnterpriseUser;
    enterprise: EnterpriseContext;
  };
  user: EnterpriseUser;
  organization?: Organization;
  membership?: Membership;
  isAuthenticated: boolean;
  hasValidSession: boolean;
  requiresMFA: boolean;
}

export interface OrganizationContext extends AuthContext {
  organization: Organization & {
    settings: Record<string, any> | null;
    features: Record<string, any> | null;
  };
  membership: Membership & {
    role: MemberRole;
    permissions: string[] | null;
    customPermissions: Record<string, boolean> | null;
    metadata: Record<string, any> | null;
  };
}

// ============================================
// CORE CONTEXT FUNCTIONS
// ============================================

/**
 * ✅ ACHROMATIC: Get session without redirect - enhanced version
 */
export async function getSession(): Promise<Session | null> {
  try {
    return await auth();
  } catch (error) {
    console.error('❌ ACHROMATIC: Error getting session:', error);
    return null;
  }
}

/**
 * ✅ ENTERPRISE: Get enhanced user data from database
 */
async function getEnhancedUserData(
  userId: string
): Promise<EnterpriseUser | null> {
  try {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        image: users.image,
        emailVerified: users.emailVerified,
        passwordHash: users.passwordHash,
        isActive: users.isActive,
        lastLoginAt: users.lastLoginAt,
        twoFactorEnabled: users.twoFactorEnabled,
        twoFactorSecret: users.twoFactorSecret,
        backupCodes: users.backupCodes,
        securityLevel: users.securityLevel,
        passwordChangedAt: users.passwordChangedAt,
        accountLockedAt: users.accountLockedAt,
        accountLockedUntil: users.accountLockedUntil,
        failedLoginAttempts: users.failedLoginAttempts,
        preferences: users.preferences,
        metadata: users.metadata,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) return null;

    // ✅ CORRIGIDO: Cast para EnterpriseUser com SecurityLevel
    if (!user) return null;
    return {
      ...user,
      securityLevel: (user.securityLevel as SecurityLevel) || 'normal',
    } as EnterpriseUser;
  } catch (error) {
    console.error('❌ ACHROMATIC: Error fetching enhanced user data:', error);
    return null;
  }
}

/**
 * ✅ ACHROMATIC: Optional context that doesn't redirect - enterprise enhanced
 */
export async function getOptionalAuthContext(): Promise<AuthContext | null> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return null;
    }

    // ✅ ENTERPRISE: Get enhanced user data
    const enhancedUser = await getEnhancedUserData(session.user.id);
    if (!enhancedUser || !enhancedUser.isActive) {
      return null;
    }

    // ✅ ACHROMATIC: Extract enterprise context
    const enterpriseContext: EnterpriseContext = (session as any)
      ?.enterprise || {
      sessionId: null,
      organizationId: null,
      organizationSlug: null,
      securityLevel: 'normal' as SecurityLevel,
      isCredentialsUser: false,
      provider: 'unknown',
      twoFactorEnabled: false,
      lastAccessedAt: null,
      deviceInfo: null,
      geolocation: null,
      riskScore: 0,
    };

    const enhancedSession = {
      ...session,
      user: enhancedUser,
      enterprise: enterpriseContext,
    };

    return {
      session: enhancedSession,
      user: enhancedUser,
      organization: undefined,
      membership: undefined,
      isAuthenticated: true,
      hasValidSession: true,
      requiresMFA:
        enhancedUser.twoFactorEnabled || enterpriseContext.riskScore > 50,
    };
  } catch (error) {
    console.error('❌ ACHROMATIC: Error in getOptionalAuthContext:', error);
    return null;
  }
}

/**
 * ✅ ACHROMATIC: Required auth context with redirect - enterprise enhanced
 */
export async function getRequiredAuthContext(): Promise<AuthContext> {
  const context = await getOptionalAuthContext();

  if (!context) {
    console.log('❌ ACHROMATIC: No valid auth context, redirecting to sign-in');
    redirect('/auth/sign-in');
  }

  return context;
}

/**
 * ✅ ENTERPRISE: Get organization context for multi-tenant operations
 */
export async function getOrganizationContext(
  organizationSlug: string
): Promise<OrganizationContext> {
  const authContext = await getRequiredAuthContext();

  try {
    // ✅ ACHROMATIC: Get organization by slug
    const [organization] = await db
      .select({
        id: organizations.id,
        name: organizations.name,
        slug: organizations.slug,
        description: organizations.description,
        image: organizations.image,
        website: organizations.website,
        ownerId: organizations.ownerId,
        parentId: organizations.parentId,
        stripeCustomerId: organizations.stripeCustomerId,
        stripeSubscriptionId: organizations.stripeSubscriptionId,
        billingEmail: organizations.billingEmail,
        planId: organizations.planId,
        planName: organizations.planName,
        subscriptionStatus: organizations.subscriptionStatus,
        trialEndsAt: organizations.trialEndsAt,
        subscriptionEndsAt: organizations.subscriptionEndsAt,
        maxMembers: organizations.maxMembers,
        maxProjects: organizations.maxProjects,
        maxStorage: organizations.maxStorage,
        currentMembers: organizations.currentMembers,
        currentProjects: organizations.currentProjects,
        currentStorage: organizations.currentStorage,
        settings: organizations.settings,
        features: organizations.features,
        securityPolicy: organizations.securityPolicy,
        isActive: organizations.isActive,
        isVerified: organizations.isVerified,
        isSuspended: organizations.isSuspended,
        suspendedAt: organizations.suspendedAt,
        suspendedReason: organizations.suspendedReason,
        deletedAt: organizations.deletedAt,
        createdAt: organizations.createdAt,
        updatedAt: organizations.updatedAt,
      })
      .from(organizations)
      .where(
        and(
          eq(organizations.slug, organizationSlug),
          eq(organizations.isActive, true)
        )
      )
      .limit(1);

    if (!organization) {
      throw new Error(
        `Organization '${organizationSlug}' not found or inactive`
      );
    }

    if (organization.isSuspended) {
      throw new Error(`Organization '${organizationSlug}' is suspended`);
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
        invitedBy: memberships.invitedBy,
        invitedAt: memberships.invitedAt,
        joinedAt: memberships.joinedAt,
        isActive: memberships.isActive,
        metadata: memberships.metadata,
        createdAt: memberships.createdAt,
        updatedAt: memberships.updatedAt,
      })
      .from(memberships)
      .where(
        and(
          eq(memberships.userId, authContext.user.id),
          eq(memberships.organizationId, organization.id),
          eq(memberships.isActive, true)
        )
      )
      .limit(1);

    if (!membership) {
      throw new Error(
        `User is not a member of organization '${organizationSlug}'`
      );
    }

    return {
      ...authContext,
      organization: {
        ...organization,
        settings: organization.settings as Record<string, any> | null,
        features: organization.features as Record<string, any> | null,
      },
      membership: {
        ...membership,
        role: membership.role as MemberRole,
        permissions: membership.permissions as string[] | null,
        customPermissions: membership.customPermissions as Record<
          string,
          boolean
        > | null,
        metadata: membership.metadata as Record<string, any> | null,
      },
    };
  } catch (error) {
    console.error('❌ ACHROMATIC: Error getting organization context:', error);
    throw error;
  }
}

/**
 * ✅ ENTERPRISE: Get user's organizations with membership data
 */
export async function getUserOrganizations(): Promise<
  Array<{
    organization: Pick<
      Organization,
      'id' | 'name' | 'slug' | 'image' | 'isActive'
    >;
    membership: Pick<Membership, 'role' | 'joinedAt' | 'isActive'>;
  }>
> {
  const authContext = await getRequiredAuthContext();

  try {
    return await db
      .select({
        organization: {
          id: organizations.id,
          name: organizations.name,
          slug: organizations.slug,
          image: organizations.image,
          isActive: organizations.isActive,
        },
        membership: {
          role: memberships.role,
          joinedAt: memberships.joinedAt,
          isActive: memberships.isActive,
        },
      })
      .from(organizations)
      .innerJoin(memberships, eq(memberships.organizationId, organizations.id))
      .where(
        and(
          eq(memberships.userId, authContext.user.id),
          eq(memberships.isActive, true),
          eq(organizations.isActive, true)
        )
      )
      .orderBy(memberships.createdAt); // ✅ CORRIGIDO: joinedAt → createdAt
  } catch (error) {
    console.error('❌ ACHROMATIC: Error getting user organizations:', error);
    return [];
  }
}

// ============================================
// LEGACY COMPATIBILITY FUNCTIONS
// ============================================

/**
 * ✅ LEGACY: Maintained for backward compatibility
 */
export async function requireAuth(): Promise<Session> {
  const context = await getRequiredAuthContext();
  return context.session;
}

/**
 * ✅ ACHROMATIC: Get auth context - this was the missing function
 */
export async function getAuthContext(): Promise<AuthContext> {
  return await getRequiredAuthContext();
}

// ============================================
// PERMISSION & ACCESS CONTROL UTILITIES
// ============================================

/**
 * ✅ ENTERPRISE: Check if user has specific permission in organization
 */
export function hasPermission(
  membership: OrganizationContext['membership'],
  permission: string
): boolean {
  if (!membership || !membership.isActive) {
    return false;
  }

  // Owner and admin have all permissions
  if (membership.role === 'owner' || membership.role === 'admin') {
    return true;
  }

  // Check custom permissions first (they override standard permissions)
  if (
    membership.customPermissions &&
    permission in membership.customPermissions
  ) {
    return membership.customPermissions[permission];
  }

  // Check standard permissions
  return membership.permissions?.includes(permission) || false;
}

/**
 * ✅ ENTERPRISE: Check if user has any of the specified roles
 */
export function hasRole(
  membership: OrganizationContext['membership'],
  ...roles: MemberRole[]
): boolean {
  if (!membership || !membership.isActive) {
    return false;
  }

  return roles.includes(membership.role);
}

/**
 * ✅ ENTERPRISE: Check if user is organization owner
 */
export function isOwner(
  membership: OrganizationContext['membership']
): boolean {
  return hasRole(membership, 'owner');
}

/**
 * ✅ ENTERPRISE: Check if user is admin or owner
 */
export function isAdminOrOwner(
  membership: OrganizationContext['membership']
): boolean {
  return hasRole(membership, 'owner', 'admin');
}

/**
 * ✅ ENTERPRISE: Check if user can manage members
 */
export function canManageMembers(
  membership: OrganizationContext['membership']
): boolean {
  return (
    isAdminOrOwner(membership) || hasPermission(membership, 'manage:members')
  );
}

/**
 * ✅ ENTERPRISE: Check if user can manage projects
 */
export function canManageProjects(
  membership: OrganizationContext['membership']
): boolean {
  return (
    isAdminOrOwner(membership) || hasPermission(membership, 'manage:projects')
  );
}

/**
 * ✅ ENTERPRISE: Check if user can view billing
 */
export function canViewBilling(
  membership: OrganizationContext['membership']
): boolean {
  return isOwner(membership) || hasPermission(membership, 'view:billing');
}

/**
 * ✅ ENTERPRISE: Check if user can manage billing
 */
export function canManageBilling(
  membership: OrganizationContext['membership']
): boolean {
  return isOwner(membership) || hasPermission(membership, 'manage:billing');
}

// ============================================
// SECURITY CONTEXT UTILITIES
// ============================================

/**
 * ✅ ENTERPRISE: Check if user session has high security level
 */
export function hasHighSecurity(context: AuthContext): boolean {
  return (
    context.session.enterprise.securityLevel === 'high_risk' ||
    context.session.enterprise.securityLevel === 'critical'
  );
}

/**
 * ✅ ENTERPRISE: Check if user has 2FA enabled
 */
export function hasTwoFactor(context: AuthContext): boolean {
  return context.session.enterprise.twoFactorEnabled;
}

/**
 * ✅ ENTERPRISE: Check if session is from credentials provider
 */
export function isCredentialsSession(context: AuthContext): boolean {
  return context.session.enterprise.isCredentialsUser;
}

/**
 * ✅ ENTERPRISE: Get session risk level
 */
export function getSessionRiskLevel(
  context: AuthContext
): 'low' | 'medium' | 'high' | 'critical' {
  const score = context.session.enterprise.riskScore;

  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 30) return 'medium';
  return 'low';
}

// ============================================
// TYPE GUARDS
// ============================================

/**
 * ✅ ACHROMATIC: Type guard for valid auth context
 */
export function isValidAuthContext(context: any): context is AuthContext {
  return (
    context &&
    typeof context === 'object' &&
    context.session &&
    context.user &&
    typeof context.user.id === 'string' &&
    typeof context.user.email === 'string' &&
    context.user.isActive === true &&
    context.isAuthenticated === true
  );
}

/**
 * ✅ ENTERPRISE: Type guard for organization context
 */
export function isValidOrganizationContext(
  context: any
): context is OrganizationContext {
  return Boolean(
    isValidAuthContext(context) &&
      context.organization &&
      context.membership &&
      typeof context.organization.id === 'string' &&
      typeof context.membership.role === 'string' &&
      context.membership.isActive === true &&
      context.organization.isActive === true
  );
}
