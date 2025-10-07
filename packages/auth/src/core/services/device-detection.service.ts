// packages/auth/src/core/services/device-detection.service.ts - DEVICE DETECTION SERVICE

import type { DeviceInfo } from '../../types';

/**
 * ✅ ENTERPRISE: Device Detection Service
 * Single Responsibility: Device information detection and management
 */
export class DeviceDetectionService {
  /**
   * ✅ DETECT: Device information from user agent
   */
  async detectDevice(userAgent: string): Promise<DeviceInfo> {
    try {
      return this.parseDeviceInfo(userAgent);
    } catch (error) {
      console.error('❌ DeviceDetectionService detectDevice error:', error);

      // Return default device info on error
      return {
        name: 'Unknown Device',
        type: 'unknown',
        fingerprint: null,
        platform: undefined,
        browser: undefined,
        os: undefined,
      };
    }
  }

  /**
   * ✅ EXTRACT: Device info from request headers
   */
  async extractFromHeaders(
    headers: Record<string, string | undefined>
  ): Promise<DeviceInfo> {
    try {
      const userAgent = headers['user-agent'] || headers['User-Agent'] || '';
      return this.parseDeviceInfo(userAgent);
    } catch (error) {
      console.error(
        '❌ DeviceDetectionService extractFromHeaders error:',
        error
      );

      return {
        name: 'Unknown Device',
        type: 'unknown',
        fingerprint: null,
        platform: undefined,
        browser: undefined,
        os: undefined,
      };
    }
  }

  /**
   * ✅ GET: Client IP from headers
   */
  getClientIP(headers: Record<string, string | undefined>): string | null {
    // Check common IP headers in order of preference
    const ipHeaders = [
      'x-forwarded-for',
      'x-real-ip',
      'x-client-ip',
      'cf-connecting-ip',
      'fastly-client-ip',
      'x-cluster-client-ip',
      'x-forwarded',
      'forwarded-for',
      'forwarded',
    ];

    for (const header of ipHeaders) {
      const value = headers[header] || headers[header.toLowerCase()];
      if (value) {
        // Handle comma-separated IPs (take first one)
        const ip = value.split(',')[0]?.trim();
        if (ip && this.isValidIP(ip)) {
          return ip;
        }
      }
    }

    return null;
  }

  /**
   * ✅ GENERATE: Device fingerprint
   */
  generateFingerprint(
    userAgent: string,
    additionalData: Record<string, unknown> = {}
  ): string {
    const data = JSON.stringify({ userAgent, ...additionalData });

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    return Math.abs(hash).toString(16).substring(0, 16);
  }

  /**
   * ✅ CHECK: If device is mobile
   */
  isMobileDevice(userAgent: string): boolean {
    const deviceInfo = this.parseDeviceInfo(userAgent);
    return deviceInfo.type === 'mobile';
  }

  /**
   * ✅ CHECK: If device is trusted (placeholder)
   */
  async isDeviceTrusted(
    _deviceFingerprint: string,
    _userId: string
  ): Promise<boolean> {
    // TODO: Implement device trust verification
    // This would check against a database of trusted devices
    return false; // Default to not trusted
  }

  // ============================================
  // PRIVATE METHODS
  // ============================================

  /**
   * ✅ PRIVATE: Parse device info from user agent
   */
  private parseDeviceInfo(userAgent: string): DeviceInfo {
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

    // Simple user agent parsing
    const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
    const isTablet = /iPad|Tablet/i.test(userAgent);

    let deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown' = 'unknown';
    if (isTablet) deviceType = 'tablet';
    else if (isMobile) deviceType = 'mobile';
    else deviceType = 'desktop';

    // Extract browser info
    let browser: string | undefined = undefined;
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    // Extract OS info
    let os: string | undefined = undefined;
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';

    // Extract platform
    let platform: string | undefined = undefined;
    if (userAgent.includes('Win')) platform = 'Windows';
    else if (userAgent.includes('Mac')) platform = 'macOS';
    else if (userAgent.includes('Linux')) platform = 'Linux';
    else if (userAgent.includes('Android')) platform = 'Android';
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad'))
      platform = 'iOS';

    return {
      name: browser && os ? `${browser} on ${os}` : 'Unknown Device',
      type: deviceType,
      fingerprint: this.generateFingerprint(userAgent),
      platform: platform ?? undefined,
      browser: browser ?? undefined,
      os: os ?? undefined,
    };
  }

  /**
   * ✅ PRIVATE: Validate IP address
   */
  private isValidIP(ip: string): boolean {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }
}
