import { logger } from "@/utils/healthcare-errors"
import { AguiService } from '@/services/agui-protocol/service'
import { CopilotRequest } from '@/services/agui-protocol/types'
import { Context } from 'hono'
import { createMiddleware } from 'hono/factory'

/**
 * CopilotKit endpoint for healthcare AI integration
 * Handles requests from frontend CopilotKit provider
 */
export const copilotEndpoint = createMiddleware(async (c: Context, _next) => {
  const requestId = c.get('requestId')
  const userId = c.get('userId')
  const clinicId = c.get('clinicId')

  logger.info('CopilotKit request received', {
    requestId,
    userId,
    clinicId,
    method: c.req.method,
    path: c.req.path,
  })

  try {
    // Initialize AG-UI service
    const aguiService = new AguiService()

    if (c.req.method === 'POST') {
      const body = await c.req.json()

      // Validate CopilotKit request format
      const copilotRequest: CopilotRequest = {
        id: body.id || requestId,
        type: body.type || 'query',
        content: body.content || body.message || '',
        sessionId: body.sessionId || `session_${userId}_${Date.now()}`,
        _userId: userId || 'anonymous',
        metadata: {
          ...body.metadata,
          source: 'copilotkit',
          timestamp: new Date().toISOString(),
          clinicId,
        },
      }

      logger.debug('Processing CopilotKit request', {
        requestId,
        sessionId: copilotRequest.sessionId,
        type: copilotRequest.type,
      })

      // Process the request through AG-UI service
      const response = await aguiService.processCopilotRequest(copilotRequest)

      logger.info('CopilotKit request processed successfully', {
        requestId,
        sessionId: copilotRequest.sessionId,
        processingTime: response.metadata?.processingTime,
      })

      return c.json(response)
    }

    // Handle OPTIONS requests for CORS
    if (c.req.method === 'OPTIONS') {
      return c.json({ status: 'ok' })
    }

    // Handle GET requests for connection validation
    return c.json({
      status: 'ready',
      _service: 'copilotkit-healthcare-agent',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      capabilities: {
        rag: true,
        realtime: true,
        healthcareData: true,
        lgpdCompliance: true,
      },
    })
  } catch {
    logger.error('CopilotKit endpoint error', error, {
      requestId,
      userId,
      clinicId,
    })

    return c.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to process CopilotKit request',
        requestId,
        timestamp: new Date().toISOString(),
      },
      500,
    )
  }
})
