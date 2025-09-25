import NextAuth from 'next-auth';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { authConfig } from './config';

// Abordagem simplificada
export const { auth, handlers, signIn, signOut } = NextAuth(authConfig) as any;

// Função de cache
export const dedupedAuth = cache(auth);

// Função para exigir autenticação (NOVA)
export const requireAuth = async () => {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/sign-in');
  }

  return session;
};

// Re-exports
export * from './context';
export * from './password';
export { authConfig };

// Types melhorados
export type Session = Awaited<ReturnType<typeof auth>>;
export type User = NonNullable<Session>['user'];
