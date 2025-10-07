// ✅ ENTERPRISE: Base controller
export { BaseController } from './base/base.controller';

// ✅ ENTERPRISE: Auth controllers (SRP)
export { CheckUserController } from './auth/check-user.controller';
export { ForgotPasswordController } from './auth/forgot-password.controller';
export { ResetPasswordController } from './auth/reset-password.controller';
export { SignupController } from './auth/signup.controller';
export { ValidateTokenController } from './auth/validate-token.controller';

// ✅ ENTERPRISE: Types
export * from './types';

// ✅ CONVENIENCE: Re-export tipos principais
export type {
  AuthControllerResponse,
  CheckUserRequest,
  CheckUserResponse,
  ErrorResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  RequestContext,
  ResetPasswordRequest,
  ResetPasswordResponse,
  SignUpRequest,
  SignUpResponse,
  ValidateTokenRequest,
  ValidateTokenResponse,
} from './types';
