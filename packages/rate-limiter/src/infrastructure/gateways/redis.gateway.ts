// packages/rate-limiter/src/infrastructure/gateways/redis.gateway.ts

import Redis, { type RedisOptions } from 'ioredis';
import { RateLimitEntity } from '../../domain/entities/rate-limit.entity.js';
import { BaseRateLimitRepository } from '../../domain/repositories/rate-limit.repository.js';
import {
  type RateLimitAlgorithm,
  type RateLimitResult,
  RateLimitStorageError,
} from '../../domain/types/rate-limit.types.js';

export interface RedisGatewayOptions {
  redis?: Redis | RedisOptions;
  keyPrefix?: string;
  retryAttempts?: number;
  retryDelayMs?: number;
}

export class RedisRateLimitGateway extends BaseRateLimitRepository {
  private readonly redis: Redis;
  private readonly keyPrefix: string;
  private readonly retryAttempts: number;
  private readonly retryDelayMs: number;
  private isShuttingDown = false;

  constructor(options: RedisGatewayOptions = {}) {
    super();
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
    this.setupEventHandlers();
  }

  async findByKey(key: string): Promise<RateLimitEntity | null> {
    try {
      const redisKey = this.buildRedisKey(key);
      const data = await this.executeWithRetry(() => this.redis.get(redisKey));
      if (!data) {
        return null;
      }
      const entity = RateLimitEntity.fromRecord(JSON.parse(data));
      if (entity.isExpired()) {
        await this.executeWithRetry(() => this.redis.del(redisKey));
        return null;
      }
      return entity;
    } catch (error) {
      throw new RateLimitStorageError(
        `Failed to find rate limit by key "${key}": ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async save(entity: RateLimitEntity): Promise<void> {
    const redisKey = this.buildRedisKey(entity.key);
    const ttlSeconds = Math.ceil(
      (Math.max(0, entity.resetTime - Date.now()) + 60_000) / 1000
    );
    await this.executeWithRetry(() =>
      this.redis.setex(redisKey, ttlSeconds, JSON.stringify(entity.toRecord()))
    );
  }

  async reset(key: string): Promise<void> {
    const redisKey = this.buildRedisKey(key);
    await this.executeWithRetry(() => this.redis.del(redisKey));
  }

  async exists(key: string): Promise<boolean> {
    const redisKey = this.buildRedisKey(key);
    const result = await this.executeWithRetry(() =>
      this.redis.exists(redisKey)
    );
    return result === 1;
  }

  async count(): Promise<number> {
    const keys = await this.executeWithRetry(() =>
      this.redis.keys(`${this.keyPrefix}*`)
    );
    return keys.length;
  }

  async cleanup(): Promise<number> {
    const keys = await this.executeWithRetry(() =>
      this.redis.keys(`${this.keyPrefix}*`)
    );
    if (keys.length === 0) {
      return 0;
    }
    const ttls = await Promise.all(keys.map(k => this.redis.ttl(k)));
    const expired = keys.filter((_, i) => {
      const ttl = ttls[i];
      return ttl !== undefined && ttl <= 0;
    });
    if (expired.length > 0) {
      await this.executeWithRetry(() => this.redis.unlink(...expired));
    }
    return expired.length;
  }

  async getKeys(pattern?: string): Promise<string[]> {
    const search = pattern
      ? `${this.keyPrefix}${pattern}`
      : `${this.keyPrefix}*`;
    const keys = await this.executeWithRetry(() => this.redis.keys(search));
    return keys.map(k => k.replace(this.keyPrefix, ''));
  }

  async healthCheck(): Promise<{
    connected: boolean;
    latency: number;
    error?: string;
  }> {
    const start = Date.now();
    const testKey = `health_check_${start}`;
    try {
      await this.executeWithRetry(() => this.redis.set(testKey, 'ok', 'EX', 1));
      await this.executeWithRetry(() => this.redis.get(testKey));
      await this.executeWithRetry(() => this.redis.del(testKey));
      return { connected: true, latency: Date.now() - start };
    } catch (e) {
      return {
        connected: false,
        latency: -1,
        error: e instanceof Error ? e.message : 'Unknown error',
      };
    }
  }

  override async resetMultiple(keys: string[]): Promise<void> {
    if (keys.length === 0) {
      return;
    }
    const redisKeys = keys.map(k => this.buildRedisKey(k));
    await this.executeWithRetry(() => this.redis.del(...redisKeys));
  }

  override async findByKeys(
    keys: string[]
  ): Promise<Map<string, RateLimitEntity>> {
    const results = new Map<string, RateLimitEntity>();
    if (keys.length === 0) {
      return results;
    }
    const redisKeys = keys.map(k => this.buildRedisKey(k));
    const values = await this.executeWithRetry(() =>
      this.redis.mget(...redisKeys)
    );
    keys.forEach((orig, i) => {
      const val = values[i];
      if (val) {
        try {
          const entity = RateLimitEntity.fromRecord(JSON.parse(val));
          if (!entity.isExpired()) {
            results.set(orig, entity);
          }
        } catch {
          // skip
        }
      }
    });
    return results;
  }

  override async increment(
    key: string,
    windowMs: number,
    algorithm: RateLimitAlgorithm,
    maxRequests: number
  ): Promise<RateLimitResult> {
    const redisKey = this.buildRedisKey(key);
    try {
      const [count, resetTime] = (await this.executeWithRetry(() =>
        this.redis.eval(
          this.getLuaScript(algorithm),
          1,
          redisKey,
          Date.now().toString(),
          windowMs.toString(),
          maxRequests.toString()
        )
      )) as [number, number, number];
      return {
        allowed: count <= maxRequests,
        remaining: Math.max(0, maxRequests - count),
        resetTime,
        totalHits: count,
        limit: maxRequests,
      };
    } catch (e) {
      console.warn('Lua fallback:', e);
      return super.increment(key, windowMs, algorithm, maxRequests);
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

  private async executeWithRetry<T>(op: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        return await op();
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e));

        if (attempt < this.retryAttempts) {
          // Retry with exponential backoff
          const delay = this.retryDelayMs * 2 ** (attempt - 1);
          await new Promise<void>(resolve => {
            setTimeout(() => resolve(), delay);
          });
        }
      }
    }

    throw lastError ?? new Error('Operation failed without error');
  }

  private getLuaScript(algo: RateLimitAlgorithm): string {
    switch (algo) {
      case 'fixed-window':
        return `
          local key = KEYS[1]
          local now = tonumber(ARGV[1])
          local windowMs = tonumber(ARGV[2])
          local maxRequests = tonumber(ARGV[3])
          
          local window = math.floor(now / windowMs) * windowMs
          local windowKey = key .. ':' .. window
          local resetTime = window + windowMs
          
          local count = redis.call('INCR', windowKey)
          local ttl = math.ceil(windowMs / 1000) + 60
          redis.call('EXPIRE', windowKey, ttl)
          
          return {count, resetTime, ttl}
        `;
      case 'sliding-window':
        return `
          local key = KEYS[1]
          local now = tonumber(ARGV[1])
          local windowMs = tonumber(ARGV[2])
          local maxRequests = tonumber(ARGV[3])
          
          local cutoff = now - windowMs
          local resetTime = now + windowMs
          
          redis.call('ZREMRANGEBYSCORE', key, 0, cutoff)
          local count = redis.call('ZCARD', key)
          
          if count < maxRequests then
            redis.call('ZADD', key, now, now)
            count = count + 1
          end
          
          local ttl = math.ceil(windowMs / 1000) + 60
          redis.call('EXPIRE', key, ttl)
          
          return {count, resetTime, ttl}
        `;
      default:
        return this.getLuaScript('fixed-window');
    }
  }

  private setupEventHandlers(): void {
    this.redis.on('error', err => {
      if (!this.isShuttingDown) {
        console.error('Redis error:', err);
      }
    });
    this.redis.on('connect', () => console.warn('Redis connected'));
    this.redis.on('disconnect', () => console.warn('Redis disconnected'));
  }
}
