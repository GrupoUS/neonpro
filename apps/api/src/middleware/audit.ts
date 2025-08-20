import type { MiddlewareHandler } from 'hono';

export const auditMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    // Add audit ID header for LGPD compliance
    const auditId = `audit-${Date.now()}-${Math.random().toString(36).substring(2)}`;
    c.res.headers.set('x-lgpd-audit-id', auditId);
    
    await next();
  };
};