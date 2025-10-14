import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const authConfig: NextAuthConfig = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: '/auth/sign-in',
    error: '/auth/error',
  },

  callbacks: {
    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }
      return token;
    },
  },

  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Usar SignInHandler da Clean Architecture ao invés do flow
          const { SignInHandler } = await import('../../application/commands/SignInHandler');
          const { DrizzleUserRepository } = await import('../../infrastructure/repositories/DrizzleUserRepository');
          const { BcryptPasswordHasher } = await import('../../infrastructure/services/BcryptPasswordHasher');

          const userRepository = new DrizzleUserRepository();
          const passwordHasher = new BcryptPasswordHasher();
          const signInHandler = new SignInHandler(userRepository, passwordHasher);

          const result = await signInHandler.handle({
            email: credentials.email as string,
            password: credentials.password as string,
          });

          if (!result.success || !result.data) {
            console.warn('NextAuth: Sign-in failed:', result.error);
            return null;
          }

          return {
            id: result.data.id,
            email: result.data.email,
            name: result.data.name,
          };
        } catch (error) {
          console.error('NextAuth: Sign-in error:', error);
          return null;
        }
      },
    }),
  ],
};
