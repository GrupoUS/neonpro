// Phase 3.3 — T012: Redaction utility wrapper
// Leverages existing logging/redact and LGPD helpers to provide a single entry point.

import { redact as baseRedact } from "../logging/redact";
import { lgpdCompliance } from "../lgpd";

export interface RedactionResult {
  text: string;
  flags: string[]; // e.g., ['email', 'cpf', 'cnpj'] — kept generic
}

/**
 * redactPII applies LGPD-safe redactions to arbitrary text.
 * It composes the general-purpose redact() with specific Brazilian helpers.
 */
export function redactPII(input: string): RedactionResult {
  if (!input) return { text: input, flags: [] };
  // First pass: generic redact (email/cpf/cnpj/phone/rg patterns)
  const pass1 = baseRedact(input);
  // Second pass: additional LGPD helpers (idempotent on already-masked content)
  const text = lgpdCompliance(pass1);
  // Flags are best-effort; in Phase 1 we return a coarse list.
  const flags: string[] = [];
  if (input !== text) flags.push("lgpd");
  return { text, flags };
}

export default redactPII;
