// Anthropic Claude provider (Phase 2) - Failover implementation

import type { AIProvider, GenerateAnswerInput, GenerateAnswerResult, StreamChunk } from './ai-provider.js';
import { AI_MODEL_CONFIG, ANTHROPIC_API_KEY } from '@neonpro/config/ai';

export class AnthropicProvider implements AIProvider {
  private apiKey: string;
  private baseURL: string;

  constructor(apiKey: string = ANTHROPIC_API_KEY) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.anthropic.com/v1';
  }

  async generateAnswer(input: GenerateAnswerInput): Promise<GenerateAnswerResult> {
    if (!this.apiKey) {
      throw new Error('Anthropic API key is required');
    }

    const config = AI_MODEL_CONFIG.anthropic;
    
    const response = await fetch(`${this.baseURL}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: input.maxTokens ?? config.maxTokens,
        temperature: input.temperature ?? config.temperature,
        system: input.system,
        messages: [{ role: 'user', content: input.prompt }],
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text ?? '';

    return {
      content,
      tokensUsed: data.usage?.output_tokens + data.usage?.input_tokens,
      model: data.model,
      finishReason: data.stop_reason === 'end_turn' ? 'stop' : data.stop_reason,
    };
  }

  async *generateStream(input: GenerateAnswerInput): AsyncIterable<StreamChunk> {
    if (!this.apiKey) {
      throw new Error('Anthropic API key is required');
    }

    const config = AI_MODEL_CONFIG.anthropic;
    
    const response = await fetch(`${this.baseURL}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: input.maxTokens ?? config.maxTokens,
        temperature: input.temperature ?? config.temperature,
        system: input.system,
        messages: [{ role: 'user', content: input.prompt }],
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${error}`);
    }

    if (!response.body) {
      throw new Error('No response body from Anthropic API');
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
            
            if (parsed.type === 'content_block_delta') {
              const delta = parsed.delta?.text;
              if (delta) {
                content += delta;
                yield {
                  content,
                  delta,
                  finished: false,
                };
              }
            }
            
            if (parsed.type === 'message_stop') {
              yield {
                content,
                finished: true,
                finishReason: 'stop',
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