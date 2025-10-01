// packages/auth/src/config/providers.config.ts - NEXTAUTH PROVIDERS CONFIGURATION

import type { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { AuthenticationService } from '../services/authentication.service';

/**
 * ✅ ENTERPRISE: NextAuth Providers Configuration
 * Single Responsibility: Authentication provider setup
 */

const authService = new AuthenticationService();

export const providersConfig: NextAuthConfig['providers'] = [
  /**
   * ✅ CREDENTIALS: Email/Password authentication
   */
  CredentialsProvider({
    id: 'credentials',
    name: 'credentials',
    credentials: {
      email: {
        label: 'Email',
        type: 'email',
        placeholder: 'your-email@example.com',
      },
      password: {
        label: 'Password',
        type: 'password',
        placeholder: 'Your password',
      },
    },
    async authorize(credentials) {
      try {
        if (!credentials?.email || !credentials?.password) {
          console.warn('[Credentials Provider] Missing email or password');
          return null;
        }

        // ✅ FIX: Use authenticate method which returns AuthenticationResult
        const result = await authService.authenticate(
          credentials.email as string,
          credentials.password as string
        );

        // ✅ FIX: Check result.success and use result.user
        if (result.success && result.user) {
          console.warn(
            `[Credentials Provider] Authentication successful for: ${result.user.email}`
          );

          return {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            image: result.user.image,
          };
        }

        console.warn(
          `[Credentials Provider] Authentication failed: ${result.error}`
        );
        return null;
      } catch (error) {
        console.error('[Credentials Provider] Authentication error:', error);
        return null;
      }
    },
  }),

  /**
   * ✅ GOOGLE: OAuth authentication
   */
  GoogleProvider({
    clientId: process.env.AUTH_GOOGLE_ID ?? '',
    clientSecret: process.env.AUTH_GOOGLE_SECRET ?? '',
    allowDangerousEmailAccountLinking: true,
  }),
];

export default providersConfig;
