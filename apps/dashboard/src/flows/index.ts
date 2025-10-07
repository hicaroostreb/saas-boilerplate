// ✅ ENTERPRISE: Barrel export para auth flows
export { checkEmailAvailabilityFlow } from './check-email-availability.flow';
export { requestPasswordResetFlow } from './request-password-reset.flow';
export { resetPasswordFlow } from './reset-password.flow';
export { signUpFlow } from './signup.flow';
export { validateResetTokenFlow } from './validate-reset-token.flow';

// ✅ CONVENIENCE: Re-export tipos
export type {
  CheckEmailAvailabilityRequest,
  CheckEmailAvailabilityResult,
} from './check-email-availability.flow';

export type { SignUpFlowRequest, SignUpFlowResult } from './signup.flow';

export type { RequestPasswordResetFlowRequest } from './request-password-reset.flow';

export type {
  ResetPasswordFlowRequest,
  ResetPasswordFlowResult,
} from './reset-password.flow';

export type {
  ValidateResetTokenFlowRequest,
  ValidateResetTokenFlowResult,
} from './validate-reset-token.flow';
