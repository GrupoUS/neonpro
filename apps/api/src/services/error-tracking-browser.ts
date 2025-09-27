/**
 * Browser-Compatible Error Tracking Initialization for NeonPro API
 *
 * Provides browser-compatible error tracking setup that avoids Node.js specific modules
 * while maintaining healthcare-specific features and LGPD compliance.
 */

import {
  browserErrorTrackingConfig,
  captureBrowserError,
  captureBrowserMessage,
  clearBrowserUserContext,
  getBrowserErrorTrackingHealth,
  initializeSentryBrowser,
  setBrowserUserContext,
} from '../config/error-tracking-browser'

let isInitialized = false

/**
 * Initialize browser error tracking systems
 */
export async function initializeBrowserErrorTracking(): Promise<void> {
  if (isInitialized) {
    console.warn('Browser error tracking already initialized')
    return
  }

  try {
    console.warn('🌐 Initializing browser error tracking systems...')

    // Initialize Sentry for browser
    if (browserErrorTrackingConfig.sentry.enabled) {
      console.warn('Initializing browser Sentry error tracking...')
      initializeSentryBrowser()
      console.warn('✅ Browser Sentry initialized successfully')
    } else {
      console.warn('⚠️ Browser Sentry not configured - using fallback error handling')
    }

    // Set up browser global error handlers
    setupBrowserGlobalHandlers()

    // Mark as initialized
    isInitialized = true

    console.warn('🚀 Browser error tracking initialization complete')
    console.warn('📊 Browser configuration:', {
      sentry: browserErrorTrackingConfig.sentry.enabled,
      environment: browserErrorTrackingConfig.sentry.environment,
      healthcare: browserErrorTrackingConfig.healthcare,
    })
  } catch (error) {
    console.error('❌ Failed to initialize browser error tracking:', error)

    // Even if initialization fails, we should continue with the application
    if (typeof window !== 'undefined' && window.location?.href) {
      console.error(
        'Browser error tracking initialization failure - continuing with local logging',
      )
    }

    // Initialize fallback error handling
    setupBrowserGlobalHandlers()
  }
}

/**
 * Setup browser global error handlers
 */
function setupBrowserGlobalHandlers(): void {
  // Handle uncaught errors
  window.addEventListener('error', event => {
    const error = event.error || event.message
    const context = {
      source: event.filename,
      line: event.lineno,
      column: event.colno,
      errorType: event.error?.name || 'UnknownError',
      isHandled: true,
    }
    captureBrowserError(error, context)
  })

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', event => {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason))
    const context = {
      promiseRejection: true,
      reason: event.reason,
      errorType: 'UnhandledPromiseRejection',
    }
    captureBrowserError(error, context)
  })

  // Handle network errors
  window.addEventListener('offline', () => {
    captureBrowserMessage('Network connection lost', 'warn', {
      event: 'offline',
      timestamp: new Date().toISOString(),
    })
  })

  window.addEventListener('online', () => {
    captureBrowserMessage('Network connection restored', 'info', {
      event: 'online',
      timestamp: new Date().toISOString(),
    })
  })
}

/**
 * Shutdown browser error tracking systems
 */
export async function shutdownBrowserErrorTracking(): Promise<void> {
  if (!isInitialized) {
    return
  }

  try {
    console.warn('🔄 Shutting down browser error tracking systems...')

    // Clear user context for privacy
    clearBrowserUserContext()
    console.warn('✅ Browser user context cleared for privacy compliance')

    isInitialized = false
    console.warn('🏁 Browser error tracking shutdown complete')
  } catch (error) {
    console.error('❌ Error during browser error tracking shutdown:', error)
  }
}

/**
 * Health check for browser error tracking systems
 */
export function getBrowserErrorTrackingSystemsHealth() {
  return {
    status: isInitialized ? 'healthy' : 'unhealthy',
    systems: {
      sentry: browserErrorTrackingConfig.sentry.enabled ? 'enabled' : 'disabled',
      globalHandlers: isInitialized ? 'enabled' : 'disabled',
    },
    config: browserErrorTrackingConfig,
  }
}

/**
 * Get error tracking metrics
 */
export function getBrowserErrorTrackingMetrics() {
  return {
    initialized: isInitialized,
    uptime: typeof performance !== 'undefined' ? performance.now() : 0,
    environment: browserErrorTrackingConfig.sentry.environment,
    serviceName: 'neonpro-api',
    serviceVersion: browserErrorTrackingConfig.sentry.release || '1.0.0',
  }
}

/**
 * Test browser error tracking functionality
 */
export async function testBrowserErrorTracking(): Promise<{
  sentry: boolean
  globalHandlers: boolean
}> {
  const results = {
    sentry: false,
    globalHandlers: false,
  }

  try {
    // Test Sentry
    if (browserErrorTrackingConfig.sentry.enabled) {
      captureBrowserMessage('Browser error tracking test - Sentry', 'info')
      results.sentry = true
    }

    // Global handlers are always available once initialized
    results.globalHandlers = isInitialized

    console.warn('🧪 Browser error tracking test completed:', results)
  } catch (error) {
    console.error('Browser error tracking test failed:', error)
  }

  return results
}

/**
 * Force error tracking for testing purposes
 */
export async function forceBrowserErrorTracking(
  message: string,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'low',
): Promise<void> {
  if (!isInitialized) {
    throw new Error('Browser error tracking not initialized')
  }

  const testError = new Error(`Test Error: ${message}`)
  testError.name = 'TestError'

  // Send to browser Sentry
  if (browserErrorTrackingConfig.sentry.enabled) {
    try {
      const { Severity } = await import('@sentry/browser')
      const normalizedSeverity = severity === 'critical'
        ? Severity.Fatal
        : Severity[
          severity.charAt(0).toUpperCase() +
          severity.slice(1).toLowerCase() as keyof typeof Severity
        ]
      captureBrowserError(testError)
      captureBrowserMessage(`Forced test: ${message}`, 'warn', {
        test: true,
        severity,
        forced: true,
      })
    } catch (captureError) {
      console.error('Failed to force browser error tracking:', captureError)
    }
  }

  console.warn(
    `🧪 Forced browser error tracking test: ${message} (severity: ${severity})`,
  )
}

/**
 * Set browser user context with sanitization (LGPD compliant)
 */
export function setSanitizedBrowserUserContext(user: {
  id: string
  email?: string
  role?: string
}): void {
  // Ensure user data is minimal and compliant
  const sanitizedUser = {
    id: user.id,
    role: user.role,
    // Don't include email to avoid PII - only store ID and role
  }

  setBrowserUserContext(sanitizedUser)
}

/**
 * Clear browser user context for privacy compliance
 */
export function clearBrowserUserContextForPrivacy(): void {
  clearBrowserUserContext()
}

/**
 * Export the initialization status for other modules
 */
export { isInitialized as browserErrorTrackingInitialized }

/**
 * Public error capture interface
 */
export const browserErrorCapture = {
  error: captureBrowserError,
  message: captureBrowserMessage,
  context: {
    setUser: setBrowserUserContext,
    clearUser: clearBrowserUserContextForPrivacy,
  },
}
