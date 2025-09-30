// packages/auth/src/audit.ts - ACHROMATIC ENTERPRISE AUDIT SERVICE CORRIGIDO

import { authAuditLogs, db, type NewAuthAuditLog } from '@workspace/database';
import { randomUUID } from 'crypto';
import { and, count, desc, eq, gte, inArray, lte } from 'drizzle-orm';
import type {
  AuditQueryFilters,
  AuditQueryResult,
  AuthEventCategory,
  AuthEventStatus,
  AuthEventType,
  DeviceInfo,
  DeviceType,
  EnterpriseAuditEvent,
  GeolocationContext,
} from './types';

// ============================================
// AUDIT SERVICE CLASS
// ============================================

export class AuditServiceClass {
  /**
   * ✅ ACHROMATIC: Log enterprise audit event with full context
   */
  async logAuthEvent(event: Partial<EnterpriseAuditEvent>): Promise<void> {
    try {
      const auditLog: NewAuthAuditLog = {
        id: event.id ?? randomUUID(),
        userId: event.userId ?? null,
        sessionToken: event.sessionToken ?? null,
        organizationId: event.organizationId ?? null,

        // ✅ ENTERPRISE: Event classification
        eventType: event.eventType ?? 'login',
        eventAction: event.eventAction ?? 'unknown',
        eventStatus: event.eventStatus ?? 'success',
        eventCategory: event.eventCategory ?? 'auth',

        // ✅ ENTERPRISE: Request context
        ipAddress: event.ipAddress ?? null,
        userAgent: event.userAgent ?? null,
        deviceFingerprint: event.deviceInfo?.fingerprint ?? null,
        deviceInfo: event.deviceInfo
          ? {
              name: event.deviceInfo.name,
              type: event.deviceInfo.type,
              platform: event.deviceInfo.platform,
              browser: event.deviceInfo.browser,
              os: event.deviceInfo.os,
            }
          : null,

        // ✅ ENTERPRISE: Geolocation
        country: event.geolocation?.country ?? null,
        city: event.geolocation?.city ?? null,
        timezone: event.geolocation?.timezone ?? null,

        // ✅ ENTERPRISE: Security assessment
        riskScore: event.riskScore ?? 0,
        riskFactors: event.riskFactors
          ? JSON.stringify(event.riskFactors)
          : null,
        securityFlags: event.securityFlags ?? null,

        // ✅ ENTERPRISE: Event data
        eventData: event.eventData ?? null,
        errorCode: event.errorCode ?? null,
        errorMessage: event.errorMessage ?? null,

        // ✅ ENTERPRISE: Metadata
        timestamp: event.timestamp ?? new Date(),
        source: event.source ?? 'web',
        requestId: event.requestId ?? null,
        processed: event.processed ?? false,
        alertsSent: event.alertsSent ?? null,
      };

      await db.insert(authAuditLogs).values(auditLog);

      // ✅ ENTERPRISE: Log success (but don't spam console)
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `✅ ACHROMATIC: Audit logged: ${event.eventType}/${event.eventAction} - ${event.eventStatus}`
        );
      }
    } catch (error) {
      console.error('❌ ACHROMATIC: Failed to log audit event:', error);
      // ✅ CRITICAL: Never throw - audit logging must never break main flow
    }
  }

  /**
   * ✅ ENTERPRISE: Batch log multiple audit events
   */
  async logAuthEventsBatch(
    events: Partial<EnterpriseAuditEvent>[]
  ): Promise<void> {
    if (events.length === 0) return;

    try {
      const auditLogs: NewAuthAuditLog[] = events.map(event => ({
        id: event.id ?? randomUUID(),
        userId: event.userId ?? null,
        sessionToken: event.sessionToken ?? null,
        organizationId: event.organizationId ?? null,
        eventType: event.eventType ?? 'login',
        eventAction: event.eventAction ?? 'unknown',
        eventStatus: event.eventStatus ?? 'success',
        eventCategory: event.eventCategory ?? 'auth',
        ipAddress: event.ipAddress ?? null,
        userAgent: event.userAgent ?? null,
        deviceFingerprint: event.deviceInfo?.fingerprint ?? null,
        deviceInfo: event.deviceInfo
          ? {
              name: event.deviceInfo.name,
              type: event.deviceInfo.type,
              platform: event.deviceInfo.platform,
              browser: event.deviceInfo.browser,
              os: event.deviceInfo.os,
            }
          : null,
        country: event.geolocation?.country ?? null,
        city: event.geolocation?.city ?? null,
        timezone: event.geolocation?.timezone ?? null,
        riskScore: event.riskScore ?? 0,
        riskFactors: event.riskFactors
          ? JSON.stringify(event.riskFactors)
          : null,
        securityFlags: event.securityFlags ?? null,
        eventData: event.eventData ?? null,
        errorCode: event.errorCode ?? null,
        errorMessage: event.errorMessage ?? null,
        timestamp: event.timestamp ?? new Date(),
        source: event.source ?? 'web',
        requestId: event.requestId ?? null,
        processed: event.processed ?? false,
        alertsSent: event.alertsSent ?? null,
      }));

      await db.insert(authAuditLogs).values(auditLogs);

      console.warn(
        `✅ ACHROMATIC: Batch audit logged: ${events.length} events`
      );
    } catch (error) {
      console.error('❌ ACHROMATIC: Failed to batch log audit events:', error);
    }
  }

  /**
   * ✅ ENTERPRISE: Query audit events with advanced filtering
   */
  async queryAuditEvents(
    filters: AuditQueryFilters = {}
  ): Promise<AuditQueryResult> {
    try {
      const {
        userId,
        organizationId,
        sessionToken,
        eventTypes,
        eventStatuses,
        eventCategories,
        startDate,
        endDate,
        minRiskScore,
        maxRiskScore,
        ipAddress,
        country,
        limit = 100,
        offset = 0,
      } = filters;

      // ✅ ENTERPRISE: Build dynamic where conditions
      const whereConditions = [];

      if (userId) whereConditions.push(eq(authAuditLogs.userId, userId));
      if (organizationId)
        whereConditions.push(eq(authAuditLogs.organizationId, organizationId));
      if (sessionToken)
        whereConditions.push(eq(authAuditLogs.sessionToken, sessionToken));
      if (ipAddress)
        whereConditions.push(eq(authAuditLogs.ipAddress, ipAddress));
      if (country) whereConditions.push(eq(authAuditLogs.country, country));

      // ✅ CORRIGIDO: Array filters
      if (eventTypes && eventTypes.length > 0) {
        whereConditions.push(inArray(authAuditLogs.eventType, eventTypes));
      }
      if (eventStatuses && eventStatuses.length > 0) {
        whereConditions.push(inArray(authAuditLogs.eventStatus, eventStatuses));
      }
      if (eventCategories && eventCategories.length > 0) {
        whereConditions.push(
          inArray(authAuditLogs.eventCategory, eventCategories)
        );
      }

      if (startDate)
        whereConditions.push(gte(authAuditLogs.timestamp, startDate));
      if (endDate) whereConditions.push(lte(authAuditLogs.timestamp, endDate));

      if (minRiskScore !== undefined) {
        whereConditions.push(gte(authAuditLogs.riskScore, minRiskScore));
      }
      if (maxRiskScore !== undefined) {
        whereConditions.push(lte(authAuditLogs.riskScore, maxRiskScore));
      }

      // ✅ ENTERPRISE: Execute query with pagination
      const query = db
        .select({
          id: authAuditLogs.id,
          userId: authAuditLogs.userId,
          sessionToken: authAuditLogs.sessionToken,
          organizationId: authAuditLogs.organizationId,
          eventType: authAuditLogs.eventType,
          eventAction: authAuditLogs.eventAction,
          eventStatus: authAuditLogs.eventStatus,
          eventCategory: authAuditLogs.eventCategory,
          ipAddress: authAuditLogs.ipAddress,
          userAgent: authAuditLogs.userAgent,
          deviceFingerprint: authAuditLogs.deviceFingerprint,
          deviceInfo: authAuditLogs.deviceInfo,
          country: authAuditLogs.country,
          city: authAuditLogs.city,
          timezone: authAuditLogs.timezone,
          riskScore: authAuditLogs.riskScore,
          riskFactors: authAuditLogs.riskFactors,
          securityFlags: authAuditLogs.securityFlags,
          eventData: authAuditLogs.eventData,
          errorCode: authAuditLogs.errorCode,
          errorMessage: authAuditLogs.errorMessage,
          timestamp: authAuditLogs.timestamp,
          source: authAuditLogs.source,
          requestId: authAuditLogs.requestId,
          processed: authAuditLogs.processed,
          alertsSent: authAuditLogs.alertsSent,
        })
        .from(authAuditLogs)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(desc(authAuditLogs.timestamp))
        .limit(limit)
        .offset(offset);

      const events = await query;

      // ✅ CORRIGIDO: Linha 249 - Destructuring seguro
      const countResult = await db
        .select({ totalCount: count() })
        .from(authAuditLogs)
        .where(
          whereConditions.length > 0 ? and(...whereConditions) : undefined
        );

      const totalCount = countResult[0]?.totalCount ?? 0;

      // ✅ CORRIGIDO: Linha 257 - Transform com DeviceType correto
      const enterpriseEvents: EnterpriseAuditEvent[] = events.map(event => ({
        ...event,
        securityFlags: event.securityFlags
          ? (event.securityFlags as Record<string, unknown>)
          : null,
        eventData: event.eventData
          ? (event.eventData as Record<string, unknown>)
          : null,
        alertsSent: event.alertsSent
          ? (event.alertsSent as Record<string, unknown>)
          : null,
        eventType: event.eventType as AuthEventType,
        eventStatus: event.eventStatus as AuthEventStatus,
        eventCategory: event.eventCategory as AuthEventCategory,
        deviceInfo: event.deviceInfo
          ? {
              name: (event.deviceInfo as Record<string, unknown>).name
                ? ((event.deviceInfo as Record<string, unknown>).name as string)
                : null,
              type: ((event.deviceInfo as Record<string, unknown>).type as DeviceType) || 'unknown',
              fingerprint: event.deviceFingerprint,
              platform: (event.deviceInfo as Record<string, unknown>).platform
                ? ((event.deviceInfo as Record<string, unknown>).platform as string)
                : null,
              browser: (event.deviceInfo as Record<string, unknown>).browser
                ? ((event.deviceInfo as Record<string, unknown>).browser as string)
                : null,
              os: (event.deviceInfo as Record<string, unknown>).os
                ? ((event.deviceInfo as Record<string, unknown>).os as string)
                : null,
            } as DeviceInfo
          : null,
        geolocation: {
          country: event.country,
          city: event.city,
          timezone: event.timezone,
        },
        riskScore: event.riskScore ?? 0,
        riskFactors: event.riskFactors
          ? typeof event.riskFactors === 'string'
            ? JSON.parse(event.riskFactors)
            : event.riskFactors
          : null,
      }));

      return {
        events: enterpriseEvents,
        totalCount: Number(totalCount),
        hasMore: offset + limit < Number(totalCount),
        nextCursor:
          offset + limit < Number(totalCount)
            ? Buffer.from(`${offset + limit}`).toString('base64')
            : undefined,
      };
    } catch (error) {
      console.error('❌ ACHROMATIC: Error querying audit events:', error);
      return {
        events: [],
        totalCount: 0,
        hasMore: false,
      };
    }
  }

  /**
   * ✅ ENTERPRISE: Get user audit trail with enhanced data
   */
  async getUserAuditTrail(
    userId: string,
    options: {
      limit?: number;
      eventTypes?: AuthEventType[];
      startDate?: Date;
      endDate?: Date;
    } = {}
  ): Promise<EnterpriseAuditEvent[]> {
    const filters: AuditQueryFilters = {
      userId,
      ...options,
    };

    const result = await this.queryAuditEvents(filters);
    return result.events;
  }

  /**
   * ✅ ENTERPRISE: Get organization audit trail
   */
  async getOrganizationAuditTrail(
    organizationId: string,
    options: {
      limit?: number;
      eventTypes?: AuthEventType[];
      startDate?: Date;
      endDate?: Date;
    } = {}
  ): Promise<EnterpriseAuditEvent[]> {
    const filters: AuditQueryFilters = {
      organizationId,
      ...options,
    };

    const result = await this.queryAuditEvents(filters);
    return result.events;
  }

  /**
   * ✅ ENTERPRISE: Get security events (high risk)
   */
  async getSecurityEvents(
    options: {
      organizationId?: string;
      userId?: string;
      minRiskScore?: number;
      limit?: number;
      startDate?: Date;
      endDate?: Date;
    } = {}
  ): Promise<EnterpriseAuditEvent[]> {
    const filters: AuditQueryFilters = {
      eventCategories: ['security'],
      minRiskScore: options.minRiskScore ?? 50,
      organizationId: options.organizationId,
      userId: options.userId,
      limit: options.limit,
      startDate: options.startDate,
      endDate: options.endDate,
    };

    const result = await this.queryAuditEvents(filters);
    return result.events;
  }

  /**
   * ✅ ENTERPRISE: Mark events as processed
   */
  async markEventsAsProcessed(
    eventIds: string[],
    alertsSent?: Record<string, unknown>
  ): Promise<void> {
    if (eventIds.length === 0) return;

    try {
      await db
        .update(authAuditLogs)
        .set({
          processed: true,
          alertsSent,
        })
        .where(inArray(authAuditLogs.id, eventIds));

      console.warn(
        `✅ ACHROMATIC: ${eventIds.length} events marked as processed`
      );
    } catch (error) {
      console.error('❌ ACHROMATIC: Error marking events as processed:', error);
    }
  }

  /**
   * ✅ ENTERPRISE: Get audit statistics
   */
  async getAuditStatistics(
    organizationId?: string,
    timeRange: { start: Date; end: Date } = {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date(),
    }
  ): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsByStatus: Record<string, number>;
    riskDistribution: Record<string, number>;
    topCountries: Array<{ country: string; count: number }>;
    topDeviceTypes: Array<{ deviceType: string; count: number }>;
  }> {
    try {
      const whereConditions = [
        gte(authAuditLogs.timestamp, timeRange.start),
        lte(authAuditLogs.timestamp, timeRange.end),
      ];

      if (organizationId) {
        whereConditions.push(eq(authAuditLogs.organizationId, organizationId));
      }

      // ✅ CORRIGIDO: Linha 446 - Destructuring seguro
      const totalResult = await db
        .select({ totalEvents: count() })
        .from(authAuditLogs)
        .where(and(...whereConditions));

      const totalEvents = totalResult[0]?.totalEvents ?? 0;

      // ✅ ENTERPRISE: Events by type
      const eventsByTypeResult = await db
        .select({
          eventType: authAuditLogs.eventType,
          count: count(),
        })
        .from(authAuditLogs)
        .where(and(...whereConditions))
        .groupBy(authAuditLogs.eventType);

      const eventsByType = eventsByTypeResult.reduce(
        (acc, row) => {
          acc[row.eventType] = Number(row.count);
          return acc;
        },
        {} as Record<string, number>
      );

      // ✅ ENTERPRISE: Events by status
      const eventsByStatusResult = await db
        .select({
          eventStatus: authAuditLogs.eventStatus,
          count: count(),
        })
        .from(authAuditLogs)
        .where(and(...whereConditions))
        .groupBy(authAuditLogs.eventStatus);

      const eventsByStatus = eventsByStatusResult.reduce(
        (acc, row) => {
          acc[row.eventStatus] = Number(row.count);
          return acc;
        },
        {} as Record<string, number>
      );

      return {
        totalEvents: Number(totalEvents),
        eventsByType,
        eventsByStatus,
        riskDistribution: {}, // TODO: Implement risk distribution
        topCountries: [], // TODO: Implement top countries
        topDeviceTypes: [], // TODO: Implement top device types
      };
    } catch (error) {
      console.error('❌ ACHROMATIC: Error getting audit statistics:', error);
      return {
        totalEvents: 0,
        eventsByType: {},
        eventsByStatus: {},
        riskDistribution: {},
        topCountries: [],
        topDeviceTypes: [],
      };
    }
  }
}

// ============================================
// SINGLETON INSTANCE & CONVENIENCE FUNCTIONS
// ============================================

/**
 * ✅ ACHROMATIC: Log authentication event
 */
export async function logAuthEvent(
  event: Partial<EnterpriseAuditEvent>
): Promise<void> {
  return AuditService.logAuthEvent(event);
}

/**
 * ✅ ENTERPRISE: Log successful login
 */
export async function logLoginSuccess(
  userId: string,
  context: {
    sessionToken?: string;
    organizationId?: string;
    provider?: string;
    ipAddress?: string;
    userAgent?: string;
    deviceInfo?: DeviceInfo;
    geolocation?: GeolocationContext;
    riskScore?: number;
  } = {}
): Promise<void> {
  return AuditService.logAuthEvent({
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
    geolocation: context.geolocation,
    riskScore: context.riskScore ?? 0,
    eventData: {
      provider: context.provider ?? 'credentials',
    },
  });
}

/**
 * ✅ ENTERPRISE: Log failed login
 */
export async function logLoginFailure(context: {
  userId?: string;
  email?: string;
  reason: string;
  errorCode?: string;
  organizationId?: string;
  provider?: string;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: DeviceInfo;
  riskScore?: number;
  riskFactors?: string[];
}): Promise<void> {
  return AuditService.logAuthEvent({
    userId: context.userId,
    organizationId: context.organizationId,
    eventType: 'login',
    eventAction: 'authenticate_failure',
    eventStatus: 'failure',
    eventCategory: 'auth',
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
    deviceInfo: context.deviceInfo,
    riskScore: context.riskScore ?? 30,
    riskFactors: context.riskFactors ?? ['authentication_failure'],
    errorCode: context.errorCode,
    errorMessage: context.reason,
    eventData: {
      email: context.email,
      provider: context.provider ?? 'credentials',
      reason: context.reason,
    },
  });
}

/**
 * ✅ ENTERPRISE: Log security alert
 */
export async function logSecurityAlert(
  userId: string,
  alertType: string,
  context: {
    severity?: 'low' | 'medium' | 'high' | 'critical';
    sessionToken?: string;
    organizationId?: string;
    ipAddress?: string;
    userAgent?: string;
    deviceInfo?: DeviceInfo;
    details?: Record<string, unknown>;
    riskScore?: number;
    riskFactors?: string[];
  } = {}
): Promise<void> {
  const severityToRiskScore = {
    low: 25,
    medium: 50,
    high: 75,
    critical: 95,
  };

  return AuditService.logAuthEvent({
    userId,
    sessionToken: context.sessionToken,
    organizationId: context.organizationId,
    eventType: 'login',
    eventAction: alertType,
    eventStatus: 'failure',
    eventCategory: 'security',
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
    deviceInfo: context.deviceInfo,
    riskScore:
      context.riskScore ?? severityToRiskScore[context.severity ?? 'medium'],
    riskFactors: context.riskFactors ?? [alertType],
    securityFlags: {
      severity: context.severity ?? 'medium',
      alertType,
      automated: true,
    },
    eventData: context.details,
  });
}

// ============================================
// EXPORTS
// ============================================

// Criar instância da classe
const auditServiceInstance = new AuditServiceClass();

// Export named para compatibilidade com imports existentes
export const AuditService = auditServiceInstance;

// Export alternativo com nome original
export { auditServiceInstance as auditService };

// Export default para compatibilidade
export default auditServiceInstance;
