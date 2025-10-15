import type { RateLimitAlgorithm } from '../types/rate-limit.types.js';

export interface IKeyGenerator {
  generate(identifier: string, algorithm: RateLimitAlgorithm): string;

  generateWithContext(
    identifier: string,
    algorithm: RateLimitAlgorithm,
    context: Record<string, string | number>
  ): string;
}
