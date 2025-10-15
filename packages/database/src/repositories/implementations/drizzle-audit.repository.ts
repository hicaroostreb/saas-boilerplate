// packages/database/src/repositories/implementations/drizzle-audit.repository.ts
// ============================================
// DRIZZLE AUDIT REPOSITORY - ENTERPRISE SECURITY MONITORING (FIXED)
// ============================================

import {
  and,
  count,
  desc,
  eq,
  gte,
  lte
} from 'drizzle-orm';
import type { Database } from '../../connection';
import { DatabaseError } from '../../connection';
import {
  auth_audit_logs,
  type AuthAuditLog,
  type CreateAuthAuditLog,
  type AuthEventType,
} from '../../schemas/security';

export interface IAuditRepository {
  // Core audit operations
  log(auditData: CreateAuthAuditLog): Promise<AuthAuditLog>;
  
  // Query operations
  findByUser(userId: string, limit?: number): Promise<AuthAuditLog[]>;
  findByOrganization(organizationId: string, limit?: number): Promise<AuthAuditLog[]>;
  findByEventType(eventType: AuthEventType, limit?: number): Promise<AuthAuditLog[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<AuthAuditLog[]>;
  
  // Security analysis
  getFailedLogins(userId: string, hours: number): Promise<AuthAuditLog[]>;
  getSuccessfulLogins(userId: string, limit?: number): Promise<AuthAuditLog[]>;
  getRecentActivity(userId: string, hours: number): Promise<AuthAuditLog[]>;
  
  // Cleanup
  cleanup(olderThanDays: number): Promise<number>;
}

export class DrizzleAuditRepository implements IAuditRepository {
  constructor(private readonly db: Database) {}

  private checkBuildTime(): boolean {
    return process.env.NODE_ENV === 'production' && 
           (process.env.NEXT_PHASE === 'phase-production-build' || 
            process.env.CI === 'true');
  }

  async log(auditData: CreateAuthAuditLog): Promise<AuthAuditLog> {
    if (this.checkBuildTime()) {
      return auditData as AuthAuditLog;
    }
    
    try {
      const [result] = await this.db
        .insert(auth_audit_logs)
        .values({
          ...auditData,
          id: auditData.id || crypto.randomUUID(),
          created_at: auditData.created_at || new Date(),
        })
        .returning();

      if (!result) {
        throw new DatabaseError('Failed to create audit log - no result returned');
      }

      return result;
    } catch (error) {
      throw this.handleDatabaseError(error, 'log');
    }
  }

  async findByUser(userId: string, limit = 50): Promise<AuthAuditLog[]> {
    if (this.checkBuildTime()) return [];
    
    try {
      const result = await this.db
        .select()
        .from(auth_audit_logs)
        .where(eq(auth_audit_logs.user_id, userId))
        .orderBy(desc(auth_audit_logs.occurred_at))
        .limit(limit);

      return result;
    } catch (error) {
      throw this.handleDatabaseError(error, 'findByUser');
    }
  }

  async findByOrganization(organizationId: string, limit = 100): Promise<AuthAuditLog[]> {
    if (this.checkBuildTime()) return [];
    
    try {
      const result = await this.db
        .select()
        .from(auth_audit_logs)
        .where(eq(auth_audit_logs.organization_id, organizationId))
        .orderBy(desc(auth_audit_logs.occurred_at))
        .limit(limit);

      return result;
    } catch (error) {
      throw this.handleDatabaseError(error, 'findByOrganization');
    }
  }

  async findByEventType(eventType: AuthEventType, limit = 100): Promise<AuthAuditLog[]> {
    if (this.checkBuildTime()) return [];
    
    try {
      const result = await this.db
        .select()
        .from(auth_audit_logs)
        .where(eq(auth_audit_logs.event_type, eventType))
        .orderBy(desc(auth_audit_logs.occurred_at))
        .limit(limit);

      return result;
    } catch (error) {
      throw this.handleDatabaseError(error, 'findByEventType');
    }
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<AuthAuditLog[]> {
    if (this.checkBuildTime()) return [];
    
    try {
      const result = await this.db
        .select()
        .from(auth_audit_logs)
        .where(
          and(
            gte(auth_audit_logs.occurred_at, startDate),
            lte(auth_audit_logs.occurred_at, endDate)
          )
        )
        .orderBy(desc(auth_audit_logs.occurred_at));

      return result;
    } catch (error) {
      throw this.handleDatabaseError(error, 'findByDateRange');
    }
  }

  async getFailedLogins(userId: string, hours: number): Promise<AuthAuditLog[]> {
    if (this.checkBuildTime()) return [];
    
    try {
      const since = new Date();
      since.setHours(since.getHours() - hours);

      const result = await this.db
        .select()
        .from(auth_audit_logs)
        .where(
          and(
            eq(auth_audit_logs.user_id, userId),
            // Fixed: use correct enum value and field name
            eq(auth_audit_logs.event_type, 'login_failure'),
            eq(auth_audit_logs.is_success, false),
            gte(auth_audit_logs.occurred_at, since)
          )
        )
        .orderBy(desc(auth_audit_logs.occurred_at));

      return result;
    } catch (error) {
      throw this.handleDatabaseError(error, 'getFailedLogins');
    }
  }

  async getSuccessfulLogins(userId: string, limit = 10): Promise<AuthAuditLog[]> {
    if (this.checkBuildTime()) return [];
    
    try {
      const result = await this.db
        .select()
        .from(auth_audit_logs)
        .where(
          and(
            eq(auth_audit_logs.user_id, userId),
            eq(auth_audit_logs.event_type, 'login_success'),
            eq(auth_audit_logs.is_success, true)
          )
        )
        .orderBy(desc(auth_audit_logs.occurred_at))
        .limit(limit);

      return result;
    } catch (error) {
      throw this.handleDatabaseError(error, 'getSuccessfulLogins');
    }
  }

  async getRecentActivity(userId: string, hours: number): Promise<AuthAuditLog[]> {
    if (this.checkBuildTime()) return [];
    
    try {
      const since = new Date();
      since.setHours(since.getHours() - hours);

      const result = await this.db
        .select()
        .from(auth_audit_logs)
        .where(
          and(
            eq(auth_audit_logs.user_id, userId),
            gte(auth_audit_logs.occurred_at, since)
          )
        )
        .orderBy(desc(auth_audit_logs.occurred_at));

      return result;
    } catch (error) {
      throw this.handleDatabaseError(error, 'getRecentActivity');
    }
  }

  async cleanup(olderThanDays: number): Promise<number> {
    if (this.checkBuildTime()) return 0;
    
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      await this.db
        .delete(auth_audit_logs)
        .where(lte(auth_audit_logs.created_at, cutoffDate));

      // Note: Can't get affected count with this setup, return 0
      return 0;
    } catch (error) {
      throw this.handleDatabaseError(error, 'cleanup');
    }
  }

  private handleDatabaseError(error: unknown, operation: string): DatabaseError {
    const err = error as { code?: string; message?: string; constraint?: string };

    console.error(`[DrizzleAuditRepository.${operation}] Database error:`, {
      code: err.code,
      message: err.message?.substring(0, 200),
      constraint: err.constraint,
    });

    if (err.code === '23505') {
      return new DatabaseError(
        'Audit log constraint violation',
        err.code,
        err.constraint
      );
    }

    return new DatabaseError(
      `Audit operation failed: ${operation}`,
      err.code,
      err.constraint
    );
  }
}
