import { NextRequest, NextResponse } from 'next/server';
import { TokenRequiredError } from '../../domain/exceptions';
import {
  createOrganizationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  sendInvitationSchema,
  signInSchema,
  signUpSchema,
} from '../../types/schemas';
import {
  contextExtractors,
  withAuth,
  withErrorHandler,
} from '../../utils/error-handler.utils';
import { AuthServiceFactory } from '../factories/AuthServiceFactory';

/**
 * Extensão do NextRequest para incluir sessão
 */
interface RequestWithSession extends NextRequest {
  _session?: {
    user: {
      id: string;
      email: string;
      name: string;
    };
  };
}

/**
 * AuthController - Gateway simplificado com tratamento centralizado de erros
 * Cada método foca apenas na lógica de negócio
 */
export class AuthController {
  /**
   * POST /api/auth/sign-in
   */
  signIn = withErrorHandler(
    async (request: NextRequest): Promise<NextResponse> => {
      const body = await request.json();
      const validatedData = signInSchema.parse(body);

      const handler = AuthServiceFactory.createSignInHandler();
      const userProfile = await handler.execute(validatedData);

      return NextResponse.json({
        success: true,
        data: { user: userProfile },
      });
    },
    {
      handlerName: 'signIn',
      successMessage: 'User signed in successfully',
      extractContextData: contextExtractors.authOperation,
    }
  );

  /**
   * POST /api/auth/sign-up
   */
  signUp = withErrorHandler(
    async (request: NextRequest): Promise<NextResponse> => {
      const body = await request.json();
      const validatedData = signUpSchema.parse(body);

      const handler = AuthServiceFactory.createRegisterUserHandler();
      const userProfile = await handler.execute(validatedData);

      return NextResponse.json({
        message: 'User created successfully',
        user: userProfile,
      });
    },
    {
      handlerName: 'signUp',
      successMessage: 'User registered successfully',
      extractContextData: contextExtractors.authOperation,
    }
  );

  /**
   * POST /api/auth/forgot-password
   */
  forgotPassword = withErrorHandler(
    async (request: NextRequest): Promise<NextResponse> => {
      const body = await request.json();
      const validatedData = forgotPasswordSchema.parse(body);

      const handler = AuthServiceFactory.createForgotPasswordHandler();
      const result = await handler.execute(validatedData);

      return NextResponse.json(result, { status: 200 });
    },
    {
      handlerName: 'forgotPassword',
      successMessage: 'Password reset request processed',
      extractContextData: contextExtractors.authOperation,
    }
  );

  /**
   * POST /api/auth/reset-password
   */
  resetPassword = withErrorHandler(
    async (request: NextRequest): Promise<NextResponse> => {
      const body = await request.json();
      const validatedData = resetPasswordSchema.parse(body);

      const handler = AuthServiceFactory.createResetPasswordHandler();
      const result = await handler.execute({
        token: validatedData.token,
        password: validatedData.password,
        confirmPassword: validatedData.confirmPassword,
      });

      return NextResponse.json(result, { status: 200 });
    },
    {
      handlerName: 'resetPassword',
      successMessage: 'Password reset successfully',
    }
  );

  /**
   * POST /api/auth/validate-reset-token
   */
  validateResetToken = withErrorHandler(
    async (request: NextRequest): Promise<NextResponse> => {
      const body = await request.json();
      const { token } = body;

      if (!token) {
        throw new TokenRequiredError();
      }

      const handler = AuthServiceFactory.createValidateResetTokenHandler();
      const result = await handler.execute({ token });

      return NextResponse.json(result);
    },
    {
      handlerName: 'validateResetToken',
      successMessage: 'Reset token validated successfully',
    }
  );

  /**
   * GET /api/auth/check-user
   */
  checkUser = withAuth(
    async (request: NextRequest): Promise<NextResponse> => {
      const sessionRequest = request as RequestWithSession;
      const session = sessionRequest._session;

      if (!session) {
        throw new Error('Session not found');
      }

      return NextResponse.json({ user: session.user });
    },
    {
      handlerName: 'checkUser',
      successMessage: 'User session validated',
      extractContextData: contextExtractors.sessionOperation,
    }
  );

  // ============================================
  // ORGANIZATION METHODS
  // ============================================

  /**
   * POST /api/organizations/create
   */
  createOrganization = withAuth(
    async (request: NextRequest): Promise<NextResponse> => {
      const sessionRequest = request as RequestWithSession;
      const session = sessionRequest._session;

      if (!session) {
        throw new Error('Session not found');
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
    },
    {
      handlerName: 'createOrganization',
      successMessage: 'Organization created successfully',
      extractContextData: contextExtractors.organizationOperation,
    }
  );

  /**
   * POST /api/organizations/invitations/send
   */
  sendInvitation = withAuth(
    async (request: NextRequest): Promise<NextResponse> => {
      const sessionRequest = request as RequestWithSession;
      const session = sessionRequest._session;

      if (!session) {
        throw new Error('Session not found');
      }

      const body = await request.json();
      const validatedData = sendInvitationSchema.parse(body);

      const handler = AuthServiceFactory.createSendInvitationHandler();
      const invitation = await handler.execute(validatedData, session.user.id);

      return NextResponse.json({
        success: true,
        invitation,
      });
    },
    {
      handlerName: 'sendInvitation',
      successMessage: 'Invitation sent successfully',
      extractContextData: (
        request: NextRequest,
        body?: Record<string, unknown>
      ) => ({
        ...contextExtractors.organizationOperation(request, body),
        invitedEmail: body?.email as string | undefined,
        role: body?.role as string | undefined,
      }),
    }
  );
}
