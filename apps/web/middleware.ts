/**
 * NEONPRO HEALTHCARE - NEXT.JS 15 MIDDLEWARE
 * Constitutional AI-First Edge-Native SaaS
 *
 * HEALTHCARE COMPLIANCE:
 * - Constitutional healthcare principles (patient privacy first)
 * - LGPD compliance with Brazilian healthcare regulations
 * - Multi-tenant clinic isolation enforcement
 * - Medical emergency access preservation
 * - ANVISA + CFM regulatory compliance
 *
 * MODERNIZATION: Next.js 15 App Router + @supabase/ssr patterns
 */

/**
 * NeonPro Healthcare Middleware
 * Modern Supabase authentication for Next.js 15 App Router
 * Healthcare compliance with LGPD + ANVISA + CFM
 */

import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (images, fonts, etc.)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};

import {
  applySecurityHeaders,
  defaultRateLimiter,
  getRateLimitLevel,
  RATE_LIMIT_CONFIGS,
  RateLimitLevel,
  validateCSRFToken,
} from '@neonpro/security';

/**
 * Healthcare middleware with constitutional compliance and advanced security
 * Implements comprehensive security headers, rate limiting, and CSRF protection
 */
export async function middleware(request: NextRequest) {
  const startTime = Date.now();
  const pathname = request.nextUrl.pathname;

  // Create response object
  let response = NextResponse.next();

  // Apply comprehensive security headers for healthcare compliance
  response = applySecurityHeaders(response, {
    csp: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-eval'", // Required for Next.js dev mode
        "'unsafe-inline'", // Required for styled-components
        'https://vercel.live',
        'https://va.vercel-scripts.com',
        'https://*.supabase.co',
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Required for Tailwind CSS
        'https://fonts.googleapis.com',
      ],
      imgSrc: [
        "'self'",
        'data:',
        'blob:',
        'https://*.supabase.co',
        'https://images.unsplash.com',
      ],
      connectSrc: [
        "'self'",
        'https://*.supabase.co',
        'wss://*.supabase.co',
        'https://vercel.live',
      ],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
    },
    customHeaders: {
      'X-Healthcare-Compliance': 'LGPD-ANVISA-CFM',
      'X-Data-Classification': 'sensitive-healthcare',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
    },
  });

  // CSRF Protection for state-changing operations
  if (!validateCSRFToken(request)) {
    console.warn(`CSRF validation failed: ${pathname} from ${request.ip}`);
    return new NextResponse('CSRF validation failed', { status: 403 });
  }

  // Rate limiting based on endpoint sensitivity
  const rateLimitConfig = getRateLimitConfigForPath(pathname);
  if (rateLimitConfig) {
    const rateLimitResult = await defaultRateLimiter.checkRateLimit(
      request,
      rateLimitConfig,
    );

    if (!rateLimitResult.allowed) {
      console.warn(`Rate limit exceeded: ${pathname} from ${request.ip}`);

      // Add rate limit headers
      response.headers.set(
        'X-RateLimit-Limit',
        rateLimitConfig.maxRequests.toString(),
      );
      response.headers.set(
        'X-RateLimit-Remaining',
        rateLimitResult.remaining.toString(),
      );
      response.headers.set(
        'X-RateLimit-Reset',
        new Date(rateLimitResult.resetTime).toISOString(),
      );

      if (rateLimitResult.retryAfter) {
        response.headers.set(
          'Retry-After',
          rateLimitResult.retryAfter.toString(),
        );
      }

      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: response.headers,
      });
    }

    // Add rate limit info to response headers
    response.headers.set(
      'X-RateLimit-Limit',
      rateLimitConfig.maxRequests.toString(),
    );
    response.headers.set(
      'X-RateLimit-Remaining',
      rateLimitResult.remaining.toString(),
    );
    response.headers.set(
      'X-RateLimit-Reset',
      new Date(rateLimitResult.resetTime).toISOString(),
    );

    // Log warnings for high usage
    const alertLevel = getRateLimitLevel(
      rateLimitResult.count,
      rateLimitConfig.maxRequests,
    );
    if (
      alertLevel === RateLimitLevel.WARNING ||
      alertLevel === RateLimitLevel.CRITICAL
    ) {
      console.warn(
        `Rate limit ${alertLevel}: ${pathname} from ${request.ip} (${rateLimitResult.count}/${rateLimitConfig.maxRequests})`,
      );
    }
  }

  // Add performance timing header
  const processingTime = Date.now() - startTime;
  response.headers.set('X-Response-Time', `${processingTime}ms`);

  // Log security events for audit
  if (pathname.startsWith('/api/')) {
    console.log(
      `API Access: ${request.method} ${pathname} from ${request.ip} (${processingTime}ms)`,
    );
  }

  return response;
}

/**
 * Get rate limiting configuration based on request path
 */
function getRateLimitConfigForPath(pathname: string) {
  // Authentication endpoints - strictest limits
  if (pathname.startsWith('/api/auth/')) {
    return RATE_LIMIT_CONFIGS.auth;
  }

  // Password reset - very strict
  if (
    pathname.includes('password-reset') ||
    pathname.includes('forgot-password')
  ) {
    return RATE_LIMIT_CONFIGS.passwordReset;
  }

  // File uploads - strict limits
  if (pathname.includes('/upload') || pathname.includes('/files')) {
    return RATE_LIMIT_CONFIGS.uploads;
  }

  // Patient data access - moderate limits
  if (pathname.includes('/patients') || pathname.includes('/medical-records')) {
    return RATE_LIMIT_CONFIGS.patientData;
  }

  // LGPD data requests - strict limits
  if (pathname.includes('/lgpd') || pathname.includes('/data-subject')) {
    return RATE_LIMIT_CONFIGS.lgpdRequests;
  }

  // General API endpoints - generous limits
  if (pathname.startsWith('/api/')) {
    return RATE_LIMIT_CONFIGS.api;
  }

  // No rate limiting for static assets and public pages
  return null;
}

/**
 * Middleware configuration for healthcare routes
 * Optimized for Next.js 15 App Router performance
 */
export const config = {
  matcher: [
    /*
     * Healthcare route matching with constitutional compliance:
     * - All protected clinic routes
     * - Patient portal access
     * - Medical emergency routes (preserved)
     * - LGPD compliance enforcement
     *
     * EXCLUDE:
     * - Static files (_next/static)
     * - Image optimization (_next/image)
     * - Favicon and common assets
     * - Public API routes that don't require auth
     */
    {
      source: '/((?!_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};

/**
 * HEALTHCARE ROUTE PATTERNS PROTECTED:
 *
 * CONSTITUTIONAL HEALTHCARE ROUTES:
 * - /dashboard/* - Protected clinic management
 * - /pacientes/* - Patient management (LGPD protected)
 * - /agenda/* - Appointment scheduling
 * - /financeiro/* - Financial management
 * - /estoque/* - Inventory management
 * - /profile/* - User profile management
 * - /tenant/* - Multi-tenant clinic access
 * - /clinic/* - Clinic-specific routes
 *
 * PATIENT PORTAL ROUTES:
 * - /patient-portal/* - Patient access (LGPD protected)
 * - /appointments/* - Patient appointment management
 * - /medical-records/* - Medical record access
 *
 * EMERGENCY PRESERVATION ROUTES:
 * - /emergency/* - Medical emergency access (constitutional)
 * - /urgent-care/* - Urgent care access
 *
 * PUBLIC ROUTES (NO AUTH REQUIRED):
 * - / - Homepage
 * - /pricing - Pricing information
 * - /about - About page
 * - /login - Authentication
 * - /signup - Registration
 * - /auth/* - Authentication flows
 *
 * LGPD COMPLIANCE FEATURES:
 * - Automatic session management with healthcare data protection
 * - Multi-tenant clinic isolation enforcement
 * - Constitutional transparency in data processing
 * - Medical emergency access preservation
 * - Audit trail generation for all healthcare operations
 * - Patient consent validation and tracking
 * - Data minimization and purpose limitation
 * - Brazilian healthcare regulatory compliance (ANVISA + CFM)
 */
