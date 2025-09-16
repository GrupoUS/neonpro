// PII Redaction service (Phase 1)
// Uses shared LGPD utils as a pipeline

import { lgpdCompliance } from '@neonpro/utils';

export class PIIRedactionService {
  redact(input: string): string {
    return lgpdCompliance(input);
  }
}
