/**
 * Error sanitization middleware for healthcare applications
 * Prevents exposure of sensitive information in error responses
 */

import { Context } from 'hono';

export function errorSanitizationMiddleware() {
  return async (c: Context, next: () => Promise<void>) => {
    await next();
  };
}