// T045: Mock AI provider for testing purposes
import type { 
  AIProvider, 
  ChatMessage, 
  ChatResponse, 
  StreamingChatResponse,
  AIProviderConfig 
} from '@neonpro/types';

export interface MockAIProviderConfig extends AIProviderConfig {
  responses?: MockResponse[];
  latency?: {
    min: number;
    max: number;
  };
  failureRate?: number;
  streamingChunkSize?: number;
  streamingDelay?: number;
  rateLimits?: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
}

export interface MockResponse {
  trigger?: string | RegExp;
  response: string;
  metadata?: Record<string, any>;
  error?: boolean;
  tokens?: {
    input: number;
    output: number;
  };
}

export class MockAIProvider {
  private config: MockAIProviderConfig;

  constructor(config: MockAIProviderConfig) {
    this.config = {
      latency: { min: 100, max: 500 },
      failureRate: 0,
      streamingChunkSize: 10,
      streamingDelay: 50,
      responses: [],
      ...config,
    };
  }

  async chat(messages: ChatMessage[], options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    streaming?: boolean;
  }): Promise<ChatResponse | StreamingChatResponse> {
    await this.simulateLatency();

    // Simulate random failures
    if (Math.random() < (this.config.failureRate || 0)) {
      throw new Error('Mock AI provider simulated failure');
    }

    const lastMessage = messages[messages.length - 1];
    const response = this.generateResponse(lastMessage.content);

    if (options?.streaming) {
      return this.createStreamingResponse(response);
    }

    return this.createResponse(response);
  }

  private generateResponse(input: string): MockResponse {
    // Check for custom responses
    for (const mockResponse of this.config.responses || []) {
      if (this.matchesTrigger(input, mockResponse.trigger)) {
        return mockResponse;
      }
    }

    // Default responses based on input patterns
    const defaultResponses = this.getDefaultResponses();
    
    for (const defaultResponse of defaultResponses) {
      if (this.matchesTrigger(input, defaultResponse.trigger)) {
        return defaultResponse;
      }
    }

    // Fallback response
    return {
      response: `I understand you said: "${input}". This is a mock response for testing purposes.`,
      tokens: {
        input: this.estimateTokens(input),
        output: this.estimateTokens('mock response'),
      },
    };
  }

  private matchesTrigger(input: string, trigger?: string | RegExp): boolean {
    if (!trigger) return false;
    
    if (typeof trigger === 'string') {
      return input.toLowerCase().includes(trigger.toLowerCase());
    }
    
    return trigger.test(input);
  }

  private getDefaultResponses(): MockResponse[] {
    return [
      {
        trigger: /hello|hi|hey/i,
        response: 'Hello! How can I help you today?',
        tokens: { input: 1, output: 8 },
      },
      {
        trigger: /help|assist/i,
        response: 'I\'m here to help! What do you need assistance with?',
        tokens: { input: 1, output: 12 },
      },
      {
        trigger: /error|problem|issue/i,
        response: 'I understand you\'re experiencing an issue. Can you provide more details?',
        tokens: { input: 3, output: 15 },
      },
      {
        trigger: /thank|thanks/i,
        response: 'You\'re welcome! Is there anything else I can help you with?',
        tokens: { input: 1, output: 13 },
      },
      {
        trigger: /test|testing/i,
        response: 'This is a test response from the mock AI provider. Everything is working correctly!',
        tokens: { input: 1, output: 18 },
      },
      {
        trigger: /medical|health|patient/i,
        response: 'I can help with medical-related questions. Please provide more specific information about what you need.',
        tokens: { input: 3, output: 20 },
      },
      {
        trigger: /appointment|schedule/i,
        response: 'For appointment scheduling, I can help you find available time slots and book appointments.',
        tokens: { input: 2, output: 18 },
      },
      {
        trigger: /prescription|medication/i,
        response: 'I can provide information about prescriptions and medications. What specific information do you need?',
        tokens: { input: 2, output: 19 },
      },
    ];
  }

  private async simulateLatency(): Promise<void> {
    const latency = this.config.latency!;
    const delay = Math.random() * (latency.max - latency.min) + latency.min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private estimateTokens(text: string): number {
    // Rough token estimation (1 token ≈ 4 characters)
    return Math.ceil(text.length / 4);
  }

  private createResponse(mockResponse: MockResponse): ChatResponse {
    const inputTokens = mockResponse.tokens?.input || 0;
    const outputTokens = mockResponse.tokens?.output || this.estimateTokens(mockResponse.response);

    return {
      id: `mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      content: mockResponse.response,
      role: 'assistant' as const,
      model: this.config.models?.default || 'mock-model',
      provider: 'mock' as AIProvider,
      usage: {
        input: inputTokens,
        output: outputTokens,
        total: inputTokens + outputTokens,
      },
      metadata: {
        ...mockResponse.metadata,
        mockProvider: true,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date(),
    };
  }

  private createStreamingResponse(mockResponse: MockResponse): StreamingChatResponse {
    const inputTokens = mockResponse.tokens?.input || 0;
    const outputTokens = mockResponse.tokens?.output || this.estimateTokens(mockResponse.response);
    const response = mockResponse.response;
    const chunkSize = this.config.streamingChunkSize!;
    const delay = this.config.streamingDelay!;

    let chunkIndex = 0;
    const chunks: string[] = [];
    
    // Split response into chunks
    for (let i = 0; i < response.length; i += chunkSize) {
      chunks.push(response.substring(i, i + chunkSize));
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for (const chunk of chunks) {
            await new Promise(resolve => setTimeout(resolve, delay));
            
            const streamChunk = {
              id: `mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
              content: chunk,
              role: 'assistant' as const,
              model: 'mock-model',
              provider: 'mock' as AIProvider,
              isComplete: false,
              metadata: {
                chunkIndex: chunkIndex++,
                totalChunks: chunks.length,
                mockProvider: true,
              },
            };

            controller.enqueue(JSON.stringify(streamChunk) + '\n');
          }

          // Send completion chunk
          const completionChunk = {
            id: `mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            content: '',
            role: 'assistant' as const,
            model: 'mock-model',
            provider: 'mock' as AIProvider,
            isComplete: true,
            usage: {
              inputTokens,
              outputTokens,
              totalTokens: inputTokens + outputTokens,
            },
            metadata: {
              ...mockResponse.metadata,
              mockProvider: true,
              timestamp: new Date().toISOString(),
            },
          };

          controller.enqueue(JSON.stringify(completionChunk) + '\n');
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return {
      id: `mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      stream,
      model: this.config.models?.default || 'mock-model',
      provider: 'mock' as AIProvider,
      metadata: {
        ...mockResponse.metadata,
        mockProvider: true,
        streaming: true,
        timestamp: new Date().toISOString(),
      },
    };
  }

  // Test helpers
  addCustomResponse(response: MockResponse): void {
    if (!this.config.responses) {
      this.config.responses = [];
    }
    this.config.responses.push(response);
  }

  clearCustomResponses(): void {
    this.config.responses = [];
  }

  setFailureRate(rate: number): void {
    this.config.failureRate = Math.max(0, Math.min(1, rate));
  }

  setLatency(min: number, max: number): void {
    this.config.latency = { min, max };
  }

  resetConfig(): void {
    this.config = {
      ...this.config,
      responses: [],
      failureRate: 0,
      latency: { min: 100, max: 500 },
    };
  }
}

// Factory function for creating mock providers with common configurations
export function createMockAIProvider(config: Partial<MockAIProviderConfig> = {}): MockAIProvider {
  const defaultConfig: MockAIProviderConfig = {
    enabled: true,
    apiKey: 'mock-api-key',
    baseUrl: 'https://mock-ai-provider.test',
    models: {
      default: 'mock-gpt-4',
      streaming: 'mock-gpt-4-stream',
      fast: 'mock-gpt-3.5',
    },
    rateLimits: {
      requestsPerMinute: 1000,
      tokensPerMinute: 100000,
    },
    timeout: 5000,
    ...config,
  };

  return new MockAIProvider(defaultConfig);
}

// Predefined mock providers for different testing scenarios
export const testProviders = {
  // Fast, reliable provider for unit tests
  fast: () => createMockAIProvider({
    latency: { min: 10, max: 50 },
    failureRate: 0,
    streamingDelay: 10,
  }),

  // Slow provider for testing timeouts and performance
  slow: () => createMockAIProvider({
    latency: { min: 1000, max: 3000 },
    streamingDelay: 200,
  }),

  // Unreliable provider for testing error handling
  unreliable: () => createMockAIProvider({
    failureRate: 0.3,
    latency: { min: 100, max: 1000 },
  }),

  // Provider with custom medical responses
  medical: () => {
    const provider = createMockAIProvider();
    provider.addCustomResponse({
      trigger: /symptom|pain|fever/i,
      response: 'Based on the symptoms you described, I recommend consulting with a healthcare professional for proper evaluation.',
      tokens: { input: 3, output: 20 },
    });
    provider.addCustomResponse({
      trigger: /appointment|book|schedule/i,
      response: 'I can help you schedule an appointment. What type of appointment would you like to book?',
      tokens: { input: 3, output: 18 },
    });
    return provider;
  },
};

// Global mock provider instance for testing
let mockProviderInstance: MockAIProvider | null = null;

export function getMockAIProvider(): MockAIProvider {
  if (!mockProviderInstance) {
    mockProviderInstance = createMockAIProvider();
  }
  return mockProviderInstance;
}

export function setMockAIProvider(provider: MockAIProvider): void {
  mockProviderInstance = provider;
}

export function resetMockAIProvider(): void {
  mockProviderInstance = null;
}