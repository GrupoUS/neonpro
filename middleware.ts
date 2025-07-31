import { NextRequest, NextResponse } from 'next/server';
import { SessionSecurityMiddleware } from '@/lib/security/session-security-middleware';

/**
 * Global Middleware for NeonPro
 * Integrates session security, CSRF protection, and threat detection
 */

const sessionSecurityMiddleware = new SessionSecurityMiddleware();

// Routes that require session security
const PROTECTED_ROUTES = [
  '/api/patients',
  '/api/appointments',
  '/api/medical-records',
  '/api/prescriptions',
  '/api/billing',
  '/api/reports',
  '/api/admin',
  '/api/patient-portal',
  '/dashboard',
  '/patients',
  '/appointments',
  '/medical-records',
  '/prescriptions',
  '/billing',
  '/reports',
  '/admin',
  '/portal/dashboard',
  '/portal/appointments',
  '/portal/medical-history',
  '/portal/uploads',
  '/portal/progress',
  '/portal/evaluations',
  '/portal/messages',
  '/portal/settings'
];

// Routes that are exempt from session security
const EXEMPT_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/health',
  '/api/public',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/_next',
  '/favicon.ico',
  '/static'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for exempt routes
  if (EXEMPT_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Apply session security for protected routes
  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    try {
      const securityResult = await sessionSecurityMiddleware.handleRequest(request);
      
      if (!securityResult.allowed) {
        // Handle different security actions
        switch (securityResult.action) {
          case 'block':
            return NextResponse.json(
              { 
                error: 'Access denied',
                reason: securityResult.reason,
                code: 'SECURITY_BLOCK'
              },
              { status: 403 }
            );
            
          case 'challenge':
            return NextResponse.json(
              { 
                error: 'Security challenge required',
                reason: securityResult.reason,
                code: 'SECURITY_CHALLENGE',
                challengeType: 'reauthentication'
              },
              { status: 401 }
            );
            
          case 'terminate':
            const response = NextResponse.json(
              { 
                error: 'Session terminated',
                reason: securityResult.reason,
                code: 'SESSION_TERMINATED'
              },
              { status: 401 }
            );
            
            // Clear session cookies
            response.cookies.delete('session');
            response.cookies.delete('auth-token');
            return response;
            
          default:
            return NextResponse.json(
              { 
                error: 'Security validation failed',
                reason: securityResult.reason,
                code: 'SECURITY_FAILED'
              },
              { status: 403 }
            );
        }
      }
      
      // Add security headers to the response
      const response = NextResponse.next();
      
      // Security headers
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('X-XSS-Protection', '1; mode=block');
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
      
      // Add CSRF token to response headers if available
      if (securityResult.csrfToken) {
        response.headers.set('X-CSRF-Token', securityResult.csrfToken);
      }
      
      // Add session security info to headers
      if (securityResult.sessionInfo) {
        response.headers.set('X-Session-Security', JSON.stringify({
          riskScore: securityResult.sessionInfo.riskScore,
          lastActivity: securityResult.sessionInfo.lastActivity,
          timeoutWarning: securityResult.sessionInfo.timeoutWarning
        }));
      }
      
      return response;
      
    } catch (error) {
      console.error('Middleware security error:', error);
      
      // In case of middleware error, allow request but log the issue
      const response = NextResponse.next();
      response.headers.set('X-Security-Warning', 'Middleware error occurred');
      return response;
    }
  }
  
  // For non-protected routes, just add basic security headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};