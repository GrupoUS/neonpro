// This file configures the initialization of Sentry on the browser/client side
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100%
  // of the transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Capture 100% of the sessions for session replay.
  // We recommend adjusting this value in production.
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Capture 100% of sessions with an error for session replay.
  replaysOnErrorSampleRate: 1.0,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional SDK configuration goes in here, for example:
      maskAllText: false, // Mask all text content for privacy
      blockAllMedia: false, // Block all media content (images, videos, etc.)
    }),
    Sentry.browserTracingIntegration({
      // Set up automatic route change tracking in Next.js App Router:
      instrumentNavigation: true,
      instrumentPageLoad: true,
    }),
    Sentry.feedbackIntegration({
      // Additional SDK configuration goes in here, for example:
      colorScheme: 'system',
    }),
  ],

  // Define how likely errors are to be sent to Sentry. This needs to be a number between 0 and 1.
  // Default: 1.0 (100% of errors are sent) → We recommend lowering this in production.
  sampleRate: process.env.NODE_ENV === 'production' ? 0.5 : 1.0,

  // Set environment
  environment: process.env.NODE_ENV,

  // Set release version
  release: process.env.NEXT_PUBLIC_APP_VERSION || 'development',

  // Add tags
  initialScope: {
    tags: {
      component: 'client',
      feature: 'neonpro',
    },
  },

  // Enhanced error context
  beforeSend(event, _hint) {
    // Filter out non-critical errors in production
    if (process.env.NODE_ENV === 'production') {
      // Skip ResizeObserver and other benign errors
      if (event.exception?.values?.[0]?.value?.includes('ResizeObserver')) {
        return null;
      }

      // Skip network errors that might be user-related
      if (event.exception?.values?.[0]?.value?.includes('Failed to fetch')) {
        return null;
      }
    }

    // Add additional context
    if (typeof window !== 'undefined') {
      event.contexts = {
        ...event.contexts,
        browser: {
          userAgent: window.navigator.userAgent,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
          url: window.location.href,
        },
      };
    }

    return event;
  },

  // Debugging (only in development)
  debug: process.env.NODE_ENV === 'development',
});
