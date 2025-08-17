// This file configures the initialization of Sentry on the server side
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100%
  // of the transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Define how likely errors are to be sent to Sentry.
  sampleRate: process.env.NODE_ENV === 'production' ? 0.5 : 1.0,

  // Set environment
  environment: process.env.NODE_ENV,

  // Set release version
  release: process.env.APP_VERSION || 'development',

  // Add server-specific integrations
  integrations: [
    // Add Node.js specific integrations
    Sentry.nodeProfilingIntegration(),
  ],

  // Add tags for server context
  initialScope: {
    tags: {
      component: 'server',
      feature: 'neonpro',
    },
  },

  // Enhanced error context for server
  beforeSend(event, _hint) {
    // Add server-specific context
    event.contexts = {
      ...event.contexts,
      server: {
        runtime: 'nodejs',
        version: process.version,
        platform: process.platform,
        arch: process.arch,
        env: process.env.NODE_ENV,
      },
    };

    // Filter out known non-critical errors
    if (process.env.NODE_ENV === 'production') {
      const errorMessage = event.exception?.values?.[0]?.value || '';

      // Skip database connection timeouts (these might be temporary)
      if (errorMessage.includes('connection timeout')) {
        return null;
      }

      // Skip rate limiting errors (expected behavior)
      if (errorMessage.includes('Too Many Requests')) {
        return null;
      }
    }

    return event;
  },

  // Server-specific options
  spotlight: process.env.NODE_ENV === 'development',

  // Debugging (only in development)
  debug: process.env.NODE_ENV === 'development',
});
