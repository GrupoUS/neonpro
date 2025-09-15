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

# AI Chat with Database Integration — Reference

## Summary

End-to-end guidance for implementing NeonPro's AI chat capable of answering clinical and financial questions with live, database-aware context. Uses Vercel AI SDK v5 for type-safe chat and tool calling, Hono for API routes, and Supabase/Postgres for governed data access with LGPD-compliant controls.

## Goals & Success Criteria

- Database-aware, context-rich answers for patient care and finance.
- Strict LGPD/ANVISA compliance: consent, RLS, audit logging, redaction.
- v5 AI SDK patterns: UIMessage separation, streaming, tools with zod.
- Type-safe from server to UI; provider failover; observable metrics.
- Tests: unit/integration/E2E with ≥90% coverage for core logic.

## Architecture Overview

- Frontend (React 19 + Vite + TanStack Router): `useChat<MyUIMessage>` renders messages and data parts; handles tool states.
- API (Hono): `/api/chat` streams responses; tool routes under `/api/tools/*` with auth.
- AI Layer (AI SDK v5): `streamText`/`generateText`, tools (`tool`/`dynamicTool`), agentic `stopWhen`/`prepareStep`.
- Data Layer (Supabase/Postgres): RLS-enforced reads; service layer in `packages/core-services` provides queries.
- Compliance: audit logging, consent checks, PII redaction, rate limiting, provider governance.

## Data Flow

1) User submits message → `useChat` posts to `/api/chat`.
2) Server converts UI messages → model messages; runs `streamText` with tools.
3) Tools call service layer functions that enforce auth + RLS.
4) Streamed parts (text/data/tool states) render in UI; metadata tracks model/tokens.
5) On finish, chat history (UIMessage[]) is persisted; audit log recorded.

## Core Contracts

- UI Message: `type MyUIMessage = UIMessage<MyMetadata, MyDataParts, MyUITools>`.
- Tools: `tool({ description, inputSchema, outputSchema?, execute })` (v5).
- Service APIs: pure functions with `(ctx: { userId, clinicId }, input)` that call Supabase with RLS.
- Error Model: structured errors with codes (`LGPD_CONSENT_REQUIRED`, `AUTHENTICATION_REQUIRED`, …).

## Minimal Server Route (Hono + AI SDK v5)

```ts
import { Hono } from 'hono';
import { openai } from '@ai-sdk/openai';
import { streamText, convertToModelMessages } from 'ai';
import type { UIMessage } from 'ai';

type MyUIMessage = UIMessage;
const app = new Hono();

app.post('/api/chat', async (c) => {
  const { messages } = (await c.req.json()) as { messages: MyUIMessage[] };

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    messages: convertToModelMessages(messages),
    onError: ({ error }) => console.error('stream error', error),
  });

  return result.toUIMessageStreamResponse({
    messageMetadata: ({ part }) => (part.type === 'start' ? { createdAt: Date.now() } : undefined),
  });
});

export default app;
```

## Minimal Client (React)

```tsx
import { useChat } from 'ai/react';
import type { UIMessage } from 'ai';

type MyUIMessage = UIMessage;

export function Chat() {
  const { messages, input, setInput, sendMessage, isLoading } = useChat<MyUIMessage>({ api: '/api/chat' });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (input.trim()) sendMessage({ text: input });
      }}
    >
      <ul>{messages.map((m) => (<li key={m.id}>{m.display || m.role}</li>))}</ul>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button disabled={isLoading}>Send</button>
    </form>
  );
}
```

## Example Tool (DB-Aware)

```ts
import { tool } from 'ai';
import { z } from 'zod';
import { PatientService } from '@neonpro/core-services';

export const getPatientBalance = tool({
  description: 'Get patient outstanding balance by patientId',
  inputSchema: z.object({ patientId: z.string().uuid() }),
  outputSchema: z.object({ currency: z.string(), balance: z.number() }),
  execute: async ({ patientId }, { user }) => {
    // user contains auth context injected by your server
    const { clinicId, userId } = user;
    const result = await PatientService.getBalance({ userId, clinicId }, { patientId });
    return result; // must conform to outputSchema
  },
});
```

## Compliance & Security

- Consent: validate LGPD consent before any patient data tool call.
- RLS: Supabase policies restrict rows by clinic/user; tools never bypass RLS.
- Redaction: remove PII from prompts/logs; stream transient notifications for diagnostics.
- Audit: append audit events (who/what/when) per tool and message.
- Auth: JWT required for chat/tool routes; forbid client-side provider keys.

## Configuration

- Environment: `OPENAI_API_KEY`, Supabase URL/keys (service role only on server).
- Provider: set global provider or pass explicit provider per call.
- Rate Limits: per-user/session caps; exponential backoff; failover OpenAI→Anthropic.
- CORS/SSE: ensure SSE works end-to-end without buffering.

## Testing Strategy

- Unit: tool schemas, service layer functions, redaction utilities.
- Integration: chat route streaming, tool invocation paths (MSW mocks for providers), RLS behavior.
- E2E: user flows for typical clinic questions; ensure no PII leaks; consent gating.
- Commands:
```bash
pnpm --filter @neonpro/web test
pnpm --filter @neonpro/web type-check
```

## Performance & Observability

- Streaming: use smooth streaming if needed; render incremental parts.
- Token Usage: attach metadata for token counts and model IDs.
- Caching: memoize frequent DB reads with TTL, respecting consent and RLS.
- Metrics: log latencies per step/tool; alert on provider errors and timeouts.

## Deployment Notes

- Vercel: ensure Node 20 runtime, edge-compatible handlers where relevant.
- Build order: packages → apps; keep types shared via workspace protocol.
- Secrets: configure environment variables in Vercel; never expose service role client-side.

## Troubleshooting

- SSE not streaming: avoid extra writes after `toUIMessageStreamResponse`; disable proxy buffering.
- 401 from provider: verify server-side API key; never send provider keys to the client.
- Tool output not rendering: handle `input-streaming|input-available|output-available|output-error` states.
- RLS errors: confirm auth context (clinicId/userId) is passed and policies match expectations.

## See Also

- ../apis/ai-sdk-v5.0.md — AI SDK v5 patterns
- ../apis/api-schema-openapi-generation.md — OpenAPI/Swagger wiring
- ../AGENTS.md — Development workflow
- ../architecture/tech-stack.md — Stack and rationale
- ../rules/coding-standards.md — Code style & patterns
