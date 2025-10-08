import { auth } from '../../lib/nextauth/handlers';
import type {
  AuthContext,
  AuthContextInput,
  EnhancedAuthContext,
} from '../../types';

export class AuthContextService {
  async getAuthContext(input: AuthContextInput = {}): Promise<AuthContext> {
    try {
      const session = await auth();

      if (!session?.user) {
        throw new Error('Authentication required');
      }

      const authContext: AuthContext = {
        user: {
          id: session.user.id as string,
          email: session.user.email as string,
          name: session.user.name as string,
          role: 'user',
          image: session.user.image ?? undefined,
          isActive: true,
          isSuperAdmin: false,
        },
        session: {
          id: 'session-id',
          userId: session.user.id as string,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
          enterprise: {
            organizationId: input.organizationId ?? null,
            role: 'member',
            roles: ['user'],
            permissions: [],
            securityLevel: 'normal',
            riskScore: 0,
          },
        },
      };

      return authContext;
    } catch (error) {
      console.error('❌ AuthContextService getAuthContext error:', error);
      throw error;
    }
  }

  async getOptionalAuthContext(
    input: AuthContextInput = {}
  ): Promise<AuthContext | null> {
    try {
      return await this.getAuthContext(input);
    } catch {
      return null;
    }
  }

  async validateSession(): Promise<boolean> {
    try {
      const session = await auth();
      return !!session?.user;
    } catch {
      return false;
    }
  }

  async getCurrentUser() {
    try {
      const session = await auth();
      if (!session?.user) {
        return null;
      }

      return {
        id: session.user.id as string,
        email: session.user.email as string,
        name: session.user.name as string,
        role: 'user',
        image: session.user.image ?? undefined,
        isActive: true,
        isSuperAdmin: false,
      };
    } catch {
      return null;
    }
  }

  async getCurrentUserId(): Promise<string | null> {
    try {
      const user = await this.getCurrentUser();
      return user?.id ?? null;
    } catch {
      return null;
    }
  }

  async hasValidSession(): Promise<boolean> {
    return this.validateSession();
  }

  async updateLastAccess(_userId: string): Promise<void> {
    console.warn('updateLastAccess not implemented:', _userId);
  }

  async getUserSecurityInfo(_userId: string) {
    return {
      riskScore: 0,
      securityLevel: 'normal',
      lastLoginAt: new Date(),
    };
  }
}

export type { EnhancedAuthContext };
