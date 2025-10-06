// ✅ CORRETO: Barrel export sem database imports
export * from './requests.types';
export * from './responses.types';

export type {
  CheckUserRequest,
  ForgotPasswordRequest,
  RequestContext,
  ResetPasswordRequest,
  SignUpRequest,
  ValidateTokenRequest,
} from './requests.types';

export type {
  AuthControllerResponse,
  CheckUserResponse,
  ErrorResponse,
  ForgotPasswordResponse,
  ResetPasswordResponse,
  SignUpResponse,
  ValidateTokenResponse,
} from './responses.types';

export { AuthErrorCodes, AuthHttpStatus } from './responses.types';

export {
  checkUserSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  signUpSchema,
  validateTokenSchema,
} from './requests.types';
