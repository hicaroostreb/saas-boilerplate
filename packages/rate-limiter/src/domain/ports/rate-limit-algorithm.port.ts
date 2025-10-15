import type { RateLimitRecord } from '../types/rate-limit.types.js';

export interface AlgorithmConfig {
  windowMs: number;
  maxRequests: number;
}

export interface AlgorithmResult {
  record: RateLimitRecord;
  allowed: boolean;
  remaining: number;
  resetTime: number;
  totalHits: number;
}

export interface IRateLimitAlgorithm {
  process(
    record: RateLimitRecord | null,
    config: AlgorithmConfig,
    currentTime: number
  ): AlgorithmResult;
}
