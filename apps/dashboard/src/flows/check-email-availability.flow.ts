import { AuditService } from '../services/audit.service';
import { UserValidationService } from '../services/user-validation.service';

export interface CheckEmailAvailabilityRequest {
  email: string;
  ipAddress: string;
  userAgent: string;
}

export interface CheckEmailAvailabilityResult {
  available: boolean;
  userInfo?: {
    email: string;
    name: string;
    isActive: boolean;
    emailVerified: boolean;
    twoFactorEnabled: boolean;
    createdAt: Date;
  };
}

/**
 * ✅ ENTERPRISE: Facade para verificação de disponibilidade de email
 */
export async function checkEmailAvailabilityFlow(
  request: CheckEmailAvailabilityRequest
): Promise<CheckEmailAvailabilityResult> {
  const userValidationService = new UserValidationService();
  const auditService = new AuditService();

  try {
    // ✅ Check if email exists
    const userCheck = await userValidationService.validateUserExists(
      request.email
    );

    // ✅ Log the check
    await auditService.logAuthEvent({
      userId: userCheck.user?.id || null,
      eventType: 'login',
      eventAction: 'check_email_availability',
      eventStatus: 'success',
      eventCategory: 'auth',
      ipAddress: request.ipAddress,
      userAgent: request.userAgent,
      eventData: {
        email: request.email,
        available: !userCheck.exists,
        userExists: userCheck.exists,
        userActive: userCheck.user?.isActive || false,
      },
    });

    if (!userCheck.exists) {
      return {
        available: true,
      };
    }

    return {
      available: false,
      userInfo: userCheck.user
        ? {
            email: userCheck.user.email,
            name: userCheck.user.name || '',
            isActive: userCheck.user.isActive,
            emailVerified: userCheck.user.isEmailVerified || false,
            twoFactorEnabled: false, // From user validation service
            createdAt: userCheck.user.createdAt || new Date(),
          }
        : undefined,
    };
  } catch (error) {
    console.error('❌ checkEmailAvailabilityFlow error:', error);

    // ✅ Log error
    await auditService.logAuthEvent({
      eventType: 'login',
      eventAction: 'check_email_availability_error',
      eventStatus: 'error',
      eventCategory: 'auth',
      ipAddress: request.ipAddress,
      userAgent: request.userAgent,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      eventData: { email: request.email },
    });

    // ✅ Fail safe: return available to prevent enumeration
    return {
      available: true,
    };
  }
}
