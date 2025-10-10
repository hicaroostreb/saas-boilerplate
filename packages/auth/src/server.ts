// packages/auth/src/server.ts - SERVER-ONLY EXPORTS

// ============================================
// FLOWS (SERVER ONLY)
// ============================================
export * from './core/flows';

// ============================================
// NEXTAUTH SERVER INTEGRATION
// ============================================
export { authConfig } from './lib/nextauth/config';
export {
  auth,
  handlers,
  signIn,
  signInAction,
  signOut,
  signOutAction,
} from './lib/nextauth/handlers';

// Server-side helpers only
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
