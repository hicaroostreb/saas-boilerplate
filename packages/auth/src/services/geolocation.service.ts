// packages/auth/src/services/geolocation.service.ts - GEOLOCATION BUSINESS LOGIC

import type { GeolocationContext } from '../types/session.types';

/**
 * ✅ ENTERPRISE: Geolocation Service
 * Single Responsibility: IP-based geolocation services
 */
export class GeolocationService {
  /**
   * ✅ GET: Geolocation from IP address
   */
  async getLocationFromIP(
    ipAddress?: string
  ): Promise<GeolocationContext | null> {
    if (!ipAddress || ipAddress === 'unknown' || ipAddress === '127.0.0.1') {
      return null;
    }

    try {
      // ✅ PLACEHOLDER: In production, integrate with MaxMind, IPinfo, etc.
      // For now, return development defaults
      if (process.env.NODE_ENV === 'development') {
        return this.getDevelopmentLocation();
      }

      // ✅ PRODUCTION: Implement real geolocation service
      return await this.getProductionLocation(ipAddress);
    } catch (error) {
      console.error('❌ GeolocationService getLocationFromIP error:', error);
      return null;
    }
  }

  /**
   * ✅ DEVELOPMENT: Mock geolocation data
   */
  private getDevelopmentLocation(): GeolocationContext {
    return {
      country: 'BR',
      city: 'São Paulo',
      timezone: 'America/Sao_Paulo',
      coordinates: {
        latitude: -23.5505,
        longitude: -46.6333,
      },
    };
  }

  /**
   * ✅ PRODUCTION: Real geolocation lookup
   */
  private async getProductionLocation(
    ipAddress: string
  ): Promise<GeolocationContext | null> {
    try {
      // ✅ TODO: Implement with real service
      // Example integration points:
      // - MaxMind GeoIP2
      // - IPinfo API
      // - CloudFlare Workers

      console.warn(
        '🔍 GeolocationService: Production lookup for IP:',
        ipAddress
      );

      // Fallback to development data for now
      return this.getDevelopmentLocation();
    } catch (error) {
      console.error(
        '❌ GeolocationService getProductionLocation error:',
        error
      );
      return null;
    }
  }

  /**
   * ✅ VALIDATE: IP address format
   */
  isValidIP(ipAddress: string): boolean {
    try {
      // IPv4 validation
      const ipv4Regex =
        /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

      // IPv6 validation (basic)
      const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

      return ipv4Regex.test(ipAddress) || ipv6Regex.test(ipAddress);
    } catch {
      return false;
    }
  }

  /**
   * ✅ FORMAT: Location display string
   */
  formatLocation(geolocation: GeolocationContext): string {
    if (geolocation.country && geolocation.city) {
      return `${geolocation.city}, ${geolocation.country}`;
    } else if (geolocation.country) {
      return geolocation.country;
    } else if (geolocation.city) {
      return geolocation.city;
    } else {
      return 'Unknown Location';
    }
  }
}
