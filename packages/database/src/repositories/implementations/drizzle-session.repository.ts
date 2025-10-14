// packages/database/src/repositories/implementations/drizzle-session.repository.ts
// ============================================
// DRIZZLE SESSION REPOSITORY - ENTERPRISE BUILD SAFE
// ============================================

import {
  and,
  count,
  desc,
  eq,
  gt,
  lt,
  ne,
} from 'drizzle-orm';
import type { Database } from '../../connection';
import { DatabaseError } from '../../connection';
import { sessions, type Session } from '../../schemas/auth';
import type { 
  ISessionRepository,
  SessionData,
  CreateSessionData,
  SessionListItem,
} from '../contracts/session.repository.interface';

export class DrizzleSessionRepository implements ISessionRepository {
  constructor(private readonly db: Database) {}

  private checkBuildTime(): boolean {
    return process.env.NODE_ENV === 'production' && 
           (process.env.NEXT_PHASE === 'phase-production-build' || 
            process.env.CI === 'true');
  }

  async create(data: CreateSessionData): Promise<SessionData> {
    if (this.checkBuildTime()) {
      return {
        session_token: data.session_token ?? 'build-mock',
        user_id: data.user_id,
        expires: data.expires,
        created_at: new Date(),
        last_accessed_at: new Date(),
        ip_address: null,
        user_agent: null,
      };
    }
    
    try {
      const session_token = data.session_token ?? crypto.randomUUID();
      const now = new Date();

      const [result] = await this.db
        .insert(sessions)
        .values({
          session_token,
          user_id: data.user_id,
          expires: data.expires,
          created_at: now,
          last_accessed_at: now,
          ip_address: data.ip_address ?? null,
          user_agent: data.user_agent ?? null,
        })
        .returning();

      if (!result) {
        throw new DatabaseError('Failed to create session - no result returned');
      }

      return this.mapToSessionData(result);
    } catch (error) {
      throw this.handleDatabaseError(error, 'create');
    }
  }

  async findByToken(session_token: string): Promise<SessionData | null> {
    if (this.checkBuildTime()) return null;
    
    try {
      const [result] = await this.db
        .select()
        .from(sessions)
        .where(eq(sessions.session_token, session_token))
        .limit(1);

      return result ? this.mapToSessionData(result) : null;
    } catch (error) {
      throw this.handleDatabaseError(error, 'findByToken');
    }
  }

  async updateLastAccessed(session_token: string): Promise<void> {
    if (this.checkBuildTime()) return;
    
    try {
      await this.db
        .update(sessions)
        .set({ last_accessed_at: new Date() })
        .where(eq(sessions.session_token, session_token));
    } catch (error) {
      throw this.handleDatabaseError(error, 'updateLastAccessed');
    }
  }

  async deleteSession(session_token: string): Promise<void> {
    if (this.checkBuildTime()) return;
    
    try {
      await this.db
        .delete(sessions)
        .where(eq(sessions.session_token, session_token));
    } catch (error) {
      throw this.handleDatabaseError(error, 'deleteSession');
    }
  }

  async findActiveByUser(user_id: string): Promise<SessionListItem[]> {
    if (this.checkBuildTime()) return [];
    
    try {
      const now = new Date();
      
      const result = await this.db
        .select()
        .from(sessions)
        .where(
          and(
            eq(sessions.user_id, user_id),
            gt(sessions.expires, now)
          )
        )
        .orderBy(desc(sessions.last_accessed_at));

      return result.map((session: Session) => this.mapToSessionListItem(session));
    } catch (error) {
      throw this.handleDatabaseError(error, 'findActiveByUser');
    }
  }

  async countActiveForUser(user_id: string): Promise<number> {
    if (this.checkBuildTime()) return 0;
    
    try {
      const now = new Date();
      
      const result = await this.db
        .select({ count: count() })
        .from(sessions)
        .where(
          and(
            eq(sessions.user_id, user_id),
            gt(sessions.expires, now)
          )
        );

      return result[0]?.count ?? 0;
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

      await this.db
        .delete(sessions)
        .where(and(...conditions));

      return 0;
    } catch (error) {
      throw this.handleDatabaseError(error, 'deleteAllForUser');
    }
  }

  async deleteExpired(): Promise<number> {
    if (this.checkBuildTime()) return 0;
    
    try {
      const now = new Date();
      
      await this.db
        .delete(sessions)
        .where(lt(sessions.expires, now));

      return 0;
    } catch (error) {
      throw this.handleDatabaseError(error, 'deleteExpired');
    }
  }

  private mapToSessionData(session: Session): SessionData {
    return {
      session_token: session.session_token,
      user_id: session.user_id,
      expires: session.expires,
      created_at: session.created_at,
      last_accessed_at: session.last_accessed_at,
      ip_address: session.ip_address,
      user_agent: session.user_agent,
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
      last_accessed_at: session.last_accessed_at,
      created_at: session.created_at,
      expires: session.expires,
      is_current,
    };
  }

  private handleDatabaseError(error: unknown, operation: string): DatabaseError {
    const err = error as { code?: string; message?: string; constraint?: string };

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
      return new DatabaseError(
        'User not found',
        err.code,
        err.constraint
      );
    }

    return new DatabaseError(
      `Session operation failed: ${operation}`,
      err.code,
      err.constraint
    );
  }
}
