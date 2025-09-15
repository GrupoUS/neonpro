// Types for Phase 1 AI Chat
export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatSession {
  id: string;
  clinicId: string;
  userId: string;
  startedAt: string; // ISO
  lastActivityAt: string; // ISO
  locale: 'pt-BR' | 'en-US';
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: ChatRole;
  content: string;
  redactionFlags?: string[];
  createdAt: string; // ISO
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
}
