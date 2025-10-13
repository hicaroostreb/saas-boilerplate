// packages/auth/src/server.ts - SERVER-SIDE ONLY EXPORTS

// ✅ SERVER: NextAuth handlers and functions
export {
  auth as getServerSession,
  handlers,
  signOutAction,
} from './lib/nextauth/handlers';

// ✅ SERVER: RequireAuth wrapper
export async function requireAuth() {
  const { auth } = await import('./lib/nextauth/handlers');
  const session = await auth();

  if (!session?.user) {
    throw new Error('Authentication required');
  }

  return session;
}

// ✅ SERVER: Flow exports (with database dependencies)
export { forgotPasswordFlow } from './core/flows/forgot-password.flow';
export { resetPasswordFlow } from './core/flows/reset-password.flow';
export { signInFlow } from './core/flows/sign-in.flow';
export { signUpFlow } from './core/flows/sign-up.flow';

// ✅ SERVER: Service exports
export * from './core/services';

// ✅ SERVER: Repository exports
export * from './adapters/repositories';
