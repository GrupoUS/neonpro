// Types for Phase 1 AI Chat

// Healthcare-compliant metadata types for AI Chat
export interface ChatSessionMetadata {
  deviceType?: string
  browser?: string
  location?: string
  sessionDuration?: number
  messageCount?: number
  [key: string]: unknown
}

export type ChatRole = 'user' | 'assistant' | 'system'

export type ChatSessionStatus = 'active' | 'closed' | 'error'

/** Session ID string */
export interface FeedbackRequest {
  messageId: string
  feedback: {
    rating: number // 1-5
    comment?: string
    helpful?: boolean
  }
}

export interface FeedbackResponse {
  success: boolean
  message: string
  feedbackId: string
}

export interface SessionResponse {
  sessionId: string
  status: 'active' | 'closed' | 'error'
  createdAt: string
  lastActivityAt: string
  messageCount: number
  metadata?: ChatSessionMetadata
}

export interface ChatSession {
  id: string
  clinicId: string
  userId: string
  locale: 'pt-BR' | 'en-US'
  startedAt: string // ISO
  lastActivityAt: string // ISO
  status?: ChatSessionStatus
  metadata?: ChatSessionMetadata
  createdAt?: string
  updatedAt?: string
  endedAt?: string | null
}

export interface ChatMessage {
  id: string
  sessionId: string
  role: ChatRole
  content: string
  redactionFlags?: string[]
  createdAt: string // ISO
  provider?: string
  metadata?: ChatSessionMetadata
}

export type AuditOutcome = 'success' | 'refusal' | 'error' | 'limit'
export type ConsentStatus = 'valid' | 'missing' | 'invalid'

export interface AuditEvent {
  id: string
  clinicId: string
  userId: string
  sessionId?: string
  actionType:
    | 'query'
    | 'explanation'
    | 'suggestion'
    | 'rate_limit'
    | 'refusal'
    | 'error'
  consentStatus: ConsentStatus
  queryType?: 'treatment' | 'finance' | 'mixed' | 'other'
  redactionApplied: boolean
  outcome: AuditOutcome
  latencyMs: number
  createdAt: string // ISO
  metadata?: ChatSessionMetadata
}
