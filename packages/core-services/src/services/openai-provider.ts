import type {
  AIProvider,
  GenerateAnswerInput,
  GenerateAnswerResult,
  StreamChunk,
} from './ai-provider.js';

// Placeholder OpenAI provider. Real implementation will be added in a future phase.
export class OpenAIProvider implements AIProvider {
  constructor(private readonly _apiKey: string) {
    if (!this._apiKey) {
      throw new Error('OpenAI API key is required');
    }
  }

  async generateAnswer(_input: GenerateAnswerInput): Promise<GenerateAnswerResult> {
    throw new Error('OpenAI provider is not implemented yet.');
  }

  async *generateStream(_input: GenerateAnswerInput): AsyncIterable<StreamChunk> {
    throw new Error('OpenAI streaming provider is not implemented yet.');
  }
}
