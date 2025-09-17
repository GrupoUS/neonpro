// OpenAI provider (Phase 2) - Real implementation with streaming support

import type { AIProvider, GenerateAnswerInput, GenerateAnswerResult, StreamChunk } from './ai-provider.js';
import { AI_MODEL_CONFIG, OPENAI_API_KEY } from '@neonpro/config';

export class OpenAIProvider implements AIProvider {
  private apiKey: string;
  private baseURL: string;

  constructor(apiKey: string = OPENAI_API_KEY) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.openai.com/v1';
  }

  async generateAnswer(input: GenerateAnswerInput): Promise<GenerateAnswerResult> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    const config = AI_MODEL_CONFIG.openai;
    const messages = [
      ...(input.system ? [{ role: 'system' as const, content: input.system }] : []),
      { role: 'user' as const, content: input.prompt }
    ];

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        max_tokens: input.maxTokens ?? config.maxTokens,
        temperature: input.temperature ?? config.temperature,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    
    if (!choice) {
      throw new Error('No response from OpenAI API');
    }

    return {
      content: choice.message?.content ?? '',
      tokensUsed: data.usage?.total_tokens,
      model: data.model,
      finishReason: choice.finish_reason,
    };
  }

  async *generateStream(input: GenerateAnswerInput): AsyncIterable<StreamChunk> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    const config = AI_MODEL_CONFIG.openai;
    const messages = [
      ...(input.system ? [{ role: 'system' as const, content: input.system }] : []),
      { role: 'user' as const, content: input.prompt }
    ];

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        max_tokens: input.maxTokens ?? config.maxTokens,
        temperature: input.temperature ?? config.temperature,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    if (!response.body) {
      throw new Error('No response body from OpenAI API');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let content = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          yield {
            content,
            finished: true,
            finishReason: 'stop',
          };
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          
          const data = trimmed.slice(6); // Remove "data: "
          if (data === '[DONE]') {
            yield {
              content,
              finished: true,
              finishReason: 'stop',
            };
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const choice = parsed.choices?.[0];
            const delta = choice?.delta?.content;
            
            if (delta) {
              content += delta;
              yield {
                content,
                delta,
                finished: false,
              };
            }
            
            if (choice?.finish_reason) {
              yield {
                content,
                finished: true,
                finishReason: choice.finish_reason,
              };
              return;
            }
          } catch (parseError) {
            // Skip invalid JSON lines
            continue;
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}
