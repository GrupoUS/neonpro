import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Verificar se há token de autenticação nos cookies (Supabase format)
  const authToken = request.cookies.get(
    "sb-gfkskrkbnawkuppazkpt-auth-token"
  )?.value;

  // Check for authentication
  const isAuthenticated = !!authToken;

  // Rotas protegidas que requerem autenticação
  const protectedRoutes = ["/dashboard"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Rotas de autenticação (incluindo callbacks OAuth)
  const authRoutes = ["/", "/login", "/signup", "/forgot-password", "/auth"];
  const isAuthRoute = authRoutes.some(
    (route) =>
      request.nextUrl.pathname === route ||
      request.nextUrl.pathname.startsWith(route)
  );

  // Se usuário não está logado e tenta acessar rota protegida
  if (isProtectedRoute && !isAuthenticated) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Se usuário está logado e tenta acessar rotas de auth (exceto callbacks)
  if (
    isAuthRoute &&
    isAuthenticated &&
    !request.nextUrl.pathname.startsWith("/auth/")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Adicionar headers de segurança
  const securityHeaders = {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  };

  // Aplicar headers de segurança
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
