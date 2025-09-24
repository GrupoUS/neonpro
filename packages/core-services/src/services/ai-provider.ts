// AI Provider interface (Phase 2 - Enhanced for streaming)

export interface GenerateAnswerInput {
  prompt: string;
  locale?: 'pt-BR' | 'en-US';
  system?: string;
  stream?: boolean;
  maxTokens?: number;
  temperature?: number;
}

export interface GenerateAnswerResult {
  content: string;
  tokensUsed?: number;
  model?: string;
  finishReason?: 'stop' | 'length' | 'content_filter' | 'function_call';
}

export interface StreamChunk {
  content: string;
  delta?: string;
  finished: boolean;
  finishReason?: 'stop' | 'length' | 'content_filter' | 'function_call';
}

export interface AIProvider {
  generateAnswer(input: GenerateAnswerInput): Promise<GenerateAnswerResult>;
  generateStream?(input: GenerateAnswerInput): AsyncIterable<StreamChunk>;
}
