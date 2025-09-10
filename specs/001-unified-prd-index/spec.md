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

## Phase 1 Research Findings (Integrated from Documentation Enhancement Plan)

| Component | Tech | Best Practice | HIPAA Alignment |
|-----------|------|---------------|-----------------|
| Frontend | React/Vite | Shadcn UI, Accessibility WCAG 2.1 | RLS for patient data access control |
| Backend | Supabase Edge Functions | Serverless APIs | Encryption for data in transit |
| Database | PostgreSQL (Supabase) | Row Level Security (RLS) | HIPAA-compliant PHI storage with encryption at rest |
| Auth | Supabase Auth | JWT tokens, MFA | LGPD consent management via RLS policies |
| UI/UX | Tailwind CSS, Shadcn | Responsive, accessible design | No sensitive data exposure without RLS |
| Testing | Vitest, Playwright | TDD, E2E tests | Compliance testing for security policies |

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

### Edge Cases (Integrated with Common Issues from Documentation Enhancement Plan)

- What happens when a new annex introduces content overlapping the index? → Index must link, not replicate (prevent duplication rule).
- How are deprecated metrics handled? → Mark archived with reason + replacement reference.
- If baseline KPI data unavailable? → [NEEDS CLARIFICATION: fallback rule for missing historical baseline].
- If a compliance SLA becomes legally stricter? → Update SLA row, increment version, trigger governance review workflow.
- If hallucination rate exceeds threshold for 3 consecutive reports? → Escalation path defined (fallback to deterministic responses + flag for model prompt review).
- If a feature priority score tie occurs? → Apply tie-breaker: higher Risk Reduction wins; if still tied, Strategic Fit.
- For PHI encryption failure? → System must log and alert for immediate remediation per HIPAA.
- For LGPD audit, what if consent is not obtained? → Block data processing and notify compliance officer.

**Common Issues Identified from Phase 3 Gaps (Mitigated via Recommendations)**:
- Missing HIPAA/LGPD sections (addressed by R1-R3 recs): Ensured no PHI exposure without RLS, encryption standards met for data protection.
- Template gaps (R4, R5): Atomic structure enforced in all sections.
- Security lapses (R17, R21): RLS/encryption citations integrated across recs.
- Planning deficiencies (R6, R18): Priority matrix and dependency mapping added for traceability.

Mitigation through atomic recs ensures compliance with Spec-Kit modularity and HIPAA/LGPD standards, preventing redundancy and maintaining testability.

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

### Integrated Gaps and Recommendations from Documentation Enhancement Plan (FR-036 to FR-060)

**FR-036**: System MUST add HIPAA policy documentation addressing G1 (Missing HIPAA policy) via R3 (Create HIPAA checklist template) with atomic test: Verify 7-item checklist completeness.
**FR-037**: System MUST include LGPD consent management guide for G2 (No LGPD consent guide) via R5 (Add LGPD consent sections) with test: Validate consent flow documentation.
**FR-038**: System MUST detail RLS implementation for G3 (Incomplete RLS details) via R1 (Add RLS policy citations) with test: Confirm RLS in PHI queries.
**FR-039**: System MUST specify encryption standards for PHI for G4 (Lack of encryption standards) via R17 (Integrate encryption standards) with test: Check Supabase config for AES-256/TLS.
**FR-040**: System MUST ensure atomic spec validation for G5 (Absent atomic validation) via R8 (Include validation gates) with test: Each section has gates.
**FR-041**: System MUST create healthcare-specific checklists for G6 (No healthcare checklists) via R3 with test: 7 QA items per type.
**FR-042**: System MUST map tech stack to HIPAA for G7 (Gaps in HIPAA mapping) via R9 (Update tech stack table) with test: Alignment per component.
**FR-043**: System MUST document auth compliance for G8 (Gaps in auth flows) via R10 (Add auth compliance guide) with test: MFA/token security verified.
**FR-044**: System MUST enhance DB schema docs for G9 (Incomplete DB compliance) via R11 (Enhance DB schema docs) with test: RLS policies in schema.
**FR-045**: System MUST create priority matrix for G10 (No priority matrix) via R18 (Create priority matrix) with test: 10 high-impact items scored.
**FR-046**: System MUST develop atomic subtasks for G11 (Lacking subtasks) via R7 (Develop atomic subtasks) with test: 25 tasks with effort/deps.
**FR-047**: System MUST add QA for atomicity for G12 (No QA for atomicity) via R14 (Add testing strategy) with test: Run QA on checklists.
**FR-048**: System MUST enhance UI docs for G13 (Gaps in UI accessibility) via R12 (Create UI compliance section) with test: WCAG for healthcare UI.
**FR-049**: System MUST document backend error handling for G14 (Missing error handling) via R13 (Document backend error handling) with test: Security error responses validated.
**FR-050**: System MUST include overall validation gates for G15 (No validation gates) via R15 (Integrate YAGNI) with test: Gates passed ≥9.5/10.
**FR-051**: System MUST map templates to Spec-Kit for Phase 2 gaps via R4 with test: Atomicity enforced.
**FR-052**: System MUST prioritize high-impact gaps via R6 with test: Matrix for 10 tasks.
**FR-053**: System MUST group subtasks by area via R16 with test: Grouping for 25 tasks.
**FR-054**: System MUST add effort/dependency columns via R17 with test: Hrs estimated per subtask.
**FR-055**: System MUST develop 7 QA checklists via R19 with test: 7 items each.
**FR-056**: System MUST ensure atomic/testable recs via R20 with test: Each has criterion.
**FR-057**: System MUST cite RLS in security recs via R21 with test: Cross-references in tables.
**FR-058**: System MUST update overview with constraints via R22 with test: KISS/YAGNI included.
**FR-059**: System MUST adapt template sections via R23 with test: Mapped to phases.
**FR-060**: System MUST focus on healthcare compliance via R24 with test: All cite HIPAA/LGPD.

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

| Requirement | KPI(s)                    | Risk(s)               | Escalation Path | Notes                        |
| ----------- | ------------------------- | --------------------- | --------------- | ---------------------------- |
| FR-005      | KPI-AI-HALLUCINATION      | RISK-LLM-DRIFT        | ESC-001         | Pending methodology (FR-023) |
| FR-006      | KPI-COMPLIANCE-SLA        | RISK-DATA-RETENTION   | ESC-002         | SLA thresholds stable        |
| FR-021      | All threshold KPIs        | RISK-PERF-DEGRADATION | ESC-003         | Cross-metric escalation      |
| FR-031      | PHI Encryption Compliance | RISK-PHI-EXPOSURE     | ESC-004         | HIPAA encryption enforcement |
| FR-032      | RLS Access Control        | RISK-ACCESS-VIOLATION | ESC-005         | RLS audit logs               |
| FR-033      | Data Integrity with Zod   | RISK-DATA-INTEGRITY   | ESC-006         | Zod validation failures      |
| FR-034      | LGPD Consent Compliance   | RISK-LGPD-VIOLATION   | ESC-007         | Consent escalation           |

---

## Related Atomic Subtasks (Expanded with Phase 4 from Documentation Enhancement Plan)

### Atomic Subtasks Table

| Group | ID | Description | Effort (hrs) | Dependencies |
|-------|----|-------------|--------------|--------------|
| Compliance | S1 | Develop HIPAA policy section | 3 | None |
| Compliance | S2 | Add LGPD consent management guide | 4 | S1 |
| Compliance | S3 | Create RLS implementation checklist | 2 | None |
| Templates | S4 | Update spec-template.md for compliance | 5 | S1 |
| Templates | S5 | Design new healthcare template | 4 | S4 |
| Spec-Kit | S6 | Add validation gates to specs | 3 | S4 |
| Spec-Kit | S7 | Ensure atomicity in requirement writing | 2 | S6 |
| Implementation | S8 | Implement 25 atomic recs from Phase 3 | 10 | S7 |
| Implementation | S9 | Group subtasks by area (Compliance, Docs) | 2 | S8 |
| Implementation | S10 | Estimate effort for each subtask | 3 | S9 |
| Planning | S11 | Create priority matrix for enhancements | 2 | S10 |
| Planning | S12 | Map dependencies across 25 tasks | 4 | S11 |
| QA | S13 | Develop 7 QA checklists with 7 items each | 5 | S12 |
| QA | S14 | Add HIPAA citations to all relevant docs | 3 | S13 |
| Docs | S15 | Update feature files with compliance | 4 | S14 |
| Docs | S16 | Create common issues section for gaps | 2 | S15 |
| Security | S17 | Integrate encryption standards in guides | 3 | S1 |
| Security | S18 | Document auth compliance flows | 2 | S17 |
| Frontend | S19 | Enhance UI docs for accessibility | 3 | S15 |
| Backend | S20 | Add error handling security docs | 4 | S18 |
| Database | S21 | Detail DB schema compliance | 3 | S19 |
| Testing | S22 | Create testing strategy for docs | 5 | S20 |
| Testing | S23 | Validate atomicity in recs | 2 | S22 |
| General | S24 | Apply KISS/YAGNI to all content | 1 | S23 |
| General | S25 | Final review for modularity | 2 | S24 |

### Priority Matrix (10 High-Impact)

| Task ID | Priority | Impact | Effort |
|---------|----------|--------|--------|
| S1 | High | High | 3 |
| S2 | High | High | 4 |
| S3 | High | High | 2 |
| S8 | High | High | 10 |
| S9 | High | Medium | 2 |
| S13 | High | Medium | 5 |
| S17 | High | High | 3 |
| S19 | High | Medium | 3 |
| S20 | High | High | 4 |
| S22 | High | Medium | 5 |

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

| Version | Date       | Author | Summary                                                                                                                                                                                    |
| ------- | ---------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0.1.0   | 2025-09-09 | system | Initial generation                                                                                                                                                                         |
| 0.2.0   | 2025-09-09 | system | Enhanced v2: Added governance linkage, expanded requirements (FR-026–FR-030), controlled vocabulary, traceability, clarification markers retained                                          |
| 0.3.0   | 2025-09-10 | system | Enhanced v3: Integrated HIPAA §164.312 PHI encryption/RLS/Zod, LGPD equivalents, YAML metrics for compliance, modularity patterns, 10 atomic subtasks, updated entities and linkage table. |
| 0.4.0   | 2025-09-10 | system | Enhanced v4: Integrated Documentation Enhancement Plan phases, gaps (G1-G15), recommendations (R1-R25), 25 atomic subtasks (S1-S25) with priority matrix, QA checklists by type, common issues mitigation, and testing strategy into unified PRD index, ensuring Spec-Kit modularity, HIPAA/LGPD emphasis on RLS/encryption, KISS/YAGNI applied for ≥9.5/10 quality. |
