import { NextResponse, type NextRequest } from 'next/server';

// ✅ ACHROMATIC APPROACH: Minimal middleware - no auth checks
export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // ✅ Handle static files and API routes only
  const isApiRoute = pathname.startsWith('/api');
  const isStaticFile =
    pathname.startsWith('/_next') || pathname === '/favicon.ico';

  // ✅ Let all requests through - auth checks happen at page/data level
  if (isApiRoute || isStaticFile) {
    return NextResponse.next();
  }

  // ✅ ACHROMATIC: No auth checks in middleware
  // "Only good for pre-checks" - we do auth checks near the data
  // ✅ ENTERPRISE: Logger replaced console.log
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
