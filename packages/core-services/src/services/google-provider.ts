import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AIProvider, AIMessage, AIResponse } from './ai-provider.js';
import { createError } from '@neonpro/utils/errors';

export class GoogleAIProvider implements AIProvider {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw createError('VALIDATION_ERROR', 'Google AI API key is required');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async generateCompletion(messages: AIMessage[]): Promise<AIResponse> {
    try {
      // Convert messages to Google AI format
      const prompt = this.convertMessagesToPrompt(messages);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        content: text,
        usage: {
          prompt_tokens: 0, // Google AI doesn't provide token counts
          completion_tokens: 0,
          total_tokens: 0
        },
        model: 'gemini-pro'
      };
    } catch (error) {
      throw createError('AI_API_ERROR', `Google AI completion failed: ${error}`);
    }
  }

  async *generateStreamingCompletion(messages: AIMessage[]): AsyncGenerator<string, void, unknown> {
    try {
      // Convert messages to Google AI format
      const prompt = this.convertMessagesToPrompt(messages);
      
      const result = await this.model.generateContentStream(prompt);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          yield chunkText;
        }
      }
    } catch (error) {
      throw createError('AI_API_ERROR', `Google AI streaming failed: ${error}`);
    }
  }

  private convertMessagesToPrompt(messages: AIMessage[]): string {
    // Convert OpenAI-style messages to a single prompt for Google AI
    return messages
      .map(msg => {
        const rolePrefix = msg.role === 'user' ? 'Human: ' : 
                          msg.role === 'assistant' ? 'Assistant: ' : 
                          'System: ';
        return `${rolePrefix}${msg.content}`;
      })
      .join('\n\n');
  }
}