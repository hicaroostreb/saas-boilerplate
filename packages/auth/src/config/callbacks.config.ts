// packages/auth/src/config/callbacks.config.ts - NEXTAUTH CALLBACKS CONFIGURATION (VERSÃO LIMPA)

import { db, memberships, organizations, users } from '@workspace/database';
import { and, eq } from 'drizzle-orm';
import type { NextAuthConfig } from 'next-auth';

/**
 * ✅ ENTERPRISE: NextAuth Callbacks Configuration (LIMPO)
 * Single Responsibility: NextAuth callbacks for session/JWT handling
 */
export const callbacksConfig: NextAuthConfig['callbacks'] = {
  /**
   * ✅ SIGN-IN: Control whether user can sign in
   */
  async signIn({ user, account, profile, email, credentials }) {
    // Descartar unused parameters
    void account;
    void profile;
    void email;
    void credentials;

    try {
      console.warn(
        `[NextAuth Callback] signIn attempt for user: ${user.email ?? 'unknown'}`
      );

      // Allow all sign-ins for now - validation happens later
      return true;
    } catch (error) {
      console.error('[NextAuth Callback] signIn error:', error);
      return false;
    }
  },

  /**
   * ✅ JWT: Handle JWT token creation and updates
   */
  async jwt({ token, user, account, profile, trigger, session }) {
    // Descartar unused parameters
    void account;
    void profile;
    void trigger;
    void session;

    try {
      // Initial sign-in: populate token with user data
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        token.id = user.id!;
        token.email = user.email;

        // Update last login time if we have user ID
        if (user.id) {
          try {
            await db
              .update(users)
              .set({
                lastLoginAt: new Date(),
              })
              .where(eq(users.id, user.id));
          } catch (updateError) {
            console.error(
              '[NextAuth Callback] Error updating lastLoginAt:',
              updateError
            );
          }
        }
      }

      // Ensure we have user ID for database queries
      if (!token.id && token.sub) {
        token.id = token.sub;
      }

      // Load organization context if we have a user ID
      if (token.id) {
        try {
          // Get user's primary/active organization
          const [membership] = await db
            .select({
              organizationId: memberships.organizationId,
              role: memberships.role,
              permissions: memberships.permissions,
              organization: {
                slug: organizations.slug,
              },
            })
            .from(memberships)
            .innerJoin(
              organizations,
              eq(organizations.id, memberships.organizationId)
            )
            .where(
              and(
                eq(memberships.userId, token.id as string),
                eq(organizations.isActive, true)
              )
            )
            .orderBy(memberships.createdAt)
            .limit(1);

          if (membership) {
            // eslint-disable-next-line require-atomic-updates
            token.organizationId = membership.organizationId;
            // eslint-disable-next-line require-atomic-updates
            token.organizationSlug = membership.organization.slug;
            // eslint-disable-next-line require-atomic-updates
            token.role = membership.role;
            // eslint-disable-next-line require-atomic-updates
            token.permissions = Array.isArray(membership.permissions)
              ? membership.permissions
              : [];
          } else {
            // Clear organization context if no active membership
            // eslint-disable-next-line require-atomic-updates
            token.organizationId = null;
            // eslint-disable-next-line require-atomic-updates
            token.organizationSlug = null;
            // eslint-disable-next-line require-atomic-updates
            token.role = null;
            // eslint-disable-next-line require-atomic-updates
            token.permissions = null;
          }
        } catch (error) {
          console.error(
            '[NextAuth Callback] Error loading organization context:',
            error
          );
          // Don't fail the entire JWT callback - just clear org context
          // eslint-disable-next-line require-atomic-updates
          token.organizationId = null;
          // eslint-disable-next-line require-atomic-updates
          token.organizationSlug = null;
          // eslint-disable-next-line require-atomic-updates
          token.role = null;
          // eslint-disable-next-line require-atomic-updates
          token.permissions = null;
        }
      }

      // Update session metadata
      // eslint-disable-next-line require-atomic-updates
      token.lastAccessedAt = Date.now();

      return token;
    } catch (error) {
      console.error('[NextAuth Callback] JWT callback error:', error);
      return token;
    }
  },

  /**
   * ✅ SESSION: Shape the session object sent to client
   */
  async session({ session, token, user }) {
    try {
      // Use database user if available (database strategy)
      if (user) {
        session.user = {
          ...session.user,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          id: user.id!,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          email: user.email!,
          name: user.name,
          image: user.image,
        };
      }
      // Use JWT token data (JWT strategy)
      else if (token) {
        session.user = {
          ...session.user,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          id: (token.id as string) ?? token.sub!,
          email: token.email as string,
        };
      }

      // Add enterprise context to session (type-safe casting)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const enhancedSession = session as any;

      enhancedSession.enterprise = {
        organizationId: (token.organizationId as string) ?? null,
        organizationSlug: (token.organizationSlug as string) ?? null,
        role: (token.role as string) ?? null,
        permissions: (token.permissions as string[]) ?? null,
        sessionId: null,
        lastAccessedAt: token.lastAccessedAt
          ? new Date(token.lastAccessedAt as number)
          : null,
        deviceInfo: null,
        geolocation: null,
        securityLevel: 'normal' as const,
        riskScore: 0,
      };

      return enhancedSession;
    } catch (error) {
      console.error('[NextAuth Callback] Session callback error:', error);
      return session;
    }
  },

  /**
   * ✅ REDIRECT: Control where user is redirected after sign-in/out
   */
  async redirect({ url, baseUrl }) {
    try {
      // If URL is relative, resolve it against baseUrl
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }

      // If URL is same origin, allow it
      if (url.startsWith(baseUrl)) {
        return url;
      }

      // Default: redirect to organizations page
      return `${baseUrl}/organizations`;
    } catch (error) {
      console.error('[NextAuth Callback] Redirect callback error:', error);
      return `${baseUrl}/organizations`;
    }
  },
};

export default callbacksConfig;
