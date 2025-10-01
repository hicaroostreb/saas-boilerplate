// packages/auth/src/utils/url.utils.ts - URL & NAVIGATION UTILITIES

/**
 * ✅ ENTERPRISE: URL & Navigation Utilities
 * Single Responsibility: URL building and navigation utilities
 */

/**
 * ✅ AUTH: Build auth redirect URL
 */
export function buildAuthRedirectUrl(
  baseUrl: string,
  organizationSlug?: string,
  returnTo?: string
): string {
  const url = new URL('/auth/sign-in', baseUrl);

  if (organizationSlug) {
    url.searchParams.set('org', organizationSlug);
  }

  if (returnTo) {
    url.searchParams.set('returnTo', returnTo);
  }

  return url.toString();
}

/**
 * ✅ ORG: Build organization URL
 */
export function buildOrganizationUrl(
  baseUrl: string,
  organizationSlug: string,
  path = ''
): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${baseUrl}/${organizationSlug}${cleanPath ? `/${cleanPath}` : ''}`;
}

/**
 * ✅ REDIRECT: Sanitize redirect URL for security
 */
export function sanitizeRedirectUrl(
  redirectTo?: string,
  baseUrl: string = process.env.NEXTAUTH_URL ?? 'http://localhost:3001'
): string | null {
  if (!redirectTo) {
    return null;
  }

  try {
    const redirectUrl = new URL(redirectTo, baseUrl);
    // Only allow same-origin redirects
    if (redirectUrl.origin === new URL(baseUrl).origin) {
      return redirectUrl.toString();
    }
  } catch {
    // Invalid URL
  }

  return null;
}

/**
 * ✅ SIGN-OUT: Determine sign-out redirect URL
 */
export function buildSignOutRedirectUrl(
  redirectTo?: string,
  baseUrl: string = process.env.NEXTAUTH_URL ?? 'http://localhost:3001'
): string {
  // Try to use custom redirect if safe
  const sanitizedUrl = sanitizeRedirectUrl(redirectTo, baseUrl);
  if (sanitizedUrl) {
    return sanitizedUrl;
  }

  // Default: Sign-in page
  return `${baseUrl}/auth/sign-in`;
}

/**
 * ✅ ORG: Build organization selection URL
 */
export function buildOrganizationSelectionUrl(
  baseUrl: string = process.env.NEXTAUTH_URL ?? 'http://localhost:3001'
): string {
  return `${baseUrl}/organizations`;
}

/**
 * ✅ VALIDATE: Check if URL is same origin
 */
export function isSameOrigin(
  url: string,
  baseUrl: string = process.env.NEXTAUTH_URL ?? 'http://localhost:3001'
): boolean {
  try {
    const targetUrl = new URL(url, baseUrl);
    const baseUrlParsed = new URL(baseUrl);
    return targetUrl.origin === baseUrlParsed.origin;
  } catch {
    return false;
  }
}
