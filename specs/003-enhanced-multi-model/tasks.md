# Tasks: Enhanced Multi-Model AI Assistant

Input: Design documents from `/specs/003-enhanced-multi-model/`
Prerequisites: plan.md (required), research.md, data-model.md, contracts/

Execution Flow (main)
1. Load plan.md (tech + structure)
2. Read data-model.md, contracts/, research.md, quickstart.md
3. Generate tasks by category (TDD first, models→services→endpoints)
4. Order with dependencies, mark [P] for parallel-safe
5. Validate completeness → SUCCESS

Path Conventions
- Backend API: `apps/api`
- Web app: `apps/web`
- Shared: `packages/types`, `packages/core-services`, `packages/utils`, `packages/config`, `packages/database`

---

## Phase 3.1: Setup
- [ ] T001 Seed plans (basic, premium) script in `packages/database/seeds/plan_seed.sql`
- [ ] T002 Create migration for `plans`, `user_plan`, `usage_counters`, `recommendations`, `domain_descriptors` in `packages/database/migrations/<ts>_ai_enhanced_schema.sql`
- [ ] T003 Add types (Plan, UsageCounter, Recommendation, DomainDescriptor) in `packages/types/src/ai-enhanced.ts`
- [ ] T004 Add config: `FREE_DAILY_READ_LIMIT=40`, `ABUSE_Q_60S=12`, `ABUSE_M_10M=5` in `packages/config/src/env.ts`

## Phase 3.2: Tests First (TDD)
- [ ] T005 [P] Contract test for `POST /api/v1/ai/analyze` in `apps/api/tests/contract/ai.analyze.test.ts`
- [ ] T006 [P] Contract test for `POST /api/v1/ai/crud` in `apps/api/tests/contract/ai.crud.test.ts`
- [ ] T007 [P] Contract test for `GET /api/v1/ai/usage` in `apps/api/tests/contract/ai.usage.test.ts`
- [ ] T008 [P] Contract test for `POST /api/v1/ai/recommendations` in `apps/api/tests/contract/ai.recommendations.test.ts`
- [ ] T009 [P] Contract test for `POST /api/v1/ai/cancel` in `apps/api/tests/contract/ai.cancel.test.ts`
- [ ] T010 [P] Contract test for `GET /api/v1/ai/models` in `apps/api/tests/contract/ai.models.test.ts`
- [ ] T011 [P] Integration test: quota (free 40/day) in `apps/api/tests/integration/ai.quota.test.ts`
- [ ] T012 [P] Integration test: abuse thresholds and cooldown in `apps/api/tests/integration/ai.abuse.test.ts`
- [ ] T013 [P] Integration test: failover neutral notice in `apps/api/tests/integration/ai.failover.test.ts`
- [ ] T014 [P] Unit tests: CRUD intent parser in `packages/core-services/tests/parser/crudIntent.spec.ts`
- [ ] T015 [P] Unit tests: date/time normalization, patient ref extraction in `packages/core-services/tests/parser/argsExtract.spec.ts`
- [ ] T016 [P] Unit tests: recommendation category constraint in `packages/core-services/tests/recommendations/engine.spec.ts`

## Phase 3.3: Core Models & Services
- [ ] T017 [P] Usage counter repository (daily upsert) in `packages/core-services/src/usage/repository.ts`
- [ ] T018 [P] Abuse sliding window tracker in `packages/core-services/src/usage/abuseWindow.ts`
- [ ] T019 [P] CRUD intent parser + arg extraction in `packages/core-services/src/parser/crud.ts`
- [ ] T020 Aggregation metric templates in `packages/core-services/src/analytics/templates.ts`
- [ ] T021 Analytics aggregator (queries + combine) in `packages/core-services/src/analytics/aggregator.ts`
- [ ] T022 Model router + strategy map in `packages/core-services/src/llm/router.ts`
- [ ] T023 Failover controller thresholds in `packages/core-services/src/llm/failover.ts`
- [ ] T024 Recommendations engine (category-limited) in `packages/core-services/src/recommendations/engine.ts`

## Phase 3.4: Schemas & Contracts
- [ ] T025 Zod schemas for analyze/crud/usage/recommendations/cancel/models in `packages/core-services/src/ai/schemas.ts`

## Phase 3.5: API Endpoints
- [ ] T026 POST `/api/v1/ai/analyze` orchestrator in `apps/api/src/routes/ai/analyze.ts`
- [ ] T027 POST `/api/v1/ai/crud` (intent→confirm→execute) in `apps/api/src/routes/ai/crud.ts`
- [ ] T028 GET `/api/v1/ai/usage` in `apps/api/src/routes/ai/usage.ts`
- [ ] T029 POST `/api/v1/ai/recommendations` in `apps/api/src/routes/ai/recommendations.ts`
- [ ] T030 POST `/api/v1/ai/cancel` in `apps/api/src/routes/ai/cancel.ts`
- [ ] T031 GET `/api/v1/ai/models` in `apps/api/src/routes/ai/models.ts`
- [ ] T032 Wire route registration in `apps/api/src/index.ts`

## Phase 3.6: UI Integration
- [ ] T033 Plan gating UI (upgrade prompt component) in `apps/web/src/components/ai/UpgradePrompt.tsx`
- [ ] T034 Usage meter indicator in `apps/web/src/components/ai/UsageMeter.tsx`
- [ ] T035 CRUD confirmation modal in `apps/web/src/components/ai/CrudConfirm.tsx`
- [ ] T036 Failover neutral banner in `apps/web/src/components/ai/FailoverNotice.tsx`
- [ ] T037 Recommendation cards in `apps/web/src/components/ai/Recommendations.tsx`

## Phase 3.7: Observability & Metrics
- [ ] T038 Metrics taxonomy counters/gauges in `packages/core-services/src/metrics/aiEnhanced.ts`
- [ ] T039 Logging enrichment (model_used, failover) in `packages/core-services/src/logging/enrich.ts`
- [ ] T040 Temporary dashboard script in `tools/metrics/aiEnhancedDashboard.ts`

## Phase 3.8: Polish
- [ ] T041 [P] Performance test analytics p95<5s in `apps/api/tests/perf/aiAnalytics.perf.test.ts`
- [ ] T042 [P] Documentation for upgrade copy source in `docs/features/ai-upgrade-copy.md`
- [ ] T043 [P] es-ES translation key placeholders in `packages/shared/src/i18n/ai-enhanced.es.ts`
- [ ] T044 [P] Security & compliance review notes in `docs/security/ai-enhanced-review.md`

## Dependencies
- Setup (T001–T004) before tests and impl
- Contract/Integration/Unit tests (T005–T016) before service/endpoint codes
- Core services (T017–T024) before endpoints (T026–T031)
- Schemas (T025) before endpoints
- Endpoints before UI (T033–T037)

## Parallel Guidance
- [P] tasks: T005–T016, T017–T024, T041–T044
- Keep parallel tasks in separate files to avoid conflicts

---

Validation Checklist
- [ ] All contract files have tests (analyze, crud)
- [ ] All entities have corresponding model/service tasks
- [ ] Tests precede implementation
- [ ] Parallel tasks independent
- [ ] Paths explicit and actionable
