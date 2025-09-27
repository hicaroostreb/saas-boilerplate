// packages/auth/src/config.ts - ACHROMATIC ENTERPRISE HYBRID CONFIG CORRIGIDO

import { DrizzleAdapter } from '@auth/drizzle-adapter';
import {
  accounts,
  authAuditLogs,
  db,
  memberships,
  organizations,
  sessions,
  users,
  verificationTokens,
} from '@workspace/database';
import { randomUUID } from 'crypto';
import { and, eq, gt, lt } from 'drizzle-orm';
import type { NextAuthConfig } from 'next-auth';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { AuditService } from './audit';
import { verifyPassword } from './password';
import { SecurityService } from './security';
import { EnterpriseSessionService } from './session';
import type {
  AuthEventCategory,
  AuthEventStatus,
  AuthEventType,
  SecurityLevel,
} from './types';

// ============================================
// SERVICE INSTANCES (CORRIGIDO)
// ============================================

// ✅ ACHROMATIC: Use singleton instances directly
const enterpriseSessionService = EnterpriseSessionService;
const auditService = AuditService;
const securityService = SecurityService;

// ✅ TODO: Rate limiting placeholder
const rateLimitService = {
  async checkRateLimit(): Promise<boolean> {
    return false;
  },
  async incrementRateLimit(): Promise<void> {
    return;
  },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * ✅ ENTERPRISE: Get user role in organization
 */
async function getUserRole(
  userId: string,
  organizationId?: string
): Promise<string | null> {
  if (!organizationId) return null;

  try {
    const [membership] = await db
      .select({ role: memberships.role })
      .from(memberships)
      .where(
        and(
          eq(memberships.userId, userId),
          eq(memberships.organizationId, organizationId),
          eq(memberships.isActive, true)
        )
      )
      .limit(1);

    return membership?.role || null;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
}

/**
 * ✅ ENTERPRISE: Get user primary organization
 */
async function getUserPrimaryOrganization(userId: string) {
  try {
    const [membership] = await db
      .select({
        organizationId: organizations.id,
        organizationSlug: organizations.slug,
        role: memberships.role,
      })
      .from(memberships)
      .innerJoin(
        organizations,
        eq(memberships.organizationId, organizations.id)
      )
      .where(
        and(
          eq(memberships.userId, userId),
          eq(memberships.isActive, true),
          eq(organizations.isActive, true)
        )
      )
      .orderBy(memberships.createdAt)
      .limit(1);

    return membership;
  } catch (error) {
    console.error('Error fetching primary organization:', error);
    return null;
  }
}

// ============================================
// NEXTAUTH CONFIG
// ============================================

export const authConfig: NextAuthConfig = {
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },

  providers: [
    Credentials({
      id: 'credentials',
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials, req) => {
        if (!credentials?.email || !credentials?.password) {
          await auditService.logAuthEvent({
            eventType: 'login' as AuthEventType,
            eventAction: 'credentials_missing',
            eventStatus: 'failure' as AuthEventStatus,
            eventCategory: 'auth' as AuthEventCategory,
            errorCode: 'MISSING_CREDENTIALS',
            errorMessage: 'Email or password not provided',
            ipAddress: req?.headers?.get?.('x-forwarded-for') || 'unknown',
            userAgent: req?.headers?.get?.('user-agent') || 'unknown',
          });
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;
        const ipAddress = req?.headers?.get?.('x-forwarded-for') || 'unknown';
        const userAgent = req?.headers?.get?.('user-agent') || 'unknown';

        try {
          const isRateLimited = await rateLimitService.checkRateLimit();

          if (isRateLimited) {
            await auditService.logAuthEvent({
              eventType: 'login' as AuthEventType,
              eventAction: 'rate_limited',
              eventStatus: 'failure' as AuthEventStatus,
              eventCategory: 'security' as AuthEventCategory,
              errorCode: 'RATE_LIMIT_EXCEEDED',
              errorMessage: `Too many login attempts for ${email}`,
              ipAddress,
              userAgent,
              riskScore: 75,
              riskFactors: ['rate_limit_exceeded', 'suspicious_activity'],
            });
            return null;
          }

          const [user] = await db
            .select({
              id: users.id,
              email: users.email,
              name: users.name,
              passwordHash: users.passwordHash,
              image: users.image,
              emailVerified: users.emailVerified,
              isActive: users.isActive,
              accountLockedAt: users.accountLockedAt,
              accountLockedUntil: users.accountLockedUntil,
              failedLoginAttempts: users.failedLoginAttempts,
              twoFactorEnabled: users.twoFactorEnabled,
              securityLevel: users.securityLevel,
            })
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

          if (!user || !user.passwordHash) {
            await rateLimitService.incrementRateLimit();

            await auditService.logAuthEvent({
              eventType: 'login' as AuthEventType,
              eventAction: 'user_not_found',
              eventStatus: 'failure' as AuthEventStatus,
              eventCategory: 'auth' as AuthEventCategory,
              errorCode: 'USER_NOT_FOUND',
              errorMessage: 'User not found or no password set',
              ipAddress,
              userAgent,
              eventData: { email },
            });
            return null;
          }

          if (!user.isActive) {
            await auditService.logAuthEvent({
              userId: user.id,
              eventType: 'login' as AuthEventType,
              eventAction: 'account_inactive',
              eventStatus: 'failure' as AuthEventStatus,
              eventCategory: 'security' as AuthEventCategory,
              errorCode: 'ACCOUNT_INACTIVE',
              errorMessage: 'User account is inactive',
              ipAddress,
              userAgent,
            });
            return null;
          }

          if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
            await auditService.logAuthEvent({
              userId: user.id,
              eventType: 'login' as AuthEventType,
              eventAction: 'account_locked',
              eventStatus: 'failure' as AuthEventStatus,
              eventCategory: 'security' as AuthEventCategory,
              errorCode: 'ACCOUNT_LOCKED',
              errorMessage: 'User account is temporarily locked',
              ipAddress,
              userAgent,
              eventData: { lockedUntil: user.accountLockedUntil },
            });
            return null;
          }

          const isValidPassword = await verifyPassword(
            password,
            user.passwordHash
          );
          if (!isValidPassword) {
            const newFailedAttempts = (user.failedLoginAttempts || 0) + 1;
            const shouldLockAccount = newFailedAttempts >= 5;

            if (shouldLockAccount) {
              const lockUntil = new Date(Date.now() + 30 * 60 * 1000);
              await db
                .update(users)
                .set({
                  failedLoginAttempts: newFailedAttempts,
                  accountLockedAt: new Date(),
                  accountLockedUntil: lockUntil,
                  updatedAt: new Date(),
                })
                .where(eq(users.id, user.id));

              await auditService.logAuthEvent({
                userId: user.id,
                eventType: 'login' as AuthEventType,
                eventAction: 'account_locked_auto',
                eventStatus: 'failure' as AuthEventStatus,
                eventCategory: 'security' as AuthEventCategory,
                errorCode: 'ACCOUNT_AUTO_LOCKED',
                errorMessage:
                  'Account locked due to too many failed login attempts',
                ipAddress,
                userAgent,
                eventData: {
                  failedAttempts: newFailedAttempts,
                  lockedUntil: lockUntil,
                },
              });
            } else {
              await db
                .update(users)
                .set({
                  failedLoginAttempts: newFailedAttempts,
                  updatedAt: new Date(),
                })
                .where(eq(users.id, user.id));
            }

            await rateLimitService.incrementRateLimit();

            await auditService.logAuthEvent({
              userId: user.id,
              eventType: 'login' as AuthEventType,
              eventAction: 'invalid_password',
              eventStatus: 'failure' as AuthEventStatus,
              eventCategory: 'auth' as AuthEventCategory,
              errorCode: 'INVALID_PASSWORD',
              errorMessage: 'Invalid password provided',
              ipAddress,
              userAgent,
              eventData: { failedAttempts: newFailedAttempts },
            });
            return null;
          }

          // Reset failed attempts on successful login
          if (user.failedLoginAttempts > 0) {
            await db
              .update(users)
              .set({
                failedLoginAttempts: 0,
                accountLockedAt: null,
                accountLockedUntil: null,
                lastLoginAt: new Date(),
                updatedAt: new Date(),
              })
              .where(eq(users.id, user.id));
          } else {
            await db
              .update(users)
              .set({
                lastLoginAt: new Date(),
                updatedAt: new Date(),
              })
              .where(eq(users.id, user.id));
          }

          // ✅ CORRIGIDO: Parse device info first
          const deviceInfo = await securityService.parseDeviceInfo(userAgent);

          // Create enterprise session
          const enterpriseSessionData =
            await enterpriseSessionService.createEnterpriseSessionForCredentials(
              user.id,
              {
                ipAddress,
                userAgent,
                deviceInfo: {
                  name: deviceInfo.name || undefined,
                  type: deviceInfo.type,
                  fingerprint: deviceInfo.fingerprint || undefined,
                },
                securityLevel: user.securityLevel as SecurityLevel,
              }
            );

          await auditService.logAuthEvent({
            userId: user.id,
            sessionToken: enterpriseSessionData.sessionToken,
            eventType: 'login' as AuthEventType,
            eventAction: 'credentials_success',
            eventStatus: 'success' as AuthEventStatus,
            eventCategory: 'auth' as AuthEventCategory,
            ipAddress,
            userAgent,
            eventData: {
              sessionId: enterpriseSessionData.sessionToken,
              securityLevel: user.securityLevel,
              deviceInfo,
            },
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            emailVerified: user.emailVerified,
            securityLevel: user.securityLevel,
            twoFactorEnabled: user.twoFactorEnabled,
            enterpriseSessionId: enterpriseSessionData.sessionToken,
          };
        } catch (error) {
          console.error(
            '❌ ACHROMATIC: Error in credentials authorize:',
            error
          );

          await auditService.logAuthEvent({
            eventType: 'login' as AuthEventType,
            eventAction: 'system_error',
            eventStatus: 'error' as AuthEventStatus,
            eventCategory: 'auth' as AuthEventCategory,
            errorCode: 'SYSTEM_ERROR',
            errorMessage:
              error instanceof Error ? error.message : 'Unknown error',
            ipAddress,
            userAgent,
            eventData: {
              email,
              error: error instanceof Error ? error.stack : String(error),
            },
          });

          return null;
        }
      },
    }),

    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope: 'openid email profile',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],

  pages: {
    signIn: '/auth/sign-in',
    signOut: '/auth/sign-out',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/welcome',
  },

  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      if (account && user) {
        token.userId = user.id;
        token.provider = account.provider;

        if (account.provider === 'credentials') {
          token.isCredentialsUser = true;
          token.enterpriseSessionId = (user as any).enterpriseSessionId;
          token.securityLevel = (user as any).securityLevel || 'normal';
          token.twoFactorEnabled = (user as any).twoFactorEnabled || false;
        } else {
          token.isCredentialsUser = false;

          try {
            const dbSession =
              await enterpriseSessionService.enhanceSocialSession(
                user.id!,
                account.providerAccountId,
                account.provider
              );
            token.enterpriseSessionId = dbSession?.sessionToken;
          } catch (error) {
            console.error('❌ Error enhancing social session:', error);
          }
        }

        // ✅ CORRIGIDO: Check user.id before using
        if (user.id) {
          try {
            const membership = await getUserPrimaryOrganization(user.id);

            if (membership) {
              token.organizationId = membership.organizationId;
              token.organizationSlug = membership.organizationSlug;
              token.role = membership.role;
            }
          } catch (error) {
            console.error('❌ Error fetching organization:', error);
          }
        }
      }

      if (trigger === 'update' && session) {
        Object.assign(token, session);
      }

      if (token.enterpriseSessionId && token.isCredentialsUser) {
        try {
          const sessionValid = await enterpriseSessionService.validateSession(
            token.enterpriseSessionId as string
          );
          if (!sessionValid) {
            console.log(
              '❌ ACHROMATIC: Enterprise session invalid, clearing token'
            );
            return {};
          }
        } catch (error) {
          console.error('❌ Error validating enterprise session:', error);
          return {};
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (!session?.user || !token?.userId) {
        return session;
      }

      session.user.id = token.userId as string;

      (session as any).enterprise = {
        sessionId: token.enterpriseSessionId,
        organizationId: token.organizationId,
        organizationSlug: token.organizationSlug,
        role: token.role,
        securityLevel: token.securityLevel || 'normal',
        isCredentialsUser: token.isCredentialsUser || false,
        provider: token.provider,
        twoFactorEnabled: token.twoFactorEnabled || false,
      };

      if (token.isCredentialsUser && token.enterpriseSessionId) {
        try {
          const enterpriseData = await enterpriseSessionService.getSessionData(
            token.enterpriseSessionId as string
          );

          if (enterpriseData) {
            (session as any).enterprise.lastAccessedAt =
              enterpriseData.lastAccessedAt;
            (session as any).enterprise.deviceInfo = {
              name: enterpriseData.deviceName,
              type: enterpriseData.deviceType,
              fingerprint: enterpriseData.deviceFingerprint,
            };
            (session as any).enterprise.geolocation = {
              country: enterpriseData.country,
              city: enterpriseData.city,
              timezone: enterpriseData.timezone,
            };
            (session as any).enterprise.riskScore =
              enterpriseData.riskScore || 0;
          }
        } catch (error) {
          console.error('❌ Error fetching enterprise session data:', error);
        }
      }

      return session;
    },

    async signIn({ user, account, profile }) {
      try {
        if (account?.provider !== 'credentials') {
          if (user?.id) {
            const [dbUser] = await db
              .select({ isActive: users.isActive })
              .from(users)
              .where(eq(users.id, user.id))
              .limit(1);

            if (dbUser && !dbUser.isActive) {
              await auditService.logAuthEvent({
                userId: user.id,
                eventType: 'login' as AuthEventType,
                eventAction: 'account_inactive_oauth',
                eventStatus: 'failure' as AuthEventStatus,
                eventCategory: 'security' as AuthEventCategory,
                errorCode: 'ACCOUNT_INACTIVE',
                errorMessage: `Inactive account attempted OAuth login via ${account?.provider}`,
                eventData: { provider: account?.provider, profile },
              });
              return false;
            }
          }
        }

        return true;
      } catch (error) {
        console.error('❌ ACHROMATIC: Error in signIn callback:', error);
        return false;
      }
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    },
  },

  events: {
    async signIn({ user, account, profile, isNewUser }) {
      await auditService.logAuthEvent({
        userId: user.id!,
        eventType: 'login' as AuthEventType,
        eventAction:
          account?.provider === 'credentials'
            ? 'credentials_signin'
            : 'oauth_signin',
        eventStatus: 'success' as AuthEventStatus,
        eventCategory: 'auth' as AuthEventCategory,
        eventData: {
          provider: account?.provider,
          isNewUser,
          profileData: profile,
        },
      });

      if (isNewUser) {
        await auditService.logAuthEvent({
          userId: user.id!,
          eventType: 'login' as AuthEventType,
          eventAction: 'new_user_created',
          eventStatus: 'success' as AuthEventStatus,
          eventCategory: 'auth' as AuthEventCategory,
          eventData: {
            provider: account?.provider,
            email: user.email,
            name: user.name,
          },
        });
      }
    },

    // ✅ CORRIGIDO: signOut event with proper type handling
    async signOut(params: { session?: any; token?: any }) {
      const { session, token } = params;

      const userId = session?.user?.id || token?.userId;
      const enterpriseSessionId =
        session?.enterprise?.sessionId || token?.enterpriseSessionId;

      if (userId) {
        await auditService.logAuthEvent({
          userId,
          sessionToken: enterpriseSessionId,
          eventType: 'logout' as AuthEventType,
          eventAction: 'user_signout',
          eventStatus: 'success' as AuthEventStatus,
          eventCategory: 'auth' as AuthEventCategory,
        });

        if (enterpriseSessionId && session?.enterprise?.isCredentialsUser) {
          try {
            await enterpriseSessionService.revokeSession(
              enterpriseSessionId,
              userId,
              'user_signout'
            );
          } catch (error) {
            console.error('❌ Error revoking enterprise session:', error);
          }
        }
      }
    },

    async linkAccount({ user, account, profile }) {
      await auditService.logAuthEvent({
        userId: user.id!,
        eventType: 'login' as AuthEventType,
        eventAction: 'account_linked',
        eventStatus: 'success' as AuthEventStatus,
        eventCategory: 'auth' as AuthEventCategory,
        eventData: {
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          profileData: profile,
        },
      });
    },

    async createUser({ user }) {
      await auditService.logAuthEvent({
        userId: user.id!,
        eventType: 'login' as AuthEventType,
        eventAction: 'user_created',
        eventStatus: 'success' as AuthEventStatus,
        eventCategory: 'auth' as AuthEventCategory,
        eventData: {
          email: user.email,
          name: user.name,
          provider: 'unknown',
        },
      });
    },
  },

  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60,
        domain:
          process.env.NODE_ENV === 'production'
            ? process.env.AUTH_COOKIE_DOMAIN
            : undefined,
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  useSecureCookies: process.env.NODE_ENV === 'production',
  debug:
    process.env.NODE_ENV === 'development' &&
    process.env.NEXTAUTH_DEBUG === 'true',

  logger: {
    error: error => {
      console.error(`❌ ACHROMATIC Auth Error:`, error);
    },
    warn: code => {
      console.warn(`⚠️ ACHROMATIC Auth Warning [${code}]`);
    },
    debug: (code, metadata) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 ACHROMATIC Auth Debug [${code}]:`, metadata);
      }
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

// ============================================
// NEXTAUTH INSTANCE & EXPORTS
// ============================================

const nextAuthInstance = NextAuth(authConfig);

export const { auth, handlers, signIn, signOut } = nextAuthInstance as any;
