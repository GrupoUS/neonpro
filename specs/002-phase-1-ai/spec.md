# Feature Specification: Phase 1 AI Chat Contextual Q&A

**Feature Branch**: `[002-phase-1-ai]`  
**Created**: 2025-09-15  
**Status**: Draft  
**Input**: User description: "Phase 1 AI Chat contextual Q&A with consent, audit, redaction and deterministic mock support"

## Execution Flow (main)
```
1. Parse user description from Input
2. Extract key concepts (contextual Q&A, consent enforcement, audit logging, PII redaction, deterministic mock)
3. Identify unclear aspects (rate limits, retention, roles, locales) → resolved below
4. Define user scenarios & acceptance tests
5. Generate functional requirements (testable, business language)
6. Identify key entities (no schemas, only conceptual models)
7. Run review checklist (verify no implementation HOW details)
8. Return SUCCESS (ready for planning)
```

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
An authorized clinic staff member wants a concise, privacy‑respecting answer about a patient’s recent treatments or outstanding balance without manual record lookup.

### Acceptance Scenarios
1. **Given** staff has required role & patient consent exists, **When** they ask about recent treatments, **Then** system returns a concise answer and logs an audit event.
2. **Given** staff asks for outstanding balance with consent present, **When** processed, **Then** balance summary is returned and logged.
3. **Given** staff requests an explanation of a prior answer, **When** triggered, **Then** a privacy‑filtered summary is produced.

### Edge Cases
- Missing consent → refusal with rationale (no sensitive data).
- Ambiguous patient reference → clarification request.
- Query containing PII tokens → redacted before processing.
- Rapid queries beyond fairness thresholds (>10 in 5m or >30 per hour) → polite limit notice.
- Internal timeout → generic retry guidance + audit error outcome.

## Requirements *(mandatory)*

### Functional Requirements
- **FR-P1-001**: System MUST allow authorized staff to submit natural language clinical or basic financial questions.
- **FR-P1-002**: System MUST provide progressive answer visibility within 1s of first token (perceived responsiveness).
- **FR-P1-003**: System MUST restrict answers to data permitted by consent & role.
- **FR-P1-004**: System MUST request clarification for ambiguous subject references.
- **FR-P1-005**: System MUST validate consent before including patient‑specific details.
- **FR-P1-006**: System MUST return a neutral refusal message when consent missing.
- **FR-P1-007**: System MUST offer safe follow‑up suggestion prompts free of protected identifiers.
- **FR-P1-008**: System MUST produce explanation summaries without raw sensitive data.
- **FR-P1-009**: System MUST log audit events with fields: eventId, userId, clinicId, timestampUTC, actionType, consentStatus, queryType, redactionApplied, outcome, latencyMs, sessionId.
- **FR-P1-010**: System MUST redact CPF, CNPJ, emails, phone numbers, full DOB, detailed addresses beyond city/state, and health insurance numbers in logs.
- **FR-P1-011**: System MUST support recent treatments overview & financial balance + overdue summary counts.
- **FR-P1-012**: System MUST return standardized generic error responses without technical stack detail.
- **FR-P1-013**: System MUST flag data as stale if freshness >5 minutes.
- **FR-P1-014**: System MUST restrict domain queries to roles: ADMIN, CLINICAL_STAFF, FINANCE_STAFF; SUPPORT_READONLY limited to read-only financial summaries.
- **FR-P1-015**: System SHOULD display answer generation start timestamp.
- **FR-P1-016**: System MUST avoid exposing implementation technologies in user answers.
- **FR-P1-017**: System MUST retain prior session messages for up to 60 minutes inactivity.
- **FR-P1-018**: System MUST ask user to refine multi‑intent queries (no auto split).
- **FR-P1-019**: System MUST support locales pt-BR and en-US at launch.
- **FR-P1-020**: System MUST prevent protected identifiers in suggestions/explanations.
- **FR-P1-021**: System MUST provide deterministic mock mode (clinical summary, balance, overdue summary, consent refusal, ambiguous query).
- **FR-P1-022**: System SHOULD notify when fairness limit triggers (“Please retry shortly”).
- **FR-P1-023**: System MUST log refusals distinctly from successful answers.
- **FR-P1-024**: System MUST retain audit events 5 years (configurable >=2 years).

### Key Entities
- **User**: Actor with role & clinic association.
- **Chat Session**: Context container (≤60m inactivity window).
- **Message**: User question or system answer element.
- **Suggestion**: Follow‑up prompt guiding next clarification.
- **Explanation Summary**: Privacy‑filtered restatement of prior answer.
- **Consent Record**: Authorization confirmation for patient data use.
- **Audit Event**: Immutable interaction log entry.
- **Rate Counter**: Tracks query volume for fairness gating.

---

## Review & Acceptance Checklist
### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous  
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status
- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked (then resolved)
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

---
