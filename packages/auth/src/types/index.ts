// ============================================
// SCHEMAS (CRITICAL - FIRST EXPORT)
// ============================================
export * from './schemas';

// ============================================
// EXISTING TYPES (sem conflitos)
// ============================================
export * from './base';
export * from './config.types';
// Não exportar session.types para evitar conflitos com base

// ============================================
// AUTH CONTEXT TYPES (COMPLETE WITH ALL PROPERTIES)
// ============================================
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
      securityLevel: 'normal' | 'elevated' | 'high_risk' | 'critical';
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

// ============================================
// UTILITY TYPES
// ============================================
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

// ============================================
// VALIDATION RESULT TYPE
// ============================================
export type ValidationResult = {
  isValid: boolean;
  issues: string[];
  requiresMFA?: boolean;
};
