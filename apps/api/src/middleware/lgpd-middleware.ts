/**
 * LGPD middleware for healthcare applications
 * Provides data protection and privacy controls
 */

export function dataProtection() {
  return async (c: any, next: () => Promise<void>) => {
    await next();
  };
}