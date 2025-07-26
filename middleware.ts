/**
 * Main Middleware for NeonPro Application
 * Handles authentication, rate limiting, and request routing
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter, createRateLimitIdentifier } from '@/lib/rate-limiting/memory-limiter';
import { RATE_LIMIT_HEADERS, RATE_LIMIT_MESSAGES } from '@/lib/rate-limiting/config';
import { authenticateRequest } from '@/lib/middleware/auth';

/**
 * Get client IP address from request
 */
function getClientIP(request: NextRequest): string {
  // Check for forwarded IP headers (common in production)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  // Fallback to request IP
  return request.ip || '127.0.0.1';
}

/**
 * Extract endpoint name from pathname
 */
function getEndpointName(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  
  if (parts[0] === 'api' && parts[1]) {
    return parts[1];
  }
  
  return 'default';
}

/**
 * Apply rate limiting to request
 */
async function applyRateLimit(
  request: NextRequest,
  ip: string,
  endpoint: string,
  userRole?: string,
  userId?: string
): Promise<NextResponse | null> {
  // Check if IP is whitelisted
  if (rateLimiter.isWhitelisted(ip)) {
    return null; // Skip rate limiting
  }
  
  // Get rate limit configuration
  const config = rateLimiter.getRateLimitConfig(endpoint, userRole);
  
  // Create identifier for rate limiting
  const identifier = createRateLimitIdentifier(ip, userId, endpoint);
  
  // Check rate limit
  const result = await rateLimiter.checkRateLimit(identifier, config);
  
  if (!result.allowed) {
    // Create rate limit exceeded response
    const response = NextResponse.json(
      {
        error: RATE_LIMIT_MESSAGES.EXCEEDED,
        message: 'Too many requests',
        retryAfter: result.retryAfter,
      },
      { status: 429 }
    );
    
    // Add rate limit headers
    response.headers.set(RATE_LIMIT_HEADERS.LIMIT, result.limit.toString());
    response.headers.set(RATE_LIMIT_HEADERS.REMAINING, result.remaining.toString());
    response.headers.set(RATE_LIMIT_HEADERS.RESET, Math.ceil(result.resetTime / 1000).toString());
    
    if (result.retryAfter) {
      response.headers.set(RATE_LIMIT_HEADERS.RETRY_AFTER, result.retryAfter.toString());
    }
    
    return response;
  }
  
  return null; // Rate limit passed
}

/**
 * Add security headers to response (optimized for serverless)
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Batch header operations for better performance
  const headers = new Map([
    ['Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' wss: https:;"],
    ['X-Frame-Options', 'DENY'],
    ['X-Content-Type-Options', 'nosniff'],
    ['Referrer-Policy', 'strict-origin-when-cross-origin'],
    ['Permissions-Policy', 'camera=(), microphone=(), geolocation=()']
  ]);
  
  // Add CORS headers for API routes
  if (response.url.includes('/api/')) {
    headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  
  // Apply all headers at once
  headers.forEach((value, key) => {
    response.headers.set(key, value);
  });
  
  return response;
}

/**
 * Handle CORS preflight requests
 */
function handleCORS(request: NextRequest): NextResponse | null {
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 });
    
    response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');
    
    return response;
  }
  
  return null;
}

/**
 * Main middleware function
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Handle CORS preflight requests
  const corsResponse = handleCORS(request);
  if (corsResponse) {
    return corsResponse;
  }
  
  // Skip middleware for static files and certain paths
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }
  
  // Get client information
  const ip = getClientIP(request);
  const endpoint = getEndpointName(pathname);
  
  // Apply rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    // Skip expensive auth check for health/monitoring endpoints
    const isHealthEndpoint = pathname.includes('/health') || pathname.includes('/monitoring');
    
    let userRole: string | undefined;
    let userId: string | undefined;
    
    // Only perform auth check for non-health endpoints and with timeout
    if (!isHealthEndpoint) {
      try {
        const authPromise = authenticateRequest(request);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth timeout')), 500)
        );
        
        const authResult = await Promise.race([authPromise, timeoutPromise]) as any;
        if (authResult?.success && authResult?.user) {
          userRole = authResult.user.role;
          userId = authResult.user.id;
        }
      } catch (error) {
        // Continue without user info if authentication fails or times out
        // Skip console.warn in production to reduce noise
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Authentication check failed in middleware:', error);
        }
      }
    }
    
    // Apply rate limiting with faster execution
    const rateLimitResponse = await applyRateLimit(
      request,
      ip,
      endpoint,
      userRole,
      userId
    );
    
    if (rateLimitResponse) {
      return addSecurityHeaders(rateLimitResponse);
    }
  }
  
  // Continue with the request
  const response = NextResponse.next();
  
  // Add security headers to all responses
  return addSecurityHeaders(response);
}

/**
 * Middleware configuration
 * Excludes static files and Next.js internal routes
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/health (health check endpoint)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    '/((?!api/health|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};