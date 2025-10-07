import { NextResponse, type NextRequest } from 'next/server';

/**
 * ✅ ACHROMATIC APPROACH: Minimal middleware
 * Auth checks happen at page/component level, not here
 * Better performance and flexibility
 */
export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Handle static files and API routes
  const isApiRoute = pathname.startsWith('/api');
  const isStaticFile =
    pathname.startsWith('/_next') || pathname === '/favicon.ico';

  if (isApiRoute || isStaticFile) {
    return NextResponse.next();
  }

  // Let all requests through - auth checks at data level
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
