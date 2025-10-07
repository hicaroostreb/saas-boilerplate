import type {
  AuthResult,
  RequestContext,
  SignUpRequest,
} from '@workspace/auth';
import { signUpFlow } from '@workspace/auth/server';

export interface SignupResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  organization?: {
    id: string;
    slug: string;
  } | null;
  error?: {
    code: string;
    message: string;
    suggestions?: string[];
  };
}

/**
 * ✅ SRP: Service apenas para signup de usuário
 * ~45 linhas - Business logic delegation
 */
export class SignupService {
  async createUser(
    data: SignUpRequest,
    context: RequestContext
  ): Promise<SignupResult> {
    try {
      // ✅ CORRETO: Usa apenas facade do @workspace/auth
      const authResult: AuthResult = await signUpFlow({
        ...data,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });

      // ✅ Handle auth result
      if (!authResult.success) {
        return {
          success: false,
          error: {
            code: authResult.errorCode || 'SIGNUP_FAILED',
            message: authResult.message || 'Sign up failed',
            suggestions: authResult.suggestions,
          },
        };
      }

      // ✅ Transform successful result
      return {
        success: true,
        user: authResult.user
          ? {
              id: authResult.user.id,
              email: authResult.user.email,
              name: authResult.user.name || '',
            }
          : undefined,
        organization: authResult.organization || null,
      };
    } catch (error) {
      console.error('❌ SignupService error:', error);

      return {
        success: false,
        error: {
          code: 'SYSTEM_ERROR',
          message: 'An unexpected error occurred. Please try again.',
        },
      };
    }
  }
}
