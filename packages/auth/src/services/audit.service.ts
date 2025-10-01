// packages/auth/src/services/audit.service.ts - SIMPLIFIED AUDIT SERVICE

import { authAuditLogs, db } from '@workspace/database';
import { randomUUID } from 'crypto';
import { and, count, desc, eq, gte, lte } from 'drizzle-orm';
import type {
  AuditQueryFilters,
  AuditQueryResult,
  AuthEventCategory,
  AuthEventType,
  DeviceInfo,
  EnterpriseAuditEvent,
  GeolocationContext,
} from '../types';

/**
 * ✅ ENTERPRISE: Simplified Audit Service
 * Single Responsibility: Basic audit logging compatible with DB schema
 */
export class AuditService {
  /**
   * ✅ LOG: Single audit event (minimal compatible version)
   */
  async logAuthEvent(event: Partial<EnterpriseAuditEvent>): Promise<void> {
    try {
      // Mapear eventType para o schema do banco
      const eventType = this.mapEventTypeToSchema(event.eventType);

      // Use minimal fields that exist in the database
      const auditLog = {
        eventType,
        success: event.eventStatus === 'success',
        userId: (event.userId as string) ?? null,
        organizationId: (event.organizationId as string) ?? null,
        ipAddress: (event.ipAddress as string) ?? null,
        userAgent: (event.userAgent as string) ?? null,
        deviceId: event.deviceInfo?.fingerprint ?? null,
        location: this.formatLocation(event.geolocation ?? null),
        errorMessage: (event.errorMessage as string) ?? null,
        metadata: this.buildMetadata(event),
        createdAt: new Date(),
      };

      await db.insert(authAuditLogs).values(auditLog);

      if (process.env.NODE_ENV === 'development') {
        console.warn(`✅ AuditService: ${event.eventType} logged`);
      }
    } catch (error) {
      console.error('❌ AuditService logAuthEvent error:', error);
      // Never throw - audit logging must never break main flow
    }
  }

  /**
   * ✅ LOG: Batch audit events
   */
  async logAuthEventsBatch(
    events: Partial<EnterpriseAuditEvent>[]
  ): Promise<void> {
    if (events.length === 0) return;

    try {
      const auditLogs = events.map(event => ({
        eventType: this.mapEventTypeToSchema(event.eventType),
        success: event.eventStatus === 'success',
        userId: (event.userId as string) ?? null,
        organizationId: (event.organizationId as string) ?? null,
        ipAddress: (event.ipAddress as string) ?? null,
        userAgent: (event.userAgent as string) ?? null,
        deviceId: event.deviceInfo?.fingerprint ?? null,
        location: this.formatLocation(event.geolocation ?? null),
        errorMessage: (event.errorMessage as string) ?? null,
        metadata: this.buildMetadata(event),
        createdAt: new Date(),
      }));

      await db.insert(authAuditLogs).values(auditLogs);
      console.warn(`✅ AuditService: Batch logged ${events.length} events`);
    } catch (error) {
      console.error('❌ AuditService logAuthEventsBatch error:', error);
    }
  }

  /**
   * ✅ QUERY: Audit events with filtering
   */
  async queryAuditEvents(
    filters: AuditQueryFilters = {}
  ): Promise<AuditQueryResult> {
    try {
      const {
        userId,
        organizationId,
        startDate,
        endDate,
        limit = 100,
        offset = 0,
      } = filters;

      // Build where conditions
      const whereConditions = [];

      if (userId) whereConditions.push(eq(authAuditLogs.userId, userId));
      if (organizationId)
        whereConditions.push(eq(authAuditLogs.organizationId, organizationId));
      if (startDate)
        whereConditions.push(gte(authAuditLogs.createdAt, startDate));
      if (endDate) whereConditions.push(lte(authAuditLogs.createdAt, endDate));

      // Execute query
      const events = await db
        .select()
        .from(authAuditLogs)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(desc(authAuditLogs.createdAt))
        .limit(limit)
        .offset(offset);

      // Get total count
      const countResult = await db
        .select({ totalCount: count() })
        .from(authAuditLogs)
        .where(
          whereConditions.length > 0 ? and(...whereConditions) : undefined
        );

      const totalCount = Number(countResult[0]?.totalCount ?? 0);

      // Transform to enterprise format
      const enterpriseEvents = events.map(event =>
        this.transformDatabaseEventToEnterprise(event)
      );

      return {
        events: enterpriseEvents,
        totalCount,
        hasMore: offset + limit < totalCount,
        nextCursor:
          offset + limit < totalCount
            ? Buffer.from(`${offset + limit}`).toString('base64')
            : undefined,
      };
    } catch (error) {
      console.error('❌ AuditService queryAuditEvents error:', error);
      return {
        events: [],
        totalCount: 0,
        hasMore: false,
      };
    }
  }

  /**
   * ✅ GET: User audit trail
   */
  async getUserAuditTrail(
    userId: string,
    options: { limit?: number; startDate?: Date; endDate?: Date } = {}
  ): Promise<EnterpriseAuditEvent[]> {
    const filters: AuditQueryFilters = { userId, ...options };
    const result = await this.queryAuditEvents(filters);
    return result.events;
  }

  /**
   * ✅ GET: Organization audit trail
   */
  async getOrganizationAuditTrail(
    organizationId: string,
    options: { limit?: number; startDate?: Date; endDate?: Date } = {}
  ): Promise<EnterpriseAuditEvent[]> {
    const filters: AuditQueryFilters = { organizationId, ...options };
    const result = await this.queryAuditEvents(filters);
    return result.events;
  }

  /**
   * ✅ GET: Security events
   */
  async getSecurityEvents(
    options: {
      organizationId?: string;
      userId?: string;
      minRiskScore?: number;
      limit?: number;
    } = {}
  ): Promise<EnterpriseAuditEvent[]> {
    const filters: AuditQueryFilters = {
      organizationId: options.organizationId,
      userId: options.userId,
      limit: options.limit,
    };

    const result = await this.queryAuditEvents(filters);
    return result.events.filter(
      event => !options.minRiskScore || event.riskScore >= options.minRiskScore
    );
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  /**
   * ✅ PRIVATE: Map AuthEventType to database schema
   */
  private mapEventTypeToSchema(
    eventType?: string
  ):
    | 'login_success'
    | 'login_failed'
    | 'logout'
    | 'session_expired'
    | 'register_success'
    | 'register_failed'
    | 'email_verification_sent'
    | 'email_verified'
    | 'password_changed' {
    // Mapear tipos customizados para o schema do banco
    const mapping = {
      login: 'login_success',
      login_success: 'login_success',
      login_failed: 'login_failed',
      logout: 'logout',
      register: 'register_success',
      register_success: 'register_success',
      register_failed: 'register_failed',
      password_change: 'password_changed',
      session_expired: 'session_expired',
      email_verification_sent: 'email_verification_sent',
      email_verified: 'email_verified',
    } as const;

    return mapping[eventType as keyof typeof mapping] ?? 'login_success';
  }

  /**
   * ✅ PRIVATE: Format geolocation for database
   */
  private formatLocation(
    geolocation: GeolocationContext | null
  ): string | null {
    if (!geolocation) return null;

    const { country, city } = geolocation;
    if (country && city) return `${city}, ${country}`;
    if (country) return country;
    if (city) return city;
    return null;
  }

  /**
   * ✅ PRIVATE: Build metadata object
   */
  private buildMetadata(
    event: Partial<EnterpriseAuditEvent>
  ): Record<string, unknown> {
    return {
      eventAction: event.eventAction,
      eventCategory: event.eventCategory ?? 'auth',
      deviceInfo: event.deviceInfo,
      geolocation: event.geolocation,
      riskScore: event.riskScore ?? 0,
      riskFactors: event.riskFactors,
      source: event.source ?? 'web',
      requestId: event.requestId,
    };
  }

  /**
   * ✅ PRIVATE: Transform database event to enterprise format
   */
  private transformDatabaseEventToEnterprise(
    event: Record<string, unknown>
  ): EnterpriseAuditEvent {
    const metadata = (event.metadata as Record<string, unknown>) ?? {};

    return {
      id: (event.id as string) ?? randomUUID(),
      userId: event.userId as string,
      sessionToken: null,
      organizationId: event.organizationId as string,

      // Event classification
      eventType: event.eventType as AuthEventType,
      eventAction: (metadata.eventAction as string) ?? 'unknown',
      eventStatus: event.success ? 'success' : 'failure',
      eventCategory: (metadata.eventCategory as AuthEventCategory) ?? 'auth',

      // Request context
      ipAddress: event.ipAddress as string,
      userAgent: event.userAgent as string,
      deviceInfo: (metadata.deviceInfo as DeviceInfo) ?? null,
      geolocation: metadata.geolocation as GeolocationContext,

      // Security
      riskScore: (metadata.riskScore as number) ?? 0,
      riskFactors: null,
      securityFlags: null,

      // Event data
      eventData: null,
      errorCode: null,
      errorMessage: event.errorMessage as string,

      // Metadata
      timestamp: (event.createdAt as Date) ?? new Date(),
      source: (metadata.source as string) ?? 'web',
      requestId: (metadata.requestId as string) ?? null,
      processed: false,
      alertsSent: null,
    };
  }
}
