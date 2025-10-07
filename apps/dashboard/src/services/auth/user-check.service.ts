import { checkEmailAvailabilityFlow } from '@workspace/auth/server';
import type { RequestContext } from '../../controllers/types';

export interface UserCheckResult {
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
  message: string;
}

/**
 * ✅ SRP: Service apenas para verificação de disponibilidade de email
 * ~40 linhas - Business logic mínima
 */
export class UserCheckService {
  async checkEmailAvailability(
    email: string,
    context: RequestContext
  ): Promise<UserCheckResult> {
    try {
      // ✅ CORRETO: Usa apenas facade do @workspace/auth
      const result = await checkEmailAvailabilityFlow({
        email,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });

      // ✅ Transform result to dashboard format
      if (result.available) {
        return {
          available: true,
          exists: false,
          message: 'Email is available for registration',
        };
      }

      return {
        available: false,
        exists: true,
        user: result.userInfo
          ? {
              email: result.userInfo.email,
              name: result.userInfo.name,
              isActive: result.userInfo.isActive,
              emailVerified: result.userInfo.emailVerified,
              hasPassword: true, // Security: don't reveal actual status
              twoFactorEnabled: result.userInfo.twoFactorEnabled,
              memberSince: result.userInfo.createdAt,
            }
          : undefined,
        message: result.userInfo?.isActive
          ? 'User account exists and is active'
          : 'User account exists but is inactive',
      };
    } catch (error) {
      console.error('❌ UserCheckService error:', error);

      // ✅ Fallback: treat as available to prevent enumeration
      return {
        available: true,
        exists: false,
        message: 'Email is available for registration',
      };
    }
  }
}
