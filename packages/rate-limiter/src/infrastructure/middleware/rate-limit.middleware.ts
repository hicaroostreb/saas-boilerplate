// packages/rate-limiter/src/infrastructure/middleware/rate-limit.middleware.ts

import type { RateLimitService } from '../../domain/services/rate-limit.service.js';
import {
  RateLimitValidationError,
  type RateLimitConfig,
} from '../../domain/types/rate-limit.types.js';

// Generic request/response interfaces for framework compatibility
export interface RateLimitRequest {
  ip?: string;
  user?: { id: string | number };
  headers: Record<string, string | string[] | undefined>;
  method?: string;
  url?: string;
  path?: string;
  originalUrl?: string;
}

export interface RateLimitResponse {
  status(code: number): RateLimitResponse;
  json(body: unknown): RateLimitResponse | void;
  send(body: unknown): RateLimitResponse | void;
  set(headers: Record<string, string | number>): RateLimitResponse;
  header(name: string, value: string | number): RateLimitResponse;
  end(): void;
}

export type NextFunction = (error?: unknown) => void;

export interface RateLimitContext {
  identifier: string;
  key: string;
  algorithm: string;
  config: RateLimitConfig;
}

/**
 * Identifier extraction strategies
 */
export type IdentifierExtractor = (
  req: RateLimitRequest
) => string | Promise<string>;

export const IdentifierExtractors = {
  /**
   * Extract IP address from request
   */
  ip: (req: RateLimitRequest): string => {
    // Check various headers for real IP
    const headers = req.headers;

    const forwarded = headers['x-forwarded-for'];
    if (forwarded) {
      const forwardedStr = Array.isArray(forwarded) ? forwarded[0] : forwarded;
      if (forwardedStr) {
        return forwardedStr.split(',')[0]?.trim() ?? req.ip ?? 'unknown';
      }
    }

    const realIp = headers['x-real-ip'];
    if (realIp) {
      const realIpStr = Array.isArray(realIp) ? realIp[0] : realIp;
      return realIpStr ?? req.ip ?? 'unknown';
    }

    const cfConnectingIp = headers['cf-connecting-ip'];
    if (cfConnectingIp) {
      const cfIpStr = Array.isArray(cfConnectingIp)
        ? cfConnectingIp[0]
        : cfConnectingIp;
      return cfIpStr ?? req.ip ?? 'unknown';
    }

    return req.ip ?? 'unknown';
  },

  /**
   * Extract user ID from authenticated request
   */
  user: (req: RateLimitRequest): string => {
    if (!req.user?.id) {
      throw new RateLimitValidationError('User not authenticated', 'user.id');
    }
    return String(req.user.id);
  },

  /**
   * Extract from authorization header (API key, bearer token)
   */
  authorization: (req: RateLimitRequest): string => {
    const auth = req.headers.authorization;
    if (!auth) {
      throw new RateLimitValidationError(
        'Authorization header missing',
        'authorization'
      );
    }

    const authStr = Array.isArray(auth) ? auth[0] : auth;
    if (!authStr) {
      throw new RateLimitValidationError(
        'Authorization header empty',
        'authorization'
      );
    }

    // Extract token part (remove "Bearer ", "API-Key ", etc.)
    const token = authStr.split(' ')[1] ?? authStr;
    return token;
  },

  /**
   * Combine IP and User ID for hybrid approach
   */
  ipAndUser: (req: RateLimitRequest): string => {
    const ip = IdentifierExtractors.ip(req);
    const userId = req.user?.id ? String(req.user.id) : 'anonymous';
    return `${ip}:${userId}`;
  },

  /**
   * Extract from custom header
   */
  customHeader:
    (headerName: string) =>
    (req: RateLimitRequest): string => {
      const value = req.headers[headerName.toLowerCase()];
      if (!value) {
        throw new RateLimitValidationError(
          `Header ${headerName} missing`,
          headerName
        );
      }
      const valueStr = Array.isArray(value) ? value[0] : value;
      return valueStr ?? '';
    },

  /**
   * Extract from URL path (for endpoint-specific limiting)
   */
  endpoint: (req: RateLimitRequest): string => {
    const path = req.path ?? req.url ?? req.originalUrl ?? '/';
    const method = req.method ?? 'GET';
    return `${method}:${path}`;
  },

  /**
   * Global limiter (same for all requests)
   */
  global: (): string => 'global',
};

/**
 * Response handler for rate limit violations
 */
export interface RateLimitHandler {
  (
    req: RateLimitRequest,
    res: RateLimitResponse,
    context: RateLimitContext
  ): Promise<void> | void;
}

export const DefaultRateLimitHandlers = {
  /**
   * Standard JSON error response
   */
  json: (options?: {
    message?: string;
    statusCode?: number;
  }): RateLimitHandler => {
    return (_req, res, context) => {
      res.status(options?.statusCode ?? 429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message:
            options?.message ?? 'Too many requests. Please try again later.',
          type: 'RateLimitError',
        },
        details: {
          limit: context.config.maxRequests,
          algorithm: context.algorithm,
          retryAfter: Math.ceil((Date.now() - Date.now()) / 1000), // Will be set properly
        },
      });
    };
  },

  /**
   * Simple text response
   */
  text: (options?: {
    message?: string;
    statusCode?: number;
  }): RateLimitHandler => {
    return (_req, res, _context) => {
      const message = options?.message ?? 'Rate limit exceeded';
      res.status(options?.statusCode ?? 429).send(message);
    };
  },

  /**
   * Custom handler with full context
   */
  custom: (handler: RateLimitHandler): RateLimitHandler => handler,
};

/**
 * Main middleware factory
 */
export function createRateLimitMiddleware(
  rateLimitService: RateLimitService,
  options: {
    identifierExtractor?: IdentifierExtractor;
    onLimitReached?: RateLimitHandler;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
    standardHeaders?: boolean;
    legacyHeaders?: boolean;
    keyPrefix?: string;
    onError?: (
      error: Error,
      req: RateLimitRequest,
      res: RateLimitResponse
    ) => void;
  } = {}
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
      // Extract identifier
      const identifier = await identifierExtractor(req);

      if (!identifier) {
        throw new RateLimitValidationError(
          'Could not extract identifier from request',
          'identifier'
        );
      }

      // Check rate limit
      const result = await rateLimitService.checkLimit(identifier);

      // Set headers
      if (standardHeaders) {
        const headers: Record<string, string | number> = {
          'X-RateLimit-Limit': result.limit,
          'X-RateLimit-Remaining': result.remaining,
          'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000),
          'X-RateLimit-Used': result.totalHits,
        };

        if (!result.allowed) {
          headers['Retry-After'] = Math.ceil(
            (result.resetTime - Date.now()) / 1000
          );
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

      // Check if request should be blocked
      if (!result.allowed) {
        const context: RateLimitContext = {
          identifier,
          key: identifier, // Will be generated internally
          algorithm: config.algorithm,
          config,
        };

        await onLimitReached(req, res, context);
        return;
      }

      // Request allowed, continue
      next();
    } catch (error) {
      if (options.onError) {
        options.onError(error as Error, req, res);
      } else {
        // Default error handling
        console.error('Rate limit middleware error:', error);

        // Continue on errors to avoid breaking the application
        next();
      }
    }
  };
}

/**
 * Express.js specific middleware
 */
export function createExpressRateLimit(
  rateLimitService: RateLimitService,
  options?: Parameters<typeof createRateLimitMiddleware>[1]
) {
  return createRateLimitMiddleware(rateLimitService, options);
}

interface FastifyLikeRequest {
  ip: string;
  [key: string]: unknown;
}

/**
 * Fastify specific middleware
 */
export function createFastifyRateLimit(
  rateLimitService: RateLimitService,
  options?: Parameters<typeof createRateLimitMiddleware>[1]
) {
  return createRateLimitMiddleware(rateLimitService, {
    ...options,
    identifierExtractor:
      options?.identifierExtractor ??
      ((req: unknown) => (req as FastifyLikeRequest).ip),
  });
}

interface NextLikeRequest {
  headers: Record<string, string | string[] | undefined>;
  connection?: { remoteAddress?: string };
  socket?: { remoteAddress?: string };
  [key: string]: unknown;
}

/**
 * Next.js API Routes middleware
 */
export function createNextRateLimit(
  rateLimitService: RateLimitService,
  options?: Parameters<typeof createRateLimitMiddleware>[1]
) {
  return createRateLimitMiddleware(rateLimitService, {
    ...options,
    identifierExtractor:
      options?.identifierExtractor ??
      ((req: unknown) => {
        const nextReq = req as NextLikeRequest;
        // Next.js specific IP extraction
        const forwarded = nextReq.headers['x-forwarded-for'];
        if (forwarded) {
          const forwardedStr = Array.isArray(forwarded)
            ? forwarded[0]
            : forwarded;
          if (forwardedStr) {
            return forwardedStr.split(',')[0]?.trim() ?? 'unknown';
          }
        }

        return (
          nextReq.connection?.remoteAddress ??
          nextReq.socket?.remoteAddress ??
          'unknown'
        );
      }),
  });
}

/**
 * Multiple rate limiters middleware (for different endpoints)
 */
export function createMultipleRateLimits(
  limiters: Array<{
    path?: string | RegExp;
    method?: string | string[];
    service: RateLimitService;
    options?: Parameters<typeof createRateLimitMiddleware>[1];
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

    // Find matching limiter
    const matchingLimiter = middlewares.find(limiter => {
      // Check path
      if (limiter.path) {
        if (limiter.path instanceof RegExp) {
          if (!limiter.path.test(path)) {
            return false;
          }
        } else if (path !== limiter.path) {
          return false;
        }
      }

      // Check method
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
      // No matching limiter, continue
      next();
    }
  };
}

/**
 * Utility functions for middleware configuration
 */
export const MiddlewareUtils = {
  /**
   * Create identifier extractor that combines multiple strategies
   */
  combineExtractors: (
    ...extractors: IdentifierExtractor[]
  ): IdentifierExtractor => {
    return async (req: RateLimitRequest): Promise<string> => {
      const identifierPromises = extractors.map(async extractor => {
        try {
          const id = await extractor(req);
          return id || null;
        } catch {
          return null;
        }
      });

      const identifiers = (await Promise.all(identifierPromises)).filter(
        (id): id is string => Boolean(id)
      );

      if (identifiers.length === 0) {
        throw new RateLimitValidationError(
          'No identifier could be extracted',
          'identifier'
        );
      }

      return identifiers.join(':');
    };
  },

  /**
   * Create conditional extractor based on request properties
   */
  conditionalExtractor: (
    condition: (req: RateLimitRequest) => boolean,
    trueExtractor: IdentifierExtractor,
    falseExtractor: IdentifierExtractor
  ): IdentifierExtractor => {
    return async (req: RateLimitRequest): Promise<string> => {
      const extractor = condition(req) ? trueExtractor : falseExtractor;
      return await extractor(req);
    };
  },

  /**
   * Create rate limit handler with custom logic
   */
  createCustomHandler: (
    handler: (
      req: RateLimitRequest,
      res: RateLimitResponse,
      context: RateLimitContext
    ) => void
  ): RateLimitHandler => {
    return handler;
  },

  /**
   * Skip rate limiting based on condition
   */
  skipIf: (
    condition: (req: RateLimitRequest) => boolean | Promise<boolean>,
    middleware: ReturnType<typeof createRateLimitMiddleware>
  ) => {
    return async (
      req: RateLimitRequest,
      res: RateLimitResponse,
      next: NextFunction
    ) => {
      const shouldSkip = await condition(req);
      if (shouldSkip) {
        return next();
      }
      return middleware(req, res, next);
    };
  },
};
