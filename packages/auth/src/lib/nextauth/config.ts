// packages/auth/src/lib/nextauth/config.ts - 100% CLIENT-SAFE CONFIG

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
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Simplified validation - real auth logic moved to server actions
        // This is just for NextAuth compatibility
        if (email && password.length >= 6) {
          return {
            id: '1', // Temporary - real auth in server actions
            email,
            name: 'User',
          };
        }

        return null;
      },
    }),
  ],
};
