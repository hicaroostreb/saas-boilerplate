// ✅ ENTERPRISE: Barrel export para auth services
export { ForgotPasswordService } from './forgot-password.service';
export { PasswordResetService } from './password-reset.service';
export { SignupService } from './signup.service';
export { UserCheckService } from './user-check.service';

// ✅ CONVENIENCE: Re-export result types
export type { ForgotPasswordResult } from './forgot-password.service';
export type {
  ResetPasswordResult,
  ValidateTokenResult,
} from './password-reset.service';
export type { SignupResult } from './signup.service';
export type { UserCheckResult } from './user-check.service';
