/**
 * Financial CopilotKit Components
 *
 * Specialized CopilotKit integration for financial AI agent operations
 * Supports Brazilian aesthetic clinic financial workflows with LGPD compliance
 */

import { Hono } from 'hono'
import type { Context, Next } from 'hono'
import { cors } from 'hono/cors'
import { streamText } from 'hono/streaming'
import { z } from 'zod'
import { logger } from '../../lib/logger'
import { AnomalyDetectionService } from '../../services/financial-ai-agent/anomaly-detection'
import { FinancialAIAgent } from '../../services/financial-ai-agent/financial-ai-agent'
import { PredictiveAnalyticsService } from '../../services/financial-ai-agent/predictive-analytics'

// Create dedicated router for Financial CopilotKit
const financialCopilot = new Hono()

// Enhanced CORS configuration for Financial CopilotKit
financialCopilot.use(
  '*',
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://neonpro.com',
      'https://www.neonpro.com',
      'https://neonpro.vercel.app',
    ],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-Healthcare-Platform',
      'X-LGPD-Compliance',
      'X-Request-Source',
      'X-Financial-Agent',
      'X-Clinic-ID',
    ],
    credentials: true,
  }),
)

// Financial security headers middleware
financialCopilot.use('*', async (c: Context, next: Next) => {
  c.header('X-Healthcare-Platform', 'NeonPro')
  c.header('X-LGPD-Compliance', 'true')
  c.header('X-Financial-Agent', 'enabled')
  c.header('X-Content-Type-Options', 'nosniff')
  c.header('X-Frame-Options', 'DENY')
  c.header('X-XSS-Protection', '1; mode=block')

  await next()
})

/**
 * Financial CopilotKit Chat Completions Endpoint
 * Handles streaming financial AI agent responses with specialized workflows
 */
financialCopilot.post('/chat/completions', async c => {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()

  try {
    // Parse CopilotKit request
    const body = await c.req.json()
    const { messages, stream = true, model, financial_context } = body

    // Extract the latest user message
    const latestMessage = messages[messages.length - 1]
    if (!latestMessage || latestMessage.role !== 'user') {
      return c.json(
        {
          error: {
            type: 'invalid_request',
            message: 'Nenhuma mensagem de usuário encontrada na solicitação',
          },
        },
        400,
      )
    }

    const userQuery = latestMessage.content
    const clinicId = c.req.header('X-Clinic-ID') || financial_context?.clinicId

    // Extract user context from headers or financial context
    const userContext = {
      userId: c.req.header('X-User-ID') || financial_context?.userId || 'anonymous',
      domain: c.req.header('X-User-Domain') || 'default',
      role: c.req.header('X-User-Role') || financial_context?.role || 'receptionist',
      sessionId: c.req.header('X-Session-ID') || financial_context?.sessionId || requestId,
      clinicId,
    }

    logger.info('Financial CopilotKit request received', {
      requestId,
      userQuery: userQuery.substring(0, 100) + '...',
      userContext,
      messageCount: messages.length,
    })

    // Process financial query through specialized agents
    const agentResponse = await processFinancialQuery(
      userQuery,
      userContext,
      financial_context,
      requestId,
    )

    if (stream) {
      // Return streaming response for real-time financial UI updates
      return streamText(c, async stream => {
        // Send initial response
        const response = formatFinancialCopilotResponse(
          agentResponse,
          requestId,
          startTime,
        )
        await stream.write(`data: ${JSON.stringify(response)}\n\n`)

        // If agent response has financial actions, send them as follow-up
        if (agentResponse.actions && agentResponse.actions.length > 0) {
          const actionsResponse = {
            id: `${requestId}-actions`,
            object: 'chat.completion.chunk',
            created: Math.floor(Date.now() / 1000),
            model: model || 'neonpro-financial-agent',
            choices: [
              {
                index: 0,
                delta: {
                  role: 'assistant',
                  content: '\n\n**Ações financeiras disponíveis:**',
                  financial_actions: agentResponse.actions,
                },
                finish_reason: null,
              },
            ],
          }
          await stream.write(`data: ${JSON.stringify(actionsResponse)}\n\n`)
        }

        // Send financial data visualizations if available
        if (agentResponse.visualizations && agentResponse.visualizations.length > 0) {
          const vizResponse = {
            id: `${requestId}-visualizations`,
            object: 'chat.completion.chunk',
            created: Math.floor(Date.now() / 1000),
            model: model || 'neonpro-financial-agent',
            choices: [
              {
                index: 0,
                delta: {
                  role: 'assistant',
                  content: '\n\n**Análises visuais:**',
                  visualizations: agentResponse.visualizations,
                },
                finish_reason: null,
              },
            ],
          }
          await stream.write(`data: ${JSON.stringify(vizResponse)}\n\n`)
        }

        // Send final completion
        const finalResponse = {
          id: requestId,
          object: 'chat.completion.chunk',
          created: Math.floor(Date.now() / 1000),
          model: model || 'neonpro-financial-agent',
          choices: [
            {
              index: 0,
              delta: {},
              finish_reason: 'stop',
            },
          ],
        }
        await stream.write(`data: ${JSON.stringify(finalResponse)}\n\n`)
        await stream.write('data: [DONE]\n\n')
      })
    } else {
      // Return non-streaming response
      const response = formatFinancialCopilotResponse(
        agentResponse,
        requestId,
        startTime,
      )
      return c.json(response)
    }
  } catch {
    logger.error('Financial CopilotKit error', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })

    return c.json(
      {
        error: {
          type: 'internal_error',
          message:
            'Ocorreu um erro ao processar sua solicitação financeira. Tente novamente em alguns momentos.',
          code: 'FINANCIAL_AGENT_ERROR',
        },
      },
      500,
    )
  }
})

/**
 * Financial Actions Endpoint
 * Handles specific financial workflow actions
 */
financialCopilot.post('/actions', async c => {
  const requestId = crypto.randomUUID()

  try {
    const body = await c.req.json()
    const { action_type, payload, context } = body

    // Validate financial action request
    const FinancialActionRequestSchema = z.object({
      action_type: z.enum([
        'create_billing',
        'process_payment',
        'generate_invoice',
        'run_analytics',
        'detect_fraud',
        'optimize_pricing',
        'forecast_revenue',
        'export_report',
      ]),
      payload: z.record(z.unknown()),
      context: z.object({
        userId: z.string(),
        clinicId: z.string(),
        sessionId: z.string(),
      }),
    })

    const validatedRequest = FinancialActionRequestSchema.parse({
      action_type,
      payload,
      context,
    })

    logger.info('Financial action request received', {
      requestId,
      actionType: validatedRequest.action_type,
      userId: validatedRequest.context.userId,
      clinicId: validatedRequest.context.clinicId,
    })

    // Initialize financial agents
    const financialAgent = new FinancialAIAgent(
      {} as any, // Supabase client would be injected
      validatedRequest.context.userId,
    )

    // Execute financial action
    const result = await executeFinancialAction(
      validatedRequest.action_type,
      validatedRequest.payload,
      validatedRequest.context,
      financialAgent,
    )

    return c.json({
      success: true,
      action_id: requestId,
      action_type: validatedRequest.action_type,
      result,
      timestamp: new Date().toISOString(),
    })
  } catch {
    logger.error('Financial action execution error', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return c.json(
      {
        success: false,
        error: {
          message: 'Falha ao executar ação financeira',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      500,
    )
  }
})

/**
 * Financial Analytics Endpoint
 * Provides comprehensive financial analytics and reporting
 */
financialCopilot.post('/analytics', async c => {
  const requestId = crypto.randomUUID()

  try {
    const body = await c.req.json()
    const {
      time_range,
      metrics,
      group_by = 'month',
      filters,
    } = body

    const userId = c.req.header('X-User-ID')
    const clinicId = c.req.header('X-Clinic-ID')

    if (!userId || !clinicId) {
      return c.json(
        {
          error: {
            message: 'ID de usuário e clínica são obrigatórios',
            code: 'MISSING_CONTEXT',
          },
        },
        400,
      )
    }

    // Initialize analytics service
    const analyticsService = new PredictiveAnalyticsService(
      {} as any, // Supabase client would be injected
      userId,
    )

    // Generate comprehensive analytics
    const analytics = await analyticsService.generateComprehensiveAnalytics({
      timeRange: time_range,
      metrics,
      groupBy: group_by,
      filters,
    })

    // Add predictions
    const predictions = await analyticsService.generateFinancialPredictions({
      timeRange: time_range,
      metrics,
    })

    return c.json({
      success: true,
      request_id: requestId,
      analytics: {
        ...analytics,
        predictions,
      },
      timestamp: new Date().toISOString(),
    })
  } catch {
    logger.error('Financial analytics error', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return c.json(
      {
        success: false,
        error: {
          message: 'Falha ao gerar análise financeira',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      500,
    )
  }
})

/**
 * Process Financial Query through Specialized Agents
 */
async function processFinancialQuery(
  query: string,
  userContext: any,
  financialContext: any,
  requestId: string,
) {
  const financialAgent = new FinancialAIAgent(
    {} as any, // Supabase client would be injected
    userContext.userId,
  )

  // Analyze query intent and route to appropriate agent
  const intent = analyzeFinancialIntent(query)

  try {
    switch (intent.type) {
      case 'billing':
        return await financialAgent.processBillingRequest(
          { query, context: financialContext },
          userContext,
        )

      case 'analytics':
        return await financialAgent.generateFinancialPredictions(userContext)

      case 'payment':
        return await financialAgent.processPayment(
          { query, context: financialContext },
          userContext,
        )

      case 'fraud_detection':
        const anomalyService = new AnomalyDetectionService(
          {} as any, // Supabase client would be injected
          userContext.userId,
        )
        return await anomalyService.detectAnomalies({
          query,
          context: userContext,
        })

      case 'compliance':
        return await financialAgent.checkCompliance(userContext)

      default:
        return await financialAgent.processFinancialMessage(query, intent.type)
    }
  } catch {
    logger.error('Financial query processing failed', {
      requestId,
      intent,
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return {
      id: requestId,
      content: getFinancialFallbackResponse(intent.type),
      type: 'error',
      metadata: {
        error: true,
        fallback: true,
        intent: intent.type,
      },
    }
  }
}

/**
 * Analyze Financial Query Intent
 */
function analyzeFinancialIntent(query: string) {
  const normalizedQuery = query.toLowerCase()

  // Billing-related queries
  if (
    normalizedQuery.includes('fatura') ||
    normalizedQuery.includes('cobrança') ||
    normalizedQuery.includes('pagamento') ||
    normalizedQuery.includes('faturamento')
  ) {
    return { type: 'billing', confidence: 0.9 }
  }

  // Analytics-related queries
  if (
    normalizedQuery.includes('análise') ||
    normalizedQuery.includes('relatório') ||
    normalizedQuery.includes('métricas') ||
    normalizedQuery.includes('previsão') ||
    normalizedQuery.includes('forecast')
  ) {
    return { type: 'analytics', confidence: 0.9 }
  }

  // Payment-related queries
  if (
    normalizedQuery.includes('pix') ||
    normalizedQuery.includes('cartão') ||
    normalizedQuery.includes('transação') ||
    normalizedQuery.includes('parcelamento')
  ) {
    return { type: 'payment', confidence: 0.9 }
  }

  // Fraud detection queries
  if (
    normalizedQuery.includes('fraude') ||
    normalizedQuery.includes('suspeita') ||
    normalizedQuery.includes('anomalia') ||
    normalizedQuery.includes('segurança')
  ) {
    return { type: 'fraud_detection', confidence: 0.9 }
  }

  // Compliance queries
  if (
    normalizedQuery.includes('lgpd') ||
    normalizedQuery.includes('compliance') ||
    normalizedQuery.includes('auditoria') ||
    normalizedQuery.includes('lei')
  ) {
    return { type: 'compliance', confidence: 0.9 }
  }

  return { type: 'general', confidence: 0.5 }
}

/**
 * Execute Financial Action
 */
async function executeFinancialAction(
  actionType: string,
  payload: any,
  context: any,
  financialAgent: FinancialAIAgent,
) {
  switch (actionType) {
    case 'create_billing':
      return await financialAgent.processBillingOperation({
        ...payload,
        userId: context.userId,
      })

    case 'process_payment':
      return await financialAgent.processPayment({
        ...payload,
        userId: context.userId,
      })

    case 'generate_invoice':
      return await financialAgent.generateInvoice(payload)

    case 'run_analytics':
      const analyticsService = new PredictiveAnalyticsService(
        {} as any,
        context.userId,
      )
      return await analyticsService.generateComprehensiveAnalytics(payload)

    case 'detect_fraud':
      const anomalyService = new AnomalyDetectionService(
        {} as any,
        context.userId,
      )
      return await anomalyService.detectAnomalies(payload)

    default:
      throw new Error(`Unsupported action type: ${actionType}`)
  }
}

/**
 * Format Financial CopilotKit Response
 */
function formatFinancialCopilotResponse(
  agentResponse: any,
  requestId: string,
  startTime: number,
) {
  const processingTime = Date.now() - startTime

  let content = agentResponse.content || 'Análise financeira processada com sucesso.'

  // Add structured financial data formatting
  if (agentResponse.data) {
    const _data = agentResponse.data

    if (data.type === 'financial_summary') {
      content += `\n\n💰 **${data.title}**`
      content += `\n📈 Receita Total: **${formatCurrency(data.totalRevenue)}**`
      content += `\n⏱️ Pagamentos Pendentes: ${formatCurrency(data.pendingPayments)}`
      content += `\n✅ Transações Completadas: ${data.completedTransactions}`
      content += `\n📊 Taxa de Conversão: ${((data.conversionRate || 0) * 100).toFixed(1)}%`
    } else if (data.type === 'billing_analysis') {
      content += `\n\n📋 **Análise de Faturamento**`
      content += `\n🏥 Procedimentos: ${data.proceduresCount}`
      content += `\n💵 Valor Total: ${formatCurrency(data.totalAmount)}`
      content += `\n📝 Faturas Pendentes: ${data.pendingInvoices}`
      content += `\n💳 Métodos de Pagamento: ${
        Object.entries(data.paymentMethods)
          .map(([method, count]) => `${method}: ${count}`)
          .join(', ')
      }`
    } else if (data.type === 'fraud_alert') {
      content += `\n\n🚨 **Alerta de Segurança**`
      content += `\n⚠️ Risco: ${data.riskLevel}`
      content += `\n📊 Score: ${(data.riskScore * 100).toFixed(1)}%`
      content += `\n🎯 Ação Recomendada: ${data.recommendedAction}`
      content += `\n📝 Descrição: ${data.description}`
    }
  }

  // Add performance information
  if (processingTime > 1000) {
    content += `\n\n_Processado em ${(processingTime / 1000).toFixed(1)}s_`
  }

  return {
    id: requestId,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: 'neonpro-financial-agent',
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: content,
          financial_data: agentResponse.data,
          actions: agentResponse.actions,
          visualizations: agentResponse.visualizations,
        },
        finish_reason: 'stop',
      },
    ],
    usage: {
      prompt_tokens: 0,
      completion_tokens: content.length / 4,
      total_tokens: content.length / 4,
    },
    neonpro_metadata: {
      request_id: requestId,
      processing_time: processingTime,
      agent_response_type: agentResponse.type,
      user_role: agentResponse.metadata?.user_role,
      financial_intent: agentResponse.metadata?.intent,
      lgpd_compliant: true,
      accessibility_features: true,
    },
  }
}

/**
 * Format Currency for Brazilian Real
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Get Financial Fallback Response
 */
function getFinancialFallbackResponse(intentType: string): string {
  const fallbacks = {
    billing:
      'Desculpe, não consegui processar sua solicitação de faturamento. Por favor, tente novamente ou contacte o suporte.',
    analytics:
      'Não foi possível gerar a análise financeira solicitada. Verifique os parâmetros e tente novamente.',
    payment: 'Erro no processamento de pagamento. Por favor, verifique os dados e tente novamente.',
    fraud_detection:
      'Não foi possível concluir a análise de segurança. Por favor, contacte o administrador do sistema.',
    compliance:
      'Falha na verificação de compliance. Por favor, contacte o departamento de compliance.',
    general:
      'Desculpe, estou temporariamente indisponível para operações financeiras. Tente novamente em alguns momentos.',
  }

  return fallbacks[intentType as keyof typeof fallbacks] || fallbacks.general
}

/**
 * Health check endpoint for Financial CopilotKit
 */
financialCopilot.get('/health', c => {
  return c.json({
    status: 'healthy',
    service: 'financial-copilot-agent',
    version: '1.0.0',
    healthcare_compliance: {
      lgpd: true,
      anvisa: true,
      cfm: true,
    },
    financial_features: {
      billing_automation: true,
      payment_processing: true,
      fraud_detection: true,
      analytics_reporting: true,
      brazilian_payments: true,
      lgpd_compliance: true,
    },
    timestamp: new Date().toISOString(),
  })
})

export default financialCopilot
