# Tasks: Enhanced Multi-Model AI Assistant

**Input**: Design documents from `/home/vibecode/neonpro/specs/003-enhanced-multi-model/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Extract: TypeScript 5.x, multi-model routing, plan gating, CRUD domains
   → Structure: Extends Phase 1 with enhanced AI capabilities
2. Load design documents:
   → data-model.md: Plan, UserPlan, UsageCounter, Recommendation, OperationLog, DomainDescriptor
   → contracts/: analyze.openapi.json, crud.openapi.json
   → research.md: Multi-model selection, quota management, LGPD compliance
3. Generate tasks with constitutional compliance and healthcare focus
4. Apply TDD approach with LGPD and performance requirements
5. Order by dependencies: Setup → Tests → Models → Services → API → UI → Integration → Polish
```

## Path Conventions
- Backend API: `apps/api/src/`
- Web app: `apps/web/src/`
- Shared: `packages/types/src/`, `packages/core-services/src/`, `packages/utils/src/`
- Database: `packages/database/migrations/`
- Tests: `apps/api/tests/`, `apps/web/tests/`

## Phase 3.1: Setup & Infrastructure
- [ ] T001 Create plans seed data in `packages/database/seeds/plans_seed.sql`
- [ ] T002 Create DB migration for plans and usage tracking in `packages/database/migrations/20250915_enhanced_ai_schema.sql`
- [ ] T003 Create RLS policies for multi-model data in `packages/database/migrations/20250915_enhanced_ai_rls.sql`
- [ ] T004 [P] Add enhanced AI types in `packages/types/src/enhanced-ai.ts`
- [ ] T005 [P] Add plan gating config in `packages/config/src/plans.ts`
- [ ] T006 [P] Add usage quota configuration in `packages/config/src/quotas.ts`
- [ ] T007 [P] Add LGPD compliance for CRUD operations in `packages/utils/src/crud-compliance.ts`

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T008 [P] Contract test POST /api/v1/ai/analyze in `apps/api/tests/contract/ai-analyze.test.ts`
- [ ] T009 [P] Contract test POST /api/v1/ai/crud in `apps/api/tests/contract/ai-crud.test.ts`
- [ ] T010 [P] Contract test GET /api/v1/ai/usage in `apps/api/tests/contract/ai-usage.test.ts`
- [ ] T011 [P] Contract test POST /api/v1/ai/recommendations in `apps/api/tests/contract/ai-recommendations.test.ts`
- [ ] T012 [P] Integration test plan gating (free vs premium) in `apps/api/tests/integration/plan-gating.test.ts`
- [ ] T013 [P] Integration test quota enforcement in `apps/api/tests/integration/quota-enforcement.test.ts`
- [ ] T014 [P] Integration test abuse detection in `apps/api/tests/integration/abuse-detection.test.ts`
- [ ] T015 [P] Integration test multi-model failover in `apps/api/tests/integration/model-failover.test.ts`
- [ ] T016 [P] Integration test cross-domain analytics in `apps/api/tests/integration/cross-domain-analytics.test.ts`
- [ ] T017 [P] Integration test CRUD operations with LGPD compliance in `apps/api/tests/integration/crud-compliance.test.ts`

## Phase 3.3: Core Models & Services (ONLY after tests are failing)
- [ ] T018 [P] Plan model in `packages/core-services/src/models/plan.ts`
- [ ] T019 [P] UserPlan model in `packages/core-services/src/models/user-plan.ts`
- [ ] T020 [P] UsageCounter model in `packages/core-services/src/models/usage-counter.ts`
- [ ] T021 [P] Recommendation model in `packages/core-services/src/models/recommendation.ts`
- [ ] T022 [P] OperationLog model in `packages/core-services/src/models/operation-log.ts`
- [ ] T023 [P] DomainDescriptor model in `packages/core-services/src/models/domain-descriptor.ts`
- [ ] T024 [P] Multi-model router service in `packages/core-services/src/services/multi-model-router.ts`
- [ ] T025 [P] Plan gating service in `packages/core-services/src/services/plan-gating.ts`
- [ ] T026 [P] Usage tracking service in `packages/core-services/src/services/usage-tracker.ts`
- [ ] T027 [P] Abuse detection service in `packages/core-services/src/services/abuse-detector.ts`
- [ ] T028 CRUD parser service in `packages/core-services/src/services/crud-parser.ts`
- [ ] T029 Analytics service in `packages/core-services/src/services/analytics-service.ts`
- [ ] T030 Recommendation engine in `packages/core-services/src/services/recommendation-engine.ts`
- [ ] T031 Domain service for Clients in `packages/core-services/src/services/domains/client-domain.ts`
- [ ] T032 Domain service for Finance in `packages/core-services/src/services/domains/finance-domain.ts`
- [ ] T033 Domain service for Agenda in `packages/core-services/src/services/domains/agenda-domain.ts`

## Phase 3.4: API Implementation
- [ ] T034 POST /api/v1/ai/analyze endpoint in `apps/api/src/routes/ai/analyze.ts`
- [ ] T035 POST /api/v1/ai/crud endpoint in `apps/api/src/routes/ai/crud.ts`
- [ ] T036 GET /api/v1/ai/usage endpoint in `apps/api/src/routes/ai/usage.ts`
- [ ] T037 POST /api/v1/ai/recommendations endpoint in `apps/api/src/routes/ai/recommendations.ts`
- [ ] T038 GET /api/v1/ai/models endpoint in `apps/api/src/routes/ai/models.ts`
- [ ] T039 Plan gating middleware in `apps/api/src/middleware/plan-gating.ts`
- [ ] T040 Usage quota middleware in `apps/api/src/middleware/usage-quota.ts`
- [ ] T041 Abuse detection middleware in `apps/api/src/middleware/abuse-detection.ts`
- [ ] T042 Model failover middleware in `apps/api/src/middleware/model-failover.ts`
- [ ] T043 CRUD operation logging in `apps/api/src/middleware/crud-audit.ts`

## Phase 3.5: Frontend Implementation
- [ ] T044 [P] Enhanced AI chat hook in `apps/web/src/hooks/use-enhanced-ai.ts`
- [ ] T045 [P] Multi-model selection hook in `apps/web/src/hooks/use-model-selection.ts`
- [ ] T046 [P] Usage tracking hook in `apps/web/src/hooks/use-usage-tracking.ts`
- [ ] T047 [P] Plan upgrade component in `apps/web/src/components/ai/plan-upgrade.tsx`
- [ ] T048 [P] CRUD interface component in `apps/web/src/components/ai/crud-interface.tsx`
- [ ] T049 [P] Analytics dashboard component in `apps/web/src/components/ai/analytics-dashboard.tsx`
- [ ] T050 [P] Recommendation display component in `apps/web/src/components/ai/recommendations.tsx`
- [ ] T051 [P] Usage quota indicator in `apps/web/src/components/ai/usage-indicator.tsx`
- [ ] T052 Enhanced AI container in `apps/web/src/components/ai/enhanced-ai-container.tsx`
- [ ] T053 Model failover notification in `apps/web/src/components/ai/failover-notice.tsx`
- [ ] T054 CRUD confirmation dialog in `apps/web/src/components/ai/crud-confirmation.tsx`

## Phase 3.6: Integration & Configuration
- [ ] T055 Connect enhanced services to Supabase in `packages/core-services/src/database/enhanced-ai-repository.ts`
- [ ] T056 Configure multi-model AI providers in `packages/core-services/src/config/multi-model-config.ts`
- [ ] T057 Setup plan management in `packages/core-services/src/services/plan-manager.ts`
- [ ] T058 Configure Brazilian payment integration (PIX) in `packages/core-services/src/services/payment-service.ts`
- [ ] T059 Setup cross-domain data access with LGPD compliance in `packages/core-services/src/database/cross-domain-access.ts`
- [ ] T060 Configure performance monitoring for multi-model operations in `apps/api/src/monitoring/enhanced-ai-metrics.ts`

## Phase 3.7: Healthcare Compliance & Performance
- [ ] T061 [P] LGPD compliance tests for CRUD operations in `packages/utils/tests/crud-compliance.test.ts`
- [ ] T062 [P] Performance tests (<3s single-domain, <5s cross-domain) in `apps/api/tests/performance/enhanced-ai-latency.test.ts`
- [ ] T063 [P] Healthcare data validation tests in `packages/core-services/tests/healthcare-validation.test.ts`
- [ ] T064 [P] Brazilian Portuguese terminology tests in `packages/utils/tests/portuguese-terminology.test.ts`
- [ ] T065 [P] CFM professional validation integration in `packages/core-services/src/services/cfm-validation.ts`
- [ ] T066 [P] ANVISA compliance checks for aesthetic procedures in `packages/core-services/src/services/anvisa-compliance.ts`

## Phase 3.8: Polish & Documentation
- [ ] T067 [P] E2E tests for complete user flows in `apps/web/tests/e2e/enhanced-ai-flows.spec.ts`
- [ ] T068 [P] Multi-model performance optimization in `packages/core-services/src/utils/performance-optimizer.ts`
- [ ] T069 [P] Update API documentation in `docs/apis/enhanced-ai-api.md`
- [ ] T070 [P] Update feature documentation in `docs/features/enhanced-multi-model-ai.md`
- [ ] T071 [P] LGPD compliance documentation in `docs/compliance/enhanced-ai-lgpd.md`
- [ ] T072 [P] Performance monitoring dashboard in `apps/web/src/components/admin/performance-dashboard.tsx`
- [ ] T073 Brazilian healthcare compliance audit in `docs/compliance/healthcare-compliance-audit.md`
- [ ] T074 Multi-model cost optimization analysis in `docs/architecture/ai-cost-optimization.md`

## Dependencies
**Critical Path:**
- Setup (T001-T007) → Tests (T008-T017) → Models/Services (T018-T033) → API (T034-T043) → Frontend (T044-T054) → Integration (T055-T060) → Compliance (T061-T066) → Polish (T067-T074)

**Blocking Dependencies:**
- T002,T003 (migrations) block all database operations
- T004,T005,T006 (types, plans, quotas) block all implementation tasks
- T024,T025,T026 (router, gating, usage) block T034-T043 (API endpoints)
- T034-T043 (API) block T044-T054 (frontend)
- T055-T060 (integration) required before T061-T066 (compliance)

## Parallel Execution Examples
```bash
# Phase 3.2: Launch all contract tests together
Task: "Contract test POST /api/v1/ai/analyze in apps/api/tests/contract/ai-analyze.test.ts"
Task: "Contract test POST /api/v1/ai/crud in apps/api/tests/contract/ai-crud.test.ts"
Task: "Integration test plan gating in apps/api/tests/integration/plan-gating.test.ts"
Task: "Integration test quota enforcement in apps/api/tests/integration/quota-enforcement.test.ts"

# Phase 3.3: Launch all model creation together
Task: "Plan model in packages/core-services/src/models/plan.ts"
Task: "UsageCounter model in packages/core-services/src/models/usage-counter.ts"
Task: "Multi-model router service in packages/core-services/src/services/multi-model-router.ts"
```

## Constitutional Compliance Checkpoints
- **T007**: LGPD compliance for CRUD operations with Brazilian healthcare data
- **T017**: CRUD operations with constitutional data protection
- **T043**: Audit logging with 5-year retention for healthcare compliance
- **T059**: Cross-domain access with granular LGPD consent
- **T065**: CFM professional validation (Brazilian medical council)
- **T066**: ANVISA compliance for aesthetic procedures
- **T071**: Complete LGPD compliance documentation
- **T073**: Healthcare compliance audit for Brazilian regulations

## Performance Targets
- **T062**: <3s single-domain CRUD, <5s cross-domain analytics (constitutional requirement)
- **T042**: Model failover <400ms (performance requirement)
- **T068**: Multi-model optimization for Brazilian edge regions
- **T060**: Real-time performance monitoring with alerts

## Healthcare-Specific Features
- **T031-T033**: Domain services for Clients, Finance, Agenda with LGPD compliance
- **T058**: PIX payment integration for Brazilian market
- **T064**: Portuguese terminology optimization for aesthetic procedures
- **T072**: Performance dashboard for clinic operations

## Validation Checklist
- [x] All contracts have corresponding tests (T008-T011)
- [x] All entities have model tasks (T018-T023)
- [x] All tests come before implementation (Phase 3.2 → 3.3)
- [x] Parallel tasks truly independent (different files)
- [x] Each task specifies exact file path
- [x] Constitutional compliance integrated throughout
- [x] Healthcare-specific LGPD requirements addressed
- [x] Brazilian market considerations (PIX, CFM, ANVISA)
- [x] Performance targets defined and tested
- [x] Multi-model architecture properly structured