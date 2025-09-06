import { LogCategory, logger, LogLevel } from "@/lib/logger";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Security configuration
const SECURITY_CONFIG = {
  // Content Security Policy
  csp: {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      "https://va.vercel-scripts.com", // Vercel Analytics
      "https://vitals.vercel-app.com", // Web Vitals
    ],
    "style-src": [
      "'self'",
      "'unsafe-inline'", // Required for styled-components
      "https://fonts.googleapis.com",
    ],
    "font-src": [
      "'self'",
      "https://fonts.gstatic.com",
    ],
    "img-src": [
      "'self'",
      "data:", // For inline images
      "https:", // Allow HTTPS images
      "blob:", // For generated images
    ],
    "connect-src": [
      "'self'",
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      "https://vitals.vercel-app.com",
      "https://o4507897778585600.ingest.sentry.io", // Sentry
    ],
    "frame-src": ["'none'"], // No iframe embedding
    "object-src": ["'none'"], // No plugins
    "base-uri": ["'self'"], // Restrict base URI
    "form-action": ["'self'"], // Only submit forms to same origin
    "upgrade-insecure-requests": [], // Auto-upgrade HTTP to HTTPS
  },

  // Allowed origins for CORS (healthcare compliance)
  allowedOrigins: {
    development: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
    ],
    staging: [
      "https://neonpro-staging.vercel.app",
      "https://staging.neonpro.com.br",
    ],
    production: [
      "https://neonpro.com.br",
      "https://www.neonpro.com.br",
      "https://app.neonpro.com.br",
    ],
  },

  // Rate limiting configuration
  rateLimits: {
    api: { requests: 100, window: 60_000 }, // 100 req/min for API
    auth: { requests: 10, window: 60_000 }, // 10 req/min for auth
    upload: { requests: 20, window: 60_000 }, // 20 req/min for uploads
  },
};

// Rate limiting storage (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number; }>();

// Cleanup expired rate limit entries every 5 minutes
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  const gracePeriod = 60_000; // 1 minute grace period

  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime + gracePeriod) {
      rateLimitStore.delete(key);
    }
  }

  // Log cleanup stats if there were entries to clean
  const remainingEntries = rateLimitStore.size;
  if (remainingEntries > 0) {
    logger.log(LogLevel.DEBUG, "Rate limit cleanup completed", {
      category: LogCategory.SYSTEM,
      remainingEntries,
      cleanedAt: new Date().toISOString(),
    });
  }
}, 5 * 60 * 1000); // Run every 5 minutes

// Handle graceful shutdown
process.on("SIGTERM", () => {
  clearInterval(cleanupInterval);
});

process.on("SIGINT", () => {
  clearInterval(cleanupInterval);
});

function getRateLimitKey(ip: string, path: string): string {
  return `${ip}:${path}`;
}

function checkRateLimit(
  ip: string,
  path: string,
  limit: { requests: number; window: number; },
): { allowed: boolean; remaining: number; resetTime: number; } {
  const key = getRateLimitKey(ip, path);
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    const resetTime = now + limit.window;
    rateLimitStore.set(key, { count: 1, resetTime });
    return {
      allowed: true,
      remaining: limit.requests - 1,
      resetTime,
    };
  }

  if (record.count >= limit.requests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  record.count++;
  return {
    allowed: true,
    remaining: limit.requests - record.count,
    resetTime: record.resetTime,
  };
}

function buildCSP(csp: Record<string, string[]>): string {
  return Object.entries(csp)
    .map(([directive, sources]) => {
      const normalizedDirective = directive.replace(/_/g, "-");
      if (sources.length === 0) {
        return normalizedDirective;
      }
      return `${normalizedDirective} ${sources.join(" ")}`;
    })
    .join("; ");
}

function getClientIP(request: NextRequest): string {
  // Get real IP from various headers (considering reverse proxies)
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip"); // Cloudflare
  const xClientIp = request.headers.get("x-client-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return cfConnectingIp || realIp || xClientIp || "unknown";
}

function isAllowedOrigin(origin: string, environment: string): boolean {
  const allowedOrigins = SECURITY_CONFIG.allowedOrigins[
    environment as keyof typeof SECURITY_CONFIG.allowedOrigins
  ] || [];

  return allowedOrigins.includes(origin);
}

function createSecurityHeaders(request: NextRequest): Headers {
  const headers = new Headers();

  // Basic security headers
  headers.set("X-DNS-Prefetch-Control", "off");
  headers.set("X-Frame-Options", "DENY"); // No iframe embedding
  headers.set("X-Content-Type-Options", "nosniff"); // Prevent MIME sniffing
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("X-XSS-Protection", "1; mode=block"); // Legacy XSS protection

  // HSTS - Force HTTPS (only in production)
  if (process.env.NODE_ENV === "production") {
    headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }

  // Content Security Policy
  const environment = process.env.NODE_ENV || "development";
  let cspConfig = { ...SECURITY_CONFIG.csp };

  // Adjust CSP for development
  if (environment === "development") {
    cspConfig["connect-src"].push("ws://localhost:*", "http://localhost:*");
    cspConfig["script-src"].push("'unsafe-eval'"); // Required for dev
  }

  headers.set("Content-Security-Policy", buildCSP(cspConfig));

  // Permissions Policy (Feature Policy)
  const permissionsPolicy = [
    "camera=self", // Camera access for medical photos
    "microphone=self", // Voice notes
    "geolocation=self", // Clinic locations
    "payment=self", // Payment integration
    "usb=(), bluetooth=(), serial=()", // Block potentially dangerous APIs
    "autoplay=(), encrypted-media=()", // Block media APIs
    "fullscreen=self", // Allow fullscreen for medical images
  ].join(", ");

  headers.set("Permissions-Policy", permissionsPolicy);

  // Healthcare-specific headers
  headers.set("X-Healthcare-Compliance", "LGPD,ANVISA,CFM");
  headers.set("X-Content-Classification", "healthcare-sensitive");

  return headers;
}

function handleCORS(request: NextRequest): Headers {
  const headers = new Headers();
  const origin = request.headers.get("origin");
  const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || "development";

  if (!origin) {
    // Same-origin requests don't have origin header
    return headers;
  }

  if (isAllowedOrigin(origin, environment)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    headers.set(
      "Access-Control-Allow-Headers",
      [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "X-CSRF-Token",
        "X-Clinic-ID",
        "X-Request-ID",
        "baggage",
        "sentry-trace",
      ].join(", "),
    );
    headers.set("Access-Control-Max-Age", "86400"); // Cache preflight for 24h
  }

  return headers;
}

export async function middleware(request: NextRequest) {
  const startTime = Date.now();
  const { pathname } = request.nextUrl;
  const method = request.method;
  const clientIP = getClientIP(request);

  // Skip middleware for static assets
  if (
    pathname.startsWith("/_next/")
    || pathname.startsWith("/api/_next/")
    || pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  try {
    // Handle preflight OPTIONS requests
    if (method === "OPTIONS") {
      const corsHeaders = handleCORS(request);
      const securityHeaders = createSecurityHeaders(request);

      const response = new NextResponse(null, { status: 200 });

      // Merge headers
      corsHeaders.forEach((value, key) => {
        response.headers.set(key, value);
      });
      securityHeaders.forEach((value, key) => {
        response.headers.set(key, value);
      });

      return response;
    }

    // Rate limiting based on path
    let rateLimit = SECURITY_CONFIG.rateLimits.api;

    if (pathname.startsWith("/api/auth/")) {
      rateLimit = SECURITY_CONFIG.rateLimits.auth;
    } else if (pathname.startsWith("/api/upload/")) {
      rateLimit = SECURITY_CONFIG.rateLimits.upload;
    }

    const rateLimitResult = checkRateLimit(clientIP, pathname, rateLimit);

    if (!rateLimitResult.allowed) {
      logger.log(LogLevel.WARN, "Rate limit exceeded", {
        category: LogCategory.SECURITY,
        clientIP,
        path: pathname,
        method,
        userAgent: request.headers.get("user-agent") || "",
      });

      const response = NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 },
      );

      response.headers.set("X-RateLimit-Limit", rateLimit.requests.toString());
      response.headers.set("X-RateLimit-Remaining", "0");
      response.headers.set("X-RateLimit-Reset", rateLimitResult.resetTime.toString());
      response.headers.set(
        "Retry-After",
        Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
      );

      return response;
    }

    // Continue with request
    const response = NextResponse.next();

    // Add security headers
    const securityHeaders = createSecurityHeaders(request);
    securityHeaders.forEach((value, key) => {
      response.headers.set(key, value);
    });

    // Add CORS headers
    const corsHeaders = handleCORS(request);
    corsHeaders.forEach((value, key) => {
      response.headers.set(key, value);
    });

    // Add rate limit headers
    response.headers.set("X-RateLimit-Limit", rateLimit.requests.toString());
    response.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString());
    response.headers.set("X-RateLimit-Reset", rateLimitResult.resetTime.toString());

    // Add request ID for tracking
    const requestId = crypto.randomUUID();
    response.headers.set("X-Request-ID", requestId);

    // Log request (excluding sensitive paths)
    if (!pathname.includes("/api/auth/") && !pathname.includes("/api/patient/")) {
      const duration = Date.now() - startTime;
      logger.log(LogLevel.INFO, "Request processed", {
        category: LogCategory.SYSTEM,
        requestId,
        method,
        path: pathname,
        clientIP,
        userAgent: request.headers.get("user-agent") || "",
        duration,
        rateLimitRemaining: rateLimitResult.remaining,
      });
    }

    return response;
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.log(LogLevel.ERROR, "Middleware error", {
      category: LogCategory.SYSTEM,
      error: error instanceof Error ? error.message : "Unknown error",
      method,
      path: pathname,
      clientIP,
      duration,
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Return basic security headers even on error
    const response = NextResponse.next();
    const securityHeaders = createSecurityHeaders(request);
    securityHeaders.forEach((value, key) => {
      response.headers.set(key, value);
    });

    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
