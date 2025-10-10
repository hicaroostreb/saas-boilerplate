// packages/auth/src/core/flows/sign-up.flow.ts

import { hash } from 'bcryptjs';
import type { SignUpInput } from '../../types/schemas/sign-up.schema';

// Resultado do flow
export interface SignUpResult {
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

// Flow principal de sign up
export async function signUpFlow(input: SignUpInput): Promise<SignUpResult> {
  try {
    const { name, email, password } = input;

    // Importação dinâmica da repository enterprise
    const { UserRepository } = await import(
      '../../adapters/repositories/user.repository'
    );
    const userRepository = new UserRepository();

    // 1. Verificar se usuário já existe
    const existingUser = await userRepository.findByEmail(email.toLowerCase());
    if (existingUser) {
      return {
        success: false,
        error: 'User already exists with this email',
      };
    }

    // 2. Hash da senha
    const passwordHash = await hash(password, 12);

    // 3. Criar usuário usando repository enterprise
    const newUser = await userRepository.create({
      email: email.toLowerCase(),
      name: name.trim(),
      passwordHash,
      isActive: true,
      isSuperAdmin: false,
    });

    if (!newUser) {
      return {
        success: false,
        error: 'Failed to create user in database',
      };
    }

    // ✅ ESLint fix: Usar console.warn ao invés de console.log
    console.warn('User created successfully in database:', {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    });

    return {
      success: true,
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          // ✅ ESLint fix: Usar ?? ao invés de ||
          name: newUser.name ?? '',
        },
      },
    };
  } catch (error) {
    console.error('SignUp Flow Error:', error);

    // Handle database constraint errors (duplicate email)
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2002' || error.code === '23505') {
        return {
          success: false,
          error: 'User already exists with this email',
        };
      }
    }

    return {
      success: false,
      // ✅ ESLint fix: Usar ?? ao invés de ||
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
