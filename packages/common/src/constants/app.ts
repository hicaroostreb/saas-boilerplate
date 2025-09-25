// App-wide constants
export const APP_CONFIG = {
  name: 'SaaS Boilerplate',
  description: 'Enterprise-grade SaaS boilerplate',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  supportEmail: 'support@saas-boilerplate.com',
  version: '1.0.0',
} as const;

export const LIMITS = {
  // User limits
  MAX_TEAMS_PER_USER: 5,
  MAX_MEMBERS_PER_TEAM: 50,
  MAX_INVITATIONS_PER_TEAM: 10,

  // Content limits
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,

  // Rate limits
  AUTH_ATTEMPTS_PER_HOUR: 5,
  API_REQUESTS_PER_MINUTE: 100,
  WEBHOOK_RETRIES: 3,
} as const;

export const TIMEOUTS = {
  DATABASE_QUERY: 30000, // 30s
  EXTERNAL_API: 10000, // 10s
  WEBHOOK_DELIVERY: 5000, // 5s
  EMAIL_SEND: 15000, // 15s
} as const;
