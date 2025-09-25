// ChatSession model - Minimal essential types

export type ChatSession = {
  id: string
  userId?: string
  sessionId: string
  title?: string
  startedAt: string
  lastActivityAt: string
  status: 'active' | 'idle' | 'closed'
  metadata?: Record<string, unknown>
}

export const createChatSession = (
  input: Omit<ChatSession, 'startedAt' | 'lastActivityAt'> & {
    startedAt?: string
    lastActivityAt?: string
  },
): ChatSession => {
  const now = new Date().toISOString()
  return {
    ...input,
    startedAt: input.startedAt ?? now,
    lastActivityAt: input.lastActivityAt ?? now,
  }
}

export const isSessionIdle = (
  session: ChatSession,
  now: Date = new Date(),
): boolean => {
  const last = new Date(session.lastActivityAt).getTime()
  return now.getTime() - last >= 60 * 60 * 1000 // 60m
}
