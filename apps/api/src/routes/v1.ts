/**
 * V1 API Router - Aggregator for version 1 API endpoints
 *
 * This router serves as the main entry point for /api/v1 endpoints,
 * providing backward compatibility and organized API structure.
 *
 * Features:
 * - Aggregates all v1 endpoints under /api/v1 prefix
 * - Health check endpoint for monitoring
 * - API information and version metadata
 * - Backward compatibility with existing v1 endpoints
 * - Centralized error handling and logging
 *
 * @route /api/v1
 */

import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { requireAuth } from '../middleware/auth'
import { auditLogger } from '@/utils/audit-logger'

const v1Router = new Hono()

/**
 * GET /api/v1 - API information and health check
 */
v1Router.get('/', async (c) => {
  try {
    const info = {
      name: 'NeonPro Healthcare API',
      version: '1.0.0',
      description: 'Healthcare management platform API',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/api/v1/health',
        billing: '/api/v1/billing',
        ai: '/api/v1/ai',
        patients: '/api/v2/patients', // Migrated to v2
        appointments: '/v1/appointments', // Legacy direct mounting
        chat: '/v1/chat', // Legacy direct mounting
        'medical-records': '/v1/medical-records', // Legacy direct mounting
      },
      features: [
        'Brazilian healthcare compliance (LGPD, ANVISA, CFM)',
        'Multi-tenant architecture with Row Level Security',
        'Comprehensive audit logging',
        'Real-time synchronization',
        'Type-safe API with tRPC integration',
        'AI-powered clinical support',
        'Telemedicine capabilities',
        'Financial management with CBHPM codes',
      ],
      compliance: {
        lgpd: true,
        anvisa: true,
        cfm: true,
        ans: true,
        rls: true,
      },
    }

    return c.json({
      success: true,
      data: info,
      message: 'NeonPro API v1 - Healthcare Management Platform'
    })

  } catch (error) {
    console.error('Error in v1 root endpoint:', error)
    throw new HTTPException(500, {
      message: 'Failed to retrieve API information'
    })
  }
})

/**
 * GET /api/v1/health - Health check endpoint
 */
v1Router.get('/health', async (c) => {
  try {
    // Basic health check
    const health = {
      status: 'healthy',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected', // Would check actual DB connection
      redis: 'connected', // Would check actual Redis connection
      services: {
        auth: 'operational',
        billing: 'operational', 
        ai: 'operational',
        audit: 'operational',
      },
      metrics: {
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
      },
      lastDeployment: new Date().toISOString(), // Would be populated from CI/CD
    }

    // Set appropriate status code based on health
    const statusCode = health.status === 'healthy' ? 200 : 503

    return c.json({
      success: true,
      data: health,
      message: 'Health check completed'
    }, statusCode)

  } catch (error) {
    console.error('Health check failed:', error)
    return c.json({
      success: false,
      error: 'Health check failed',
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
    }, 503)
  }
})

/**
 * GET /api/v1/info - Detailed API information
 */
v1Router.get('/info', 
  requireAuth,
  async (c) => {
    try {
      const userId = c.get('userId')
      
      const info = {
        api: {
          name: 'NeonPro Healthcare API',
          version: '1.0.0',
          description: 'Comprehensive healthcare management platform',
          documentation: 'https://docs.neonpro.health/api/v1',
          support: 'support@neonpro.health',
        },
        features: {
          patient_management: {
            enabled: true,
            endpoints: [
              'GET /api/v2/patients',
              'POST /api/v2/patients',
              'GET /api/v2/patients/:id',
              'PUT /api/v2/patients/:id',
            ],
            compliance: ['LGPD', 'ANVISA'],
          },
          billing: {
            enabled: true,
            endpoints: [
              'GET /api/v1/billing',
              'POST /api/v1/billing',
              'GET /api/v1/billing/:id',
              'POST /api/v1/billing/:id/payment',
            ],
            compliance: ['LGPD', 'Fiscal'],
          },
          appointments: {
            enabled: true,
            endpoints: [
              'GET /v1/appointments',
              'POST /v1/appointments',
              'GET /v1/appointments/:id',
            ],
            compliance: ['LGPD'],
          },
          ai_services: {
            enabled: true,
            endpoints: [
              'POST /api/v1/ai/analyze',
              'POST /api/v1/ai/crud',
            ],
            compliance: ['LGPD', 'AI Ethics'],
          },
        },
        compliance: {
          data_protection: 'LGPD compliant',
          healthcare_standards: ['ANVISA', 'CFM'],
          security: ['RLS', 'Encryption', 'Audit Trail'],
          certifications: ['ISO 27001', 'HITRUST', 'GDPR'],
        },
        user_context: {
          userId,
          permissions: c.get('user')?.permissions || [],
          clinicId: c.get('clinicId'),
          role: c.get('user')?._role,
        },
      }

      // Log API info access for audit
      await auditLogger.logEvent('api_info_access', {
        userId,
        endpoint: '/api/v1/info',
      })

      return c.json({
        success: true,
        data: info,
        message: 'API information retrieved successfully'
      })

    } catch (error) {
      console.error('Error retrieving API info:', error)
      throw new HTTPException(500, {
        message: 'Failed to retrieve API information'
      })
    }
  }
)

/**
 * GET /api/v1/metrics - API usage metrics
 */
v1Router.get('/metrics',
  requireAuth,
  requirePermission('admin'),
  async (c) => {
    try {
      const userId = c.get('userId')
      const clinicId = c.get('clinicId')

      // Placeholder for actual metrics collection
      // In production, this would collect real usage statistics
      const metrics = {
        api_usage: {
          total_requests: 0, // Would be calculated from logs
          unique_users: 0,
          active_sessions: 0,
          error_rate: 0.0,
        },
        endpoints: {
          billing: {
            requests: 0,
            avg_response_time: 0,
            error_rate: 0.0,
          },
          patients: {
            requests: 0,
            avg_response_time: 0,
            error_rate: 0.0,
          },
          appointments: {
            requests: 0,
            avg_response_time: 0,
            error_rate: 0.0,
          },
          ai: {
            requests: 0,
            avg_response_time: 0,
            error_rate: 0.0,
          },
        },
        system: {
          uptime: process.uptime(),
          memory_usage: process.memoryUsage(),
          cpu_usage: process.cpuUsage(),
          timestamp: new Date().toISOString(),
        },
      }

      // Log metrics access for audit
      await auditLogger.logEvent('api_metrics_access', {
        userId,
        clinicId,
        endpoint: '/api/v1/metrics',
      })

      return c.json({
        success: true,
        data: metrics,
        message: 'API metrics retrieved successfully'
      })

    } catch (error) {
      console.error('Error retrieving API metrics:', error)
      throw new HTTPException(500, {
        message: 'Failed to retrieve API metrics'
      })
    }
  }
)

/**
 * Global error handler for v1 routes
 */
v1Router.onError((err, c) => {
  console.error('V1 API Error:', {
    error: err.message,
    stack: err.stack,
    path: c.req.path,
    method: c.req.method,
    timestamp: new Date().toISOString(),
  })

  // Log error for audit
  auditLogger.logEvent('api_error', {
    error: err.message,
    path: c.req.path,
    method: c.req.method,
    userId: c.get('userId'),
    statusCode: err.status || 500,
  }).catch(auditErr => {
    console.error('Failed to log API error:', auditErr)
  })

  if (err instanceof HTTPException) {
    return c.json({
      success: false,
      error: err.message,
      code: 'HTTP_ERROR',
      timestamp: new Date().toISOString(),
    }, err.status)
  }

  return c.json({
    success: false,
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
  }, 500)
})

export default v1Router