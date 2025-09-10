# Implementation Plan: Unified PRD Index Governance Layer (Enhanced v2)

**Branch**: `001-unified-prd-index` | **Date**: 2025-09-10 | **Spec**: `/specs/001-unified-prd-index/spec.md`
**Input**: Feature specification from `/specs/001-unified-prd-index/spec.md`

## Summary
Canonical governance layer for PRD index: KPI normalization, policy thresholds, escalation paths, risk tracking, deterministic prioritization scoring. Phase 1: in-memory services only (no persistence) enabling contract-first TDD. Research resolved all but external baseline data source.

## Technical Context
**Language/Version**: TypeScript 5.7.x
**Primary Dependencies**: Internal packages (`@neonpro/core-services`, `@neonpro/types`)
**Storage**: None (ephemeral Phase 1)
**Testing**: Vitest (contract/unit), future integration tests on persistence introduction
**Target Platform**: Monorepo (library consumption by API + Web later)
**Project Type**: web (existing frontend+backend) but confined to core-services package
**Performance Goals**: Single KPI eval <5ms, sequencing 500 KPIs future <250ms
**Constraints**: Simplicity (no DB), deterministic scoring, healthcare compliance alignment
**Scale/Scope**: <40 KPIs, <100 risks, <200 feature scores cycle

## Constitution Check
PASS (Initial & Post-Design). No deviations needing Complexity Tracking.

### Simplicity
- Projects touched: 1 (`packages/core-services`) ✅
- Framework wrappers: none ✅
- Single data model abstraction: yes ✅
- Avoided patterns: Repository/UoW deferred ✅

### Architecture
- Library oriented: governance submodule ✅
- Additional CLI: deferred (YAGNI) ✅
- Doc updates: quickstart + contracts act as public doc ✅

### Testing
- Contract tests precede implementation ✅
- Order: Contract → Scenario → Unit helper (priority vectors) ✅
- Real deps only (in-memory) ✅
- Integration tests deferred (no infra yet) ✅

### Observability (Seed)
Structured log events planned (kpi.evaluated, escalation.triggered, priority.scored). Full pipeline deferred.

### Versioning
Seed version `0.1.0` internal; contract changes bump MINOR.

## Project Structure
```
packages/core-services/src/services/governance/
  kpi-service.ts
  policy-service.ts
  escalation-service.ts
  risk-service.ts
  prioritization-service.ts
  __tests__/ (added in tasks phase)
```
Structure Decision: Use existing package (no new project) to maintain monorepo simplicity.

## Phase 0: Outline & Research
Completed → see `research.md` (decision log, risks, test anchors).

## Phase 1: Design & Contracts
Artifacts produced: `data-model.md`, `contracts.md`, `quickstart.md`. All enhanced with validation, pre/post conditions, acceptance walkthrough.

## Acceptance Criteria Matrix
| Requirement | Verification Method | Artifact/Test Anchor | Status |
|-------------|--------------------|----------------------|--------|
| FR-003 KPI table unified | Contract test register/list | kpi.register.test.ts | Planned |
| FR-005 AI governance thresholds | Policy attach + evaluatePolicies | policy.attach.test.ts | Planned |
| FR-007 Priority scoring reproducible | Vector tests | priority.scoring.test.ts | Planned |
| FR-021 Escalation after 2 breaches | Scenario breach sequence | escalation.breach-sequence.test.ts | Planned |
| FR-030 Archive rationale required | Archive negative test | kpi.archive.test.ts | Planned |
| FR-031 PHI encryption metric defined | Spec presence only (Phase 1 no impl) | spec.md YAML metrics | Done |
| FR-033 Zod validation placeholder | Placeholder test ensures schema stub exists | schema.placeholder.test.ts | Planned |

## Observability Strategy (Phase 1 Seed)
| Event | Stage | Emission Style | Future Sink |
|-------|-------|----------------|-------------|
| kpi.evaluated | evaluation | console JSON | Structured logger adapter |
| escalation.triggered | escalation | console JSON | Incident tool adapter |
| priority.scored | scoring | console JSON | Analytics pipeline |
Deferred: correlation IDs, tracing spans, metrics exporter.

## Test Matrix
| Layer | Purpose | Representative Files | Tool |
|-------|---------|----------------------|------|
| Contract | Public method guarantees | kpi.register.test.ts | Vitest |
| Scenario | Multi-step behavior (breach→escalation) | escalation.breach-sequence.test.ts | Vitest |
| Unit | Pure functions (scoring, exposure) | priority.scoring.test.ts | Vitest |
| Placeholder | Compliance hooks (Zod schema stub) | schema.placeholder.test.ts | Vitest |

Coverage Goal Phase 1: ≥85% of governance submodule lines (critical paths). Future ≥90% when persistence added.

## Phase 2: Task Planning Approach
Strategy preserved (see earlier); will generate ~22–26 tasks. Parallel markers on independent pure functions (scoring, exposure, risk map). Not executed here.

## Phase 3+: Future Implementation
Out of scope for /plan; will materialize after /tasks output.

## Progress Tracking
**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (describe only) ✅ described
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved (except FR-022 data source dependency) *tracked*
- [x] Complexity deviations documented (none)

## Exit Readiness for /tasks
- Contracts stable ✅
- Data model constraints documented ✅
- Acceptance matrix defined ✅
- Test anchors enumerated ✅
- Observability seed defined ✅

---
_Based on Constitution v2.1.1 - See `/memory/constitution.md`_
