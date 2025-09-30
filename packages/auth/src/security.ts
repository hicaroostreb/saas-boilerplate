// packages/auth/src/security.ts - ACHROMATIC SECURITY UTILITIES CORRIGIDO

import { createHash, randomBytes } from 'crypto';
import type {
  DeviceInfo,
  EnterpriseUser,
  GeolocationContext,
  RiskAssessment,
  SecurityLevel,
} from './types';

// ============================================
// SECURITY CONFIGURATION
// ============================================

const SECURITY_CONFIG = {
  // ✅ ENTERPRISE: Risk assessment thresholds
  riskThresholds: {
    low: 0,
    medium: 30,
    high: 60,
    critical: 80,
  },

  // ✅ ENTERPRISE: Device fingerprinting
  deviceFingerprint: {
    algorithm: 'sha256' as const,
    saltLength: 16,
    hashLength: 32,
  },

  // ✅ ENTERPRISE: Geolocation security (corrigido)
  trustedCountries: [
    'BR',
    'US',
    'CA',
    'GB',
    'AU',
    'DE',
    'FR',
    'ES',
    'NL',
  ] as const,
  suspiciousCountries: ['CN', 'RU', 'KP', 'IR'] as const, // High-risk countries

  // ✅ ENTERPRISE: Time-based security
  suspiciousHours: {
    start: 2, // 2 AM
    end: 6, // 6 AM
  },

  // ✅ ENTERPRISE: Session security
  maxConcurrentSessions: {
    normal: 5,
    elevated: 3,
    high_risk: 2,
    critical: 1,
  },
} as const;

// ============================================
// SECURITY SERVICE CLASS
// ============================================

export class SecurityServiceClass {
  /**
   * ✅ ACHROMATIC: Parse and classify device information
   */
  async parseDeviceInfo(userAgent?: string): Promise<DeviceInfo> {
    if (!userAgent) {
      return {
        name: null,
        type: 'unknown',
        fingerprint: null,
        userAgent: undefined,
      };
    }

    try {
      const deviceInfo: DeviceInfo = {
        name: 'Unknown Device',
        type: 'unknown',
        fingerprint: null,
        userAgent,
        platform: undefined,
        browser: undefined,
        os: undefined,
      };

      // ✅ ENTERPRISE: Operating System Detection
      if (/Windows NT 10.0/.test(userAgent)) {
        deviceInfo.os = 'Windows 10/11';
        deviceInfo.platform = 'Windows';
      } else if (/Windows NT/.test(userAgent)) {
        deviceInfo.os = 'Windows';
        deviceInfo.platform = 'Windows';
      } else if (/Mac OS X/.test(userAgent)) {
        const match = userAgent.match(/Mac OS X ([\d_]+)/);
        deviceInfo.os = match
          ? `macOS ${match[1]!.replace(/_/g, '.')}`
          : 'macOS';
        deviceInfo.platform = 'macOS';
      } else if (/Linux/.test(userAgent)) {
        deviceInfo.os = 'Linux';
        deviceInfo.platform = 'Linux';
      } else if (/Android/.test(userAgent)) {
        const match = userAgent.match(/Android ([\d.]+)/);
        deviceInfo.os = match ? `Android ${match[1]}` : 'Android';
        deviceInfo.platform = 'Android';
      } else if (/iPhone OS/.test(userAgent)) {
        const match = userAgent.match(/iPhone OS ([\d_]+)/);
        deviceInfo.os = match ? `iOS ${match[1]!.replace(/_/g, '.')}` : 'iOS';
        deviceInfo.platform = 'iOS';
      }

      // ✅ ENTERPRISE: Browser Detection
      if (/Chrome\/[\d.]+/.test(userAgent) && !/Edge|Edg/.test(userAgent)) {
        const match = userAgent.match(/Chrome\/([\d.]+)/);
        deviceInfo.browser = match ? `Chrome ${match[1]}` : 'Chrome';
      } else if (/Firefox\/[\d.]+/.test(userAgent)) {
        const match = userAgent.match(/Firefox\/([\d.]+)/);
        deviceInfo.browser = match ? `Firefox ${match[1]}` : 'Firefox';
      } else if (
        /Safari\/[\d.]+/.test(userAgent) &&
        !/Chrome/.test(userAgent)
      ) {
        const match = userAgent.match(/Version\/([\d.]+).*Safari/);
        deviceInfo.browser = match ? `Safari ${match[1]}` : 'Safari';
      } else if (/Edge|Edg\/[\d.]+/.test(userAgent)) {
        const match = userAgent.match(/(?:Edge|Edg)\/([\d.]+)/);
        deviceInfo.browser = match ? `Edge ${match[1]}` : 'Edge';
      }

      // ✅ ENTERPRISE: Device Type Classification
      if (/Mobile|Android|iPhone/.test(userAgent)) {
        deviceInfo.type = 'mobile';

        if (/iPhone/.test(userAgent)) {
          const model = this.extractiPhoneModel(userAgent);
          deviceInfo.name = model ?? 'iPhone';
        } else if (/Android/.test(userAgent)) {
          deviceInfo.name = 'Android Phone';
        } else {
          deviceInfo.name = 'Mobile Device';
        }
      } else if (/iPad/.test(userAgent)) {
        deviceInfo.type = 'tablet';
        deviceInfo.name = 'iPad';
      } else if (/Tablet/.test(userAgent)) {
        deviceInfo.type = 'tablet';
        deviceInfo.name = 'Tablet';
      } else {
        deviceInfo.type = 'desktop';
        deviceInfo.name = `${deviceInfo.browser ?? 'Browser'} on ${deviceInfo.os ?? 'Desktop'}`;
      }

      // ✅ ENTERPRISE: Generate secure device fingerprint
      deviceInfo.fingerprint = await this.generateDeviceFingerprint(userAgent);

      return deviceInfo;
    } catch (error) {
      console.error('❌ ACHROMATIC: Error parsing device info:', error);
      return {
        name: null,
        type: 'unknown',
        fingerprint: null,
        userAgent,
      };
    }
  }

  /**
   * ✅ ENTERPRISE: Calculate comprehensive risk score
   */
  async calculateRiskScore(context: {
    userId: string;
    ipAddress?: string;
    deviceInfo?: DeviceInfo;
    geolocation?: GeolocationContext;
    isNewDevice?: boolean;
    isNewLocation?: boolean;
    timeOfDay?: Date;
    consecutiveFailures?: number;
    sessionHistory?: any[];
  }): Promise<RiskAssessment> {
    let riskScore = 0;
    const riskFactors: string[] = [];
    const recommendations: string[] = [];

    try {
      // ✅ ENTERPRISE: Device-based risk
      if (context.isNewDevice) {
        riskScore += 25;
        riskFactors.push('new_device');
        recommendations.push('Consider enabling device verification');
      }

      if (!context.deviceInfo?.fingerprint) {
        riskScore += 10;
        riskFactors.push('no_device_fingerprint');
      }

      // ✅ ENTERPRISE: Location-based risk (CORRIGIDO)
      if (context.geolocation?.country) {
        const country = context.geolocation.country;

        if (
          (SECURITY_CONFIG.suspiciousCountries as readonly string[]).includes(
            country
          )
        ) {
          riskScore += 40;
          riskFactors.push('suspicious_country');
          recommendations.push(
            'Additional verification required for this location'
          );
        } else if (
          !(SECURITY_CONFIG.trustedCountries as readonly string[]).includes(
            country
          )
        ) {
          riskScore += 15;
          riskFactors.push('untrusted_country');
        }
      }

      if (context.isNewLocation) {
        riskScore += 20;
        riskFactors.push('new_location');
        recommendations.push('Location change detected');
      }

      // ✅ ENTERPRISE: Time-based risk
      if (context.timeOfDay) {
        const hour = context.timeOfDay.getHours();
        if (
          hour >= SECURITY_CONFIG.suspiciousHours.start &&
          hour <= SECURITY_CONFIG.suspiciousHours.end
        ) {
          riskScore += 10;
          riskFactors.push('suspicious_time');
        }
      }

      // ✅ ENTERPRISE: Authentication failure risk
      if (context.consecutiveFailures && context.consecutiveFailures > 0) {
        riskScore += Math.min(context.consecutiveFailures * 15, 60);
        riskFactors.push('authentication_failures');
        recommendations.push('Monitor for brute force attacks');
      }

      // ✅ ENTERPRISE: IP-based risk
      if (!context.ipAddress || context.ipAddress === 'unknown') {
        riskScore += 15;
        riskFactors.push('no_ip_address');
      }

      // ✅ ENTERPRISE: Session pattern analysis
      if (context.sessionHistory && context.sessionHistory.length > 0) {
        const recentSessions = context.sessionHistory.filter(
          s =>
            Date.now() - new Date(s.createdAt).getTime() < 24 * 60 * 60 * 1000
        );

        if (recentSessions.length > 10) {
          riskScore += 20;
          riskFactors.push('excessive_sessions');
          recommendations.push('Unusual session activity detected');
        }
      }

      // ✅ ENTERPRISE: Clamp risk score
      riskScore = Math.min(100, Math.max(0, riskScore));

      // ✅ ENTERPRISE: Determine security level
      let securityLevel: SecurityLevel = 'normal';
      if (riskScore >= SECURITY_CONFIG.riskThresholds.critical) {
        securityLevel = 'critical';
        recommendations.push('Immediate security review required');
      } else if (riskScore >= SECURITY_CONFIG.riskThresholds.high) {
        securityLevel = 'high_risk';
        recommendations.push('Enhanced security measures recommended');
      } else if (riskScore >= SECURITY_CONFIG.riskThresholds.medium) {
        securityLevel = 'elevated';
        recommendations.push('Additional verification may be required');
      }

      return {
        score: riskScore,
        level: securityLevel,
        factors: riskFactors,
        recommendations,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('❌ ACHROMATIC: Error calculating risk score:', error);
      return {
        score: 25, // Default medium-low risk on error
        level: 'elevated',
        factors: ['calculation_error'],
        recommendations: ['Security assessment temporarily unavailable'],
        lastUpdated: new Date(),
      };
    }
  }

  /**
   * ✅ ENTERPRISE: Validate user security requirements
   */
  async validateUserSecurity(
    user: EnterpriseUser,
    context: {
      ipAddress?: string;
      deviceInfo?: DeviceInfo;
      riskScore?: number;
    }
  ): Promise<{
    isValid: boolean;
    requiresMFA: boolean;
    requiresPasswordChange: boolean;
    securityWarnings: string[];
    blockedReasons: string[];
  }> {
    const securityWarnings: string[] = [];
    const blockedReasons: string[] = [];
    let requiresMFA = false;
    let requiresPasswordChange = false;

    try {
      // ✅ ENTERPRISE: Account status checks
      if (!user.isActive) {
        blockedReasons.push('Account is inactive');
      }

      if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
        blockedReasons.push('Account is temporarily locked');
      }

      // ✅ ENTERPRISE: Password security checks
      if (user.passwordChangedAt) {
        const passwordAge = Date.now() - user.passwordChangedAt.getTime();
        const maxPasswordAge = 90 * 24 * 60 * 60 * 1000; // 90 days

        if (passwordAge > maxPasswordAge) {
          requiresPasswordChange = true;
          securityWarnings.push('Password has expired and must be changed');
        }
      }

      // ✅ ENTERPRISE: MFA requirements
      const riskScore = context.riskScore ?? 0;

      if (user.twoFactorEnabled) {
        requiresMFA = true;
      } else if (riskScore >= 50) {
        requiresMFA = true;
        securityWarnings.push(
          'Two-factor authentication required due to elevated risk'
        );
      } else if (
        user.securityLevel === 'critical' ||
        user.securityLevel === 'high_risk'
      ) {
        requiresMFA = true;
        securityWarnings.push(
          'Two-factor authentication required for high-security account'
        );
      }

      // ✅ ENTERPRISE: Device-based security
      if (context.deviceInfo?.type === 'unknown') {
        securityWarnings.push('Unrecognized device type');
      }

      // ✅ ENTERPRISE: Failed login attempts
      if (user.failedLoginAttempts >= 3) {
        securityWarnings.push(
          `${user.failedLoginAttempts} failed login attempts detected`
        );
      }

      if (user.failedLoginAttempts >= 5) {
        blockedReasons.push('Too many failed login attempts');
      }

      return {
        isValid: blockedReasons.length === 0,
        requiresMFA,
        requiresPasswordChange,
        securityWarnings,
        blockedReasons,
      };
    } catch (error) {
      console.error('❌ ACHROMATIC: Error validating user security:', error);
      return {
        isValid: false,
        requiresMFA: true, // Fail secure
        requiresPasswordChange: false,
        securityWarnings: ['Security validation error'],
        blockedReasons: ['Unable to verify security requirements'],
      };
    }
  }

  /**
   * ✅ ENTERPRISE: Generate secure device fingerprint
   */
  async generateDeviceFingerprint(
    userAgent: string,
    additionalData?: Record<string, any>
  ): Promise<string> {
    try {
      // ✅ ENTERPRISE: Generate salt for uniqueness
      const salt = randomBytes(SECURITY_CONFIG.deviceFingerprint.saltLength);

      // ✅ ENTERPRISE: Combine fingerprint data
      const fingerprintData = {
        userAgent,
        timestamp: Date.now(),
        salt: salt.toString('hex'),
        ...additionalData,
      };

      // ✅ ENTERPRISE: Create secure hash
      const hash = createHash(SECURITY_CONFIG.deviceFingerprint.algorithm);
      hash.update(JSON.stringify(fingerprintData));

      return hash
        .digest('hex')
        .substring(0, SECURITY_CONFIG.deviceFingerprint.hashLength);
    } catch (error) {
      console.error(
        '❌ ACHROMATIC: Error generating device fingerprint:',
        error
      );
      // ✅ FALLBACK: Generate simple hash
      const simpleHash = createHash('sha256');
      simpleHash.update(userAgent + Date.now().toString());
      return simpleHash.digest('hex').substring(0, 16);
    }
  }

  /**
   * ✅ ENTERPRISE: Validate session security
   */
  async validateSessionSecurity(sessionData: {
    userId: string;
    sessionToken: string;
    createdAt: Date;
    lastAccessedAt?: Date | null;
    riskScore?: number;
    securityLevel?: SecurityLevel;
    deviceInfo?: DeviceInfo;
    ipAddress?: string;
  }): Promise<{
    isValid: boolean;
    shouldRevoke: boolean;
    securityWarnings: string[];
    recommendations: string[];
  }> {
    const securityWarnings: string[] = [];
    const recommendations: string[] = [];
    let shouldRevoke = false;

    try {
      // ✅ ENTERPRISE: Session age validation
      const sessionAge = Date.now() - sessionData.createdAt.getTime();
      const maxSessionAge = 30 * 24 * 60 * 60 * 1000; // 30 days

      if (sessionAge > maxSessionAge) {
        shouldRevoke = true;
        securityWarnings.push('Session has exceeded maximum age');
      }

      // ✅ ENTERPRISE: Idle time validation
      if (sessionData.lastAccessedAt) {
        const idleTime = Date.now() - sessionData.lastAccessedAt.getTime();
        const maxIdleTime = this.getMaxIdleTime(
          sessionData.securityLevel ?? 'normal'
        );

        if (idleTime > maxIdleTime) {
          shouldRevoke = true;
          securityWarnings.push('Session has been idle too long');
        }
      }

      // ✅ ENTERPRISE: Risk-based validation
      const riskScore = sessionData.riskScore ?? 0;
      if (riskScore >= 80) {
        shouldRevoke = true;
        securityWarnings.push('Session risk score is too high');
      } else if (riskScore >= 60) {
        securityWarnings.push('Session has elevated risk score');
        recommendations.push('Consider additional verification');
      }

      // ✅ ENTERPRISE: Device validation
      if (!sessionData.deviceInfo?.fingerprint) {
        securityWarnings.push('Session missing device fingerprint');
        recommendations.push('Enable device tracking for better security');
      }

      // ✅ ENTERPRISE: IP validation
      if (!sessionData.ipAddress) {
        securityWarnings.push('Session missing IP address');
      }

      return {
        isValid: !shouldRevoke,
        shouldRevoke,
        securityWarnings,
        recommendations,
      };
    } catch (error) {
      console.error('❌ ACHROMATIC: Error validating session security:', error);
      return {
        isValid: false,
        shouldRevoke: true, // Fail secure
        securityWarnings: ['Session security validation failed'],
        recommendations: ['Revoke session for security'],
      };
    }
  }

  // ============================================
  // PRIVATE UTILITY METHODS
  // ============================================

  /**
   * ✅ ENTERPRISE: Extract iPhone model from user agent
   */
  private extractiPhoneModel(userAgent: string): string | null {
    try {
      if (/iPhone/.test(userAgent)) {
        // This is simplified - in production, use a comprehensive device database
        if (/iPhone OS 17/.test(userAgent)) return 'iPhone (iOS 17)';
        if (/iPhone OS 16/.test(userAgent)) return 'iPhone (iOS 16)';
        if (/iPhone OS 15/.test(userAgent)) return 'iPhone (iOS 15)';
        return 'iPhone';
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * ✅ ENTERPRISE: Get maximum idle time based on security level
   */
  private getMaxIdleTime(securityLevel: SecurityLevel): number {
    const idleTimes = {
      normal: 24 * 60 * 60 * 1000, // 24 hours
      elevated: 8 * 60 * 60 * 1000, // 8 hours
      high_risk: 2 * 60 * 60 * 1000, // 2 hours
      critical: 30 * 60 * 1000, // 30 minutes
    };

    return idleTimes[securityLevel] || idleTimes.normal;
  }
}

// ============================================
// SINGLETON INSTANCE & CONVENIENCE FUNCTIONS
// ============================================

/**
 * ✅ ACHROMATIC: Parse device information
 */
export async function parseDeviceInfo(userAgent?: string): Promise<DeviceInfo> {
  return SecurityService.parseDeviceInfo(userAgent);
}

/**
 * ✅ ENTERPRISE: Calculate risk score
 */
export async function calculateRiskScore(context: {
  userId: string;
  ipAddress?: string;
  deviceInfo?: DeviceInfo;
  geolocation?: GeolocationContext;
  isNewDevice?: boolean;
  isNewLocation?: boolean;
  timeOfDay?: Date;
  consecutiveFailures?: number;
  sessionHistory?: any[];
}): Promise<RiskAssessment> {
  return SecurityService.calculateRiskScore(context);
}

/**
 * ✅ ENTERPRISE: Generate device fingerprint
 */
export async function generateDeviceFingerprint(
  userAgent: string,
  additionalData?: Record<string, any>
): Promise<string> {
  return SecurityService.generateDeviceFingerprint(userAgent, additionalData);
}

/**
 * ✅ ENTERPRISE: Validate user security
 */
export async function validateUserSecurity(
  user: EnterpriseUser,
  context: {
    ipAddress?: string;
    deviceInfo?: DeviceInfo;
    riskScore?: number;
  }
): Promise<{
  isValid: boolean;
  requiresMFA: boolean;
  requiresPasswordChange: boolean;
  securityWarnings: string[];
  blockedReasons: string[];
}> {
  return SecurityService.validateUserSecurity(user, context);
}

// ============================================
// EXPORTS
// ============================================

// Criar instância da classe
const securityServiceInstance = new SecurityServiceClass();

// Export named para compatibilidade com imports existentes
export const SecurityService = securityServiceInstance;

// Export alternativo com nome original
export { securityServiceInstance as securityService };

// Export default para compatibilidade
export default securityServiceInstance;
