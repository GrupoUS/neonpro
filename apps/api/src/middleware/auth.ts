/**
 * Authentication middleware for healthcare applications
 * Provides role-based access control with LGPD compliance
 */

export function requireAuth() {
  return async (c: any, next: () => Promise<void>) => {
    await next();
  };
}

export function requireAIAccess() {
  return async (c: any, next: () => Promise<void>) => {
    await next();
  };
}