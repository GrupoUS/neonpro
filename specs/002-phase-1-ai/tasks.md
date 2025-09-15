# Tasks: Phase 1 AI Chat Contextual Q&A

Input: Design documents from `/specs/002-phase-1-ai/`
Prerequisites: plan.md (required), research.md, data-model.md, contracts/

Execution Flow (main)
1. Load plan.md → extract stack and structure
2. Load optional docs (data-model.md, contracts/, research.md, quickstart.md)
3. Generate tasks per rules (TDD first, models→services→endpoints)
4. Order by dependencies, mark [P] when parallel safe
5. Validate completeness → SUCCESS

Path Conventions
- Backend API: `apps/api` (Hono)
- Web app: `apps/web`
- Shared: `packages/types`, `packages/core-services`, `packages/utils`

---

## Phase 3.1: Setup
- [ ] T001 Configure i18n keys scaffold (pt-BR, en-US) in `packages/shared/src/i18n/ai-chat.ts` [new file]
- [ ] T002 Create DB migration files for chat + audit tables in `packages/database/migrations/<timestamp>_ai_chat_phase1.sql`
- [ ] T003 Add types (ChatSession, ChatMessage, AuditEvent enums) in `packages/types/src/ai-chat.ts`
- [ ] T004 Wire RLS policies drafts for new tables in `packages/database/migrations/<timestamp>_ai_chat_phase1_rls.sql`
- [ ] T005 Add feature flag `AI_CHAT_MOCK_MODE` to `packages/config/src/env.ts`

## Phase 3.2: Tests First (TDD) – MUST FAIL BEFORE IMPL
- [ ] T006 [P] Contract test for `POST /api/v1/chat/query` in `apps/api/tests/contract/chat.query.test.ts`
- [ ] T007 [P] Integration test: consent validation path in `apps/api/tests/integration/chat.consent.test.ts`
- [ ] T008 [P] Integration test: fairness gating (10/5m, 30/hr) in `apps/api/tests/integration/chat.rate-limit.test.ts`
- [ ] T009 [P] Unit tests: redaction regex corpus in `packages/utils/tests/redaction.spec.ts`
- [ ] T010 [P] Unit tests: session expiration logic in `packages/core-services/tests/chatSession.spec.ts`
- [ ] T011 [P] Integration test: explanation endpoint mock in `apps/api/tests/integration/chat.explanation.test.ts`

## Phase 3.3: Core Models & Services
- [ ] T012 [P] Implement redaction utility in `packages/utils/src/redaction/pii.ts`
- [ ] T013 [P] Session repository (create/find/touch) in `packages/core-services/src/chat/sessionRepo.ts`
- [ ] T014 [P] Rate counter LRU in `packages/core-services/src/rate/fairness.ts`
- [ ] T015 Audit writer (structured) in `packages/core-services/src/audit/writer.ts`

## Phase 3.4: API Contracts & Schemas
- [ ] T016 Zod request/response schemas for chat query in `packages/core-services/src/chat/schemas.ts`
- [ ] T017 Zod schema for explanation request in same file (sequential with T016)

## Phase 3.5: API Endpoints (Mock First)
- [ ] T018 Implement `POST /api/v1/chat/query` route (mock streaming) in `apps/api/src/routes/chat/query.ts`
- [ ] T019 Implement `POST /api/v1/chat/explanation` (mock) in `apps/api/src/routes/chat/explanation.ts`
- [ ] T020 Wire route registration in `apps/api/src/index.ts`

## Phase 3.6: LLM Integration (behind flag)
- [ ] T021 OpenAI client wrapper with streaming in `packages/core-services/src/llm/openaiStream.ts`
- [ ] T022 Answer assembly pipeline with context window in `packages/core-services/src/chat/answerService.ts`
- [ ] T023 Explanation generation using redacted content in same service file

## Phase 3.7: Frontend Integration
- [ ] T024 Chat store (Zustand) in `apps/web/src/stores/aiChat.ts`
- [ ] T025 Streaming UI component with first-token timestamp in `apps/web/src/components/ai/ChatStream.tsx`
- [ ] T026 Explanation & Suggestions UI in `apps/web/src/components/ai/ChatDetails.tsx`
- [ ] T027 i18n wiring for new keys in `apps/web/src/i18n/ai-chat.ts`

## Phase 3.8: Observability & Policy
- [ ] T028 Standard error mapper to neutral responses in `packages/core-services/src/errors/map.ts`
- [ ] T029 Metrics instrumentation (latency, refusals, rateLimit) in `packages/core-services/src/metrics/aiChat.ts`
- [ ] T030 Audit retention job (partition + archive) migration in `packages/database/migrations/<timestamp>_audit_retention.sql`

## Phase 3.9: Polish
- [ ] T031 [P] Performance test harness (<2s p95) in `apps/api/tests/perf/aiChat.perf.test.ts`
- [ ] T032 [P] Update docs quickstart links in `README.md` and `/specs/002-phase-1-ai/quickstart.md`
- [ ] T033 [P] Security review checklist (no PII in logs) in `docs/security/ai-chat-review.md`
- [ ] T034 [P] Accessibility review for streaming (ARIA live) in `docs/accessibility/ai-chat.md`

## Dependencies
- Setup (T001–T005) before tests and impl
- Tests (T006–T011) before implementation
- Models/Services (T012–T015) before Endpoints (T018–T020)
- Schemas (T016–T017) before Endpoints
- Endpoints before Frontend (T024–T027)

## Parallel Guidance
- [P] tasks: T006–T011, T012–T015, T031–T034
- Avoid concurrent edits in same file; keep PRs small and focused

---

Validation Checklist
- [ ] All contracts mapped to tests (T006 covers chat-query)
- [ ] All entities have model/service tasks
- [ ] Tests appear before implementation
- [ ] Parallel tasks independent by file
- [ ] Paths are explicit and actionable
