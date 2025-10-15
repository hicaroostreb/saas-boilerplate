'use server';

import { signIn, signOut } from './handlers';

/**
 * Server Action para sign in via form
 */
export async function signInAction(formData: FormData): Promise<void> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  await signIn('credentials', {
    email,
    password,
    redirectTo: '/dashboard',
  });
}

/**
 * Server Action para sign out
 */
export async function signOutAction(): Promise<void> {
  await signOut({
    redirectTo: '/auth/sign-in',
  });
}
