import { auth } from "@workspace/auth";
import { NextResponse, NextRequest } from "next/server"; // ✅ CORREÇÃO: imports consolidados

// ✅ Correção: Tipo específico em vez de any
interface AuthenticatedRequest extends NextRequest {
  auth?: {
    user?: {
      id?: string;
      email?: string;
      name?: string;
    };
  };
}

export default auth((req: AuthenticatedRequest) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  
  const isAuthPage = nextUrl.pathname.startsWith('/auth');
  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth');
  const _isPublicRoute = nextUrl.pathname === '/' && !isLoggedIn; // ✅ Correção: prefixo _ para unused var
  
  // Permitir rotas de API auth
  if (isApiAuthRoute) {
    return NextResponse.next();
  }
  
  // Redirecionar usuários logados para longe das páginas de auth
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/', nextUrl));
  }
  
  // Redirecionar usuários não logados para o login
  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL('/auth/sign-in', nextUrl));
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
  runtime: 'nodejs'
};
