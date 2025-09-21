// AI-related configuration flags
export const _aiConfig = {
  AI_CHAT_MOCK_MODE: process.env.AI_CHAT_MOCK_MODE === "true",
  FREE_DAILY_READ_LIMIT: Number(process.env.FREE_DAILY_READ_LIMIT ?? 40),
  ABUSE_Q_60S: Number(process.env.ABUSE_Q_60S ?? 12),
  ABUSE_M_10M: Number(process.env.ABUSE_M_10M ?? 5),
} as const;

// Phase 2: Real LLM Provider Configuration
export const AI_PROVIDER = process.env.AI_PROVIDER ?? "openai";
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";
export const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? "";
export const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY ?? "";

// AI Provider Settings
export const _AI_MODEL_CONFIG = {
  openai: {
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    maxTokens: Number(process.env.OPENAI_MAX_TOKENS ?? 1000),
    temperature: Number(process.env.OPENAI_TEMPERATURE ?? 0.7),
  },
  anthropic: {
    model: process.env.ANTHROPIC_MODEL ?? "claude-3-haiku-20240307",
    maxTokens: Number(process.env.ANTHROPIC_MAX_TOKENS ?? 1000),
    temperature: Number(process.env.ANTHROPIC_TEMPERATURE ?? 0.7),
  },
  google: {
    model: process.env.GOOGLE_AI_MODEL ?? "gemini-1.5-flash",
    maxTokens: Number(process.env.GOOGLE_AI_MAX_TOKENS ?? 1000),
    temperature: Number(process.env.GOOGLE_AI_TEMPERATURE ?? 0.7),
  },
} as const;
