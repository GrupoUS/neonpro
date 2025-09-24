// Centralized AI Chat environment config (Phase 1)
// Exposes environment-derived configuration for AI features

import { AI_PROVIDER, aiConfig, OPENAI_API_KEY } from './ai';
export { AI_PROVIDER, aiConfig, OPENAI_API_KEY } from './ai';

export type AiEnv = {
  AI_CHAT_MOCK_MODE: boolean;
  FREE_DAILY_READ_LIMIT: number;
  ABUSE_Q_60S: number;
  ABUSE_M_10M: number;
  AI_PROVIDER: string;
  OPENAI_API_KEY: string;
};

export const AI_ENV: AiEnv = {
  AI_CHAT_MOCK_MODE: aiConfig.AI_CHAT_MOCK_MODE,
  FREE_DAILY_READ_LIMIT: aiConfig.FREE_DAILY_READ_LIMIT,
  ABUSE_Q_60S: aiConfig.ABUSE_Q_60S,
  ABUSE_M_10M: aiConfig.ABUSE_M_10M,
  AI_PROVIDER,
  OPENAI_API_KEY,
};
