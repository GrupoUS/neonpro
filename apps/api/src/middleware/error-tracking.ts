/**
 * Error Tracking Middleware
 *
 * Global error handlers and tracking setup for the API
 */

import { logger } from '../lib/logger';

/**
 * Setup global error handlers for unhandled errors
 */
export function setupGlobalErrorHandlers(): void {
  // Handle uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception', {
      error: error.message,
      stack: error.stack,
      type: 'uncaughtException',
    });

    // In production, we might want to exit the process
    if (process.env.NODE_ENV === 'production') {
      console.error('Uncaught exception in production, exiting...');
      process.exit(1);
    }
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: unknown, _promise: Promise<unknown>) => {
    logger.error('Unhandled Promise Rejection', {
      reason: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
      type: 'unhandledRejection',
    });

    // In production, we might want to exit the process
    if (process.env.NODE_ENV === 'production') {
      console.error('Unhandled promise rejection in production, exiting...');
      process.exit(1);
    }
  });

  // Handle SIGTERM for graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('Received SIGTERM, shutting down gracefully...');
    process.exit(0);
  });

  // Handle SIGINT for graceful shutdown
  process.on('SIGINT', () => {
    logger.info('Received SIGINT, shutting down gracefully...');
    process.exit(0);
  });

  logger.info('Global error handlers configured');
}

/**
 * Error tracking middleware for Hono
 */
export function errorTrackingMiddleware() {
  return async (c: any, next: () => Promise<void>) => {
    try {
      await next();
    } catch (error) {
      // Log the error
      logger.error('Request error', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        path: c.req?.path,
        method: c.req?.method,
      });

      // Re-throw the error to be handled by the main error handler
      throw error;
    }
  };
}

/**
 * Global error handler for Express-style middleware
 */
export function globalErrorHandler(error: Error, req?: any, res?: any, next?: any): void {
  logger.error('Global error handler', {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    url: req?.url,
    method: req?.method,
  });

  if (res && !res.headersSent) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development'
        ? error.message
        : 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    });
  }

  if (next) {
    next(error);
  }
}
