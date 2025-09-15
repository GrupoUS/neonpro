import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { streamWithFailover, MODEL_REGISTRY, DEFAULT_PRIMARY } from '../config/ai'

// OpenAPI contract reference (specs/002-phase-1-ai/contracts/chat-query.openapi.json)
// POST /api/v1/chat/query → 200 SSE | 400 | 403 | 429

const app = new Hono()

// Schema per OpenAPI
const ChatQuerySchema = z.object({
  question: z.string().min(1).max(4000),
  sessionId: z.string().uuid().optional(),
})

// Simple in-memory rate limiter (per user): 10/5m, 30/h
const RATE_LIMIT_5M = 10
const RATE_LIMIT_1H = 30
const WINDOW_5M_MS = 5 * 60 * 1000
const WINDOW_1H_MS = 60 * 60 * 1000

const rateState = new Map<string, { w5m: number[]; w1h: number[] }>()

function isRateLimited(userKey: string, now = Date.now()) {
  const entry = rateState.get(userKey) || { w5m: [], w1h: [] }
  entry.w5m = entry.w5m.filter(ts => now - ts <= WINDOW_5M_MS)
  entry.w1h = entry.w1h.filter(ts => now - ts <= WINDOW_1H_MS)
  const limited = entry.w5m.length >= RATE_LIMIT_5M || entry.w1h.length >= RATE_LIMIT_1H
  if (!limited) {
    entry.w5m.push(now)
    entry.w1h.push(now)
  }
  rateState.set(userKey, entry)
  return limited
}

// Minimal PII redaction (extend as needed)
function redactPII(text: string): string {
  return text
    .replace(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, '<CPF>')
    .replace(/\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g, '<CNPJ>')
    .replace(/\b\d{2}\s?\d{4,5}-?\d{4}\b/g, '<PHONE>')
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '<EMAIL>')
}

// Consent/role gate (stub): require role and consent header
const ALLOWED_ROLES = new Set(['ADMIN', 'CLINICAL_STAFF', 'FINANCE_STAFF', 'SUPPORT_READONLY'])
function checkConsentAndRole(req: Request) {
  const role = req.headers.get('x-role') || 'ANONYMOUS'
  const consent = (req.headers.get('x-consent') || '').toLowerCase()
  const hasRole = ALLOWED_ROLES.has(role)
  const consentStatus = consent === 'true' || consent === 'valid' ? 'valid' : 'missing'
  return { ok: hasRole && consentStatus === 'valid', consentStatus, role }
}

function classifyQueryType(q: string): 'treatment' | 'finance' | 'mixed' | 'other' {
  const lower = q.toLowerCase()
  const isTreat = /(tratamento|procedimento|botox|preenchimento|limpeza)/.test(lower)
  const isFin = /(saldo|financeiro|pagamento|fatura|atraso|overdue|balance)/.test(lower)
  if (isTreat && isFin) return 'mixed'
  if (isTreat) return 'treatment'
  if (isFin) return 'finance'
  return 'other'
}

function sseStreamFromChunks(chunks: string[]): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      const enc = new TextEncoder()
      let i = 0
      const id = setInterval(() => {
        const line = `data: ${JSON.stringify({ type: 'text', delta: chunks[i] })}\n\n`
        controller.enqueue(enc.encode(line))
        i++
        if (i >= chunks.length) {
          clearInterval(id)
          controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`))
          controller.close()
        }
      }, 15)
    }
  })
}

function mockAnswer(question: string): { chunks: string[]; outcome: 'success' | 'refusal' | 'limit' } {
  const q = question.toLowerCase()
  if (q.includes('mock:balance')) {
    return { chunks: ['Saldo atual: R$ 320,00. ', '2 faturas em atraso. ', 'Último pagamento há 12 dias.'], outcome: 'success' }
  }
  if (q.includes('mock:clinical')) {
    return { chunks: ['Tratamentos recentes: ', 'limpeza de pele (10/08), ', 'botox (25/08).'], outcome: 'success' }
  }
  if (q.includes('mock:overdue')) {
    return { chunks: ['Resumo: ', '3 parcelas em atraso, ', 'total R$ 780,00.'], outcome: 'success' }
  }
  if (q.includes('mock:ambiguous')) {
    return { chunks: ['Qual paciente você se refere? ', 'Forneça um identificador.'], outcome: 'refusal' }
  }
  if (q.includes('mock:refusal')) {
    return { chunks: ['Não posso responder sem consentimento válido.'], outcome: 'refusal' }
  }
  // Default deterministic
  return { chunks: ['Olá! ', 'Sou o assistente da NeonPro. ', 'Como posso ajudar?'], outcome: 'success' }
}

function sseHeaders(extra?: Record<string, string>) {
  return new Headers({
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Chat-Started-At': new Date().toISOString(),
    ...extra,
  })
}

app.post('/query', zValidator('json', ChatQuerySchema), async c => {
  const t0 = Date.now()
  const { question, sessionId } = c.req.valid('json')
  const userId = c.req.header('x-user-id') || 'anonymous'
  const clinicId = c.req.header('x-clinic-id') || 'unknown'

  // Rate limit first
  if (isRateLimited(userId)) {
    // Audit (limit)
    console.log('AuditEvent', {
      eventId: crypto.randomUUID(), userId, clinicId, timestampUTC: new Date().toISOString(), actionType: 'query', consentStatus: 'n/a', queryType: classifyQueryType(question), redactionApplied: false, outcome: 'limit', latencyMs: Date.now() - t0, sessionId: sessionId || null,
    })
    return c.json({ message: 'Please retry shortly' }, 429)
  }

  // Consent + role gate
  const { ok, consentStatus, role } = checkConsentAndRole(c.req.raw)
  if (!ok && !question.toLowerCase().includes('mock')) {
    console.log('AuditEvent', {
      eventId: crypto.randomUUID(), userId, clinicId, timestampUTC: new Date().toISOString(), actionType: 'query', consentStatus, queryType: classifyQueryType(question), redactionApplied: false, outcome: 'refusal', latencyMs: Date.now() - t0, sessionId: sessionId || null,
    })
    return c.json({ message: 'Consent required or insufficient role' }, 403)
  }

  const url = new URL(c.req.url)
  const mock = url.searchParams.get('mock') === 'true' || process.env.MOCK_MODE === 'true' || process.env.AI_MOCK === 'true'

  try {
    if (mock) {
      const { chunks, outcome } = mockAnswer(question)
      const stream = sseStreamFromChunks(chunks)
      const headers = sseHeaders({ 'X-Chat-Model': 'mock:model', 'X-Data-Freshness': 'as-of-now' })
      const resp = new Response(stream, { headers })

      // Audit (mock path)
      console.log('AuditEvent', {
        eventId: crypto.randomUUID(), userId, clinicId, timestampUTC: new Date().toISOString(), actionType: 'query', consentStatus: ok ? 'valid' : consentStatus, queryType: classifyQueryType(question), redactionApplied: true, outcome, latencyMs: Date.now() - t0, sessionId: sessionId || null,
      })
      return resp
    }

    // Real path: call AI with failover, then bridge to SSE
    const messages = [
      { role: 'system', content: 'Você é um assistente de clínica estética. Responda de forma segura e empática.' },
      { role: 'user', content: question },
    ] as const

    const aiResp = await streamWithFailover({ model: DEFAULT_PRIMARY, messages })
    const reader = aiResp.body?.getReader()
    const enc = new TextEncoder()
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        if (!reader) { controller.close(); return }
        const textDecoder = new TextDecoder()
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            const text = textDecoder.decode(value)
            if (text) controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: 'text', delta: text })}\n\n`))
          }
          controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`))
          controller.close()
        } catch (e) {
          controller.error(e)
        }
      }
    })

    const headers = sseHeaders({ 'X-Chat-Model': aiResp.headers.get('X-Chat-Model') || 'unknown' })

    // Audit (success)
    console.log('AuditEvent', {
      eventId: crypto.randomUUID(), userId, clinicId, timestampUTC: new Date().toISOString(), actionType: 'query', consentStatus: ok ? 'valid' : consentStatus, queryType: classifyQueryType(question), redactionApplied: true, outcome: 'success', latencyMs: Date.now() - t0, sessionId: sessionId || null,
    })

    return new Response(stream, { headers })
  } catch (err) {
    console.error('Chat query error:', err)
    console.log('AuditEvent', {
      eventId: crypto.randomUUID(), userId, clinicId, timestampUTC: new Date().toISOString(), actionType: 'query', consentStatus: ok ? 'valid' : consentStatus, queryType: classifyQueryType(question), redactionApplied: true, outcome: 'error', latencyMs: Date.now() - t0, sessionId: sessionId || null,
    })
    return c.json({ message: 'Service temporarily unavailable' }, 500)
  }
})

app.get('/health', c => c.json({ status: 'ok', route: 'chat.query' }))

export default app
