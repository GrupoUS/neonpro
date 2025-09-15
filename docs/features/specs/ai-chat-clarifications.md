# AI Chat Clarifications & Decisions Log

Date: 2025-09-15
Owner: Product & Compliance Council
Status: Active
Scope: Phase 1 (Contextual Q&A) + Enhanced Multi-Model & CRUD Expansion

## Phase 1 Decisions
| Topic | Decision | Rationale | KPI Impact |
|-------|----------|-----------|------------|
| Fairness / Rate Limits | Soft: >10 queries/5m or >30/hour triggers polite limit notice | Prevent abuse & ensure capacity | Latency stability, SRE load |
| Audit Fields | eventId, userId, clinicId, timestampUTC, actionType, consentStatus, queryType, redactionApplied, outcome, latencyMs, sessionId | Compliance traceability & forensic completeness | Audit integrity >=99.9% |
| Audit Retention | 5 years (configurable, min 2) | Align with healthcare retention norms | Compliance adherence |
| PII Redaction List | CPF, CNPJ, emails, phone numbers, full DOB, detailed addresses (beyond city/state), health insurance numbers | Minimize accidental leakage | Redaction accuracy 100% |
| Data Freshness Threshold | Stale notice if data >5 minutes old | Transparency, trust | User trust NPS |
| Roles | ADMIN, CLINICAL_STAFF, FINANCE_STAFF, SUPPORT_READONLY (read-only finance) | Simple initial taxonomy enabling least privilege | Authorization clarity |
| Session Lifetime | 60 minutes inactivity resets context | Memory/resource control | Session continuity >=99% |
| Multi-Intent Policy | Always request refinement (no auto-split) | Avoid unintended actions | Clarification rate <12% |
| Supported Locales | pt-BR, en-US | Core markets | Localization coverage |
| Mock Mode Scope | Deterministic outputs: clinical summary, financial balance, overdue summary, consent refusal, ambiguous query | Stable tests & CI determinism | Mock consistency 100% |

## Enhanced Feature Decisions
| Topic | Decision | Rationale | KPI Impact |
|-------|----------|-----------|------------|
| Model Catalog Labels | Free: MODEL_BASIC; Premium: MODEL_ADV_REASON, MODEL_SPEED, MODEL_ANALYTICS | Clear business differentiation without vendor lock naming | Upgrade CTR |
| Free Quota | 40 read queries/day; 0 modifying ops; approaching at 80% | Encourage upgrade while usable | Quota exhaustion 20–35% |
| CRUD Verb Whitelist | create, read, update, delete (soft-delete for clients & appointments) | Consistent semantics & safe deletes | Data integrity |
| Audit Retention | Same 5 years (min 2) | Consistency | Compliance consistency |
| Abuse Definition | >12 queries in 60s OR >5 modifying ops in 10m → 15m cooldown | Protect system capacity | Cooldown fairness |
| Time Zone Policy | Use clinic-configured TZ else UTC; prompt when ambiguous | Prevent scheduling errors | Reduction in reschedule errors |
| Historical Window | Up to 12 months analytics | Balanced insight vs performance | Analytics relevance |
| Recommendation Scope | Payment follow-up, scheduling optimization, client engagement | Focus, avoids overreach | Recommendation acceptance |
| Complexity Threshold | Confirmation required if >5 entity modifications or >3 domains | Safety against runaway | Error avoidance |
| Cancellation UX | Show 'Cancel' if processing >2s | User control & perceived responsiveness | Abandonment reduction |
| Domain Onboarding | Descriptor (name, operations, sensitivity) + compliance review (<=2 business days) | Structured scalability | Domain SLA adherence |
| Localization Languages | Add es-ES in Phase 2 (pt-BR, en-US baseline) | Market expansion | Localization accuracy |
| Metrics Taxonomy | queries.total/read/modify, upgrades.prompt_shown/clicked, failovers.count, refusals.consent/permissions, latency.p95, usage.approaching_limit | Unified analytics | Conversion & reliability |
| Failover Notice Copy | "Your answer was completed using an alternate processing tier." | Neutral, non-technical | Trust & clarity |
| Recommendation Acceptance Target | >=25% by month 3 | Validate usefulness | Adoption |

## Open Items (Future Review)
- Additional locales beyond es-ES (evaluate after adoption metrics)
- Potential tightening of abuse thresholds if infrastructure cost spikes

## Change Management Process
1. Proposed change added to this log (Pending) with date
2. Review by Product + Compliance + Engineering leads
3. Approved change applied to specs and implementation backlog updated
4. Version tag incremented (v1.x -> v1.(x+1))

Version: v1.0
