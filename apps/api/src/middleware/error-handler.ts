/**
 * Global error handler for Hono applications
 * Provides healthcare-compliant error handling with LGPD compliance
 */

import { Context } from 'hono';

export function errorHandler() {
  return async (c: Context, next: () => Promise<void>) => {
    try {
      await next();
    } catch (error) {
      console.error('Global error handler caught:', error);
      
      // Return healthcare-compliant error response
      return c.json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' 
          ? (error as Error).message 
          : 'An unexpected error occurred',
        requestId: c.get('requestId'),
        timestamp: new Date().toISOString(),
      }, 500);
    }
  };
}