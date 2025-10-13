// packages/rate-limiter/src/domain/services/rate-limit.service.ts

import type { IRateLimitRepository } from '../repositories/rate-limit.repository.js';
import {
  type IRateLimitService,
  type RateLimitConfig,
  type RateLimitResult,
  RateLimitConfigSchema,
  RateLimitDomainError,
  RateLimitValidationError,
} from '../types/rate-limit.types.js';

export class RateLimitService implements IRateLimitService {
  private readonly config: RateLimitConfig;

  constructor(
    private readonly repository: IRateLimitRepository,
    config: RateLimitConfig
  ) {
    // Validate configuration using Zod
    const validation = RateLimitConfigSchema.safeParse(config);

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      throw new RateLimitValidationError(
        `Invalid rate limit configuration: ${firstError?.message}`,
        firstError?.path.join('.') ?? 'unknown'
      );
    }

    this.config = validation.data;
  }

  async checkLimit(identifier: string): Promise<RateLimitResult> {
    if (!identifier?.trim()?.length) {
      throw new RateLimitValidationError(
        'Identifier cannot be empty',
        'identifier'
      );
    }

    try {
      const key = this.generateKey(identifier);

      const result = await this.repository.increment(
        key,
        this.config.windowMs,
        this.config.algorithm,
        this.config.maxRequests
      );

      return this.enrichResult(result);
    } catch (error) {
      if (error instanceof RateLimitValidationError) {
        throw error;
      }

      throw new RateLimitDomainError(
        `Failed to check rate limit: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CHECK_LIMIT_ERROR'
      );
    }
  }

  async checkMultipleLimit(
    identifiers: string[]
  ): Promise<Map<string, RateLimitResult>> {
    if (!identifiers?.length) {
      throw new RateLimitValidationError(
        'Identifiers array cannot be empty',
        'identifiers'
      );
    }

    const results = new Map<string, RateLimitResult>();

    // Process all identifiers in parallel
    const promises = identifiers.map(async identifier => {
      try {
        const result = await this.checkLimit(identifier);
        results.set(identifier, result);
      } catch (_error) {
        // Store error as failed result
        results.set(identifier, {
          allowed: false,
          remaining: 0,
          resetTime: Date.now() + this.config.windowMs,
          totalHits: this.config.maxRequests + 1,
          limit: this.config.maxRequests,
        });
      }
    });

    await Promise.all(promises);
    return results;
  }

  async resetLimit(identifier: string): Promise<void> {
    if (!identifier?.trim()?.length) {
      throw new RateLimitValidationError(
        'Identifier cannot be empty',
        'identifier'
      );
    }

    try {
      const key = this.generateKey(identifier);
      await this.repository.reset(key);
    } catch (error) {
      throw new RateLimitDomainError(
        `Failed to reset rate limit: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'RESET_LIMIT_ERROR'
      );
    }
  }

  async resetMultipleLimits(identifiers: string[]): Promise<void> {
    if (!identifiers?.length) {
      throw new RateLimitValidationError(
        'Identifiers array cannot be empty',
        'identifiers'
      );
    }

    try {
      const keys = identifiers.map(id => this.generateKey(id));
      await this.repository.resetMultiple(keys);
    } catch (error) {
      throw new RateLimitDomainError(
        `Failed to reset multiple rate limits: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'RESET_MULTIPLE_LIMITS_ERROR'
      );
    }
  }

  async getCurrentStatus(identifier: string): Promise<RateLimitResult | null> {
    if (!identifier?.trim()?.length) {
      throw new RateLimitValidationError(
        'Identifier cannot be empty',
        'identifier'
      );
    }

    try {
      const key = this.generateKey(identifier);
      const entity = await this.repository.findByKey(key);

      if (!entity) {
        return null;
      }

      if (entity.isExpired()) {
        return null;
      }

      return {
        allowed: !entity.hasExceededLimit(this.config.maxRequests),
        remaining: entity.getRemainingRequests(this.config.maxRequests),
        resetTime: entity.resetTime,
        totalHits: entity.count,
        limit: this.config.maxRequests,
      };
    } catch (error) {
      throw new RateLimitDomainError(
        `Failed to get current status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'GET_STATUS_ERROR'
      );
    }
  }

  async cleanupExpiredLimits(): Promise<number> {
    try {
      return await this.repository.cleanup();
    } catch (error) {
      throw new RateLimitDomainError(
        `Failed to cleanup expired limits: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CLEANUP_ERROR'
      );
    }
  }

  async getHealthStatus(): Promise<{
    healthy: boolean;
    config: RateLimitConfig;
    repository: { connected: boolean; latency: number; error?: string };
  }> {
    try {
      const repositoryHealth = await this.repository.healthCheck();

      return {
        healthy: repositoryHealth.connected,
        config: this.config,
        repository: repositoryHealth,
      };
    } catch (error) {
      return {
        healthy: false,
        config: this.config,
        repository: {
          connected: false,
          latency: -1,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  getConfig(): RateLimitConfig {
    return { ...this.config };
  }

  private generateKey(identifier: string): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(identifier);
    }

    // Default key generation strategy
    const sanitizedIdentifier = identifier.replace(/[^a-zA-Z0-9-_.]/g, '_');
    return `rate_limit:${this.config.algorithm}:${sanitizedIdentifier}`;
  }

  private enrichResult(result: RateLimitResult): RateLimitResult {
    return {
      ...result,
      // Ensure consistency
      allowed: result.totalHits <= this.config.maxRequests,
      remaining: Math.max(0, this.config.maxRequests - result.totalHits),
      limit: this.config.maxRequests,
    };
  }

  /**
   * Validate if the current configuration allows the operation
   */
  private validateOperation(operationName: string): void {
    if (this.config.maxRequests <= 0) {
      throw new RateLimitValidationError(
        `Cannot perform ${operationName}: maxRequests must be positive`,
        'maxRequests'
      );
    }

    if (this.config.windowMs <= 0) {
      throw new RateLimitValidationError(
        `Cannot perform ${operationName}: windowMs must be positive`,
        'windowMs'
      );
    }
  }
}
