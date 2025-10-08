// packages/auth/src/services/risk-assessment.service.ts - RISK ASSESSMENT BUSINESS LOGIC

import type { SecurityLevel } from '../../types';
import type {
  DeviceInfo,
  GeolocationContext,
  RiskAssessment,
} from '../../types/session.types';

/**
 * ✅ ENTERPRISE: Risk Assessment Service
 * Single Responsibility: Security risk calculation and assessment
 */
export class RiskAssessmentService {
  private readonly TRUSTED_COUNTRIES = [
    'BR',
    'US',
    'CA',
    'GB',
    'AU',
    'DE',
    'FR',
    'ES',
    'NL',
  ];
  private readonly SUSPICIOUS_COUNTRIES = ['CN', 'RU', 'KP', 'IR'];
  private readonly SUSPICIOUS_HOURS = { start: 2, end: 6 }; // 2 AM - 6 AM

  /**
   * ✅ CALCULATE: Comprehensive risk score
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
    sessionHistory?: unknown[];
  }): Promise<RiskAssessment> {
    let riskScore = 0;
    const riskFactors: string[] = [];
    const recommendations: string[] = [];

    try {
      // ✅ DEVICE-BASED RISK
      if (context.isNewDevice) {
        riskScore += 25;
        riskFactors.push('new_device');
        recommendations.push('Consider enabling device verification');
      }

      if (!context.deviceInfo?.fingerprint) {
        riskScore += 10;
        riskFactors.push('no_device_fingerprint');
      }

      // ✅ LOCATION-BASED RISK
      if (context.geolocation?.country) {
        const country = context.geolocation.country;

        if (this.SUSPICIOUS_COUNTRIES.includes(country)) {
          riskScore += 40;
          riskFactors.push('suspicious_country');
          recommendations.push(
            'Additional verification required for this location'
          );
        } else if (!this.TRUSTED_COUNTRIES.includes(country)) {
          riskScore += 15;
          riskFactors.push('untrusted_country');
        }
      }

      if (context.isNewLocation) {
        riskScore += 20;
        riskFactors.push('new_location');
        recommendations.push('Location change detected');
      }

      // ✅ TIME-BASED RISK
      if (context.timeOfDay) {
        const hour = context.timeOfDay.getHours();
        if (
          hour >= this.SUSPICIOUS_HOURS.start &&
          hour <= this.SUSPICIOUS_HOURS.end
        ) {
          riskScore += 10;
          riskFactors.push('suspicious_time');
        }
      }

      // ✅ AUTHENTICATION FAILURE RISK
      if (context.consecutiveFailures && context.consecutiveFailures > 0) {
        riskScore += Math.min(context.consecutiveFailures * 15, 60);
        riskFactors.push('authentication_failures');
        recommendations.push('Monitor for brute force attacks');
      }

      // ✅ IP-BASED RISK
      if (!context.ipAddress || context.ipAddress === 'unknown') {
        riskScore += 15;
        riskFactors.push('no_ip_address');
      }

      // ✅ SESSION PATTERN ANALYSIS
      if (context.sessionHistory && context.sessionHistory.length > 10) {
        riskScore += 20;
        riskFactors.push('excessive_sessions');
        recommendations.push('Unusual session activity detected');
      }

      // ✅ CLAMP RISK SCORE
      riskScore = Math.min(100, Math.max(0, riskScore));

      // ✅ DETERMINE SECURITY LEVEL
      const securityLevel = this.determineSecurityLevel(riskScore);

      // ✅ ADD LEVEL-SPECIFIC RECOMMENDATIONS
      if (securityLevel === 'critical') {
        recommendations.push('Immediate security review required');
      } else if (securityLevel === 'high_risk') {
        recommendations.push('Enhanced security measures recommended');
      } else if (securityLevel === 'elevated') {
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
      console.error(
        '❌ RiskAssessmentService calculateRiskScore error:',
        error
      );
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
   * ✅ DETERMINE: Security level based on risk score
   */
  private determineSecurityLevel(riskScore: number): SecurityLevel {
    if (riskScore >= 80) {
      return 'critical';
    }
    if (riskScore >= 60) {
      return 'high_risk';
    }
    if (riskScore >= 30) {
      return 'elevated';
    }
    return 'normal';
  }

  /**
   * ✅ ASSESS: Device risk
   */
  async assessDeviceRisk(deviceInfo: DeviceInfo): Promise<{
    riskScore: number;
    factors: string[];
  }> {
    let riskScore = 0;
    const factors: string[] = [];

    try {
      if (!deviceInfo.fingerprint) {
        riskScore += 10;
        factors.push('no_fingerprint');
      }

      if (deviceInfo.type === 'unknown') {
        riskScore += 15;
        factors.push('unknown_device_type');
      }

      if (!deviceInfo.name || deviceInfo.name === 'Unknown Device') {
        riskScore += 5;
        factors.push('unknown_device_name');
      }

      return {
        riskScore: Math.min(30, riskScore), // Max 30 points for device risk
        factors,
      };
    } catch (error) {
      console.error('❌ RiskAssessmentService assessDeviceRisk error:', error);
      return { riskScore: 10, factors: ['assessment_error'] };
    }
  }

  /**
   * ✅ ASSESS: Location risk
   */
  async assessLocationRisk(geolocation: GeolocationContext): Promise<{
    riskScore: number;
    factors: string[];
  }> {
    let riskScore = 0;
    const factors: string[] = [];

    try {
      if (!geolocation.country) {
        riskScore += 5;
        factors.push('no_country_data');
        return { riskScore, factors };
      }

      if (this.SUSPICIOUS_COUNTRIES.includes(geolocation.country)) {
        riskScore += 40;
        factors.push('suspicious_country');
      } else if (!this.TRUSTED_COUNTRIES.includes(geolocation.country)) {
        riskScore += 15;
        factors.push('untrusted_country');
      }

      return {
        riskScore: Math.min(40, riskScore), // Max 40 points for location risk
        factors,
      };
    } catch (error) {
      console.error(
        '❌ RiskAssessmentService assessLocationRisk error:',
        error
      );
      return { riskScore: 5, factors: ['assessment_error'] };
    }
  }
}
