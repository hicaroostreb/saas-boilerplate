// packages/auth/src/lib/nextauth/handlers.ts - NEXTAUTH HANDLERS WITH EXPLICIT TYPE ANNOTATIONS

import NextAuth, { type NextAuthResult } from 'next-auth';
import { authConfig } from './config';

// Create NextAuth instance with proper typing
const nextAuthResult: NextAuthResult = NextAuth(authConfig);

// Export with explicit type annotations
export const auth: typeof nextAuthResult.auth = nextAuthResult.auth;
export const handlers: typeof nextAuthResult.handlers = nextAuthResult.handlers;
export const signIn: typeof nextAuthResult.signIn = nextAuthResult.signIn;
export const signOut: typeof nextAuthResult.signOut = nextAuthResult.signOut;

// Action wrappers with proper return types and "use server"
export async function signInAction(formData: FormData): Promise<void> {
  'use server';

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  await signIn('credentials', {
    email,
    password,
    redirectTo: '/dashboard',
  });
}

export async function signOutAction(): Promise<void> {
  'use server';

  await signOut({
    redirectTo: '/auth/sign-in',
  });
}
