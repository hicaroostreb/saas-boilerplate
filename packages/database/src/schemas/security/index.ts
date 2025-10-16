// packages/database/src/schemas/security/index.ts
// ============================================
// SECURITY SCHEMAS BARREL EXPORTS (REFACTORED)
// ============================================

export {
  auth_audit_logs,
  auth_event_type_enum,
  auth_risk_level_enum,
  calculateRiskScore,
  getEventSeverity,
  getRiskLevel,
  isCriticalEvent,
  isSecurityEvent,
  parseLocation,
  parseMetadata,
  parseRiskFactors,
  type AuthAuditLog,
  type AuthEventType,
  type AuthRiskLevel,
  type CreateAuthAuditLog,
} from './auth-audit-log.schema';

export {
  MAX_RESET_ATTEMPTS,
  PASSWORD_RESET_EXPIRY_HOURS,
  PASSWORD_RESET_TOKEN_LENGTH,
  RATE_LIMIT_HOURS,
  createPasswordResetToken,
  generatePasswordResetToken,
  hashPasswordResetToken,
  isTokenExpired,
  isTokenRateLimited,
  isTokenRevoked,
  isTokenUsed,
  password_reset_status_enum,
  password_reset_tokens,
  shouldRateLimit,
  validatePasswordResetToken,
  type CreatePasswordResetToken,
  type PasswordResetStatus,
  type PasswordResetToken,
  type TokenValidationResult,
} from './password-reset-token.schema';

export {
  calculateWindowBounds,
  checkRateLimit,
  createAPIKeyIdentifier,
  createIPIdentifier,
  createIdentifier,
  createOrganizationIdentifier,
  createUserIdentifier,
  createWindowReset,
  getRemainingRequests,
  getRetryAfterSeconds,
  isRateLimitExceeded,
  isWindowExpired,
  rate_limit_type_enum,
  rate_limit_window_enum,
  rate_limits,
  type CreateRateLimit,
  type RateLimit,
  type RateLimitResult,
  type RateLimitType,
  type RateLimitWindow,
} from './rate-limit.schema';
