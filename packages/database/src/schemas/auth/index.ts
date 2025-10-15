// packages/database/src/schemas/auth/index.ts
// ============================================
// AUTH SCHEMAS BARREL EXPORTS (FIXED EXPORTS)
// ============================================

// User schema
export {
  users,
  user_status_enum,
  user_role_enum,
  type User,
  type CreateUser,
  type UserStatus,
  type UserRole,
  type PublicUser,
  type UserProfile,
  getFullName,
  getDisplayName,
  getInitials,
  isUserLocked,
  getLockoutDuration,
  shouldLockUser,
  isValidTimezone,
  isValidLocale,
  formatUserForAPI,
  getUserSecurityLevel,
  canUserPerformAction,
} from './user.schema';

// Session schema
export {
  sessions,
  type Session,
  type CreateSession,
} from './session.schema';

// Account schema
export {
  accounts,
  type Account,
  type CreateAccount,
} from './account.schema';

// Verification token schema
export {
  verification_tokens,
  verification_token_type_enum,
  type VerificationToken,
  type CreateVerificationToken,
  type VerificationTokenType,
  type TokenValidationResult,
  type TokenConfig,
  DEFAULT_TOKEN_EXPIRY,
  generateSecureToken,
  generateNumericToken,
  createVerificationToken,
  validateToken,
  isTokenExpired,
  isTokenUsed,
  getTokenExpiryTime,
  markTokenAsUsed,
  parseTokenMetadata,
  serializeTokenMetadata,
  shouldCleanupToken,
  isPhoneVerificationToken,
  isEmailVerificationToken,
  isPasswordResetToken,
  createTokenHash,
  rateLimit,
} from './verification-token.schema';
