// packages/database/src/repositories/implementations/drizzle-audit.repository.ts
// ============================================
// DRIZZLE AUDIT REPOSITORY - ENTERPRISE SECURITY (REFACTORED)
// ============================================

import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import type { DatabaseWrapper } from '../../connection';
import { DatabaseError } from '../../connection';
import { tenantContext } from '../../connection/tenant-context';
import {
  auth_audit_logs,
  type AuthAuditLog,
  type AuthEventType,
} from '../../schemas/security';
import { logger } from '../../utils/logger';

export interface IAuditRepository {
  log(entry: Omit<AuthAuditLog, 'id' | 'created_at'>): Promise<void>;
  findByUserId(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<AuthAuditLog[]>;
  findByEventType(
    eventType: AuthEventType,
    limit?: number,
    offset?: number
  ): Promise<AuthAuditLog[]>;
  findByDateRange(
    startDate: Date,
    endDate: Date,
    limit?: number,
    offset?: number
  ): Promise<AuthAuditLog[]>;
  findFailedLoginAttempts(userId: string, since: Date): Promise<AuthAuditLog[]>;
  count(userId?: string): Promise<number>;
}

export class DrizzleAuditRepository implements IAuditRepository {
  constructor(private readonly rls: DatabaseWrapper) {}

  private checkBuildTime(): boolean {
    return (
      process.env.NODE_ENV === 'production' &&
      (process.env.NEXT_PHASE === 'phase-production-build' ||
        process.env.CI === 'true')
    );
  }

  async log(entry: Omit<AuthAuditLog, 'id' | 'created_at'>): Promise<void> {
    if (this.checkBuildTime()) {
      return;
    }

    try {
      const context = tenantContext.getContextOrNull();

      await this.rls.insert(auth_audit_logs, {
        ...entry,
        id: crypto.randomUUID(),
        tenant_id: context?.tenantId || null,
        created_at: new Date(),
        occurred_at: entry.occurred_at || new Date(),
      });
    } catch (error) {
      logger.error('Failed to log audit entry', {
        error: error instanceof Error ? error.message : String(error),
        event_type: entry.event_type,
      });
    }
  }

  async findByUserId(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<AuthAuditLog[]> {
    if (this.checkBuildTime()) {
      return [];
    }

    try {
      return await this.rls
        .selectWhere(auth_audit_logs, eq(auth_audit_logs.user_id, userId))
        .orderBy(desc(auth_audit_logs.occurred_at))
        .limit(limit)
        .offset(offset);
    } catch (error) {
      throw this.handleDatabaseError(error, 'findByUserId');
    }
  }

  async findByEventType(
    eventType: AuthEventType,
    limit = 50,
    offset = 0
  ): Promise<AuthAuditLog[]> {
    if (this.checkBuildTime()) {
      return [];
    }

    try {
      return await this.rls
        .selectWhere(auth_audit_logs, eq(auth_audit_logs.event_type, eventType))
        .orderBy(desc(auth_audit_logs.occurred_at))
        .limit(limit)
        .offset(offset);
    } catch (error) {
      throw this.handleDatabaseError(error, 'findByEventType');
    }
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
    limit = 100,
    offset = 0
  ): Promise<AuthAuditLog[]> {
    if (this.checkBuildTime()) {
      return [];
    }

    try {
      return await this.rls
        .selectWhere(
          auth_audit_logs,
          and(
            gte(auth_audit_logs.occurred_at, startDate),
            lte(auth_audit_logs.occurred_at, endDate)
          )!
        )
        .orderBy(desc(auth_audit_logs.occurred_at))
        .limit(limit)
        .offset(offset);
    } catch (error) {
      throw this.handleDatabaseError(error, 'findByDateRange');
    }
  }

  async findFailedLoginAttempts(
    userId: string,
    since: Date
  ): Promise<AuthAuditLog[]> {
    if (this.checkBuildTime()) {
      return [];
    }

    try {
      return await this.rls
        .selectWhere(
          auth_audit_logs,
          and(
            eq(auth_audit_logs.user_id, userId),
            eq(auth_audit_logs.event_type, 'login_failure'),
            gte(auth_audit_logs.occurred_at, since)
          )!
        )
        .orderBy(desc(auth_audit_logs.occurred_at));
    } catch (error) {
      throw this.handleDatabaseError(error, 'findFailedLoginAttempts');
    }
  }

  async count(userId?: string): Promise<number> {
    if (this.checkBuildTime()) {
      return 0;
    }

    try {
      const condition = userId ? eq(auth_audit_logs.user_id, userId) : sql`1=1`;

      return await this.rls.count(auth_audit_logs, condition);
    } catch (error) {
      throw this.handleDatabaseError(error, 'count');
    }
  }

  private handleDatabaseError(
    error: unknown,
    operation: string
  ): DatabaseError {
    const err = error as {
      code?: string;
      message?: string;
    };

    logger.error('Audit database operation failed', {
      operation,
      code: err.code,
      message: err.message?.substring(0, 200),
    });

    return new DatabaseError(`Audit operation failed: ${operation}`, err.code);
  }
}
