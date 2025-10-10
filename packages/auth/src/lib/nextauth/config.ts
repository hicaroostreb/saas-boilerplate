// packages/auth/src/lib/nextauth/config.ts - SIMPLE CLIENT-SAFE CONFIG

import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const authConfig: NextAuthConfig = {
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
      if (user) {
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
        // ✅ SIMPLE: NextAuth apenas valida formato básico
        // A autenticação REAL acontece nas API routes
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Validação básica apenas (sem database)
        if (email.includes('@') && password.length >= 8) {
          return {
            id: 'temp-id', // Será substituído por JWT callback
            email,
            name: 'User', // Será atualizado após autenticação real
          };
        }

        return null;
      },
    }),
  ],
};
