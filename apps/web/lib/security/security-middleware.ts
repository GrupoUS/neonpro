/**
 * 🛡️ Main Security Middleware Function
 */
export async function intelligentSecurityMiddleware(
  request: NextRequest
): Promise<NextResponse> {
  const startTime = Date.now();
  const ip = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const route = request.nextUrl.pathname;
  const method = request.method;

  try {
    // 1. Check if IP is in trusted cache (fastest path)
    if (trustedIPsCache.get(ip)) {
      return NextResponse.next();
    }

    // 2. Threat detection analysis
    const threatAnalysis = ThreatDetection.analyzeSuspiciousActivity(
      ip,
      userAgent,
      route,
      method
    );

    // 3. Apply rate limiting with adaptive limits
    const limits = IntelligentRateLimit.getAdaptiveLimits(route, method);
    const rateLimitResult = IntelligentRateLimit.checkRateLimit(
      ip,
      route,
      limits
    );

    // 4. Record security event
    ThreatDetection.recordEvent({
      ip,
      userAgent,
      route,
      method,
      timestamp: Date.now(),
      suspicious: threatAnalysis.suspicious,
      reason: threatAnalysis.reason,
    });

    // 5. Make security decision
    if (!rateLimitResult.allowed) {
      const response = new NextResponse(
        JSON.stringify({
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil(
            (rateLimitResult.resetTime - Date.now()) / 1000
          ),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(
              Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
            ),
            'X-RateLimit-Limit': String(limits.requests),
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            'X-RateLimit-Reset': String(rateLimitResult.resetTime),
          },
        }
      );

      // Record performance metric
      performanceMonitor.recordAPIPerformance({
        route,
        method,
        statusCode: 429,
        responseTime: Date.now() - startTime,
        userId: undefined,
        clinicId: undefined,
        userAgent,
        timestamp: Date.now(),
      });

      return response;
    }

    // 6. Block high-risk requests
    if (threatAnalysis.riskScore >= 8) {
      const response = new NextResponse(
        JSON.stringify({
          error: 'Request blocked for security reasons',
          requestId: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      performanceMonitor.recordAPIPerformance({
        route,
        method,
        statusCode: 403,
        responseTime: Date.now() - startTime,
        userId: undefined,
        clinicId: undefined,
        userAgent,
        timestamp: Date.now(),
      });

      return response;
    }

    // 7. Add security headers to response
    const response = NextResponse.next();

    // Security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Rate limit info headers (for debugging)
    if (process.env.NODE_ENV === 'development') {
      response.headers.set(
        'X-RateLimit-Remaining',
        String(rateLimitResult.remaining)
      );
      response.headers.set('X-Threat-Score', String(threatAnalysis.riskScore));
    }

    // 8. Mark as trusted if legitimate long-term user
    if (
      !threatAnalysis.suspicious &&
      rateLimitResult.remaining > limits.requests * 0.8
    ) {
      trustedIPsCache.set(ip, true);
    }

    return response;
  } catch (_error) {
    // Fail-safe: allow request but log error
    const response = NextResponse.next();
    performanceMonitor.recordAPIPerformance({
      route,
      method,
      statusCode: 200, // Pass-through
      responseTime: Date.now() - startTime,
      userId: undefined,
      clinicId: undefined,
      userAgent,
      timestamp: Date.now(),
    });

    return response;
  }
}

/**
 * 🌐 Get client IP address
 */
function getClientIP(request: NextRequest): string {
  // Try various headers for IP detection (Vercel, CloudFlare, etc.)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');

  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  if (realIP) {
    return realIP;
  }
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  // Fallback to connection IP
  return request.ip || 'unknown';
}
