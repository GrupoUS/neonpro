# Feature Specification: Unified PRD Index, KPI Normalization, AI & Compliance Governance

**Feature Branch**: `001-unified-prd-index`\
**Created**: 2025-09-09\
**Status**: Enhanced v3 (HIPAA/LGPD Compliance Integration)\
**Input**: User description: "Unified PRD Index, KPI Normalization, AI & Compliance Governance"

## Execution Flow (main)

```
1. Parse user description from Input
2. Extract key concepts: unify fragmented PRD docs; normalize KPI targets; add AI governance + compliance SLAs
3. Identify actors: Product Owner, Compliance Officer, Engineering Lead, Data/AI Steward, Stakeholder (Clinic Admin)
4. Mark ambiguities with [NEEDS CLARIFICATION: question]
5. Define user scenarios (documentation consumption & maintenance workflows)
6. Generate functional (spec) requirements (testable, outcome-focused)
7. Identify key conceptual entities (Document, KPI, Risk, Governance Policy)
8. Run review checklist; highlight open clarifications
9. Output spec ready for /plan phase
10. (Enhanced) Map requirements → KPIs → Governance controls for traceability
11. (Enhanced) Provide prioritization rationale & risk impact notes
12. (HIPAA/LGPD) Integrate compliance requirements for PHI privacy and audits
13. (HIPAA/LGPD) Add atomic testable requirements with YAML metrics
14. (HIPAA/LGPD) Ensure modularity patterns for maintainability
```

---

## ⚡ Quick Guidelines

- Consolidate canonical PRD content (WHAT & WHY only)
- Normalize strategic metrics & governance signals
- Surface compliance & AI quality thresholds early
- Maintain traceability across stories → KPIs → Requirements → Risks
- Integrate HIPAA/LGPD compliance for PHI encryption, access controls, audits via RLS/Zod

---

## User Scenarios & Testing _(mandatory)_

### Primary User Story

As a Product Owner I want a single canonical Product Requirements Document index with normalized KPIs, explicit risk & governance sections so that stakeholders trust the roadmap and engineering can plan without ambiguity or contradictory targets.

### Supporting Scenarios

1. Governance Update: Compliance Officer updates a retention SLA table; the index automatically references updated annex (no duplication).
2. KPI Revision: Data Steward adjusts baseline no-show rate; all phased targets in the KPI table remain consistent and version increment is logged.
3. Risk Review: Engineering Lead reviews risk matrix monthly and updates mitigation status; changes are appended to change log.
4. AI Policy Addition: AI Steward adds hallucination rate threshold + fallback decision matrix; Success Metrics section links new governance subsection.
5. Priority Alignment: Product Owner re-scores a feature after market shift; priority table recalculates total score transparently.
6. Compliance Audit: External auditor requests evidence of KPI governance; index provides single pathway to SLA, audit trail, and escalation workflow references.
7. PHI Privacy: Healthcare provider ensures PHI is encrypted and access-controlled via RLS, with audits for compliance.
8. LGPD Compliance: Brazilian clinic implements data protection for patient data, including consent and minimization.

### Acceptance Scenarios

1. Given multiple legacy PRD markdown files with overlapping content, When the unified index is produced, Then only one file contains executive summary, personas, features list, KPIs, risks, roadmap, and governance references.
2. Given conflicting no-show reduction targets across docs, When normalization is applied, Then a single KPI table presents baseline + phased targets with formulas and no contradictory percentages elsewhere.
3. Given absence of explicit data retention SLAs, When compliance table is added, Then each SLA includes scope, target, owner, and review cadence.
4. Given missing AI hallucination thresholds, When governance section is added, Then hallucination rate <5% (Phase 1) appears with monitoring method and escalation procedure.
5. Given inconsistent priority vocabularies, When unified priority model (P0–P3) is adopted, Then every feature in the index uses only that model with scoring rationale.
6. Given previous lack of change control, When version log introduced, Then each subsequent edit increments version with ISO date and summary.
7. Given a KPI baseline marked provisional, When baseline is later confirmed, Then [NEEDS CLARIFICATION] marker is removed and change log updated.
8. Given a KPI breaching threshold for two consecutive periods, When escalation workflow triggers, Then owner notification + backlog review note is recorded.
9. Given PHI data handling, When system processes ePHI, Then encryption (AES-256 at rest, TLS in transit) is enforced and access logged per HIPAA §164.312.
10. Given LGPD requirements, When handling patient data, Then consent and data minimization are ensured with audit trails.

### Edge Cases

- What happens when a new annex introduces content overlapping the index? → Index must link, not replicate (prevent duplication rule).
- How are deprecated metrics handled? → Mark archived with reason + replacement reference.
- If baseline KPI data unavailable? → [NEEDS CLARIFICATION: fallback rule for missing historical baseline].
- If a compliance SLA becomes legally stricter? → Update SLA row, increment version, trigger governance review workflow.
- If hallucination rate exceeds threshold for 3 consecutive reports? → Escalation path defined (fallback to deterministic responses + flag for model prompt review).
- If a feature priority score tie occurs? → Apply tie-breaker: higher Risk Reduction wins; if still tied, Strategic Fit.
- For PHI encryption failure? → System must log and alert for immediate remediation per HIPAA.
- For LGPD audit, what if consent is not obtained? → Block data processing and notify compliance officer.

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide a single canonical PRD index file consolidating previously fragmented content (Exec Summary, Personas, Features, KPIs, Risks, Roadmap, Governance references).
- **FR-002**: System MUST normalize no-show KPI targets into a phased table (Baseline, Phase 1, Phase 2, 12‑Month) with a documented calculation formula.
- **FR-003**: System MUST introduce a unified KPI definition table (metric name, formula, data source, owner, review cadence, target) for all strategic metrics.
- **FR-004**: System MUST include a performance & reliability budget table (LCP, AI Response Latency, Realtime Event Latency, Bundle Size, Availability) with numeric thresholds.
- **FR-005**: System MUST provide an AI governance subsection including hallucination rate threshold (<5% Phase 1), escalation triggers, fallback rules, logging requirements.
- **FR-006**: System MUST introduce a compliance SLA table (Data Export ≤15d, Right to Delete ≤30d, Consent Revocation Propagation ≤5m) with measurable targets.
- **FR-007**: System MUST adopt a unified feature prioritization model (P0–P3) with scoring (Impact, Effort, Risk Reduction, Strategic Fit) documented for each feature entry.
- **FR-008**: System MUST consolidate risk items into a quantified matrix (Probability 1–5, Impact 1–5, Exposure = P×I, Mitigation Owner, Review Cadence).
- **FR-009**: System MUST link (not duplicate) annexes for research, metrics deep dive, risk register, and data governance.
- **FR-010**: System MUST provide a change log (version, date, author, summary) at the top of index file.
- **FR-011**: System MUST mark any unresolved ambiguities with [NEEDS CLARIFICATION: question] for downstream resolution before /plan finalization.
- **FR-012**: System MUST ensure removal of outdated stack references (Next.js, Prisma, tRPC) from canonical index content.
- **FR-013**: System MUST map each user story to at least one KPI and one acceptance scenario reference ID.
- **FR-014**: System MUST maintain scope boundaries via an Out of Scope section (internationalization beyond pt-BR, native mobile apps, advanced AR, etc.).
- **FR-015**: System MUST define data governance notes (lineage placeholder, PII scrubbing policy summary, freshness expectations) in governance section.
- **FR-016**: System MUST ensure every KPI row includes a measurement methodology definition (mathematical formula + data source path).
- **FR-017**: System MUST include a traceability note: Stories → KPIs → Requirements mapping index.
- **FR-018**: System MUST capture monthly roadmap milestones with dependencies and note any divergence history.
- **FR-019**: System MUST provide acceptance criteria for prioritization scoring reproducibility (scoring rubric documented).
- **FR-020**: System MUST highlight any metric with provisional baseline using [NEEDS CLARIFICATION: baseline pending] marker.
- **FR-021**: System MUST define escalation workflow when KPI misses threshold 2 consecutive periods (owner notification + backlog review trigger).
- **FR-022**: System MUST define baseline patient no-show rate source [NEEDS CLARIFICATION: authoritative data source not specified].
- **FR-023**: System MUST define hallucination measurement methodology [NEEDS CLARIFICATION: evaluation process (human review vs automated embedding similarity) not specified].
- **FR-024**: System MUST define KPI review cadence for AI accuracy [NEEDS CLARIFICATION: weekly vs monthly].
- **FR-025**: System MUST confirm scope of performance budgets environment (Prod only vs also Staging) [NEEDS CLARIFICATION].
- **FR-026**: System MUST document tie-breaker rule for equal priority scores (Risk Reduction > Strategic Fit order) and annotate decision path.
- **FR-027**: System MUST provide governance linkage table (Requirement ID → KPI IDs → Risk IDs → Escalation Path ID) for audit traceability.
- **FR-028**: System MUST label each governance threshold with Owner + Review Cadence + Last Updated date.
- **FR-029**: System MUST include a Controlled Vocabulary section (priority labels, risk categories, status terms) enforced across index.
- **FR-030**: System MUST mark any retired KPI with Archived status + Replacement reference or reason for removal.
- **FR-031**: System MUST implement PHI encryption using AES-256 for data at rest and TLS 1.2+ for transmission per HIPAA §164.312(e)(2)(ii) and LGPD data protection requirements.
- **FR-032**: System MUST use RLS policies to control access to PHI, ensuring only authorized users can access based on roles per HIPAA §164.312(a)(1).
- **FR-033**: Integrate Zod schemas for validating PHI data integrity per HIPAA §164.312(c)(1).
- **FR-034**: Ensure LGPD compliance with consent management and data minimization for PHI handling, including audit logs for access.
- **FR-035**: Adopt modular design patterns for PRD components to ensure maintainability and scalability in healthcare system.

### PRD Metrics YAML

```yaml
metrics:
  - name: PHI Encryption Compliance
    baseline: 0%
    phase1: 100%
    phase2: 100%
    measurement: Percentage of PHI data encrypted at rest and in transit
    owner: Security Officer
    cadence: Monthly
    source: HIPAA §164.312(e)(2)(ii)
  - name: RLS Access Control
    baseline: 0%
    phase1: 100%
    phase2: 100%
    measurement: Percentage of access requests logged and authorized
    owner: Compliance Officer
    cadence: Quarterly
    source: HIPAA §164.312(a)(1)
  - name: Data Integrity with Zod
    baseline: 0%
    phase1: 100%
    phase2: 100%
    measurement: Percentage of PHI validations passing Zod schema
    owner: Engineering Lead
    cadence: Monthly
    source: HIPAA §164.312(c)(1)
  - name: LGPD Consent Compliance
    baseline: 0%
    phase1: 100%
    phase2: 100%
    measurement: Percentage of data processing with valid consent
    owner: Data Steward
    cadence: Quarterly
    source: LGPD Law 13.709/2018
```

### Key Entities

- **DocumentIndex**: version, sections, annex_links, change_log, controlled_vocabulary.
- **KPI**: name, formula, baseline, targets (phase1, phase2, long_term), owner, cadence, source, status (active|provisional|archived), escalation_path.
- **RiskItem**: description, probability, impact, exposure, mitigation, owner, review_cadence, status.
- **GovernancePolicy**: policy_type (AI, Compliance, Data), thresholds, escalation, updated_at, owner.
- **PriorityScore**: feature_id, impact, effort, risk_reduction, strategic_fit, total_score, priority_level, tie_breaker_notes.
- **EscalationPath**: trigger_condition, notification_targets, actions, time_to_response, fallback_reference.
- **PHIEntity**: type (patient data), encryption (AES-256/TLS), access (RLS), validation (Zod schema), audit (logs).
- **LGPDPolicy**: consent_required, data_minimization, audit_trail, owner.

### Traceability & Controlled Vocabulary (Added)

- Priority Levels: P0 (Critical / Blocking), P1 (High / Near-term), P2 (Medium / Planned), P3 (Low / Backlog Exploration)
- Risk Status Terms: Open, Mitigating, Accepted (Documented), Transferred, Closed
- KPI Status: Active, Provisional, Archived
- Exposure Formula: `probability * impact` (both 1–5 integers)
- Compliance Terms: HIPAA §164.312, LGPD Law 13.709/2018

### Out of Scope

- Multi-language expansion beyond pt-BR in Phase 1
- Native mobile applications (only responsive web)
- Advanced AI autonomous decisioning beyond defined thresholds
- Predictive risk modeling (future phase)
- Third-party data marketplace integrations

### Governance Linkage (Conceptual Example)

| Requirement | KPI(s) | Risk(s) | Escalation Path | Notes |
|-------------|--------|---------|-----------------|-------|
| FR-005 | KPI-AI-HALLUCINATION | RISK-LLM-DRIFT | ESC-001 | Pending methodology (FR-023) |
| FR-006 | KPI-COMPLIANCE-SLA | RISK-DATA-RETENTION | ESC-002 | SLA thresholds stable |
| FR-021 | All threshold KPIs | RISK-PERF-DEGRADATION | ESC-003 | Cross-metric escalation |
| FR-031 | PHI Encryption Compliance | RISK-PHI-EXPOSURE | ESC-004 | HIPAA encryption enforcement |
| FR-032 | RLS Access Control | RISK-ACCESS-VIOLATION | ESC-005 | RLS audit logs |
| FR-033 | Data Integrity with Zod | RISK-DATA-INTEGRITY | ESC-006 | Zod validation failures |
| FR-034 | LGPD Consent Compliance | RISK-LGPD-VIOLATION | ESC-007 | Consent escalation |

---

## Related Atomic Subtasks

1. Add HIPAA PHI section to coding-standards.md with encryption guidelines (AES-256, TLS).
2. Map RLS to HIPAA access controls in architecture.md.
3. Add Zod validation patterns for PHI in coding-standards.md.
4. Create YAML template for PRD metrics in templates/ with HIPAA/LGPD metrics.
5. Update governance section in docs/rules/ with LGPD consent management.
6. Integrate modularity patterns in frontend-architecture.md for PRD components.
7. Add edge cases for HIPAA compliance in testing docs.
8. Define fallback for non-compliance in error-handling docs.
9. Document audit logs for PHI in supabase-best-practices.md.
10. Review and update all docs for consistency with HIPAA/LGPD.

---

## Review & Acceptance Checklist

### Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain (before planning exit)
- [x] Requirements are testable and unambiguous (except flagged)
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified
- [x] HIPAA/LGPD integrated with new FRs and YAML metrics

---

## Execution Status

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed (pending clarifications)
- [x] Traceability vocabulary added
- [x] Governance linkage table added
- [x] HIPAA/LGPD FRs and YAML metrics added
- [x] Related subtasks listed

---

## Change Log

| Version | Date | Author | Summary |
|---------|------|--------|---------|
| 0.1.0 | 2025-09-09 | system | Initial generation |
| 0.2.0 | 2025-09-09 | system | Enhanced v2: Added governance linkage, expanded requirements (FR-026–FR-030), controlled vocabulary, traceability, clarification markers retained |
| 0.3.0 | 2025-09-10 | system | Enhanced v3: Integrated HIPAA §164.312 PHI encryption/RLS/Zod, LGPD equivalents, YAML metrics for compliance, modularity patterns, 10 atomic subtasks, updated entities and linkage table.
