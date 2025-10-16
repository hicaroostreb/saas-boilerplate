// packages/database/src/repositories/implementations/drizzle-rate-limit.repository.ts
// ============================================
// DRIZZLE RATE LIMIT REPOSITORY - ENTERPRISE RATE LIMITING (REFACTORED)
// ============================================

import { and, eq, isNull, lt } from 'drizzle-orm';
import type { Database } from '../../connection';
import { DatabaseError } from '../../connection';
import { tenantContext } from '../../connection/tenant-context';
import {
  calculateWindowBounds,
  checkRateLimit,
  createWindowReset,
  isWindowExpired,
  rate_limits,
  type CreateRateLimit,
  type RateLimit,
  type RateLimitResult,
  type RateLimitType,
  type RateLimitWindow,
} from '../../schemas/security';
import { RLSRepositoryWrapper } from '../rls-wrapper';

export interface IRateLimitRepository {
  checkAndIncrement(
    type: RateLimitType,
    identifier: string,
    maxRequests: number,
    windowType: 'minute' | 'hour' | 'day' | 'month',
    windowSize?: number,
    organizationId?: string,
    userId?: string
  ): Promise<RateLimitResult>;
  findByTypeAndIdentifier(
    type: RateLimitType,
    identifier: string
  ): Promise<RateLimit | null>;
  create(rateLimit: CreateRateLimit): Promise<RateLimit>;
  update(rateLimit: RateLimit): Promise<RateLimit>;
  reset(id: string): Promise<RateLimit>;
  cleanupExpired(): Promise<number>;
  resetAllForIdentifier(identifier: string): Promise<number>;
  resetAllForOrganization(organizationId: string): Promise<number>;
}

export class DrizzleRateLimitRepository implements IRateLimitRepository {
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

  async checkAndIncrement(
    type: RateLimitType,
    identifier: string,
    maxRequests: number,
    windowType: 'minute' | 'hour' | 'day' | 'month',
    windowSize = 1,
    organizationId?: string,
    userId?: string
  ): Promise<RateLimitResult> {
    if (this.checkBuildTime()) {
      return {
        allowed: true,
        limit: maxRequests,
        remaining: maxRequests - 1,
        reset_time: new Date(Date.now() + 60 * 1000),
        current_window_requests: 1,
      };
    }

    try {
      return await this.rls.transaction(async tx => {
        const tenantId = tenantContext.getTenantIdOrNull();

        const conditions = [
          eq(rate_limits.type, type),
          eq(rate_limits.identifier, identifier),
        ];

        if (tenantId) {
          conditions.push(eq(rate_limits.tenant_id, tenantId));
        } else {
          conditions.push(isNull(rate_limits.tenant_id));
        }

        const [existingLimit] = await tx
          .select()
          .from(rate_limits)
          .where(and(...conditions)!)
          .limit(1);

        const now = new Date();

        if (!existingLimit) {
          const { start, end } = calculateWindowBounds(
            windowType as RateLimitWindow,
            windowSize,
            now
          );

          const newLimit: CreateRateLimit = {
            id: crypto.randomUUID(),
            tenant_id: tenantId,
            type,
            identifier,
            organization_id: organizationId || null,
            user_id: userId || null,
            window_type: windowType as RateLimitWindow,
            window_size: windowSize,
            max_requests: maxRequests,
            current_count: 1,
            window_start: start,
            window_end: end,
            first_request_at: now,
            last_request_at: now,
            metadata: null,
            created_at: now,
            updated_at: now,
          };

          const [created] = await tx
            .insert(rate_limits)
            .values(newLimit)
            .returning();

          return {
            allowed: true,
            limit: maxRequests,
            remaining: maxRequests - 1,
            reset_time: end,
            current_window_requests: 1,
          };
        }

        let currentLimit = existingLimit;
        if (isWindowExpired(currentLimit)) {
          const resetData = createWindowReset(currentLimit, now);
          const [updated] = await tx
            .update(rate_limits)
            .set({
              ...resetData,
              current_count: 1,
              last_request_at: now,
              updated_at: now,
            })
            .where(eq(rate_limits.id, currentLimit.id))
            .returning();

          return {
            allowed: true,
            limit: maxRequests,
            remaining: maxRequests - 1,
            reset_time: updated?.window_end || new Date(),
            current_window_requests: 1,
          };
        }

        const result = checkRateLimit(currentLimit, now);

        if (result.allowed) {
          await tx
            .update(rate_limits)
            .set({
              current_count: currentLimit.current_count + 1,
              last_request_at: now,
              updated_at: now,
            })
            .where(eq(rate_limits.id, currentLimit.id));
        }

        return result;
      });
    } catch (error) {
      throw this.handleDatabaseError(error, 'checkAndIncrement');
    }
  }

  async findByTypeAndIdentifier(
    type: RateLimitType,
    identifier: string
  ): Promise<RateLimit | null> {
    if (this.checkBuildTime()) return null;

    try {
      const result = await this.rls.selectWhere(
        rate_limits,
        and(eq(rate_limits.type, type), eq(rate_limits.identifier, identifier))!
      );

      return (result[0] || null) as RateLimit | null;
    } catch (error) {
      throw this.handleDatabaseError(error, 'findByTypeAndIdentifier');
    }
  }

  async create(rateLimit: CreateRateLimit): Promise<RateLimit> {
    if (this.checkBuildTime()) {
      return rateLimit as RateLimit;
    }

    return this.rls.transactionWithRLS(async tx => {
      // Garantir tenant_id (pode ser NULL para system-level limits)
      const tenant_id =
        rateLimit.tenant_id ?? tenantContext.getTenantIdOrNull();

      const [result] = await tx
        .insert(rate_limits)
        .values({
          ...rateLimit,
          tenant_id,
        })
        .returning();

      if (!result) {
        throw new DatabaseError(
          'Failed to create rate limit - no result returned'
        );
      }

      return result;
    });
  }

  async update(rateLimit: RateLimit): Promise<RateLimit> {
    if (this.checkBuildTime()) return rateLimit;

    return this.rls.transactionWithRLS(async tx => {
      const [result] = await tx
        .update(rate_limits)
        .set({ ...rateLimit, updated_at: new Date() })
        .where(eq(rate_limits.id, rateLimit.id))
        .returning();

      if (!result) {
        throw new DatabaseError(
          'Failed to update rate limit - rate limit not found'
        );
      }

      return result;
    });
  }

  async reset(id: string): Promise<RateLimit> {
    if (this.checkBuildTime()) {
      return {} as RateLimit;
    }

    try {
      const now = new Date();

      const current = await this.rls.selectWhere(
        rate_limits,
        eq(rate_limits.id, id)
      );

      if (!current || current.length === 0 || !current[0]) {
        throw new DatabaseError('Rate limit not found');
      }

      const resetData = createWindowReset(current[0], now);

      await this.rls.updateWhere(rate_limits, eq(rate_limits.id, id)).set({
        ...resetData,
        updated_at: now,
      });

      const [result] = await this.db
        .select()
        .from(rate_limits)
        .where(eq(rate_limits.id, id))
        .limit(1);

      if (!result) {
        throw new DatabaseError('Failed to reset rate limit');
      }

      return result;
    } catch (error) {
      throw this.handleDatabaseError(error, 'reset');
    }
  }

  async cleanupExpired(): Promise<number> {
    if (this.checkBuildTime()) return 0;

    try {
      const cleanupTime = new Date();
      cleanupTime.setHours(cleanupTime.getHours() - 24);

      await this.rls.deleteWhere(
        rate_limits,
        and(
          lt(rate_limits.window_end, cleanupTime),
          eq(rate_limits.current_count, 0)
        )!
      );

      return 0;
    } catch (error) {
      throw this.handleDatabaseError(error, 'cleanupExpired');
    }
  }

  async resetAllForIdentifier(identifier: string): Promise<number> {
    if (this.checkBuildTime()) return 0;

    try {
      const now = new Date();
      const limits = await this.rls.selectWhere(
        rate_limits,
        eq(rate_limits.identifier, identifier)
      );

      for (const rateLimit of limits) {
        const resetData = createWindowReset(rateLimit, now);
        await this.rls
          .updateWhere(rate_limits, eq(rate_limits.id, rateLimit.id))
          .set({
            ...resetData,
            updated_at: now,
          });
      }

      return limits.length;
    } catch (error) {
      throw this.handleDatabaseError(error, 'resetAllForIdentifier');
    }
  }

  async resetAllForOrganization(organizationId: string): Promise<number> {
    if (this.checkBuildTime()) return 0;

    try {
      const now = new Date();
      const limits = await this.rls.selectWhere(
        rate_limits,
        eq(rate_limits.organization_id, organizationId)
      );

      for (const rateLimit of limits) {
        const resetData = createWindowReset(rateLimit, now);
        await this.rls
          .updateWhere(rate_limits, eq(rate_limits.id, rateLimit.id))
          .set({
            ...resetData,
            updated_at: now,
          });
      }

      return limits.length;
    } catch (error) {
      throw this.handleDatabaseError(error, 'resetAllForOrganization');
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

    console.error(`[DrizzleRateLimitRepository.${operation}] Database error:`, {
      code: err.code,
      message: err.message?.substring(0, 200),
      constraint: err.constraint,
    });

    if (err.code === '23505') {
      return new DatabaseError(
        'Rate limit constraint violation',
        err.code,
        err.constraint
      );
    }

    return new DatabaseError(
      `Rate limit operation failed: ${operation}`,
      err.code,
      err.constraint
    );
  }
}
