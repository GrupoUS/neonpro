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
- [x] T001 Configure i18n keys scaffold (pt-BR, en-US) in `packages/shared/src/i18n/ai-chat.ts` [✅ VERIFIED]
- [ ] T002 Create DB migration files for chat + audit tables in `packages/database/migrations/20250915_ai_chat_phase1.sql` [❌ MISSING]
- [x] T003 Add types (ChatSession, ChatMessage, AuditEvent enums) in `packages/types/src/ai-chat.ts` [✅ VERIFIED]
- [ ] T004 Wire RLS policies drafts for new tables in `packages/database/migrations/20250915_ai_chat_phase1_rls.sql` [❌ MISSING]
- [x] T005 Add feature flag `AI_CHAT_MOCK_MODE` to `packages/config/src/env.ts` [✅ VERIFIED]

## Phase 3.2: Tests First (TDD) – MUST FAIL BEFORE IMPL
- [x] T006 [P] Contract test for `POST /api/v1/chat/query` in `apps/api/tests/contract/chat-query.test.ts` [✅ VERIFIED]
- [x] T007 [P] Integration test: consent validation path in `apps/api/tests/integration/chat-consent.test.ts` [✅ VERIFIED]
- [x] T008 [P] Integration test: fairness gating (10/5m, 30/hr) in `apps/api/tests/integration/chat-rate-limit.test.ts` [✅ VERIFIED]
- [ ] T009 [P] Unit tests: redaction regex corpus in `packages/utils/tests/redaction.spec.ts` [❌ MISSING - Only lgpd.test.ts found]
- [ ] T010 [P] Unit tests: session expiration logic in `packages/core-services/tests/chatSession.spec.ts` [❌ MISSING]
- [x] T011 [P] Integration test: explanation endpoint mock in `apps/api/tests/integration/chat-explanation.test.ts` [✅ VERIFIED]

## Phase 3.3: Core Models & Services
- [x] T012 [P] Implement redaction utility in `packages/utils/src/redaction/pii.ts` [✅ VERIFIED]
- [x] T013 [P] Session repository (create/find/touch) in `packages/core-services/src/chat/sessionRepo.ts` [✅ VERIFIED]
- [x] T014 [P] Rate counter LRU in `packages/core-services/src/rate/fairness.ts` [✅ VERIFIED]
- [x] T015 Audit writer (structured) in `packages/core-services/src/audit/writer.ts` [✅ VERIFIED]

## Phase 3.4: API Contracts & Schemas
- [x] T016 Zod request/response schemas for chat query in `packages/core-services/src/chat/schemas.ts` [✅ VERIFIED]
- [x] T017 Zod schema for explanation request in same file (sequential with T016) [✅ VERIFIED]

## Phase 3.5: API Endpoints (Mock First)
- [x] T018 Implement `POST /api/v1/chat/query` route (mock streaming) in `apps/api/src/routes/chat.ts` [✅ VERIFIED - Full endpoints]
- [x] T019 Implement `POST /api/v1/chat/explanation` (mock) in `apps/api/src/routes/chat.ts` [✅ VERIFIED]
- [x] T020 Wire route registration in `apps/api/src/app.ts` [✅ VERIFIED]

## Phase 3.6: LLM Integration (behind flag)
- [x] T021 OpenAI client wrapper with streaming in `packages/core-services/src/services/openai-provider.ts` [✅ VERIFIED]
- [x] T022 Answer assembly pipeline with context window in `packages/core-services/src/services/chat-service.ts` [✅ VERIFIED]
- [x] T023 Explanation generation using redacted content in same service file [✅ VERIFIED]

## Phase 3.7: Frontend Integration
- [x] T024 Chat store (Zustand) in `apps/web/src/hooks/useAIChat.ts` [✅ VERIFIED]
- [x] T025 Streaming UI component with first-token timestamp in `apps/web/src/components/ai/ai-chat.tsx` [✅ VERIFIED]
- [x] T026 Explanation & Suggestions UI in `apps/web/src/components/organisms/ai-chat-container.tsx` [✅ VERIFIED]
- [x] T027 i18n wiring for new keys in `apps/web/src/components/ai/ai-chat.tsx` [✅ VERIFIED]

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

## 🔍 VERIFICATION REPORT (2025-09-17 - AGENT AUDIT)

### ✅ COMPLETED TASKS (22/27 = 81.5%)

**Phase 3.1 Setup**: 3/5 ✅
- ✅ T001: i18n scaffold verified
- ❌ T002: DB migrations missing (security gap)
- ✅ T003: Types verified
- ❌ T004: RLS policies missing (critical security gap)
- ✅ T005: Feature flag verified

**Phase 3.2 TDD Tests**: 4/6 ✅
- ✅ T006-T008, T011: Contract and integration tests verified
- ❌ T009: Redaction unit tests missing
- ❌ T010: Session expiration unit tests missing

**Phase 3.3-3.7 Implementation**: All verified ✅
- ✅ Core services, schemas, endpoints, frontend components complete

### 🔴 CRITICAL GAPS IDENTIFIED

1. **Security**: Missing RLS policies (T004)
2. **Database**: Missing audit table migrations (T002)
3. **Testing**: Missing redaction and session unit tests (T009, T010)

### 📊 QUALITY AUDIT RESULTS

**Build & Tests**: ✅ PASS
- TypeScript: ✅ Pass (0 errors)
- Production Build: ✅ Pass (26.97s)
- Test Suite: ✅ Pass (20 files, 43 tests)
- Lint: ⚠️ 164 warnings (cleanup needed)

**Security Analysis**: ⚠️ PARTIAL
- ✅ PII redaction implemented
- ✅ Audit logging structured
- ❌ Missing database-level security (RLS)
- ❌ Audit logs to console only (not persisted)

**Performance**: ⚠️ ISSUES DETECTED
- 🔴 Large bundle sizes (>1MB chunks)
- 🔴 No code splitting
- 🔴 No dynamic imports

### 🎯 RECOMMENDATIONS

**Immediate (P0)**:
1. Implement missing RLS policies for tenant isolation
2. Create audit table migrations for compliance
3. Move audit logging from console to database

**High Priority (P1)**:
4. Add missing unit tests for redaction and session logic
5. Implement bundle splitting for performance
6. Clean up linting warnings (164 items)

### 🏥 HEALTHCARE COMPLIANCE STATUS

**LGPD Compliance**: ⚠️ PARTIAL
- ✅ PII redaction implemented
- ✅ Consent validation in place
- ❌ Database audit trails missing
- ❌ RLS policies for data isolation missing

**Production Readiness**: ⚠️ CONDITIONAL
- ✅ Mock mode functional and tested
- ✅ API endpoints operational
- ❌ Security gaps must be addressed
- ❌ Performance optimization needed

---

## PHASE 1 AI CHAT STATUS REPORT (2025-09-17)

🟡 **22/27 TASKS COMPLETED (81.5%) - CONDITIONAL PRODUCTION READY**

### Implementation Summary:
- **Backend API**: ✅ All endpoints with middleware
- **Frontend UI**: ✅ Complete chat interface
- **Testing**: ✅ Integration tests passing (gaps in unit tests)
- **Infrastructure**: ✅ Core services implemented
- **LGPD Compliance**: ⚠️ Partial (missing database audit, RLS)
- **Security**: ⚠️ Application-level only (missing DB-level)

### Critical Path to Production:
1. **MUST FIX**: Implement RLS policies (T004)
2. **MUST FIX**: Create audit table migrations (T002)
3. **SHOULD FIX**: Performance optimization (bundle splitting)
4. **SHOULD FIX**: Complete test coverage (T009, T010)

**Current Status**: 🟡 STAGING READY (Mock Mode) | 🔴 PRODUCTION BLOCKED (Security Gaps)