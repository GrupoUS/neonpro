# Atomic Task Sequencing – Phase 1 AI Chat
(Use /tasks command later for auto generation; this manual breakdown provides execution clarity.)

## Legend
P = parallelizable, S = sequential dependency, GATE = quality or design gate

## Phase A – Foundations
1. (S) Create DB migration: chat_sessions, chat_messages, audit_events tables
2. (S) Add TypeScript domain types to `@neonpro/types` (ChatSession, ChatMessage, AuditEvent enums)
3. (S) Add Zod schemas for API request/response (query, explanation) in `@neonpro/core-services`
4. (S) Implement Supabase RLS policies for new tables
5. (S) Add locale key scaffolding (pt-BR/en-US) in shared i18n module
6. (GATE) Constitution check: schema + policies + types

## Phase B – Redaction & Consent Layer
7. (S) Implement redaction utility (regex pipeline) + unit tests (RED → GREEN)
8. (P) Add test corpus for CPF/CNPJ/email/phone edge cases
9. (S) Implement consent verification view query + integration test
10. (S) Integrate redaction + consent check pre-processing module
11. (GATE) Redaction coverage >=95% test corpus

## Phase C – Rate Limiting & Session Management
12. (S) Implement in-memory rate counter LRU component + unit tests
13. (S) Session repository functions (create/find/update inactivity)
14. (P) Add fairness limit integration test (10/5m, 30/hr) with time mocking
15. (S) Add session expiry logic + test

## Phase D – Query Answer Service (Mock First)
16. (S) Implement deterministic mock provider (fixtures)
17. (S) API route POST /chat/query returning mock streaming events
18. (S) Contract test ensures 200 SSE and audit logged
19. (S) Add explanation endpoint skeleton returning mock explanation
20. (GATE) All contract tests passing before real LLM integration

## Phase E – LLM Integration
21. (S) Add OpenAI client wrapper (minimal) with streaming abstraction
22. (S) Add answer assembly pipeline (context window summarization)
23. (P) Performance test: ensure <1s first token with mock clock
24. (S) Enable real LLM behind feature flag; default mock in tests
25. (S) Implement explanation generation (redacted summary)
26. (S) Suggestion generation (static heuristics first)
27. (GATE) p95 latency <2s on sample dataset (record metrics)

## Phase F – UI/Frontend Integration
28. (S) Create chat state store (Zustand) with session handling
29. (S) Streaming component (SSE) showing token progress timestamp
30. (P) Input component with rate-limit + consent error display
31. (P) Explanation & suggestions UI cards
32. (S) i18n translation wiring for all new keys
33. (GATE) Accessibility review (ARIA live region for streaming)

## Phase G – Observability & Hardening
34. (S) Structured logging fields alignment (audit + service logs)
35. (S) Metrics instrumentation (latency, refusals, rate_limit triggers)
36. (P) Add stale answer flag logic & test (>5m freshness)
37. (S) Standardized error response mapping
38. (GATE) Security review: no PII leakage in logs

## Phase H – Finalization
39. (S) Write quickstart script automation
40. (S) Update documentation (llms.txt snippet, README section)
41. (S) Add migration rollback test
42. (GATE) Final Constitution compliance review

## Parallelization Notes
- Corpus redaction tests can run while consent view implemented.
- UI card components can develop once streaming mock available.

## Exit Criteria
- All GATE tasks complete, tests green, latency budget met, >95% redaction accuracy, audit retention config applied.


## Finalization Status — 2025-09-16
- Current state: Phases A–D largely realized via consolidated route + middlewares; tests validating core behavior are green.
- Outstanding: UI (Phase F), Observability polish (Phase G), and finalization gates (Phase H) captured in tasks-enhanced.md.
- QA Snapshot: Type-check PASS, Build PASS, Tests PASS, Lint WARN-only (tests).
