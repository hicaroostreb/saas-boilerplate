// packages/common/src/infrastructure/api/types/api.types.ts

/**
 * Estrutura padrão de resposta da API
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
  timestamp?: string;
}

/**
 * Resposta paginada da API
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Parâmetros de filtro genéricos
 */
export interface FilterParams {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  createdBy?: number;
  updatedBy?: number;
}

/**
 * Parâmetros de ordenação
 */
export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Headers customizados para requisições
 */
export interface ApiHeaders {
  'Content-Type'?: string;
  Authorization?: string;
  'X-Request-ID'?: string;
  'X-User-Agent'?: string;
  'X-API-Version'?: string;
}

/**
 * Configurações de requisição
 */
export interface RequestConfig {
  headers?: ApiHeaders;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

/**
 * Resposta de health check
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    database: 'up' | 'down';
    redis: 'up' | 'down';
    email: 'up' | 'down';
  };
}
