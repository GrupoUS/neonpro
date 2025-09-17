# AI Chat — Phase 1: Session and Explanation Endpoints

Date: 2025-09-15
Scope: Implement mock-mode endpoints and pass contract tests

## Endpoints

- GET `/v1/chat/session/:id`
  - Mock gate: `?mock=true` or `AI_MOCK/MOCK_MODE` env
  - 200 (mock): `{ id, userId, locale, startedAt, lastActivityAt }`
  - 501 (non-mock): `{ message: 'Not implemented' }`

- POST `/v1/chat/explanation`
  - Mock gate: `?mock=true` or `AI_MOCK/MOCK_MODE` env
  - Body: `{ text: string, audience?: string, locale?: 'pt-BR'|'en-US' }`
  - 200 (mock): `{ explanation, traceId }`
  - 501 (non-mock): `{ message: 'Not implemented' }`

## Tests

- Contract tests at `apps/api/tests/contract`: both session and explanation are GREEN.
  Commands:

```bash
pnpm --filter @neonpro/api test:contract
```

## Notes

- Non-mock implementations to follow: consent/role gates, LGPD redaction, audit logging, and model failover (aligned with `/query`).
- Minor lint warnings remain elsewhere; unrelated to these endpoints.
