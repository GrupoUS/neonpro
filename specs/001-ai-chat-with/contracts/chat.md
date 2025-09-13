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
