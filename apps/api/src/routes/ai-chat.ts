// API Route: AI Chat for NeonPro Aesthetic Clinic
// Handles AI chat requests with LGPD compliance and audit logging

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { startTimer, endTimerMs, logMetric } from '../services/metrics'
import type { CoreMessage } from 'ai'
import { streamWithFailover, DEFAULT_PRIMARY, MODEL_REGISTRY, getSuggestionsFromAI } from '../config/ai'

// Request validation schemas
const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
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

// Enable CORS for browser requests
app.use('*', cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://neonpro.vercel.app'] 
    : ['http://localhost:5173'],
  allowMethods: ['GET', 'POST'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

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
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_REDACTED]')
}

// Allowed models registry
const DEFAULT_SECONDARY = 'gemini-2.5-flash' as const

// Streaming AI response endpoint
app.post('/stream',
  zValidator('json', ChatRequestSchema),
  async (c) => {
    // Timing and minimal metrics
    const t0 = startTimer()
    try {
      const { messages, text, presetId, params, locale, clientId, sessionId, model } = c.req.valid('json')
      
      // Resolve model: allow only active models unless allowExperimental=true
      const url = new URL(c.req.url)
      const allowExperimental = url.searchParams.get('allowExperimental') === 'true'
      const mockMode = url.searchParams.get('mock') === 'true' || process.env.AI_MOCK === 'true' || (!process.env.OPENAI_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY)
      const requestedModel = model && MODEL_REGISTRY[model as keyof typeof MODEL_REGISTRY]
        ? (model as keyof typeof MODEL_REGISTRY)
        : undefined

      const mergedMessages: CoreMessage[] = (messages.length > 0 ? messages : (text ? [{ role: 'user' as const, content: text }] : []))
      const aiMessages: CoreMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...mergedMessages,
      ]

      const startedAt = new Date().toISOString()
      const response = await streamWithFailover({
        model: (requestedModel ?? DEFAULT_PRIMARY) as keyof typeof MODEL_REGISTRY,
        allowExperimental,
        messages: aiMessages,
        mock: mockMode,
      })

      // Log interaction for audit trail
      const lastContent = mergedMessages[mergedMessages.length - 1]?.content || ''
      console.log('AI Chat Interaction:', {
        timestamp: startedAt,
        sessionId,
        clientId: clientId || 'anonymous',
        userMessage: redactPII(lastContent),
        provider: response.headers.get('X-Chat-Model') ?? 'unknown',
        locale,
        presetId: presetId || null,
      })

      // Ensure required metadata headers and emit lightweight metrics
      const headers = new Headers(response.headers)
      headers.set('X-Chat-Started-At', startedAt)
      if (!headers.has('X-Data-Freshness')) headers.set('X-Data-Freshness', 'as-of-now')
      const ms = endTimerMs(t0)
      logMetric({ route: '/v1/ai-chat/stream', ms, ok: true, model: headers.get('X-Chat-Model') })
      headers.set('X-Response-Time', `${ms}ms`)
      return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
      
    } catch (error) {
      const ms = endTimerMs(t0)
      logMetric({ route: '/v1/ai-chat/stream', ms, ok: false })
      console.error('AI chat error:', error)
      return c.json({
        error: 'Erro interno do servidor',
        message: 'Não foi possível processar sua solicitação'
      }, 500)
    }
  }
)

// Search suggestions endpoint
app.post('/suggestions',
  zValidator('json', z.object({
    query: z.string().min(1),
    sessionId: z.string(),
  })),
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
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tavilyKey}` },
            body: JSON.stringify({ query, max_results: 5, search_depth: 'basic' }),
          })
          if (resp.ok) {
            const data = await resp.json()
            webHints = Array.isArray(data?.results)
              ? data.results.map((r: any) => r.title).filter(Boolean).slice(0, 5)
              : []
          }
        } catch (e) {
          console.warn('Tavily search failed, continuing without web hints')
        }
      }
      
      const suggestions = await getSuggestionsFromAI(query, webHints)

      console.log('Search Suggestions:', {
        timestamp: new Date().toISOString(),
        sessionId,
        query: redactPII(query),
        suggestionsCount: suggestions.length,
      })

      const ms = endTimerMs(t0)
      logMetric({ route: '/v1/ai-chat/suggestions', ms, ok: true })
      c.header('X-Response-Time', `${ms}ms`)
      return c.json({ suggestions })
      
    } catch (error) {
      const ms = endTimerMs(t0)
      logMetric({ route: '/v1/ai-chat/suggestions', ms, ok: false })
      console.error('Search suggestions error:', error)
      
      // Fallback suggestions
      const fallbackSuggestions = [
        'Botox para rugas',
        'Preenchimento labial',
        'Limpeza de pele profunda',
        'Harmonização facial',
        'Peeling químico'
      ]
      
      return c.json({ suggestions: fallbackSuggestions })
    }
  }
)

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'neonpro-ai-chat',
    timestamp: new Date().toISOString(),
    providers: {
      openai: 'available',
      google: 'available',
    }
  })
})

export default app
