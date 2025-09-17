# Implementation Plan: Phase 1 AI Chat Contextual Q&A

**Branch**: `002-phase-1-ai` | **Date**: 2025-09-15 | **Spec**: ./spec.md
**Input**: Feature specification from `/specs/002-phase-1-ai/spec.md`

## Summary
Provide privacy‑aware, role + consent gated contextual Q&A over patient clinical + limited financial data with deterministic mock, audit logging, redaction, fairness rate limits, and bilingual (pt-BR/en-US) support delivering first token <1s and full answer under 2s p95.

## Technical Context
**Language/Version**: TypeScript 5.x (monorepo)  
**Primary Dependencies**: React 19, Hono (API), Supabase JS client, OpenAI API (initial LLM), Zod (validation), Zustand (state), shadcn/ui, TanStack Router  
**Storage**: Supabase Postgres (RLS enforced)  
**Testing**: Vitest (unit/contract), Playwright (E2E later), integration tests using real Supabase test schema  
**Target Platform**: Web (frontend + backend)  
**Project Type**: web (frontend + backend)  
**Performance Goals**: <1s first token, <2s p95 full answer, <50ms redaction pipeline overhead, audit write <30ms  
**Constraints**: LGPD compliance, 5‑year audit retention (configurable ≥2), fairness limits (10/5m, 30/hr), memory window 60m inactivity  
**Scale/Scope**: Initial 10 clinics, up to 100 concurrent staff sessions, growth path to 10k daily questions.

## Constitution Check (Initial)
Simplicity: Single additional feature inside existing monorepo; reuse existing API project; no extra library repos created. One data model extension (audit_event, consent_record references). Avoids repository pattern.
Architecture: Feature logic organized as service module + route handlers + frontend hook. Libraries: `@neonpro/core-services` (extend), `@neonpro/types` (add types), `@neonpro/web` (UI). CLI untouched. llms.txt doc planned once stable.
Testing: Will enforce RED first: write contract/integration tests before implementing answer service. Order: contract (API schemas) → integration (end‑to‑end API with Supabase test DB + mock LLM) → unit (pure redaction/rate) → UI tests (later). Real Supabase (test schema).
Observability: Structured logging via existing logger; include correlation/sessionId.
Versioning: Increment MINOR when feature released; BUILD per change pre‑release.
Result: PASS initial check.

## Project Structure Decision
Using Web application (frontend + backend) layout already present. No new top-level project.

## Phase 0: Research Outline
Unknowns identified: precise regex/NER for Brazilian PII (CPF/CNPJ formats), optimal token window for context vs latency, deterministic mock strategy, bilingual i18n phrasing repository, fairness counter storage (in‑memory vs Redis/Supabase). Research tasks created.
(Details in `research.md`.)

## Phase 1: Design Highlights
Entities: User, ChatSession, Message, Suggestion, ExplanationSummary, ConsentRecord (existing), AuditEvent, RateCounter.
Contracts: POST /api/v1/chat/query, GET /api/v1/chat/session/:id, POST /api/v1/chat/explanation, GET /api/v1/chat/suggestions, GET /api/v1/chat/health.
Data Model: New tables audit_events (PII‑redacted columns), chat_sessions, chat_messages, rate_counters (maybe ephemeral, consider materialized view alternative). Redaction pipeline functions.
Quickstart: 1) Create consent record 2) Issue question 3) Observe streaming answer 4) Request explanation 5) Trigger fairness limit scenario (script) 6) Retrieve audit log.
Post‑Design Constitution Check: PASS (no added complexity).

## Phase 2: Task Planning Approach (Description Only)
Tasks will be generated per contract & entity: create migration + types + contract tests first, then redaction utility tests, rate limiting tests, service implementation, UI components, streaming integration, deterministic mock fixture, i18n messages, audit retention config. Parallelizable: individual endpoint contract tests, utility pure functions. Sequential: migrations → types → services → API routes → UI.

## Complexity Tracking
| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| (none) | | |

## Progress Tracking
- [x] Phase 0: Research complete (/plan command)  
- [x] Phase 1: Design complete (/plan command)  
- [x] Phase 2: Task planning complete (/plan command - describe approach only)  
- [ ] Phase 3: Tasks generated (/tasks command)  
- [ ] Phase 4: Implementation complete  
- [ ] Phase 5: Validation passed  

**Gate Status**:
- [x] Initial Constitution Check: PASS  
- [x] Post-Design Constitution Check: PASS  
- [x] All NEEDS CLARIFICATION resolved  
- [ ] Complexity deviations documented  

---
*Based on Constitution v2.0.0*


## Finalization Status — 2025-09-16
- Phase Gate Results: Initial/Post-Design checks PASS; Implementation snapshot validated (API endpoints + middlewares in place).
- Quality Gates: Type-check PASS, Vite build PASS, Vitest PASS (19/39), Lint WARN-only.
- Exit Criteria Progress: Contract & integration tests green for core flows; remaining UI tasks tracked.
- Next Steps: Execute remaining Phase 3.5–3.7 items per tasks-enhanced.md and tasks-sequenced.md.
