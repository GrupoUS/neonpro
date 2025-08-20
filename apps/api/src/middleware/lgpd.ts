import type { MiddlewareHandler } from 'hono';

export const lgpdMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    // Add LGPD compliance headers
    c.res.headers.set('x-lgpd-compliant', 'true');
    
    await next();
  };
};