// packages/auth/src/services/sign-out.service.ts - SIGN OUT SERVICE (LIB ACTIONS COMPATIBLE)

import { AuditService } from './audit.service';
import { AuthContextService } from './auth-context.service';

/**
 * ✅ ENTERPRISE: Sign Out Options (compatible with lib/actions)
 */
export interface SignOutOptions {
  revokeAllSessions?: boolean;
  reason?: string;
  redirectTo?: string; // ✅ ADD: For lib/actions compatibility
}

/**
 * ✅ ENTERPRISE: Sign Out Result (compatible with lib/actions)
 */
export interface SignOutResult {
  success: boolean;
  error?: string;
  redirectUrl?: string; // ✅ ADD: For lib/actions compatibility
}

/**
 * ✅ ENTERPRISE: Sign Out Service (Complete)
 */
export class SignOutService {
  private authContextService: AuthContextService;
  private auditService: AuditService;

  constructor() {
    this.authContextService = new AuthContextService();
    this.auditService = new AuditService();
  }

  /**
   * ✅ SIGN OUT: Current user (updated return type)
   */
  async signOut(options: SignOutOptions = {}): Promise<SignOutResult> {
    try {
      const authContext =
        await this.authContextService.getOptionalAuthContext();

      if (!authContext) {
        return {
          success: false,
          error: 'No active session found',
        };
      }

      const userId = authContext.user.id;

      await this.auditService.logAuthEvent({
        userId,
        eventType: 'logout',
        eventAction: 'user_signout',
        eventStatus: 'success',
        eventCategory: 'auth',
        eventData: {
          reason: options.reason ?? 'manual_signout',
          revokeAllSessions: options.revokeAllSessions ?? false,
          signedOutAt: new Date(),
        },
      });

      console.warn(`✅ SignOutService: User ${userId} signed out successfully`);

      return {
        success: true,
        redirectUrl: options.redirectTo ?? '/auth/signin',
      };
    } catch (error) {
      console.error('❌ SignOutService signOut error:', error);

      await this.auditService.logAuthEvent({
        eventType: 'logout',
        eventAction: 'signout_failed',
        eventStatus: 'error',
        eventCategory: 'auth',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        eventData: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      return {
        success: false,
        error: 'Sign out failed',
      };
    }
  }

  /**
   * ✅ SIGN OUT: User (single parameter for lib/actions compatibility)
   */
  async signOutUser(options: SignOutOptions = {}): Promise<SignOutResult> {
    return this.signOut(options);
  }

  /**
   * ✅ SIGN OUT: For security (single parameter for lib/actions compatibility)
   */
  async signOutForSecurity(reason: string): Promise<SignOutResult> {
    return this.signOut({ reason, revokeAllSessions: true });
  }

  /**
   * ✅ REVOKE: All user sessions
   */
  async revokeAllUserSessions(
    userId: string,
    reason?: string
  ): Promise<boolean> {
    try {
      await this.auditService.logAuthEvent({
        userId,
        eventType: 'session_expired',
        eventAction: 'bulk_session_revocation',
        eventStatus: 'success',
        eventCategory: 'security',
        eventData: {
          reason: reason ?? 'admin_revocation',
          revokedAt: new Date(),
        },
      });

      console.warn(
        `✅ SignOutService: All sessions revoked for user ${userId}`
      );
      return true;
    } catch (error) {
      console.error('❌ SignOutService revokeAllUserSessions error:', error);
      return false;
    }
  }

  /**
   * ✅ SIGN OUT: All devices
   */
  async signOutAllDevices(reason?: string): Promise<SignOutResult> {
    try {
      const authContext =
        await this.authContextService.getOptionalAuthContext();

      if (!authContext) {
        return {
          success: false,
          error: 'No active session found',
        };
      }

      const userId = authContext.user.id;
      const revoked = await this.revokeAllUserSessions(userId, reason);

      if (revoked) {
        return {
          success: true,
          redirectUrl: '/auth/signin',
        };
      } else {
        return {
          success: false,
          error: 'Failed to revoke sessions',
        };
      }
    } catch (error) {
      console.error('❌ SignOutService signOutAllDevices error:', error);
      return {
        success: false,
        error: 'Sign out from all devices failed',
      };
    }
  }
}
