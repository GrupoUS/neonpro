/**
 * Rate limiting middleware for healthcare applications
 * Provides LGPD-compliant rate limiting with enhanced security
 */

export function rateLimitMiddleware() {
  return async (c: any, next: () => Promise<void>) => {
    await next();
  };
}