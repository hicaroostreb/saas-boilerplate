import { redirect } from 'next/navigation';
import { dedupedAuth } from './index';

export async function getSession() {
  return await dedupedAuth();
}

export async function getAuthContext() {
  const session = await dedupedAuth();

  if (!session?.user) {
    redirect('/auth/sign-in');
  }

  return {
    session,
    user: session.user,
  };
}

export async function requireAuth() {
  const session = await dedupedAuth();

  if (!session?.user) {
    redirect('/auth/sign-in');
  }

  return session;
}

// Helper para contexto de organização (futuro)
export async function getAuthOrganizationContext() {
  const session = await dedupedAuth();

  if (!session?.user) {
    redirect('/auth/sign-in');
  }

  // TODO: Implementar lógica de organização quando necessário
  // Por ora, retorna só o contexto básico
  return {
    session,
    user: session.user,
    // organization: ..., // Implementar quando houver organizações
  };
}
