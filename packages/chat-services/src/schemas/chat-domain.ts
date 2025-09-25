// Chat Domain Schemas - Zod schemas for chat functionality
// Absorbed from chat-domain package

import { z } from 'zod'

export const ChatQuerySchema = z.object({
  question: z.string().min(1).max(4000),
  sessionId: z.string().uuid().optional(),
})

export const ExplanationRequestSchema = z.object({
  text: z.string().min(1).max(8000),
  locale: z.enum(['pt-BR', 'en-US']).default('pt-BR'),
})

export type ChatQuery = z.infer<typeof ChatQuerySchema>
export type ExplanationRequest = z.infer<typeof ExplanationRequestSchema>