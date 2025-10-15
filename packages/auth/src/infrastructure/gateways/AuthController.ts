import { NextRequest, NextResponse } from 'next/server';
import {
  createOrganizationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  sendInvitationSchema,
  signInSchema,
  signUpSchema,
} from '../../types/schemas';
import { AuthServiceFactory } from '../factories/AuthServiceFactory';

/**
 * AuthController - Gateway para APIs Next.js
 * Orquestra handlers via Factory DI
 */
export class AuthController {
  /**
   * POST /api/auth/sign-in
   */
  async signIn(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const validatedData = signInSchema.parse(body);

      const handler = AuthServiceFactory.createSignInHandler();
      const userProfile = await handler.execute(validatedData);

      return NextResponse.json({
        success: true,
        data: { user: userProfile },
      });
    } catch (error) {
      console.error('❌ AuthController signIn error:', error);

      if (error instanceof Error && error.message === 'Invalid credentials') {
        return NextResponse.json(
          { error: 'Invalid credentials', success: false },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: 'Internal server error', success: false },
        { status: 500 }
      );
    }
  }

  /**
   * POST /api/auth/sign-up
   */
  async signUp(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const validatedData = signUpSchema.parse(body);

      const handler = AuthServiceFactory.createRegisterUserHandler();
      const userProfile = await handler.execute(validatedData);

      return NextResponse.json({
        message: 'User created successfully',
        user: userProfile,
      });
    } catch (error) {
      console.error('❌ AuthController signUp error:', error);

      if (
        error instanceof Error &&
        error.message === 'User already exists with this email'
      ) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  /**
   * POST /api/auth/forgot-password
   */
  async forgotPassword(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const validatedData = forgotPasswordSchema.parse(body);

      const handler = AuthServiceFactory.createForgotPasswordHandler();
      const result = await handler.execute(validatedData);

      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      console.error('❌ AuthController forgotPassword error:', error);

      return NextResponse.json(
        { message: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  /**
   * POST /api/auth/reset-password
   */
  async resetPassword(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const validatedData = resetPasswordSchema.parse(body);

      const handler = AuthServiceFactory.createResetPasswordHandler();
      const result = await handler.execute({
        token: validatedData.token,
        password: validatedData.password,
        confirmPassword: validatedData.confirmPassword,
      });

      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      console.error('❌ AuthController resetPassword error:', error);

      if (
        error instanceof Error &&
        (error.message.includes('Invalid') || error.message.includes('expired'))
      ) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }

      return NextResponse.json(
        { message: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  /**
   * POST /api/auth/validate-reset-token
   */
  async validateResetToken(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const { token } = body;

      if (!token) {
        return NextResponse.json(
          { error: 'Token is required' },
          { status: 400 }
        );
      }

      const handler = AuthServiceFactory.createValidateResetTokenHandler();
      const result = await handler.execute({ token });

      return NextResponse.json(result);
    } catch (error) {
      console.error('❌ AuthController validateResetToken error:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }
  }

  /**
   * GET /api/auth/check-user (mantém compatibilidade com sessão)
   */
  async checkUser(_request: NextRequest): Promise<NextResponse> {
    try {
      const { getServerSession } = await import('@workspace/auth/server');
      const session = await getServerSession();

      if (!session?.user) {
        return NextResponse.json(
          { error: 'Not authenticated' },
          { status: 401 }
        );
      }

      return NextResponse.json({ user: session.user });
    } catch (error) {
      console.error('❌ AuthController checkUser error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  // ============================================
  // ORGANIZATION METHODS
  // ============================================

  /**
   * POST /api/organizations/create
   */
  async createOrganization(request: NextRequest): Promise<NextResponse> {
    try {
      const { getServerSession } = await import('@workspace/auth/server');
      const session = await getServerSession();

      if (!session?.user?.id) {
        return NextResponse.json(
          { error: 'Not authenticated' },
          { status: 401 }
        );
      }

      const body = await request.json();
      const validatedData = createOrganizationSchema.parse(body);

      const handler = AuthServiceFactory.createCreateOrganizationHandler();
      const organization = await handler.execute(
        validatedData,
        session.user.id
      );

      return NextResponse.json({
        success: true,
        organization,
      });
    } catch (error) {
      console.error('❌ AuthController createOrganization error:', error);

      if (
        error instanceof Error &&
        error.message === 'Organization slug already exists'
      ) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  /**
   * POST /api/organizations/invitations/send
   */
  async sendInvitation(request: NextRequest): Promise<NextResponse> {
    try {
      const { getServerSession } = await import('@workspace/auth/server');
      const session = await getServerSession();

      if (!session?.user?.id) {
        return NextResponse.json(
          { error: 'Not authenticated' },
          { status: 401 }
        );
      }

      const body = await request.json();
      const validatedData = sendInvitationSchema.parse(body);

      const handler = AuthServiceFactory.createSendInvitationHandler();
      const invitation = await handler.execute(validatedData, session.user.id);

      return NextResponse.json({
        success: true,
        invitation,
      });
    } catch (error) {
      console.error('❌ AuthController sendInvitation error:', error);

      if (
        error instanceof Error &&
        (error.message.includes('not found') ||
          error.message.includes('permission'))
      ) {
        return NextResponse.json(
          { error: error.message },
          { status: error.message.includes('not found') ? 404 : 403 }
        );
      }

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
}
