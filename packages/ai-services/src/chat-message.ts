// ChatMessage model - Minimal essential types

export type ChatMessage = {
  id: string
  sessionId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: string
  updatedAt: string
  metadata?: Record<string, unknown>
  redactionFlags?: string[]
}

export const isFresh = (
  message: ChatMessage,
  now: Date = new Date(),
): boolean => {
  const created = new Date(message.createdAt).getTime()
  return now.getTime() - created <= 5 * 60 * 1000 // 5m
}

export const withRedactionFlags = (
  message: ChatMessage,
  flags: string[],
): ChatMessage => ({
  ...message,
  redactionFlags: [...(message.redactionFlags ?? []), ...flags],
})
