import { getDb, sessions } from '@workspace/database';
import { and, eq, ne } from 'drizzle-orm';
import type { Session } from '../../domain/entities/Session';
import type { SessionRepositoryPort } from '../../domain/ports/SessionRepositoryPort';
import type { EnhancedSessionData } from '../../types/session.types';

/**
 * Implementação concreta do SessionRepositoryPort usando Drizzle
 */
export class DrizzleSessionRepository implements SessionRepositoryPort {
  async create(session: Session): Promise<void> {
    try {
      const db = await getDb();

      // Usar APENAS campos que existem na tabela sessions
      await db.insert(sessions).values({
        session_token: session.sessionToken,
        user_id: session.userId,
        expires: session.expires,
        created_at: new Date(),
        last_accessed_at: new Date(),
        ip_address: null, // Pode ser definido posteriormente
        user_agent: null, // Pode ser definido posteriormente
      });

      console.warn(
        `✅ Session created: ${session.sessionToken} for user ${session.userId}`
      );
    } catch (error) {
      console.error('❌ DrizzleSessionRepository create error:', error);
      throw error;
    }
  }

  async findByToken(token: string): Promise<EnhancedSessionData | null> {
    try {
      const db = await getDb();
      const [session] = await db
        .select()
        .from(sessions)
        .where(eq(sessions.session_token, token))
        .limit(1);

      if (!session) {
        return null;
      }

      // Verificar se a sessão expirou
      if (new Date() > session.expires) {
        return null;
      }

      return this.mapToEnhancedSessionData(session);
    } catch (error) {
      console.error('❌ DrizzleSessionRepository findByToken error:', error);
      return null;
    }
  }

  async revoke(
    token: string,
    revokedBy: string,
    reason = 'user_request'
  ): Promise<void> {
    try {
      const db = await getDb();

      await db.delete(sessions).where(eq(sessions.session_token, token));

      console.error(`✅ Session deleted: ${token} by ${revokedBy} (${reason})`);
    } catch (error) {
      console.error('❌ DrizzleSessionRepository revoke error:', error);
      throw error;
    }
  }

  async revokeAllForUser(
    userId: string,
    exceptToken?: string,
    revokedBy = 'system',
    reason = 'password_reset'
  ): Promise<number> {
    try {
      const db = await getDb();

      const conditions = [eq(sessions.user_id, userId)];

      if (exceptToken) {
        conditions.push(ne(sessions.session_token, exceptToken));
      }

      const deletedSessions = await db
        .delete(sessions)
        .where(and(...conditions))
        .returning({ count: sessions.session_token });

      const affectedRows = deletedSessions.length;
      console.error(
        `✅ ${affectedRows} sessions deleted for user ${userId} by ${revokedBy} (${reason})`
      );
      return affectedRows;
    } catch (error) {
      console.error(
        '❌ DrizzleSessionRepository revokeAllForUser error:',
        error
      );
      return 0;
    }
  }

  private mapToEnhancedSessionData(
    session: typeof sessions.$inferSelect
  ): EnhancedSessionData {
    return {
      sessionToken: session.session_token,
      userId: session.user_id,
      expires: session.expires,
      createdAt: session.created_at,
      lastAccessedAt: session.last_accessed_at,
      isRevoked: false,
      revokedAt: null,
      revokedBy: null,
      revokedReason: null,
      ipAddress: session.ip_address,
      userAgent: session.user_agent,
      deviceFingerprint: null,
      deviceName: null,
      deviceType: 'desktop' as const,
      organizationId: null,
      securityLevel: 'normal' as const,
      riskScore: 0,
      country: null,
      city: null,
      timezone: null,
      sessionData: null,
      complianceFlags: null,
    };
  }
}
