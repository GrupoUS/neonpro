// Types for Phase 1 AI Chat

// Healthcare-compliant metadata types for AI Chat
export interface ChatSessionMetadata {
  deviceType?: string;
  browser?: string;
  location?: string;
  sessionDuration?: number;
  messageCount?: number;
  [key: string]: unknown;
}

export type ChatRole = "user" | "assistant" | "system";

export type ChatSessionStatus = "active" | "closed" | "error";

export interface ChatSession {
  id: string;
  clinicId: string;
  _userId: string;
  locale: "pt-BR" | "en-US";
  startedAt: string; // ISO
  lastActivityAt: string; // ISO
  status?: ChatSessionStatus;
  metadata?: ChatSessionMetadata;
  createdAt?: string;
  updatedAt?: string;
  endedAt?: string | null;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  _role: ChatRole;
  content: string;
  redactionFlags?: string[];
  createdAt: string; // ISO
  provider?: string;
  metadata?: ChatSessionMetadata;
}

export type AuditOutcome = "success" | "refusal" | "error" | "limit";
export type ConsentStatus = "valid" | "missing" | "invalid";

export interface AuditEvent {
  id: string;
  clinicId: string;
  _userId: string;
  sessionId?: string;
  actionType:
    | "query"
    | "explanation"
    | "suggestion"
    | "rate_limit"
    | "refusal"
    | "error";
  consentStatus: ConsentStatus;
  queryType?: "treatment" | "finance" | "mixed" | "other";
  redactionApplied: boolean;
  outcome: AuditOutcome;
  latencyMs: number;
  createdAt: string; // ISO
  metadata?: ChatSessionMetadata;
}
