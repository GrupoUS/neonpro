# NeonPro AI Chat (KokonutUI + Vercel AI SDK)

This feature wires all KokonutUI AI components into a working AI chat flow, powered by Vercel AI SDK with model access restricted to:
- OpenAI ChatGPT 5 Mini: gpt-5-mini (primary)
- Google Gemini 2.5 Flash: gemini-2.5-flash (fallback)

## What changed
- API: apps/api/src/routes/ai-chat.ts
  - Primary model openai('gpt-5-mini')
  - Fallback model google('gemini-2.5-flash')
  - Removed Anthropic fallback
  - Suggestions endpoint now uses gpt-5-mini
- Web client: apps/web/src/lib/ai/ai-chat-service.ts
  - Client now calls API endpoints for streaming/suggestions
  - Preserves LGPD redaction + simple audit log
- Web util: apps/web/src/lib/api.ts → resolves API base URL
- Route: apps/web/src/routes/ai-chat.tsx → Chat page using AIChatContainer
- Fix: apps/web/src/components/ui/card.tsx import path to '@/lib/utils'

## Environment
Required keys (set in .env.local):
- OPENAI_API_KEY=...
- GOOGLE_API_KEY=...
Optional (local dev):
- VITE_API_URL=http://localhost:3004/v1

## How to run (local)
1) API (port 3004)
   - PowerShell: pnpm --filter @neonpro/api run dev:api
2) Web
   - PowerShell: pnpm --filter @neonpro/web run dev
   - If using separate ports, set VITE_API_URL as above.

## Programmatic use (client)
- stream: POST {base}/ai-chat/stream → NDJSON/text stream
- suggestions: POST {base}/ai-chat/suggestions → { suggestions: string[] }
Base URL resolved by getApiBaseUrl(): VITE_API_URL or '/v1'.

## Compliance
- LGPD: PII redaction patterns in both API logs and client audit log
- Retention: short-lived logs (console in dev; wire to real sink in prod)

## Notes
- KokonutUI components already present; this wiring ensures end-to-end flow
- Only gpt-5-mini and gemini-2.5-flash are enabled by design
- Voice (STT/TTS) left as placeholders; TTS uses Web Speech API on client
