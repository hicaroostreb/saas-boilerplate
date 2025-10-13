/**
 * @fileoverview Constantes globais da aplicação
 * Valores imutáveis consolidados de todos os domínios
 */

/**
 * Configurações gerais da aplicação
 */
export const APP_CONFIG = {
  NAME: 'SaaS Boilerplate',
  DESCRIPTION: 'Enterprise-grade SaaS boilerplate',
  VERSION: '1.0.0',
  API_VERSION: 'v1',
  SUPPORT_EMAIL: 'support@saas-boilerplate.com',
  URL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
} as const;

/**
 * Limites de uso e validações de segurança
 */
export const LIMITS = {
  // Arquivos
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_USERNAME_LENGTH: 50,
  MIN_PASSWORD_LENGTH: 8,

  // Teams e usuários
  MAX_TEAMS_PER_USER: 5,
  MAX_MEMBERS_PER_TEAM: 50,
  MAX_INVITATIONS_PER_TEAM: 10,

  // Conteúdo
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,

  // Rate limiting
  AUTH_ATTEMPTS_PER_HOUR: 5,
  API_REQUESTS_PER_MINUTE: 100,
  WEBHOOK_RETRIES: 3,

  // Paginação
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * Timeouts para operações
 */
export const TIMEOUTS = {
  DEFAULT: 30000, // 30s
  LONG: 60000, // 60s
  DATABASE_QUERY: 30000,
  EXTERNAL_API: 10000,
  WEBHOOK_DELIVERY: 5000,
  EMAIL_SEND: 15000,
} as const;

/**
 * Status HTTP padronizados
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Tipos MIME comuns
 */
export const MIME_TYPES = {
  JSON: 'application/json',
  TEXT: 'text/plain',
  HTML: 'text/html',
  PDF: 'application/pdf',
  CSV: 'text/csv',
} as const;

/**
 * Configuração dos planos de billing
 */
export const BILLING_PLANS = {
  FREE: {
    ID: 'free',
    NAME: 'Free',
    MONTHLY_PRICE: 0,
    YEARLY_PRICE: 0,
    LIMITS: {
      TEAMS: 1,
      MEMBERS: 3,
      STORAGE: 1, // GB
      API_CALLS: 1000,
    },
  },
  PRO: {
    ID: 'pro',
    NAME: 'Pro',
    MONTHLY_PRICE: 29,
    YEARLY_PRICE: 290,
    LIMITS: {
      TEAMS: 5,
      MEMBERS: 25,
      STORAGE: 50,
      API_CALLS: 50000,
    },
  },
  ENTERPRISE: {
    ID: 'enterprise',
    NAME: 'Enterprise',
    MONTHLY_PRICE: 99,
    YEARLY_PRICE: 990,
    LIMITS: {
      TEAMS: -1, // unlimited
      MEMBERS: -1, // unlimited
      STORAGE: 500,
      API_CALLS: 500000,
    },
  },
} as const;
