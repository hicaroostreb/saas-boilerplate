// packages/database/src/repositories/implementations/drizzle-session.repository.ts
// ============================================
// DRIZZLE SESSION REPOSITORY - ENTERPRISE MULTI-TENANT (REFACTORED)
// ============================================

import { and, desc, eq, gt, lt } from 'drizzle-orm'; // ✅ Adicionar lt
import type { DatabaseWrapper } from '../../connection';
import { DatabaseError } from '../../connection';
import { tenantContext } from '../../connection/tenant-context';
import { sessions, type Session } from '../../schemas/auth';

export interface ISessionRepository {
  findByToken(sessionToken: string): Promise<Session | null>;
  findByUserId(userId: string): Promise<Session[]>;
  findActiveByUserId(userId: string): Promise<Session[]>;
  create(session: Session): Promise<Session>;
  update(sessionToken: string, data: Partial<Session>): Promise<Session | null>;
  updateLastAccessed(sessionToken: string): Promise<void>;
  delete(sessionToken: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
  deleteExpired(): Promise<number>;
  count(userId?: string): Promise<number>;
  exists(sessionToken: string): Promise<boolean>;
}

export class DrizzleSessionRepository implements ISessionRepository {
  constructor(private readonly rls: DatabaseWrapper) {}

  private checkBuildTime(): boolean {
    return (
      process.env.NODE_ENV === 'production' &&
      (process.env.NEXT_PHASE === 'phase-production-build' ||
        process.env.CI === 'true')
    );
  }

  async findByToken(sessionToken: string): Promise<Session | null> {
    if (this.checkBuildTime()) return null;

    try {
      const result = await this.rls
        .selectWhere(sessions, eq(sessions.session_token, sessionToken))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      throw this.handleDatabaseError(error, 'findByToken');
    }
  }

  async findByUserId(userId: string): Promise<Session[]> {
    if (this.checkBuildTime()) return [];

    try {
      const result = await this.rls
        .selectWhere(sessions, eq(sessions.user_id, userId))
        .orderBy(desc(sessions.created_at));

      return result;
    } catch (error) {
      throw this.handleDatabaseError(error, 'findByUserId');
    }
  }

  async findActiveByUserId(userId: string): Promise<Session[]> {
    if (this.checkBuildTime()) return [];

    try {
      const now = new Date();

      const result = await this.rls
        .selectWhere(
          sessions,
          and(eq(sessions.user_id, userId), gt(sessions.expires, now))!
        )
        .orderBy(desc(sessions.created_at));

      return result;
    } catch (error) {
      throw this.handleDatabaseError(error, 'findActiveByUserId');
    }
  }

  async create(session: Session): Promise<Session> {
    if (this.checkBuildTime()) return session;

    return this.rls.transactionWithRLS(async tx => {
      const [result] = await tx.insert(sessions).values(session).returning();

      if (!result) {
        throw new DatabaseError(
          'Failed to create session - no result returned'
        );
      }

      return result;
    });
  }

  async update(
    sessionToken: string,
    data: Partial<Session>
  ): Promise<Session | null> {
    if (this.checkBuildTime()) return null;

    return this.rls.transactionWithRLS(async tx => {
      const [result] = await tx
        .update(sessions)
        .set(data)
        .where(eq(sessions.session_token, sessionToken))
        .returning();

      return result || null;
    });
  }

  async updateLastAccessed(sessionToken: string): Promise<void> {
    if (this.checkBuildTime()) return;

    try {
      await this.rls
        .updateWhere(sessions, eq(sessions.session_token, sessionToken))
        .set({ last_accessed_at: new Date() });
    } catch (error) {
      throw this.handleDatabaseError(error, 'updateLastAccessed');
    }
  }

  async delete(sessionToken: string): Promise<void> {
    if (this.checkBuildTime()) return;

    try {
      await this.rls.deleteWhere(
        sessions,
        eq(sessions.session_token, sessionToken)
      );
    } catch (error) {
      throw this.handleDatabaseError(error, 'delete');
    }
  }

  async deleteByUserId(userId: string): Promise<void> {
    if (this.checkBuildTime()) return;

    try {
      await this.rls.deleteWhere(sessions, eq(sessions.user_id, userId));
    } catch (error) {
      throw this.handleDatabaseError(error, 'deleteByUserId');
    }
  }

  async deleteExpired(): Promise<number> {
    if (this.checkBuildTime()) return 0;

    try {
      const now = new Date();
      const { tenantId } = tenantContext.getContext();

      // ✅ CORRIGIDO: Deletar sessões expiradas (expires < now)
      const deleted = await this.rls.deleteWhere(
        sessions,
        and(eq(sessions.tenant_id, tenantId), lt(sessions.expires, now))!
      );

      return deleted.length || 0;
    } catch (error) {
      throw this.handleDatabaseError(error, 'deleteExpired');
    }
  }

  async count(userId?: string): Promise<number> {
    if (this.checkBuildTime()) return 0;

    try {
      const condition = userId ? eq(sessions.user_id, userId) : undefined;
      return await this.rls.count(sessions, condition);
    } catch (error) {
      throw this.handleDatabaseError(error, 'count');
    }
  }

  async exists(sessionToken: string): Promise<boolean> {
    if (this.checkBuildTime()) return false;

    try {
      return await this.rls.exists(
        sessions,
        eq(sessions.session_token, sessionToken)
      );
    } catch (error) {
      throw this.handleDatabaseError(error, 'exists');
    }
  }

  private handleDatabaseError(
    error: unknown,
    operation: string
  ): DatabaseError {
    const err = error as {
      code?: string;
      message?: string;
      constraint?: string;
    };

    console.error(`[DrizzleSessionRepository.${operation}] Database error:`, {
      code: err.code,
      message: err.message?.substring(0, 200),
      constraint: err.constraint,
    });

    if (err.code === '23505') {
      return new DatabaseError(
        'Session already exists',
        err.code,
        err.constraint
      );
    }

    if (err.code === '23503') {
      return new DatabaseError(
        'Referenced resource not found',
        err.code,
        err.constraint
      );
    }

    return new DatabaseError(
      `Database operation failed: ${operation}`,
      err.code,
      err.constraint
    );
  }
}
