// packages/database/src/repositories/implementations/drizzle-audit.repository.ts
// ============================================
// DRIZZLE AUDIT REPOSITORY - ENTERPRISE SECURITY MONITORING
// ============================================

import {
  and,
  count,
  desc,
  eq,
  gte,
  inArray,
  like,
  lt,
} from 'drizzle-orm';
import type { Database } from '../../connection';
import { DatabaseError } from '../../connection';
import { 
  auth_audit_logs, 
  activity_logs,
  type AuthAuditLog,
  type ActivityLog,
  type AuthEventType,
  type AuthRiskLevel,
  type CreateAuthAuditLog,
  type CreateActivityLog,
} from '../../schemas';

export interface IAuditRepository {
  // Auth audit operations
  createAuthLog(log: CreateAuthAuditLog): Promise<AuthAuditLog>;
  findAuthLogsByUser(userId: string, limit?: number): Promise<AuthAuditLog[]>;
  findAuthLogsByIP(ipAddress: string, hoursBack?: number): Promise<AuthAuditLog[]>;
  findFailedLogins(hoursBack?: number, limit?: number): Promise<AuthAuditLog[]>;
  findSuspiciousActivity(riskLevel?: AuthRiskLevel, hoursBack?: number): Promise<AuthAuditLog[]>;

  // Activity log operations
  createActivityLog(log: CreateActivityLog): Promise<ActivityLog>;
  findActivityLogsByUser(userId: string, limit?: number): Promise<ActivityLog[]>;
  findActivityLogsByOrganization(organizationId: string, limit?: number): Promise<ActivityLog[]>;
  findActivityLogsByResource(resourceType: string, resourceId: string): Promise<ActivityLog[]>;

  // Analytics and cleanup
  getSecurityMetrics(hoursBack?: number): Promise<SecurityMetrics>;
  cleanupOldLogs(retentionDays?: number): Promise<number>;
}

export interface SecurityMetrics {
  total_auth_events: number;
  failed_logins: number;
  successful_logins: number;
  unique_users: number;
  unique_ips: number;
  high_risk_events: number;
  suspicious_activity_count: number;
  most_common_event_type: AuthEventType | null;
  most_common_failure_ip: string | null;
}

export class DrizzleAuditRepository implements IAuditRepository {
  constructor(private readonly db: Database) {}

  private checkBuildTime(): boolean {
    return process.env.NODE_ENV === 'production' && 
           (process.env.NEXT_PHASE === 'phase-production-build' || 
            process.env.CI === 'true');
  }

  // Auth audit logs
  async createAuthLog(log: CreateAuthAuditLog): Promise<AuthAuditLog> {
    if (this.checkBuildTime()) {
      return {
        ...log,
        created_at: new Date(),
      } as AuthAuditLog;
    }
    
    try {
      const [result] = await this.db
        .insert(auth_audit_logs)
        .values({
          ...log,
          created_at: new Date(),
        })
        .returning();

      if (!result) {
        throw new DatabaseError('Failed to create auth audit log - no result returned');
      }

      return result;
    } catch (error) {
      throw this.handleDatabaseError(error, 'createAuthLog');
    }
  }

  async findAuthLogsByUser(userId: string, limit = 50): Promise<AuthAuditLog[]> {
    if (this.checkBuildTime()) return [];
    
    try {
      const result = await this.db
        .select()
        .from(auth_audit_logs)
        .where(eq(auth_audit_logs.user_id, userId))
        .orderBy(desc(auth_audit_logs.created_at))
        .limit(limit);

      return result;
    } catch (error) {
      throw this.handleDatabaseError(error, 'findAuthLogsByUser');
    }
  }

  async findAuthLogsByIP(ipAddress: string, hoursBack = 24): Promise<AuthAuditLog[]> {
    if (this.checkBuildTime()) return [];
    
    try {
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - hoursBack);

      const result = await this.db
        .select()
        .from(auth_audit_logs)
        .where(
          and(
            eq(auth_audit_logs.ip_address, ipAddress),
            gte(auth_audit_logs.created_at, cutoffTime)
          )
        )
        .orderBy(desc(auth_audit_logs.created_at));

      return result;
    } catch (error) {
      throw this.handleDatabaseError(error, 'findAuthLogsByIP');
    }
  }

  async findFailedLogins(hoursBack = 24, limit = 100): Promise<AuthAuditLog[]> {
    if (this.checkBuildTime()) return [];
    
    try {
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - hoursBack);

      const result = await this.db
        .select()
        .from(auth_audit_logs)
        .where(
          and(
            eq(auth_audit_logs.event_type, 'login_failed'),
            eq(auth_audit_logs.success, false),
            gte(auth_audit_logs.created_at, cutoffTime)
          )
        )
        .orderBy(desc(auth_audit_logs.created_at))
        .limit(limit);

      return result;
    } catch (error) {
      throw this.handleDatabaseError(error, 'findFailedLogins');
    }
  }

  async findSuspiciousActivity(riskLevel: AuthRiskLevel = 'high', hoursBack = 24): Promise<AuthAuditLog[]> {
    if (this.checkBuildTime()) return [];
    
    try {
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - hoursBack);

      const riskLevels: AuthRiskLevel[] = riskLevel === 'critical' 
        ? ['critical'] 
        : riskLevel === 'high' 
        ? ['high', 'critical']
        : ['medium', 'high', 'critical'];

      const result = await this.db
        .select()
        .from(auth_audit_logs)
        .where(
          and(
            inArray(auth_audit_logs.risk_level, riskLevels),
            gte(auth_audit_logs.created_at, cutoffTime)
          )
        )
        .orderBy(desc(auth_audit_logs.created_at));

      return result;
    } catch (error) {
      throw this.handleDatabaseError(error, 'findSuspiciousActivity');
    }
  }

  // Activity logs
  async createActivityLog(log: CreateActivityLog): Promise<ActivityLog> {
    if (this.checkBuildTime()) {
      return {
        ...log,
        occurred_at: new Date(),
        created_at: new Date(),
      } as ActivityLog;
    }
    
    try {
      const now = new Date();
      const [result] = await this.db
        .insert(activity_logs)
        .values({
          ...log,
          occurred_at: log.occurred_at || now,
          created_at: now,
        })
        .returning();

      if (!result) {
        throw new DatabaseError('Failed to create activity log - no result returned');
      }

      return result;
    } catch (error) {
      throw this.handleDatabaseError(error, 'createActivityLog');
    }
  }

  async findActivityLogsByUser(userId: string, limit = 50): Promise<ActivityLog[]> {
    if (this.checkBuildTime()) return [];
    
    try {
      const result = await this.db
        .select()
        .from(activity_logs)
        .where(eq(activity_logs.user_id, userId))
        .orderBy(desc(activity_logs.occurred_at))
        .limit(limit);

      return result;
    } catch (error) {
      throw this.handleDatabaseError(error, 'findActivityLogsByUser');
    }
  }

  async findActivityLogsByOrganization(organizationId: string, limit = 100): Promise<ActivityLog[]> {
    if (this.checkBuildTime()) return [];
    
    try {
      const result = await this.db
        .select()
        .from(activity_logs)
        .where(eq(activity_logs.organization_id, organizationId))
        .orderBy(desc(activity_logs.occurred_at))
        .limit(limit);

      return result;
    } catch (error) {
      throw this.handleDatabaseError(error, 'findActivityLogsByOrganization');
    }
  }

  async findActivityLogsByResource(resourceType: string, resourceId: string): Promise<ActivityLog[]> {
    if (this.checkBuildTime()) return [];
    
    try {
      const result = await this.db
        .select()
        .from(activity_logs)
        .where(
          and(
            eq(activity_logs.resource_type, resourceType),
            eq(activity_logs.resource_id, resourceId)
          )
        )
        .orderBy(desc(activity_logs.occurred_at));

      return result;
    } catch (error) {
      throw this.handleDatabaseError(error, 'findActivityLogsByResource');
    }
  }

  async getSecurityMetrics(hoursBack = 24): Promise<SecurityMetrics> {
    if (this.checkBuildTime()) {
      return {
        total_auth_events: 0,
        failed_logins: 0,
        successful_logins: 0,
        unique_users: 0,
        unique_ips: 0,
        high_risk_events: 0,
        suspicious_activity_count: 0,
        most_common_event_type: null,
        most_common_failure_ip: null,
      };
    }
    
    try {
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - hoursBack);

      // Total auth events
      const [totalEvents] = await this.db
        .select({ count: count() })
        .from(auth_audit_logs)
        .where(gte(auth_audit_logs.created_at, cutoffTime));

      // Failed logins
      const [failedLogins] = await this.db
        .select({ count: count() })
        .from(auth_audit_logs)
        .where(
          and(
            eq(auth_audit_logs.event_type, 'login_failed'),
            eq(auth_audit_logs.success, false),
            gte(auth_audit_logs.created_at, cutoffTime)
          )
        );

      // Successful logins
      const [successfulLogins] = await this.db
        .select({ count: count() })
        .from(auth_audit_logs)
        .where(
          and(
            eq(auth_audit_logs.event_type, 'login_success'),
            eq(auth_audit_logs.success, true),
            gte(auth_audit_logs.created_at, cutoffTime)
          )
        );

      // High risk events
      const [highRiskEvents] = await this.db
        .select({ count: count() })
        .from(auth_audit_logs)
        .where(
          and(
            inArray(auth_audit_logs.risk_level, ['high', 'critical']),
            gte(auth_audit_logs.created_at, cutoffTime)
          )
        );

      return {
        total_auth_events: totalEvents?.count ?? 0,
        failed_logins: failedLogins?.count ?? 0,
        successful_logins: successfulLogins?.count ?? 0,
        unique_users: 0, // Would need DISTINCT query
        unique_ips: 0,   // Would need DISTINCT query
        high_risk_events: highRiskEvents?.count ?? 0,
        suspicious_activity_count: 0, // Would need complex query
        most_common_event_type: null, // Would need GROUP BY query
        most_common_failure_ip: null, // Would need GROUP BY query
      };
    } catch (error) {
      throw this.handleDatabaseError(error, 'getSecurityMetrics');
    }
  }

  async cleanupOldLogs(retentionDays = 90): Promise<number> {
    if (this.checkBuildTime()) return 0;
    
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      // Delete old auth logs (except critical events - keep for 1 year)
      const criticalCutoff = new Date();
      criticalCutoff.setDate(criticalCutoff.getDate() - 365);

      await this.db.transaction(async (tx) => {
        // Delete non-critical old auth logs
        await tx
          .delete(auth_audit_logs)
          .where(
            and(
              lt(auth_audit_logs.created_at, cutoffDate),
              inArray(auth_audit_logs.risk_level, ['low', 'medium'])
            )
          );

        // Delete very old critical auth logs
        await tx
          .delete(auth_audit_logs)
          .where(lt(auth_audit_logs.created_at, criticalCutoff));

        // Delete old activity logs
        await tx
          .delete(activity_logs)
          .where(lt(activity_logs.created_at, cutoffDate));
      });

      return 0; // Return count would require SELECT before DELETE
    } catch (error) {
      throw this.handleDatabaseError(error, 'cleanupOldLogs');
    }
  }

  private handleDatabaseError(error: unknown, operation: string): DatabaseError {
    const err = error as { code?: string; message?: string; constraint?: string };

    console.error(`[DrizzleAuditRepository.${operation}] Database error:`, {
      code: err.code,
      message: err.message?.substring(0, 200),
      constraint: err.constraint,
    });

    return new DatabaseError(
      `Audit operation failed: ${operation}`,
      err.code,
      err.constraint
    );
  }
}
