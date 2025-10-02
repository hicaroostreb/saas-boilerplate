// packages/rate-limiter/src/domain/types/rate-limit.types.ts

import { z } from 'zod';

// ===== VALIDATION SCHEMAS =====

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

// ===== INFERRED TYPES =====

export type RateLimitAlgorithm = z.infer<typeof RateLimitAlgorithmSchema>;
export type RateLimitConfig = z.infer<typeof RateLimitConfigSchema>;
export type RateLimitResult = z.infer<typeof RateLimitResultSchema>;
export type RateLimitRecord = z.infer<typeof RateLimitRecordSchema>;

// ===== DOMAIN INTERFACES =====

export interface IRateLimitRepository {
  findByKey(key: string): Promise<RateLimitRecord | null>;
  save(record: RateLimitRecord): Promise<void>;
  increment(key: string, windowMs: number): Promise<RateLimitResult>;
  reset(key: string): Promise<void>;
  cleanup(): Promise<void>;
}

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

export interface IStorageGateway {
  get(key: string): Promise<RateLimitRecord | null>;
  set(key: string, record: RateLimitRecord, ttl?: number): Promise<void>;
  increment(
    key: string,
    windowMs: number,
    algorithm: RateLimitAlgorithm
  ): Promise<RateLimitResult>;
  delete(key: string): Promise<void>;
  cleanup(): Promise<void>;
  isConnected(): Promise<boolean>;
}

// ===== DOMAIN EXCEPTIONS =====

export class RateLimitDomainError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'RateLimitDomainError';
  }
}

export class RateLimitValidationError extends RateLimitDomainError {
  constructor(
    message: string,
    public readonly field: string
  ) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'RateLimitValidationError';
  }
}

export class RateLimitStorageError extends RateLimitDomainError {
  constructor(message: string) {
    super(message, 'STORAGE_ERROR');
    this.name = 'RateLimitStorageError';
  }
}

// ===== UTILITY TYPES =====

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
