// ChatMessage model (Phase 1)
// Mirrors packages/types/src/ai-chat.ts; add small helpers.

import type { ChatMessage as ChatMessageType } from '@neonpro/types';

export type ChatMessage = ChatMessageType;

export const isFresh = (message: ChatMessage, now: Date = new Date()): boolean => {
  const created = new Date(message.createdAt).getTime();
  return now.getTime() - created <= 5 * 60 * 1000; // 5m
};

export const withRedactionFlags = (message: ChatMessage, flags: string[]): ChatMessage => ({
  ...message,
  redactionFlags: [...(message.redactionFlags ?? []), ...flags],
});
