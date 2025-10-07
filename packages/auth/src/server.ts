// packages/auth/src/server.ts - SERVER EXPORTS (updated)

// NextAuth integration
export { authConfig } from './lib/nextauth/config';
export {
  auth,
  handlers,
  signIn,
  signInAction,
  signOut,
  signOutAction,
} from './lib/nextauth/handlers';

// Server-side helpers
export async function getServerSession() {
  const { auth } = await import('./lib/nextauth/handlers');
  return await auth();
}

export async function requireAuth() {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Error('Authentication required');
  }
  return session;
}

// Enterprise services (backward compatibility)
export * from './core/services/audit.service';
export * from './core/services/password.service';
export * from './core/services/security.service';
