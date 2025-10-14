// packages/database/src/repositories/implementations/drizzle-rate-limit.repository.ts
// ============================================
// DRIZZLE RATE LIMIT REPOSITORY - ENTERPRISE RATE LIMITING
// ============================================

import {
  and,
  count,
  desc,
  eq,
  lt,
} from 'drizzle-orm';
import type { Database } from '../../connection';
import { DatabaseError } from '../../connection';
import { 
  rate_limits,
  type RateLimit,
  type CreateRateLimit,
  type RateLimitType,
  type RateLimitResult,
  checkRateLimit,
  createWindowReset,
  isWindowExpired,
  calculateWindowBounds,
} from '../../schemas/security';

export interface IRateLimitRepository {
  // Core rate limiting operations
  checkAndIncrement(
    type: RateLimitType,
    identifier: string,
    maxRequests: number,
    windowType: 'minute' | 'hour' | 'day' | 'month',
    windowSize?: number,
    organizationId?: string,
    userId?: string
  ): Promise<RateLimitResult>;

  // Direct CRUD operations
  findByTypeAndIdentifier(type: RateLimitType, identifier: string): Promise<RateLimit | null>;
  create(rateLimit: CreateRateLimit): Promise<RateLimit>;
  update(rateLimit: RateLimit): Promise<RateLimit>;
  increment(id: string): Promise<RateLimit>;
  reset(id: string): Promise<RateLimit>;

  // Cleanup and maintenance
  cleanupExpired(): Promise<number>;
  findExpiredLimits(): Promise<RateLimit[]>;

  // Analytics
  getTopLimitedIdentifiers(type?: RateLimitType, limit?: number): Promise<Array<{
    identifier: string;
    request_count: number;
    limit_exceeded_count: number;
  }>>;

  // Bulk operations
  resetAllForIdentifier(identifier: string): Promise<number>;
  resetAllForOrganization(organizationId: string): Promise<number>;
}

export class DrizzleRateLimitRepository implements IRateLimitRepository {
  constructor(private readonly db: Database) {}

  private checkBuildTime(): boolean {
    return process.env.NODE_ENV === 'production' && 
           (process.env.NEXT_PHASE === 'phase-production-build' || 
            process.env.CI === 'true');
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
      return await this.db.transaction(async (tx) => {
        // Find existing rate limit
        const [existingLimit] = await tx
          .select()
          .from(rate_limits)
          .where(
            and(
              eq(rate_limits.type, type),
              eq(rate_limits.identifier, identifier)
            )
          )
          .limit(1);

        const now = new Date();

        if (!existingLimit) {
          // Create new rate limit
          const { start, end } = calculateWindowBounds(windowType, windowSize, now);
          
          const newLimit: CreateRateLimit = {
            id: crypto.randomUUID(),
            type,
            identifier,
            organization_id: organizationId || null,
            user_id: userId || null,
            window_type: windowType,
            window_size: windowSize,
            max_requests: maxRequests,
            current_count: 1,
            window_start: start,
            window_end: end,
            first_request_at: now,
            last_request_at: now,
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

        // Check if window has expired and needs reset
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
            reset_time: updated.window_end,
            current_window_requests: 1,
          };
        }

        // Check current rate limit
        const result = checkRateLimit(currentLimit, now);
        
        if (result.allowed) {
          // Increment counter
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

  async findByTypeAndIdentifier(type: RateLimitType, identifier: string): Promise<RateLimit | null> {
    if (this.checkBuildTime()) return null;
    
    try {
      const [result] = await this.db
        .select()
        .from(rate_limits)
        .where(
          and(
            eq(rate_limits.type, type),
            eq(rate_limits.identifier, identifier)
          )
        )
        .limit(1);

      return result || null;
    } catch (error) {
      throw this.handleDatabaseError(error, 'findByTypeAndIdentifier');
    }
  }

  async create(rateLimit: CreateRateLimit): Promise<RateLimit> {
    if (this.checkBuildTime()) {
      return rateLimit as RateLimit;
    }
    
    try {
      const [result] = await this.db
        .insert(rate_limits)
        .values(rateLimit)
        .returning();

      if (!result) {
        throw new DatabaseError('Failed to create rate limit - no result returned');
      }

      return result;
    } catch (error) {
      throw this.handleDatabaseError(error, 'create');
    }
  }

  async update(rateLimit: RateLimit): Promise<RateLimit> {
    if (this.checkBuildTime()) return rateLimit;
    
    try {
      const [result] = await this.db
        .update(rate_limits)
        .set({ ...rateLimit, updated_at: new Date() })
        .where(eq(rate_limits.id, rateLimit.id))
        .returning();

      if (!result) {
        throw new DatabaseError('Failed to update rate limit - rate limit not found');
      }

      return result;
    } catch (error) {
      throw this.handleDatabaseError(error, 'update');
    }
  }

  async increment(id: string): Promise<RateLimit> {
    if (this.checkBuildTime()) {
      return {} as RateLimit;
    }
    
    try {
      const [result] = await this.db
        .update(rate_limits)
        .set({
          current_count: rate_limits.current_count + 1,
          last_request_at: new Date(),
          updated_at: new Date(),
        })
        .where(eq(rate_limits.id, id))
        .returning();

      if (!result) {
        throw new DatabaseError('Failed to increment rate limit - rate limit not found');
      }

      return result;
    } catch (error) {
      throw this.handleDatabaseError(error, 'increment');
    }
  }

  async reset(id: string): Promise<RateLimit> {
    if (this.checkBuildTime()) {
      return {} as RateLimit;
    }
    
    try {
      const now = new Date();
      const [current] = await this.db
        .select()
        .from(rate_limits)
        .where(eq(rate_limits.id, id))
        .limit(1);

      if (!current) {
        throw new DatabaseError('Rate limit not found');
      }

      const resetData = createWindowReset(current, now);
      
      const [result] = await this.db
        .update(rate_limits)
        .set({
          ...resetData,
          updated_at: now,
        })
        .where(eq(rate_limits.id, id))
        .returning();

      return result;
    } catch (error) {
      throw this.handleDatabaseError(error, 'reset');
    }
  }

  async cleanupExpired(): Promise<number> {
    if (this.checkBuildTime()) return 0;
    
    try {
      // Delete rate limits that are expired and haven't been accessed in 24 hours
      const cleanupTime = new Date();
      cleanupTime.setHours(cleanupTime.getHours() - 24);

      const deletedCount = await this.db
        .delete(rate_limits)
        .where(
          and(
            lt(rate_limits.window_end, cleanupTime),
            eq(rate_limits.current_count, 0)
          )
        );

      return 0; // Can't get affected rows count with current setup
    } catch (error) {
      throw this.handleDatabaseError(error, 'cleanupExpired');
    }
  }

  async findExpiredLimits(): Promise<RateLimit[]> {
    if (this.checkBuildTime()) return [];
    
    try {
      const now = new Date();
      const result = await this.db
        .select()
        .from(rate_limits)
        .where(lt(rate_limits.window_end, now))
        .orderBy(desc(rate_limits.window_end));

      return result;
    } catch (error) {
      throw this.handleDatabaseError(error, 'findExpiredLimits');
    }
  }

  async getTopLimitedIdentifiers(
    type?: RateLimitType,
    limit = 10
  ): Promise<Array<{
    identifier: string;
    request_count: number;
    limit_exceeded_count: number;
  }>> {
    if (this.checkBuildTime()) return [];
    
    try {
      // This would require complex GROUP BY queries
      // For now, return empty array as placeholder
      return [];
    } catch (error) {
      throw this.handleDatabaseError(error, 'getTopLimitedIdentifiers');
    }
  }

  async resetAllForIdentifier(identifier: string): Promise<number> {
    if (this.checkBuildTime()) return 0;
    
    try {
      const now = new Date();
      
      // Get all rate limits for identifier
      const limits = await this.db
        .select()
        .from(rate_limits)
        .where(eq(rate_limits.identifier, identifier));

      // Reset each one
      for (const rateLimit of limits) {
        const resetData = createWindowReset(rateLimit, now);
        await this.db
          .update(rate_limits)
          .set({
            ...resetData,
            updated_at: now,
          })
          .where(eq(rate_limits.id, rateLimit.id));
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
      
      // Get all rate limits for organization
      const limits = await this.db
        .select()
        .from(rate_limits)
        .where(eq(rate_limits.organization_id, organizationId));

      // Reset each one
      for (const rateLimit of limits) {
        const resetData = createWindowReset(rateLimit, now);
        await this.db
          .update(rate_limits)
          .set({
            ...resetData,
            updated_at: now,
          })
          .where(eq(rate_limits.id, rateLimit.id));
      }

      return limits.length;
    } catch (error) {
      throw this.handleDatabaseError(error, 'resetAllForOrganization');
    }
  }

  private handleDatabaseError(error: unknown, operation: string): DatabaseError {
    const err = error as { code?: string; message?: string; constraint?: string };

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
