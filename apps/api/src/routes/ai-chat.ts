// API Route: AI Chat for NeonPro Aesthetic Clinic
// Handles AI chat requests with LGPD compliance and audit logging

import { zValidator } from '@hono/zod-validator'
import { type AIMessage, AIProviderFactory } from '@neonpro/core-services'
import { ComplianceLevel, type HealthcareAIContext } from '@neonpro/shared'

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { endTimerMs, logMetric, startTimer } from '../services/metrics'
import { SemanticCacheService } from '../services/semantic-cache'

// Request validation schemas
const ChatMessageSchema = z.object({
  _role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1),
})

const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).default([]),
  text: z.string().optional(),
  presetId: z.string().optional(),
  params: z.record(z.any()).optional(),
  locale: z.string().default('pt-BR'),
  clientId: z.string().optional(),
  sessionId: z.string(),
  model: z.string().optional(),
})

const app = new Hono()

// Initialize semantic cache for AI cost optimization
const semanticCache = new SemanticCacheService({
  maxEntries: 1000,
  ttlMs: 3600000, // 1 hour cache for aesthetic queries
  enabled: process.env.AI_SEMANTIC_CACHE_ENABLED !== 'false',
  strategy: 'semantic',
})

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
    origin: (origin) =>
      !origin
        ? undefined
        : allowedOrigins.includes(origin)
        ? origin
        : undefined,
    allowMethods: ['GET', 'POST'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }),
)

// Aesthetic clinic system prompt
const SYSTEM_PROMPT = `Você é um assistente especializado em clínica estética no Brasil.

CONTEXTO:
- Trabalha para a NeonPro, clínica estética moderna e acolhedora
- Especialista em tratamentos estéticos, beleza e bem-estar
- Comunicação em português brasileiro, profissional mas calorosa
- Foco na autoestima e satisfação do cliente

ESPECIALIDADES:
- Tratamentos faciais (botox, preenchimento, limpeza)
- Harmonização facial e corporal
- Procedimentos estéticos não-invasivos
- Cuidados preventivos e pós-tratamento
- Orientações sobre agendamento

DIRETRIZES:
- Sempre sugira consulta presencial para avaliação personalizada
- Não faça diagnósticos médicos ou prescrições
- Foque em beleza, bem-estar e autoestima
- Respeite privacidade e dados pessoais (LGPD)
- Use linguagem acessível, empática e acolhedora
- Promova confiança e segurança nos tratamentos

Responda sempre de forma útil, segura e focada em estética.`

// PII redaction for LGPD compliance
const redactPII = (text: string): string => {
  return text
    .replace(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, '[CPF_REDACTED]')
    .replace(/\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g, '[CNPJ_REDACTED]')
    .replace(/\b\d{2}\s?\d{4,5}-?\d{4}\b/g, '[PHONE_REDACTED]')
    .replace(
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      '[EMAIL_REDACTED]',
    )
}

// Streaming AI response endpoint with Phase 2 provider integration
app.post('/stream', zValidator('json', ChatRequestSchema), async (c) => {
  const t0 = startTimer()
  try {
    const { messages, text, locale, clientId, sessionId, model } = c.req.valid('json')

    const url = new URL(c.req.url)
    const mockMode = url.searchParams.get('mock') === 'true'
      || process.env.AI_CHAT_MOCK_MODE === 'true'
      || (!process.env.OPENAI_API_KEY
        && !process.env.ANTHROPIC_API_KEY
        && !process.env.GOOGLE_AI_API_KEY)

    // Build AI messages for our provider system
    const aiMessages: AIMessage[] = [
      { _role: 'system', content: SYSTEM_PROMPT },
    ]

    // Add existing conversation messages
    if (Array.isArray(messages)) {
      for (const msg of messages) {
        aiMessages.push({
          _role: msg.role,
          content: msg.content,
        })
      }
    }

    // Add new text message if provided
    if (text && text.trim().length > 0) {
      aiMessages.push({ _role: 'user', content: text.trim() })
    }

    // Extract user prompt for semantic caching
    const userPrompt = text?.trim()
      || (Array.isArray(messages) && messages.length > 0
        ? messages[messages.length - 1]?.content
        : '')

    // Create healthcare AI context for semantic caching
    const healthcareContext: HealthcareAIContext = {
      patientId: clientId || 'anonymous',
      isEmergency: false, // Aesthetic consultations are typically non-emergency
      containsUrgentSymptoms: false,
      isSensitiveData: true, // All healthcare conversations are sensitive
      requiresPrivacy: true,
      complianceLevel: ComplianceLevel.RESTRICTED,
      sessionId: sessionId,
      timestamp: new Date(),
    }

    // Check semantic cache for similar queries (only for non-mock mode)
    let cachedResponse: string | null = null
    if (!mockMode && userPrompt && semanticCache.isEnabled()) {
      try {
        const cacheEntry = await semanticCache.findSimilarEntry(
          userPrompt,
          healthcareContext,
        )
        if (cacheEntry && cacheEntry.response) {
          cachedResponse = cacheEntry.response
          console.log('Cache hit for AI _query:', {
            sessionId,
            similarity: cacheEntry.similarity,
            originalCost: cacheEntry.originalCost,
            savedCost: cacheEntry.originalCost,
          })
        }
      } catch (cacheError) {
        console.warn(
          'Semantic cache error (continuing without cache):',
          cacheError,
        )
      }
    }

    // Return cached response if available
    if (cachedResponse) {
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        start(controller) {
          // Simulate streaming by chunking the cached response
          const chunks = cachedResponse.split(' ')
          let index = 0

          const sendChunk = () => {
            if (index < chunks.length) {
              const chunk = index === chunks.length - 1
                ? chunks[index]
                : chunks[index] + ' '
              controller.enqueue(encoder.encode(chunk))
              index++
              setTimeout(sendChunk, 50) // Simulate typing speed
            } else {
              controller.close()
            }
          }

          sendChunk()
        },
      })

      const ms = endTimerMs(t0)
      logMetric({
        route: '/v1/ai-chat/stream',
        ms,
        ok: true,
        model: 'cached',
        cached: true,
      })

      return new Response(stream, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'X-Chat-Model': 'semantic-cache',
          'X-Response-Time': `${ms}ms`,
          'X-Chat-Started-At': new Date().toISOString(),
          'X-Cache-Hit': 'true',
        },
      })
    }

    if (mockMode) {
      // Use mock provider from factory
      const mockStream = AIProviderFactory.generateStreamWithFailover(
        aiMessages,
        1,
      )

      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of mockStream) {
              controller.enqueue(encoder.encode(chunk))
            }
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

    // Use real AI providers with automatic failover
    const provider = await AIProviderFactory.getProviderWithFailover()
    const providerName = model || process.env.AI_PROVIDER || 'openai'

    const encoder = new TextEncoder()
    let fullResponse = '' // Collect full response for caching

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (
            const chunk of provider.generateStreamingCompletion(
              aiMessages,
            )
          ) {
            fullResponse += chunk // Accumulate response for caching
            controller.enqueue(encoder.encode(chunk))
          }

          // Cache the complete response for future similar queries
          if (userPrompt && fullResponse && semanticCache.isEnabled()) {
            try {
              await semanticCache.addEntry({
                prompt: userPrompt,
                response: fullResponse,
                embedding: [], // Will be generated internally
                timestamp: new Date(),
                hits: 0,
                _context: healthcareContext,
                similarity: 1.0,
                originalCost: 0.002, // Estimated cost for GPT-3.5/4 request
                complianceLevel: ComplianceLevel.RESTRICTED,
                integrityHash: '',
              })

              console.log('Cached AI response for future queries:', {
                sessionId,
                promptLength: userPrompt.length,
                responseLength: fullResponse.length,
              })
            } catch (cacheError) {
              console.warn('Failed to cache AI response:', cacheError)
            }
          }

          controller.close()
        } catch {
          console.error('Streaming error:', error)
          controller.error(error)
        }
      },
    })

    // Audit log minimal info
    const lastText = text
      || (Array.isArray(messages) ? messages[messages.length - 1]?.content : '')
      || ''
    console.log('AI Chat Interaction:', {
      timestamp: new Date().toISOString(),
      sessionId,
      clientId: clientId || 'anonymous',
      userMessage: redactPII(lastText),
      provider: providerName,
      locale,
    })

    const ms = endTimerMs(t0)
    logMetric({
      route: '/v1/ai-chat/stream',
      ms,
      ok: true,
      model: providerName,
    })

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Chat-Model': providerName,
        'X-Response-Time': `${ms}ms`,
        'X-Chat-Started-At': new Date().toISOString(),
      },
    })
  } catch {
    const ms = endTimerMs(t0)
    logMetric({ route: '/v1/ai-chat/stream', ms, ok: false })
    console.error('AI chat error:', error)
    return c.json(
      {
        error: 'Erro interno do servidor',
        message: 'Não foi possível processar sua solicitação',
      },
      500,
    )
  }
})

// Search suggestions endpoint with AI provider integration
app.post(
  '/suggestions',
  zValidator(
    'json',
    z.object({
      _query: z.string().min(1),
      sessionId: z.string(),
    }),
  ),
  async (c) => {
    const t0 = startTimer()
    try {
      const { query, sessionId } = c.req.valid('json')

      // Optional: Web search enrichment with Tavily (if API key present)
      const tavilyKey = process.env.TAVILY_API_KEY
      let webHints: string[] = []
      if (tavilyKey && query.length > 3) {
        try {
          const resp = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${tavilyKey}`,
            },
            body: JSON.stringify({
              query,
              max_results: 5,
              search_depth: 'basic',
            }),
          })
          if (resp.ok) {
            const _data = await resp.json()
            webHints = Array.isArray(data?.results)
              ? data.results
                .map((r: any) => r.title)
                .filter(Boolean)
                .slice(0, 5)
              : []
          }
        } catch {
          console.warn('Tavily search failed, continuing without web hints')
        }
      }

      // Generate suggestions using AI provider
      const suggestionPrompt =
        `Com base na consulta "${query}" sobre tratamentos estéticos, sugira 5 tratamentos relacionados da NeonPro. Considere estas pistas da web (se houver): ${
          webHints.join(
            '; ',
          )
        }. Responda apenas com lista separada por vírgulas, sem numeração.`

      const messages: AIMessage[] = [
        {
          _role: 'system',
          content: 'Você é um especialista em estética que sugere tratamentos relevantes.',
        },
        { _role: 'user', content: suggestionPrompt },
      ]

      let suggestions: string[] = []

      try {
        const response = await AIProviderFactory.generateWithFailover(messages)
        suggestions = response.content
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 5)
      } catch {
        console.error('AI suggestions failed:', error)
        // Fallback suggestions
        suggestions = [
          'Botox para rugas',
          'Preenchimento labial',
          'Limpeza de pele profunda',
          'Harmonização facial',
          'Peeling químico',
        ]
      }

      console.log('Search Suggestions:', {
        timestamp: new Date().toISOString(),
        sessionId,
        _query: redactPII(query),
        suggestionsCount: suggestions.length,
      })

      const ms = endTimerMs(t0)
      logMetric({ route: '/v1/ai-chat/suggestions', ms, ok: true })
      c.header('X-Response-Time', `${ms}ms`)
      return c.json({ suggestions })
    } catch {
      const ms = endTimerMs(t0)
      logMetric({ route: '/v1/ai-chat/suggestions', ms, ok: false })
      console.error('Search suggestions error:', error)

      // Fallback suggestions
      const fallbackSuggestions = [
        'Botox para rugas',
        'Preenchimento labial',
        'Limpeza de pele profunda',
        'Harmonização facial',
        'Peeling químico',
      ]

      return c.json({ suggestions: fallbackSuggestions })
    }
  },
)

// Health check endpoint
app.get('/health', (c) => {
  const availableProviders = AIProviderFactory.getAvailableProviders()

  return c.json({
    status: 'ok',
    _service: 'neonpro-ai-chat',
    timestamp: new Date().toISOString(),
    providers: availableProviders.reduce(
      (acc, _provider) => {
        acc[provider] = 'available'
        return acc
      },
      {} as Record<string, string>,
    ),
  })
})

export default app
