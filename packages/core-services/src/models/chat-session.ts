// ChatSession model (Phase 1)
// Mirrors packages/types/src/ai-chat.ts shape; provides helper predicates and factories.

import type { ChatSession as ChatSessionType } from "@neonpro/types";

export type ChatSession = ChatSessionType;

export const _createChatSession = (
  input: Omit<ChatSession, "startedAt" | "lastActivityAt"> & {
    startedAt?: string;
    lastActivityAt?: string;
  },
): ChatSession => {
  const _now = new Date().toISOString();
  return {
    ...input,
    startedAt: input.startedAt ?? now,
    lastActivityAt: input.lastActivityAt ?? now,
  };
};

export const _isSessionIdle = (
  session: ChatSession,
  now: Date = new Date(),
): boolean => {
  const last = new Date(session.lastActivityAt).getTime();
  return now.getTime() - last >= 60 * 60 * 1000; // 60m
};
