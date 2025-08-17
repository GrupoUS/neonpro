// This file configures the initialization of Sentry for edge runtime (middleware, edge API routes)
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100%
  // of the transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0, // Lower for edge runtime

  // Define how likely errors are to be sent to Sentry.
  sampleRate: process.env.NODE_ENV === 'production' ? 0.3 : 1.0,

  // Set environment
  environment: process.env.NODE_ENV,

  // Set release version
  release: process.env.APP_VERSION || 'development',

  // Add tags for edge runtime context
  initialScope: {
    tags: {
      component: 'edge',
      feature: 'neonpro',
    },
  },

  // Enhanced error context for edge runtime
  beforeSend(event, _hint) {
    // Add edge runtime specific context
    event.contexts = {
      ...event.contexts,
      runtime: {
        name: 'edge',
        version: 'next.js',
        env: process.env.NODE_ENV,
      },
    };

    // Filter out known edge runtime issues
    if (process.env.NODE_ENV === 'production') {
      const errorMessage = event.exception?.values?.[0]?.value || '';

      // Skip edge runtime limitations errors
      if (errorMessage.includes('Dynamic Code Evaluation')) {
        return null;
      }
    }

    return event;
  },

  // Edge runtime specific options
  // Note: Some integrations are not available in edge runtime
  integrations: [
    // Only basic integrations work in edge runtime
  ],

  // Minimal debugging for edge runtime
  debug: false,
});
