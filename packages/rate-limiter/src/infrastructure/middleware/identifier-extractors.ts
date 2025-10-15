import { RateLimitValidationError } from '../../domain/types/errors.js';
import type { RateLimitRequest } from '../../domain/types/rate-limit.types.js';
import { IpExtractor } from '../../shared/utils/ip-extractor.util.js';

export type IdentifierExtractor = (
  req: RateLimitRequest
) => string | Promise<string>;

export const IdentifierExtractors = {
  ip: (req: RateLimitRequest): string => {
    return IpExtractor.extract(req.headers, req.ip);
  },

  user: (req: RateLimitRequest): string => {
    if (!req.user?.id) {
      throw new RateLimitValidationError('User not authenticated', 'user.id');
    }
    return String(req.user.id);
  },

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

    const parts = authStr.split(' ');
    const token = parts[1] ?? parts[0] ?? authStr;
    return token;
  },

  ipAndUser: (req: RateLimitRequest): string => {
    const ip = IdentifierExtractors.ip(req);
    const userId = req.user?.id ? String(req.user.id) : 'anonymous';
    return `${ip}:${userId}`;
  },

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

  endpoint: (req: RateLimitRequest): string => {
    const path = req.path ?? req.url ?? req.originalUrl ?? '/';
    const method = req.method ?? 'GET';
    return `${method}:${path}`;
  },

  global: (): string => 'global',
};
