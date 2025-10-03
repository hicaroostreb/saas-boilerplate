/**
 * @workspace/ui/auth - Authentication Feature Layer
 *
 * Componentes de autenticação e gerenciamento de usuário.
 * Esta camada pode importar tokens, utils, primitives, components, hooks e providers.
 */

// === AUTHENTICATION FORMS ===
export { ForgotPasswordForm } from './forgot-password-form';
export type { ForgotPasswordFormProps } from './forgot-password-form';

export { ResetPasswordForm } from './reset-password-form';
export type { ResetPasswordFormProps } from './reset-password-form';

export { SignInForm } from './signin-form';
export type { SignInFormProps } from './signin-form';

export { SignUpForm } from './signup-form';
export type { SignUpFormProps } from './signup-form';

// === SESSION MANAGEMENT ===
export { SessionManager } from './session-manager';
export type { SessionData, SessionManagerProps } from './session-manager';
