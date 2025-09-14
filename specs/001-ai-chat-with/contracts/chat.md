# Contract: Chat

## Request
- messages: UIMessage[] (prior conversation)
- text?: string (new user input)
- presetId?: string (Prompt Template)
- params?: record (e.g., dateRange)
- locale: string (default pt-BR)

## Response
- stream: true (server-sent events)
- message: { id, role, display, data? }
- metadata: { startedAt, model, tokenUsage?, dataFreshness }
- errors?: [] (structured)

## Errors
- AUTHENTICATION_REQUIRED, PERMISSION_DENIED
- LGPD_CONSENT_REQUIRED, RATE_LIMITED, PROVIDER_UNAVAILABLE

## Elements Mappings
- Context: { text?: string }
- Conversation: { threadId?: string } — server resolves from session
- Image: attachments?: [{ ref, type }]
- Open-in-Chat: prefill?: { text, context? }
- Prompt Input: same as `text` + validation
- Reasoning: explanation?: { requested: boolean }
- Response: includes metadata.dataFreshness, summary actions
- Suggestion: suggestions?: string[] (safe)
- Task: task?: { id, status, progress? }


## Transport details
- HTTP (prefix `/v1`):
  - POST `/ai-chat/stream` — body JSON; response is a text stream with headers:
    - `X-Chat-Started-At` (ISO string)
    - `X-Chat-Model` (e.g., `mock:model`, `openai:gpt-4o-mini`) 
    - `X-Data-Freshness` (e.g., `as-of-now`)
    - `X-Response-Time` (server timing in ms)
  - POST `/ai-chat/suggestions` — JSON `{ suggestions: string[] }`, sets `X-Response-Time`

## Privacy & LGPD
- Server logs redact user content via `redactPII`.
- Consent checks available per `ConsentScope` with `checkConsent`.
- Do not emit raw prompts or PII in responses or headers.
