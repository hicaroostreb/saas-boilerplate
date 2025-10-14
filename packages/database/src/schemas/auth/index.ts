// packages/database/src/schemas/auth/index.ts
// ============================================
// AUTH SCHEMAS BARREL EXPORTS - ENTERPRISE
// ============================================

// User schema exports
export {
  users,
  user_status_enum,
  user_role_enum,
} from './user.schema';

export type {
  User,
  CreateUser,
  UpdateUser,
  PublicUser,
  UserProfile,
  UserStatus,
  UserRole,
  UserSecurityInfo,
  UserPreferences,
} from './user.schema';

// Session schema exports
export {
  sessions,
} from './session.schema';

export type {
  Session,
  CreateSession,
  SessionWithUser,
  SessionSummary,
} from './session.schema';

export {
  isSessionExpired,
  isSessionActive,
  getSessionTimeRemaining,
} from './session.schema';

// Account schema exports
export {
  accounts,
} from './account.schema';

export type {
  Account,
  CreateAccount,
  OAuthTokens,
  ProviderProfile,
  AccountWithTokens,
} from './account.schema';

export {
  isTokenExpired,
  getTokenExpiresIn,
  shouldRefreshToken,
  parseProviderData,
  serializeProviderData,
} from './account.schema';

// Verification token schema exports
export {
  verification_tokens,
  verification_token_type_enum,
} from './verification-token.schema';

export type {
  VerificationToken,
  CreateVerificationToken,
  VerificationTokenType,
  TokenMetadata,
  TokenValidationResult,
} from './verification-token.schema';

export {
  isTokenExpired as isVerificationTokenExpired,
  isTokenUsed,
  hasExceededAttempts,
  validateToken,
  generateSecureToken,
  createTokenExpiry,
  parseTokenMetadata,
  serializeTokenMetadata,
} from './verification-token.schema';
