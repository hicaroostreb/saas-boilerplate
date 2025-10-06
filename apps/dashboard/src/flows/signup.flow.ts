import { randomUUID } from 'crypto';
import { hashPassword, validatePasswordStrength } from '../password';
import { OrganizationRepository } from '../repositories/organization.repository';
import { UserRepository } from '../repositories/user.repository';
import { calculateRiskScore, parseDeviceInfo } from '../security';
import { AuditService } from '../services/audit.service';

export interface SignUpFlowRequest {
  name: string;
  email: string;
  password: string;
  organizationSlug?: string | null;
  invitationToken?: string | null;
  returnTo?: string | null;
  ipAddress: string;
  userAgent: string;
}

export interface SignUpFlowResult {
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
  errorCode?: string;
  message?: string;
  suggestions?: string[];
}

/**
 * ✅ ENTERPRISE: Facade para sign up completo
 */
export async function signUpFlow(
  request: SignUpFlowRequest
): Promise<SignUpFlowResult> {
  const userRepository = new UserRepository();
  const organizationRepository = new OrganizationRepository();
  const auditService = new AuditService();

  try {
    const { name, email, password, organizationSlug, invitationToken } =
      request;

    // ✅ 1. Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      await auditService.logAuthEvent({
        eventType: 'register_failed',
        eventAction: 'signup_user_exists',
        eventStatus: 'failure',
        eventCategory: 'auth',
        ipAddress: request.ipAddress,
        userAgent: request.userAgent,
        errorMessage: 'User already exists',
        eventData: { email, existingUserId: existingUser.id },
      });

      return {
        success: false,
        errorCode: 'USER_EXISTS',
        message: 'An account with this email already exists',
      };
    }

    // ✅ 2. Validate password strength
    const passwordValidation = validatePasswordStrength(password, {
      email,
      name,
    });
    if (!passwordValidation.isValid) {
      await auditService.logAuthEvent({
        eventType: 'register_failed',
        eventAction: 'signup_weak_password',
        eventStatus: 'failure',
        eventCategory: 'security',
        ipAddress: request.ipAddress,
        userAgent: request.userAgent,
        errorMessage: 'Weak password rejected',
        eventData: {
          email,
          strengthScore: passwordValidation.score,
          strengthErrors: passwordValidation.errors,
        },
      });

      return {
        success: false,
        errorCode: 'PASSWORD_WEAK',
        message:
          passwordValidation.errors?.[0] ||
          'Password does not meet security requirements',
        suggestions: passwordValidation.suggestions,
      };
    }

    // ✅ 3. Hash password
    const passwordHash = await hashPassword(password);
    const userId = randomUUID();
    const now = new Date();

    // ✅ 4. Calculate risk and device info
    const deviceInfo = parseDeviceInfo(request.userAgent);
    const riskAssessment = calculateRiskScore({
      deviceInfo,
      ipAddress: request.ipAddress,
      isNewDevice: true,
      timeOfDay: now.getHours(),
    });

    // ✅ 5. Create user
    const newUser = await userRepository.create({
      id: userId,
      name,
      email,
      passwordHash,
      emailVerified: null,
      image: null,
      isActive: true,
      lastLoginAt: null,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      backupCodes: null,
      securityLevel:
        riskAssessment.securityLevel === 'elevated' ? 'elevated' : 'normal',
      passwordChangedAt: now,
      accountLockedAt: null,
      accountLockedUntil: null,
      failedLoginAttempts: 0,
      preferences: {
        signUpMethod: 'credentials',
        initialRiskScore: riskAssessment.riskScore,
        signUpDeviceInfo: deviceInfo,
        signUpIpAddress: request.ipAddress,
      },
      createdAt: now,
      updatedAt: now,
    });

    // ✅ 6. Handle organization membership
    let organizationId: string | null = null;
    if (organizationSlug) {
      try {
        const organization =
          await organizationRepository.findBySlug(organizationSlug);
        if (organization && organization.isActive) {
          organizationId = organization.id;
          // Add membership logic here if needed
        }
      } catch (orgError) {
        console.error('❌ Error adding user to organization:', orgError);
      }
    }

    // ✅ 7. Log successful signup
    await auditService.logAuthEvent({
      userId,
      organizationId,
      eventType: 'register_success',
      eventAction: 'signup_success',
      eventStatus: 'success',
      eventCategory: 'auth',
      ipAddress: request.ipAddress,
      userAgent: request.userAgent,
      eventData: {
        email,
        name,
        organizationSlug,
        hasInvitation: Boolean(invitationToken),
        signUpMethod: 'credentials',
        deviceInfo,
        riskScore: riskAssessment.riskScore,
      },
    });

    return {
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name || '',
      },
      organization:
        organizationId && organizationSlug
          ? { id: organizationId, slug: organizationSlug }
          : null,
    };
  } catch (error) {
    console.error('❌ signUpFlow error:', error);

    await auditService.logAuthEvent({
      eventType: 'register_failed',
      eventAction: 'signup_system_error',
      eventStatus: 'error',
      eventCategory: 'auth',
      ipAddress: request.ipAddress,
      userAgent: request.userAgent,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      eventData: { email: request.email },
    });

    return {
      success: false,
      errorCode: 'SYSTEM_ERROR',
      message: 'An unexpected error occurred. Please try again.',
    };
  }
}
