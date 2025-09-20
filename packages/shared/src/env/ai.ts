// Centralized env var keys and loaders for AI features
export const AI_ENV = {
  AI_CHAT_MOCK_MODE: "AI_CHAT_MOCK_MODE",
  FREE_DAILY_READ_LIMIT: "FREE_DAILY_READ_LIMIT",
  ABUSE_Q_60S: "ABUSE_Q_60S",
  ABUSE_M_10M: "ABUSE_M_10M",
} as const;

export type AiEnvKey = keyof typeof AI_ENV;

export function readBoolEnv(
  value: string | undefined,
  fallback = false,
): boolean {
  if (value == null) return fallback;
  const v = value.toLowerCase();
  return v === "1" || v === "true" || v === "yes" || v === "on";
}

export function readNumEnv(
  value: string | number | undefined,
  fallback: number,
): number {
  if (value == null) return fallback;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}
