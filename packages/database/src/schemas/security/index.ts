// ============================================
// SECURITY SCHEMAS BARREL EXPORTS
// ============================================

// Table exports
export {
  authAuditLogs,
  authEventTypeEnum,
  authRiskLevelEnum,
} from './auth-audit-log.schema';

export {
  rateLimitTypeEnum,
  rateLimitWindowEnum,
  rateLimits,
} from './rate-limit.schema';

export {
  passwordResetTokens,
  requestSourceEnum,
  tokenStatusEnum,
} from './password-reset-token.schema';

// Type exports - Auth Audit Logs
export type {
  AuthAuditLog,
  AuthAuditLogWithUser,
  AuthEventType,
  AuthRiskLevel,
  CreateAuthAuditLog,
  DeviceInfo,
  LocationInfo,
  RiskAssessment,
  SecurityEventSummary,
} from './auth-audit-log.schema';

// Type exports - Rate Limits
export type {
  CreateRateLimit,
  RateLimit,
  RateLimitConfig,
  RateLimitResult,
  RateLimitSummary,
  RateLimitType,
  RateLimitWindow,
  RateLimitWithUser,
} from './rate-limit.schema';

// Type exports - Password Reset Tokens
export type {
  CreatePasswordResetToken,
  PasswordResetToken,
  PasswordResetTokenWithUser,
  RequestSource,
  SecurityAlert,
  TokenCreationRequest,
  TokenStatus,
  TokenUsageSummary,
  TokenValidationResult,
} from './password-reset-token.schema';
