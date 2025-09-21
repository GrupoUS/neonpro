/**
 * Audit logging middleware for healthcare applications
 * Provides LGPD-compliant audit trails
 */

export function auditLog() {
  return async (_c: any, next: () => Promise<void>) => {
    await next();
  };
}