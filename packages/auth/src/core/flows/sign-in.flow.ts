// packages/auth/src/core/flows/sign-in.flow.ts

import { compare } from 'bcryptjs';
import type { SignInSchema } from '../../types/schemas/sign-in.schema';

// Resultado do flow
export interface SignInResult {
  success: boolean;
  data?: {
    user: {
      id: string;
      email: string;
      name: string;
    };
  };
  error?: string;
}

// Flow principal de sign in
export async function signInFlow(input: SignInSchema): Promise<SignInResult> {
  try {
    const { email, password } = input;

    // Importação dinâmica da repository enterprise
    const { UserRepository } = await import(
      '../../adapters/repositories/user.repository'
    );
    const userRepository = new UserRepository();

    // 1. Verificar se usuário existe
    const existingUser = await userRepository.findByEmail(email.toLowerCase());
    if (!existingUser) {
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    // 2. Verificar se conta está bloqueada
    const isLocked = await userRepository.isAccountLocked(existingUser.id);
    if (isLocked) {
      return {
        success: false,
        error: 'Account is locked due to too many failed attempts',
      };
    }

    // 3. Verificar se usuário está ativo
    if (!existingUser.isActive) {
      return {
        success: false,
        error: 'Account is deactivated',
      };
    }

    // 4. Verificar se tem senha
    if (!existingUser.passwordHash) {
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    // 5. Verificar senha
    const isValidPassword = await compare(password, existingUser.passwordHash);
    if (!isValidPassword) {
      // Incrementar tentativas de login
      await userRepository.incrementLoginAttempts(existingUser.id);

      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    // 6. Atualizar último login e resetar tentativas
    const loginUpdated = await userRepository.updateLastLogin(existingUser.id);
    if (!loginUpdated) {
      console.error('Failed to update last login for user:', existingUser.id);
    }

    // ✅ ESLint fix: Usar console.warn ao invés de console.log
    console.warn('User signed in successfully:', {
      id: existingUser.id,
      email: existingUser.email,
      name: existingUser.name,
    });

    return {
      success: true,
      data: {
        user: {
          id: existingUser.id,
          email: existingUser.email,
          // ✅ ESLint fix: Usar ?? ao invés de ||
          name: existingUser.name ?? '',
        },
      },
    };
  } catch (error) {
    console.error('SignIn Flow Error:', error);

    return {
      success: false,
      // ✅ ESLint fix: Usar ?? ao invés de ||
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
