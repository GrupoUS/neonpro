// AuditEvent model (Phase 1)
// Mirrors packages/types/src/ai-chat.ts; helper for basic validation.

import type { AuditEvent as AuditEventType, AuditOutcome, ConsentStatus } from '@neonpro/types'

export type AuditEvent = AuditEventType

export const isValidConsentStatus = (status: ConsentStatus): boolean =>
  status === 'valid' || status === 'missing' || status === 'invalid'

export const isValidOutcome = (outcome: AuditOutcome): boolean =>
  outcome === 'success'
  || outcome === 'refusal'
  || outcome === 'error'
  || outcome === 'limit'

export const validateAuditEvent = (evt: AuditEvent): void => {
  if (!isValidConsentStatus(evt.consentStatus)) {
    throw new Error('Invalid consentStatus')
  }
  if (!isValidOutcome(evt.outcome)) throw new Error('Invalid outcome')
  if (evt.latencyMs < 0) throw new Error('latencyMs must be >= 0')
}
