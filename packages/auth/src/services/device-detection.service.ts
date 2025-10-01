// packages/auth/src/services/device-detection.service.ts - DEVICE DETECTION SERVICE

import { DeviceInfoGateway } from '../gateways/device-info.gateway';
import type { DeviceInfo } from '../types';

/**
 * ✅ ENTERPRISE: Device Detection Service
 * Single Responsibility: Device information detection and management
 */
export class DeviceDetectionService {
  private deviceInfoGateway: DeviceInfoGateway;

  constructor() {
    this.deviceInfoGateway = new DeviceInfoGateway();
  }

  /**
   * ✅ DETECT: Device information from user agent
   */
  async detectDevice(userAgent: string): Promise<DeviceInfo> {
    try {
      // ✅ FIX: Use correct method name from DeviceInfoGateway
      return DeviceInfoGateway.parseFromHeaders({
        'user-agent': userAgent,
      });
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
      return DeviceInfoGateway.parseFromHeaders(headers);
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
    return DeviceInfoGateway.getClientIP(headers);
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
    const deviceInfo = DeviceInfoGateway.parseFromHeaders({
      'user-agent': userAgent,
    });

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
}
