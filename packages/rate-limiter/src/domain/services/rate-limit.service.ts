import type { IKeyGenerator } from '../ports/key-generator.port.js';
import type { IRateLimitAlgorithm } from '../ports/rate-limit-algorithm.port.js';
import type { IRateLimitRepository } from '../ports/rate-limit-repository.port.js';
import {
  RateLimitDomainError,
  RateLimitValidationError,
} from '../types/errors.js';
import {
  type RateLimitConfig,
  type RateLimitResult,
  RateLimitConfigSchema,
} from '../types/rate-limit.types.js';

export interface IRateLimitService {
  checkLimit(identifier: string): Promise<RateLimitResult>;
  resetLimit(identifier: string): Promise<void>;
  getConfig(): RateLimitConfig;
  getHealthStatus(): Promise<{
    healthy: boolean;
    config: RateLimitConfig;
    repository: { connected: boolean; latency: number; error?: string };
  }>;
}

export class RateLimitService implements IRateLimitService {
  private readonly config: RateLimitConfig;

  constructor(
    private readonly repository: IRateLimitRepository,
    private readonly algorithm: IRateLimitAlgorithm,
    private readonly keyGenerator: IKeyGenerator,
    config: RateLimitConfig
  ) {
    const validation = RateLimitConfigSchema.safeParse(config);

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      throw new RateLimitValidationError(
        `Invalid rate limit configuration: ${firstError?.message ?? 'Unknown validation error'}`,
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
      const key = this.keyGenerator.generate(identifier, this.config.algorithm);
      const record = await this.repository.findByKey(key);

      const result = this.algorithm.process(
        record,
        {
          windowMs: this.config.windowMs,
          maxRequests: this.config.maxRequests,
        },
        Date.now()
      );

      const ttlMs = result.resetTime - Date.now() + 60_000;
      await this.repository.save(result.record, ttlMs);

      return {
        allowed: result.allowed,
        remaining: result.remaining,
        resetTime: result.resetTime,
        totalHits: result.totalHits,
        limit: this.config.maxRequests,
      };
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

    const promises = identifiers.map(async identifier => {
      try {
        const result = await this.checkLimit(identifier);
        results.set(identifier, result);
      } catch {
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
      const key = this.keyGenerator.generate(identifier, this.config.algorithm);
      await this.repository.delete(key);
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
      const keys = identifiers.map(id =>
        this.keyGenerator.generate(id, this.config.algorithm)
      );
      await this.repository.deleteMultiple(keys);
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
      const key = this.keyGenerator.generate(identifier, this.config.algorithm);
      const record = await this.repository.findByKey(key);

      if (!record) {
        return null;
      }

      if (record.resetTime <= Date.now()) {
        return null;
      }

      return {
        allowed: record.count <= this.config.maxRequests,
        remaining: Math.max(0, this.config.maxRequests - record.count),
        resetTime: record.resetTime,
        totalHits: record.count,
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
}
