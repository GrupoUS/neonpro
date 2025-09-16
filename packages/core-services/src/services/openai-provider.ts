// OpenAI provider (Phase 1) - placeholder to satisfy interface; real impl behind flag later

import type { AIProvider, GenerateAnswerInput, GenerateAnswerResult } from './ai-provider.js';

export class OpenAIProvider implements AIProvider {
  async generateAnswer(input: GenerateAnswerInput): Promise<GenerateAnswerResult> {
    // Placeholder deterministic response (mock mode)
    return {
      content: input.prompt ? `Resumo: ${input.prompt.slice(0, 120)}` : 'Sem conteúdo',
      tokensUsed: Math.min(256, input.prompt.length || 0),
      model: 'mock-openai-0'
    };
  }
}
