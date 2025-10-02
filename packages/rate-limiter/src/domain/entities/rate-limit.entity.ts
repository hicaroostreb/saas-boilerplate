// packages/rate-limiter/src/domain/entities/rate-limit.entity.ts

import {
  type RateLimitAlgorithm,
  type RateLimitRecord,
  RateLimitRecordSchema,
  RateLimitValidationError,
} from '../types/rate-limit.types.js';

export class RateLimitEntity {
  private constructor(
    public readonly key: string,
    public readonly count: number,
    public readonly resetTime: number,
    public readonly createdAt: number,
    public readonly algorithm: RateLimitAlgorithm
  ) {}

  static create(data: {
    key: string;
    count?: number;
    resetTime: number;
    algorithm: RateLimitAlgorithm;
  }): RateLimitEntity {
    const now = Date.now();

    const record: RateLimitRecord = {
      key: data.key,
      count: data.count ?? 1,
      resetTime: data.resetTime,
      createdAt: now,
      algorithm: data.algorithm,
    };

    const validation = RateLimitRecordSchema.safeParse(record);

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      throw new RateLimitValidationError(
        `Invalid rate limit entity: ${firstError?.message}`,
        firstError?.path.join('.') ?? 'unknown'
      );
    }

    return new RateLimitEntity(
      record.key,
      record.count,
      record.resetTime,
      record.createdAt,
      record.algorithm
    );
  }

  static fromRecord(record: RateLimitRecord): RateLimitEntity {
    const validation = RateLimitRecordSchema.safeParse(record);

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      throw new RateLimitValidationError(
        `Invalid rate limit record: ${firstError?.message}`,
        firstError?.path.join('.') ?? 'unknown'
      );
    }

    return new RateLimitEntity(
      record.key,
      record.count,
      record.resetTime,
      record.createdAt,
      record.algorithm
    );
  }

  increment(): RateLimitEntity {
    return new RateLimitEntity(
      this.key,
      this.count + 1,
      this.resetTime,
      this.createdAt,
      this.algorithm
    );
  }

  reset(newResetTime: number): RateLimitEntity {
    return new RateLimitEntity(
      this.key,
      0,
      newResetTime,
      Date.now(),
      this.algorithm
    );
  }

  isExpired(currentTime?: number): boolean {
    const now = currentTime ?? Date.now();
    return now >= this.resetTime;
  }

  hasExceededLimit(maxRequests: number): boolean {
    return this.count > maxRequests;
  }

  getRemainingRequests(maxRequests: number): number {
    return Math.max(0, maxRequests - this.count);
  }

  getTimeUntilReset(currentTime?: number): number {
    const now = currentTime ?? Date.now();
    return Math.max(0, this.resetTime - now);
  }

  toRecord(): RateLimitRecord {
    return {
      key: this.key,
      count: this.count,
      resetTime: this.resetTime,
      createdAt: this.createdAt,
      algorithm: this.algorithm,
    };
  }

  toJSON(): RateLimitRecord {
    return this.toRecord();
  }

  equals(other: RateLimitEntity): boolean {
    return (
      this.key === other.key &&
      this.count === other.count &&
      this.resetTime === other.resetTime &&
      this.createdAt === other.createdAt &&
      this.algorithm === other.algorithm
    );
  }

  toString(): string {
    return `RateLimitEntity(key=${this.key}, count=${this.count}, resetTime=${this.resetTime}, algorithm=${this.algorithm})`;
  }
}
