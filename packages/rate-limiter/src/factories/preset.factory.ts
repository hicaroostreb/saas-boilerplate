import type { RateLimitService } from '../domain/services/rate-limit.service.js';
import type { RedisGatewayOptions } from '../infrastructure/gateways/redis.gateway.js';
import { TIME_UNITS } from '../shared/constants/time-units.js';
import {
  createMemoryRateLimiter,
  createRedisRateLimiter,
} from './rate-limiter.factory.js';

export const RateLimiterPresets = {
  api: (redisOptions?: RedisGatewayOptions): RateLimitService => {
    return createRedisRateLimiter(
      {
        windowMs: TIME_UNITS.minute,
        maxRequests: 100,
        algorithm: 'sliding-window',
        standardHeaders: true,
        store: 'redis',
      },
      redisOptions
    );
  },

  strict: (redisOptions?: RedisGatewayOptions): RateLimitService => {
    return createRedisRateLimiter(
      {
        windowMs: TIME_UNITS.minute,
        maxRequests: 50,
        algorithm: 'fixed-window',
        standardHeaders: true,
        store: 'redis',
      },
      redisOptions
    );
  },

  burstFriendly: (redisOptions?: RedisGatewayOptions): RateLimitService => {
    return createRedisRateLimiter(
      {
        windowMs: TIME_UNITS.minute,
        maxRequests: 200,
        algorithm: 'token-bucket',
        standardHeaders: true,
        store: 'redis',
      },
      redisOptions
    );
  },

  development: (): RateLimitService => {
    return createMemoryRateLimiter({
      windowMs: TIME_UNITS.minute,
      maxRequests: 1000,
      algorithm: 'sliding-window',
      standardHeaders: true,
      store: 'memory',
    });
  },

  auth: (redisOptions?: RedisGatewayOptions): RateLimitService => {
    return createRedisRateLimiter(
      {
        windowMs: 15 * TIME_UNITS.minute,
        maxRequests: 5,
        algorithm: 'fixed-window',
        standardHeaders: true,
        store: 'redis',
      },
      redisOptions
    );
  },

  global: (
    maxRequestsPerMinute: number,
    redisOptions?: RedisGatewayOptions
  ): RateLimitService => {
    return createRedisRateLimiter(
      {
        windowMs: TIME_UNITS.minute,
        maxRequests: maxRequestsPerMinute,
        algorithm: 'sliding-window',
        standardHeaders: true,
        store: 'redis',
      },
      redisOptions
    );
  },
};
