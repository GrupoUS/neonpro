/**
 * Error Tracking Configuration for NeonPro API
 *
 * Configures Sentry and OpenTelemetry for comprehensive error tracking
 * with healthcare-specific data protection and LGPD compliance.
 */

import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus'
import { Resource } from '@opentelemetry/resources'
import { NodeSDK } from '@opentelemetry/sdk-node'
import {
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions'
import * as Sentry from '@sentry/node'

// Environment configuration
const isProduction = process.env.NODE_ENV === 'production'
const sentryDsn = process.env.SENTRY_DSN
const openTelemetryEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT
const serviceName = 'neonpro-api'
const serviceVersion = process.env.npm_package_version || '1.0.0'

/**
 * Initialize Sentry with healthcare-specific configuration
 */
export function initializeSentry(): void {
  if (!sentryDsn) {
    console.warn(
      'SENTRY_DSN not configured - error tracking will use fallback methods',
    )
    return
  }

  Sentry.init({
    dsn: sentryDsn,
    environment: process.env.NODE_ENV || 'development',
    release: serviceVersion,

    // Sample rate configuration
    sampleRate: isProduction ? 0.1 : 1.0,
    tracesSampleRate: isProduction ? 0.01 : 0.1,
    profilesSampleRate: isProduction ? 0.01 : 0.1,

    // Healthcare compliance settings
    beforeSend(event) {
      // Remove sensitive healthcare data before sending to Sentry
      if (event.extra) {
        delete event.extra.patientData
        delete event.extra.personalInfo
        delete event.extra.cpf
        delete event.extra.healthData
      }

      if (event.contexts?.trace?.data) {
        const _data = event.contexts.trace.data
        Object.keys(data).forEach(key => {
          if (
            key.toLowerCase().includes('patient') ||
            key.toLowerCase().includes('cpf') ||
            key.toLowerCase().includes('health')
          ) {
            delete data[key]
          }
        })
      }

      return event
    },

    // Integrations
    integrations: [
      Sentry.httpIntegration(),
      Sentry.nativeNodeFetchIntegration(),
      Sentry.nodeContextIntegration(),
      ...(isProduction ? [Sentry.spotlightIntegration()] : []),
    ],

    // Performance monitoring
    enableTracing: true,

    // Security settings for healthcare
    sendDefaultPii: false,
    beforeBreadcrumb(breadcrumb) {
      // Filter out sensitive data from breadcrumbs
      if (breadcrumb.data) {
        Object.keys(breadcrumb.data).forEach(key => {
          if (
            key.toLowerCase().includes('password') ||
            key.toLowerCase().includes('token') ||
            key.toLowerCase().includes('cpf') ||
            key.toLowerCase().includes('patient')
          ) {
            breadcrumb.data![key] = '[Redacted]'
          }
        })
      }
      return breadcrumb
    },
  })
}

/**
 * Initialize OpenTelemetry with healthcare-specific configuration
 */
export function initializeOpenTelemetry(): NodeSDK {
  // Prometheus metrics exporter
  const prometheusExporter = new PrometheusExporter({
    port: 9464,
    preventServerStart: true, // We'll start it manually if needed
  })

  const sdk = new NodeSDK({
    resource: new Resource({
      [SEMRESATTRS_SERVICE_NAME]: serviceName,
      [SEMRESATTRS_SERVICE_VERSION]: serviceVersion,
      'service.namespace': 'neonpro',
      'service.instance.id': process.env.HOSTNAME || 'unknown',
      'deployment.environment': process.env.NODE_ENV || 'development',
      'healthcare.compliance': 'lgpd-enabled',
      'healthcare.region': 'brazil',
    }),

    instrumentations: [
      getNodeAutoInstrumentations({
        // Disable instrumentations that might capture sensitive data
        '@opentelemetry/instrumentation-fs': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-dns': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-net': {
          enabled: false,
        },

        // Configure HTTP instrumentation to redact sensitive headers
        '@opentelemetry/instrumentation-http': {
          enabled: true,
          requestHook: (_span, request: any) => {
            // Remove sensitive headers from tracing
            if (request?.headers) {
              delete (request.headers as any).authorization
              delete (request.headers as any).cookie
              delete (request.headers as any)['x-api-key']
            }
          },
          responseHook: (span, response) => {
            // Ensure no sensitive data in response headers
            if (response.headers) {
              delete response.headers['set-cookie']
            }
          },
        },

        // Express instrumentation for route tracking
        '@opentelemetry/instrumentation-express': {
          enabled: true,
          ignoreLayers: [
            // Ignore middleware that might process sensitive data
            'middleware - bodyParser',
            'middleware - cookieParser',
          ],
        },
      }),
    ],

    metricReader: prometheusExporter,

    // Tracing configuration
    traceExporter: openTelemetryEndpoint ? undefined : undefined, // Use default console exporter in dev
  })

  return sdk
}

/**
 * Healthcare-specific error context extractor
 */
export interface HealthcareErrorContext {
  clinicId?: string
  _userId?: string
  userRole?: string
  requestId?: string
  endpoint?: string
  method?: string
  timestamp?: Date
  severity?: 'low' | 'medium' | 'high' | 'critical'
  lgpdCompliant?: boolean
}

/**
 * Extract safe context from healthcare requests
 */
export function extractHealthcareContext(
  request: any,
  additionalContext?: Record<string, any>,
): HealthcareErrorContext {
  const context: HealthcareErrorContext = {
    requestId: request?.headers?.['x-request-id'] ||
      request?.headers?.['x-trace-id'] ||
      undefined,
    endpoint: request?.url ? sanitizeUrl(request.url) : undefined,
    method: request?.method,
    timestamp: new Date(),
    lgpdCompliant: true,
  }

  // Extract clinic context if available (from JWT or headers)
  if (request?.user) {
    ;(context as any).clinicId = request.user.clinicId
    ;(context as any).userId = request.user.id
    context.userRole = request.user.role
  }

  // Add additional non-sensitive context
  if (additionalContext) {
    Object.keys(additionalContext).forEach(key => {
      if (
        !key.toLowerCase().includes('patient') &&
        !key.toLowerCase().includes('cpf') &&
        !key.toLowerCase().includes('password') &&
        !key.toLowerCase().includes('token')
      ) {
        ;(context as any)[key] = additionalContext[key]
      }
    })
  }

  return context
}

/**
 * Sanitize URL by removing sensitive query parameters
 */
function sanitizeUrl(url: string): string {
  try {
    const urlObj = new URL(url, 'http://localhost')

    // Remove sensitive query parameters
    const sensitiveParams = [
      'token',
      'cpf',
      'patient_id',
      'health_data',
      'password',
    ]
    sensitiveParams.forEach(param => {
      urlObj.searchParams.delete(param)
    })

    return urlObj.pathname + (urlObj.search || '')
  } catch {
    // If URL parsing fails, just return the path part
    return url.split('?')[0]
  }
}

/**
 * Error tracking configuration object
 */
export const errorTrackingConfig = {
  sentry: {
    enabled: !!sentryDsn,
    dsn: sentryDsn,
    environment: process.env.NODE_ENV || 'development',
    release: serviceVersion,
  },
  openTelemetry: {
    enabled: true,
    serviceName,
    serviceVersion,
    endpoint: openTelemetryEndpoint,
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
} as const
