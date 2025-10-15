// packages/auth/src/client.ts - CLIENT-SIDE SAFE EXPORTS

// ✅ CLIENT: Apenas schemas, tipos e utils client-safe
export {
  createOrganizationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  sendInvitationSchema,
  signInSchema,
  signUpSchema,
} from './types/schemas';

// ✅ CLIENT: Domain entities sem dependências de Node.js
export * from './domain/entities/Invitation';
export * from './domain/entities/Organization';
export * from './domain/entities/Session';
export * from './domain/entities/User';

// ✅ CLIENT: Value objects
export * from './domain/value-objects/Email';
export * from './domain/value-objects/PasswordPolicy';

// ✅ CLIENT: Exceções (client-safe)
export * from './domain/exceptions';

// ✅ CLIENT: DTOs
export * from './application/dto/organization/CreateOrganizationDTO';
export * from './application/dto/organization/SendInvitationDTO';
export * from './application/dto/SignInDTO';
export * from './application/dto/UserProfileDTO';

// ✅ CLIENT: Utils client-safe apenas
export { formatAuthError, isAuthError } from './utils/error.utils';

export { AuthLogger, type LogContext } from './utils/logger.utils';

// ✅ CLIENT: Types
export type {
  AuthContext,
  AuthEventStatus,
  AuthEventType,
  DeviceType,
  EnhancedAuthContext,
  MemberRole,
  SecurityLevel,
} from './types';
