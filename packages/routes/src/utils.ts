import { guestOnlyRoutes, publicRoutes } from './auth';

// Route utility functions
export const isPublicRoute = (pathname: string): boolean => {
  return publicRoutes.some(
    route => pathname === route || pathname.startsWith(`${route}/`)
  );
};

export const isGuestOnlyRoute = (pathname: string): boolean => {
  return guestOnlyRoutes.includes(pathname as any);
};

export const isAuthRoute = (pathname: string): boolean => {
  return pathname.startsWith('/auth/');
};

export const isDashboardRoute = (pathname: string): boolean => {
  return pathname.startsWith('/dashboard');
};

export const isApiRoute = (pathname: string): boolean => {
  return pathname.startsWith('/api/');
};

// URL building helpers
export const buildUrl = (
  base: string,
  params?: Record<string, string | number>
): string => {
  if (!params) return base;

  const url = new URL(base, 'http://localhost');
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });

  return `${url.pathname}${url.search}`;
};

export const getCallbackUrl = (currentPath: string): string => {
  if (isPublicRoute(currentPath)) {
    return '/dashboard';
  }
  return currentPath;
};
