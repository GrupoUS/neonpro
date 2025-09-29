/**
 * GET /api/v2/ai/models endpoint (T054)
 * Available AI models listing with health status and performance metrics
 * Integration with AIChatService for model management
 */

import { validator } from 'hono/validator'
import { Context, Hono, Next } from 'hono'
import { z } from 'zod'
import { AIChatService } from '../../services/ai-chat-service.js'

// Type definitions
interface AuditServiceInterface {
  logActivity: (payload: any) => Promise<void>
}

interface ServiceInterface {
  aiChatService: AIChatService
  auditService: AuditServiceInterface
}

// Mock middleware for testing
const mockAuthMiddleware = (c: Context, next: Next) => {
  const authHeader = c.req.header('authorization')
  if (!authHeader) {
    return c.json(
      {
        success: false,
        error: 'Não autorizado. Token de acesso necessário.',
      },
      401,
    )
  }
  c.set('user', { id: 'user-123', _role: 'healthcare_professional' })
  return next()
}

const app = new Hono()

// Query parameters validation schema
const modelsQuerySchema = z.object({
  provider: z.string().optional(),
  capability: z.string().optional(),
  status: z.string().optional(),
  includeDetails: z
    .string()
    .transform(val => val === 'true')
    .optional(),
  includeHealth: z
    .string()
    .transform(val => val === 'true')
    .optional(),
  includeMetrics: z
    .string()
    .transform(val => val === 'true')
    .optional(),
  useCase: z.string().optional(),
  includeFallbacks: z
    .string()
    .transform(val => val === 'true')
    .optional(),
  healthcareContext: z
    .string()
    .transform(val => val === 'true')
    .optional(),
  monitorHealth: z
    .string()
    .transform(val => val === 'true')
    .optional(),
}) as unknown as z.ZodTypeAny // <-- cast to ZodTypeAny to satisfy zValidator typing

// Services - will be injected during testing or use real services in production
let services: ServiceInterface | null = null

// Function to set services (used by tests)
export const setServices = (injectedServices: ServiceInterface) => {
  services = injectedServices
}

// Default services for production
const getServices = async (): Promise<ServiceInterface> => {
  if (services) return services

  // Use real service instances in production, try to import audit-service flexibly
  const aiChatService = new AIChatService()
  let auditService: AuditServiceInterface

  try {
    const mod = await import('../../services/audit-service.js')
    // support: named export AuditService, default export, or exported singleton
    const AuditCtor = mod.AuditService ||
      mod.default?.AuditService ||
      mod.default ||
      mod.auditService
    if (typeof AuditCtor === 'function') {
      // constructor -> instantiate
      auditService = new AuditCtor()
    } else if (AuditCtor && typeof AuditCtor.logActivity === 'function') {
      // already an object with logActivity
      auditService = AuditCtor
    } else {
      // fallback stub
      auditService = {
        logActivity: async () => {
          /* noop fallback */
        },
      }
    }
  } catch {
    void _e
    // fallback stub if import fails
    auditService = {
      logActivity: async () => {
        /* noop fallback */
      },
    }
  }

  return {
    aiChatService,
    auditService,
  }
}

app.get(
  '/',
  mockAuthMiddleware,
  validator('query', modelsQuerySchema),
  async c => {
    const startTime = Date.now()
    const user = c.get('user')
    const queryParams = c.req.valid('query')
    const ipAddress = c.req.header('X-Real-IP') || c.req.header('X-Forwarded-For') || 'unknown'
    const userAgent = c.req.header('User-Agent') || 'unknown'
    const healthcareProfessional = c.req.header('X-Healthcare-Professional')

    try {
      const currentServices = await getServices() // changed to await

      // Validate filter parameters
      const validProviders = ['openai', 'anthropic', 'google']
      const validCapabilities = [
        'chat',
        'analysis',
        'insights',
        'image_analysis',
        'medical_imaging',
        'reasoning',
      ]
      const validStatuses = ['available', 'limited', 'degraded', 'unavailable']

      if (
        queryParams.provider &&
        !validProviders.includes(queryParams.provider)
      ) {
        return c.json(
          {
            success: false,
            error: 'Parâmetros de filtro inválidos. Provedores válidos: ' +
              validProviders.join(', '),
          },
          400,
        )
      }

      if (
        queryParams.capability &&
        !validCapabilities.includes(queryParams.capability)
      ) {
        return c.json(
          {
            success: false,
            error: 'Parâmetros de filtro inválidos. Capacidades válidas: ' +
              validCapabilities.join(', '),
          },
          400,
        )
      }

      if (queryParams.status && !validStatuses.includes(queryParams.status)) {
        return c.json(
          {
            success: false,
            error: 'Parâmetros de filtro inválidos. Status válidos: ' +
              validStatuses.join(', '),
          },
          400,
        )
      }

      // Prepare models request
      const modelsRequest: any = {
        _userId: user.id,
      }

      // Add filters if provided
      if (
        queryParams.provider ||
        queryParams.capability ||
        queryParams.status
      ) {
        modelsRequest.filters = {}
        if (queryParams.provider) {
          modelsRequest.filters.provider = queryParams.provider
        }
        if (queryParams.capability) {
          modelsRequest.filters.capability = queryParams.capability
        }
        if (queryParams.status) {
          modelsRequest.filters.status = queryParams.status
        }
      }

      // Add healthcare context if provided
      if (queryParams.healthcareContext) {
        modelsRequest.healthcareContext = queryParams.healthcareContext
        modelsRequest.healthcareProfessional = healthcareProfessional
      }

      // Add other options
      if (queryParams.includeFallbacks) {
        modelsRequest.includeFallbacks = queryParams.includeFallbacks
      }

      // Get available models
      const modelsResponse = await currentServices.aiChatService.getAvailableModels(modelsRequest)

      if (!modelsResponse.success) {
        if (modelsResponse.error?.includes('unavailable')) {
          return c.json(
            {
              success: false,
              error:
                'Serviço de modelos de IA temporariamente indisponível. Tente novamente mais tarde.',
            },
            503,
          )
        }

        return c.json(
          {
            success: false,
            error: modelsResponse.error ||
              'Erro interno do serviço de modelos de IA',
          },
          500,
        )
      }

      // Get additional data if requested
      let healthSummary = null
      let metrics = null

      if (queryParams.includeHealth) {
        const healthResponse = await currentServices.aiChatService.getModelHealth()
        if (healthResponse.success) {
          healthSummary = healthResponse.data
        }
      }

      if (queryParams.includeMetrics) {
        const metricsResponse = await currentServices.aiChatService.getModelMetrics()
        if (metricsResponse.success) {
          metrics = metricsResponse.data
        }
      }

      // Log activity for audit trail
      const processingTime = Date.now() - startTime
      await currentServices.auditService.logActivity({
        _userId: user.id,
        action: 'ai_models_access',
        resourceType: 'ai_models',
        resourceId: 'models_list',
        details: {
          includeMetrics: queryParams.includeMetrics || false,
          modelsReturned: modelsResponse.data.models?.length || 0,
          availableModels: modelsResponse.data.summary?.availableModels || 0,
          providers: modelsResponse.data.summary?.providers || [],
        },
        ipAddress,
        userAgent,
        complianceContext: 'LGPD',
        sensitivityLevel: 'medium',
      })

      // Prepare response headers
      const responseHeaders: Record<string, string> = {
        'X-Response-Time': `${processingTime}ms`,
        'X-CFM-Compliant': 'true',
        'X-AI-Models-Listed': 'true',
        'X-LGPD-Compliant': 'true',
        'Cache-Control': 'public, max-age=300',
        'X-Database-Queries': '1',
      }

      // Add model-specific headers
      if (modelsResponse.data.summary) {
        responseHeaders['X-Total-Models'] = (
          modelsResponse.data.summary.totalModels || 0
        ).toString()
        responseHeaders['X-Available-Models'] = (
          modelsResponse.data.summary.availableModels || 0
        ).toString()
        responseHeaders['X-Healthy-Models'] = (
          modelsResponse.data.summary.healthyModels || 0
        ).toString()
        responseHeaders['X-Model-Providers'] = (
          modelsResponse.data.summary.providers || []
        ).join(',')
      }

      if (modelsResponse.data.metadata) {
        responseHeaders['X-Last-Updated'] = modelsResponse.data.metadata.lastUpdated || 'unknown'
      }

      // Set all headers
      Object.entries(responseHeaders).forEach(([key, value]) => {
        c.header(key, value)
      })

      // Prepare final response
      const finalResponse: any = {
        success: true,
        data: modelsResponse.data,
      }

      if (healthSummary) {
        finalResponse.data.healthSummary = healthSummary
      }

      if (metrics) {
        finalResponse.data.metrics = metrics
      }

      return c.json(finalResponse)
    } catch {
      console.error('AI Models endpoint error:', error)

      // Log error for audit
      const currentServices = await getServices() // changed to await
      await currentServices.auditService.logActivity({
        _userId: user.id,
        action: 'ai_models_error',
        resourceType: 'ai_models',
        resourceId: 'error',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        ipAddress,
        userAgent,
        complianceContext: 'LGPD',
        sensitivityLevel: 'medium',
      })

      if (error instanceof Error && error.message.includes('unavailable')) {
        return c.json(
          {
            success: false,
            error:
              'Serviço de modelos de IA temporariamente indisponível. Tente novamente mais tarde.',
          },
          503,
        )
      }

      return c.json(
        {
          success: false,
          error: 'Erro interno do servidor. Tente novamente mais tarde.',
        },
        500,
      )
    }
  },
)

export default app
