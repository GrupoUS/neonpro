import type {
  AIProviderInterface,
  GenerateAnswerInput,
  GenerateAnswerResult,
  StreamChunk,
  AIProvider,
} from "@neonpro/types";

export type AIProviderType = AIProvider | "mock";

class MockProvider implements AIProviderInterface {
  async generateAnswer(
    input: GenerateAnswerInput,
  ): Promise<GenerateAnswerResult> {
    const content = input.prompt || "Olá! Como posso ajudar?";
    return {
      content: `Mock response for: ${content.slice(0, 120)}`,
      tokensUsed: Math.floor(Math.random() * 100) + 50,
      model: "mock-model",
      provider: "mock",
      finishReason: "stop",
    };
  }

  async *generateStream(
    input: GenerateAnswerInput,
  ): AsyncIterable<StreamChunk> {
    const content = input.prompt || "Olá!";
    const words = `Mock streaming response for: ${content.slice(0, 120)}`.split(
      " ",
    );

    for (let i = 0; i < words.length; i++) {
      const chunkContent = `${words[i]} `;
      yield {
        content: chunkContent,
        delta: chunkContent,
        finished: i === words.length - 1,
        finishReason: i === words.length - 1 ? "stop" : undefined,
        provider: "mock" as AIProvider,
      } as StreamChunk;
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
  }
}

export class AIProviderFactory {
  private static providers: Map<AIProviderType, AIProviderInterface> =
    new Map();
  private static fallbackOrder: AIProviderType[] = [
    "openai",
    "anthropic",
    "google",
    "mock",
  ];

  static getProvider(providerName?: AIProviderType): AIProviderInterface {
    const selected = providerName || "mock";
    return this.getCachedProvider(selected);
  }

  private static getCachedProvider(
    providerName: AIProviderType,
  ): AIProviderInterface {
    if (!this.providers.has(providerName)) {
      this.providers.set(providerName, this.createProvider(providerName));
    }
    return this.providers.get(providerName)!;
  }

  private static createProvider(
    providerName: AIProviderType,
  ): AIProviderInterface {
    switch (providerName) {
      case "mock":
        return new MockProvider();
      case "openai":
      case "anthropic":
      case "google":
      default:
        console.warn(
          `Provider ${providerName} not implemented. Falling back to mock provider.`,
        );
        return new MockProvider();
    }
  }

  static async generateWithFailover(
    input: GenerateAnswerInput,
    maxRetries = 3,
  ): Promise<GenerateAnswerResult> {
    let lastError: Error | null = null;

    for (let i = 0; i < Math.min(maxRetries, this.fallbackOrder.length); i++) {
      const providerName = this.fallbackOrder[i];
      try {
        const provider = this.getProvider(providerName);
        const result = await provider.generateAnswer(input);
        return {
          ...result,
          provider: result.provider ?? providerName,
        } as GenerateAnswerResult;
      } catch (error) {
        lastError = error as Error;
        console.warn(`Provider ${providerName} failed:`, error);
      }
    }

    throw lastError ?? new Error("All AI providers failed");
  }

  static async *generateStreamWithFailover(
    input: GenerateAnswerInput,
    maxRetries = 3,
  ): AsyncIterable<StreamChunk> {
    let lastError: Error | null = null;

    for (let i = 0; i < Math.min(maxRetries, this.fallbackOrder.length); i++) {
      const providerName = this.fallbackOrder[i];
      try {
        const provider = this.getProvider(providerName);
        if (!provider.generateStream) {
          throw new Error(
            `Provider ${providerName} does not support streaming`,
          );
        }

        for await (const chunk of provider.generateStream(input)) {
          yield {
            ...chunk,
            provider: chunk.provider ?? providerName,
          } as StreamChunk;
        }
        return;
      } catch (error) {
        lastError = error as Error;
        console.warn(`Streaming provider ${providerName} failed:`, error);
      }
    }

    throw lastError ?? new Error("All streaming AI providers failed");
  }

  static getAvailableProviders(): AIProviderType[] {
    return [...this.fallbackOrder];
  }
}

export const aiProviderFactory = AIProviderFactory;
