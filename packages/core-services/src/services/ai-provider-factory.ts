// AI Provider Factory (Phase 2) - Provider selection and failover logic

import type { AIProvider, AIMessage } from './ai-provider.js';
import { OpenAIProvider } from './openai-provider.js';
import { AnthropicProvider } from './anthropic-provider.js';
import { GoogleAIProvider } from './google-provider.js';
import { AI_PROVIDER, aiConfig } from '@neonpro/config/ai';
import { createError } from '@neonpro/utils/errors';

export type AIProviderType = 'openai' | 'anthropic' | 'google' | 'mock';

// Mock provider for development and testing
class MockProvider implements AIProvider {
  async generateCompletion(messages: AIMessage[]) {
    const lastMessage = messages[messages.length - 1];
    const prompt = lastMessage?.content || 'Hello';
    
    return {
      content: `Mock response for: ${prompt.slice(0, 100)}...`,
      usage: {
        prompt_tokens: Math.min(256, prompt.length),
        completion_tokens: 50,
        total_tokens: Math.min(306, prompt.length + 50)
      },
      model: 'mock-provider'
    };
  }

  async *generateStreamingCompletion(messages: AIMessage[]) {
    const lastMessage = messages[messages.length - 1];
    const content = lastMessage?.content || 'Hello';
    const response = `Mock streaming response for: ${content.slice(0, 100)}...`;
    const words = response.split(' ');
    
    for (const word of words) {
      yield word + ' ';
      // Simulate streaming delay
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
}

export class AIProviderFactory {
  private static providers: Map<AIProviderType, AIProvider> = new Map();
  private static fallbackOrder: AIProviderType[] = ['openai', 'anthropic', 'google', 'mock'];

  static getProvider(providerName?: AIProviderType): AIProvider {
    // Use mock mode if enabled
    if (aiConfig.AI_CHAT_MOCK_MODE) {
      return this.getCachedProvider('mock');
    }

    const selectedProvider = (providerName || AI_PROVIDER) as AIProviderType;
    return this.getCachedProvider(selectedProvider);
  }

  private static getCachedProvider(providerName: AIProviderType): AIProvider {
    if (!this.providers.has(providerName)) {
      this.providers.set(providerName, this.createProvider(providerName));
    }
    return this.providers.get(providerName)!;
  }

  private static createProvider(providerName: AIProviderType): AIProvider {
    switch (providerName.toLowerCase()) {
      case 'openai':
        if (!aiConfig.OPENAI_API_KEY) {
          throw createError('CONFIGURATION_ERROR', 'OpenAI API key not configured');
        }
        return new OpenAIProvider(aiConfig.OPENAI_API_KEY, aiConfig.OPENAI_MODEL);
        
      case 'anthropic':
        if (!aiConfig.ANTHROPIC_API_KEY) {
          throw createError('CONFIGURATION_ERROR', 'Anthropic API key not configured');
        }
        return new AnthropicProvider(aiConfig.ANTHROPIC_API_KEY, aiConfig.ANTHROPIC_MODEL);
        
      case 'google':
        if (!aiConfig.GOOGLE_AI_API_KEY) {
          throw createError('CONFIGURATION_ERROR', 'Google AI API key not configured');
        }
        return new GoogleAIProvider(aiConfig.GOOGLE_AI_API_KEY);
        
      case 'mock':
        return new MockProvider();
        
      default:
        console.warn(`Unknown AI provider: ${providerName}, falling back to mock`);
        return new MockProvider();
    }
  }

  /**
   * Try to generate completion with automatic failover
   */
  static async generateWithFailover(messages: AIMessage[], maxRetries = 2): Promise<any> {
    let lastError: Error | null = null;
    
    for (let i = 0; i < Math.min(maxRetries, this.fallbackOrder.length); i++) {
      const providerName = this.fallbackOrder[i];
      
      try {
        const provider = this.getProvider(providerName);
        const startTime = Date.now();
        const result = await provider.generateCompletion(messages);
        const latency = Date.now() - startTime;
        
        console.log(`AI response generated successfully with ${providerName} (${latency}ms)`);
        return { ...result, provider: providerName, latency };
      } catch (error) {
        lastError = error as Error;
        console.warn(`AI provider ${providerName} failed:`, error);
        
        // Don't retry on certain error types
        if (error instanceof Error && error.message.includes('API key')) {
          continue; // Try next provider
        }
      }
    }
    
    throw lastError || new Error('All AI providers failed');
  }

  /**
   * Stream with automatic failover
   */
  static async *generateStreamWithFailover(messages: AIMessage[], maxRetries = 2): AsyncIterable<string> {
    let lastError: Error | null = null;
    
    for (let i = 0; i < Math.min(maxRetries, this.fallbackOrder.length); i++) {
      const providerName = this.fallbackOrder[i];
      
      try {
        const provider = this.getProvider(providerName);
        
        for await (const chunk of provider.generateStreamingCompletion(messages)) {
          yield chunk;
        }
        return; // Success, no need to try other providers
      } catch (error) {
        lastError = error as Error;
        console.warn(`AI provider ${providerName} failed for streaming:`, error);
        continue; // Try next provider
      }
    }
    
    throw lastError || new Error('All AI providers failed for streaming');
  }

  /**
   * Get available providers based on configuration
   */
  static getAvailableProviders(): AIProviderType[] {
    const available: AIProviderType[] = [];
    
    if (aiConfig.OPENAI_API_KEY) available.push('openai');
    if (aiConfig.ANTHROPIC_API_KEY) available.push('anthropic');
    if (aiConfig.GOOGLE_AI_API_KEY) available.push('google');
    available.push('mock'); // Always available
    
    return available;
  }
}

// Export default factory
export const aiProviderFactory = AIProviderFactory;