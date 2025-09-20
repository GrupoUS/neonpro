# Phase 1 — AI Chat Contextual Q&A (Backend)

Status: Implemented (mock-first), streaming SSE with consent/role gating, rate limits, and audit logging.

## Endpoints

- POST /api/v1/chat/query — Submit a question. Returns text/event-stream (SSE)
- GET /api/v1/chat/health — Health for chat group

Mounted under Hono app in `apps/api/src/app.ts` as `v1.route('/chat', chat)` where `chat` is `apps/api/src/routes/chat.ts`.

## Request (per OpenAPI)

Content-Type: application/json
{
"question": "string (<= 4000)",
"sessionId": "uuid (optional)"
}

Headers expected:

- x-user-id: user id (for rate-limit/audit)
- x-clinic-id: clinic id (for audit)
- x-role: one of ADMIN | CLINICAL_STAFF | FINANCE_STAFF | SUPPORT_READONLY
- x-consent: "true" to pass consent gate (non-mock)

## Responses

- 200 text/event-stream with incremental events:
  data: {"type":"text","delta":"..."}\n\n
  Terminator:
  data: {"type":"done"}\n\n
  Metadata headers:
  - X-Chat-Started-At: ISO timestamp
  - X-Chat-Model: mock:model (mock path) or provider model id (real path)
  - X-Data-Freshness: as-of-now (mock path)

- 400 validation error (Zod)
- 403 consent/role violation
- 429 fairness limit (10/5m or 30/h per user)
- 500 generic service error (no stack details)

## Mock Mode

Activate via any of:

- Query param: ?mock=true
- Env: AI_MOCK=true

Deterministic fixtures by question tokens:

- mock:balance → balance summary
- mock:clinical → treatments overview
- mock:overdue → overdue counts
- mock:ambiguous → clarification prompt
- mock:refusal → refusal message

## Audit Logging

Every request emits an AuditEvent (console by default):
{ eventId, userId, clinicId, timestampUTC, actionType, consentStatus, queryType, redactionApplied, outcome, latencyMs, sessionId }

Optional DB insert (when AI_AUDIT_DB=true) into table ai_audit_events.

PII redaction: CPF/CNPJ/phone/email patterns masked in logs; question text is not persisted by default, only classification.

## Rate Limits (Fairness)

- 10 requests per 5 minutes per user
- 30 requests per hour per user
- On limit: 429 {"message":"Please retry shortly"} and distinct audit outcome.

## How to run tests (API only)

pnpm --filter @neonpro/api test

Note: Some non-chat suites may fail without local packages/env. The contract tests for chat and ai-chat streaming pass and validate SSE and headers.

## Try it (local dev)

curl -N -X POST 'http://localhost:3000/v1/chat/query?mock=true' \
 -H 'content-type: application/json' \
 -H 'x-user-id: u1' -H 'x-clinic-id: c1' -H 'x-role: CLINICAL_STAFF' -H 'x-consent: true' \
 -d '{"question":"mock:balance","sessionId":"6e9b5f24-7b4d-4db8-9d1b-0db6b7f5a0e0"}'

# Frontend integration notes

- Streams are SSE lines: parse JSON after "data: " prefix.
- Show first token within ~15ms intervals in mock mode to simulate responsiveness.
- Display X-Chat-Started-At timestamp to meet perceived responsiveness requirement.
