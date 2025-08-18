import type { NextRequest, NextResponse } from 'next/server';

/**
 * Security headers configuration for healthcare compliance
 * Follows OWASP security headers best practices and LGPD/ANVISA requirements
 */
export type SecurityHeadersConfig = {
  /** Content Security Policy directives */
  csp?: {
    defaultSrc?: string[];
    scriptSrc?: string[];
    styleSrc?: string[];
    imgSrc?: string[];
    connectSrc?: string[];
    fontSrc?: string[];
    objectSrc?: string[];
    mediaSrc?: string[];
    frameSrc?: string[];
  };

  /** HSTS max age in seconds (default: 1 year) */
  hstsMaxAge?: number;

  /** Whether to include subdomains in HSTS */
  hstsIncludeSubdomains?: boolean;

  /** Custom security headers */
  customHeaders?: Record<string, string>;

  /** Whether to enable CSRF protection */
  enableCsrfProtection?: boolean;

  /** Trusted domains for CORS */
  trustedDomains?: string[];
};

/**
 * Default security headers configuration for healthcare compliance
 * Implements defense-in-depth security strategy
 */
const DEFAULT_SECURITY_CONFIG: Required<SecurityHeadersConfig> = {
  csp: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-eval'", // Required for Next.js dev mode
      "'unsafe-inline'", // Required for styled-components
      'https://vercel.live',
      'https://va.vercel-scripts.com',
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
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'self'", 'https://vercel.live'],
  },
  hstsMaxAge: 31_536_000, // 1 year
  hstsIncludeSubdomains: true,
  customHeaders: {},
  enableCsrfProtection: true,
  trustedDomains: ['localhost:3000', '*.vercel.app'],
};

/**
 * Creates Content Security Policy string from configuration
 */
function createCSPString(csp: SecurityHeadersConfig['csp']): string {
  if (!csp) {
    return '';
  }

  const directives: string[] = [];

  for (const [directive, sources] of Object.entries(csp)) {
    if (sources && sources.length > 0) {
      const kebabDirective = directive.replace(/([A-Z])/g, '-$1').toLowerCase();
      directives.push(`${kebabDirective} ${sources.join(' ')}`);
    }
  }

  return directives.join('; ');
}

/**
 * Applies comprehensive security headers to response
 * Implements OWASP security guidelines and healthcare compliance requirements
 *
 * @param response - Next.js response object
 * @param config - Security configuration options
 * @returns Modified response with security headers
 */
export function applySecurityHeaders(
  response: NextResponse,
  config: SecurityHeadersConfig = {}
): NextResponse {
  const finalConfig = { ...DEFAULT_SECURITY_CONFIG, ...config };

  // Content Security Policy
  const cspString = createCSPString(finalConfig.csp);
  if (cspString) {
    response.headers.set('Content-Security-Policy', cspString);
  }

  // HTTP Strict Transport Security
  const hstsValue = `max-age=${finalConfig.hstsMaxAge}${
    finalConfig.hstsIncludeSubdomains ? '; includeSubDomains' : ''
  }; preload`;
  response.headers.set('Strict-Transport-Security', hstsValue);

  // XSS Protection
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Content Type Options
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Frame Options
  response.headers.set('X-Frame-Options', 'DENY');

  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy (formerly Feature Policy)
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  // Cross-Origin Embedder Policy
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');

  // Cross-Origin Resource Policy
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');

  // Cross-Origin Opener Policy
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');

  // Custom headers for healthcare compliance
  response.headers.set('X-Healthcare-Compliance', 'LGPD-ANVISA-CFM');
  response.headers.set('X-Data-Classification', 'sensitive-healthcare');

  // Apply custom headers
  for (const [key, value] of Object.entries(finalConfig.customHeaders)) {
    response.headers.set(key, value);
  }

  return response;
}

/**
 * Validates if a request origin is trusted
 */
export function isTrustedOrigin(
  origin: string,
  trustedDomains: string[]
): boolean {
  if (!origin) {
    return false;
  }

  const url = new URL(origin);
  const hostname = url.hostname;

  return trustedDomains.some((domain) => {
    if (domain.startsWith('*.')) {
      const baseDomain = domain.substring(2);
      return hostname.endsWith(baseDomain);
    }
    return hostname === domain;
  });
}

/**
 * CSRF protection middleware
 * Validates CSRF tokens for state-changing operations
 */
export function validateCSRFToken(request: NextRequest): boolean {
  const method = request.method.toUpperCase();

  // Only apply CSRF protection to state-changing methods
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return true;
  }

  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');

  // Check if origin matches host
  if (origin) {
    const originUrl = new URL(origin);
    if (originUrl.host !== host) {
      return false;
    }
  }

  // Check if referer matches host
  if (referer) {
    const refererUrl = new URL(referer);
    if (refererUrl.host !== host) {
      return false;
    }
  }

  return true;
}
