# Phase 1 Data Model: Unified PRD Index & Governance (Enhanced v2)

## Overview
Logical (implementation-agnostic) conceptual model supporting governance, KPI normalization, risk tracking, and escalation workflows.

## 1. Entity Definitions

### DocumentIndex
| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| id | Identifier | singleton | Logical singleton (implicit) |
| version | SemVer string | semver valid | Current index version |
| sections | List<SectionRef> | ordered | Ordered enabled sections |
| annex_links | List<AnnexLink> | unique targets | External annex references |
| change_log | List<ChangeEntry> | append-only | Version history |
| controlled_vocabulary | VocabularySet | required | Standardized term registry |

### KPI
| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| id | String | pattern ^KPI-[A-Z0-9_]+$ unique | Stable metric identifier |
| name | String | length 3..80 | Human-readable name |
| formula | String (markdown) | non-empty | Calculation definition |
| baseline | Number? | >=0 optional | Baseline value (nullable until confirmed) |
| targets.phase1 | Number | >=0 | Near-term target |
| targets.phase2 | Number | >=0 | Mid-term target |
| targets.long_term | Number | >=0 | Strategic target |
| owner | String | role listed | Role or named owner |
| cadence | String | enum(weekly,monthly,quarterly) | Review cadence |
| source | String | path-like | Data acquisition definition/path |
| status | Enum | active|provisional|archived | Lifecycle status |
| escalation_path_id | String? | exists if set | Linked escalation path |
| last_reviewed_at | Date? | ISO | Last governance review date |
| provisional_since | Date? | ISO when provisional | Timestamp when marked provisional |

### TargetSet
| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| phase1 | Number | >=0 | Near-term target |
| phase2 | Number | >=0 | Mid-term target |
| long_term | Number | >=0 | Strategic horizon target |

### RiskItem
| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| id | String | pattern ^RISK-[A-Z0-9_]+$ unique | Risk identifier |
| description | String | 5..200 chars | Risk summary |
| probability | Int(1-5) | integer 1..5 | Likelihood scale |
| impact | Int(1-5) | integer 1..5 | Impact scale |
| exposure | Int | derived probability*impact | Computed exposure |
| mitigation | String | optional <=300 | Mitigation narrative |
| owner | String | role listed | Accountable role/person |
| review_cadence | String | enum(monthly,quarterly) | Review frequency |
| status | Enum | open|mitigating|accepted|transferred|closed | Lifecycle |
| last_reviewed_at | Date? | ISO | Last review timestamp |

### GovernancePolicy
| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| id | String | pattern ^GOV-[A-Z0-9_]+$ unique | Policy ID |
| policy_type | Enum | ai|compliance|data|performance | Dimension |
| thresholds | List<Threshold> | >=1 | Threshold list |
| escalation_path_id | String? | exists if set | Default escalation linkage |
| updated_at | Date | ISO | Last update timestamp |
| owner | String | role listed | Responsible role |

### Threshold
| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| metric_ref | String | must reference KPI or qualitative metric | KPI or qualitative metric reference |
| comparator | Enum | <,<=,>,>=,== | Comparison operator |
| value | Number | numeric finite | Threshold numeric value |
| phase | String? | optional | Optional phase tag |

### EscalationPath
| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| id | String | pattern ^ESC-[0-9]{3}$ unique | ESC-### identifier |
| trigger_condition | String | expression length <200 | Condition expression |
| actions | List<ActionStep> | >=1 ordered | Ordered steps |
| notification_targets | List<String> | non-empty | Roles or distribution groups |
| time_to_response | String | e.g. <24h | Expected initial response window |
| fallback_reference | String? | optional | Fallback mode or mitigation doc ID |
| aging_rule | String? | optional | Automatic escalation aging behavior |

### ActionStep
| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| order | Int | strictly increasing | Sequence number |
| description | String | 3..180 chars | Step detail |
| expected_outcome | String | 3..180 chars | Verification of completion |

### PriorityScore
| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| feature_id | String | pattern ^FEAT-[A-Z0-9_]+$ | Feature reference |
| impact | Int(1-5) | 1..5 | Impact score |
| effort | Int(1-5) | 1..5 | Effort score |
| risk_reduction | Int(1-5) | 1..5 | Risk reduction score |
| strategic_fit | Int(1-5) | 1..5 | Strategic alignment |
| total_score | Int | derived | Derived weighted value |
| priority_level | Enum | P0|P1|P2|P3 | Assigned priority |
| tie_breaker_notes | String? | optional | Explanation of tie resolution |

### ChangeEntry
| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| version | SemVer | semver valid | Version identifier |
| date | Date | ISO | ISO date |
| author | String | non-empty | Author identifier |
| summary | String | 3..160 chars | Human summary |

### VocabularySet
| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| priority_levels | List<String> | subset {P0..P3} | Allowed priority tokens |
| risk_status_terms | List<String> | subset statuses | Allowed risk status tokens |
| kpi_status | List<String> | subset statuses | Allowed KPI lifecycle tokens |
| glossary | Map<String,String> | keys length 2..40 | Term → definition |

## 2. Relationships (Conceptual)
- KPI -* GovernancePolicy (threshold references)
- KPI -> EscalationPath (optional)
- GovernancePolicy -> EscalationPath (default escalation)
- PriorityScore -> Feature (feature_id external reference)
- RiskItem independent; linked via governance linkage table in spec layer

## 3. Derived / Business Rules
| Rule | Description | Validation Strategy |
|------|-------------|--------------------|
| EXPOSURE_CALC | exposure = probability * impact | Recompute on update; assert equality |
| PROVISIONAL_AGING | provisional KPI > 60 days triggers escalation ESC-KPI-AGING | Time-travel test harness |
| TIE_BREAK | total_score tie resolve order | Deterministic test vectors |
| DEPRECATE_KPI | Archived requires replacement/rationale | Contract test: archive() missing rationale => error |
| HALLUCINATION_WINDOW | Two consecutive weekly breaches escalate | Sequence simulation test |

## 4. State Transitions
### KPI.status
active → provisional (only if baseline becomes uncertain) (rare)
provisional → active (baseline confirmed)
active → archived (replacement or deprecation rationale required)
provisional → archived (if abandoned)

### RiskItem.status
open → mitigating → (accepted | transferred | closed)
accepted → (mitigating | closed)
mitigating → closed

Invalid backward transitions cause errors.

## 5. Validation Constraints Summary
| Entity | Key Constraints |
|--------|-----------------|
| KPI | ID pattern, non-negative targets, status lifecycle, ownership required |
| RiskItem | Probability/Impact 1..5, exposure consistency |
| EscalationPath | ID regex, ordered actions, at least one action |
| GovernancePolicy | ≥1 threshold referencing existing KPI |
| PriorityScore | Derived total & priority level immutable externally |

## 6. Performance & Index Considerations (Future Persistence)
| Access Pattern | Likely Index |
|----------------|--------------|
| Fetch KPI by id | PK(id) |
| List KPIs by status | btree(status) |
| Fetch risks by status | btree(status) |
| Escalation path lookup | PK(id) |
| Policy thresholds evaluation | GIN(thresholds.metric_ref) (optional) |

Phase 1 memory-only: no persistence layer yet; these inform future schema.

## 7. Extensibility Hooks
| Area | Hook | Purpose |
|------|------|---------|
| KPI Evaluation | onKPIBreach(kpiId, breach) | Notification / metrics export |
| Escalation | onEscalation(pathId, context) | Adapter for messaging/incident tools |
| Priority Scoring | scoringWeights provider | Runtime weight tuning (A/B) |
| Policy Evaluation | thresholdComparator registry | Custom comparator injection |

## 8. Open Modeling Considerations
- MetricVersion entity deferred until historical analytics required
- Multi-tenant partition key omitted (introduce if external clients >1)
- Batch evaluation scheduler omitted (introduce if KPI count >25)

Phase 1 Data Model COMPLETE (Enhanced v2).
