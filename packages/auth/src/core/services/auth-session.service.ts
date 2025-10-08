// packages/auth/src/core/services/auth-session.service.ts - AUTH SESSION SERVICE

import type { SessionListItem } from '../../types';
import { AuditService } from './audit.service';
import { AuthContextService } from './auth-context.service';

/**
 * ✅ ENTERPRISE: Auth Session Service
 * Single Responsibility: Session management operations
 */
export class AuthSessionService {
  private authContextService: AuthContextService;
  private auditService: AuditService;

  constructor() {
    this.authContextService = new AuthContextService();
    this.auditService = new AuditService();
  }

  /**
   * ✅ GET: Server session (enhanced)
   */
  async getServerSession() {
    try {
      const authContext =
        await this.authContextService.getOptionalAuthContext();

      // ✅ FIX: Use authContext.user instead of authContext.session.user
      if (!authContext?.user) {
        return null;
      }

      return {
        user: {
          id: authContext.user.id,
          email: authContext.user.email,
          name: authContext.user.name,
          image: authContext.user.image,
          isActive: authContext.user.isActive,
          isSuperAdmin: authContext.user.isSuperAdmin,
        },
        session: authContext.session,
        enterprise: authContext.session.enterprise,
      };
    } catch (error) {
      console.error('❌ AuthSessionService getServerSession error:', error);
      return null;
    }
  }

  /**
   * ✅ GET: User's active sessions
   */
  async getUserActiveSessions(userId?: string): Promise<SessionListItem[]> {
    try {
      const actualUserId =
        userId ?? (await this.authContextService.getCurrentUserId());
      if (!actualUserId) {
        return [];
      }

      // For now, return empty array - would integrate with session store
      // TODO: Implement session store integration
      return [];
    } catch (error) {
      console.error(
        '❌ AuthSessionService getUserActiveSessions error:',
        error
      );
      return [];
    }
  }

  /**
   * ✅ REVOKE: Specific session
   */
  async revokeSession(sessionId: string, reason?: string): Promise<boolean> {
    try {
      // Log the revocation
      await this.auditService.logAuthEvent({
        eventType: 'session_expired',
        eventAction: 'session_revoked',
        eventStatus: 'success',
        eventCategory: 'security',
        eventData: {
          sessionId,
          reason: reason ?? 'manual_revocation',
        },
      });

      console.warn(`✅ AuthSessionService: Session ${sessionId} revoked`);
      return true;
    } catch (error) {
      console.error('❌ AuthSessionService revokeSession error:', error);
      return false;
    }
  }

  /**
   * ✅ REVOKE: All user sessions
   */
  async revokeAllSessions(
    keepCurrent = true
  ): Promise<{ success: boolean; revokedCount: number }> {
    try {
      const userId = await this.authContextService.getCurrentUserId();
      if (!userId) {
        return { success: false, revokedCount: 0 };
      }

      // Log bulk revocation
      await this.auditService.logAuthEvent({
        userId,
        eventType: 'session_expired',
        eventAction: 'bulk_session_revocation',
        eventStatus: 'success',
        eventCategory: 'security',
        eventData: {
          keepCurrent,
          revokedAt: new Date(),
        },
      });

      console.warn(
        `✅ AuthSessionService: All sessions revoked for user ${userId}`
      );
      return { success: true, revokedCount: 0 }; // TODO: Return actual count
    } catch (error) {
      console.error('❌ AuthSessionService revokeAllSessions error:', error);
      return { success: false, revokedCount: 0 };
    }
  }

  /**
   * ✅ UPDATE: Session last accessed time
   */
  async updateLastAccessed(userId?: string): Promise<boolean> {
    try {
      const actualUserId =
        userId ?? (await this.authContextService.getCurrentUserId());
      if (!actualUserId) {
        return false;
      }

      await this.authContextService.updateLastAccess(actualUserId);
      return true;
    } catch (error) {
      console.error('❌ AuthSessionService updateLastAccessed error:', error);
      return false;
    }
  }

  /**
   * ✅ CHECK: If session exists and is valid
   */
  async isSessionValid(): Promise<boolean> {
    try {
      return await this.authContextService.hasValidSession();
    } catch (error) {
      console.error('❌ AuthSessionService isSessionValid error:', error);
      return false;
    }
  }

  /**
   * ✅ GET: Session security info
   */
  async getSessionSecurityInfo(userId?: string): Promise<{
    riskScore: number;
    securityLevel: string;
    deviceInfo: unknown;
    lastAccess: Date | null;
  } | null> {
    try {
      const actualUserId =
        userId ?? (await this.authContextService.getCurrentUserId());
      if (!actualUserId) {
        return null;
      }

      const securityInfo =
        await this.authContextService.getUserSecurityInfo(actualUserId);
      if (!securityInfo) {
        return null;
      }

      return {
        riskScore: securityInfo.riskScore,
        securityLevel: securityInfo.securityLevel,
        deviceInfo: null, // TODO: Get from session store
        lastAccess: securityInfo.lastLoginAt,
      };
    } catch (error) {
      console.error(
        '❌ AuthSessionService getSessionSecurityInfo error:',
        error
      );
      return null;
    }
  }
}
