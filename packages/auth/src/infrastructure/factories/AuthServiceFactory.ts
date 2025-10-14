import { ForgotPasswordHandler } from '../../application/commands/ForgotPasswordHandler';
import { RegisterUserHandler } from '../../application/commands/RegisterUserHandler';
import { ResetPasswordHandler } from '../../application/commands/ResetPasswordHandler';
import { SignInHandler } from '../../application/commands/SignInHandler';
import { CreateOrganizationHandler } from '../../application/commands/organization/CreateOrganizationHandler';
import { SendInvitationHandler } from '../../application/commands/organization/SendInvitationHandler';
import { GetUserProfileHandler } from '../../application/queries/GetUserProfileHandler';
import { ValidateResetTokenHandler } from '../../application/queries/ValidateResetTokenHandler';
import { DrizzleInvitationRepository } from '../repositories/DrizzleInvitationRepository';
import { DrizzleOrganizationRepository } from '../repositories/DrizzleOrganizationRepository';
import { DrizzleSessionRepository } from '../repositories/DrizzleSessionRepository';
import { DrizzleUserRepository } from '../repositories/DrizzleUserRepository';
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
    const sessionRepo = new DrizzleSessionRepository(); // ✅ ADICIONADO
    return new ForgotPasswordHandler(userRepo, sessionRepo); // ✅ INJETADO
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
