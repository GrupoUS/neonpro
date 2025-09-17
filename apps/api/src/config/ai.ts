import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import type { CoreMessage } from 'ai';
import { generateText, streamText } from 'ai';

export type Provider = 'openai' | 'google' | 'anthropic';

export const MODEL_REGISTRY = {
  'gpt-5-mini': { provider: 'openai' as Provider, active: true, label: 'ChatGPT 5 Mini' },
  'gemini-2.5-flash': { provider: 'google' as Provider, active: true, label: 'Gemini Flash 2.5' },
  'claude-3-5-sonnet': {
    provider: 'anthropic' as Provider,
    active: true,
    label: 'Claude 3.5 Sonnet',
  },
  'gpt-4o-mini': { provider: 'openai' as Provider, active: false, label: 'GPT-4o Mini' },
  'o4-mini': { provider: 'openai' as Provider, active: false, label: 'o4-mini' },
  'gemini-1.5-pro': { provider: 'google' as Provider, active: false, label: 'Gemini 1.5 Pro' },
} as const;

export const DEFAULT_PRIMARY = 'gpt-5-mini' as const;
export const DEFAULT_SECONDARY = 'gemini-2.5-flash' as const;

export function resolveProvider(model: keyof typeof MODEL_REGISTRY) {
  const entry = MODEL_REGISTRY[model];
  const adapter = entry.provider === 'google'
    ? google
    : entry.provider === 'anthropic'
    ? anthropic
    : openai;
  return { provider: entry.provider, adapter };
}

export async function streamWithFailover(opts: {
  model: keyof typeof MODEL_REGISTRY;
  allowExperimental?: boolean;
  messages: CoreMessage[];
  temperature?: number;
  maxOutputTokens?: number;
  mock?: boolean;
}) {
  const { model, allowExperimental, messages, temperature = 0.7, maxOutputTokens = 1000, mock } =
    opts;

  const isActive = MODEL_REGISTRY[model]?.active;
  const chosen = isActive || allowExperimental ? model : DEFAULT_PRIMARY;

  if (mock) {
    const stream = new ReadableStream({
      start(controller) {
        const chunks = ['Olá! ', 'Sou o assistente da NeonPro. ', 'Como posso ajudar você hoje?'];
        let i = 0;
        const id = setInterval(() => {
          controller.enqueue(new TextEncoder().encode(chunks[i]));
          i++;
          if (i >= chunks.length) {
            clearInterval(id);
            controller.close();
          }
        }, 10);
      },
    });
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Chat-Model': 'mock:model',
        'X-Data-Freshness': 'as-of-now',
      },
    });
  }

  try {
    const { adapter } = resolveProvider(chosen);
    const result = await streamText({
      model: adapter(chosen),
      messages,
      temperature,
      maxOutputTokens,
    });
    return result.toTextStreamResponse({
      headers: {
        'X-Chat-Model': `${MODEL_REGISTRY[chosen].provider}:${chosen}`,
        'X-Data-Freshness': 'as-of-now',
      },
    });
  } catch (primaryError) {
    console.error('Primary AI provider failed:', primaryError);
    try {
      const { adapter } = resolveProvider(DEFAULT_SECONDARY);
      const result = await streamText({
        model: adapter(DEFAULT_SECONDARY),
        messages,
        temperature,
        maxOutputTokens,
      });
      return result.toTextStreamResponse({
        headers: { 'X-Chat-Model': `google:${DEFAULT_SECONDARY}` },
      });
    } catch (fallbackError) {
      console.error('Secondary AI provider failed:', fallbackError);
      throw new Error('Serviço de IA temporariamente indisponível');
    }
  }
}

export async function generateWithFailover(opts: {
  model: keyof typeof MODEL_REGISTRY;
  prompt: string;
  allowExperimental?: boolean;
  temperature?: number;
  maxOutputTokens?: number;
  mock?: boolean;
}) {
  const { model, prompt, allowExperimental, temperature = 0.7, maxOutputTokens = 400, mock } = opts;
  const isActive = MODEL_REGISTRY[model]?.active;
  const chosen = isActive || allowExperimental ? model : DEFAULT_PRIMARY;

  if (mock) {
    // Return a deterministic explanation for testing
    const text = `Explicação: ${prompt.slice(0, 80)}`;
    return {
      text,
      headers: new Headers({ 'X-Chat-Model': 'mock:model', 'X-Data-Freshness': 'as-of-now' }),
    };
  }

  try {
    const { adapter } = resolveProvider(chosen);
    const result = await generateText({
      model: adapter(chosen),
      prompt,
      temperature,
      maxOutputTokens,
    });
    return {
      text: result.text,
      headers: new Headers({ 'X-Chat-Model': `${MODEL_REGISTRY[chosen].provider}:${chosen}` }),
    };
  } catch (primaryError) {
    console.error('Primary AI provider failed:', primaryError);
    try {
      const { adapter } = resolveProvider(DEFAULT_SECONDARY);
      const result = await generateText({
        model: adapter(DEFAULT_SECONDARY),
        prompt,
        temperature,
        maxOutputTokens,
      });
      return {
        text: result.text,
        headers: new Headers({ 'X-Chat-Model': `google:${DEFAULT_SECONDARY}` }),
      };
    } catch (fallbackError) {
      console.error('Secondary AI provider failed:', fallbackError);
      throw new Error('Serviço de IA temporariamente indisponível');
    }
  }
}

export async function getSuggestionsFromAI(query: string, webHints: string[]) {
  const result = await generateText({
    model: openai(DEFAULT_PRIMARY),
    prompt:
      `Com base na consulta "${query}" sobre tratamentos estéticos, sugira 5 tratamentos relacionados da NeonPro. Considere estas pistas da web (se houver): ${
        webHints.join('; ')
      }. Responda apenas com lista separada por vírgulas, sem numeração.`,
    maxOutputTokens: 100,
  });
  return result.text
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 5);
}
