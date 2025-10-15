import type {
  RateLimitRequest,
  RateLimitResponse,
} from '../../domain/types/rate-limit.types.js';

export interface RateLimitContext {
  identifier: string;
  key: string;
  algorithm: string;
  limit: number;
  resetTime: number;
}

export interface RateLimitHandler {
  (
    req: RateLimitRequest,
    res: RateLimitResponse,
    context: RateLimitContext
  ): Promise<void> | void;
}

export const DefaultRateLimitHandlers = {
  json: (options?: {
    message?: string;
    statusCode?: number;
  }): RateLimitHandler => {
    return (_req, res, context) => {
      const retryAfter = Math.ceil((context.resetTime - Date.now()) / 1000);

      res.status(options?.statusCode ?? 429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message:
            options?.message ?? 'Too many requests. Please try again later.',
          type: 'RateLimitError',
        },
        details: {
          limit: context.limit,
          algorithm: context.algorithm,
          retryAfter: Math.max(0, retryAfter),
        },
      });
    };
  },

  text: (options?: {
    message?: string;
    statusCode?: number;
  }): RateLimitHandler => {
    return (_req, res, _context) => {
      const message = options?.message ?? 'Rate limit exceeded';
      res.status(options?.statusCode ?? 429).send(message);
    };
  },

  custom: (handler: RateLimitHandler): RateLimitHandler => handler,
};
