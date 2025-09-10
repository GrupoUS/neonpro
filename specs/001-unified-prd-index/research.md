# Phase 0 Research: Unified PRD Index, KPI Normalization, AI & Compliance Governance (Enhanced v2)

## 0. Executive Summary
All clarification items reduced to one external data dependency (authoritative no‑show baseline). Governance primitives (KPI lifecycle, hallucination evaluation, escalation triggers) are defined with measurable thresholds. Compliance (HIPAA §164.312, LGPD consent & minimization) integrated at requirement level. No architectural expansion required (library-only design retained). Ready for Phase 1 implementation design; risk posture acceptable (no Critical exposures).

## 1. Inputs Reviewed
- Feature Spec (`spec.md` v0.3.0 Enhanced)
- Constitution (`/memory/constitution.md`)
- Coding Standards (`/docs/rules/coding-standards.md`)
- Supabase best-practices (encryption & RLS references)

## 2. Outstanding Clarifications (From Spec)
| ID | Description | Research Outcome | Status | Action |
|----|-------------|------------------|--------|--------|
| FR-022 | Baseline patient no-show rate authoritative source | Clinic pilot dataset pending integration; treat KPI baseline provisional; add aging rule escalation after 60 days. | OPEN | Phase 2 data ingestion task |
| FR-023 | Hallucination measurement methodology | Weekly 50-sample hybrid (human + semantic sim ≥0.85); escalate if failure >5% two consecutive weeks. | RESOLVED (Proposal) | Stakeholder sign-off |
| FR-024 | KPI review cadence AI accuracy | Weekly operational review; monthly governance summary roll-up. | RESOLVED (Proposal) | Governance approval |
| FR-025 | Environment scope performance budgets | Production authoritative; Staging ±10% tolerance for early detection. | RESOLVED (Proposal) | Document enforcement script |

## 3. Decision Log (Chronological)
| # | Domain | Decision | Alternatives | Criteria | Rationale | Revisit Trigger |
|---|--------|----------|-------------|----------|-----------|-----------------|
| 1 | KPI Lifecycle | Add status (active/provisional/archived) + aging rule | No lifecycle flag | Auditability, drift control | Transparent governance & sunset path | Metric count >150 or workflow overhead |
| 2 | Hallucination Eval | Hybrid 50 sample weekly + similarity | Full manual; full automation | Cost, accuracy balance | Mitigates false negatives & labor cost | Failure variance >2% QoQ |
| 3 | Escalation Trigger | 2 consecutive breaches | Single breach; 3+ breaches | Noise vs latency | Prevents churn yet responsive | False negative incidents >2/quarter |
| 4 | Priority Tie-Break | RiskReduction > StrategicFit > DependencyUnblock | Add ROI dimension | Simplicity, risk-first | Healthcare risk mitigation priority | Unused tie-break >6 months |
| 5 | Performance Scope | Prod strict, Staging near-parity | Prod-only | Early detection, cost | Balanced signal fidelity | Staging false positives >20% |
| 6 | Sample Size | 50 responses baseline | 25; 100 | Detection sensitivity | 50 adequate for initial power | Weekly variance >2% => scale 100 |
| 7 | Data Persistence (Phase 1) | In-memory only | Early DB schema | YAGNI, speed | Avoid premature schema locks | Need historical trending earlier |
| 8 | Compliance KPIs | Dedicated YAML metrics block | Inline narrative only | Audit precision | Machine-readable governance | Regulatory scope change |

## 4. Alternatives Scoring (Illustrative)
| Option | Dimension | Score (1-5) | Notes |
|--------|-----------|------------|-------|
| Hybrid hallucination eval | Accuracy | 4 | Slight manual cost |
| Hybrid hallucination eval | Cost | 4 | Limited reviewer time |
| Hybrid hallucination eval | Implementation | 5 | Simple sampling script |
| Full automation | Accuracy | 2 | Undetected semantic errors |
| Full manual | Cost | 1 | Reviewer fatigue |

## 5. Expanded Risk Register
| ID | Risk | Impact | Prob | Exposure (IxP) | Category | Mitigation | Owner | Status |
|----|------|--------|------|----------------|----------|-----------|-------|--------|
| R1 | Provisional KPI stagnates | Medium | 3 | 9 | Governance | Aging rule (60d) + escalation | Product Ops | Open |
| R2 | Undetected hallucination drift | High | 2 | 8 | AI Quality | Weekly sampling + threshold | AI Steward | Open |
| R3 | Escalation fatigue | Medium | 2 | 6 | Process | Require incident template & closure criteria | Eng Lead | Open |
| R4 | Ambiguous ownership | High | 3 | 12 | Org | Mandatory owner column + quarterly audit | Product Ops | Open |
| R5 | Compliance metric mis-tracked | High | 2 | 8 | Compliance | Machine-readable YAML + validation task | Compliance Officer | Open |
| R6 | Tie-break disputes | Low | 2 | 4 | Prioritization | Publish deterministic rubric | Product Owner | Open |
| R7 | Overfitting KPI set | Medium | 2 | 6 | Strategy | Cap initial KPIs <40 | Product Owner | Open |

## 6. Validation Framework Anchors
| Area | Primary Check | Tool/Future Test |
|------|---------------|------------------|
| KPI Table Integrity | Unique IDs + status correctness | Contract test: register + duplicate rejection |
| Hallucination Sampling | Sample size & breach detection | Unit test: evaluation function thresholds |
| Escalation Path | Trigger after 2 breaches | Scenario test with synthetic sequence |
| Priority Scoring | Correct total & level mapping | Deterministic vector tests |
| Aging Rule | 61-day provisional triggers escalation flag | Time-travel unit test |
| YAML Metrics | Schema parse & required fields | Zod schema validation test |

## 7. Constitutional Alignment (Detailed)
| Principle | Mechanism | Evidence (Artifact Section) |
|----------|-----------|-----------------------------|
| KISS | Avoid DB, focus in-memory | Decision #7 |
| YAGNI | Defer batching infra | Phase 1 scope note |
| TDD | Explicit test anchors table | Section 6 |
| Compliance by Design | YAML metrics + RLS mention | Spec FR-031–034 |
| Observability Seed | Escalation + breach logs planned | Quickstart future extension |
| Risk Transparency | Quantified exposure table | Section 5 |

## 8. Open Questions & Resolution Path
| ID | Question | Current Answer | Resolution Path |
|----|----------|---------------|-----------------|
| Q-Baseline | Who owns authoritative no-show baseline? | Pending pilot ingest | Data ingestion task (Phase 2) |
| Q-MultiTenant | Need tenant key Phase 1? | Not Phase 1 | Reassess at persistence intro |
| Q-BatchEval | Schedule service ownership? | Defer | Introduce if >25 KPIs or manual load high |

## 9. Exit Criteria Reconfirmation
- All methodological unknowns answered ✔
- Remaining: single data ingestion dependency ✔
- Risk exposure none Critical (>15) ✔
- Test anchors enumerated ✔

## 10. Next Actions (Hand-off to Design)
1. Embed validation constraints into `data-model.md` (probability 1–5, etc.)
2. Add pre/post conditions to contracts
3. Expand quickstart with acceptance walkthrough & troubleshooting
4. Update plan.md with acceptance matrix + observability outline

Phase 0 Research COMPLETE (Enhanced v2).
