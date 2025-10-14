// packages/database/src/schemas/security/index.ts
// ============================================
// SECURITY SCHEMAS BARREL EXPORTS (COMPLETE)
// ============================================

export {
  auth_audit_logs,
  auth_event_type_enum,
  auth_risk_level_enum,
  type AuthAuditLog,
  type AuthEventType,
  type AuthRiskLevel,
  type CreateAuthAuditLog,
} from './auth-audit-log.schema';

export {
  password_reset_status_enum,  // ESTAVA FALTANDO!
  password_reset_tokens,
  type CreatePasswordResetToken,
  type PasswordResetStatus,
  type PasswordResetToken,
  type TokenValidationResult,
  PASSWORD_RESET_TOKEN_LENGTH,
  PASSWORD_RESET_EXPIRY_HOURS,
  MAX_RESET_ATTEMPTS,
  RATE_LIMIT_HOURS,
  generatePasswordResetToken,
  hashPasswordResetToken,
  createPasswordResetToken,
  validatePasswordResetToken,
  isTokenExpired,
  isTokenUsed,
  isTokenRevoked,
  isTokenRateLimited,
  shouldRateLimit,
  markTokenAsUsed,
  incrementAttemptCount,
  revokeToken,
  shouldCleanupToken,
} from './password-reset-token.schema';

export {
  rate_limit_type_enum,
  rate_limit_window_enum,
  rate_limits,
  type CreateRateLimit,
  type RateLimit,
  type RateLimitResult,
  type RateLimitType,
  type RateLimitWindow,
} from './rate-limit.schema';
