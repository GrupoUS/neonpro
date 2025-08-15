import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // Protected routes that require authentication
  const protectedPaths = ['/dashboard', '/patients', '/appointments', '/admin'];
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // For protected paths, check if user has auth cookies
  if (isProtectedPath) {
    const authCookies = [
      'sb-access-token',
      'sb-refresh-token',
      'supabase-auth-token',
      'supabase.auth.token',
    ];

    const hasAuthCookie = authCookies.some((cookieName) =>
      request.cookies.has(cookieName)
    );

    if (!hasAuthCookie) {
      // Redirect to login page (using the correct path from the project)
      const redirectUrl = new URL('/auth/entrar', request.url);
      redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes (handled by API middleware)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
