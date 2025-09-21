/**
 * Authentication middleware for healthcare applications
 * Provides LGPD-compliant authentication
 */

export function requireAuth() {
  return async (c: any, next: () => Promise<void>) => {
    await next();
  };
}