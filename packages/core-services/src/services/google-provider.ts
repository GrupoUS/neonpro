import type {
  AIProvider,
  GenerateAnswerInput,
  GenerateAnswerResult,
  StreamChunk,
} from './ai-provider.js';

// Placeholder Google provider. Real implementation will require
// @google/generative-ai and proper credential management.
import type {
  AIProviderInterface,
  GenerateAnswerInput,
  GenerateAnswerResult,
  StreamChunk,
} from '@neonpro/types';

// Placeholder Google provider. Real implementation will require
// @google/generative-ai and proper credential management.
export class GoogleAIProvider implements AIProviderInterface {
  constructor(private readonly apiKey: string) {
    if (!apiKey) {
      throw new Error('Google AI API key is required');
    }
  }

  async generateAnswer(input: GenerateAnswerInput): Promise<GenerateAnswerResult> {
    throw new Error('Google AI provider is not implemented yet.');
  }

  async *generateStream(_input: GenerateAnswerInput): AsyncIterable<StreamChunk> {
    throw new Error('Google AI streaming provider is not implemented yet.');
  }
}
