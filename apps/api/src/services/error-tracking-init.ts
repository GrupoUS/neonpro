/**
 * Error Tracking Initialization for NeonPro API
 *
 * Sets up Sentry and OpenTelemetry error tracking with healthcare
 * compliance and LGPD data protection.
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  errorTrackingConfig,
  initializeOpenTelemetry,
  initializeSentry,
} from '../config/error-tracking';
import { setupGlobalErrorHandlers } from '../middleware/error-tracking';

let telemetrySDK: NodeSDK | null = null;
let isInitialized = false;

/**
 * Initialize all error tracking systems
 */
export async function initializeErrorTracking(): Promise<void> {
  if (isInitialized) {
    console.warn('Error tracking already initialized');
    return;
  }

  try {
    console.log('Initializing error tracking systems...');

    // Initialize Sentry first
    if (errorTrackingConfig.sentry.enabled) {
      console.log('Initializing Sentry error tracking...');
      initializeSentry();
      console.log('✅ Sentry initialized successfully');
    } else {
      console.warn('⚠️ Sentry not configured - using fallback error handling');
    }

    // Initialize OpenTelemetry
    if (errorTrackingConfig.openTelemetry.enabled) {
      console.log('Initializing OpenTelemetry...');
      telemetrySDK = initializeOpenTelemetry();
      telemetrySDK.start();
      console.log('✅ OpenTelemetry initialized successfully');
    }

    // Setup global error handlers
    setupGlobalErrorHandlers();
    console.log('✅ Global error handlers configured');

    // Mark as initialized
    isInitialized = true;

    console.log('🚀 Error tracking initialization complete');
    console.log('📊 Configuration:', {
      sentry: errorTrackingConfig.sentry.enabled,
      openTelemetry: errorTrackingConfig.openTelemetry.enabled,
      environment: errorTrackingConfig.sentry.environment,
      healthcare: errorTrackingConfig.healthcare,
    });
  } catch {
    console.error('❌ Failed to initialize error tracking:', error);

    // Even if initialization fails, we should continue with the application
    // but log the failure for monitoring
    if (
      typeof process !== 'undefined'
      && process.env.NODE_ENV === 'production'
    ) {
      console.error(
        'Error tracking initialization failure in production - this should be investigated',
      );
    }

    throw error;
  }
}

/**
 * Shutdown error tracking systems gracefully
 */
export async function shutdownErrorTracking(): Promise<void> {
  if (!isInitialized) {
    return;
  }

  try {
    console.log('Shutting down error tracking systems...');

    // Shutdown OpenTelemetry
    if (telemetrySDK) {
      await telemetrySDK.shutdown();
      telemetrySDK = null;
      console.log('✅ OpenTelemetry shutdown complete');
    }

    // Sentry doesn't require explicit shutdown, but we can flush remaining events
    const { close: sentryClose } = await import('@sentry/node');
    await sentryClose(2000); // Wait up to 2 seconds for events to be sent
    console.log('✅ Sentry shutdown complete');

    isInitialized = false;
    console.log('🏁 Error tracking shutdown complete');
  } catch {
    console.error('❌ Error during error tracking shutdown:', error);
  }
}

/**
 * Health check for error tracking systems
 */
export function getErrorTrackingHealth(): {
  status: 'healthy' | 'degraded' | 'unhealthy';
  systems: {
    sentry: 'enabled' | 'disabled' | 'error';
    openTelemetry: 'enabled' | 'disabled' | 'error';
    globalHandlers: 'enabled' | 'disabled';
  };
  config: typeof errorTrackingConfig;
} {
  return {
    status: isInitialized ? 'healthy' : 'unhealthy',
    systems: {
      sentry: errorTrackingConfig.sentry.enabled ? 'enabled' : 'disabled',
      openTelemetry: errorTrackingConfig.openTelemetry.enabled
        ? 'enabled'
        : 'disabled',
      globalHandlers: isInitialized ? 'enabled' : 'disabled',
    },
    config: errorTrackingConfig,
  };
}

/**
 * Get error tracking metrics
 */
export function getErrorTrackingMetrics(): {
  initialized: boolean;
  uptime: number;
  environment: string;
  serviceName: string;
  serviceVersion: string;
} {
  return {
    initialized: isInitialized,
    uptime: process.uptime(),
    environment: errorTrackingConfig.sentry.environment,
    serviceName: errorTrackingConfig.openTelemetry.serviceName,
    serviceVersion: errorTrackingConfig.openTelemetry.serviceVersion,
  };
}

/**
 * Test error tracking functionality
 */
export async function testErrorTracking(): Promise<{
  sentry: boolean;
  openTelemetry: boolean;
  globalHandlers: boolean;
}> {
  const results = {
    sentry: false,
    openTelemetry: false,
    globalHandlers: false,
  };

  try {
    // Test Sentry
    if (errorTrackingConfig.sentry.enabled) {
      const { captureMessage } = await import('@sentry/node');
      captureMessage('Error tracking test - Sentry', 'info');
      results.sentry = true;
    }

    // Test OpenTelemetry
    if (errorTrackingConfig.openTelemetry.enabled && telemetrySDK) {
      const { trace } = await import('@opentelemetry/api');
      const tracer = trace.getTracer('neonpro-api-test');
      const span = tracer.startSpan('error-tracking-test');
      span.setAttributes({ 'test.type': 'error-tracking' });
      span.end();
      results.openTelemetry = true;
    }

    // Global handlers are always available once initialized
    results.globalHandlers = isInitialized;
  } catch {
    console.error('Error tracking test failed:', error);
  }

  return results;
}

/**
 * Force error tracking for testing purposes
 */
export async function forceErrorTracking(
  message: string,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'low',
): Promise<void> {
  if (!isInitialized) {
    throw new Error('Error tracking not initialized');
  }

  const testError = new Error(`Test Error: ${message}`);
  testError.name = 'TestError';

  // Send to Sentry
  if (errorTrackingConfig.sentry.enabled) {
    const {
      withScope,
      captureException,
      _setLevel,
    } = await import('@sentry/node');
    withScope(scope => {
      scope.setTag('test', true);
      scope.setTag('severity', severity);
      scope.setLevel(severity === 'critical' ? 'fatal' : (severity as any));
      captureException(testError);
    });
  }

  // Send to OpenTelemetry
  if (errorTrackingConfig.openTelemetry.enabled) {
    const { trace } = await import('@opentelemetry/api');
    const tracer = trace.getTracer('neonpro-api-test');
    const span = tracer.startSpan('test-error');
    span.recordException(testError);
    span.setAttributes({
      'test.forced': true,
      'test.severity': severity,
    });
    span.end();
  }

  console.log(
    `🧪 Forced error tracking test: ${message} (severity: ${severity})`,
  );
}

// Export the initialization status for other modules
export { isInitialized as errorTrackingInitialized };
