# Unified PRD Index Quickstart (Phase 1 – Enhanced v2)

Audience: Internal engineers & product ops.
Goal: Stand up governance layer primitives quickly in a dev environment.
Time to First Validation: ~10 minutes.

## 1. Preconditions
- Repo cloned & dependencies installed
- Supabase project (or local) available (no schema changes required Phase 1)
- Node/Bun & PNPM installed
- Vitest configured (root) & path to `@neonpro/core-services`

## 2. Core Concepts Recap
| Concept | Why It Matters |
|---------|----------------|
| KPI | Measures operational/quality performance |
| Governance Policy | Defines thresholds & escalation linkage |
| Escalation Path | Sequenced response actions |
| Risk Item | Captures probabilistic threat & mitigation |
| Priority Score | Normalizes feature decision signals |
| Threshold Breach | Triggers review/escalation logic |

## 3. Minimal Implementation Order
1. Define KPI registry (static JSON or in-memory map)
2. Implement scoring function for PriorityScore
3. Implement risk exposure calculator
4. Implement threshold evaluation & breach aggregation
5. Implement escalation dispatcher (stub notifications)
6. Add governance policy evaluation loop (breach summary)

## 4. Example (Pseudo TypeScript)
```ts
const kpis: Record<string,KPI> = {
  'KPI-NO_SHOW_RATE': {
    id: 'KPI-NO_SHOW_RATE', name: 'No-show Rate', formula: '(missed / booked)',
    targets: { phase1: 0.12, phase2: 0.08, long_term: 0.05 }, owner: 'ops', cadence: 'weekly', source: 'analytics.pipeline', status: 'active'
  }
}

function scorePriority(input: Omit<PriorityScore,'totalScore'|'priorityLevel'>): PriorityScore {
  const weights = { impact: 3, effort: -1, riskReduction: 2, strategicFit: 2 }
  const total = input.impact*weights.impact + input.effort*weights.effort + input.riskReduction*weights.riskReduction + input.strategicFit*weights.strategicFit
  const level = total >= 20 ? 'P0' : total >= 14 ? 'P1' : total >= 8 ? 'P2' : 'P3'
  return { ...input, totalScore: total, priorityLevel: level }
}
```

## 5. Threshold Evaluation Sketch
```ts
function evaluateKPI(kpiId: string, value: number): KPIEvaluationResult {
  const kpi = kpis[kpiId]; if(!kpi) throw new Error('KPI not found')
  const breaches: ThresholdBreach[] = []
  const thresholds: Threshold[] = [{ metricRef: kpiId, comparator: '>', value: kpi.targets.phase1 }]
  thresholds.forEach(t => {
    const breach = value > t.value
    if(breach) breaches.push({ threshold: t, actual: value, consecutiveBreaches: 1 })
  })
  return { kpiId, breaches, status: breaches.length ? 'breached' : 'ok', evaluatedAt: new Date().toISOString().slice(0,10) }
}
```

## 6. Escalation Stub
```ts
function dispatchEscalation(pathId: string, meta: Record<string,unknown>) {
  console.log('ESCALATION', pathId, meta)
}
```

## 7. Suggested Folder Pattern (Future)
```
packages/core-services/src/governance/
  kpi-service.ts
  prioritization-service.ts
  risk-service.ts
  escalation-service.ts
  policy-service.ts
```

## 8. Acceptance Walkthrough
| Step | Action | Expected Result | Maps To Requirement |
|------|--------|-----------------|---------------------|
| 1 | Create KPI registry with one KPI | `list()` returns KPI | FR-003 |
| 2 | Evaluate value > phase1 target | status 'breached' & breach length 1 | FR-005/FR-021 |
| 3 | Re-evaluate second consecutive breach simulation | escalate path considered | FR-021 |
| 4 | Score feature with inputs (5,2,4,3) | priorityLevel 'P0' deterministic | FR-007 |
| 5 | Archive KPI with rationale | status 'archived' | FR-030 |
| 6 | Attach policy referencing KPI | policy stored | FR-005 |
| 7 | Trigger escalation manually | receipt id logged | FR-021 |

## 9. Sample Test Skeletons
```ts
// contract/kpi.register.test.ts
it('rejects duplicate KPI id', () => {/* ... */})
it('sets provisionalSince when status=provisional', () => {/* ... */})

// unit/priority.scoring.test.ts
it('maps vector to P0', () => {/* ... */})

// scenario/escalation.breach-sequence.test.ts
it('escalates after two breaches', () => {/* simulate */})
```

## 10. Validation Checklist
| Check | Tool/Method | Artifact |
|-------|-------------|----------|
| Type cohesion | ts --noEmit | contracts.md |
| Breach logic | Vitest unit | evaluateKPI test |
| Priority scoring | Deterministic vectors | priority.scoring.test.ts |
| Escalation dispatch | Console spy | escalation.breach-sequence.test.ts |
| Policy threshold link | Contract test | policy.attach.test.ts |

## 11. Troubleshooting
| Symptom | Likely Cause | Resolution |
|---------|--------------|-----------|
| Duplicate KPI error | Reused id | Ensure unique ID pattern ^KPI- |
| Escalation not firing | Only one breach | Simulate second evaluation |
| Priority mis-level | Weight drift | Recalculate vectors / inspect weights |
| Policy attach failure | Unknown metricRef | Register KPI first |

## 12. Observability (Planned Events)
Emit structured logs (JSON) with fields: `event`, `timestamp`, domain-specific payload. Future integration: adapter to metrics backend.
| Event | Fields |
|-------|--------|
| kpi.evaluated | kpiId, status, breachCount |
| escalation.triggered | pathId, source |
| priority.scored | featureId, priorityLevel |

## 13. Extension Ideas (Later Phases)
- Persist evaluations with time windows
- Multi-tenant partition keys
- Notification adapters (email, Slack, PagerDuty)
- KPI drift analytics (variance tracking)
- Automated hallucination sampling cron

## 14. Fast Local Commands
```bash
# Run all governance tests (after tasks generation)
pnpm --filter @neonpro/core-services test -- governance

# Type check
pnpm --filter @neonpro/core-services typecheck
```

Quickstart COMPLETE (Enhanced v2).
