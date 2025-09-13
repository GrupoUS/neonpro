// API Route: AI Chat for NeonPro Aesthetic Clinic
// Handles AI chat requests with LGPD compliance and audit logging

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { generateText, streamText } from 'ai';

// Request validation schemas
const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1),
});

const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).default([]),
  text: z.string().optional(),
  presetId: z.string().optional(),
  params: z.record(z.any()).optional(),
  locale: z.string().default('pt-BR'),
  clientId: z.string().optional(),
  sessionId: z.string(),
  model: z.string().optional(),
});

const app = new Hono();

// Enable CORS for browser requests
app.use('*', cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://neonpro.vercel.app'] 
    : ['http://localhost:5173'],
  allowMethods: ['GET', 'POST'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

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

Responda sempre de forma útil, segura e focada em estética.`;

// PII redaction for LGPD compliance
const redactPII = (text: string): string => {
  return text
    .replace(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, '[CPF_REDACTED]')
    .replace(/\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g, '[CNPJ_REDACTED]')
    .replace(/\b\d{2}\s?\d{4,5}-?\d{4}\b/g, '[PHONE_REDACTED]')
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_REDACTED]');
};// Allowed models registry
const MODEL_REGISTRY = {
  'gpt-5-mini': { provider: 'openai', active: true, label: 'ChatGPT 5 Mini' },
  'gemini-2.5-flash': { provider: 'google', active: true, label: 'Gemini Flash 2.5' },
  // Experimental (present but inactive by default)
  'gpt-4o-mini': { provider: 'openai', active: false, label: 'GPT-4o Mini' },
  'o4-mini': { provider: 'openai', active: false, label: 'o4-mini' },
  'gemini-1.5-pro': { provider: 'google', active: false, label: 'Gemini 1.5 Pro' },
} as const;

const DEFAULT_PRIMARY = 'gpt-5-mini' as const;
const DEFAULT_SECONDARY = 'gemini-2.5-flash' as const;

// Streaming AI response endpoint
app.post('/stream',
  zValidator('json', ChatRequestSchema),
  async (c) => {
    try {
      const { messages, text, presetId, params, locale, clientId, sessionId, model } = c.req.valid('json');
      
      // Resolve model: allow only active models unless allowExperimental=true
      const url = new URL(c.req.url);
      const allowExperimental = url.searchParams.get('allowExperimental') === 'true';
      const mockMode = url.searchParams.get('mock') === 'true' || process.env.AI_MOCK === 'true' || (!process.env.OPENAI_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY);
      const requestedModel = model && MODEL_REGISTRY[model as keyof typeof MODEL_REGISTRY]
        ? model as keyof typeof MODEL_REGISTRY
        : undefined;
      const isAllowed = requestedModel
        ? (MODEL_REGISTRY[requestedModel].active || allowExperimental)
        : true;
      const chosenPrimary = isAllowed && requestedModel ? requestedModel : DEFAULT_PRIMARY;

      // Add system prompt
      const mergedMessages = messages.length > 0 ? messages : (text ? [{ role: 'user' as const, content: text }] : [])
      const aiMessages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        ...mergedMessages,
      ];
      
      // Primary provider or mock
      try {
        let modelHeader = `${MODEL_REGISTRY[chosenPrimary].provider}:${chosenPrimary}`
        if (mockMode) {
          const stream = new ReadableStream({
            start(controller) {
              const chunks = [
                'Olá! ',
                'Sou o assistente da NeonPro. ',
                'Como posso ajudar você hoje?'
              ]
              let i = 0
              const interval = setInterval(() => {
                controller.enqueue(new TextEncoder().encode(chunks[i]))
                i++
                if (i >= chunks.length) {
                  clearInterval(interval)
                  controller.close()
                }
              }, 10)
            }
          })

          const startedAt = new Date().toISOString()
          const response = new Response(stream, {
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'X-Chat-Started-At': startedAt,
              'X-Chat-Model': 'mock:model',
              'X-Data-Freshness': 'as-of-now'
            }
          })

          const lastContent = mergedMessages[mergedMessages.length - 1]?.content || ''
          console.log('AI Chat Interaction (Mock):', {
            timestamp: startedAt,
            sessionId,
            clientId: clientId || 'anonymous',
            userMessage: redactPII(lastContent),
            provider: 'mock:model',
            locale,
            presetId: presetId || null,
          })
          return response
        }

        const provider = MODEL_REGISTRY[chosenPrimary].provider;
        const modelAdapter = provider === 'google' ? google : openai;
        const startedAt = new Date().toISOString();
        const result = await streamText({
          model: modelAdapter(chosenPrimary),
          messages: aiMessages,
          maxOutputTokens: 1000,
          temperature: 0.7,
        });

        // Log interaction for audit trail
        const lastContent = mergedMessages[mergedMessages.length - 1]?.content || '';
        console.log('AI Chat Interaction:', {
          timestamp: startedAt,
          sessionId,
          clientId: clientId || 'anonymous',
          userMessage: redactPII(lastContent),
          provider: `${MODEL_REGISTRY[chosenPrimary].provider}-${chosenPrimary}`,
          locale,
          presetId: presetId || null,
        });

        // Wrap stream with minimal metadata headers
        return result.toTextStreamResponse({
          headers: {
            'X-Chat-Started-At': startedAt,
            'X-Chat-Model': modelHeader,
            'X-Data-Freshness': 'as-of-now'
          }
        });
        
      } catch (primaryError) {
        console.error('Primary AI provider failed:', primaryError);
        
        // Fallback to secondary provider (fixed active secondary)
        try {
          const userMessage = messages[messages.length - 1]?.content || '';
          const fallbackResult = await streamText({
            model: google(DEFAULT_SECONDARY),
            messages: aiMessages,
            maxOutputTokens: 1000,
            temperature: 0.7,
          });

          console.log('AI Chat Interaction (Fallback):', {
            timestamp: new Date().toISOString(),
            sessionId,
            clientId: clientId || 'anonymous',
            userMessage: redactPII(userMessage),
            provider: `google-${DEFAULT_SECONDARY}`,
          });

          return fallbackResult.toTextStreamResponse();
          
        } catch (fallbackError) {
          console.error('Secondary AI provider failed:', fallbackError);
          throw new Error('Serviço de IA temporariamente indisponível');
        }
      }
      
    } catch (error) {
      console.error('AI chat error:', error);
      return c.json({
        error: 'Erro interno do servidor',
        message: 'Não foi possível processar sua solicitação'
      }, 500);
    }
  }
);// Search suggestions endpoint
app.post('/suggestions',
  zValidator('json', z.object({
    query: z.string().min(1),
    sessionId: z.string(),
  })),
  async (c) => {
    try {
      const { query, sessionId } = c.req.valid('json');

      // Optional: Web search enrichment with Tavily (if API key present)
      const tavilyKey = process.env.TAVILY_API_KEY;
      let webHints: string[] = [];
      if (tavilyKey && query.length > 3) {
        try {
          const resp = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tavilyKey}` },
            body: JSON.stringify({ query, max_results: 5, search_depth: 'basic' }),
          });
          if (resp.ok) {
            const data = await resp.json();
            webHints = Array.isArray(data?.results)
              ? data.results.map((r: any) => r.title).filter(Boolean).slice(0, 5)
              : [];
          }
        } catch (e) {
          console.warn('Tavily search failed, continuing without web hints');
        }
      }
      
      const result = await generateText({
        model: openai(DEFAULT_PRIMARY),
        prompt: `Com base na consulta "${query}" sobre tratamentos estéticos, sugira 5 tratamentos relacionados da NeonPro. Considere estas pistas da web (se houver): ${webHints.join('; ')}. Responda apenas com lista separada por vírgulas, sem numeração.`,
        maxOutputTokens: 100,
      });

      const suggestions = result.text
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .slice(0, 5);

      console.log('Search Suggestions:', {
        timestamp: new Date().toISOString(),
        sessionId,
        query: redactPII(query),
        suggestionsCount: suggestions.length,
      });

      return c.json({ suggestions });
      
    } catch (error) {
      console.error('Search suggestions error:', error);
      
      // Fallback suggestions
      const fallbackSuggestions = [
        'Botox para rugas',
        'Preenchimento labial',
        'Limpeza de pele profunda',
        'Harmonização facial',
        'Peeling químico'
      ];
      
      return c.json({ suggestions: fallbackSuggestions });
    }
  }
);

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
  });
});

export default app;