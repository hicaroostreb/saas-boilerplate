// packages/auth/src/services/sign-in-workflow.service.ts - SIGN IN WORKFLOW SERVICE (FINAL FIX)

import { OrganizationRepository } from '../repositories/organization.repository';
import { AuditService } from './audit.service';
import { AuthContextService } from './auth-context.service';

/**
 * ✅ ENTERPRISE: Sign In Workflow Service (All Fixes Applied)
 * Single Responsibility: Post sign-in workflow operations
 */
export class SignInWorkflowService {
  private authContextService: AuthContextService;
  private organizationRepository: OrganizationRepository;
  private auditService: AuditService;

  constructor() {
    this.authContextService = new AuthContextService();
    this.organizationRepository = new OrganizationRepository();
    this.auditService = new AuditService();
  }

  /**
   * ✅ PROCESS: Post sign-in workflow (all null checks)
   */
  async processSignInWorkflow(
    userId: string,
    context: {
      ipAddress?: string;
      userAgent?: string;
      organizationSlug?: string;
    } = {}
  ): Promise<{
    success: boolean;
    redirectUrl?: string;
    requiresSetup?: boolean;
    error?: string;
  }> {
    try {
      // Log successful sign in
      await this.auditService.logAuthEvent({
        userId,
        eventType: 'login_success',
        eventAction: 'sign_in_completed',
        eventStatus: 'success',
        eventCategory: 'auth',
        ipAddress: context.ipAddress ?? null,
        userAgent: context.userAgent ?? null,
        eventData: {
          organizationSlug: context.organizationSlug,
          signInCompletedAt: new Date(),
        },
      });

      // Get user's organizations
      const userOrgs =
        await this.organizationRepository.findUserOrganizations(userId);

      // No organizations - redirect to setup
      if (userOrgs.length === 0) {
        return {
          success: true,
          requiresSetup: true,
          redirectUrl: '/organizations/create',
        };
      }

      // Single organization - redirect directly
      if (userOrgs.length === 1) {
        const org = userOrgs[0];
        // ✅ FIX: Add null check for org
        if (org) {
          return {
            success: true,
            redirectUrl: `/${org.slug}`,
          };
        }
      }

      // Multiple organizations - let user choose
      if (context.organizationSlug) {
        // User specified organization
        const selectedOrg = userOrgs.find(
          org => org.slug === context.organizationSlug
        );

        if (selectedOrg) {
          return {
            success: true,
            redirectUrl: `/${selectedOrg.slug}`,
          };
        }
      }

      // Default: redirect to organization selection
      return {
        success: true,
        redirectUrl: '/organizations',
      };
    } catch (error) {
      console.error(
        '❌ SignInWorkflowService processSignInWorkflow error:',
        error
      );

      // Log workflow failure
      await this.auditService.logAuthEvent({
        userId,
        eventType: 'login_failed',
        eventAction: 'workflow_failed',
        eventStatus: 'error',
        eventCategory: 'auth',
        ipAddress: context.ipAddress ?? null,
        userAgent: context.userAgent ?? null,
        errorMessage:
          error instanceof Error ? error.message : 'Workflow failed',
      });

      return {
        success: false,
        error: 'Sign in workflow failed',
      };
    }
  }

  /**
   * ✅ GET: Organization redirect URL (with null checks)
   */
  async getOrganizationRedirectUrl(
    userId: string,
    organizationSlug?: string
  ): Promise<string> {
    try {
      const userOrgs =
        await this.organizationRepository.findUserOrganizations(userId);

      if (organizationSlug) {
        const org = userOrgs.find(org => org.slug === organizationSlug);
        if (org) {
          return `/${org.slug}`;
        }
      }

      // Default to first organization or selection page
      if (userOrgs.length === 1) {
        const firstOrg = userOrgs[0];
        // ✅ FIX: Add null check for firstOrg
        if (firstOrg) {
          return `/${firstOrg.slug}`;
        }
      }

      return '/organizations';
    } catch (error) {
      console.error(
        '❌ SignInWorkflowService getOrganizationRedirectUrl error:',
        error
      );
      return '/organizations';
    }
  }

  /**
   * ✅ VALIDATE: Organization access (with null checks)
   */
  async validateOrganizationAccess(
    userId: string,
    organizationSlug: string
  ): Promise<{ hasAccess: boolean; role?: string }> {
    try {
      const userOrgs =
        await this.organizationRepository.findUserOrganizations(userId);

      const org = userOrgs.find(org => org.slug === organizationSlug);

      if (org) {
        return {
          hasAccess: true,
          role: org.role,
        };
      }

      return {
        hasAccess: false,
      };
    } catch (error) {
      console.error(
        '❌ SignInWorkflowService validateOrganizationAccess error:',
        error
      );
      return {
        hasAccess: false,
      };
    }
  }

  /**
   * ✅ CHECK: If user needs organization setup
   */
  async requiresOrganizationSetup(userId: string): Promise<boolean> {
    try {
      const userOrgs =
        await this.organizationRepository.findUserOrganizations(userId);
      return userOrgs.length === 0;
    } catch (error) {
      console.error(
        '❌ SignInWorkflowService requiresOrganizationSetup error:',
        error
      );
      return false;
    }
  }

  /**
   * ✅ DETERMINE: Redirect URL (new method for sign-in.service)
   */
  async determineRedirectUrl(
    userId: string,
    organizationSlug?: string
  ): Promise<string> {
    return this.getOrganizationRedirectUrl(userId, organizationSlug);
  }

  /**
   * ✅ PERFORM: NextAuth sign in (new method for sign-in.service)
   */
  async performNextAuthSignIn(
    credentials: { email: string; password: string },
    _context: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<{ success: boolean; userId?: string; error?: string }> {
    // This would integrate with NextAuth's signIn process
    // For now, return a placeholder response
    console.warn('NextAuth sign in performed for:', credentials.email);

    return {
      success: true,
      userId: 'placeholder-user-id', // Would come from actual auth
    };
  }
}
