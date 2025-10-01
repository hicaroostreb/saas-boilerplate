// packages/common/src/infrastructure/api/errors/api.errors.ts

/**
 * Classe base para erros de API/infraestrutura
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly path?: string;
  public readonly timestamp: string;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
    path?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.path = path;
    this.timestamp = new Date().toISOString();
    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Erro de recurso não encontrado (404)
 */
export class NotFoundError extends ApiError {
  constructor(resource: string = 'Recurso', path?: string) {
    super(`${resource} não encontrado`, 404, 'NOT_FOUND', true, path);
  }
}

/**
 * Erro de não autorizado (401)
 */
export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Não autorizado', path?: string) {
    super(message, 401, 'UNAUTHORIZED', true, path);
  }
}

/**
 * Erro de acesso negado (403)
 */
export class ForbiddenError extends ApiError {
  constructor(message: string = 'Acesso negado', path?: string) {
    super(message, 403, 'FORBIDDEN', true, path);
  }
}

/**
 * Erro de conflito (409)
 */
export class ConflictError extends ApiError {
  constructor(message: string = 'Conflito', path?: string) {
    super(message, 409, 'CONFLICT', true, path);
  }
}

/**
 * Erro de rate limit excedido (429)
 */
export class RateLimitError extends ApiError {
  constructor(message: string = 'Muitas tentativas', path?: string) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', true, path);
  }
}

/**
 * Erro de dados inválidos (422)
 */
export class UnprocessableEntityError extends ApiError {
  constructor(message: string = 'Dados inválidos', path?: string) {
    super(message, 422, 'UNPROCESSABLE_ENTITY', true, path);
  }
}

/**
 * Erro de timeout (408)
 */
export class TimeoutError extends ApiError {
  constructor(message: string = 'Tempo esgotado', path?: string) {
    super(message, 408, 'TIMEOUT', true, path);
  }
}

/**
 * Erro de serviço indisponível (503)
 */
export class ServiceUnavailableError extends ApiError {
  constructor(
    message: string = 'Serviço temporariamente indisponível',
    path?: string
  ) {
    super(message, 503, 'SERVICE_UNAVAILABLE', true, path);
  }
}

/**
 * Erro de gateway (502)
 */
export class BadGatewayError extends ApiError {
  constructor(message: string = 'Erro no gateway', path?: string) {
    super(message, 502, 'BAD_GATEWAY', true, path);
  }
}

/**
 * Utilitário para tratar erros desconhecidos
 */
export const handleUnknownError = (error: unknown, path?: string): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiError(error.message, 500, 'INTERNAL_ERROR', true, path);
  }

  return new ApiError('Erro desconhecido', 500, 'UNKNOWN_ERROR', false, path);
};
