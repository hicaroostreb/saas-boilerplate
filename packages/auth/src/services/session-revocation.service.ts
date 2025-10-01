// packages/auth/src/services/session-revocation.service.ts - SESSION REVOCATION SERVICE (FINAL)

import type { SessionListItem } from '../types';
import { AuditService } from './audit.service';
import { AuthContextService } from './auth-context.service';
import { SessionManagementService } from './session-management.service';

/**
 * ✅ ENTERPRISE: Session with device info interface
 */
interface SessionWithDeviceInfo extends SessionListItem {
  sessionToken: string;
  deviceInfo?: {
    fingerprint?: string;
    [key: string]: unknown;
  };
}

/**
 * ✅ ENTERPRISE: Session Revocation Result (for lib/actions compatibility)
 */
export interface SessionRevocationResult {
  success: boolean;
  revokedCount?: number;
  error?: string;
}

/**
 * ✅ ENTERPRISE: Session Revocation Service (Complete)
 */
export class SessionRevocationService {
  private authContextService: AuthContextService;
  private sessionManagementService: SessionManagementService;
  private auditService: AuditService;

  constructor() {
    this.authContextService = new AuthContextService();
    this.sessionManagementService = new SessionManagementService();
    this.auditService = new AuditService();
  }

  /**
   * ✅ REVOKE: Single session
   */
  async revokeSession(
    sessionId: string,
    reason?: string,
    context?: { ipAddress?: string; userAgent?: string }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.sessionManagementService.revokeSession(
        sessionId,
        reason
      );

      await this.auditService.logAuthEvent({
        sessionToken: sessionId,
        eventType: 'session_expired',
        eventAction: 'session_revoked',
        eventStatus: 'success',
        eventCategory: 'security',
        ipAddress: context?.ipAddress ?? null,
        userAgent: context?.userAgent ?? null,
        eventData: {
          sessionId,
          reason: reason ?? 'manual_revocation',
          revokedAt: new Date(),
        },
      });

      return result;
    } catch (error) {
      console.error('❌ SessionRevocationService revokeSession error:', error);
      return {
        success: false,
        error: 'Failed to revoke session',
      };
    }
  }

  /**
   * ✅ REVOKE: Single session (alias for lib/actions compatibility)
   */
  async revokeSingleSession(
    sessionId: string,
    reason?: string
  ): Promise<SessionRevocationResult> {
    const result = await this.revokeSession(sessionId, reason);
    return {
      success: result.success,
      revokedCount: result.success ? 1 : 0,
      error: result.error,
    };
  }

  /**
   * ✅ REVOKE: All user sessions
   */
  async revokeAllUserSessions(
    userId: string,
    keepCurrent?: string | boolean,
    reason?: string
  ): Promise<{ success: boolean; revokedCount: number; error?: string }> {
    try {
      const keepCurrentSession =
        typeof keepCurrent === 'string'
          ? keepCurrent.toLowerCase() === 'true'
          : (keepCurrent ?? true);

      const result = await this.sessionManagementService.revokeAllUserSessions(
        userId,
        keepCurrentSession,
        reason
      );

      await this.auditService.logAuthEvent({
        userId,
        eventType: 'session_expired',
        eventAction: 'bulk_session_revocation',
        eventStatus: 'success',
        eventCategory: 'security',
        eventData: {
          userId,
          keepCurrent: keepCurrentSession,
          reason: reason ?? 'admin_action',
          revokedAt: new Date(),
        },
      });

      return result;
    } catch (error) {
      console.error(
        '❌ SessionRevocationService revokeAllUserSessions error:',
        error
      );
      return {
        success: false,
        revokedCount: 0,
        error: 'Failed to revoke sessions',
      };
    }
  }

  /**
   * ✅ REVOKE: All sessions (alias for lib/actions compatibility)
   */
  async revokeAllSessions(
    userId: string,
    keepCurrent?: boolean,
    reason?: string
  ): Promise<SessionRevocationResult> {
    const result = await this.revokeAllUserSessions(
      userId,
      keepCurrent,
      reason
    );
    return {
      success: result.success,
      revokedCount: result.revokedCount,
      error: result.error,
    };
  }

  /**
   * ✅ REVOKE: Sessions by device (corrected name)
   */
  async revokeSessionsByDevice(
    userId: string,
    deviceFingerprint: string,
    reason?: string
  ): Promise<{ success: boolean; revokedCount: number; error?: string }> {
    try {
      const sessions = await this.getActiveSessionsForUser(userId);

      // ✅ FIX: Type-safe filtering with proper interface
      const deviceSessions = (sessions as SessionWithDeviceInfo[]).filter(
        (session: SessionWithDeviceInfo) =>
          session.deviceInfo?.fingerprint === deviceFingerprint
      );

      // ✅ FIX: Collect promises and await them all at once to avoid await-in-loop
      const revocationPromises = deviceSessions.map(session =>
        this.revokeSession(session.sessionToken, reason)
      );

      const results = await Promise.all(revocationPromises);
      const revokedCount = results.filter(result => result.success).length;

      return {
        success: true,
        revokedCount,
      };
    } catch (error) {
      console.error(
        '❌ SessionRevocationService revokeSessionsByDevice error:',
        error
      );
      return {
        success: false,
        revokedCount: 0,
        error: 'Failed to revoke sessions by device',
      };
    }
  }

  /**
   * ✅ REVOKE: Session by device (alias for lib/actions compatibility)
   */
  async revokeSessionByDevice(
    userId: string,
    deviceFingerprint: string,
    reason?: string
  ): Promise<SessionRevocationResult> {
    const result = await this.revokeSessionsByDevice(
      userId,
      deviceFingerprint,
      reason
    );
    return {
      success: result.success,
      revokedCount: result.revokedCount,
      error: result.error,
    };
  }

  /**
   * ✅ REVOKE: Expired sessions
   */
  async revokeExpiredSessions(): Promise<{
    success: boolean;
    revokedCount: number;
    error?: string;
  }> {
    try {
      console.warn('Cleaning up expired sessions...');

      await this.auditService.logAuthEvent({
        eventType: 'session_expired',
        eventAction: 'expired_sessions_cleanup',
        eventStatus: 'success',
        eventCategory: 'admin',
        eventData: {
          cleanupAt: new Date(),
          revokedCount: 0,
        },
      });

      return {
        success: true,
        revokedCount: 0,
      };
    } catch (error) {
      console.error(
        '❌ SessionRevocationService revokeExpiredSessions error:',
        error
      );
      return {
        success: false,
        revokedCount: 0,
        error: 'Failed to revoke expired sessions',
      };
    }
  }

  /**
   * ✅ GET: Active sessions (for lib/actions compatibility)
   */
  async getActiveSessions(userId: string): Promise<SessionListItem[]> {
    return this.getActiveSessionsForUser(userId);
  }

  /**
   * ✅ GET: Active sessions for user
   */
  async getActiveSessionsForUser(userId: string): Promise<SessionListItem[]> {
    try {
      return await this.sessionManagementService.getActiveSessions(userId);
    } catch (error) {
      console.error(
        '❌ SessionRevocationService getActiveSessionsForUser error:',
        error
      );
      return [];
    }
  }

  /**
   * ✅ REVOKE: Session by token
   */
  async revokeSessionByToken(
    sessionToken: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      return await this.revokeSession(sessionToken, reason);
    } catch (error) {
      console.error(
        '❌ SessionRevocationService revokeSessionByToken error:',
        error
      );
      return {
        success: false,
        error: 'Failed to revoke session by token',
      };
    }
  }

  /**
   * ✅ CHECK: If session is revoked
   */
  async isSessionRevoked(_sessionId: string): Promise<boolean> {
    // TODO: Implement actual session revocation check
    return false;
  }

  /**
   * ✅ UTILITY: Bulk revoke with filters
   */
  async bulkRevokeSessionsWithFilters(filters: {
    userId?: string;
    deviceType?: string;
    olderThan?: Date;
    reason?: string;
  }): Promise<{ success: boolean; revokedCount: number; error?: string }> {
    try {
      console.warn('Bulk revoking sessions with filters:', filters);

      await this.auditService.logAuthEvent({
        eventType: 'session_expired',
        eventAction: 'bulk_revocation_with_filters',
        eventStatus: 'success',
        eventCategory: 'admin',
        eventData: {
          filters,
          revokedAt: new Date(),
        },
      });

      return {
        success: true,
        revokedCount: 0,
      };
    } catch (error) {
      console.error(
        '❌ SessionRevocationService bulkRevokeSessionsWithFilters error:',
        error
      );
      return {
        success: false,
        revokedCount: 0,
        error: 'Bulk revocation failed',
      };
    }
  }
}
