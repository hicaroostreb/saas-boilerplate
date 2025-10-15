// packages/database/src/repositories/implementations/drizzle-session.repository.ts
// ============================================
// DRIZZLE SESSION REPOSITORY - ENTERPRISE MULTI-TENANT (REFACTORED)
// ============================================

import { and, count, desc, eq, gt, lt, ne } from 'drizzle-orm';
import type { Database } from '../../connection';
import { DatabaseError } from '../../connection';
import { sessions, type Session } from '../../schemas/auth';
import type {
  CreateSessionData,
  ISessionRepository,
  SessionData,
  SessionListItem,
} from '../contracts/session.repository.interface';
import { RLSRepositoryWrapper } from '../rls-wrapper';

export class DrizzleSessionRepository implements ISessionRepository {
  private rls: RLSRepositoryWrapper;

  constructor(private readonly db: Database) {
    this.rls = new RLSRepositoryWrapper(db);
  }

  private checkBuildTime(): boolean {
    return (
      process.env.NODE_ENV === 'production' &&
      (process.env.NEXT_PHASE === 'phase-production-build' ||
        process.env.CI === 'true')
    );
  }

  async create(data: CreateSessionData): Promise<SessionData> {
    if (this.checkBuildTime()) {
      return {
        session_token: data.session_token ?? 'build-mock',
        tenant_id: '',
        user_id: data.user_id,
        expires: data.expires,
        created_at: new Date(),
        last_accessed_at: new Date(),
        ip_address: null,
        user_agent: null,
        device_type: null,
        device_name: null,
        browser: null,
        os: null,
        location: null,
      };
    }

    try {
      const session_token = data.session_token ?? crypto.randomUUID();
      const now = new Date();

      await this.rls.insert(sessions, {
        session_token,
        user_id: data.user_id,
        expires: data.expires,
        created_at: now,
        last_accessed_at: now,
        ip_address: data.ip_address ?? null,
        user_agent: data.user_agent ?? null,
        device_type: data.device_type ?? null,
        device_name: data.device_name ?? null,
        browser: data.browser ?? null,
        os: data.os ?? null,
        location: data.location ?? null,
      });

      const [result] = await this.db
        .select()
        .from(sessions)
        .where(eq(sessions.session_token, session_token))
        .limit(1);

      if (!result) {
        throw new DatabaseError(
          'Failed to create session - no result returned'
        );
      }

      return this.mapToSessionData(result);
    } catch (error) {
      throw this.handleDatabaseError(error, 'create');
    }
  }

  async findByToken(session_token: string): Promise<SessionData | null> {
    if (this.checkBuildTime()) return null;

    try {
      const result = await this.rls.selectWhere(
        sessions,
        eq(sessions.session_token, session_token)
      );

      return result[0] ? this.mapToSessionData(result[0]) : null;
    } catch (error) {
      throw this.handleDatabaseError(error, 'findByToken');
    }
  }

  async updateLastAccessed(session_token: string): Promise<void> {
    if (this.checkBuildTime()) return;

    try {
      await this.rls
        .updateWhere(sessions, eq(sessions.session_token, session_token))
        .set({ last_accessed_at: new Date() });
    } catch (error) {
      throw this.handleDatabaseError(error, 'updateLastAccessed');
    }
  }

  async deleteSession(session_token: string): Promise<void> {
    if (this.checkBuildTime()) return;

    try {
      await this.rls.deleteWhere(
        sessions,
        eq(sessions.session_token, session_token)
      );
    } catch (error) {
      throw this.handleDatabaseError(error, 'deleteSession');
    }
  }

  async findActiveByUser(user_id: string): Promise<SessionListItem[]> {
    if (this.checkBuildTime()) return [];

    try {
      const now = new Date();

      const result = await this.rls
        .selectWhere(
          sessions,
          and(eq(sessions.user_id, user_id), gt(sessions.expires, now))!
        )
        .orderBy(desc(sessions.last_accessed_at));

      return result.map((session: Session) =>
        this.mapToSessionListItem(session)
      );
    } catch (error) {
      throw this.handleDatabaseError(error, 'findActiveByUser');
    }
  }

  async countActiveForUser(user_id: string): Promise<number> {
    if (this.checkBuildTime()) return 0;

    try {
      const now = new Date();

      return await this.rls.count(
        sessions,
        and(eq(sessions.user_id, user_id), gt(sessions.expires, now))!
      );
    } catch (error) {
      throw this.handleDatabaseError(error, 'countActiveForUser');
    }
  }

  async deleteAllForUser(
    user_id: string,
    except_session_token?: string
  ): Promise<number> {
    if (this.checkBuildTime()) return 0;

    try {
      const conditions = [eq(sessions.user_id, user_id)];

      if (except_session_token) {
        conditions.push(ne(sessions.session_token, except_session_token));
      }

      await this.rls.deleteWhere(sessions, and(...conditions)!);

      return 0;
    } catch (error) {
      throw this.handleDatabaseError(error, 'deleteAllForUser');
    }
  }

  async deleteExpired(): Promise<number> {
    if (this.checkBuildTime()) return 0;

    try {
      const now = new Date();

      await this.rls.deleteWhere(sessions, lt(sessions.expires, now));

      return 0;
    } catch (error) {
      throw this.handleDatabaseError(error, 'deleteExpired');
    }
  }

  async updateDeviceInfo(
    session_token: string,
    deviceInfo: {
      device_type?: string;
      device_name?: string;
      browser?: string;
      os?: string;
    }
  ): Promise<void> {
    if (this.checkBuildTime()) return;

    try {
      await this.rls
        .updateWhere(sessions, eq(sessions.session_token, session_token))
        .set(deviceInfo);
    } catch (error) {
      throw this.handleDatabaseError(error, 'updateDeviceInfo');
    }
  }

  async updateLocation(
    session_token: string,
    location: { country?: string; city?: string; lat?: number; lon?: number }
  ): Promise<void> {
    if (this.checkBuildTime()) return;

    try {
      await this.rls
        .updateWhere(sessions, eq(sessions.session_token, session_token))
        .set({ location: JSON.stringify(location) });
    } catch (error) {
      throw this.handleDatabaseError(error, 'updateLocation');
    }
  }

  private mapToSessionData(session: Session): SessionData {
    return {
      session_token: session.session_token,
      tenant_id: session.tenant_id,
      user_id: session.user_id,
      expires: session.expires,
      created_at: session.created_at,
      last_accessed_at: session.last_accessed_at,
      ip_address: session.ip_address,
      user_agent: session.user_agent,
      device_type: session.device_type,
      device_name: session.device_name,
      browser: session.browser,
      os: session.os,
      location: session.location,
    };
  }

  private mapToSessionListItem(
    session: Session,
    is_current = false
  ): SessionListItem {
    return {
      session_token: session.session_token,
      ip_address: session.ip_address,
      user_agent: session.user_agent,
      device_type: session.device_type,
      device_name: session.device_name,
      browser: session.browser,
      os: session.os,
      last_accessed_at: session.last_accessed_at,
      created_at: session.created_at,
      expires: session.expires,
      is_current,
    };
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
        'Session token already exists',
        err.code,
        err.constraint
      );
    }

    if (err.code === '23503') {
      return new DatabaseError('User not found', err.code, err.constraint);
    }

    return new DatabaseError(
      `Session operation failed: ${operation}`,
      err.code,
      err.constraint
    );
  }
}
