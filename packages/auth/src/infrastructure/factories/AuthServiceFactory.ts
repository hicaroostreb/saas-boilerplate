import { SignInHandler } from '../../application/commands/SignInHandler';
import { RegisterUserHandler } from '../../application/commands/RegisterUserHandler';
import { ForgotPasswordHandler } from '../../application/commands/ForgotPasswordHandler';
import { ResetPasswordHandler } from '../../application/commands/ResetPasswordHandler';
import { CreateOrganizationHandler } from '../../application/commands/organization/CreateOrganizationHandler';
import { SendInvitationHandler } from '../../application/commands/organization/SendInvitationHandler';
import { GetUserProfileHandler } from '../../application/queries/GetUserProfileHandler';
import { ValidateResetTokenHandler } from '../../application/queries/ValidateResetTokenHandler';
import { DrizzleUserRepository } from '../repositories/DrizzleUserRepository';
import { DrizzleSessionRepository } from '../repositories/DrizzleSessionRepository';
import { DrizzleOrganizationRepository } from '../repositories/DrizzleOrganizationRepository';
import { DrizzleInvitationRepository } from '../repositories/DrizzleInvitationRepository';
import { BcryptPasswordHasher } from '../services/BcryptPasswordHasher';

/**
 * Factory para criar handlers com DI configurada
 */
export class AuthServiceFactory {
  static createSignInHandler(): SignInHandler {
    const userRepo = new DrizzleUserRepository();
    const hasher = new BcryptPasswordHasher();
    return new SignInHandler(userRepo, hasher);
  }

  static createRegisterUserHandler(): RegisterUserHandler {
    const userRepo = new DrizzleUserRepository();
    const hasher = new BcryptPasswordHasher();
    return new RegisterUserHandler(userRepo, hasher);
  }

  static createForgotPasswordHandler(): ForgotPasswordHandler {
    const userRepo = new DrizzleUserRepository();
    return new ForgotPasswordHandler(userRepo);
  }

  static createResetPasswordHandler(): ResetPasswordHandler {
    const sessionRepo = new DrizzleSessionRepository();
    return new ResetPasswordHandler(sessionRepo);
  }

  static createGetUserProfileHandler(): GetUserProfileHandler {
    const userRepo = new DrizzleUserRepository();
    return new GetUserProfileHandler(userRepo);
  }

  static createValidateResetTokenHandler(): ValidateResetTokenHandler {
    const sessionRepo = new DrizzleSessionRepository();
    return new ValidateResetTokenHandler(sessionRepo);
  }

  // ✅ Organization Handlers
  static createCreateOrganizationHandler(): CreateOrganizationHandler {
    const orgRepo = new DrizzleOrganizationRepository();
    return new CreateOrganizationHandler(orgRepo);
  }

  static createSendInvitationHandler(): SendInvitationHandler {
    const orgRepo = new DrizzleOrganizationRepository();
    const inviteRepo = new DrizzleInvitationRepository();
    return new SendInvitationHandler(orgRepo, inviteRepo);
  }
}
