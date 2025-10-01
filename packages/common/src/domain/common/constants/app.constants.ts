// packages/common/src/domain/common/constants/app.constants.ts

/**
 * Configurações gerais da aplicação
 */
export const APP_CONFIG = {
  name: 'SaaS Boilerplate',
  description: 'Enterprise-grade SaaS boilerplate',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  supportEmail: 'support@saas-boilerplate.com',
  version: '1.0.0',
} as const;

/**
 * Limites de uso e validações de segurança
 */
export const LIMITS = {
  // Limites de usuários e times
  MAX_TEAMS_PER_USER: 5,
  MAX_MEMBERS_PER_TEAM: 50,
  MAX_INVITATIONS_PER_TEAM: 10,

  // Limites de conteúdo
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 MB
  MAX_NAME_LENGTH: 100, // caracteres
  MAX_DESCRIPTION_LENGTH: 500, // caracteres

  // Limites de acesso e rate limits
  AUTH_ATTEMPTS_PER_HOUR: 5,
  API_REQUESTS_PER_MINUTE: 100,
  WEBHOOK_RETRIES: 3,
} as const;

/**
 * Timeouts padrão para operações externas
 */
export const TIMEOUTS = {
  DATABASE_QUERY: 30_000, // 30 segundos
  EXTERNAL_API: 10_000, // 10 segundos
  WEBHOOK_DELIVERY: 5_000, // 5 segundos
  EMAIL_SEND: 15_000, // 15 segundos
} as const;
