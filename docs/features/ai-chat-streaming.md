# AI Chat Streaming (Phase 1)

Last updated: 2025-09-15

## Overview
Client-side streaming utility for AI chat responses with SSE parsing and mock mode for tests and local development.

File: `apps/web/src/lib/ai-chat/streaming.ts`
Export: `startChatStream(input): Promise<AsyncIterable<StreamChunk>>`

## Contract
- Input
  - `sessionId: string` (required)
  - `text?: string`
  - `messages?: { role: 'user' | 'assistant' | 'system'; content: string }[]`
  - `model?: string`
  - `baseUrl?: string` — Optional. Needed for SSR/Node if not in browser.
- Output
  - Async iterable yielding `StreamChunk`:
    - `{ type: 'text', delta: string }`
    - `{ type: 'done' }` (terminal)

## Mock Mode Behavior
The util avoids network in the following cases and yields a deterministic mock stream:
- Environment flag `aiConfig.AI_CHAT_MOCK_MODE` is true, or
- Running under tests (Vite/Vitest), or
- SSR/Node runtime (no `window`) and `baseUrl` not provided.

This ensures unit tests run without network and local/dev can toggle via env.

## URL/Network
When not in mock mode, POST to:
`/api/v1/ai-chat/stream?allowExperimental=true` (optionally `&mock=true` when mock flag enabled)

## Error Handling
`apps/web/src/lib/ai-chat/errors.ts`

- `ChatError` — domain error; message is already user-safe.
- `toUserMessage(err)` mapping:
  - Abort/Cancelled → "Request cancelled"
  - Network/Fetch failures → "Network error. Please check your connection."
  - Rate limit → "You’re being rate limited. Please try again in a moment."
  - Default → "Service temporarily unavailable"

Example usage:

```ts
import { toUserMessage, ChatError } from '@/lib/ai-chat/errors';

try {
  for await (const chunk of await startChatStream({ sessionId, text })) {
    // ...
  }
} catch (err) {
  const message = toUserMessage(err);
  toast.error(message);
}
```

## Tests
- `apps/web/src/__tests__/ai-chat/chat-streaming.test.ts`
- `apps/web/src/__tests__/ai-chat/chat-streaming.util.test.ts`
- `apps/web/src/__tests__/ai-chat/chat-errors.test.ts`
- `apps/web/tests/integration/chat-streaming.test.ts`
- `apps/web/tests/integration/chat-errors.test.ts`

All tests are passing. Lint is clean (warnings only). Type-check has legacy errors outside AI Chat scope.


## Endpoint Reference
- Canonical backend endpoint: `POST /api/v1/chat/query` (SSE). Use `?mock=true` to force deterministic mock.
- Legacy streaming route (still available): `POST /api/v1/ai-chat/stream`.
