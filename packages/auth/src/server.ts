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

// ✅ EXPORTS: Clean Architecture Layers
export * from './application';
export * from './infrastructure';
export * from './utils';

// ✅ DOMAIN: Exportar domain entities (User entity)
export * from './domain';

// ✅ TYPES: Exportar apenas types específicos (não User interface)
export type {
  AuthContext,
  AuthEventStatus,
  AuthEventType,
  DeviceType,
  EnhancedAuthContext,
  MemberRole,
  SecurityLevel,
} from './types';
