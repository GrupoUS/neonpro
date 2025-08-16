import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@/lib/auth/session-manager';
import { SecurityEventType } from '@/types/session';

/**
 * Session Authentication Middleware
 * Validates and manages user sessions across the application
 */
export class SessionAuthMiddleware {
  private readonly sessionManager: SessionManager;

  constructor() {
    this.sessionManager = new SessionManager();
  }

  /**
   * Main middleware function for session validation
   */
  async handle(request: NextRequest): Promise<NextResponse> {
    const response = NextResponse.next();
    const pathname = request.nextUrl.pathname;

    // Skip middleware for public routes
    if (this.isPublicRoute(pathname)) {
      return response;
    }

    // Skip middleware for API routes that don't require auth
    if (this.isPublicApiRoute(pathname)) {
      return response;
    }

    try {
      // Create Supabase client
      const _supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value;
            },
            set(name: string, value: string, options: any) {
              response.cookies.set(name, value, options);
            },
            remove(name: string, _options: any) {
              response.cookies.delete(name);
            },
          },
        }
      );

      // Get session token from cookie
      const sessionToken = request.cookies.get('session-token')?.value;

      if (!sessionToken) {
        return this.redirectToLogin(request);
      }

      // Validate session
      const sessionValidation = await this.sessionManager.validateSession(
        sessionToken,
        {
          ipAddress: this.getClientIP(request),
          userAgent: request.headers.get('user-agent') || 'Unknown',
          requestPath: pathname,
        }
      );

      if (!sessionValidation.isValid) {
        // Log security event
        await this.logSecurityEvent(
          sessionValidation.userId || 'unknown',
          SecurityEventType.SESSION_VALIDATION_FAILED,
          {
            reason: sessionValidation.reason,
            ipAddress: this.getClientIP(request),
            userAgent: request.headers.get('user-agent') || 'Unknown',
            requestPath: pathname,
          }
        );

        // Clear invalid session cookie
        response.cookies.delete('session-token');
        return this.redirectToLogin(request);
      }

      // Check if session needs refresh
      if (sessionValidation.needsRefresh) {
        const refreshResult = await this.sessionManager.refreshSession(
          sessionToken,
          {
            ipAddress: this.getClientIP(request),
            userAgent: request.headers.get('user-agent') || 'Unknown',
          }
        );

        if (refreshResult.success && refreshResult.newToken) {
          // Set new session token
          response.cookies.set('session-token', refreshResult.newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
          });
        }
      }

      // Add user info to request headers for downstream use
      if (sessionValidation.userId) {
        response.headers.set('x-user-id', sessionValidation.userId);
        response.headers.set('x-session-id', sessionValidation.sessionId || '');
      }

      // Check for suspicious activity
      await this.checkSuspiciousActivity(request, sessionValidation.userId!);

      return response;
    } catch (error) {
      // Log error as security event
      await this.logSecurityEvent('unknown', SecurityEventType.SYSTEM_ERROR, {
        error: error instanceof Error ? error.message : 'Unknown error',
        ipAddress: this.getClientIP(request),
        userAgent: request.headers.get('user-agent') || 'Unknown',
        requestPath: pathname,
      });

      return this.redirectToLogin(request);
    }
  }

  /**
   * Check if the route is public and doesn't require authentication
   */
  private isPublicRoute(pathname: string): boolean {
    const publicRoutes = [
      '/login',
      '/register',
      '/forgot-password',
      '/reset-password',
      '/verify-email',
      '/privacy',
      '/terms',
      '/about',
      '/contact',
      '/',
      '/public',
    ];

    return publicRoutes.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    );
  }

  /**
   * Check if the API route is public
   */
  private isPublicApiRoute(pathname: string): boolean {
    const publicApiRoutes = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/forgot-password',
      '/api/auth/reset-password',
      '/api/auth/verify-email',
      '/api/health',
      '/api/public',
    ];

    return publicApiRoutes.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    );
  }

  /**
   * Get client IP address from request
   */
  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const remoteAddr = request.headers.get('x-remote-addr');

    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }

    return realIP || remoteAddr || '0.0.0.0';
  }

  /**
   * Redirect to login page
   */
  private redirectToLogin(request: NextRequest): NextResponse {
    const loginUrl = new URL('/login', request.url);

    // Add return URL for redirect after login
    if (request.nextUrl.pathname !== '/login') {
      loginUrl.searchParams.set('returnUrl', request.nextUrl.pathname);
    }

    return NextResponse.redirect(loginUrl);
  }

  /**
   * Log security event
   */
  private async logSecurityEvent(
    userId: string,
    eventType: SecurityEventType,
    details: Record<string, any>
  ): Promise<void> {
    try {
      await this.sessionManager.logSecurityEvent({
        userId,
        eventType,
        severity: this.getEventSeverity(eventType),
        details,
        timestamp: new Date().toISOString(),
      });
    } catch (_error) {}
  }

  /**
   * Get event severity based on type
   */
  private getEventSeverity(
    eventType: SecurityEventType
  ): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    switch (eventType) {
      case SecurityEventType.FAILED_LOGIN:
      case SecurityEventType.SESSION_VALIDATION_FAILED:
        return 'MEDIUM';

      case SecurityEventType.SUSPICIOUS_ACTIVITY:
      case SecurityEventType.MULTIPLE_FAILED_ATTEMPTS:
        return 'HIGH';

      case SecurityEventType.ACCOUNT_LOCKED:
      case SecurityEventType.SECURITY_BREACH:
        return 'CRITICAL';

      default:
        return 'LOW';
    }
  }

  /**
   * Check for suspicious activity patterns
   */
  private async checkSuspiciousActivity(
    request: NextRequest,
    userId: string
  ): Promise<void> {
    try {
      const ipAddress = this.getClientIP(request);
      const userAgent = request.headers.get('user-agent') || 'Unknown';

      // Check for rapid requests from same IP
      const recentRequests = await this.getRecentRequests(ipAddress);
      if (recentRequests > 100) {
        // More than 100 requests in last minute
        await this.logSecurityEvent(
          userId,
          SecurityEventType.SUSPICIOUS_ACTIVITY,
          {
            reason: 'Rapid requests detected',
            requestCount: recentRequests,
            ipAddress,
            userAgent,
            timeWindow: '1 minute',
          }
        );
      }

      // Check for unusual user agent
      if (this.isUnusualUserAgent(userAgent)) {
        await this.logSecurityEvent(
          userId,
          SecurityEventType.SUSPICIOUS_ACTIVITY,
          {
            reason: 'Unusual user agent detected',
            userAgent,
            ipAddress,
          }
        );
      }

      // Check for geographic anomalies (simplified)
      const isUnusualLocation = await this.checkUnusualLocation(
        userId,
        ipAddress
      );
      if (isUnusualLocation) {
        await this.logSecurityEvent(
          userId,
          SecurityEventType.SUSPICIOUS_ACTIVITY,
          {
            reason: 'Unusual geographic location',
            ipAddress,
            userAgent,
          }
        );
      }
    } catch (_error) {}
  }

  /**
   * Get recent request count for IP (simplified implementation)
   */
  private async getRecentRequests(_ipAddress: string): Promise<number> {
    // In a real implementation, this would check a cache/database
    // For now, return 0 to avoid false positives
    return 0;
  }

  /**
   * Check if user agent is unusual
   */
  private isUnusualUserAgent(userAgent: string): boolean {
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /java/i,
    ];

    return suspiciousPatterns.some((pattern) => pattern.test(userAgent));
  }

  /**
   * Check for unusual geographic location (simplified)
   */
  private async checkUnusualLocation(
    _userId: string,
    _ipAddress: string
  ): Promise<boolean> {
    // In a real implementation, this would:
    // 1. Get IP geolocation
    // 2. Compare with user's typical locations
    // 3. Flag if significantly different

    // For now, return false to avoid false positives
    return false;
  }
}

// Export singleton instance
export const sessionAuthMiddleware = new SessionAuthMiddleware();

/**
 * Middleware configuration for Next.js
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};

/**
 * Main middleware function for Next.js
 */
export async function middleware(request: NextRequest) {
  return sessionAuthMiddleware.handle(request);
}
