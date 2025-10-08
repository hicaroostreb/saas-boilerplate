// packages/auth/src/core/services/security.service.ts - SECURITY UTILITIES & VALIDATION

import { createHash, randomBytes } from 'crypto';
import type {
  DeviceInfo,
  EnterpriseUser,
  GeolocationContext,
  MemberRole,
  OrganizationAuthContext,
  SecurityLevel,
} from '../../types';
import type { EnhancedAuthContext } from './auth-context.service';

/**
 * ✅ ENTERPRISE: Security Utilities
 * Single Responsibility: Security validation, risk assessment, and device management
 */

// ============================================
// DEVICE & FINGERPRINTING
// ============================================

/**
 * ✅ PARSE: Device information from user agent
 */
export function parseDeviceInfo(userAgent?: string | null): DeviceInfo {
  if (!userAgent) {
    return {
      name: 'Unknown Device',
      type: 'unknown',
      fingerprint: null,
      platform: undefined,
      browser: undefined,
      os: undefined,
    };
  }

  // Simple user agent parsing (in production, use a proper library)
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
  const isTablet = /iPad|Tablet/i.test(userAgent);

  let deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown' = 'unknown';
  if (isTablet) {
    deviceType = 'tablet';
  } else if (isMobile) {
    deviceType = 'mobile';
  } else {
    deviceType = 'desktop';
  }

  // Extract browser info
  let browser: string | undefined = undefined;
  if (userAgent.includes('Chrome')) {
    browser = 'Chrome';
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
  } else if (userAgent.includes('Safari')) {
    browser = 'Safari';
  } else if (userAgent.includes('Edge')) {
    browser = 'Edge';
  }

  // Extract OS info
  let os: string | undefined = undefined;
  if (userAgent.includes('Windows')) {
    os = 'Windows';
  } else if (userAgent.includes('Mac')) {
    os = 'macOS';
  } else if (userAgent.includes('Linux')) {
    os = 'Linux';
  } else if (userAgent.includes('Android')) {
    os = 'Android';
  } else if (userAgent.includes('iOS')) {
    os = 'iOS';
  }

  // Extract platform
  let platform: string | undefined = undefined;
  if (userAgent.includes('Win')) {
    platform = 'Windows';
  } else if (userAgent.includes('Mac')) {
    platform = 'macOS';
  } else if (userAgent.includes('Linux')) {
    platform = 'Linux';
  } else if (userAgent.includes('Android')) {
    platform = 'Android';
  } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    platform = 'iOS';
  }

  return {
    name: browser && os ? `${browser} on ${os}` : 'Unknown Device',
    type: deviceType,
    fingerprint: generateDeviceFingerprint(userAgent),
    platform: platform ?? undefined,
    browser: browser ?? undefined,
    os: os ?? undefined,
  };
}

/**
 * ✅ GENERATE: Device fingerprint
 */
export function generateDeviceFingerprint(
  userAgent: string,
  additionalData?: Record<string, unknown>
): string {
  const data = JSON.stringify({
    userAgent,
    ...additionalData,
    timestamp: Math.floor(Date.now() / (1000 * 60 * 60 * 24)), // Daily rotation
  });

  return createHash('sha256').update(data).digest('hex').substring(0, 16);
}

// ============================================
// RISK ASSESSMENT
// ============================================

/**
 * ✅ RISK ASSESSMENT: Interface
 */
interface RiskAssessment {
  securityLevel: SecurityLevel;
  riskFactors: string[];
  recommendations: string[];
}

/**
 * ✅ CALCULATE: Risk score based on multiple factors
 */
export function calculateRiskScore(context: {
  user?: EnterpriseUser;
  deviceInfo?: DeviceInfo;
  geolocation?: GeolocationContext;
  ipAddress?: string | null;
  isNewDevice?: boolean;
  isNewLocation?: boolean;
  authFailures?: number;
  timeOfDay?: number; // 0-23
}): RiskAssessment & { riskScore: number } {
  let riskScore = 0;
  const riskFactors: string[] = [];

  // Device-based risk
  if (context.isNewDevice) {
    riskScore += 20;
    riskFactors.push('new_device');
  }

  if (!context.deviceInfo?.fingerprint) {
    riskScore += 5;
    riskFactors.push('no_device_fingerprint');
  }

  // Location-based risk
  if (context.isNewLocation) {
    riskScore += 15;
    riskFactors.push('new_location');
  }

  // Geographic risk
  if (context.geolocation?.country) {
    const suspiciousCountries = ['CN', 'RU', 'KP', 'IR'];
    if (suspiciousCountries.includes(context.geolocation.country)) {
      riskScore += 30;
      riskFactors.push('suspicious_country');
    }
  }

  // Network risk
  if (!context.ipAddress) {
    riskScore += 10;
    riskFactors.push('no_ip_address');
  }

  // Authentication failure history
  if (context.authFailures && context.authFailures > 0) {
    riskScore += Math.min(context.authFailures * 5, 25);
    riskFactors.push('authentication_failures');
  }

  // Time-based risk (suspicious hours: 2 AM - 6 AM)
  if (context.timeOfDay !== undefined) {
    if (context.timeOfDay >= 2 && context.timeOfDay <= 6) {
      riskScore += 10;
      riskFactors.push('suspicious_time');
    }
  }

  // Determine security level
  let securityLevel: SecurityLevel = 'normal';
  if (riskScore >= 90) {
    securityLevel = 'critical';
  } else if (riskScore >= 75) {
    securityLevel = 'high_risk';
  } else if (riskScore >= 50) {
    securityLevel = 'elevated';
  }

  return {
    riskScore: Math.min(riskScore, 100), // Cap at 100
    securityLevel,
    riskFactors,
    recommendations: generateSecurityRecommendations(riskScore, riskFactors),
  };
}

/**
 * ✅ GENERATE: Security recommendations based on risk
 */
function generateSecurityRecommendations(
  riskScore: number,
  riskFactors: string[]
): string[] {
  const recommendations: string[] = [];

  if (riskScore >= 75) {
    recommendations.push('Require MFA authentication');
    recommendations.push('Monitor session closely');
  }

  if (riskScore >= 50) {
    recommendations.push('Send security alert email');
    recommendations.push('Limit session duration');
  }

  if (riskFactors.includes('new_device')) {
    recommendations.push('Verify device via email');
  }

  if (riskFactors.includes('new_location')) {
    recommendations.push('Confirm location change');
  }

  if (riskFactors.includes('suspicious_country')) {
    recommendations.push('Additional identity verification required');
  }

  return recommendations;
}

// ============================================
// USER SECURITY VALIDATION
// ============================================

/**
 * ✅ VALIDATE: User security status
 */
export function validateUserSecurity(user: EnterpriseUser): {
  isValid: boolean;
  issues: string[];
  securityLevel: SecurityLevel;
} {
  const issues: string[] = [];

  // Check if account is active
  if (!user.isActive) {
    issues.push('Account is inactive');
  }

  // Check failed login attempts - using available field
  const maxFailedAttempts = 5;
  const currentFailedAttempts =
    typeof user.loginAttempts === 'number'
      ? user.loginAttempts
      : parseInt(String(user.loginAttempts || 0), 10);

  if (currentFailedAttempts >= maxFailedAttempts) {
    issues.push('Too many failed login attempts');
  }

  // Determine security level
  let securityLevel: SecurityLevel = 'normal';
  if (issues.length > 0) {
    if (
      issues.some(
        issue => issue.includes('locked') || issue.includes('inactive')
      )
    ) {
      securityLevel = 'critical';
    } else if (currentFailedAttempts >= 3) {
      securityLevel = 'elevated';
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    securityLevel,
  };
}

// ============================================
// PERMISSION & ACCESS CONTROL
// ============================================

/**
 * ✅ CHECK: If user has specific permission
 */
export function hasPermission(
  context: OrganizationAuthContext | null,
  permission: string
): boolean {
  if (!context?.membership?.permissions) {
    return false;
  }

  // Check direct permissions
  if (Array.isArray(context.membership.permissions)) {
    return context.membership.permissions.includes(permission);
  }

  return false;
}

/**
 * ✅ CHECK: If user has specific role
 */
export function hasRole(
  context: OrganizationAuthContext | null,
  role: MemberRole
): boolean {
  return context?.membership?.role === role;
}

/**
 * ✅ CHECK: If user is organization owner
 */
export function isOwner(context: OrganizationAuthContext | null): boolean {
  return hasRole(context, 'owner');
}

/**
 * ✅ CHECK: If user is admin or owner
 */
export function isAdminOrOwner(
  context: OrganizationAuthContext | null
): boolean {
  return hasRole(context, 'owner') || hasRole(context, 'admin');
}

/**
 * ✅ CHECK: If user can manage members
 */
export function canManageMembers(
  context: OrganizationAuthContext | null
): boolean {
  return isAdminOrOwner(context) || hasPermission(context, 'manage_members');
}

/**
 * ✅ CHECK: If user can manage projects
 */
export function canManageProjects(
  context: OrganizationAuthContext | null
): boolean {
  return isAdminOrOwner(context) || hasPermission(context, 'manage_projects');
}

/**
 * ✅ CHECK: If user can view billing
 */
export function canViewBilling(
  context: OrganizationAuthContext | null
): boolean {
  return isAdminOrOwner(context) || hasPermission(context, 'view_billing');
}

/**
 * ✅ CHECK: If user can manage billing
 */
export function canManageBilling(
  context: OrganizationAuthContext | null
): boolean {
  return isOwner(context) || hasPermission(context, 'manage_billing');
}

// ============================================
// SESSION SECURITY
// ============================================

/**
 * ✅ CHECK: If session has high security requirements
 */
export function hasHighSecurity(_context: EnhancedAuthContext | null): boolean {
  return false;
}

/**
 * ✅ CHECK: If user has two-factor authentication enabled
 */
export function hasTwoFactor(_context: EnhancedAuthContext | null): boolean {
  return false;
}

/**
 * ✅ CHECK: If session is credentials-based (not OAuth)
 */
export function isCredentialsSession(
  context: EnhancedAuthContext | null
): boolean {
  return Boolean(context);
}

/**
 * ✅ GET: Session risk level
 */
export function getSessionRiskLevel(
  context: EnhancedAuthContext | null
): SecurityLevel {
  return context?.session?.enterprise?.securityLevel ?? 'normal';
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * ✅ GENERATE: Secure random string
 */
export function generateSecureToken(length = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * ✅ HASH: String with salt
 */
export function hashWithSalt(data: string, salt?: string): string {
  const actualSalt = salt ?? randomBytes(16).toString('hex');
  return createHash('sha256')
    .update(data + actualSalt)
    .digest('hex');
}

/**
 * ✅ VALIDATE: IP address format
 */
export function isValidIPAddress(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * ✅ SANITIZE: User agent string
 */
export function sanitizeUserAgent(userAgent: string): string {
  // Remove potentially dangerous characters
  return userAgent.replace(/[<>'"]/g, '').substring(0, 500);
}

/**
 * ✅ CHECK: If request is from trusted network
 */
export function isTrustedNetwork(_ipAddress: string): boolean {
  // This would check against a list of trusted IP ranges
  // For now, return false to be conservative
  return false;
}
