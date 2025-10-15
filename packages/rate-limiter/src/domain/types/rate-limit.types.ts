import { z } from 'zod';

export const RateLimitAlgorithmSchema = z.enum([
  'fixed-window',
  'sliding-window',
  'token-bucket',
]);

export const RateLimitConfigSchema = z.object({
  windowMs: z.number().positive('Window must be positive'),
  maxRequests: z.number().positive('Max requests must be positive'),
  algorithm: RateLimitAlgorithmSchema.default('fixed-window'),
  keyGenerator: z.function().args(z.string()).returns(z.string()).optional(),
  skipSuccessfulRequests: z.boolean().default(false).optional(),
  skipFailedRequests: z.boolean().default(false).optional(),
  standardHeaders: z.boolean().default(true).optional(),
  legacyHeaders: z.boolean().default(false).optional(),
  store: z.enum(['memory', 'redis']).default('memory').optional(),
  redisUrl: z.string().url().optional(),
});

export const RateLimitResultSchema = z.object({
  allowed: z.boolean(),
  remaining: z.number().nonnegative(),
  resetTime: z.number(),
  totalHits: z.number().nonnegative(),
  limit: z.number().positive(),
});

export const RateLimitRecordSchema = z.object({
  key: z.string().min(1, 'Key cannot be empty'),
  count: z.number().nonnegative(),
  resetTime: z.number(),
  createdAt: z.number(),
  algorithm: RateLimitAlgorithmSchema,
});

export type RateLimitAlgorithm = z.infer<typeof RateLimitAlgorithmSchema>;
export type RateLimitConfig = z.infer<typeof RateLimitConfigSchema>;
export type RateLimitResult = z.infer<typeof RateLimitResultSchema>;
export type RateLimitRecord = z.infer<typeof RateLimitRecordSchema>;

export interface RateLimitHeaders {
  'X-RateLimit-Limit': number;
  'X-RateLimit-Remaining': number;
  'X-RateLimit-Reset': number;
  'X-RateLimit-Used': number;
  'Retry-After'?: number;
  [key: string]: string | number | undefined;
}

export interface LegacyRateLimitHeaders {
  'X-Rate-Limit-Limit': number;
  'X-Rate-Limit-Remaining': number;
  'X-Rate-Limit-Reset': number;
  [key: string]: string | number | undefined;
}

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

export type RateLimitMiddlewareOptions = {
  message?: string;
  statusCode?: number;
  headers?: Record<string, string | number>;
  onLimitReached?: (
    req: RateLimitRequest,
    res: RateLimitResponse
  ) => Promise<void> | void;
};
