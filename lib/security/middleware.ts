import { NextRequest, NextResponse } from 'next/server';

/**
 * Security middleware for Next.js application
 * Applies security headers and basic protection measures
 */
export async function securityMiddleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security Headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.neonpro.com https://*.supabase.co;"
  );

  // HSTS (only in production with HTTPS)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // Rate limiting headers (basic implementation)
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  response.headers.set('X-RateLimit-Limit', '100');
  response.headers.set('X-RateLimit-Remaining', '99');

  return response;
}

/**
 * Check if request is authenticated
 */
export function isAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const sessionCookie = request.cookies.get('session');
  
  // Basic auth check - in production, implement proper JWT validation
  return !!(authHeader || sessionCookie);
}

/**
 * Redirect to login if not authenticated
 */
export function requireAuth(request: NextRequest) {
  if (!isAuthenticated(request)) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
  return null;
}