import type { ILogger } from '../domain/ports/logger.port.js';
import type { RateLimitConfig } from '../domain/types/rate-limit.types.js';
import type { RedisGatewayOptions } from '../infrastructure/gateways/redis.gateway.js';
import {
  createExpressRateLimit,
  createFastifyRateLimit,
  createNextRateLimit,
} from '../infrastructure/middleware/framework-adapters.js';
import { createRateLimiter } from './rate-limiter.factory.js';

export interface CompleteSetupOptions {
  config: Partial<RateLimitConfig>;
  storage?: {
    type?: 'memory' | 'redis';
    redis?: RedisGatewayOptions;
    memory?: { cleanupIntervalMs?: number; logger?: ILogger };
  };
  middleware?: {
    framework?: 'express' | 'fastify' | 'next';
    [key: string]: unknown;
  };
}

export function createCompleteRateLimit(options: CompleteSetupOptions) {
  const service = createRateLimiter(options.config, options.storage);

  const middlewareOptions = options.middleware as
    | Record<string, unknown>
    | undefined;

  let middleware;

  switch (options.middleware?.framework) {
    case 'fastify': {
      middleware = createFastifyRateLimit(service, middlewareOptions);
      break;
    }
    case 'next': {
      middleware = createNextRateLimit(service, middlewareOptions);
      break;
    }
    case 'express':
    default: {
      middleware = createExpressRateLimit(service, middlewareOptions);
      break;
    }
  }

  return {
    service,
    middleware,
    checkLimit: (identifier: string) => service.checkLimit(identifier),
    resetLimit: (identifier: string) => service.resetLimit(identifier),
    getConfig: () => service.getConfig(),
    healthCheck: () => service.getHealthStatus(),
  };
}
