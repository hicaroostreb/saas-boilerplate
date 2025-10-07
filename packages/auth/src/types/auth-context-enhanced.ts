// Enhanced Auth Context Types

export interface AuthContext {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    image?: string;
    isActive: boolean;
    isSuperAdmin: boolean;
  };
  session: {
    id: string;
    userId: string;
    expires: Date;
    enterprise: {
      organizationId: string | null;
      role: string;
      roles: string[];
      permissions: string[];
      securityLevel: 'low' | 'normal' | 'high' | 'critical';
      riskScore: number;
    };
  };
}

export interface AuthContextInput {
  organizationId?: string;
  deviceId?: string;
}

export interface SessionWithUser {
  id: string;
  userId: string;
  expires: Date;
  user: {
    id: string;
    email: string;
    name: string;
    image?: string;
    isActive: boolean;
    isSuperAdmin: boolean;
  };
}

export interface EnhancedAuthContext extends AuthContext {
  device?: {
    id: string;
    fingerprint: string;
  };
  security?: {
    riskScore: number;
    securityLevel: string;
    lastLoginAt: Date;
  };
}
