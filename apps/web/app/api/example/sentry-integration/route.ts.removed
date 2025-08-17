// Example API route with Sentry integration
// This demonstrates how to use the monitoring utilities

import * as Sentry from '@sentry/nextjs';
import { type NextRequest, NextResponse } from 'next/server';
import {
  reportError,
  trackBusinessMetric,
  trackUserAction,
  withErrorMonitoring,
} from '@/lib/monitoring';

// Example of a protected API route with error monitoring
export const POST = withErrorMonitoring(async (request: NextRequest) => {
  try {
    const body = await request.json();

    // Track user action
    trackUserAction('api_call', {
      endpoint: '/api/example/sentry-integration',
      method: 'POST',
      timestamp: new Date().toISOString(),
    });

    // Simulate some business logic that might fail
    if (body.simulateError) {
      throw new Error('Simulated error for testing Sentry integration');
    }

    // Track a business metric
    trackBusinessMetric('api_calls_total', 1, {
      endpoint: 'sentry-integration',
      method: 'POST',
    });

    // Return successful response
    return NextResponse.json({
      success: true,
      message: 'Request processed successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Manual error reporting with custom context
    reportError(error as Error, {
      user: {
        id: 'user123', // You would get this from session/auth
        email: 'user@example.com',
        clinicId: 'clinic123',
      },
      tags: {
        endpoint: 'sentry-integration',
        method: 'POST',
      },
      extra: {
        requestBody: JSON.stringify(request.body),
        timestamp: new Date().toISOString(),
      },
      level: 'error',
    });

    // Re-throw to let withErrorMonitoring handle the response
    throw error;
  }
});

// Example of manual Sentry usage in an API route
export const GET = async (_request: NextRequest) => {
  return Sentry.withServerSideSentry(async () => {
    // Add breadcrumb for debugging
    Sentry.addBreadcrumb({
      message: 'Processing GET request to sentry-integration',
      level: 'info',
      category: 'api',
    });

    // Simulate some work
    const data = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      sentryTraceId: Sentry.getCurrentScope().getTransaction()?.traceId,
    };

    return NextResponse.json(data);
  });
};
