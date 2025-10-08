// packages/auth/src/gateways/device-info.gateway.ts - DEVICE INFO GATEWAY

import type { DeviceInfo } from '../types';

/**
 * ✅ ENTERPRISE: Device Information Gateway
 * Single Responsibility: Device information detection and parsing
 */
export class DeviceInfoGateway {
  /**
   * ✅ PARSE: Request headers to extract device info
   */
  static parseFromHeaders(
    headers: Record<string, string | undefined>
  ): DeviceInfo {
    const userAgent = headers['user-agent'];

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

    // Basic user agent parsing
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

    // Extract browser
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

    // Extract OS (FIXED - handle undefined match)
    let os: string | undefined = undefined;
    if (userAgent.includes('Windows')) {
      os = 'Windows';
    } else if (userAgent.includes('Mac OS X')) {
      const match = userAgent.match(/Mac OS X (\d+[._]\d+[._]\d+)?/);
      os = match?.[1] // ✅ FIX: Check if match[1] exists
        ? `macOS ${match[1].replace(/_/g, '.')}`
        : 'macOS';
    } else if (userAgent.includes('Linux')) {
      os = 'Linux';
    } else if (userAgent.includes('Android')) {
      os = 'Android';
    } else if (userAgent.includes('iPhone OS') ?? userAgent.includes('iOS')) {
      const match = userAgent.match(/(?:iPhone )?OS (\d+[._]\d+[._]?\d*)?/);
      os = match?.[1] // ✅ FIX: Check if match[1] exists
        ? `iOS ${match[1].replace(/_/g, '.')}`
        : 'iOS';
    }

    return {
      name: browser && os ? `${browser} on ${os}` : 'Unknown Device',
      type: deviceType,
      fingerprint: this.generateFingerprint(userAgent, headers),
      platform: os,
      browser,
      os,
    };
  }

  /**
   * ✅ GENERATE: Device fingerprint
   */
  private static generateFingerprint(
    userAgent: string,
    headers: Record<string, string | undefined>
  ): string {
    const acceptLanguage = headers['accept-language'] ?? '';
    const acceptEncoding = headers['accept-encoding'] ?? '';

    const fingerprint = `${userAgent}-${acceptLanguage}-${acceptEncoding}`;

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    return Math.abs(hash).toString(16).substring(0, 16);
  }

  /**
   * ✅ GET: Client IP from headers
   */
  static getClientIP(
    headers: Record<string, string | undefined>
  ): string | null {
    const forwarded = headers['x-forwarded-for'];
    const realIp = headers['x-real-ip'];
    const remoteAddr = headers['remote-addr'];

    if (forwarded) {
      return forwarded.split(',')[0]?.trim() ?? null;
    }

    return realIp ?? remoteAddr ?? null;
  }
}
