// packages/database/src/repositories/implementations/drizzle-rate-limit.repository.ts
// ============================================
// DRIZZLE RATE LIMIT REPOSITORY - ENTERPRISE SECURITY (REFACTORED)
// ============================================

import { and, eq, lt } from 'drizzle-orm';
import type { DatabaseWrapper } from '../../connection';
import { DatabaseError } from '../../connection';
import { tenantContext } from '../../connection/tenant-context';
import {
  rate_limits,
  type RateLimit,
  type RateLimitType,
  type RateLimitWindow,
} from '../../schemas/security';
import { logger } from '../../utils/logger';

export interface IRateLimitRepository {
  checkLimit(
    type: RateLimitType,
    identifier: string,
    maxRequests: number,
    windowType: RateLimitWindow,
    windowSize?: number
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: Date;
  }>;
  increment(type: RateLimitType, identifier: string): Promise<void>;
  reset(type: RateLimitType, identifier: string): Promise<void>;
  cleanup(): Promise<number>;
}

export class DrizzleRateLimitRepository implements IRateLimitRepository {
  constructor(private readonly rls: DatabaseWrapper) {}

  private checkBuildTime(): boolean {
    return (
      process.env.NODE_ENV === 'production' &&
      (process.env.NEXT_PHASE === 'phase-production-build' ||
        process.env.CI === 'true')
    );
  }

  async checkLimit(
    type: RateLimitType,
    identifier: string,
    maxRequests: number,
    windowType: RateLimitWindow,
    windowSize = 1
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: Date;
  }> {
    if (this.checkBuildTime()) {
      return { allowed: true, remaining: maxRequests, resetAt: new Date() };
    }

    try {
      const now = new Date();
      const windowStart = this.calculateWindowStart(windowType, windowSize);
      const windowEnd = this.calculateWindowEnd(
        windowType,
        windowSize,
        windowStart
      );

      const context = tenantContext.getContextOrNull();

      const [existing] = await this.rls
        .selectWhere(
          rate_limits,
          and(
            eq(rate_limits.type, type),
            eq(rate_limits.identifier, identifier),
            eq(rate_limits.window_type, windowType)
          )!
        )
        .limit(1);

      if (!existing || existing.window_end < now) {
        await this.createNewWindow(
          type,
          identifier,
          windowType,
          windowSize,
          maxRequests,
          windowStart,
          windowEnd,
          context?.tenantId || null
        );

        return {
          allowed: true,
          remaining: maxRequests - 1,
          resetAt: windowEnd,
        };
      }

      const currentCount = existing.current_count + 1;
      const allowed = currentCount <= maxRequests;
      const remaining = Math.max(0, maxRequests - currentCount);

      if (allowed) {
        await this.rls
          .updateWhere(rate_limits, eq(rate_limits.id, existing.id))
          .set({
            current_count: currentCount,
            last_request_at: now,
            updated_at: now,
          });
      }

      return {
        allowed,
        remaining,
        resetAt: existing.window_end,
      };
    } catch (error) {
      throw this.handleDatabaseError(error, 'checkLimit');
    }
  }

  async increment(type: RateLimitType, identifier: string): Promise<void> {
    if (this.checkBuildTime()) {
      return;
    }

    try {
      const now = new Date();

      const [existing] = await this.rls
        .selectWhere(
          rate_limits,
          and(
            eq(rate_limits.type, type),
            eq(rate_limits.identifier, identifier)
          )!
        )
        .limit(1);

      if (existing) {
        await this.rls
          .updateWhere(rate_limits, eq(rate_limits.id, existing.id))
          .set({
            current_count: existing.current_count + 1,
            last_request_at: now,
            updated_at: now,
          });
      }
    } catch (error) {
      throw this.handleDatabaseError(error, 'increment');
    }
  }

  async reset(type: RateLimitType, identifier: string): Promise<void> {
    if (this.checkBuildTime()) {
      return;
    }

    try {
      await this.rls.deleteWhere(
        rate_limits,
        and(eq(rate_limits.type, type), eq(rate_limits.identifier, identifier))!
      );
    } catch (error) {
      throw this.handleDatabaseError(error, 'reset');
    }
  }

  async cleanup(): Promise<number> {
    if (this.checkBuildTime()) {
      return 0;
    }

    try {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const deleted = await this.rls.deleteWhere(
        rate_limits,
        lt(rate_limits.window_end, oneDayAgo)
      );

      return deleted.length || 0;
    } catch (error) {
      throw this.handleDatabaseError(error, 'cleanup');
    }
  }

  private async createNewWindow(
    type: RateLimitType,
    identifier: string,
    windowType: RateLimitWindow,
    windowSize: number,
    maxRequests: number,
    windowStart: Date,
    windowEnd: Date,
    tenantId: string | null
  ): Promise<void> {
    await this.rls.insert(rate_limits, {
      id: crypto.randomUUID(),
      tenant_id: tenantId,
      type,
      identifier,
      window_type: windowType,
      window_size: windowSize,
      max_requests: maxRequests,
      current_count: 1,
      window_start: windowStart,
      window_end: windowEnd,
      first_request_at: new Date(),
      last_request_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  private calculateWindowStart(
    windowType: RateLimitWindow,
    windowSize: number
  ): Date {
    const now = new Date();

    switch (windowType) {
      case 'minute':
        return new Date(
          now.getTime() - (now.getTime() % (60 * 1000 * windowSize))
        );
      case 'hour':
        return new Date(
          now.getTime() - (now.getTime() % (60 * 60 * 1000 * windowSize))
        );
      case 'day':
        return new Date(
          now.getTime() - (now.getTime() % (24 * 60 * 60 * 1000 * windowSize))
        );
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return monthStart;
      default:
        return now;
    }
  }

  private calculateWindowEnd(
    windowType: RateLimitWindow,
    windowSize: number,
    windowStart: Date
  ): Date {
    switch (windowType) {
      case 'minute':
        return new Date(windowStart.getTime() + 60 * 1000 * windowSize);
      case 'hour':
        return new Date(windowStart.getTime() + 60 * 60 * 1000 * windowSize);
      case 'day':
        return new Date(
          windowStart.getTime() + 24 * 60 * 60 * 1000 * windowSize
        );
      case 'month':
        const monthEnd = new Date(
          windowStart.getFullYear(),
          windowStart.getMonth() + windowSize,
          0,
          23,
          59,
          59,
          999
        );
        return monthEnd;
      default:
        return new Date(windowStart.getTime() + 60 * 1000);
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

    logger.error('Rate limit database operation failed', {
      operation,
      code: err.code,
      message: err.message?.substring(0, 200),
    });

    return new DatabaseError(
      `Rate limit operation failed: ${operation}`,
      err.code
    );
  }
}
