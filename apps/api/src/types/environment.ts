/**
 * Environment type definitions for NeonPro API
 *
 * This module defines TypeScript types for environment variables and context
 * used throughout the Hono application.
 */

export interface Environment {
  Bindings: {
    NODE_ENV?: string
    VERCEL_REGION?: string
    SUPABASE_URL?: string
    SUPABASE_ANON_KEY?: string
    SUPABASE_SERVICE_ROLE_KEY?: string
    DATABASE_URL?: string
    JWT_SECRET?: string
    CORS_ORIGIN?: string
    LOG_LEVEL?: string

    // Error tracking
    ERROR_TRACKING_PROVIDERS?: string
    SENTRY_DSN?: string
    ROLLBAR_ACCESS_TOKEN?: string
    LOGSNAG_API_TOKEN?: string
    CUSTOM_ERROR_WEBHOOK_URL?: string

    // Performance monitoring
    ENABLE_PERFORMANCE_MONITORING?: string
    PERFORMANCE_SAMPLE_RATE?: string
  }

  Variables: {
    requestId?: string
    startTime?: number
    _userId?: string
    userRole?: string
  }
}
