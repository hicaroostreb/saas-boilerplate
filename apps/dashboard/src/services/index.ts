// ✅ ENTERPRISE: Barrel export para auth services
export { ForgotPasswordService } from './auth/forgot-password.service';
export { PasswordResetService } from './auth/password-reset.service';
export { SignupService } from './auth/signup.service';
export { UserCheckService } from './auth/user-check.service';

// ✅ CONVENIENCE: Re-export result types
export type { ForgotPasswordResult } from './auth/forgot-password.service';
export type {
  ResetPasswordResult,
  ValidateTokenResult,
} from './auth/password-reset.service';
export type { SignupResult } from './auth/signup.service';
export type { UserCheckResult } from './auth/user-check.service';
