# AI Chat: Explanation Endpoint (POST /api/v1/chat/explanation)

Status: Implemented (real, non-mock)
Updated: 2025-09-16

## What it does
- Generates a concise explanation for end-users from an input text.
- Enforces consent/role gating (LGPD/compliance): non-mock requests require `x-consent: true` and a permitted `x-role`.
- Applies LGPD redaction to both input and output as defense-in-depth.
- Emits audit events (console + optional DB table `ai_audit_events`).
- Uses model failover between providers for resilience.

## Request
- Method: POST
- Path: `/api/v1/chat/explanation`
- Headers:
  - `content-type: application/json`
  - `x-user-id`: string (optional, used for audit)
  - `x-clinic-id`: string (optional, used for audit)
  - `x-role`: one of `ADMIN|CLINICAL_STAFF|FINANCE_STAFF|SUPPORT_READONLY` (required)
  - `x-consent`: `true` to allow non-mock requests
- Query params:
  - `mock=true` to force mock behavior
- Body (JSON):
  - `text: string (1..8000)`
  - `locale: 'pt-BR' | 'en-US'` (default: `pt-BR`)

## Responses
- 200 OK: `{ explanation: string, traceId: string }`
- 403 Forbidden: `{ message: string }` when consent/role gate fails (non-mock)
- 422 Unprocessable Entity: `{ message: 'Invalid payload' }`
- 500 Internal Error: `{ message: 'Service temporarily unavailable' | localized }`

All responses include a server-generated `traceId` on 200.

## Privacy & Compliance
- Input text is redacted before model invocation.
- Output is redacted again before returning to the client.
- Audit entry includes: user, clinic, action, consent status, latency, and outcome. When `AI_AUDIT_DB=true`, events are inserted into `ai_audit_events`.

## Model Failover
- Primary model key: `DEFAULT_PRIMARY` (currently `gpt-5-mini`).
- Secondary fallback: `DEFAULT_SECONDARY` (currently `gemini-2.5-flash`).
- Helper: `generateWithFailover({ model, prompt })` in `apps/api/src/config/ai.ts`.

## Testing
- Contract tests (mock and non-mock behaviors):
  - `apps/api/tests/contract/chat-explanation.test.ts` (mock)
  - `apps/api/tests/contract/chat-explanation.nonmock.test.ts` (real + consent + redaction)
- Unit test for failover:
  - `apps/api/src/config/__tests__/ai.failover.test.ts`
- Run:
```bash
pnpm --filter @neonpro/api test
pnpm --filter @neonpro/api run test:contract
```

## Notes
- For local runs without DB auditing, omit `AI_AUDIT_DB=true`.
- Consent is bypassed in mock mode (`?mock=true`) for developer convenience.
- If providers or models change, adjust `MODEL_REGISTRY` and defaults in `apps/api/src/config/ai.ts`.
