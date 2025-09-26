/**
 * Browser-Compatible Error Tracking Configuration for NeonPro API
 *
 * Provides browser-compatible Sentry configuration that avoids Node.js specific modules
 * while maintaining healthcare-specific features and LGPD compliance.
 */

import * as Sentry from '@sentry/browser'

// Environment configuration
const isProduction = process.env.NODE_ENV === 'production'
const sentryDsn = process.env.SENTRY_DSN
const serviceName = 'neonpro-api'
const serviceVersion = process.env.npm_package_version || '1.0.0'

/**
 * Initialize Sentry with healthcare-specific configuration for browser environment
 */
export function initializeSentryBrowser(): void {
  if (!sentryDsn) {
    console.warn(
      'SENTRY_DSN not configured - browser error tracking will use fallback methods',
    )
    return
  }

  try {
    Sentry.init({
      dsn: sentryDsn,
      environment: process.env.NODE_ENV || 'development',
      release: serviceVersion,

      // Sample rate configuration
      sampleRate: isProduction ? 0.1 : 1.0,
      profilesSampleRate: isProduction ? 0.01 : 0.1,

      // Healthcare compliance settings
      beforeSend(event) {
        // Remove sensitive healthcare data before sending to Sentry
        if (event.extra) {
          delete event.extra.patientData
          delete event.extra.personalInfo
          delete event.extra.cpf
          delete event.extra.healthData
          delete event.extra.jwt
          delete event.extra.session
        }

        if (event.request?.url) {
          // Remove sensitive query parameters from browser URL
          try {
            const url = new URL(event.request.url)
            const sensitiveParams = [
              'token',
              'cpf',
              'patient_id',
              'health_data',
              'password',
              'auth',
            ]
            sensitiveParams.forEach(param => {
              url.searchParams.delete(param)
            })
            event.request.url = url.toString()
          } catch (error) {
            // URL parsing failed, use original URL
            console.warn('Failed to sanitize browser URL:', error)
          }
        }

        return event
      },

      // Browser-specific integrations
      integrations: [
        Sentry.browserTracingIntegration({
          requestInterceptor: (request) => {
            // Remove sensitive headers from browser requests
            if (request.headers) {
              delete request.headers.authorization
              delete request.headers.cookie
              delete request.headers['x-api-key']
            }
            return request
          },
        }),
        Sentry.replayIntegration({
          // Capture console replays with error context
          maskAllText: true,
          blockAllMedia: false,
          networkDetailAllowUrls: [],
        }),
      ],

      // Performance monitoring for browser
      replaysSessionSampleRate: isProduction ? 0.1 : 1.0,
      replaysOnErrorSampleRate: isProduction ? 1.0 : 1.0,

      // Security settings for healthcare
      sendDefaultPii: false,
      ignoreErrors: [
        // Ignore common browser errors
        'ResizeObserver loop limit exceeded',
        'Network request failed',
        'Non-Error promise rejection captured',
      ],
      beforeBreadcrumb(breadcrumb) {
        // Filter out sensitive data from browser breadcrumbs
        if (breadcrumb.data) {
          const sanitizedData = { ...breadcrumb.data }
          
          // Remove sensitive fields
          const sensitiveFields = [
            'password',
            'token',
            'auth',
            'jwt',
            'session',
            'cpf',
            'patient',
            'credit_card',
            'cvv',
            'expiry',
          ]
          
          sensitiveFields.forEach(field => {
            if (field in sanitizedData) {
              ;(sanitizedData as any)[field] = '[Redacted]'
            }
          })
          
          breadcrumb.data = sanitizedData
        }
        return breadcrumb
      },
    })

    console.warn('✅ Browser Sentry initialized successfully')
  } catch (error) {
    console.error('❌ Failed to initialize browser Sentry:', error)
  }
}

/**
 * Browser-compatible error tracking configuration
 */
export const browserErrorTrackingConfig = {
  sentry: {
    enabled: !!sentryDsn,
    dsn: sentryDsn,
    environment: process.env.NODE_ENV || 'development',
    release: serviceVersion,
    sampleRate: isProduction ? 0.1 : 1.0,
    tracesSampleRate: isProduction ? 0.01 : 0.1,
  },
  healthcare: {
    lgpdCompliant: true,
    dataMasking: true,
    auditLogging: true,
    region: 'brazil',
  },
  performance: {
    sampleRate: isProduction ? 0.1 : 1.0,
    tracesSampleRate: isProduction ? 0.01 : 0.1,
    metricsEnabled: true,
  },
}

/**
 * Browser-safe error capture function
 */
export function captureBrowserError(
  error: Error | string,
  context?: Record<string, unknown>,
): void {
  if (!browserErrorTrackingConfig.sentry.enabled) {
    console.warn('Sentry not enabled - logging error locally')
    console.error('Browser error:', error, context)
    return
  }

  try {
    Sentry.captureException(error, {
      contexts: {
        browser: {
          userAgent: navigator.userAgent,
          url: typeof window !== 'undefined' ? window.location.href : undefined,
          timestamp: new Date().toISOString(),
          ...context,
        },
      },
    })
  } catch (captureError) {
    console.error('Failed to capture browser error:', captureError)
  }
}

/**
 * Browser-safe message capture function
 */
export function captureBrowserMessage(
  message: string,
  level: 'info' | 'warn' | 'error' = 'info',
  context?: Record<string, unknown>,
): void {
  if (!browserErrorTrackingConfig.sentry.enabled) {
    console[level](message, context)
    return
  }

  try {
    Sentry.captureMessage(message, level, {
      contexts: {
        browser: {
          userAgent: navigator.userAgent,
          url: typeof window !== 'undefined' ? window.location.href : undefined,
          timestamp: new Date().toISOString(),
          ...context,
        },
      },
    })
  } catch (captureError) {
    console[level](message, context)
    console.error('Failed to capture browser message:', captureError)
  }
}

/**
 * Set user context for browser error tracking (compliant with LGPD)
 */
export function setBrowserUserContext(user: {
  id: string
  email?: string
  role?: string
}): void {
  if (!browserErrorTrackingConfig.sentry.enabled) return

  try {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.id, // Use ID as username to avoid PII
      role: user.role,
    })
  } catch (error) {
    console.warn('Failed to set browser user context:', error)
  }
}

/**
 * Clear user context for privacy compliance
 */
export function clearBrowserUserContext(): void {
  try {
    Sentry.setUser(null)
  } catch (error) {
    console.warn('Failed to clear browser user context:', error)
  }
}

/**
 * Health check for browser error tracking
 */
export function getBrowserErrorTrackingHealth() {
  return {
    status: browserErrorTrackingConfig.sentry.enabled ? 'enabled' : 'disabled',
    config: browserErrorTrackingConfig,
    environment: browserErrorTrackingConfig.sentry.environment,
  }
}