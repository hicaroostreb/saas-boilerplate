/**
 * @fileoverview Tipos para APIs e requisições HTTP
 * Interfaces padrão para comunicação entre cliente e servidor
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestConfig {
  readonly method: HttpMethod;
  readonly headers?: Record<string, string>;
  readonly body?: unknown;
  readonly timeout?: number;
}

export interface ErrorResponse {
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly details?: Record<string, unknown>;
  };
  readonly timestamp: string;
  readonly path: string;
}

export interface HealthCheckResponse {
  readonly status: 'healthy' | 'unhealthy';
  readonly timestamp: string;
  readonly services?: Record<string, 'up' | 'down'>;
}
