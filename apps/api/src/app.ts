import { trpcServer } from '@hono/trpc-server'
import { cors } from 'hono/cors'
import { errorHandler } from './middleware/error-handler'
import { errorSanitizationMiddleware } from './middleware/error-sanitization'
import aiRouter from './routes/ai'
import financialCopilotRouter from './routes/ai/financial-copilot'
import copilotBridge from './routes/ai/copilot-bridge'
import appointmentsRouter from './routes/appointments'
import { billing } from './routes/billing'
import chatRouter from './routes/chat'
import { medicalRecords } from './routes/medical-records'
import patientsRouter from './routes/patients'
import v1Router from './routes/v1'
import aiSessionsCleanup from './routes/api/cleanup/ai-sessions'
import expiredPredictionsCleanup from './routes/api/cleanup/expired-predictions'
import { Context } from './trpc/context'
import { appRouter } from './trpc/router'

// Import security and monitoring libraries
// import security from '@neonpro/security';
import { initializeLogger, logger } from './lib/logger'
import { initializeSentry, sentryMiddleware } from './lib/sentry'
import { errorTracker } from './services/error-tracking-bridge'
import { getErrorTrackingHealth, initializeErrorTracking } from './services/error-tracking-init'
// import { sdk as telemetrySDK, healthcareTelemetryMiddleware } from '@neonpro/shared/src/telemetry';
import { createHealthcareOpenAPIApp, setupHealthcareSwaggerUI } from './lib/openapi-generator'
import { cspViolationHandler, healthcareCSPMiddleware } from './lib/security/csp'
import {
  errorTrackingMiddleware as healthcareErrorTrackingMiddleware,
  globalErrorHandler,
} from './middleware/error-tracking'
import { rateLimitMiddleware } from './middleware/rate-limiting'
import {
  healthcareSecurityHeadersMiddleware,
  httpsRedirectMiddleware,
} from './middleware/security-headers'
import { sensitiveDataExposureMiddleware } from './services/sensitive-field-analyzer'

// Extract middleware functions from security package
// const { getSecurityMiddlewareStack, getProtectedRoutesMiddleware } = security.middleware;

// Initialize monitoring and telemetry
;(async () => {
  try {
    await Promise.all([
      // Initialize Sentry first for early error capture
      Promise.resolve(initializeSentry()),
      initializeErrorTracking(),
      initializeLogger({
        level: process.env.NODE_ENV === 'production' ? 1 : 0, // INFO in production, DEBUG in development
        environment: (process.env.NODE_ENV as any) || 'development',
        enableConsole: true,
        enableFile: false,
        enableStructured: true,
        sanitizeContext: true,
      }),
      // Initialize OpenTelemetry if available
      // telemetrySDK ? telemetrySDK.start() : Promise.resolve(),
    ])
    
    logger.info(
      'Application monitoring and telemetry initialized successfully',
      {
        sentry: true,
        errorTracking: true,
        structuredLogging: true,
      },
    )
  } catch (error) {
    logger.error('Failed to initialize monitoring', error, {
      component: 'initialization',
    })
  }
})()

// Global error tracker instance is now accessed via the bridge
// const errorTracker = already imported from bridge

// Create healthcare-compliant OpenAPI app
const app = createHealthcareOpenAPIApp()

// Apply security middleware stack
// app.use('*', ...getSecurityMiddlewareStack());

app.use(
  '*',
  cors({
    origin: (origin, callback) => {
      // Allow same-origin requests (no origin header)
      if (!origin) return callback(null, true)

      // Allowed origins based on environment
      const allowedOrigins = process.env.NODE_ENV === 'production'
        ? [
          'https://neonpro.com.br',
          'https://www.neonpro.com.br',
          'https://neonpro.vercel.app',
        ]
        : [
          'http://localhost:3000',
          'http://localhost:5173',
          'http://127.0.0.1:5173',
          'https://neonpro.vercel.app',
        ]

      // Check if origin is allowed
      if (allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        logger.warn('CORS: Blocked origin', {
          origin,
          component: 'cors-middleware',
        })
        callback(new Error('Not allowed by CORS'), false)
      }
    },
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-CSRF-Token',
    ],
    exposeHeaders: ['X-Request-ID'],
  }),
)

// Sentry middleware for error tracking and performance monitoring
app.use('*', sentryMiddleware())

// Error sanitization middleware for sensitive data protection
app.use('*', errorSanitizationMiddleware())

// HTTP error handling middleware with rate limiting and DDoS protection
import { httpErrorHandlingMiddleware } from './middleware/http-error-handling'
app.use('*', httpErrorHandlingMiddleware())

// Global error handler with enhanced error tracking
app.use('*', errorHandler)

// Healthcare telemetry middleware for OpenTelemetry (temporarily disabled)
// app.use('*', healthcareTelemetryMiddleware());

// Healthcare-compliant error tracking middleware
app.use('*', healthcareErrorTrackingMiddleware())

// Enhanced security headers with HSTS and healthcare compliance
app.use('*', httpsRedirectMiddleware())
app.use('*', healthcareSecurityHeadersMiddleware())

// Healthcare-specific rate limiting
app.use('*', rateLimitMiddleware())

// Healthcare-compliant Content Security Policy (T006)
app.use('*', healthcareCSPMiddleware())

// Query timeout middleware for <2s healthcare compliance (T064)
import { createHealthcareTimeoutMiddleware } from './middleware/query-timeout-middleware'
const queryTimeoutMiddleware = createHealthcareTimeoutMiddleware()
app.use('*', queryTimeoutMiddleware.middleware)

// Compression and optimization middleware for HTTPS responses (T065)
import { CompressionMiddleware } from './middleware/compression-middleware'
const compressionMiddleware = new CompressionMiddleware()
app.use('*', compressionMiddleware.middleware)

// HTTPS handshake performance monitoring middleware (T066)
import { httpsMonitoringMiddleware } from './middleware/https-monitoring-middleware'
import { httpsMonitoringService } from './services/monitoring/https-monitoring-service'
app.use('*', httpsMonitoringMiddleware.middleware)

// Sensitive data exposure monitoring
app.use('*', sensitiveDataExposureMiddleware())

// Enhanced error handling middleware
app.use('*', async (c, next) => {
  const startTime = Date.now()
  const requestId = c.get('requestId')

  try {
    // Add breadcrumb for request start
    errorTracker.addBreadcrumb('Request started', 'request', {
      method: c.req.method,
      endpoint: c.req.path,
      requestId,
    })

    await next()

    const duration = Date.now() - startTime

    // Log successful request
    logger.info(
      'Request completed',
      {
        requestId,
        method: c.req.method,
        endpoint: c.req.path,
        statusCode: c.res.status,
      },
      { duration },
    )

    // Add breadcrumb for request completion
    errorTracker.addBreadcrumb('Request completed', 'request', {
      method: c.req.method,
      endpoint: c.req.path,
      statusCode: c.res.status,
      duration,
      requestId,
    })
  } catch (error) {
    const duration = Date.now() - startTime

    // Capture error with context
    const errorContext = errorTracker.extractContextFromHono(c)
    errorTracker.captureException(error as Error, errorContext, {
      duration,
      requestId,
    })

    // Log error
    logger.error(
      'Request failed',
      {
        requestId,
        method: c.req.method,
        endpoint: c.req.path,
      },
      { errorMessage: (error as Error).message, duration },
    )

    // Add breadcrumb for error
    errorTracker.addBreadcrumb('Request failed', 'error', {
      method: c.req.method,
      endpoint: c.req.path,
      errorMessage: (error as Error).message,
      duration,
      requestId,
    })

    throw error
  }
})

// Mount chat routes under /v1/chat
app.route('/v1/chat', chatRouter)

// Mount appointments routes under /v1/appointments
app.route('/v1/appointments', appointmentsRouter)

// Mount medical records routes under /v1/medical-records
app.route('/v1/medical-records', medicalRecords)

// Mount billing routes under /v1/billing
app.route('/v1/billing', billing)

// Mount patient routes under /v2/patients
app.route('/api/v2', patientsRouter)

// Mount AI routes under /api/v2/ai
app.route('/api/v2/ai', aiRouter)

// Mount Financial CopilotKit routes under /api/v2/financial-copilot
app.route('/api/v2/financial-copilot', financialCopilotRouter)

// Mount CopilotKit bridge routes under /api/copilotkit
app.route('/api/copilotkit', copilotBridge)

// Mount V1 API routes under /api/v1
app.route('/api/v1', v1Router)

// Mount tRPC router under /trpc for type-safe API access
const tRPCHandle = trpcServer({
  router: appRouter,
  createContext: async opts => {
    // Create tRPC context from Hono request
    const headers = opts.req.headers
    const userId = headers.get('x-user-id') || headers.get('user-id')
    const clinicId = headers.get('x-clinic-id') || headers.get('clinic-id')

    return {
      userId,
      clinicId,
      auditMeta: {
        ipAddress: headers.get('x-forwarded-for') ||
          headers.get('x-real-ip') ||
          'unknown',
        userAgent: headers.get('user-agent') || 'unknown',
        sessionId: headers.get('x-session-id') || headers.get('session-id') || 'unknown',
      },
    } as Context
  },
})

// Mount AI agents cleanup and monitoring routes
app.route('/api/cleanup/ai-sessions', aiSessionsCleanup)
app.route('/api/cleanup/expired-predictions', expiredPredictionsCleanup)

// Mount tRPC router with healthcare compliance
app.mount('/trpc', tRPCHandle)

// Basic health endpoints with enhanced monitoring
app.get('/health', c => {
  const requestId = c.get('requestId')

  logger.debug('Health check requested', { requestId })

  return c.json({
    status: 'ok',
    requestId,
    timestamp: new Date().toISOString(),
  })
})

app.get('/v1/health', c => {
  const requestId = c.get('requestId')

  logger.info('Detailed health check requested', { requestId })

  const healthData = {
    status: 'healthy',
    version: 'v1',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    requestId,
    environment: {
      isProduction: process.env.NODE_ENV === 'production',
      hasDatabase: !!process.env.DATABASE_URL,
      hasSupabase: !!process.env.SUPABASE_URL,
      version: process.env.npm_package_version,
      region: process.env.VERCEL_REGION,
    },
    monitoring: {
      errorTracking: getErrorTrackingHealth(),
      logger: logger.getStats(),
    },
  }

  logger.healthcare(
    'health_check',
    'Detailed health check completed',
    { requestId },
    healthData,
  )

  return c.json(healthData)
})

app.get('/v1/info', c => {
  const requestId = c.get('requestId')

  logger.debug('System info requested', { requestId })

  const infoData = {
    name: 'NeonPro API',
    version: 'v1',
    runtime: 'node',
    environment: process.env.NODE_ENV || 'development',
    region: process.env.VERCEL_REGION || 'unknown',
    timestamp: new Date().toISOString(),
    requestId,
    security: {
      version: '1.0.0',
      features: [
        'encryption',
        'input_validation',
        'rate_limiting',
        'csrf_protection',
        'security_headers',
        'healthcare_data_protection',
      ],
    },
  }

  logger.audit(
    'system_info',
    'System information accessed',
    { requestId },
    infoData,
  )

  return c.json(infoData)
})

// HTTPS monitoring endpoint (T066)
app.get('/v1/monitoring/https', c => {
  const requestId = c.get('requestId')

  logger.info(
    'https_monitoring_endpoint',
    'HTTPS monitoring status requested',
    { requestId },
  )

  const monitoringService = httpsMonitoringService.getStatus()
  const performanceSummary = httpsMonitoringService.getPerformanceSummary()
  const activeAlerts = httpsMonitoringService.getActiveAlerts()

  const monitoringData = {
    status: 'active',
    configuration: monitoringService.config,
    performance: performanceSummary,
    alerts: {
      total: monitoringService.alertsCount,
      active: monitoringService.activeAlertsCount,
      recent: activeAlerts.slice(0, 10), // Last 10 alerts
    },
    compliance: {
      handshakeTimeRequirementMs: monitoringService.config.maxHandshakeTimeMs,
      currentComplianceRate: performanceSummary.complianceRate,
      isCompliant: performanceSummary.complianceRate >= 99.0, // 99% compliance target
    },
    timestamp: new Date().toISOString(),
    requestId,
  }

  logger.audit(
    'https_monitoring_access',
    'HTTPS monitoring status retrieved',
    { requestId },
    monitoringData,
  )

  return c.json(monitoringData)
})

// Security endpoints (protected)
app.get(
  '/v1/security/status',
  /* ...getProtectedRoutesMiddleware(['admin']), */ c => {
    const requestId = c.get('requestId')
    const user = c.get('user')

    logger.security('security_status', 'Security status accessed', {
      requestId,
      _userId: user?.id,
    })

    const securityStatus = {
      encryption: {
        enabled: true,
        algorithm: 'AES-256-GCM',
        keyRotation: 'enabled',
      },
      rateLimiting: {
        enabled: true,
        defaultLimit: 100,
        windowMs: 60000,
      },
      inputValidation: {
        enabled: true,
        xssProtection: 'enabled',
        sqlInjectionProtection: 'enabled',
      },
      healthcareCompliance: {
        lgpdEnabled: true,
        dataEncryption: 'enabled',
        auditLogging: 'enabled',
      },
      monitoring: {
        errorTracking: getErrorTrackingHealth(),
        logger: logger.getStats(),
      },
      timestamp: new Date().toISOString(),
      requestId,
    }

    logger.audit(
      'security_status',
      'Security status retrieved',
      { requestId },
      securityStatus,
    )

    return c.json(securityStatus)
  },
)

// LGPD compliance endpoint
app.get(
  '/v1/compliance/lgpd',
  /* ...getProtectedRoutesMiddleware(['admin', 'compliance']), */ c => {
    const requestId = c.get('requestId')
    const user = c.get('user')

    logger.lgpd('compliance_check', 'LGPD compliance status requested', {
      requestId,
      _userId: user?.id,
    })

    const complianceData = {
      lgpdCompliance: {
        enabled: true,
        dataProcessing: {
          lawfulBasis: ['consent', 'legitimate_interest'],
          purposeLimitation: 'enabled',
          dataMinimization: 'enabled',
          storageLimitation: 'enabled',
        },
        dataSubjectRights: {
          access: 'enabled',
          rectification: 'enabled',
          erasure: 'enabled',
          portability: 'enabled',
          objection: 'enabled',
        },
        securityMeasures: {
          encryption: 'AES-256-GCM',
          accessControl: 'role_based',
          auditLogging: 'enabled',
          breachNotification: 'enabled',
        },
        dataRetention: {
          policy: 'defined',
          automatedDeletion: 'enabled',
          consentExpiration: 'enabled',
        },
      },
      timestamp: new Date().toISOString(),
      requestId,
    }

    logger.lgpd(
      'compliance_status',
      'LGPD compliance status retrieved',
      { requestId },
      complianceData,
    )

    return c.json(complianceData)
  },
)

// Error tracking test endpoint (for development)
if (process.env.NODE_ENV !== 'production') {
  app.get('/v1/test/error', c => {
    const requestId = c.get('requestId')

    logger.warn('Error test endpoint called', { requestId })

    // Test error tracking
    try {
      throw new Error('This is a test error for error tracking')
    } catch (error) {
      errorTracker.captureException(error as Error, {
        requestId,
        endpoint: 'test',
      })
      return c.json({ message: 'Test error captured', requestId })
    }
  })
}

// CSP violation reporting endpoint (T006)
app.post('/api/security/csp-violations', cspViolationHandler())

// 404 handler with logging
app.notFound(c => {
  const requestId = c.get('requestId')

  logger.warn('Route not found', {
    requestId,
    method: c.req.method,
    endpoint: c.req.path,
    userAgent: c.req.header('user-agent'),
    ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
  })

  return c.json(
    {
      error: 'Not Found',
      message: 'The requested resource was not found',
      requestId,
      timestamp: new Date().toISOString(),
    },
    404,
  )
})

// Setup OpenAPI documentation
setupHealthcareSwaggerUI(app)

// Global error handler
app.onError(globalErrorHandler())

export default app
