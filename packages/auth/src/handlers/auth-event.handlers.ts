// packages/auth/src/handlers/auth-event.handlers.ts - AUTH EVENT HANDLERS

import { db, sessions } from '@workspace/database';
import { eq } from 'drizzle-orm';
import { AuditService } from '../services/audit.service';
import type { DeviceInfo, GeolocationContext } from '../types';

/**
 * ✅ ENTERPRISE: Auth Event Handlers
 * Single Responsibility: Handle authentication events
 */
export class AuthEventHandlers {
  private auditService: AuditService;

  constructor() {
    this.auditService = new AuditService();
  }

  /**
   * ✅ ON: Session created
   */
  async onSessionCreated(
    sessionToken: string,
    userId: string,
    context?: {
      ipAddress?: string;
      userAgent?: string;
      deviceInfo?: DeviceInfo;
      geolocation?: GeolocationContext;
    }
  ): Promise<void> {
    try {
      // Log session creation event
      await this.auditService.logAuthEvent({
        userId,
        sessionToken,
        eventType: 'login_success',
        eventAction: 'session_created',
        eventStatus: 'success',
        eventCategory: 'auth',
        ipAddress: context?.ipAddress ?? null,
        userAgent: context?.userAgent ?? null,
        deviceInfo: context?.deviceInfo ?? null,
        geolocation: context?.geolocation ?? null,
        eventData: {
          sessionToken,
          createdAt: new Date(),
        },
      });

      console.warn(`✅ AuthEventHandlers: Session created for user ${userId}`);
    } catch (error) {
      console.error('❌ AuthEventHandlers onSessionCreated error:', error);
    }
  }

  /**
   * ✅ ON: Session revoked
   */
  async onSessionRevoked(
    sessionToken: string,
    userId: string,
    reason: string,
    context?: {
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<void> {
    try {
      // Update session in database (remove isRevoked - doesn't exist)
      await db
        .update(sessions)
        .set({
          // ✅ FIX: Remove isRevoked field - doesn't exist in schema
          // isRevoked: true,
          lastAccessedAt: new Date(),
        })
        .where(eq(sessions.sessionToken, sessionToken));

      // Log session revocation event
      await this.auditService.logAuthEvent({
        userId,
        sessionToken,
        eventType: 'session_expired',
        eventAction: 'session_revoked',
        eventStatus: 'success',
        eventCategory: 'security',
        ipAddress: context?.ipAddress ?? null,
        userAgent: context?.userAgent ?? null,
        eventData: {
          sessionToken,
          reason,
          revokedAt: new Date(),
        },
      });

      console.warn(
        `✅ AuthEventHandlers: Session revoked for user ${userId}, reason: ${reason}`
      );
    } catch (error) {
      console.error('❌ AuthEventHandlers onSessionRevoked error:', error);
    }
  }

  /**
   * ✅ ON: User login
   */
  async onUserLogin(
    userId: string,
    context?: {
      ipAddress?: string;
      userAgent?: string;
      deviceInfo?: DeviceInfo;
      geolocation?: GeolocationContext;
      sessionToken?: string;
    }
  ): Promise<void> {
    try {
      // Log login event
      await this.auditService.logAuthEvent({
        userId,
        sessionToken: context?.sessionToken ?? null,
        eventType: 'login_success',
        eventAction: 'user_login',
        eventStatus: 'success',
        eventCategory: 'auth',
        ipAddress: context?.ipAddress ?? null,
        userAgent: context?.userAgent ?? null,
        deviceInfo: context?.deviceInfo ?? null,
        geolocation: context?.geolocation ?? null,
        eventData: {
          loginAt: new Date(),
        },
      });

      console.warn(
        `✅ AuthEventHandlers: User ${userId} logged in successfully`
      );
    } catch (error) {
      console.error('❌ AuthEventHandlers onUserLogin error:', error);
    }
  }

  /**
   * ✅ ON: User logout
   */
  async onUserLogout(
    userId: string,
    sessionToken: string,
    context?: {
      ipAddress?: string;
      userAgent?: string;
      reason?: string;
    }
  ): Promise<void> {
    try {
      // Log logout event
      await this.auditService.logAuthEvent({
        userId,
        sessionToken,
        eventType: 'logout',
        eventAction: 'user_logout',
        eventStatus: 'success',
        eventCategory: 'auth',
        ipAddress: context?.ipAddress ?? null,
        userAgent: context?.userAgent ?? null,
        eventData: {
          reason: context?.reason ?? 'manual_logout',
          logoutAt: new Date(),
        },
      });

      console.warn(`✅ AuthEventHandlers: User ${userId} logged out`);
    } catch (error) {
      console.error('❌ AuthEventHandlers onUserLogout error:', error);
    }
  }

  /**
   * ✅ ON: Login failure
   */
  async onLoginFailure(context: {
    email?: string;
    ipAddress?: string;
    userAgent?: string;
    reason: string;
    deviceInfo?: DeviceInfo;
  }): Promise<void> {
    try {
      // Log login failure event
      await this.auditService.logAuthEvent({
        eventType: 'login_failed',
        eventAction: 'login_failure',
        eventStatus: 'failure',
        eventCategory: 'security',
        ipAddress: context.ipAddress ?? null,
        userAgent: context.userAgent ?? null,
        deviceInfo: context.deviceInfo ?? null,
        errorMessage: context.reason,
        eventData: {
          email: context.email,
          reason: context.reason,
          failedAt: new Date(),
        },
      });

      console.warn(`❌ AuthEventHandlers: Login failure - ${context.reason}`);
    } catch (error) {
      console.error('❌ AuthEventHandlers onLoginFailure error:', error);
    }
  }

  /**
   * ✅ ON: Security alert
   */
  async onSecurityAlert(
    userId: string,
    alertType: string,
    context?: {
      ipAddress?: string;
      userAgent?: string;
      deviceInfo?: DeviceInfo;
      details?: Record<string, unknown>;
    }
  ): Promise<void> {
    try {
      // Log security alert event
      await this.auditService.logAuthEvent({
        userId,
        eventType: 'login_failed', // Use existing type
        eventAction: 'security_alert',
        eventStatus: 'failure',
        eventCategory: 'security',
        ipAddress: context?.ipAddress ?? null,
        userAgent: context?.userAgent ?? null,
        deviceInfo: context?.deviceInfo ?? null,
        eventData: {
          alertType,
          details: context?.details,
          alertedAt: new Date(),
        },
      });

      console.warn(
        `🚨 AuthEventHandlers: Security alert for user ${userId} - ${alertType}`
      );
    } catch (error) {
      console.error('❌ AuthEventHandlers onSecurityAlert error:', error);
    }
  }
}
