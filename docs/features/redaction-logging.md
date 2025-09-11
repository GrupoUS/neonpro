# Redaction & Structured Logging

Status: Initial implementation (T042 GREEN)\
Last Updated: 2025-09-11

## Overview

The logging redaction utility ensures personally identifiable or sensitive fields are masked before logs leave the application boundary. Current scope covers:

- Emails
- CPF (Brazilian tax ID)
- Phone numbers (basic BR formats)
- RG (simplified pattern)
- Custom user‑supplied patterns per invocation

## Module

`packages/utils/src/logging/redact.ts`

### API

```ts
redact(input: string, options?: {
  emailReplacement?: string
  cpfReplacement?: string
  phoneReplacement?: string
  rgReplacement?: string
  customPatterns?: { pattern: RegExp; replacement: string }[]
}): string
```

### Usage Example

```ts
import { redact } from '@neonpro/utils/src/logging/redact';

const safe = redact(
  'Contato: user@example.com CPF: 123.456.789-00 Tel: (11) 91234-5678',
  { customPatterns: [{ pattern: /secret_token=\w+/g, replacement: 'secret_token=[REDACTED]' }] },
);
```

## Extension Roadmap

| Phase | Goal                   | Detail                                                                 |
| ----- | ---------------------- | ---------------------------------------------------------------------- |
| P1    | Deterministic hashing  | Replace tokens with consistent hash for correlation                    |
| P2    | JSON object traversal  | Deep redact structured payloads (keys: password, token, authorization) |
| P3    | High-entropy detection | Flag suspicious access tokens (length + charset heuristics)            |
| P4    | Config-driven policies | Central YAML/JSON with patterns & replacements                         |

## Testing

Covered by `packages/utils/src/logging/__tests__/redact.test.ts` (T042). Future additions should include entropy-based tests and large batch performance.

## Performance Notes

Current regex set is small and linear in typical log line size (<2 KB). Monitor if we add more complex patterns—consider precompiling and short‑circuit scanning.

## Security Considerations

- Redaction runs before persistence / transport.
- Never rely solely on redaction to store secrets in logs; enforce deny‑list in higher layers.

## Next Steps

1. Add structured object redaction helper (accepts unknown value, returns sanitized clone).
2. Logging pipeline integration (mask inside logger before emission).
3. Add coverage for high-entropy secrets & bearer tokens.
