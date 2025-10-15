// packages/database/src/schemas/auth/index.ts
// ============================================
// AUTH SCHEMAS BARREL EXPORTS (REFACTORED)
// ============================================

// User schema
export {
  canUserPerformAction,
  formatUserForAPI,
  getDisplayName,
  getFullName,
  getInitials,
  getLockoutDuration,
  getUserSecurityLevel,
  isUserLocked,
  isValidLocale,
  isValidTimezone,
  parseUserMetadata,
  serializeUserMetadata,
  shouldLockUser,
  user_role_enum,
  user_status_enum,
  users,
  type CreateUser,
  type PublicUser,
  type User,
  type UserProfile,
  type UserRole,
  type UserStatus,
} from './user.schema';

// Session schema
export {
  getSessionTimeRemaining,
  isSessionActive,
  isSessionExpired,
  parseSessionLocation,
  serializeSessionLocation,
  sessions,
  type CreateSession,
  type Session,
  type SessionSummary,
  type SessionWithUser,
} from './session.schema';

// Account schema
export { accounts, type Account, type CreateAccount } from './account.schema';

// Verification token schema
export {
  DEFAULT_TOKEN_EXPIRY,
  createTokenHash,
  createVerificationToken,
  generateNumericToken,
  generateSecureToken,
  getTokenExpiryTime,
  isEmailVerificationToken,
  isPasswordResetToken,
  isPhoneVerificationToken,
  isTokenExpired,
  isTokenUsed,
  markTokenAsUsed,
  parseTokenMetadata,
  rateLimit,
  serializeTokenMetadata,
  shouldCleanupToken,
  validateToken,
  verification_token_type_enum,
  verification_tokens,
  type CreateVerificationToken,
  type TokenConfig,
  type TokenValidationResult,
  type VerificationToken,
  type VerificationTokenType,
} from './verification-token.schema';
