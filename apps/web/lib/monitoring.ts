// Sentry monitoring utilities for NeonPro
// Provides centralized error handling and monitoring functions

import * as Sentry from '@sentry/nextjs';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Enhanced error interface with additional context
 */
export interface MonitoringError extends Error {
  context?: Record<string, any>;
  tags?: Record<string, string>;
  level?: 'info' | 'warning' | 'error' | 'fatal';
  userId?: string;
  clinicId?: string;
}

/**
 * API Route error handler wrapper
 * Automatically captures errors and sends them to Sentry
 */
export function withErrorMonitoring<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>,
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      // Extract request info if available
      const request = args[0] as NextRequest;
      const requestInfo = {
        method: request?.method,
        url: request?.url,
        userAgent: request?.headers?.get('user-agent'),
        timestamp: new Date().toISOString(),
      };

      // Report to Sentry
      Sentry.withScope((scope) => {
        scope.setTag('type', 'api-error');
        scope.setContext('request', requestInfo);

        if (error instanceof Error) {
          scope.setLevel('error');
          Sentry.captureException(error);
        } else {
          scope.setLevel('error');
          Sentry.captureMessage(`API Error: ${String(error)}`);
        }
      });

      // Return appropriate error response
      return NextResponse.json(
        {
          error: 'Internal Server Error',
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      );
    }
  };
}

/**
 * Manual error reporting function
 * Use this to manually report errors with custom context
 */
export function reportError(
  error: Error | string,
  context?: {
    user?: { id: string; email?: string; clinicId?: string };
    tags?: Record<string, string>;
    extra?: Record<string, any>;
    level?: 'info' | 'warning' | 'error' | 'fatal';
  },
): void {
  Sentry.withScope((scope) => {
    // Set user context
    if (context?.user) {
      scope.setUser({
        id: context.user.id,
        email: context.user.email,
      });
      scope.setTag('clinicId', context.user.clinicId || 'unknown');
    }

    // Set custom tags
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }

    // Set extra context
    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setContext(key, value);
      });
    }

    // Set level
    scope.setLevel(context?.level || 'error');

    // Capture error or message
    if (error instanceof Error) {
      Sentry.captureException(error);
    } else {
      Sentry.captureMessage(String(error));
    }
  });
}

/**
 * Performance monitoring for critical operations
 */
export function withPerformanceMonitoring<T>(
  name: string,
  operation: () => Promise<T>,
): Promise<T> {
  const transaction = Sentry.startTransaction({
    op: 'function',
    name,
  });

  Sentry.getCurrentScope().setSpan(transaction);

  return operation()
    .then((result) => {
      transaction.setStatus('ok');
      return result;
    })
    .catch((error) => {
      transaction.setStatus('internal_error');
      Sentry.captureException(error);
      throw error;
    })
    .finally(() => {
      transaction.end();
    });
}

/**
 * Database operation monitoring
 * Tracks slow queries and database errors
 */
export function monitorDatabaseOperation<_T>(
  operation: string,
  query?: string,
) {
  return (
    _target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      const transaction = Sentry.startTransaction({
        op: 'db.query',
        name: operation,
      });

      try {
        const result = await originalMethod.apply(this, args);
        const duration = Date.now() - startTime;

        transaction.setStatus('ok');
        transaction.setData('duration', duration);

        // Log slow queries (>1s)
        if (duration > 1000) {
          Sentry.addBreadcrumb({
            message: `Slow database operation: ${operation}`,
            data: { duration, query },
            level: 'warning',
            category: 'database',
          });
        }

        return result;
      } catch (error) {
        transaction.setStatus('internal_error');

        Sentry.withScope((scope) => {
          scope.setTag('operation', operation);
          scope.setContext('database', {
            query: query || 'unknown',
            duration: Date.now() - startTime,
          });
          Sentry.captureException(error);
        });

        throw error;
      } finally {
        transaction.end();
      }
    };

    return descriptor;
  };
}

/**
 * User action tracking for important business operations
 */
export function trackUserAction(
  action: string,
  properties?: Record<string, any>,
): void {
  Sentry.addBreadcrumb({
    message: `User action: ${action}`,
    data: properties,
    level: 'info',
    category: 'user',
  });
}

/**
 * Business metric tracking
 */
export function trackBusinessMetric(
  metric: string,
  value: number,
  tags?: Record<string, string>,
): void {
  Sentry.metrics.gauge(metric, value, {
    tags: {
      ...tags,
      feature: 'neonpro',
    },
  });
}

/**
 * Auth error handler specifically for authentication issues
 */
export function reportAuthError(
  error: Error,
  context: {
    userId?: string;
    email?: string;
    provider?: string;
    operation?: string;
  },
): void {
  Sentry.withScope((scope) => {
    scope.setTag('errorType', 'authentication');
    scope.setTag('provider', context.provider || 'unknown');
    scope.setTag('operation', context.operation || 'unknown');

    if (context.userId) {
      scope.setUser({
        id: context.userId,
        email: context.email,
      });
    }

    scope.setLevel('warning');
    Sentry.captureException(error);
  });
}
