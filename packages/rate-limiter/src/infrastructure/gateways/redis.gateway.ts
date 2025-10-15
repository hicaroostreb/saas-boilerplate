import Redis, { type RedisOptions } from 'ioredis';
import type { ILogger } from '../../domain/ports/logger.port.js';
import type {
  HealthCheckResult,
  IRateLimitRepository,
} from '../../domain/ports/rate-limit-repository.port.js';
import { RateLimitStorageError } from '../../domain/types/errors.js';
import type { RateLimitRecord } from '../../domain/types/rate-limit.types.js';

export interface RedisGatewayOptions {
  redis?: Redis | RedisOptions;
  keyPrefix?: string;
  retryAttempts?: number;
  retryDelayMs?: number;
  logger?: ILogger;
}

export class RedisRateLimitGateway implements IRateLimitRepository {
  private readonly redis: Redis;
  private readonly keyPrefix: string;
  private readonly retryAttempts: number;
  private readonly retryDelayMs: number;
  private readonly logger?: ILogger;
  private isShuttingDown = false;

  constructor(options: RedisGatewayOptions = {}) {
    this.redis =
      options.redis instanceof Redis
        ? options.redis
        : new Redis({
            lazyConnect: true,
            maxRetriesPerRequest: 3,
            ...options.redis,
          });
    this.keyPrefix = options.keyPrefix ?? 'rate_limit:';
    this.retryAttempts = options.retryAttempts ?? 3;
    this.retryDelayMs = options.retryDelayMs ?? 100;
    this.logger = options.logger;
    this.setupEventHandlers();
  }

  async findByKey(key: string): Promise<RateLimitRecord | null> {
    try {
      const redisKey = this.buildRedisKey(key);
      const data = await this.executeWithRetry(() => this.redis.get(redisKey));

      if (!data) {
        return null;
      }

      const record = JSON.parse(data) as RateLimitRecord;

      if (record.resetTime <= Date.now()) {
        await this.executeWithRetry(() => this.redis.del(redisKey));
        return null;
      }

      return record;
    } catch (error) {
      throw new RateLimitStorageError(
        `Failed to find rate limit by key "${key}": ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async save(record: RateLimitRecord, ttlMs: number): Promise<void> {
    try {
      const redisKey = this.buildRedisKey(record.key);
      const ttlSeconds = Math.ceil(ttlMs / 1000);

      await this.executeWithRetry(() =>
        this.redis.setex(redisKey, ttlSeconds, JSON.stringify(record))
      );
    } catch (error) {
      throw new RateLimitStorageError(
        `Failed to save rate limit record: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const redisKey = this.buildRedisKey(key);
      await this.executeWithRetry(() => this.redis.del(redisKey));
    } catch (error) {
      throw new RateLimitStorageError(
        `Failed to delete rate limit for key "${key}": ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async deleteMultiple(keys: string[]): Promise<void> {
    if (keys.length === 0) {
      return;
    }

    try {
      const redisKeys = keys.map(k => this.buildRedisKey(k));
      await this.executeWithRetry(() => this.redis.del(...redisKeys));
    } catch (error) {
      throw new RateLimitStorageError(
        `Failed to delete multiple keys: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async findByKeys(keys: string[]): Promise<Map<string, RateLimitRecord>> {
    const results = new Map<string, RateLimitRecord>();

    if (keys.length === 0) {
      return results;
    }

    try {
      const redisKeys = keys.map(k => this.buildRedisKey(k));
      const values = await this.executeWithRetry(() =>
        this.redis.mget(...redisKeys)
      );

      keys.forEach((originalKey, i) => {
        const value = values[i];
        if (value) {
          try {
            const record = JSON.parse(value) as RateLimitRecord;
            if (record.resetTime > Date.now()) {
              results.set(originalKey, record);
            }
          } catch {
            this.logger?.warn('Failed to parse record', { key: originalKey });
          }
        }
      });

      return results;
    } catch (error) {
      throw new RateLimitStorageError(
        `Failed to find multiple keys: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const redisKey = this.buildRedisKey(key);
      const result = await this.executeWithRetry(() =>
        this.redis.exists(redisKey)
      );
      return result === 1;
    } catch (error) {
      throw new RateLimitStorageError(
        `Failed to check existence for key "${key}": ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async count(): Promise<number> {
    try {
      const keys = await this.executeWithRetry(() =>
        this.redis.keys(`${this.keyPrefix}*`)
      );
      return keys.length;
    } catch (error) {
      throw new RateLimitStorageError(
        `Failed to count rate limit entries: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async cleanup(): Promise<number> {
    try {
      const keys = await this.executeWithRetry(() =>
        this.redis.keys(`${this.keyPrefix}*`)
      );

      if (keys.length === 0) {
        return 0;
      }

      const ttls = await Promise.all(
        keys.map(k => this.executeWithRetry(() => this.redis.ttl(k)))
      );

      const expiredKeys: string[] = [];
      keys.forEach((key, i) => {
        const ttl = ttls[i];
        if (ttl !== undefined && ttl <= 0) {
          expiredKeys.push(key);
        }
      });

      if (expiredKeys.length > 0) {
        await this.executeWithRetry(() => this.redis.unlink(...expiredKeys));
      }

      return expiredKeys.length;
    } catch (error) {
      throw new RateLimitStorageError(
        `Failed to cleanup expired entries: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getKeys(pattern?: string): Promise<string[]> {
    try {
      const search = pattern
        ? `${this.keyPrefix}${pattern}`
        : `${this.keyPrefix}*`;
      const keys = await this.executeWithRetry(() => this.redis.keys(search));
      return keys.map(k => k.replace(this.keyPrefix, ''));
    } catch (error) {
      throw new RateLimitStorageError(
        `Failed to get keys with pattern "${pattern ?? '*'}": ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async healthCheck(): Promise<HealthCheckResult> {
    const start = Date.now();
    const testKey = this.buildRedisKey(`health_check_${start}`);

    try {
      await this.executeWithRetry(() => this.redis.set(testKey, 'ok', 'EX', 1));
      await this.executeWithRetry(() => this.redis.get(testKey));
      await this.executeWithRetry(() => this.redis.del(testKey));

      return {
        connected: true,
        latency: Date.now() - start,
      };
    } catch (error) {
      return {
        connected: false,
        latency: -1,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async shutdown(): Promise<void> {
    this.isShuttingDown = true;
    if (this.redis.status !== 'end') {
      await this.redis.quit();
    }
  }

  private buildRedisKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  private async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < this.retryAttempts) {
          const delay = this.retryDelayMs * 2 ** (attempt - 1);
          await new Promise<void>(resolve => {
            setTimeout(() => {
              resolve();
            }, delay);
          });
        }
      }
    }

    throw lastError ?? new Error('Operation failed without error');
  }

  private setupEventHandlers(): void {
    this.redis.on('error', err => {
      if (!this.isShuttingDown) {
        this.logger?.error('Redis connection error', {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    });

    this.redis.on('connect', () => {
      this.logger?.info('Redis connected');
    });

    this.redis.on('disconnect', () => {
      this.logger?.warn('Redis disconnected');
    });
  }
}
