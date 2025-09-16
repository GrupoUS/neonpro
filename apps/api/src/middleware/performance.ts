/**
 * Performance middleware for healthcare APIs
 * Optimized for Hono with compression, caching, and monitoring
 */

import { Hono } from 'hono';
import { cache } from 'hono/cache';
import { compress } from 'hono/compress';
import { cors } from 'hono/cors';
import { etag } from 'hono/etag';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';

export const performanceMiddleware = (app: Hono) => {
  // Security headers for healthcare compliance
  app.use(
    '*',
    secureHeaders({
      contentSecurityPolicy: {
        defaultSrc: ['\'self\''],
        scriptSrc: ['\'self\'', '\'unsafe-inline\''],
        styleSrc: ['\'self\'', '\'unsafe-inline\''],
        imgSrc: ['\'self\'', 'data:', 'https:'],
        connectSrc: ['\'self\'', 'https://api.supabase.co'],
      },
      crossOriginEmbedderPolicy: false, // Disable for Supabase compatibility
    }),
  );

  // CORS configuration for healthcare applications
  app.use(
    '*',
    cors({
      origin: origin => {
        const allowedOrigins = [
          'http://localhost:3000',
          'http://localhost:5173',
          'https://neonpro.vercel.app',
          process.env.FRONTEND_URL,
        ].filter(Boolean);

        return allowedOrigins.includes(origin) || !origin;
      },
      allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: true,
    }),
  );

  // Compression for better performance
  app.use(
    '*',
    compress({
      encoding: 'gzip',
    }),
  );

  // ETag for efficient caching
  app.use('*', etag());

  // Structured logging for healthcare compliance
  app.use(
    '*',
    logger((message, ...rest) => {
      const logEntry = {
        timestamp: new Date().toISOString(),
        message,
        level: 'info',
        service: 'neonpro-api',
        environment: process.env.NODE_ENV || 'development',
        ...rest,
      };

      console.log(JSON.stringify(logEntry));
    }),
  );

  // Performance monitoring middleware
  app.use('*', async (c, next) => {
    const start = Date.now();

    await next();

    const duration = Date.now() - start;

    // Add performance headers
    c.header('X-Response-Time', `${duration}ms`);
    c.header('X-Powered-By', 'NeonPro Healthcare API');

    // Log slow requests (>1000ms for healthcare APIs)
    if (duration > 1000) {
      console.warn(JSON.stringify({
        type: 'slow_request',
        method: c.req.method,
        path: c.req.path,
        duration,
        timestamp: new Date().toISOString(),
      }));
    }
  });

  // Cache middleware for read-heavy healthcare operations
  app.use(
    '/api/patients/*',
    cache({
      cacheName: 'patients-cache',
      cacheControl: 'private, max-age=300', // 5 minutes for patient data
      vary: ['Authorization', 'X-Clinic-ID'],
    }),
  );

  app.use(
    '/api/appointments/*',
    cache({
      cacheName: 'appointments-cache',
      cacheControl: 'private, max-age=60', // 1 minute for time-sensitive data
      vary: ['Authorization', 'X-Clinic-ID'],
    }),
  );

  app.use(
    '/api/professionals/*',
    cache({
      cacheName: 'professionals-cache',
      cacheControl: 'private, max-age=600', // 10 minutes for professional data
      vary: ['Authorization', 'X-Clinic-ID'],
    }),
  );

  // Rate limiting middleware for API protection
  const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

  app.use('*', async (c, next) => {
    const clientId = c.req.header('x-client-id')
      || c.req.header('x-forwarded-for')
      || 'anonymous';

    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxRequests = 1000; // Generous limit for healthcare APIs

    const clientData = rateLimitMap.get(clientId);

    if (!clientData || now > clientData.resetTime) {
      rateLimitMap.set(clientId, {
        count: 1,
        resetTime: now + windowMs,
      });
    } else {
      clientData.count++;

      if (clientData.count > maxRequests) {
        return c.json({
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((clientData.resetTime - now) / 1000),
        }, 429);
      }
    }

    // Add rate limit headers
    const remaining = Math.max(0, maxRequests - (clientData?.count || 0));
    c.header('X-RateLimit-Limit', maxRequests.toString());
    c.header('X-RateLimit-Remaining', remaining.toString());
    c.header('X-RateLimit-Reset', Math.ceil((clientData?.resetTime || now) / 1000).toString());

    await next();
  });

  // Health check endpoint
  app.get('/health', c => {
    return c.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'neonpro-api',
      version: process.env.npm_package_version || '1.0.0',
    });
  });
};

// Error handling middleware
export const errorHandler = (app: Hono) => {
  app.onError((err, c) => {
    console.error(JSON.stringify({
      type: 'api_error',
      error: err.message,
      stack: err.stack,
      method: c.req.method,
      path: c.req.path,
      timestamp: new Date().toISOString(),
    }));

    // Don't expose internal errors in production
    const isDevelopment = process.env.NODE_ENV === 'development';

    return c.json({
      error: 'Internal server error',
      message: isDevelopment ? err.message : 'Something went wrong',
      ...(isDevelopment && { stack: err.stack }),
    }, 500);
  });

  // 404 handler
  app.notFound(c => {
    return c.json({
      error: 'Not found',
      message: `Route ${c.req.method} ${c.req.path} not found`,
    }, 404);
  });
};
