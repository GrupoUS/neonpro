// Types for Phase 1 AI Chat
export type ChatRole = 'user' | 'assistant' | 'system';

export type ChatSessionStatus = 'active' | 'closed' | 'error';

export interface ChatSession {
  id: string;
  clinicId: string;
  userId: string;
  locale: 'pt-BR' | 'en-US';
  startedAt: string; // ISO
  lastActivityAt: string; // ISO
  status?: ChatSessionStatus;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
  endedAt?: string | null;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: ChatRole;
  content: string;
  redactionFlags?: string[];
  createdAt: string; // ISO
  provider?: string;
  metadata?: Record<string, any>;
}

export type AuditOutcome = 'success' | 'refusal' | 'error' | 'limit';
export type ConsentStatus = 'valid' | 'missing' | 'invalid';

export interface AuditEvent {
  id: string;
  clinicId: string;
  userId: string;
  sessionId?: string;
  actionType: 'query' | 'explanation' | 'suggestion' | 'rate_limit' | 'refusal' | 'error';
  consentStatus: ConsentStatus;
  queryType?: 'treatment' | 'finance' | 'mixed' | 'other';
  redactionApplied: boolean;
  outcome: AuditOutcome;
  latencyMs: number;
  createdAt: string; // ISO
  metadata?: Record<string, any>;
}
