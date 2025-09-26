// Enhanced AI Chat Route with Semantic Caching for NeonPro Aesthetic Clinic
// Integrates semantic caching with existing AI chat infrastructure for optimized performance
import { zValidator } from '@hono/zod-validator'
import { type AIMessage, AIProviderFactory } from '@neonpro/integrations'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { z } from 'zod'
import { endTimerMs, logMetric, startTimer } from '../services/metrics'

// Import semantic caching components
import { HealthcareDataSanitizer, PIIRedactionLevel } from '../lib/pii-redaction'
import AIProviderRouterService, { ProviderConfig, ProviderHealthCheck, RoutingRequest, RoutingResponse } from '../services/ai-provider-router'
import { AuditTrailService } from '../services/audit-trail'
import { CacheKeyGenerator, SemanticCacheService } from '../services/semantic-cache'

// Import healthcare compliance utilities
import { LGPDComplianceValidator } from '../utils/lgpd-compliance-validator'

// Define HealthcareComplianceContext interface
interface HealthcareComplianceContext {
  operation: string
  patientId?: string
  professionalId?: string
  dataClassification: string
  legalBasis: string
}

// Import OpenTelemetry for performance monitoring
import { SpanStatusCode, trace } from '@opentelemetry/api'

// Request validation schemas
const ChatMessageSchema = z.object({
  _role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1),
})

const EnhancedChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).default([]),
  text: z.string().optional(),
  presetId: z.string().optional(),
  params: z.record(z.any()).optional(),
  locale: z.string().default('pt-BR'),
  clientId: z.string().optional(),
  sessionId: z.string(),
  model: z.string().optional(),
  enableCache: z.boolean().default(true),
  cacheTTL: z.number().default(3600), // 1 hour default
  healthcareContext: z
    .object({
      patientId: z.string().optional(),
      professionalId: z.string().optional(),
      treatmentType: z.string().optional(),
      urgency: z.enum(['low', 'medium', 'high', 'emergency']).default('medium'),
      dataClassification: z
        .enum(['public', 'restricted', 'confidential', 'highly_confidential'])
        .default('restricted'),
    })
    .optional(),
})

const app = new Hono()

// Initialize services
const semanticCache = new SemanticCacheService()
const piiSanitizer = new HealthcareDataSanitizer(PIIRedactionLevel.HEALTHCARE)
const aiRouter = new AIProviderRouterService(
  new SemanticCacheService(),
  new AuditTrailService()
)
const lgpdValidator = new LGPDComplianceValidator()

// Enable CORS for browser requests
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean) as string[]

if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push(
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8081',
  )
}

app.use(
  '*',
  cors({
    origin: origin =>
      !origin
        ? undefined
        : allowedOrigins.includes(origin)
        ? origin
        : undefined,
    allowMethods: ['GET', 'POST'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }),
)

// Enhanced system prompt with healthcare compliance
const SYSTEM_PROMPT =
  `Você é um assistente especializado em clínica estética no Brasil com foco em compliance LGPD.

CONTEXTO:
- Trabalha para a NeonPro, clínica estética moderna e acolhedora
- Especialista em tratamentos estéticos, beleza e bem-estar
- Comunicação em português brasileiro, profissional mas calorosa
- Foco na autoestima e satisfação do cliente
- Compromisso com LGPD e proteção de dados

ESPECIALIDADES:
- Tratamentos faciais (botox, preenchimento, limpeza)
- Harmonização facial e corporal
- Procedimentos estéticos não-invasivos
- Cuidados preventivos e pós-tratamento
- Orientações sobre agendamento

DIRETRIZES LGPD:
- Nunca armazene ou processe dados pessoais sem consentimento
- Redaja automaticamente informações sensíveis em conversas
- Mantenha conformidade com ANVISA para dispositivos médicos
- Respeite direitos do titular dos dados (LGPD Art. 18)
- Implemente medidas de segurança adequadas

DIRETRIZES DE RESPOSTA:
- Sempre sugira consulta presencial para avaliação personalizada
- Não faça diagnósticos médicos ou prescrições
- Foque em beleza, bem-estar e autoestima
- Use linguagem acessível, empática e acolhedora
- Promova confiança e segurança nos tratamentos

Responda sempre de forma útil, segura e focada em estética.`

// Cache key generator for healthcare AI conversations
class HealthcareCacheKeyGenerator implements CacheKeyGenerator {
  generateKey(messages: AIMessage[], _context: any): string {
    const normalizedMessages = messages.map(msg => ({
      _role: msg.role,
      content: piiSanitizer.sanitize(msg.content),
    }))

    const contextHash = this.hashContext(context)
    const messagesHash = this.hashMessages(normalizedMessages)

    return `healthcare-ai-chat:${contextHash}:${messagesHash}`
  }

  private hashContext(_context: any): string {
    const relevantContext = {
      locale: context.locale,
      presetId: context.presetId,
      treatmentType: context.healthcareContext?.treatmentType,
      urgency: context.healthcareContext?.urgency,
    }
    return Buffer.from(JSON.stringify(relevantContext))
      .toString('base64')
      .slice(0, 16)
  }

  private hashMessages(messages: AIMessage[]): string {
    const messageString = messages
      .map(m => `${m.role}:${m.content}`)
      .join('|')
    return Buffer.from(messageString).toString('base64').slice(0, 16)
  }
}

const cacheKeyGenerator = new HealthcareCacheKeyGenerator()

// Enhanced streaming AI response endpoint with semantic caching
app.post(
  '/stream',
  zValidator('json', EnhancedChatRequestSchema),
  async c => {
    const tracer = trace.getTracer('neonpro-ai-chat')
    const span = tracer.startSpan('/ai-chat/stream')

    const t0 = startTimer()
    try {
      const {
        messages,
        text,
        locale,
        clientId,
        sessionId,
        model,
        enableCache,
        cacheTTL,
        healthcareContext,
      } = c.req.valid('json')

      span.setAttribute('session.id', sessionId)
      span.setAttribute('cache.enabled', enableCache)
      span.setAttribute(
        'healthcare.urgency',
        healthcareContext?.urgency || 'medium',
      )
      span.setAttribute(
        'healthcare.data_classification',
        healthcareContext?.dataClassification || 'restricted',
      )

      const url = new URL(c.req.url)
      const mockMode = url.searchParams.get('mock') === 'true' ||
        process.env.AI_CHAT_MOCK_MODE === 'true' ||
        (!process.env.OPENAI_API_KEY &&
          !process.env.ANTHROPIC_API_KEY &&
          !process.env.GOOGLE_AI_API_KEY)

      // Build AI messages with compliance validation
      const aiMessages: AIMessage[] = [
        { _role: 'system', content: SYSTEM_PROMPT },
      ]

      // Add existing conversation messages with PII redaction
      if (Array.isArray(messages)) {
        for (const msg of messages) {
          const sanitizedContent = piiSanitizer.sanitize(msg.content)
          aiMessages.push({
            _role: msg.role,
            content: sanitizedContent,
          })
        }
      }

      // Add new text message if provided
      if (text && text.trim().length > 0) {
        const sanitizedText = piiSanitizer.sanitize(text.trim())
        aiMessages.push({ _role: 'user', content: sanitizedText })
      }

      // Validate LGPD compliance for healthcare context
      if (healthcareContext) {
        const complianceContext: HealthcareComplianceContext = {
          operation: 'ai_chat_processing',
          patientId: healthcareContext.patientId,
          professionalId: healthcareContext.professionalId,
          dataClassification: healthcareContext.dataClassification,
          legalBasis: 'consent',
        }

        const validationResult = await lgpdValidator.validate(complianceContext)
        if (!validationResult.compliant) {
          span.setAttribute('lgpd.compliance', 'failed')
          span.setAttribute(
            'lgpd.violations',
            validationResult.violations.join(','),
          )

          // Log compliance violation
          console.warn('LGPD compliance violation in AI chat:', {
            timestamp: new Date().toISOString(),
            sessionId,
            violations: validationResult.violations,
          })
        } else {
          span.setAttribute('lgpd.compliance', 'passed')
        }
      }

      // Check cache first if enabled
      let cachedResponse: AIProviderResponse | null = null
      let cacheKey: string | null = null

      if (enableCache && !mockMode) {
        cacheKey = cacheKeyGenerator.generateKey(aiMessages, {
          locale,
          healthcareContext,
        })
        cachedResponse = await semanticCache.get(cacheKey, {
          ttl: cacheTTL,
          validateHealthcare: true,
        })

        if (cachedResponse) {
          span.setAttribute('cache.hit', true)
          span.setAttribute(
            'cache.response_age',
            Date.now() - cachedResponse.timestamp,
          )

          const ms = endTimerMs(t0)
          logMetric({
            route: '/v1/ai-chat/stream',
            ms,
            ok: true,
            model: cachedResponse.provider,
            cacheHit: true,
          })

          // Stream cached response
          const encoder = new TextEncoder()
          const stream = new ReadableStream({
            async start(controller) {
              try {
                for (const chunk of cachedResponse!.chunks) {
                  controller.enqueue(encoder.encode(chunk))
                }
                controller.close()
              } catch {
                controller.error(error)
              }
            },
          })

          return new Response(stream, {
            status: 200,
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'X-Chat-Model': cachedResponse.provider,
              'X-Response-Time': `${ms}ms`,
              'X-Cache-Hit': 'true',
              'X-Cache-Key': cacheKey,
              'X-Chat-Started-At': new Date().toISOString(),
            },
          })
        }
      }

      span.setAttribute('cache.hit', false)

      if (mockMode) {
        // Use mock provider with caching
        const mockResponse = await AIProviderFactory.generateWithFailover(
          aiMessages,
          1,
        )

        // Cache mock response for development
        if (enableCache && cacheKey) {
          await semanticCache.set(cacheKey, {
            provider: 'mock',
            chunks: [mockResponse.content],
            timestamp: Date.now(),
            healthcareContext,
          })
        }

        const encoder = new TextEncoder()
        const stream = new ReadableStream({
          async start(controller) {
            try {
              controller.enqueue(encoder.encode(mockResponse.content))
              controller.close()
            } catch {
              controller.error(error)
            }
          },
        })

        const ms = endTimerMs(t0)
        logMetric({ route: '/v1/ai-chat/stream', ms, ok: true, model: 'mock' })

        return new Response(stream, {
          status: 200,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'X-Chat-Model': 'mock:provider',
            'X-Response-Time': `${ms}ms`,
            'X-Chat-Started-At': new Date().toISOString(),
          },
        })
      }

      // Use real AI providers with failover and caching
      const provider = await aiRouter.getOptimalProvider(aiMessages, {
        healthcare: healthcareContext,
        preferredProvider: model,
      })

      const encoder = new TextEncoder()
      const chunks: string[] = []

      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (
              const chunk of provider.generateStreamingCompletion(
                aiMessages,
              )
            ) {
              chunks.push(chunk)
              controller.enqueue(encoder.encode(chunk))
            }
            controller.close()
          } catch {
            console.error('Streaming error:', error)
            controller.error(error)
          }
        },
      })

      // Cache successful response
      if (enableCache && cacheKey && chunks.length > 0) {
        await semanticCache.set(cacheKey, {
          provider: provider.name,
          chunks,
          timestamp: Date.now(),
          healthcareContext,
        })
      }

      // Enhanced audit logging with healthcare context
      const lastText = text ||
        (Array.isArray(messages)
          ? messages[messages.length - 1]?.content
          : '') ||
        ''
      console.warn('Enhanced AI Chat Interaction:', {
        timestamp: new Date().toISOString(),
        sessionId,
        clientId: clientId || 'anonymous',
        userMessage: piiSanitizer.sanitize(lastText),
        provider: provider.name,
        locale,
        cacheEnabled: enableCache,
        cacheHit: false,
        healthcareContext,
      })

      const ms = endTimerMs(t0)
      logMetric({
        route: '/v1/ai-chat/stream',
        ms,
        ok: true,
        model: provider.name,
        cacheHit: false,
      })

      span.setStatus({ code: SpanStatusCode.OK })

      return new Response(stream, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'X-Chat-Model': provider.name,
          'X-Response-Time': `${ms}ms`,
          'X-Cache-Hit': 'false',
          'X-Chat-Started-At': new Date().toISOString(),
        },
      })
    } catch {
      const ms = endTimerMs(t0)
      logMetric({ route: '/v1/ai-chat/stream', ms, ok: false })

      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Unknown error',
      })

      console.error('Enhanced AI chat error:', error)
      return c.json(
        {
          error: 'Erro interno do servidor',
          message: 'Não foi possível processar sua solicitação',
        },
        500,
      )
    } finally {
      span.end()
    }
  },
)

// Cache management endpoints
app.post('/cache/clear', async c => {
  const { pattern } = (await c.req.json()) as { pattern?: string }

  if (pattern) {
    await semanticCache.clearPattern(pattern)
  } else {
    await semanticCache.clear()
  }

  return c.json({ success: true, cleared: pattern ? 'pattern' : 'all' })
})

app.get('/cache/stats', async c => {
  const stats = await semanticCache.getStatistics()
  return c.json(stats)
})

// Enhanced health check with cache and provider status
app.get('/health', c => {
  const availableProviders = AIProviderFactory.getAvailableProviders()
  const cacheHealth = semanticCache.getHealthStatus()

  return c.json({
    status: 'ok',
    _service: 'neonpro-ai-chat-enhanced',
    timestamp: new Date().toISOString(),
    providers: availableProviders.reduce(
      (acc, _provider) => {
        acc[provider] = 'available'
        return acc
      },
      {} as Record<string, string>,
    ),
    cache: cacheHealth,
  })
})

export default app
