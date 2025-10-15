import type { RateLimitRecord } from '../types/rate-limit.types.js';

export interface HealthCheckResult {
  connected: boolean;
  latency: number;
  error?: string;
}

export interface IRateLimitRepository {
  findByKey(key: string): Promise<RateLimitRecord | null>;

  save(record: RateLimitRecord, ttlMs: number): Promise<void>;

  delete(key: string): Promise<void>;

  deleteMultiple(keys: string[]): Promise<void>;

  findByKeys(keys: string[]): Promise<Map<string, RateLimitRecord>>;

  exists(key: string): Promise<boolean>;

  count(): Promise<number>;

  cleanup(): Promise<number>;

  getKeys(pattern?: string): Promise<string[]>;

  healthCheck(): Promise<HealthCheckResult>;
}
