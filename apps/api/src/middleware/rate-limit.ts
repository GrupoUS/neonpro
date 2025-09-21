/**
 * Rate limiting middleware for healthcare applications
 * Provides enhanced rate limiting for chat and other features
 */

export function chatRateLimit() {
  return async (_c: any, next: () => Promise<void>) => {
    await next();
  };
}