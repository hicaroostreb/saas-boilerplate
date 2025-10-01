// packages/common/src/infrastructure/api/types/pagination.types.ts

/**
 * Parâmetros de paginação para requisições
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Metadados de paginação na resposta
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  startIndex: number;
  endIndex: number;
}

/**
 * Links de navegação para paginação
 */
export interface PaginationLinks {
  first?: string;
  prev?: string;
  next?: string;
  last?: string;
  self: string;
}

/**
 * Resposta paginada completa com links
 */
export interface PaginatedResponseWithLinks<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
  links: PaginationLinks;
  timestamp: string;
}

/**
 * Parâmetros de cursor para paginação baseada em cursor
 */
export interface CursorPaginationParams {
  cursor?: string;
  limit?: number;
  direction?: 'forward' | 'backward';
}

/**
 * Metadados de cursor paginação
 */
export interface CursorPaginationMeta {
  hasNext: boolean;
  hasPrev: boolean;
  nextCursor?: string;
  prevCursor?: string;
  limit: number;
  count: number;
}

/**
 * Resposta de cursor paginação
 */
export interface CursorPaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: CursorPaginationMeta;
  timestamp: string;
}

/**
 * Configurações padrão de paginação
 */
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
  SORT_ORDER: 'desc' as const,
} as const;

/**
 * Utilitário para calcular metadados de paginação
 */
export interface PaginationCalculator {
  page: number;
  limit: number;
  total: number;
}

/**
 * Resultado do cálculo de paginação
 */
export interface CalculatedPagination extends PaginationMeta {
  offset: number;
}
