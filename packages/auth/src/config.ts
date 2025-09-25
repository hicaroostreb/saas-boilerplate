import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db, users } from '@workspace/database';
import { eq } from 'drizzle-orm';
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { verifyPassword } from './password';

export const authConfig: NextAuthConfig = {
  adapter: DrizzleAdapter(db),

  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async credentials => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const [user] = await db
            .select({
              id: users.id,
              email: users.email,
              name: users.name,
              passwordHash: users.passwordHash,
              role: users.role,
            })
            .from(users)
            .where(eq(users.email, credentials.email as string))
            .limit(1);

          if (
            !user ||
            !(await verifyPassword(
              credentials.password as string,
              user.passwordHash
            ))
          ) {
            return null;
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),

    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  pages: {
    signIn: '/auth/sign-in',
    error: '/auth/error',
  },

  callbacks: {
    session: async ({ session, user }) => {
      if (session.user && user) {
        session.user.id = user.id;
        (session.user as any).role = (user as any).role;
      }
      return session;
    },
  },
};
