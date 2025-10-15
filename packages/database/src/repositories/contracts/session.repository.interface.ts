// packages/database/src/repositories/contracts/session.repository.interface.ts
// ============================================
// SESSION REPOSITORY CONTRACT - ENTERPRISE (REFACTORED)
// ============================================

export interface SessionData {
  session_token: string;
  tenant_id: string;
  user_id: string;
  expires: Date;
  created_at: Date;
  last_accessed_at: Date;
  ip_address: string | null;
  user_agent: string | null;
  device_type: string | null;
  device_name: string | null;
  browser: string | null;
  os: string | null;
  location: string | null;
}

export interface CreateSessionData {
  session_token?: string;
  user_id: string;
  expires: Date;
  ip_address?: string | null;
  user_agent?: string | null;
  device_type?: string | null;
  device_name?: string | null;
  browser?: string | null;
  os?: string | null;
  location?: string | null;
}

export interface SessionListItem {
  session_token: string;
  ip_address: string | null;
  user_agent: string | null;
  device_type: string | null;
  device_name: string | null;
  browser: string | null;
  os: string | null;
  last_accessed_at: Date;
  created_at: Date;
  expires: Date;
  is_current: boolean;
}

export interface ISessionRepository {
  // Core CRUD operations
  create(data: CreateSessionData): Promise<SessionData>;
  findByToken(session_token: string): Promise<SessionData | null>;
  updateLastAccessed(session_token: string): Promise<void>;
  deleteSession(session_token: string): Promise<void>;

  // User-specific operations
  findActiveByUser(user_id: string): Promise<SessionListItem[]>;
  countActiveForUser(user_id: string): Promise<number>;
  deleteAllForUser(
    user_id: string,
    except_session_token?: string
  ): Promise<number>;

  // Device tracking
  updateDeviceInfo(
    session_token: string,
    deviceInfo: {
      device_type?: string;
      device_name?: string;
      browser?: string;
      os?: string;
    }
  ): Promise<void>;

  updateLocation(
    session_token: string,
    location: { country?: string; city?: string; lat?: number; lon?: number }
  ): Promise<void>;

  // Cleanup operations
  deleteExpired(): Promise<number>;
}
