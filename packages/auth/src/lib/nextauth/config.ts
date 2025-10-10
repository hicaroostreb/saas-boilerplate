// packages/auth/src/lib/nextauth/config.ts - CONFIG WITHOUT SECRET

import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const authConfig: NextAuthConfig = {
  // ✅ SECRET: Moved to handlers.ts where NextAuth is instantiated

  // ✅ JWT: Required for Credentials provider
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

        // ✅ Manual session tracking
        try {
          const { SessionRepository } = await import(
            '../../adapters/repositories/session.repository'
          );
          const sessionRepo = new SessionRepository();

          await sessionRepo.create({
            userId: user.id,
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            ipAddress: undefined,
            userAgent: undefined,
          });

          console.warn('✅ Manual session created for user:', user.id);
        } catch (error) {
          console.error('❌ Failed to create manual session:', error);
        }
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
          const { signInFlow } = await import('../../core/flows/sign-in.flow');

          const result = await signInFlow({
            email: credentials.email as string,
            password: credentials.password as string,
          });

          if (!result.success || !result.data) {
            console.warn('NextAuth: Sign-in failed:', result.error);
            return null;
          }

          return {
            id: result.data.user.id,
            email: result.data.user.email,
            name: result.data.user.name,
          };
        } catch (error) {
          console.error('NextAuth: Sign-in error:', error);
          return null;
        }
      },
    }),
  ],
};
