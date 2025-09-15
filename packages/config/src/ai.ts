// AI-related configuration flags
export const aiConfig = {
  AI_CHAT_MOCK_MODE: process.env.AI_CHAT_MOCK_MODE === 'true',
  FREE_DAILY_READ_LIMIT: Number(process.env.FREE_DAILY_READ_LIMIT ?? 40),
  ABUSE_Q_60S: Number(process.env.ABUSE_Q_60S ?? 12),
  ABUSE_M_10M: Number(process.env.ABUSE_M_10M ?? 5),
} as const;
