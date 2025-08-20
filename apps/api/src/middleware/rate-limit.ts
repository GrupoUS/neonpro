import type { MiddlewareHandler } from 'hono';

export const rateLimitMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    // Simple rate limiting placeholder
    c.res.headers.set('x-ratelimit-limit', '100');
    c.res.headers.set('x-ratelimit-remaining', '99');
    
    await next();
  };
};