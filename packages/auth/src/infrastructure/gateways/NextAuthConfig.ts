import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { SignInHandler } from '../../application/commands/SignInHandler';
import { DrizzleUserRepository } from '../repositories/DrizzleUserRepository';
import { BcryptPasswordHasher } from '../services/BcryptPasswordHasher';

/**
 * Gateway NextAuth - Integração com Clean Architecture via DI
 * Instancia repositories → services → handlers
 */
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
        // TODO: Implementar SessionHandler quando necessário
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
          // ✅ DI: Repository → Service → Handler
          const userRepo = new DrizzleUserRepository();
          const hasher = new BcryptPasswordHasher();
          const signInHandler = new SignInHandler(userRepo, hasher);

          const userProfile = await signInHandler.execute({
            email: credentials.email as string,
            password: credentials.password as string,
          });

          return {
            id: userProfile.id,
            email: userProfile.email,
            name: userProfile.name,
          };
        } catch (error) {
          console.error('❌ NextAuth authorize error:', error);
          return null;
        }
      },
    }),
  ],
};
