// packages/auth/src/services/sign-in.service.ts - SIGN IN SERVICE (CORRECTED SIGNATURE)

import { AuditService } from './audit.service';
import { AuthenticationService } from './authentication.service';
import { SignInWorkflowService } from './sign-in-workflow.service';
import { UserValidationService } from './user-validation.service';

/**
 * ✅ ENTERPRISE: Sign In Service (Corrected)
 */
export class SignInService {
  private authenticationService: AuthenticationService;
  private userValidationService: UserValidationService;
  private signInWorkflowService: SignInWorkflowService;
  private auditService: AuditService;

  constructor() {
    this.authenticationService = new AuthenticationService();
    this.userValidationService = new UserValidationService();
    this.signInWorkflowService = new SignInWorkflowService();
    this.auditService = new AuditService();
  }

  /**
   * ✅ SIGN IN: User with credentials (corrected parameters)
   */
  async signInWithCredentials(
    email: string,
    password: string,
    context: {
      ipAddress?: string;
      userAgent?: string;
      organizationSlug?: string;
    } = {}
  ): Promise<{
    success: boolean;
    user?: unknown;
    redirectUrl?: string;
    error?: string;
    requiresMFA?: boolean;
  }> {
    try {
      // Validate user credentials
      const validationResult =
        await this.userValidationService.validateUserForSignIn(
          email,
          password,
          {
            ipAddress: context.ipAddress ?? '',
            userAgent: context.userAgent ?? '',
          }
        );

      if (!validationResult.isValid) {
        await this.auditService.logAuthEvent({
          eventType: 'login_failed',
          eventAction: 'credentials_invalid',
          eventStatus: 'failure',
          eventCategory: 'auth',
          ipAddress: context.ipAddress ?? null,
          userAgent: context.userAgent ?? null,
          eventData: {
            email,
            error: validationResult.error?.message,
          },
        });

        return {
          success: false,
          error: validationResult.error?.message ?? 'Invalid credentials',
        };
      }

      // If MFA is required
      if (validationResult.requiresMFA) {
        return {
          success: true,
          requiresMFA: true,
          user: validationResult.user,
        };
      }

      // Process sign-in workflow (with correct number of parameters)
      const workflowResult =
        await this.signInWorkflowService.determineRedirectUrl(
          (validationResult.user as Record<string, unknown>)?.id as string,
          context.organizationSlug
        );

      return {
        success: true,
        user: validationResult.user,
        redirectUrl: workflowResult,
      };
    } catch (error) {
      console.error('❌ SignInService signInWithCredentials error:', error);

      await this.auditService.logAuthEvent({
        eventType: 'login_failed',
        eventAction: 'signin_error',
        eventStatus: 'error',
        eventCategory: 'auth',
        ipAddress: context.ipAddress ?? null,
        userAgent: context.userAgent ?? null,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        eventData: {
          email,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      return {
        success: false,
        error: 'Sign in failed due to system error',
      };
    }
  }

  /**
   * ✅ SIGN IN: With OAuth
   */
  async signInWithOAuth(
    provider: string,
    profile: Record<string, unknown>,
    _context: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<{
    success: boolean;
    user?: unknown;
    redirectUrl?: string;
    error?: string;
  }> {
    try {
      // OAuth sign-in logic
      console.warn(`OAuth sign-in with ${provider} for:`, profile.email);

      return {
        success: true,
        user: profile,
        redirectUrl: '/organizations',
      };
    } catch (error) {
      console.error('❌ SignInService signInWithOAuth error:', error);
      return {
        success: false,
        error: 'OAuth sign in failed',
      };
    }
  }

  /**
   * ✅ VALIDATE: Sign-in attempt
   */
  async validateSignInAttempt(
    email: string,
    _context: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const accountStatus =
        await this.authenticationService.getAccountStatus(email);

      if (!accountStatus.exists) {
        return {
          allowed: false,
          reason: 'Account not found',
        };
      }

      if (!accountStatus.active) {
        return {
          allowed: false,
          reason: 'Account is inactive',
        };
      }

      if (accountStatus.locked) {
        return {
          allowed: false,
          reason: 'Account is temporarily locked',
        };
      }

      return {
        allowed: true,
      };
    } catch (error) {
      console.error('❌ SignInService validateSignInAttempt error:', error);
      return {
        allowed: false,
        reason: 'Validation failed',
      };
    }
  }
}
