// ✅ CORRETO: Importar tipos do @workspace/auth quando possível
import type { User } from '@workspace/auth';

// ============================================
// BASE RESPONSE STRUCTURE
// ============================================

export interface BaseResponse {
  success: boolean;
  message?: string;
}

export interface ErrorResponse extends BaseResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    suggestions?: string[];
  };
}

// ============================================
// SPECIFIC RESPONSES (usando tipos do auth)
// ============================================

// ✅ Check User Response
export interface CheckUserResponse extends BaseResponse {
  success: true;
  available: boolean;
  exists: boolean;
  user?: {
    email: string;
    name: string;
    isActive: boolean;
    emailVerified: boolean;
    hasPassword: boolean;
    twoFactorEnabled: boolean;
    memberSince: Date;
  };
}

// ✅ Sign Up Response (baseado em AuthResult)
export interface SignUpResponse extends BaseResponse {
  success: true;
  user: Pick<User, 'id' | 'email' | 'name'>;
  organization?: {
    id: string;
    slug: string;
  } | null;
}

// ✅ Password Reset Responses (simples)
export interface ForgotPasswordResponse extends BaseResponse {
  success: true;
  message: string; // Anti-enumeration security
}

export interface ResetPasswordResponse extends BaseResponse {
  success: true;
  user: {
    email: string;
    name: string;
  };
}

export interface ValidateTokenResponse extends BaseResponse {
  success: true;
  email: string;
  name: string;
  organizationSlug?: string | null;
  expiresAt: Date;
  attemptsRemaining: number;
}

// ============================================
// UNION TYPES & CONSTANTS
// ============================================

export type AuthControllerResponse =
  | CheckUserResponse
  | SignUpResponse
  | ForgotPasswordResponse
  | ResetPasswordResponse
  | ValidateTokenResponse
  | ErrorResponse;

export enum AuthErrorCodes {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  USER_EXISTS = 'USER_EXISTS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_NOT_AVAILABLE = 'EMAIL_NOT_AVAILABLE',
  TOKEN_INVALID = 'TOKEN_INVALID',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_USED = 'TOKEN_USED',
  TOKEN_REVOKED = 'TOKEN_REVOKED',
  PASSWORD_WEAK = 'PASSWORD_WEAK',
  PASSWORD_REUSED = 'PASSWORD_REUSED',
  MAX_ATTEMPTS_EXCEEDED = 'MAX_ATTEMPTS_EXCEEDED',
  USER_INACTIVE = 'USER_INACTIVE',
  SYSTEM_ERROR = 'SYSTEM_ERROR',
}

export enum AuthHttpStatus {
  OK = 200,
  BAD_REQUEST = 400,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  GONE = 410,
  UNSUPPORTED_MEDIA_TYPE = 415,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
}
