import { z } from 'zod';

// ✅ CORRETO: Importar tipos do @workspace/auth (não duplicar)
import type {
  ForgotPasswordRequest as AuthForgotPasswordRequest,
  ResetPasswordRequest as AuthResetPasswordRequest,
  SignUpRequest as AuthSignUpRequest,
} from '@workspace/auth';

// ✅ ENTERPRISE: Re-export dos tipos do auth (evita duplicação)
export type CheckUserRequest = {
  email: string;
};

export type SignUpRequest = AuthSignUpRequest;
export type ForgotPasswordRequest = AuthForgotPasswordRequest;
export type ResetPasswordRequest = AuthResetPasswordRequest;

export type ValidateTokenRequest = {
  token: string;
};

// ✅ ENTERPRISE: Context type (comum a todos)
export type RequestContext = {
  ipAddress: string;
  userAgent: string;
};

// ✅ ENTERPRISE: Schemas Zod mínimos (validação básica no dashboard)
export const checkUserSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase(),
});

export const validateTokenSchema = z.object({
  token: z.string().uuid('Invalid token format'),
});

// ✅ ENTERPRISE: Para os outros, usar schemas do @workspace/auth
export {
  forgotPasswordSchema,
  resetPasswordSchema,
  signUpSchema,
} from '@workspace/auth';
