# Phase 1 Contracts: Unified PRD Index (Enhanced v2)

Status: draft
Scope: Internal governance layer contracts (non-HTTP, logical service boundaries)
Change Log: v2 adds pre/post conditions, idempotency notes, error semantics, test mapping.

## 1. Contract Overview
These contracts define the minimal, decoupled interfaces for governance, metrics, risk, and prioritization services. They are intentionally persistence-agnostic and UI-agnostic.

## 2. Type Primitives
```
Identifier = string (stable, uppercase snake case for enumerated domain objects)
SemVer = string (valid semver)
ISODate = string (YYYY-MM-DD)
```

## 3. Domain Interfaces (TypeScript-like)
```ts
// KPI & Metrics
interface KPI { /* ... unchanged from v1 (see spec) */ }
interface Threshold { /* ... */ }
interface GovernancePolicy { /* ... */ }
interface EscalationPath { /* ... */ }
interface ActionStep { /* ... */ }
interface RiskItem { /* ... */ }
interface PriorityScore { /* ... */ }
```
(Full field-level constraints in `data-model.md`).

## 4. Service Contracts (with Pre/Post Conditions & Idempotency)
```ts
interface KPIService {
  /**
   * Register new KPI.
   * Preconditions: id not used; targets >=0; status in {active, provisional}; formula non-empty.
   * Postconditions: KPI persisted in registry; status==provisional => provisionalSince set.
   * Idempotency: Calling register with identical payload after success MUST error (duplicate) not silently succeed.
   */
  register(kpi: KPI): KPI
  /**
   * Partial update.
   * Preconditions: KPI exists; no illegal status transition.
   * Postconditions: Updated fields validated; exposure recalculated if probability/impact changed.
   */
  update(id: string, patch: Partial<KPI>): KPI
  /** List KPIs optionally filtered by status. */
  list(filter?: { status?: string }): KPI[]
  /**
   * Evaluate a KPI value at given date.
   * Preconditions: KPI exists; value numeric finite.
   * Postconditions: Threshold breaches enumerated; status may escalate externally; returns deterministic result.
   */
  evaluate(id: string, value: number, date: ISODate): KPIEvaluationResult
  /**
   * Archive KPI with rationale.
   * Preconditions: KPI exists; rationale non-empty; status != archived.
   * Postconditions: status==archived; replacement rationale logged.
   */
  archive(id: string, rationale: string): void
}

interface GovernanceService {
  /** Attach policy (replace if same id?).
   * Preconditions: policy.thresholds length>=1; each metricRef resolvable.
   * Postconditions: Policy stored; updatedAt set.
   * Idempotency: Same content reattach returns stored object (no duplicate).
   */
  attachPolicy(policy: GovernancePolicy): GovernancePolicy
  /** Evaluate all policies.
   * Postconditions: Summary counts reflect threshold breaches; escalationsTriggered list length>=0.
   */
  evaluatePolicies(contextDate?: ISODate): PolicyEvaluationSummary
  listPolicies(type?: string): GovernancePolicy[]
}

interface EscalationService {
  /** Resolve escalation path and simulate/execute actions.
   * Preconditions: path exists.
   * Postconditions: actionsDispatched==actions.length unless suppressed.
   */
  resolveEscalation(pathId: string, context: EscalationContext): EscalationOutcome
  listPaths(): EscalationPath[]
  /** Trigger raw escalation (explicit).
   * Preconditions: path exists.
   * Postconditions: TriggerReceipt created.
   * Idempotency: Re-trigger allowed; each call distinct receipt id.
   */
  trigger(pathId: string, meta: Record<string,unknown>): TriggerReceipt
}

interface RiskService {
  register(risk: RiskItem): RiskItem
  update(id: string, patch: Partial<RiskItem>): RiskItem
  list(status?: string): RiskItem[]
  /** Compute risk heat map (probability x impact grid). */
  evaluateHeatMap(): RiskHeatMap
}

interface PrioritizationService {
  /** Score feature; totalScore + priorityLevel derived.
   * Preconditions: Inputs 1..5
   * Postconditions: Deterministic mapping; priorityLevel consistent with scoringWeights.
   */
  scoreFeature(input: Omit<PriorityScore,'totalScore'|'priorityLevel'>): PriorityScore
  recalcAll(): PriorityScore[]
  list(): PriorityScore[]
}
```

## 5. Result / Supporting Types
```ts
interface KPIEvaluationResult { /* unchanged */ }
interface ThresholdBreach { /* unchanged */ }
interface PolicyEvaluationSummary { /* unchanged */ }
interface EscalationContext { /* unchanged */ }
interface EscalationOutcome { /* unchanged */ }
interface TriggerReceipt { id: string; pathId: string; createdAt: ISODate }
interface RiskHeatMapCell { probability: number; impact: number; count: number }
interface RiskHeatMap { cells: RiskHeatMapCell[] }
```

## 6. Invariants & Constraints
| Invariant | Description | Enforced By |
|-----------|-------------|-------------|
| UNIQUE_KPI_ID | No duplicate KPI IDs | register() check |
| EXPOSURE_FORMULA | exposure == probability * impact | update() recompute |
| ESC_ACTION_ORDER | Action steps strictly increasing order | validation pre-insert |
| PRIORITY_LEVEL_RULE | priorityLevel derived only | scoreFeature() logic |
| POLICY_THRESHOLD_LINK | thresholds metricRef resolvable | attachPolicy() validation |
| IMMUTABLE_ARCHIVE | Archived KPI cannot revert | archive() guard |

## 7. Error Model (Expanded)
| Code | Meaning | Recoverable | Typical Source |
|------|---------|------------|----------------|
| ERR_KPI_DUPLICATE | KPI already exists | yes | register |
| ERR_KPI_UNKNOWN | KPI not found | yes | update/evaluate/archive |
| ERR_POLICY_UNKNOWN | Policy missing | yes | attach/list/evaluate |
| ERR_ESC_NOT_FOUND | Escalation path missing | yes | resolve/trigger |
| ERR_INVALID_THRESHOLD | Comparator/value invalid | yes | attachPolicy |
| ERR_PRIORITY_INPUT | Invalid scoring integers | yes | scoreFeature |
| ERR_STATUS_TRANSITION | Illegal KPI status transition | yes | update/archive |
| ERR_ARCHIVE_RATIONALE_REQUIRED | Missing rationale on archive | yes | archive |

## 8. Idempotency & Determinism Summary
| Operation | Idempotent? | Notes |
|-----------|------------|-------|
| KPI register | No | Duplicate rejected |
| KPI update | Yes (same patch) | Re-applies without side-effects |
| evaluate KPI | Yes | Pure function w.r.t inputs |
| archive KPI | No | One-way state change |
| attachPolicy | Yes (same policy payload) | Returns stored entity |
| resolveEscalation | Context-dependent | May dispatch actions anew |
| trigger escalation | No | Generates new receipt each call |
| scoreFeature | Yes | Deterministic mapping |

## 9. Test Mapping Matrix
| Contract Method | Test Types | Key Assertions |
|-----------------|-----------|----------------|
| register | contract, negative | duplicate rejection; status set logic |
| update | contract | partial patch; recompute exposure |
| evaluate | unit | breach detection; consecutive breach logic stub |
| archive | contract, negative | rationale required; status final |
| attachPolicy | contract | thresholds resolved; idempotent attach |
| evaluatePolicies | unit | breach aggregation count |
| resolveEscalation | scenario | actions dispatched count |
| trigger | unit | unique receipt id per call |
| scoreFeature | unit | deterministic vectors; tie-break weights |
| recalcAll | integration-lite | consistency after weight change (future) |

## 10. Open Questions
| ID | Question | Status |
|----|----------|--------|
| Q1 | Multi-tenant segregation at contract layer needed? | pending |
| Q2 | Batch scheduling responsibility? | pending |

## 11. Observability (Planned Hooks)
| Event | Payload Fields | Purpose |
|-------|---------------|---------|
| kpi.registered | kpiId,status | Audit & analytics |
| kpi.evaluated | kpiId,status,breachCount | Monitoring dashboards |
| kpi.archived | kpiId,rationale | Lifecycle trace |
| policy.attached | policyId,thresholdsCount | Governance audit |
| escalation.triggered | pathId,source | Incident metrics |
| priority.scored | featureId,priorityLevel | Product ops analytics |

## 12. Readiness Checklist
- Interfaces cohesive ✅
- Pre/Post conditions documented ✅
- Error codes expanded ✅
- Idempotency clarified ✅
- Test mapping provided ✅
- Observability events outlined ✅

Phase 1 Contracts COMPLETE (Enhanced v2).
