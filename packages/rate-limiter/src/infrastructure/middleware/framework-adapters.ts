import type { IRateLimitService } from '../../domain/services/rate-limit.service.js';
import { IpExtractor } from '../../shared/utils/ip-extractor.util.js';
import type { IdentifierExtractor } from './identifier-extractors.js';
import { createRateLimitMiddleware } from './rate-limit.middleware.js';

export function createExpressRateLimit(
  rateLimitService: IRateLimitService,
  options?: Parameters<typeof createRateLimitMiddleware>[1]
) {
  return createRateLimitMiddleware(rateLimitService, options);
}

interface FastifyLikeRequest {
  ip: string;
  headers: Record<string, string | string[] | undefined>;
  [key: string]: unknown;
}

export function createFastifyRateLimit(
  rateLimitService: IRateLimitService,
  options?: Parameters<typeof createRateLimitMiddleware>[1]
) {
  const fastifyExtractor: IdentifierExtractor = (req: unknown) => {
    const fastifyReq = req as FastifyLikeRequest;
    return IpExtractor.extract(fastifyReq.headers, fastifyReq.ip);
  };

  return createRateLimitMiddleware(rateLimitService, {
    ...options,
    identifierExtractor: options?.identifierExtractor ?? fastifyExtractor,
  });
}

interface NextLikeRequest {
  headers: Record<string, string | string[] | undefined>;
  connection?: { remoteAddress?: string };
  socket?: { remoteAddress?: string };
  [key: string]: unknown;
}

export function createNextRateLimit(
  rateLimitService: IRateLimitService,
  options?: Parameters<typeof createRateLimitMiddleware>[1]
) {
  const nextExtractor: IdentifierExtractor = (req: unknown) => {
    const nextReq = req as NextLikeRequest;
    const ip =
      nextReq.connection?.remoteAddress ??
      nextReq.socket?.remoteAddress ??
      'unknown';
    return IpExtractor.extract(nextReq.headers, ip);
  };

  return createRateLimitMiddleware(rateLimitService, {
    ...options,
    identifierExtractor: options?.identifierExtractor ?? nextExtractor,
  });
}
