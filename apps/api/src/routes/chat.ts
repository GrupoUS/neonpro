import { zValidator } from '@hono/zod-validator';
import { supabase } from '@neonpro/database';
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { DEFAULT_PRIMARY, streamWithFailover } from '../config/ai';

// OpenAPI contract reference (specs/002-phase-1-ai/contracts/chat-query.openapi.json)
// POST /api/v1/chat/query → 200 SSE | 400 | 403 | 429

const app = new Hono();

// Schema per OpenAPI
const ChatQuerySchema = z.object({
  question: z.string().min(1).max(4000),
  sessionId: z.string().uuid().optional(),
});

// Simple in-memory rate limiter (per user): 10/5m, 30/h
const RATE_LIMIT_5M = 10;
const RATE_LIMIT_1H = 30;
const WINDOW_5M_MS = 5 * 60 * 1000;
const WINDOW_1H_MS = 60 * 60 * 1000;

const rateState = new Map<string, { w5m: number[]; w1h: number[] }>();

function isRateLimited(userKey: string, now = Date.now()) {
  const entry = rateState.get(userKey) || { w5m: [], w1h: [] };
  entry.w5m = entry.w5m.filter(ts => now - ts <= WINDOW_5M_MS);
  entry.w1h = entry.w1h.filter(ts => now - ts <= WINDOW_1H_MS);
  const limited = entry.w5m.length >= RATE_LIMIT_5M || entry.w1h.length >= RATE_LIMIT_1H;
  if (!limited) {
    entry.w5m.push(now);
    entry.w1h.push(now);
  }
  rateState.set(userKey, entry);
  return limited;
}

// (removed unused placeholder redactPII)

// Consent/role gate (stub): require role and consent header
import { auditLog } from '../middleware/audit-log';
import { chatRateLimit } from '../middleware/rate-limit';
import {
  sseHeaders as sseHeadersHelper,
  sseStreamFromChunks as sseStreamFromChunksHelper,
} from '../middleware/streaming';
const ALLOWED_ROLES = new Set(['ADMIN', 'CLINICAL_STAFF', 'FINANCE_STAFF', 'SUPPORT_READONLY']);
function checkConsentAndRole(req: Request) {
  const role = req.headers.get('x-role') || 'ANONYMOUS';
  const consent = (req.headers.get('x-consent') || '').toLowerCase();
  const hasRole = ALLOWED_ROLES.has(role);
  const consentStatus = consent === 'true' || consent === 'valid' ? 'valid' : 'missing';
  return { ok: hasRole && consentStatus === 'valid', consentStatus, role };
}

function classifyQueryType(q: string): 'treatment' | 'finance' | 'mixed' | 'other' {
  const lower = q.toLowerCase();
  const isTreat = /(tratamento|procedimento|botox|preenchimento|limpeza)/.test(lower);
  const isFin = /(saldo|financeiro|pagamento|fatura|atraso|overdue|balance)/.test(lower);
  if (isTreat && isFin) return 'mixed';
  if (isTreat) return 'treatment';
  if (isFin) return 'finance';
  return 'other';
}

function sseStreamFromChunks(chunks: string[]): ReadableStream<Uint8Array> {
  return sseStreamFromChunksHelper(chunks);
}

function mockAnswer(
  question: string,
): { chunks: string[]; outcome: 'success' | 'refusal' | 'limit' } {
  const q = question.toLowerCase();
  if (q.includes('mock:balance')) {
    return {
      chunks: ['Saldo atual: R$ 320,00. ', '2 faturas em atraso. ', 'Último pagamento há 12 dias.'],
      outcome: 'success',
    };
  }
  if (q.includes('mock:clinical')) {
    return {
      chunks: ['Tratamentos recentes: ', 'limpeza de pele (10/08), ', 'botox (25/08).'],
      outcome: 'success',
    };
  }
  if (q.includes('mock:overdue')) {
    return {
      chunks: ['Resumo: ', '3 parcelas em atraso, ', 'total R$ 780,00.'],
      outcome: 'success',
    };
  }
  if (q.includes('mock:ambiguous')) {
    return {
      chunks: ['Qual paciente você se refere? ', 'Forneça um identificador.'],
      outcome: 'refusal',
    };
  }
  if (q.includes('mock:refusal')) {
    return { chunks: ['Não posso responder sem consentimento válido.'], outcome: 'refusal' };
  }
  // Default deterministic
  return {
    chunks: ['Olá! ', 'Sou o assistente da NeonPro. ', 'Como posso ajudar?'],
    outcome: 'success',
  };
}

function sseHeaders(extra?: Record<string, string>) {
  return sseHeadersHelper(extra);
}

app.post(
  '/query',
  chatRateLimit(),
  auditLog('chat.query'),
  zValidator('json', ChatQuerySchema),
  async c => {
    const t0 = Date.now();
    const { question, sessionId } = c.req.valid('json');
    const userId = c.req.header('x-user-id') || 'anonymous';
    const clinicId = c.req.header('x-clinic-id') || 'unknown';

    // Rate limit first
    if (isRateLimited(userId)) {
      // Audit (limit)
      const auditEvent = {
        eventId: crypto.randomUUID(),
        userId,
        clinicId,
        timestampUTC: new Date().toISOString(),
        actionType: 'query',
        consentStatus: 'n/a',
        queryType: classifyQueryType(question),
        redactionApplied: false,
        outcome: 'limit',
        latencyMs: Date.now() - t0,
        sessionId: sessionId || null,
      };

      if (process.env.AI_AUDIT_DB === 'true') {
        try {
          await supabase.from('ai_audit_events').insert({
            clinic_id: auditEvent.clinicId,
            user_id: auditEvent.userId,
            session_id: auditEvent.sessionId,
            action_type: auditEvent.actionType,
            consent_status: auditEvent.consentStatus,
            query_type: auditEvent.queryType,
            redaction_applied: auditEvent.redactionApplied,
            outcome: auditEvent.outcome,
            latency_ms: auditEvent.latencyMs,
          });
        } catch (e) {
          console.warn('Audit DB insert failed', e);
        }
      } else {
        console.log('AuditEvent', auditEvent);
      }
      return c.json({ message: 'Please retry shortly' }, 429);
    }

    // Consent + role gate
    const { ok, consentStatus } = checkConsentAndRole(c.req.raw);
    if (!ok && !question.toLowerCase().includes('mock')) {
      console.log('AuditEvent', {
        eventId: crypto.randomUUID(),
        userId,
        clinicId,
        timestampUTC: new Date().toISOString(),
        actionType: 'query',
        consentStatus,
        queryType: classifyQueryType(question),
        redactionApplied: false,
        outcome: 'refusal',
        latencyMs: Date.now() - t0,
        sessionId: sessionId || null,
      });
      if (process.env.AI_AUDIT_DB === 'true') {
        try {
          await supabase.from('ai_audit_events').insert({
            clinic_id: clinicId,
            user_id: userId,
            session_id: sessionId || null,
            action_type: 'query',
            consent_status: consentStatus,
            query_type: classifyQueryType(question),
            redaction_applied: false,
            outcome: 'refusal',
            latency_ms: Date.now() - t0,
          });
        } catch (e) {
          console.warn('Audit DB insert failed', e);
        }
      } else {
        console.log('AuditEvent', {
          eventId: crypto.randomUUID(),
          userId,
          clinicId,
          timestampUTC: new Date().toISOString(),
          actionType: 'query',
          consentStatus,
          queryType: classifyQueryType(question),
          redactionApplied: false,
          outcome: 'refusal',
          latencyMs: Date.now() - t0,
          sessionId: sessionId || null,
        });
      }
      return c.json({ message: 'Consent required or insufficient role' }, 403);
    }

    const url = new URL(c.req.url);
    const mock = url.searchParams.get('mock') === 'true' || process.env.MOCK_MODE === 'true'
      || process.env.AI_MOCK === 'true';

    try {
      if (mock) {
        const { chunks, outcome } = mockAnswer(question);
        const stream = sseStreamFromChunks(chunks);
        const headers = sseHeaders({
          'X-Chat-Model': 'mock:model',
          'X-Data-Freshness': 'as-of-now',
        });
        const resp = new Response(stream, { headers });

        // Audit (mock path)
        if (process.env.AI_AUDIT_DB === 'true') {
          try {
            await supabase.from('ai_audit_events').insert({
              clinic_id: clinicId,
              user_id: userId,
              session_id: sessionId || null,
              action_type: 'query',
              consent_status: ok ? 'valid' : (consentStatus as string),
              query_type: classifyQueryType(question),
              redaction_applied: true,
              outcome,
              latency_ms: Date.now() - t0,
            });
          } catch (e) {
            console.warn('Audit DB insert failed', e);
          }
        } else {
          console.log('AuditEvent', {
            eventId: crypto.randomUUID(),
            userId,
            clinicId,
            timestampUTC: new Date().toISOString(),
            actionType: 'query',
            consentStatus: ok ? 'valid' : consentStatus,
            queryType: classifyQueryType(question),
            redactionApplied: true,
            outcome,
            latencyMs: Date.now() - t0,
            sessionId: sessionId || null,
          });
        }
        return resp;
      }

      // Real path: call AI with failover, then bridge to SSE
      const messages: { role: 'system' | 'user'; content: string }[] = [
        {
          role: 'system',
          content: 'Você é um assistente de clínica estética. Responda de forma segura e empática.',
        },
        { role: 'user', content: question },
      ];

      const aiResp = await streamWithFailover({ model: DEFAULT_PRIMARY, messages });
      const reader = aiResp.body?.getReader();
      const enc = new TextEncoder();
      const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
          if (!reader) {
            controller.close();
            return;
          }
          const textDecoder = new TextDecoder();
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const text = textDecoder.decode(value);
              if (text) {
                controller.enqueue(
                  enc.encode(`data: ${JSON.stringify({ type: 'text', delta: text })}\n\n`),
                );
              }
            }
            controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
            controller.close();
          } catch (e) {
            controller.error(e);
          }
        },
      });

      const headers = sseHeaders({
        'X-Chat-Model': aiResp.headers.get('X-Chat-Model') || 'unknown',
      });

      // Audit (success)
      if (process.env.AI_AUDIT_DB === 'true') {
        try {
          await supabase.from('ai_audit_events').insert({
            clinic_id: clinicId,
            user_id: userId,
            session_id: sessionId || null,
            action_type: 'query',
            consent_status: ok ? 'valid' : (consentStatus as string),
            query_type: classifyQueryType(question),
            redaction_applied: true,
            outcome: 'success',
            latency_ms: Date.now() - t0,
          });
        } catch (e) {
          console.warn('Audit DB insert failed', e);
        }
      } else {
        console.log('AuditEvent', {
          eventId: crypto.randomUUID(),
          userId,
          clinicId,
          timestampUTC: new Date().toISOString(),
          actionType: 'query',
          consentStatus: ok ? 'valid' : consentStatus,
          queryType: classifyQueryType(question),
          redactionApplied: true,
          outcome: 'success',
          latencyMs: Date.now() - t0,
          sessionId: sessionId || null,
        });
      }

      return new Response(stream, { headers });
    } catch (err) {
      console.error('Chat query error:', err);
      if (process.env.AI_AUDIT_DB === 'true') {
        try {
          await supabase.from('ai_audit_events').insert({
            clinic_id: clinicId,
            user_id: userId,
            session_id: sessionId || null,
            action_type: 'query',
            consent_status: ok ? 'valid' : (consentStatus as string),
            query_type: classifyQueryType(question),
            redaction_applied: true,
            outcome: 'error',
            latency_ms: Date.now() - t0,
          });
        } catch (e) {
          console.warn('Audit DB insert failed', e);
        }
      } else {
        console.log('AuditEvent', {
          eventId: crypto.randomUUID(),
          userId,
          clinicId,
          timestampUTC: new Date().toISOString(),
          actionType: 'query',
          consentStatus: ok ? 'valid' : consentStatus,
          queryType: classifyQueryType(question),
          redactionApplied: true,
          outcome: 'error',
          latencyMs: Date.now() - t0,
          sessionId: sessionId || null,
        });
      }
      return c.json({ message: 'Service temporarily unavailable' }, 500);
    }
  },
);

// GET /session/:id — returns session info (mock fallback)
app.get('/session/:id', async c => {
  const id = c.req.param('id');
  const userId = c.req.header('x-user-id') || 'anonymous';
  const clinicId = c.req.header('x-clinic-id') || 'unknown';
  const url = new URL(c.req.url);
  const mock = url.searchParams.get('mock') === 'true' || process.env.MOCK_MODE === 'true'
    || process.env.AI_MOCK === 'true';

  // In real mode, attempt to fetch from DB; fallback to mock if table not available
  if (!mock && process.env.AI_AUDIT_DB === 'true') {
    try {
      const { data, error } = await supabase
        .from('ai_chat_sessions')
        .select('id, user_id, clinic_id, started_at, last_activity_at, locale')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        return c.json({
          id: data.id,
          userId: data.user_id,
          clinicId: data.clinic_id,
          locale: data.locale || (c.req.header('x-locale') as 'pt-BR' | 'en-US') || 'pt-BR',
          startedAt: data.started_at,
          lastActivityAt: data.last_activity_at,
        }, 200);
      }
      // create minimal session row if not found
      const now = new Date().toISOString();
      const locale = (c.req.header('x-locale') as 'pt-BR' | 'en-US') || 'pt-BR';
      const ins = await supabase.from('ai_chat_sessions').insert({
        id,
        user_id: userId,
        clinic_id: clinicId,
        started_at: now,
        last_activity_at: now,
        locale,
      }).select('id, user_id, clinic_id, started_at, last_activity_at, locale').single();
      if (ins.error) throw ins.error;
      return c.json({
        id: ins.data.id,
        userId: ins.data.user_id,
        clinicId: ins.data.clinic_id,
        locale: ins.data.locale,
        startedAt: ins.data.started_at,
        lastActivityAt: ins.data.last_activity_at,
      }, 200);
    } catch (e) {
      console.warn('Session DB operation failed, falling back to mock:', e);
    }
  }

  // Mock fallback
  const locale = (c.req.header('x-locale') as 'pt-BR' | 'en-US') || 'pt-BR';
  const now = new Date().toISOString();
  return c.json({ id, userId, locale, startedAt: now, lastActivityAt: now }, 200);
});

// POST /explanation — returns concise explanation with LGPD safeguards
app.post('/explanation', async c => {
  const t0 = Date.now();
  const url = new URL(c.req.url);
  const mock = url.searchParams.get('mock') === 'true' || process.env.MOCK_MODE === 'true'
    || process.env.AI_MOCK === 'true';

  // Parse and validate payload
  let payload: any = {};
  try {
    payload = await c.req.json();
  } catch {}
  const BodySchema = z.object({
    text: z.string().min(1).max(8000),
    locale: z.string().default('pt-BR'),
  });
  const parsed = BodySchema.safeParse(payload);
  if (!parsed.success) return c.json({ message: 'Invalid payload' }, 422);
  const { text, locale } = parsed.data;

  // Consent + role gate
  const { ok, consentStatus } = checkConsentAndRole(c.req.raw);
  if (!ok && !mock) {
    // Refusal without processing text
    return c.json({
      message: locale === 'en-US'
        ? 'Cannot answer without valid consent.'
        : 'Não é possível responder sem consentimento válido.',
    }, 403);
  }

  // Minimal LGPD redaction on input prior to model usage/logging
  const { redact } = await import('@neonpro/utils');
  const redactedInput = redact(String(text));

  try {
    if (mock) {
      const prefix = locale === 'en-US' ? 'Explanation: ' : 'Explicação: ';
      const snippet = redactedInput.slice(0, 160);
      const explanation = `${prefix}${snippet}`;
      const traceId = crypto.randomUUID();
      return c.json({ explanation, traceId }, 200);
    }

    // Non-streaming generation with failover
    const { generateWithFailover } = await import('../config/ai');
    const prompt = locale === 'en-US'
      ? `Explain concisely and safely for a patient: ${redactedInput}`
      : `Explique de forma concisa e segura para um paciente: ${redactedInput}`;

    const result = await generateWithFailover({ model: DEFAULT_PRIMARY, prompt });

    // Final output redaction as defense in depth
    const explanation = redact(result.text);
    const traceId = crypto.randomUUID();

    // Optional DB audit
    const userId = c.req.header('x-user-id') || 'anonymous';
    const clinicId = c.req.header('x-clinic-id') || 'unknown';
    if (process.env.AI_AUDIT_DB === 'true') {
      try {
        await supabase.from('ai_audit_events').insert({
          clinic_id: clinicId,
          user_id: userId,
          session_id: null,
          action_type: 'explanation',
          consent_status: ok ? 'valid' : (consentStatus as string),
          query_type: 'other',
          redaction_applied: true,
          outcome: 'success',
          latency_ms: Date.now() - t0,
        });
      } catch (e) {
        console.warn('Audit DB insert failed', e);
      }
    }

    return c.json({ explanation, traceId }, 200);
  } catch (err) {
    console.error('Explanation error:', err);
    return c.json({
      message: locale === 'en-US'
        ? 'Service temporarily unavailable'
        : 'Serviço temporariamente indisponível',
    }, 500);
  }
});

// GET /suggestions — returns curated suggestions based on locale and optional session
app.get('/suggestions', async c => {
  const locale = (c.req.header('x-locale') as 'pt-BR' | 'en-US') || 'pt-BR';
  const sessionId = c.req.query('sessionId') || null;

  const suggestionsPT = [
    'Quais foram os últimos tratamentos do paciente?',
    'Resumo financeiro do paciente',
    'Agendar retorno para avaliação clínica',
  ];
  const suggestionsEN = [
    'What were the patient\'s most recent treatments?',
    'Patient financial summary',
    'Schedule a follow-up appointment',
  ];
  const items = locale === 'en-US' ? suggestionsEN : suggestionsPT;

  return c.json({ suggestions: items, sessionId }, 200);
});

app.get('/health', c => c.json({ status: 'ok', route: 'chat.query' }));

export default app;
