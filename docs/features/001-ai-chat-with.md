# Feature: AI Chat with Database-Aware Context (Phase 1)

Last updated: 2025-09-13

Overview
- Adds AI chat endpoints aligned with specs in `specs/001-ai-chat-with/`
- Streaming chat with provider failover and a deterministic mock mode for tests
- Explanation summary endpoint (privacy-preserving reasoning summary)
- Clinical/Finance tools minimal contracts (overdue invoices, new treatments, patient balance)

Endpoints (prefix `/v1`)
- POST `/ai-chat/stream` — Streams text with metadata headers
  - Body: `{ messages?: UIMessage[], text?: string, presetId?: string, params?: Record<string,any>, locale?: string, sessionId: string, model?: string }`
  - Headers in response: `X-Chat-Started-At`, `X-Chat-Model`, `X-Data-Freshness`
  - Query: `?mock=true` to use built-in mock stream (no external providers)
- POST `/ai-chat/suggestions` — Returns safe, non-PII suggestions
- POST `/ai-explain/summary` — Returns concise, privacy-safe explanation summary
- POST `/tools/finance/overdue` — Lists overdue invoices + totals
- POST `/tools/clinical/treatments/new` — Lists new treatments (consent flag)
- POST `/tools/clinical/patient/balance` — Gets patient balance (consent-aware)

Security & Compliance
- PII redaction for logs (CPF/CNPJ/phone/email)
- Console audit trail for chat interactions with timestamp, sessionId, locale
- Explanation summary avoids raw prompts or PII

Testing
- Contract tests: `apps/api/tests/contract/*`
  - Chat: exercises `/v1/ai-chat/stream?mock=true` and asserts headers/text
  - Explanation & tools: minimal GREEN payloads asserted
- Suggested commands:
  - `pnpm --filter @neonpro/api test:contract`
  - `pnpm --filter @neonpro/api type-check`

Notes
- UI hook/components already present; wiring to new stream headers can be added later
- Future phases: RLS enforcement, consent checks from DB, full audit pipeline
