// PII Redaction service (Phase 1)
// Placeholder implementation – real LGPD-aware redaction will be added later.

export class PIIRedactionService {
  redact(input: string): string {
    const { compliance } = require("@neonpro/utils");
    return compliance.lgpdCompliance(input);
  }
}
