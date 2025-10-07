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
    // TODO: Implementar lógica completa
    // Por enquanto, retorno de teste

    console.warn('SignUp Flow:', input);

    return {
      success: true,
      data: {
        user: {
          id: 'temp-id-${Date.now()}',
          email: input.email,
          name: input.name,
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}
