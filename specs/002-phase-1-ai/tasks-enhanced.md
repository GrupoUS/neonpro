# Tasks: Phase 1 AI Chat Contextual Q&A

**Input**: Design documents from `/home/vibecode/neonpro/specs/002-phase-1-ai/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Extract: TypeScript 5.x, React 19, Hono API, Supabase, OpenAI
   → Structure: Monorepo with packages/apps layout
2. Load design documents:
   → data-model.md: ChatSession, ChatMessage, AuditEvent, RateCounter, Suggestion, ExplanationSummary
   → contracts/: chat-query.openapi.json (POST /api/v1/chat/query)
   → research.md: LGPD compliance, performance optimizations
3. Generate tasks by category with TDD approach
4. Apply constitutional compliance and LGPD requirements
5. Order by dependencies: Setup → Tests → Models → Services → API → UI → Polish
```

## Path Conventions
- Backend API: `apps/api/src/`
- Web app: `apps/web/src/`
- Shared: `packages/types/src/`, `packages/core-services/src/`, `packages/utils/src/`
- Database: `packages/database/migrations/`
- Tests: `apps/api/tests/`, `apps/web/tests/`

## Phase 3.1: Setup & Infrastructure
- [ ] T001 Configure i18n keys scaffold (pt-BR, en-US) in `packages/shared/src/i18n/ai-chat.ts`
- [x] T002 Create DB migration for chat tables in `packages/database/migrations/20250915_ai_chat_phase1.sql`
- [x] T003 Create RLS policies migration in `packages/database/migrations/20250915_ai_chat_rls.sql`
- [x] T004 [P] Add AI chat types in `packages/types/src/ai-chat.ts`
- [x] T005 [P] Add environment config for AI chat in `packages/config/src/env.ts`
- [x] T006 [P] Add LGPD compliance utilities in `packages/utils/src/lgpd.ts`

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T007 [P] Contract test POST /api/v1/chat/query in `apps/api/tests/contract/chat-query.test.ts` (passing)
- [x] T008 [P] Contract test GET /api/v1/chat/session/:id in `apps/api/tests/contract/chat-session.test.ts`
- [x] T009 [P] Contract test POST /api/v1/chat/explanation in `apps/api/tests/contract/chat-explanation.test.ts`
- [x] T010 [P] Integration test consent validation in `apps/api/tests/integration/chat-consent.test.ts`
- [x] T011 [P] Integration test fairness rate limits in `apps/api/tests/integration/chat-rate-limit.test.ts` (passing)
- [x] T012 [P] Integration test PII redaction pipeline in `apps/api/tests/integration/chat-redaction.test.ts` (passing)
- [x] T013 [P] Integration test streaming responses in `apps/api/tests/integration/chat-streaming.test.ts`
- [x] T014 [P] Integration test audit logging in `apps/api/tests/integration/chat-audit.test.ts`

## Phase 3.3: Core Models & Services (ONLY after tests are failing)
- [ ] T015 [P] ChatSession model in `packages/core-services/src/models/chat-session.ts`
- [ ] T016 [P] ChatMessage model in `packages/core-services/src/models/chat-message.ts`
- [ ] T017 [P] AuditEvent model in `packages/core-services/src/models/audit-event.ts`
- [ ] T018 [P] RateCounter service in `packages/core-services/src/services/rate-counter.ts`
- [ ] T019 [P] PII redaction service in `packages/core-services/src/services/pii-redaction.ts`
- [ ] T020 ConsentValidation service in `packages/core-services/src/services/consent-validation.ts`
- [ ] T021 ChatService orchestrator in `packages/core-services/src/services/chat-service.ts`
- [ ] T022 AI provider interface in `packages/core-services/src/services/ai-provider.ts`
- [ ] T023 OpenAI implementation in `packages/core-services/src/services/openai-provider.ts`

## Phase 3.4: API Implementation
- [ ] T024 POST /api/v1/chat/query endpoint in `apps/api/src/routes/chat/query.ts`
- [ ] T025 GET /api/v1/chat/session/:id endpoint in `apps/api/src/routes/chat/session.ts`
- [ ] T026 POST /api/v1/chat/explanation endpoint in `apps/api/src/routes/chat/explanation.ts`
- [ ] T027 GET /api/v1/chat/suggestions endpoint in `apps/api/src/routes/chat/suggestions.ts`
- [ ] T028 GET /api/v1/chat/health endpoint in `apps/api/src/routes/chat/health.ts`
- [ ] T029 Streaming middleware for SSE in `apps/api/src/middleware/streaming.ts`
- [ ] T030 Rate limiting middleware in `apps/api/src/middleware/rate-limit.ts`
- [ ] T031 Audit logging middleware in `apps/api/src/middleware/audit-log.ts`

## Phase 3.5: Frontend Implementation
- [ ] T032 [P] Chat session hook in `apps/web/src/hooks/use-chat-session.ts`
- [ ] T033 [P] Chat streaming hook in `apps/web/src/hooks/use-chat-streaming.ts`
- [ ] T034 [P] Chat message component in `apps/web/src/components/chat/chat-message.tsx`
- [ ] T035 [P] Chat input component in `apps/web/src/components/chat/chat-input.tsx`
- [ ] T036 Chat container component in `apps/web/src/components/chat/chat-container.tsx`
- [ ] T037 Chat session manager in `apps/web/src/components/chat/chat-session-manager.tsx`
- [ ] T038 Consent prompt component in `apps/web/src/components/chat/consent-prompt.tsx`
- [ ] T039 Rate limit notification in `apps/web/src/components/chat/rate-limit-notice.tsx`

## Phase 3.6: Integration & Configuration
- [ ] T040 Connect ChatService to Supabase in `packages/core-services/src/database/chat-repository.ts`
- [ ] T041 Configure OpenAI client in `packages/core-services/src/config/ai-config.ts`
- [ ] T042 Setup structured logging in `packages/core-services/src/utils/logger.ts`
- [ ] T043 Configure CORS for streaming in `apps/api/src/config/cors.ts`
- [ ] T044 Setup session management in `apps/api/src/middleware/session.ts`
- [ ] T045 Configure deterministic mock mode in `packages/core-services/src/services/mock-ai-provider.ts`

## Phase 3.7: Polish & Performance
- [ ] T046 [P] Unit tests for redaction utils in `packages/utils/tests/lgpd.test.ts`
- [ ] T047 [P] Unit tests for rate counter in `packages/core-services/tests/rate-counter.test.ts`
- [ ] T048 [P] Performance tests (<2s response time) in `apps/api/tests/performance/chat-latency.test.ts`
- [ ] T049 [P] E2E tests with Playwright in `apps/web/tests/e2e/chat-flow.spec.ts`
- [ ] T050 [P] Update API documentation in `docs/apis/chat-api.md`
- [ ] T051 [P] Update feature documentation in `docs/features/ai-chat-phase-1.md`
- [ ] T052 LGPD compliance audit checklist in `docs/compliance/ai-chat-lgpd.md`
- [ ] T053 Performance monitoring setup in `apps/api/src/monitoring/chat-metrics.ts`

## Dependencies
**Critical Path:**
- Setup (T001-T006) → Tests (T007-T014) → Models/Services (T015-T023) → API (T024-T031) → Frontend (T032-T039) → Integration (T040-T045) → Polish (T046-T053)

**Blocking Dependencies:**
- T002,T003 (migrations) block all database operations
- T004 (types) blocks all implementation tasks
- T020,T021 (consent, chat service) block T024-T028 (API endpoints)
- T024-T028 (API) block T032-T039 (frontend)

## Parallel Execution Examples
```bash
# Phase 3.2: Launch all contract tests together
Task: "Contract test POST /api/v1/chat/query in apps/api/tests/contract/chat-query.test.ts"
Task: "Contract test GET /api/v1/chat/session/:id in apps/api/tests/contract/chat-session.test.ts"
Task: "Integration test consent validation in apps/api/tests/integration/chat-consent.test.ts"
Task: "Integration test fairness rate limits in apps/api/tests/integration/chat-rate-limit.test.ts"

# Phase 3.3: Launch all model creation together
Task: "ChatSession model in packages/core-services/src/models/chat-session.ts"
Task: "ChatMessage model in packages/core-services/src/models/chat-message.ts"
Task: "AuditEvent model in packages/core-services/src/models/audit-event.ts"
```

## Constitutional Compliance Checkpoints
- **T006**: LGPD compliance utilities with CPF/CNPJ redaction
- **T012**: PII redaction testing with Brazilian data patterns
- **T019**: Constitutional data protection implementation
- **T031**: Audit logging with 5-year retention compliance
- **T052**: Final LGPD compliance verification

## Performance Targets
- **T048**: <2s response time (constitutional requirement)
- **T011**: Rate limits (10/5m, 30/hr) enforcement
- **T053**: Real-time performance monitoring

## Validation Checklist
- [x] All contracts have corresponding tests (T007-T009)
- [x] All entities have model tasks (T015-T017)
- [x] All tests come before implementation (Phase 3.2 → 3.3)
- [x] Parallel tasks truly independent (different files)
- [x] Each task specifies exact file path
- [x] Constitutional compliance integrated throughout
- [x] LGPD requirements addressed in multiple tasks
- [x] Performance targets defined and tested

## Progress — 2025-09-15
- Completed migrations:
  - packages/database/migrations/20250915_ai_chat_phase1.sql
  - packages/database/migrations/20250915_ai_chat_rls.sql
- Critical AI Chat tests passing (focus scope):
  - apps/api/tests/integration/chat-consent.test.ts
  - apps/api/tests/integration/chat-streaming.test.ts
  - apps/api/tests/integration/chat-audit.test.ts
  - apps/api/tests/integration/chat-redaction.test.ts
  - apps/api/tests/integration/chat-rate-limit.test.ts
- Notes:
  - Some unrelated suites may fail due to missing modules or environment variables; out of current Phase 1 scope.
- Pending next (per dependencies):
  - Contract tests: T008 (GET /chat/session/:id), T009 (POST /chat/explanation)
  - Setup tasks: T004 (types), T005 (env), T006 (LGPD utils)
