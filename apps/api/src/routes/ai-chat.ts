// API Route: AI Chat for NeonPro Aesthetic Clinic
// Handles AI chat requests with LGPD compliance and audit logging

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText, streamText } from 'ai';

// Request validation schemas
const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1),
});

const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema),
  clientId: z.string().optional(),
  sessionId: z.string(),
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
};// Streaming AI response endpoint
app.post('/stream',
  zValidator('json', ChatRequestSchema),
  async (c) => {
    try {
      const { messages, clientId, sessionId } = c.req.valid('json');
      
      // Add system prompt
      const aiMessages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        ...messages
      ];
      
      // Primary provider (OpenAI GPT-4)
      try {
        const result = await streamText({
          model: openai('gpt-4o'),
          messages: aiMessages,
          maxOutputTokens: 1000,
          temperature: 0.7,
        });

        // Log interaction for audit trail
        const userMessage = messages[messages.length - 1]?.content || '';
        console.log('AI Chat Interaction:', {
          timestamp: new Date().toISOString(),
          sessionId,
          clientId: clientId || 'anonymous',
          userMessage: redactPII(userMessage),
          provider: 'openai-gpt4',
        });

        return result.toTextStreamResponse();
        
      } catch (primaryError) {
        console.error('Primary AI provider failed:', primaryError);
        
        // Fallback to secondary provider (Anthropic Claude)
        try {
          const userMessage = messages[messages.length - 1]?.content || '';
          const fallbackResult = await streamText({
            model: anthropic('claude-3-5-sonnet-20241022'),
            messages: aiMessages,
            maxOutputTokens: 1000,
            temperature: 0.7,
          });

          console.log('AI Chat Interaction (Fallback):', {
            timestamp: new Date().toISOString(),
            sessionId,
            clientId: clientId || 'anonymous',
            userMessage: redactPII(userMessage),
            provider: 'anthropic-claude',
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
      
      const result = await generateText({
        model: openai('gpt-4o'),
        prompt: `Com base na consulta "${query}" sobre tratamentos estéticos, sugira 5 tratamentos relacionados da NeonPro. Responda apenas com lista separada por vírgulas, sem numeração.`,
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
      anthropic: 'available',
    }
  });
});

export default app;