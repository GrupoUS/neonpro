# AI Chat and Supabase Environment Setup (Vercel)

This project deploys two artifacts:
- Web (Vite) — configured by `vercel.json`
- API (Hono) — configured by `api-vercel.json`

Both require environment variables. Names differ between Web and API.

## Web (Vite) — required
Set these in the Web project on Vercel (Build + Runtime):
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

Optionally, for compatibility (web also accepts these):
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

Notes
- Vite only exposes variables prefixed with `VITE_` to the browser. Without these, the Patients page will fail with “Invalid API key” or similar.

## API (Hono) — required
Set these in the API project on Vercel:
- SUPABASE_URL
- SUPABASE_ANON_KEY

AI providers (any one is enough):
- OPENAI_API_KEY
- GOOGLE_GENERATIVE_AI_API_KEY
- ANTHROPIC_API_KEY

Optional
- TAVILY_API_KEY (enables lightweight web-hints for suggestions)

## CLI examples
Web (vercel.json):
- vercel env add VITE_SUPABASE_URL production --local-config vercel.json
- vercel env add VITE_SUPABASE_ANON_KEY production --local-config vercel.json

API (api-vercel.json):
- vercel env add SUPABASE_URL production --local-config api-vercel.json
- vercel env add SUPABASE_ANON_KEY production --local-config api-vercel.json
- vercel env add OPENAI_API_KEY production --local-config api-vercel.json
- vercel env add GOOGLE_GENERATIVE_AI_API_KEY production --local-config api-vercel.json
- vercel env add ANTHROPIC_API_KEY production --local-config api-vercel.json

## Health checks
- API Supabase: GET /v1/health → hasSupabaseUrl/hasSupabaseKey
- AI Chat: POST /v1/ai-chat/stream → returns headers X-Chat-Model, X-Response-Time
