// packages/auth/src/events.ts - ENTERPRISE AUDIT SERVICE CORRIGIDO

import type { AuthAuditLog, NewAuthAuditLog } from '@workspace/database';
import { authAuditLogs, db, sessions } from '@workspace/database';
import { randomUUID } from 'crypto';
import { and, eq, inArray } from 'drizzle-orm';
import type {
  AuthEventCategory,
  AuthEventStatus,
  AuthEventType,
} from './types';

// ============================================
// ENHANCED AUDIT EVENT INTERFACES
// ============================================

export interface AuditEventData {
  userId?: string | null;
  sessionToken?: string | null;
  organizationId?: string | null;
  eventType: AuthEventType;
  eventAction: string;
  eventStatus?: AuthEventStatus;
  eventCategory?: AuthEventCategory;

  // ✅ ENTERPRISE: Enhanced context
  ipAddress?: string | null;
  userAgent?: string | null;
  deviceFingerprint?: string | null;
  deviceInfo?: Record<string, unknown> | null;

  // ✅ ENTERPRISE: Geolocation
  country?: string | null;
  city?: string | null;
  timezone?: string | null;

  // ✅ ENTERPRISE: Security & risk
  riskScore?: number;
  riskFactors?: string[];
  securityFlags?: Record<string, unknown> | null;

  // ✅ ENTERPRISE: Event details
  eventData?: Record<string, unknown> | null;
  errorCode?: string | null;
  errorMessage?: string | null;

  // ✅ ENTERPRISE: Source & correlation
  source?: string;
  requestId?: string | null;

  // ✅ ENTERPRISE: Processing metadata
  processed?: boolean;
  alertsSent?: Record<string, unknown> | null;
}

// ============================================
// CORE AUDIT SERVICE CLASS
// ============================================

export class EventsAuditServiceClass {
  /**
   * ✅ ACHROMATIC: Enhanced audit event logging
   */
  async logAuthEvent(event: AuditEventData): Promise<void> {
    try {
      const auditLog: NewAuthAuditLog = {
        id: randomUUID(),
        userId: event.userId ?? null,
        sessionToken: event.sessionToken ?? null,
        organizationId: event.organizationId ?? null,

        // Event classification
        eventType: event.eventType,
        eventAction: event.eventAction,
        eventStatus: event.eventStatus ?? 'success',
        eventCategory: event.eventCategory ?? 'auth',

        // Request context
        ipAddress: event.ipAddress ?? null,
        userAgent: event.userAgent ?? null,
        deviceFingerprint: event.deviceFingerprint ?? null,
        deviceInfo: event.deviceInfo ?? null,

        // Geolocation
        country: event.country ?? null,
        city: event.city ?? null,
        timezone: event.timezone ?? null,

        // Security assessment
        riskScore: event.riskScore ?? 0,
        riskFactors: event.riskFactors
          ? JSON.stringify(event.riskFactors)
          : null,
        securityFlags: event.securityFlags ?? null,

        // Event data
        eventData: event.eventData ?? null,
        errorCode: event.errorCode ?? null,
        errorMessage: event.errorMessage ?? null,

        // Metadata
        timestamp: new Date(),
        source: event.source ?? 'web',
        requestId: event.requestId ?? null,
        processed: event.processed ?? false,
        alertsSent: event.alertsSent ?? null,
      };

      await db.insert(authAuditLogs).values(auditLog);

      console.warn(
        `✅ ACHROMATIC: Audit event logged: ${event.eventType}/${event.eventAction} - ${event.eventStatus}`
      );
    } catch (error) {
      console.error('❌ ACHROMATIC: Failed to log audit event:', error);
      // Don't throw - audit logging should never break the main flow
    }
  }

  /**
   * ✅ ENTERPRISE: Batch log multiple events
   */
  async logAuthEventsBatch(events: AuditEventData[]): Promise<void> {
    try {
      const auditLogs: NewAuthAuditLog[] = events.map(event => ({
        id: randomUUID(),
        userId: event.userId ?? null,
        sessionToken: event.sessionToken ?? null,
        organizationId: event.organizationId ?? null,
        eventType: event.eventType,
        eventAction: event.eventAction,
        eventStatus: event.eventStatus ?? 'success',
        eventCategory: event.eventCategory ?? 'auth',
        ipAddress: event.ipAddress ?? null,
        userAgent: event.userAgent ?? null,
        deviceFingerprint: event.deviceFingerprint ?? null,
        deviceInfo: event.deviceInfo ?? null,
        country: event.country ?? null,
        city: event.city ?? null,
        timezone: event.timezone ?? null,
        riskScore: event.riskScore ?? 0,
        riskFactors: event.riskFactors
          ? JSON.stringify(event.riskFactors)
          : null,
        securityFlags: event.securityFlags ?? null,
        eventData: event.eventData ?? null,
        errorCode: event.errorCode ?? null,
        errorMessage: event.errorMessage ?? null,
        timestamp: new Date(),
        source: event.source ?? 'web',
        requestId: event.requestId ?? null,
        processed: event.processed ?? false,
        alertsSent: event.alertsSent ?? null,
      }));

      await db.insert(authAuditLogs).values(auditLogs);

      console.warn(
        `✅ ACHROMATIC: Batch audit events logged: ${events.length} events`
      );
    } catch (error) {
      console.error('❌ ACHROMATIC: Failed to log batch audit events:', error);
    }
  }

  /**
   * ✅ ENTERPRISE: Get user audit trail (CORRIGIDO)
   */
  async getUserAuditTrail(
    userId: string,
    limit = 100,
    eventTypes?: AuthEventType[]
  ): Promise<AuthAuditLog[]> {
    try {
      let whereConditions = eq(authAuditLogs.userId, userId);

      // ✅ CORRIGIDO: Verificar se eventTypeFilter existe antes do and()
      if (eventTypes && eventTypes.length > 0) {
        const eventTypeFilter = inArray(authAuditLogs.eventType, eventTypes);
        const newConditions = and(whereConditions, eventTypeFilter);
        if (newConditions) {
          whereConditions = newConditions;
        }
      }

      return await db
        .select()
        .from(authAuditLogs)
        .where(whereConditions)
        .orderBy(authAuditLogs.timestamp)
        .limit(limit);
    } catch (error) {
      console.error('❌ ACHROMATIC: Error fetching user audit trail:', error);
      return [];
    }
  }


  /**
   * ✅ ENTERPRISE: Get organization audit trail
   */
  async getOrganizationAuditTrail(
    organizationId: string,
    limit = 100
  ): Promise<AuthAuditLog[]> {
    try {
      return await db
        .select()
        .from(authAuditLogs)
        .where(eq(authAuditLogs.organizationId, organizationId))
        .orderBy(authAuditLogs.timestamp)
        .limit(limit);
    } catch (error) {
      console.error(
        '❌ ACHROMATIC: Error fetching organization audit trail:',
        error
      );
      return [];
    }
  }

  /**
   * ✅ ENTERPRISE: Mark events as processed
   */
  async markEventsAsProcessed(eventIds: string[]): Promise<void> {
    if (eventIds.length === 0) return;

    try {
      await db
        .update(authAuditLogs)
        .set({
          processed: true,
        })
        .where(inArray(authAuditLogs.id, eventIds));

      console.warn(
        `✅ ACHROMATIC: ${eventIds.length} events marked as processed`
      );
    } catch (error) {
      console.error('❌ ACHROMATIC: Error marking events as processed:', error);
    }
  }
}

// ============================================
// SINGLETON INSTANCE & CONVENIENCE FUNCTIONS
// ============================================

/**
 * ✅ ACHROMATIC: Convenience function for logging auth events
 */
export async function logAuthEvent(event: AuditEventData): Promise<void> {
  return EventsAuditService.logAuthEvent(event);
}

/**
 * ✅ ENTERPRISE: Enhanced session creation event
 */
export async function onSessionCreated(
  sessionToken: string,
  userId: string,
  context: {
    ipAddress?: string;
    userAgent?: string;
    deviceInfo?: Record<string, unknown>;
    organizationId?: string;
    provider?: string;
    securityLevel?: string;
    riskScore?: number;
    geolocation?: {
      country?: string;
      city?: string;
      timezone?: string;
    };
  } = {}
): Promise<void> {
  await EventsAuditService.logAuthEvent({
    userId,
    sessionToken,
    organizationId: context.organizationId,
    eventType: 'session',
    eventAction: 'create_session',
    eventStatus: 'success',
    eventCategory: 'auth',
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
    deviceInfo: context.deviceInfo,
    country: context.geolocation?.country,
    city: context.geolocation?.city,
    timezone: context.geolocation?.timezone,
    riskScore: context.riskScore ?? 0,
    eventData: {
      provider: context.provider,
      securityLevel: context.securityLevel,
    },
  });
}

/**
 * ✅ ENTERPRISE: Enhanced session revocation event
 */
export async function onSessionRevoked(
  sessionToken: string,
  userId: string,
  reason: string,
  context: {
    revokedBy?: string;
    ipAddress?: string;
    userAgent?: string;
    organizationId?: string;
    forced?: boolean;
  } = {}
): Promise<void> {
  try {
    // ✅ ACHROMATIC: Update session in database
    await db
      .update(sessions)
      .set({
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: reason,
        revokedBy: context.revokedBy ?? userId,
        updatedAt: new Date(),
      })
      .where(eq(sessions.sessionToken, sessionToken));

    // ✅ ENTERPRISE: Log audit event
    await EventsAuditService.logAuthEvent({
      userId,
      sessionToken,
      organizationId: context.organizationId,
      eventType: 'session',
      eventAction: 'revoke_session',
      eventStatus: 'success',
      eventCategory: 'auth',
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      eventData: {
        reason,
        revokedBy: context.revokedBy,
        forced: context.forced ?? false,
      },
    });
  } catch (error) {
    console.error('❌ ACHROMATIC: Error in onSessionRevoked:', error);
    throw error;
  }
}

/**
 * ✅ ENTERPRISE: Enhanced login success event
 */
export async function onUserLogin(
  userId: string,
  context: {
    provider?: string;
    sessionToken?: string;
    organizationId?: string;
    ipAddress?: string;
    userAgent?: string;
    deviceInfo?: Record<string, unknown>;
    securityLevel?: string;
    twoFactorUsed?: boolean;
    riskScore?: number;
    geolocation?: {
      country?: string;
      city?: string;
      timezone?: string;
    };
  } = {}
): Promise<void> {
  await EventsAuditService.logAuthEvent({
    userId,
    sessionToken: context.sessionToken,
    organizationId: context.organizationId,
    eventType: 'login',
    eventAction: 'authenticate_success',
    eventStatus: 'success',
    eventCategory: 'auth',
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
    deviceInfo: context.deviceInfo,
    country: context.geolocation?.country,
    city: context.geolocation?.city,
    timezone: context.geolocation?.timezone,
    riskScore: context.riskScore ?? 0,
    eventData: {
      provider: context.provider,
      securityLevel: context.securityLevel,
      twoFactorUsed: context.twoFactorUsed ?? false,
    },
  });
}

/**
 * ✅ ENTERPRISE: Enhanced logout event
 */
export async function onUserLogout(
  userId: string,
  sessionToken: string,
  context: {
    organizationId?: string;
    ipAddress?: string;
    userAgent?: string;
    reason?: string;
  } = {}
): Promise<void> {
  await EventsAuditService.logAuthEvent({
    userId,
    sessionToken,
    organizationId: context.organizationId,
    eventType: 'logout',
    eventAction: 'sign_out',
    eventStatus: 'success',
    eventCategory: 'auth',
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
    eventData: {
      reason: context.reason ?? 'user_initiated',
    },
  });
}

/**
 * ✅ ENTERPRISE: Login failure event
 */
export async function onLoginFailure(context: {
  userId?: string;
  email?: string;
  reason: string;
  errorCode?: string;
  provider?: string;
  ipAddress?: string;
  userAgent?: string;
  riskScore?: number;
  securityFlags?: string[];
}): Promise<void> {
  await EventsAuditService.logAuthEvent({
    userId: context.userId,
    eventType: 'login',
    eventAction: 'authenticate_failure',
    eventStatus: 'failure',
    eventCategory: 'auth',
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
    riskScore: context.riskScore ?? 0,
    riskFactors: context.securityFlags,
    errorCode: context.errorCode,
    errorMessage: context.reason,
    eventData: {
      email: context.email,
      provider: context.provider,
      reason: context.reason,
    },
  });
}

/**
 * ✅ ENTERPRISE: Security alert event
 */
export async function onSecurityAlert(
  userId: string,
  alertType: string,
  context: {
    severity?: 'low' | 'medium' | 'high' | 'critical';
    sessionToken?: string;
    organizationId?: string;
    ipAddress?: string;
    userAgent?: string;
    details?: Record<string, unknown>;
    riskScore?: number;
    securityFlags?: string[];
  } = {}
): Promise<void> {
  await EventsAuditService.logAuthEvent({
    userId,
    sessionToken: context.sessionToken,
    organizationId: context.organizationId,
    eventType: 'login',
    eventAction: alertType,
    eventStatus: 'failure',
    eventCategory: 'security',
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
    riskScore: context.riskScore ?? 50,
    riskFactors: context.securityFlags,
    securityFlags: {
      severity: context.severity ?? 'medium',
      alertType,
    },
    eventData: context.details,
  });
}

// ============================================
// EXPORTS
// ============================================

// Criar instância da classe
const eventsAuditServiceInstance = new EventsAuditServiceClass();

// Export named para compatibilidade com imports existentes
export const EventsAuditService = eventsAuditServiceInstance;

// Export alternativo com nome original
export { eventsAuditServiceInstance as auditService };

// Export default para compatibilidade
export default eventsAuditServiceInstance;
