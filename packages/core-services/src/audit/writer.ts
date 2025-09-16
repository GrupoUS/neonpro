// Phase 3.3 — T015: Audit writer (structured)
import { createLogger } from '@neonpro/utils';

export type AuditOutcome = 'success' | 'refusal' | 'limit' | 'error';

export interface AuditEventInput {
  action: 'query' | 'explanation' | 'suggestions';
  userId: string;
  clinicId?: string;
  sessionId?: string | null;
  consentStatus?: 'valid' | 'missing' | 'n/a';
  queryType?: string;
  redactionApplied?: boolean;
  outcome: AuditOutcome;
  latencyMs?: number;
}

const logger = createLogger('ai-audit');

export async function writeAudit(event: AuditEventInput) {
  // Phase 1: log to console; future: insert into DB via Supabase client
  logger.info('AI audit event', event as any);
}
