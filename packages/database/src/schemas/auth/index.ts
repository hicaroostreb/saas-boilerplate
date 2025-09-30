// ============================================
// AUTH SCHEMAS BARREL EXPORTS
// ============================================

// Table exports
export { accounts } from './account.schema';
export { sessions } from './session.schema';
export { users } from './user.schema';
export { verificationTokens } from './verification-token.schema';

// Type exports
export type {
  CreateUser,
  PublicUser,
  User,
  UserPreferences,
  UserProfile,
} from './user.schema';

export type {
  Account,
  CreateAccount,
  CredentialsAccount,
  GitHubAccount,
  GoogleAccount,
} from './account.schema';

export type { CreateSession, Session, SessionWithUser } from './session.schema';

export type {
  CreateVerificationToken,
  VerificationToken,
} from './verification-token.schema';
