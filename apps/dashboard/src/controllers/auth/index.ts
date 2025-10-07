// ✅ ENTERPRISE: Barrel export para auth controllers
export { CheckUserController } from './check-user.controller';
export { ForgotPasswordController } from './forgot-password.controller';
export { ResetPasswordController } from './reset-password.controller';
export { SignupController } from './signup.controller';
export { ValidateTokenController } from './validate-token.controller';

// ✅ CONVENIENCE: Re-export types
export type {
  CheckUserRequest,
  CheckUserResponse,
  ErrorResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  SignUpRequest,
  SignUpResponse,
  ValidateTokenRequest,
  ValidateTokenResponse,
} from '../types';
