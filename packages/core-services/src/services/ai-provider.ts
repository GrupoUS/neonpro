// AI Provider interface (Phase 1)

export interface GenerateAnswerInput {
  prompt: string;
  locale?: 'pt-BR' | 'en-US';
  system?: string;
}

export interface GenerateAnswerResult {
  content: string;
  tokensUsed?: number;
  model?: string;
}

export interface AIProvider {
  generateAnswer(input: GenerateAnswerInput): Promise<GenerateAnswerResult>;
}
