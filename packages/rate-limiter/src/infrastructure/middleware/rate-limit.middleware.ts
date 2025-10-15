import type { IRateLimitService } from '../../domain/services/rate-limit.service.js';
import { RateLimitValidationError } from '../../domain/types/errors.js';
import type {
  RateLimitRequest,
  RateLimitResponse,
} from '../../domain/types/rate-limit.types.js';
import {
  IdentifierExtractors,
  type IdentifierExtractor,
} from './identifier-extractors.js';
import type { NextFunction } from './middleware-utils.js';
import {
  DefaultRateLimitHandlers,
  type RateLimitContext,
  type RateLimitHandler,
} from './rate-limit-handlers.js';

export interface RateLimitMiddlewareOptions {
  identifierExtractor?: IdentifierExtractor;
  onLimitReached?: RateLimitHandler;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
  onError?: (
    error: Error,
    req: RateLimitRequest,
    res: RateLimitResponse
  ) => void;
}

export function createRateLimitMiddleware(
  rateLimitService: IRateLimitService,
  options: RateLimitMiddlewareOptions = {}
) {
  const config = rateLimitService.getConfig();

  const identifierExtractor =
    options.identifierExtractor ?? IdentifierExtractors.ip;
  const onLimitReached =
    options.onLimitReached ?? DefaultRateLimitHandlers.json();
  const standardHeaders =
    options.standardHeaders ?? config.standardHeaders ?? true;
  const legacyHeaders = options.legacyHeaders ?? config.legacyHeaders ?? false;

  return async function rateLimitMiddleware(
    req: RateLimitRequest,
    res: RateLimitResponse,
    next: NextFunction
  ): Promise<void> {
    try {
      const identifier = await identifierExtractor(req);

      if (!identifier) {
        throw new RateLimitValidationError(
          'Could not extract identifier from request',
          'identifier'
        );
      }

      const result = await rateLimitService.checkLimit(identifier);

      if (standardHeaders) {
        const headers: Record<string, string | number> = {
          'X-RateLimit-Limit': result.limit,
          'X-RateLimit-Remaining': result.remaining,
          'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000),
          'X-RateLimit-Used': result.totalHits,
        };

        if (!result.allowed) {
          const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
          headers['Retry-After'] = Math.max(0, retryAfter);
        }

        res.set(headers);
      }

      if (legacyHeaders) {
        const legacyHeadersObj: Record<string, string | number> = {
          'X-Rate-Limit-Limit': result.limit,
          'X-Rate-Limit-Remaining': result.remaining,
          'X-Rate-Limit-Reset': Math.ceil(result.resetTime / 1000),
        };

        res.set(legacyHeadersObj);
      }

      if (!result.allowed) {
        const context: RateLimitContext = {
          identifier,
          key: identifier,
          algorithm: config.algorithm,
          limit: result.limit,
          resetTime: result.resetTime,
        };

        await onLimitReached(req, res, context);
        return;
      }

      next();
    } catch (error) {
      if (options.onError) {
        options.onError(error as Error, req, res);
      } else {
        next();
      }
    }
  };
}

export function createMultipleRateLimits(
  limiters: Array<{
    path?: string | RegExp;
    method?: string | string[];
    service: IRateLimitService;
    options?: RateLimitMiddlewareOptions;
  }>
) {
  const middlewares = limiters.map(limiter => ({
    ...limiter,
    middleware: createRateLimitMiddleware(limiter.service, limiter.options),
  }));

  return async function multipleRateLimitsMiddleware(
    req: RateLimitRequest,
    res: RateLimitResponse,
    next: NextFunction
  ): Promise<void> {
    const path = req.path ?? req.url ?? req.originalUrl ?? '/';
    const method = req.method ?? 'GET';

    const matchingLimiter = middlewares.find(limiter => {
      if (limiter.path) {
        if (limiter.path instanceof RegExp) {
          if (!limiter.path.test(path)) {
            return false;
          }
        } else if (path !== limiter.path) {
          return false;
        }
      }

      if (limiter.method) {
        const methods = Array.isArray(limiter.method)
          ? limiter.method
          : [limiter.method];
        if (!methods.includes(method)) {
          return false;
        }
      }

      return true;
    });

    if (matchingLimiter) {
      await matchingLimiter.middleware(req, res, next);
    } else {
      next();
    }
  };
}
