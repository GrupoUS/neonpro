# Phase 0 — Research for AI Chat (Database-Aware)

## Unknowns & Clarifications
- Roles allowed to use chat: [Admin, Clinician, Finance, Reception] — confirm exact scopes and visibility per role.
- Localization: primary locale pt-BR; confirm additional locales (en-US?).
- Transcript retention: propose 90 days default with export + deletion on request; confirm policy.
- Performance SLOs: propose p95 ≤ 2s response start; full answer ≤ 10–12s; confirm with product.
- Offline behavior: limited — allow composing prompts; execution requires connectivity; confirm requirement.

## Technology Decisions
- AI SDK: Vercel AI SDK v5 — streaming chat, tools, typed UI messages.
- Providers: OpenAI primary (Portuguese optimized); Anthropic fallback; provider keys server-side only.
- API: Hono routes for chat and tools; SSE streaming enabled end-to-end.
- DB Access: Supabase/Postgres under RLS; business logic via core-services; no direct DB queries from UI.
- UI Components: Prompt builder (ai-prompt), suggestions (ai-input-search), loading (ai-loading), explanation toggle (safe summary only).

## Rationale
- Type safety and streaming capabilities fit NeonPro’s strict TypeScript and performance goals.
- RLS+consent enforcement at the data layer ensures LGPD compliance; auditability built-in.
- Component choices improve UX clarity while preserving privacy (no raw CoT exposure).

## Alternatives Considered
- Direct LLM integration without SDK: rejected (lose typed UI, streaming helpers, provider abstraction).
- Exposing raw chain-of-thought: rejected (privacy/compliance risks); keep summarized explanations only.
- Custom prompt system vs curated presets: adopt curated presets to reduce ambiguity and risks.

## Best Practices & References
- Follow Constitution: AI response start <2s; TDD ≥95% for critical logic; strict TS; audit logging; consent checks.
- Accessibility: keyboard navigation, screen reader labels, reduced motion on loading.

## Decisions (Current)
- Roles: tentatively Admin, Clinician, Finance, Reception — finalize mappings to intents.
- Locales: default pt-BR; extensible to en-US.
- Retention: 90 days (configurable); audit logs retained per policy; confirm with compliance.
- SLOs: p95 stream start ≤2s; full answer ≤12s.

