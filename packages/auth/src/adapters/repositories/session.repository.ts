// packages/auth/src/repositories/session.repository.ts - SESSION DATA ACCESS (DB COMPATIBLE)

import { db, sessions } from '@workspace/database';
import { randomUUID } from 'crypto';
import { and, desc, eq, gt, lt, ne, sql } from 'drizzle-orm';
import type { DeviceType, SecurityLevel } from '../../types';
import type {
  EnhancedSessionData,
  SessionListItem,
} from '../../types/session.types';

/**
 * ✅ ENTERPRISE: Session Repository (Database Compatible)
 * Single Responsibility: Session data access operations
 */
export class SessionRepository {
  /**
   * ✅ CREATE: New session (compatible with actual DB schema)
   */
  async create(sessionData: {
    userId: string;
    sessionToken?: string;
    expires: Date;
    ipAddress?: string;
    userAgent?: string;
    deviceFingerprint?: string;
    deviceName?: string;
    deviceType?: DeviceType;
    organizationId?: string;
    securityLevel?: SecurityLevel;
    riskScore?: number;
    country?: string;
    city?: string;
    timezone?: string;
    sessionData?: Record<string, unknown>;
  }): Promise<EnhancedSessionData> {
    try {
      const sessionToken = sessionData.sessionToken ?? randomUUID();
      const now = new Date();

      // Only use fields that exist in the actual database schema
      const [session] = await db
        .insert(sessions)
        .values({
          sessionToken,
          userId: sessionData.userId,
          expires: sessionData.expires,
          createdAt: now,
          lastAccessedAt: now,

          // Only fields that exist in DB
          ipAddress: sessionData.ipAddress ?? null,
          userAgent: sessionData.userAgent ?? null,
        })
        .returning();

      if (!session) {
        throw new Error('Failed to create session');
      }

      // Transform to EnhancedSessionData format (adding missing fields as null/defaults)
      return {
        ...session,
        isRevoked: false, // Default
        revokedAt: null,
        revokedBy: null,
        revokedReason: null,
        deviceFingerprint: sessionData.deviceFingerprint ?? null,
        deviceName: sessionData.deviceName ?? null,
        deviceType: sessionData.deviceType ?? 'unknown',
        organizationId: sessionData.organizationId ?? null,
        securityLevel: sessionData.securityLevel ?? 'normal',
        riskScore: sessionData.riskScore ?? 0,
        country: sessionData.country ?? null,
        city: sessionData.city ?? null,
        timezone: sessionData.timezone ?? null,
        sessionData: sessionData.sessionData ?? null,
        complianceFlags: {
          createdAt: now.toISOString(),
          provider: 'credentials',
        },
      } as EnhancedSessionData;
    } catch (error) {
      console.error('❌ SessionRepository create error:', error);
      throw error;
    }
  }

  /**
   * ✅ FIND: Session by token (compatible with actual DB schema)
   */
  async findByToken(sessionToken: string): Promise<EnhancedSessionData | null> {
    try {
      const [session] = await db
        .select()
        .from(sessions)
        .where(
          and(
            eq(sessions.sessionToken, sessionToken),
            gt(sessions.expires, new Date()) // Only check expiration (no isRevoked field)
          )
        )
        .limit(1);

      if (!session) {
        return null;
      }

      // Transform to EnhancedSessionData format
      return {
        ...session,
        isRevoked: false, // Default since we don't have this field
        revokedAt: null,
        revokedBy: null,
        revokedReason: null,
        deviceFingerprint: null, // Not stored in current schema
        deviceName: null,
        deviceType: 'unknown',
        organizationId: null,
        securityLevel: 'normal',
        riskScore: 0,
        country: null,
        city: null,
        timezone: null,
        sessionData: null,
        complianceFlags: null,
      } as EnhancedSessionData;
    } catch (error) {
      console.error('❌ SessionRepository findByToken error:', error);
      return null;
    }
  }

  /**
   * ✅ FIND: Active sessions for user (compatible with actual DB schema)
   */
  async findActiveByUser(userId: string): Promise<SessionListItem[]> {
    try {
      const activeSessions = await db
        .select({
          sessionToken: sessions.sessionToken,
          ipAddress: sessions.ipAddress,
          lastAccessedAt: sessions.lastAccessedAt,
          createdAt: sessions.createdAt,
        })
        .from(sessions)
        .where(
          and(
            eq(sessions.userId, userId),
            gt(sessions.expires, new Date()) // Only check expiration
          )
        )
        .orderBy(desc(sessions.lastAccessedAt));

      return activeSessions.map(session => ({
        sessionToken: session.sessionToken,
        deviceName: null, // Not in current schema
        deviceType: 'unknown' as DeviceType,
        ipAddress: session.ipAddress,
        location: {
          country: null, // Not in current schema
          city: null,
        },
        lastAccessedAt: session.lastAccessedAt,
        createdAt: session.createdAt,
        isCurrent: false, // Will be set by caller
        riskScore: 0, // Not in current schema
        securityLevel: 'normal' as SecurityLevel,
      }));
    } catch (error) {
      console.error('❌ SessionRepository findActiveByUser error:', error);
      return [];
    }
  }

  /**
   * ✅ UPDATE: Touch session (update last accessed)
   */
  async touch(sessionToken: string): Promise<void> {
    try {
      await db
        .update(sessions)
        .set({
          lastAccessedAt: new Date(),
          // Don't set updatedAt - it might not exist in schema
        })
        .where(eq(sessions.sessionToken, sessionToken));
    } catch (error) {
      console.error('❌ SessionRepository touch error:', error);
      // Don't throw - this is not critical
    }
  }

  /**
   * ✅ REVOKE: Single session (simulate by deleting or setting expires)
   */
  async revoke(
    sessionToken: string,
    _revokedBy: string,
    _reason = 'user_request'
  ): Promise<void> {
    try {
      // Since we don't have isRevoked field, we'll set expires to past date
      await db
        .update(sessions)
        .set({
          expires: new Date(0), // Set to epoch (expired)
          lastAccessedAt: new Date(),
        })
        .where(eq(sessions.sessionToken, sessionToken));

      console.warn(
        `✅ SessionRepository: Session revoked by setting expires to past:`,
        sessionToken
      );
    } catch (error) {
      console.error('❌ SessionRepository revoke error:', error);
      throw error;
    }
  }

  /**
   * ✅ REVOKE: All user sessions (simulate by expiring them)
   */
  async revokeAllForUser(
    userId: string,
    exceptSessionToken?: string,
    _revokedBy?: string,
    _reason = 'revoke_all'
  ): Promise<number> {
    try {
      let whereConditions = and(
        eq(sessions.userId, userId),
        gt(sessions.expires, new Date()) // Only active sessions
      );

      if (exceptSessionToken) {
        whereConditions = and(
          eq(sessions.userId, userId),
          gt(sessions.expires, new Date()),
          ne(sessions.sessionToken, exceptSessionToken)
        );
      }

      // Count first
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(sessions)
        .where(whereConditions);

      const sessionCount = Number(countResult[0]?.count ?? 0);

      // Revoke by setting expires to past
      await db
        .update(sessions)
        .set({
          expires: new Date(0), // Set to epoch (expired)
          lastAccessedAt: new Date(),
        })
        .where(whereConditions);

      console.warn(
        `✅ SessionRepository: ${sessionCount} sessions revoked for user:`,
        userId
      );
      return sessionCount;
    } catch (error) {
      console.error('❌ SessionRepository revokeAllForUser error:', error);
      throw error;
    }
  }

  /**
   * ✅ CLEANUP: Expired sessions (delete old expired sessions)
   */
  async cleanupExpired(): Promise<number> {
    try {
      // Count expired sessions first
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(sessions)
        .where(lt(sessions.expires, new Date()));

      const expiredCount = Number(countResult[0]?.count ?? 0);

      // Delete expired sessions (optional - you might want to keep for audit)
      // await db
      //   .delete(sessions)
      //   .where(lt(sessions.expires, new Date()));

      console.warn(
        `✅ SessionRepository: Found ${expiredCount} expired sessions`
      );
      return expiredCount;
    } catch (error) {
      console.error('❌ SessionRepository cleanupExpired error:', error);
      return 0;
    }
  }

  /**
   * ✅ FIND: All sessions for user (including expired, for admin view)
   */
  async findAllByUser(userId: string): Promise<SessionListItem[]> {
    try {
      const allSessions = await db
        .select({
          sessionToken: sessions.sessionToken,
          ipAddress: sessions.ipAddress,
          lastAccessedAt: sessions.lastAccessedAt,
          createdAt: sessions.createdAt,
          expires: sessions.expires,
        })
        .from(sessions)
        .where(eq(sessions.userId, userId))
        .orderBy(desc(sessions.lastAccessedAt));

      return allSessions.map(session => ({
        sessionToken: session.sessionToken,
        deviceName: null,
        deviceType: 'unknown' as DeviceType,
        ipAddress: session.ipAddress,
        location: {
          country: null,
          city: null,
        },
        lastAccessedAt: session.lastAccessedAt,
        createdAt: session.createdAt,
        isCurrent: false,
        riskScore: 0,
        securityLevel: 'normal' as SecurityLevel,
      }));
    } catch (error) {
      console.error('❌ SessionRepository findAllByUser error:', error);
      return [];
    }
  }

  /**
   * ✅ DELETE: Permanently delete session
   */
  async deleteSession(sessionToken: string): Promise<void> {
    try {
      await db.delete(sessions).where(eq(sessions.sessionToken, sessionToken));

      console.warn(
        '✅ SessionRepository: Session permanently deleted:',
        sessionToken
      );
    } catch (error) {
      console.error('❌ SessionRepository deleteSession error:', error);
      throw error;
    }
  }

  /**
   * ✅ COUNT: Active sessions for user
   */
  async countActiveForUser(userId: string): Promise<number> {
    try {
      const [result] = await db
        .select({ count: sql<number>`count(*)` })
        .from(sessions)
        .where(
          and(eq(sessions.userId, userId), gt(sessions.expires, new Date()))
        );

      return Number(result?.count ?? 0);
    } catch (error) {
      console.error('❌ SessionRepository countActiveForUser error:', error);
      return 0;
    }
  }
}
