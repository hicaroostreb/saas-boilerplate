// packages/auth/src/utils/device.utils.ts - DEVICE & LOCATION UTILITIES

/**
 * ✅ ENTERPRISE: Device & Location Utilities
 * Single Responsibility: Device and location display utilities
 */

/**
 * ✅ DEVICE: Get device icon based on type
 */
export function getDeviceIcon(deviceType: string): string {
  const icons = {
    mobile: '📱',
    tablet: '📱',
    desktop: '💻',
    unknown: '❓',
  } as const;

  return icons[deviceType as keyof typeof icons] ?? icons.unknown;
}

/**
 * ✅ LOCATION: Format location display
 */
export function formatLocation(
  country?: string | null,
  city?: string | null
): string {
  if (country && city) {
    return `${city}, ${country}`;
  } else if (country) {
    return country;
  } else if (city) {
    return city;
  } else {
    return 'Unknown Location';
  }
}

/**
 * ✅ FLAG: Get country flag emoji
 */
export function getCountryFlag(countryCode?: string | null): string {
  if (!countryCode || countryCode.length !== 2) return '🌍';

  const flags: Record<string, string> = {
    BR: '🇧🇷',
    US: '🇺🇸',
    CA: '🇨🇦',
    GB: '🇬🇧',
    DE: '🇩🇪',
    FR: '🇫🇷',
    ES: '🇪🇸',
    IT: '🇮🇹',
    NL: '🇳🇱',
    AU: '🇦🇺',
    IN: '🇮🇳',
    JP: '🇯🇵',
    KR: '🇰🇷',
    CN: '🇨🇳',
    RU: '🇷🇺',
  };

  return flags[countryCode.toUpperCase()] ?? '🌍';
}
