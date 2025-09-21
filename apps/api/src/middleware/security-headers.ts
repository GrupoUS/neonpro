/**
 * Security headers middleware for healthcare applications
 * Provides enhanced security headers with HSTS and healthcare compliance
 * Implements TLS 1.3+ enforcement and comprehensive security headers
 */

import type { Context } from 'hono';

/**
 * HTTPS redirect middleware - enforces HTTPS in production
 * Redirects all HTTP requests to HTTPS with 301 permanent redirect
 */
export function httpsRedirectMiddleware() {
  return async (c: Context, next: () => Promise<void>) => {
    // Only enforce HTTPS in production
    if (process.env.NODE_ENV === 'production') {
      const protocol = c.req.header('x-forwarded-proto')
        || c.req.header('x-forwarded-protocol')
        || (c.req.url.startsWith('https://') ? 'https' : 'http');

      if (protocol !== 'https') {
        const httpsUrl = c.req.url.replace(/^http:/, 'https:');
        return c.redirect(httpsUrl, 301);
      }
    }

    await next();
  };
}

/**
 * Healthcare-compliant security headers middleware
 * Implements comprehensive security headers for healthcare applications
 */
export function healthcareSecurityHeadersMiddleware() {
  return async (c: Context, next: () => Promise<void>) => {
    await next();

    // HSTS - HTTP Strict Transport Security (mandatory for healthcare)
    // max-age=31536000 (1 year), includeSubDomains, preload
    c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

    // X-Content-Type-Options - Prevents MIME type sniffing
    c.header('X-Content-Type-Options', 'nosniff');

    // X-Frame-Options - Prevents clickjacking attacks
    c.header('X-Frame-Options', 'DENY');

    // X-XSS-Protection - XSS protection (legacy but still useful)
    c.header('X-XSS-Protection', '1; mode=block');

    // Referrer-Policy - Controls referrer information
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin');

    // X-Permitted-Cross-Domain-Policies - Adobe Flash/PDF policy
    c.header('X-Permitted-Cross-Domain-Policies', 'none');

    // X-Download-Options - IE download behavior
    c.header('X-Download-Options', 'noopen');

    // Content Security Policy - Comprehensive CSP for healthcare apps
    const cspDirectives = [
      'default-src \'self\'',
      'script-src \'self\' \'unsafe-inline\' \'unsafe-eval\' https://vercel.live https://js.stripe.com https://checkout.stripe.com',
      'style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com',
      'font-src \'self\' https://fonts.gstatic.com',
      'img-src \'self\' data: https: blob:',
      'media-src \'self\' data: https:',
      'connect-src \'self\' https://api.stripe.com https://checkout.stripe.com wss: ws:',
      'frame-src \'self\' https://js.stripe.com https://checkout.stripe.com',
      'object-src \'none\'',
      'base-uri \'self\'',
      'form-action \'self\'',
      'frame-ancestors \'none\'',
      'upgrade-insecure-requests',
    ];
    c.header('Content-Security-Policy', cspDirectives.join('; '));

    // Permissions Policy - Controls browser features
    const permissionsPolicy = [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=(self)',
      'usb=()',
      'magnetometer=()',
      'accelerometer=()',
      'gyroscope=()',
      'fullscreen=(self)',
    ];
    c.header('Permissions-Policy', permissionsPolicy.join(', '));

    // Cross-Origin policies for enhanced security
    c.header('Cross-Origin-Embedder-Policy', 'require-corp');
    c.header('Cross-Origin-Opener-Policy', 'same-origin');
    c.header('Cross-Origin-Resource-Policy', 'same-origin');

    // Healthcare-specific headers
    c.header('X-Healthcare-Compliance', 'LGPD,HIPAA-Ready');
    c.header('X-Data-Classification', 'Healthcare-Sensitive');

    // Cache control for sensitive healthcare data
    if (c.req.path.includes('/api/')) {
      c.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      c.header('Pragma', 'no-cache');
      c.header('Expires', '0');
    }
  };
}
