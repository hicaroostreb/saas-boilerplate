import { RateLimitValidationError } from '../../domain/types/errors.js';
import type {
  RateLimitRequest,
  RateLimitResponse,
} from '../../domain/types/rate-limit.types.js';
import type { IdentifierExtractor } from './identifier-extractors.js';
import type { RateLimitHandler } from './rate-limit-handlers.js';

export const MiddlewareUtils = {
  combineExtractors: (
    ...extractors: IdentifierExtractor[]
  ): IdentifierExtractor => {
    return async (req: RateLimitRequest): Promise<string> => {
      const identifierPromises = extractors.map(async extractor => {
        try {
          const id = await extractor(req);
          return id ?? null;
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

  createCustomHandler: (
    handler: (
      req: RateLimitRequest,
      res: RateLimitResponse,
      context: RateLimitContext
    ) => void
  ): RateLimitHandler => {
    return handler;
  },
};

export interface RateLimitContext {
  identifier: string;
  key: string;
  algorithm: string;
  limit: number;
  resetTime: number;
}

export type NextFunction = (error?: unknown) => void;
