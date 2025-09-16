export type ConsentScope = 'images' | 'clinical' | 'billing' | 'chat';

// Basic PII redaction for LGPD safety in logs/telemetry
export function redactPII(input: string): string {
  if (!input) return input;
  let out = input;
  // Emails
  out = out.replace(/\b[\w.+-]+@[\w-]+\.[\w.-]+\b/gi, '[REDACTED_EMAIL]');
  // Brazilian phone formats (simple heuristics): (11) 91234-5678 or 11912345678
  out = out.replace(/\b\(?(\d{2})\)?\s?9?\d{4}-?\d{4}\b/g, '[REDACTED_PHONE]');
  // CPF: 123.456.789-09 or 12345678909
  out = out.replace(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, '[REDACTED_CPF]');
  out = out.replace(/\b\d{11}\b/g, m => (/^\d{11}$/.test(m) ? '[REDACTED_CPF]' : m));
  return out;
}

export function checkConsent(
  consents: Partial<Record<ConsentScope, boolean>>,
  scope: ConsentScope,
): boolean {
  return consents[scope] === true;
}
