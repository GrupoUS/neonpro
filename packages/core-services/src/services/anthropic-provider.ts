import type {
  AIProvider,
  GenerateAnswerInput,
  GenerateAnswerResult,
  StreamChunk,
} from './ai-provider.js';

// Placeholder Anthropic provider. Real integration will be implemented in a later phase.
import type {
  AIProviderInterface,
  GenerateAnswerInput,
  GenerateAnswerResult,
  StreamChunk,
} from '@neonpro/types';

// Placeholder Anthropic provider. Real integration will be implemented in a later phase.
export class AnthropicProvider implements AIProviderInterface {
  constructor(private readonly apiKey: string) {
    if (!apiKey) {
      throw new Error('Anthropic API key is required');
    }
  }

  async generateAnswer(_input: GenerateAnswerInput): Promise<GenerateAnswerResult> {
    throw new Error('Anthropic provider is not implemented yet.');
  }

  async *generateStream(_input: GenerateAnswerInput): AsyncIterable<StreamChunk> {
    throw new Error('Anthropic streaming provider is not implemented yet.');
  }
}
