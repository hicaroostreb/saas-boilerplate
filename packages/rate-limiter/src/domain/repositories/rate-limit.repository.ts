import { RateLimitEntity } from '../entities/rate-limit.entity.js';
import type {
  RateLimitAlgorithm,
  RateLimitResult,
} from '../types/rate-limit.types.js';

export interface IRateLimitRepository {
  /**
   * Find a rate limit record by key
   */
  findByKey(key: string): Promise<RateLimitEntity | null>;

  /**
   * Save a rate limit entity
   */
  save(entity: RateLimitEntity): Promise<void>;

  /**
   * Increment the count for a given key and return rate limit result
   */
  increment(
    key: string,
    windowMs: number,
    algorithm: RateLimitAlgorithm,
    maxRequests: number
  ): Promise<RateLimitResult>;

  /**
   * Reset rate limit for a specific key
   */
  reset(key: string): Promise<void>;

  /**
   * Bulk reset multiple keys
   */
  resetMultiple(keys: string[]): Promise<void>;

  /**
   * Get multiple rate limit records by keys
   */
  findByKeys(keys: string[]): Promise<Map<string, RateLimitEntity>>;

  /**
   * Check if a key exists in storage
   */
  exists(key: string): Promise<boolean>;

  /**
   * Get total count of stored rate limit records
   */
  count(): Promise<number>;

  /**
   * Clean up expired rate limit records
   */
  cleanup(): Promise<number>;

  /**
   * Get all keys matching a pattern (for debugging/monitoring)
   */
  getKeys(pattern?: string): Promise<string[]>;

  /**
   * Health check for the repository
   */
  healthCheck(): Promise<{
    connected: boolean;
    latency: number;
    error?: string;
  }>;
}

export abstract class BaseRateLimitRepository implements IRateLimitRepository {
  abstract findByKey(key: string): Promise<RateLimitEntity | null>;
  abstract save(entity: RateLimitEntity): Promise<void>;
  abstract reset(key: string): Promise<void>;
  abstract cleanup(): Promise<number>;
  abstract exists(key: string): Promise<boolean>;
  abstract count(): Promise<number>;
  abstract getKeys(pattern?: string): Promise<string[]>;
  abstract healthCheck(): Promise<{
    connected: boolean;
    latency: number;
    error?: string;
  }>;

  async resetMultiple(keys: string[]): Promise<void> {
    const promises = keys.map(key => this.reset(key));
    await Promise.all(promises);
  }

  async findByKeys(keys: string[]): Promise<Map<string, RateLimitEntity>> {
    const results = new Map<string, RateLimitEntity>();
    const promises = keys.map(async key => {
      const entity = await this.findByKey(key);
      if (entity) {
        results.set(key, entity);
      }
    });

    await Promise.all(promises);
    return results;
  }

  async increment(
    key: string,
    windowMs: number,
    algorithm: RateLimitAlgorithm,
    maxRequests: number
  ): Promise<RateLimitResult> {
    const now = Date.now();
    let entity = await this.findByKey(key);

    // Calculate window based on algorithm
    let resetTime: number;
    switch (algorithm) {
      case 'fixed-window':
        resetTime = Math.floor(now / windowMs) * windowMs + windowMs;
        break;
      case 'sliding-window':
        resetTime = now + windowMs;
        break;
      case 'token-bucket':
        resetTime = now + windowMs;
        break;
      default:
        resetTime = now + windowMs;
    }

    if (!entity || entity.isExpired(now)) {
      // Create new entity
      entity = RateLimitEntity.create({
        key,
        count: 1,
        resetTime,
        algorithm,
      });
    } else {
      // Increment existing entity
      entity = entity.increment();
    }

    // Save updated entity
    await this.save(entity);

    // Return result
    return {
      allowed: !entity.hasExceededLimit(maxRequests),
      remaining: entity.getRemainingRequests(maxRequests),
      resetTime: entity.resetTime,
      totalHits: entity.count,
      limit: maxRequests,
    };
  }
}
