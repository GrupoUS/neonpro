# Tasks: Unified PRD Index Governance Layer (Phase 1)

Input: Design documents in `/specs/001-unified-prd-index/`
Prerequisites: `plan.md` (required), `research.md`, `data-model.md`, `contracts.md`, `quickstart.md`
Scope: In-memory governance services (no persistence) enabling contract-first TDD.

## Execution Flow (Adapted)
1. Load plan & artifacts (completed)  
2. Derive entities → model tasks (KPI, RiskItem, GovernancePolicy, EscalationPath, PriorityScore)  
3. Derive services (KPIService, GovernanceService, EscalationService, RiskService, PrioritizationService)  
4. Generate contract/scenario/unit test tasks FIRST (must fail)  
5. Implement services following tests  
6. Add observability seed logging  
7. Polish: docs, refactor, coverage, performance sanity  

## Conventions
- Code location: `packages/core-services/src/services/governance/`  
- Tests location: `packages/core-services/src/services/governance/__tests__/` subdivided: `contract/`, `scenario/`, `unit/`, `placeholder/`  
- [P] = May run in parallel (different files & no blocking dependency)  
- Deterministic order: Setup → Tests (contract/scenario/unit skeletons) → Core models/helpers → Services → Observability → Polish  

## Phase 3.1: Setup
- [ ] T001 Setup governance directory structure (`packages/core-services/src/services/governance/` + `__tests__` subfolders)  
- [ ] T002 Add barrel export in `packages/core-services/src/services/governance/index.ts` (exports planned service interfaces)  
- [ ] T003 [P] Add placeholder `zod-schemas.ts` with TODO markers (future FR-033)  
- [ ] T004 Configure test subfolder structure & add README explaining layering  

## Phase 3.2: Tests First (TDD) – MUST FAIL INITIALLY
Contract Tests (Public service guarantees):
- [ ] T005 [P] Create contract test `kpi.register.test.ts` (duplicate rejection, provisionalSince set)  
- [ ] T006 [P] Create contract test `kpi.archive.test.ts` (rationale required, status final)  
- [ ] T007 [P] Create contract test `policy.attach.test.ts` (threshold resolution + idempotency)  
- [ ] T008 [P] Create contract test `escalation.trigger.test.ts` (manual trigger receipt id)  

Scenario Tests (Multi-step behavior):
- [ ] T009 Escalation breach sequence test `escalation.breach-sequence.test.ts` (two consecutive breaches)  
- [ ] T010 Provisional aging rule test `kpi.aging-escalation.test.ts` (time-travel 61 days)  

Unit Tests (Pure functions & deterministic logic):
- [ ] T011 [P] Priority scoring vectors `priority.scoring.test.ts` (tie-break & mapping)  
- [ ] T012 [P] Risk exposure recompute `risk.exposure.test.ts`  
- [ ] T013 [P] Threshold breach detection `threshold.breach.test.ts`  
- [ ] T014 [P] Policy evaluation aggregation `policy.evaluate-summary.test.ts`  

Placeholder / Compliance:
- [ ] T015 [P] Schema placeholder test `schema.placeholder.test.ts` (ensures zod-schemas export exists)  

## Phase 3.3: Core Models & Helpers (Only after T005–T015 created & failing)
- [ ] T016 [P] Implement KPI model helper (factory + validation) `kpi-model.ts`  
- [ ] T017 [P] Implement RiskItem model helper (exposure calc) `risk-model.ts`  
- [ ] T018 [P] Implement Policy/Threshold validation helper `policy-model.ts`  
- [ ] T019 [P] Implement EscalationPath validation helper `escalation-model.ts`  
- [ ] T020 [P] Implement Priority scoring pure function `priority-scoring.ts`  

## Phase 3.4: Service Implementations (Sequential by dependency)
- [ ] T021 Implement `kpi-service.ts` (register, update, list, evaluate, archive)  
  - Depends: T016, T018
- [ ] T022 Implement `risk-service.ts` (register/update/list/heatMap)  
  - Depends: T017
- [ ] T023 Implement `prioritization-service.ts` (scoreFeature, list, recalcAll stub)  
  - Depends: T020
- [ ] T024 Implement `policy-service.ts` (attachPolicy, list, evaluatePolicies)  
  - Depends: T018, T021
- [ ] T025 Implement `escalation-service.ts` (trigger, resolve, list)  
  - Depends: T019

## Phase 3.5: Observability Seed
- [ ] T026 [P] Introduce event logger utility `events-logger.ts` (console JSON)  
- [ ] T027 Inject logging into services (kpi.evaluated, escalation.triggered, priority.scored)  
  - Depends: T021, T023, T025

## Phase 3.6: Polish & Quality
- [ ] T028 [P] Add negative tests for invalid status transitions `kpi.status-transition.test.ts`  
- [ ] T029 [P] Add deterministic tie-break extended vectors `priority.tie-break.test.ts`  
- [ ] T030 Coverage threshold config update (ensure ≥85% lines)  
- [ ] T031 [P] Quickstart snippet verification test `quickstart.walkthrough.test.ts` (mirrors steps 1–7)  
- [ ] T032 Documentation refresh: update `quickstart.md` with any interface adjustments  
- [ ] T033 Update `contracts.md` if signatures refined (bump internal version)  
- [ ] T034 Lightweight performance sanity (loop 500 scoreFeature calls <250ms) test `priority.performance.test.ts`  
- [ ] T035 Refactor pass (duplication removal, ensure KISS)  
- [ ] T036 Constitution audit self-check note appended to `plan.md` (implementation phase status)  

## Dependencies Summary
| Task | Blocks | Depends On |
|------|--------|------------|
| T005–T015 | T016–T020 | T001–T004 |
| T016–T020 | T021–T025 | T005–T015 |
| T021 | T024,T027 | T016,T018 |
| T022 | (none) | T017 |
| T023 | T027 | T020 |
| T024 | T027 | T018,T021 |
| T025 | T027 | T019 |
| T026 | T027 | T021,T023,T025 (injection step depends indirectly) |
| T027 | T028–T036 | T021,T023,T025,T026 |
| T028–T036 | (finalization) | T027 (and specific earlier tasks) |

## Parallel Execution Guidance
Initial Parallel (post-setup):
```
# Contract & unit tests in parallel
Task T005
Task T006
Task T007
Task T008
Task T011
Task T012
Task T013
Task T014
Task T015
```
Model/Helper Parallel (after tests created):
```
Task T016
Task T017
Task T018
Task T019
Task T020
```
Service Implementation (sequential groups):
```
# First wave
Task T021
Task T022
Task T023
# Then dependent
Task T024
Task T025
```
Polish Parallel Bursts:
```
Task T028
Task T029
Task T031
Task T034
```

## Validation Checklist (Pre-Execution Gate)
- [ ] All acceptance matrix items mapped to at least one test (FR-003,005,007,021,030,031,033)  
- [ ] All entities have model/helper tasks (KPI, RiskItem, Policy/Threshold, EscalationPath, PriorityScore)  
- [ ] Tests precede implementation tasks (T005–T015 < T016–T025)  
- [ ] Parallel tasks do not share target file  
- [ ] Observability events mapped (T027)  
- [ ] Open clarification FR-022 represented (aging rule test T010)  

## Task Count Summary
Total tasks: 40  

## Phase 3.7: Clarification Resolution (Pre-Implementation Finalization)
- [ ] T037 Resolve FR-022 baseline data source (ingest pilot dataset reference; update spec change_log)  
- [ ] T038 Implement hallucination hybrid evaluation doc & confirm methodology (FR-023)  
- [ ] T039 Finalize AI accuracy review cadence documentation (weekly + monthly roll-up) (FR-024)  
- [ ] T040 Confirm performance budget environment scope & add enforcement note (FR-025)  

(These must be completed before marking "All NEEDS CLARIFICATION resolved" in `plan.md`).  

Parallel-eligible tasks: 22  
Critical path tasks: T001,T005,T016,T021,T027,T035,T036,T037,T038,T039,T040  

## Notes
- Persistence intentionally excluded (YAGNI)  
- Revisit FR-022 once baseline data ingestion source confirmed (future data ingestion epic)  
- Tie-break logic extension (T029) ensures determinism transparency  
- Performance sanity (T034) protects scoring scalability assumption  

SUCCESS: Tasks ready for execution.
