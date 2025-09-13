# Feature Specification: AI Chat with Database-Aware Context

**Feature Branch**: `001-ai-chat-with`  
**Created**: 2025-09-13  
**Status**: Draft  
**Input**: User description: "AI Chat with database-aware context across NeonPro using AI SDK v5, Hono API, Supabase/PostgreSQL, and LGPD-compliant access; deliver spec for chat UX, data flows, security, testing plan, and acceptance criteria."

## Execution Flow (main)
```
1. Parse user description from Input
   → If empty: ERROR "No feature description provided"
2. Extract key concepts from description
   → Identify: actors, actions, data, constraints
3. For each unclear aspect:
   → Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
   → If no clear user flow: ERROR "Cannot determine user scenarios"
5. Generate Functional Requirements
   → Each requirement must be testable
   → Mark ambiguous requirements
6. Identify Key Entities (if data involved)
7. Run Review Checklist
   → If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
   → If implementation details found: ERROR "Remove tech details"
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

### Section Requirements
- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

### For AI Generation
When creating this spec from a user prompt:
1. **Mark all ambiguities**: Use [NEEDS CLARIFICATION: specific question] for any assumption you'd need to make
2. **Don't guess**: If the prompt doesn't specify something (e.g., "login system" without auth method), mark it
3. **Think like a tester**: Every vague requirement should fail the "testable and unambiguous" checklist item
4. **Common underspecified areas**:
   - User types and permissions
   - Data retention/deletion policies  
   - Performance targets and scale
   - Error handling behaviors
   - Integration requirements
   - Security/compliance needs

---

## User Scenarios & Testing (mandatory)

### Primary User Story
As a clinic staff member, I want to ask the in-app AI chat questions about clinic operations (clinical and financial) and receive accurate, up-to-date answers that reflect the current database state, so that I can quickly make decisions without leaving my workflow.

[NEEDS CLARIFICATION: enumerate user roles allowed to use chat — e.g., Admin, Clinician, Finance, Reception]

### Acceptance Scenarios
1. Given an authenticated user with proper permissions, When they ask "How many new patients started treatment this month?", Then the chat responds within a few seconds with a numeric answer and a short explanation of criteria (e.g., date range, status) consistent with the current database.
2. Given a finance user with permission to view accounts, When they ask "Which invoices are overdue this week?", Then the chat returns a structured list (or summarized counts) of overdue invoices scoped to the user’s clinic and permissions, including due dates and amounts.
3. Given a clinician with consented patient access, When they ask "What is patient Maria Santos’ outstanding balance?", Then the chat either provides the balance (if consent recorded) or responds with a clear message that consent is required and how to obtain it.
4. Given intermittent provider errors, When the chat attempts to answer, Then the user sees a user-friendly error with retry guidance and no sensitive data exposure.
5. Given a long-running query, When the question requires aggregations across large data, Then the chat gives progressive feedback (e.g., "working…") and returns a final answer without freezing the UI.

### Edge Cases
- Consent missing for patient-level queries: response must state consent requirement and not reveal PII.
- Cross-clinic isolation: users must never see data from other clinics.
- Ambiguous patient names: system must ask for clarification (e.g., birthdate or unique identifier) before answering.
- Large result sets: system must summarize with a safe cap and offer to "show more" or export.
- Rate limits exceeded: user receives clear messaging and a safe backoff time.
- Session expired: user sees an authentication prompt, and no data is leaked.

## Requirements (mandatory)

### Functional Requirements
- **FR-001**: The chat MUST support natural-language questions about clinical and financial operations and return accurate, current answers based on the system’s database.
- **FR-002**: The chat MUST respect user permissions and clinic boundaries for all responses.
- **FR-003**: The chat MUST enforce patient consent checks before returning any patient-identifying information or derived metrics that could reveal identity.
- **FR-004**: The system MUST clearly indicate when answers are summaries and provide a way to refine or drill down (without overwhelming the user).
- **FR-005**: The chat MUST provide user-friendly messages and recovery paths for errors (provider issues, timeouts, invalid queries).
- **FR-006**: The chat MUST display progressive feedback during longer operations and avoid freezing the UI.
- **FR-007**: The system MUST log audit events for who asked what, when, and which data domains were accessed.
- **FR-008**: The chat MUST redact sensitive data from logs, prompts, and UI where not strictly necessary.
- **FR-009**: The system MUST support fallbacks when the preferred AI provider is unavailable and communicate minimal impact to the user.
- **FR-010**: The chat MUST support multi-lingual prompts and responses [NEEDS CLARIFICATION: target languages/locales; default likely pt-BR].
- **FR-011**: The system MUST indicate data freshness (e.g., "as of now" or last sync) in responses referencing dynamic data.
- **FR-012**: The system MUST allow users to correct the system when misinterpretation occurs (clarifying questions and follow-ups).
- **FR-013**: The chat MUST avoid exposing raw identifiers unless explicitly requested by authorized users.
- **FR-014**: The chat MUST provide structured summaries for finance (e.g., totals, counts, ranges) and clinical (e.g., counts by treatment stage) questions.
- **FR-015**: The chat MUST respect configured rate limits per user/clinic/session.
- **FR-016**: The chat MUST provide an accessibility-compliant interaction (keyboard, screen readers, clear contrast).
- **FR-017**: The system MUST maintain conversation context per session and allow the user to clear history.
- **FR-018**: The chat MUST surface a clear explanation when information cannot be provided due to permissions or compliance constraints.
- **FR-019**: The system MUST provide a way to export or copy summarized results without exposing PII.
- **FR-020**: The chat MUST ensure that any aggregations or counts reflect only the authorized dataset.

*Ambiguities to confirm:*
- **FR-021**: System MUST support data retention for chat transcripts for [NEEDS CLARIFICATION: retention period and storage location].
- **FR-022**: System MUST enforce maximum response latency under [NEEDS CLARIFICATION: target e.g., p95 ≤ 5s streaming start; full answer ≤ 12s].
- **FR-023**: System MUST support offline/limited connectivity behavior [NEEDS CLARIFICATION: scope and expectations].

### Key Entities (include if feature involves data)
- **Chat Session**: Represents a user’s conversation context; attributes include user id, clinic id, timestamps, and a transcript summary (no raw PII beyond necessity). Relationships: belongs to a user; scoped to a clinic.
- **Query Intent**: Parsed intent representing the user’s question category (clinical metrics, finance, patient-level inquiry). Attributes: type, parameters, sensitivity level, consent requirement flag.
- **Audit Event**: Records who asked what and whether sensitive data was requested; attributes: actor, action summary, timestamp, domain, outcome (allowed/blocked), and reason codes.
- **Consent Record**: Indicates whether a patient has granted consent; attributes: patient id, scope, timestamp, expiry (if any), provenance of consent.

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [ ] No implementation details (languages, frameworks, APIs)
- [ ] Focused on user value and business needs
- [ ] Written for non-technical stakeholders
- [ ] All mandatory sections completed

### Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain
- [ ] Requirements are testable and unambiguous  
- [ ] Success criteria are measurable
- [ ] Scope is clearly bounded
- [ ] Dependencies and assumptions identified

---

## Execution Status
*Updated by main() during processing*

- [ ] User description parsed
- [ ] Key concepts extracted
- [ ] Ambiguities marked
- [ ] User scenarios defined
- [ ] Requirements generated
- [ ] Entities identified
- [ ] Review checklist passed

---

### UX Enhancements (Components)
- Prompt Builder (ai-prompt): Users can choose guided prompt presets and fill parameters (e.g., date range, clinic scope) before sending. Presets are curated, non-technical labels (e.g., "Overdue invoices this week", "New treatments started this month").
- Input Search Suggestions (ai-input-search): As the user types, the input offers safe, non-PII suggestions for common intents, metrics, and report names. Suggestions never surface patient names or identifiers.
- Loading & Progress (ai-loading): Visual states communicate progress (e.g., "Connecting…", "Finding data…", "Preparing answer…"). Indicators are accessible, unobtrusive, and cancellable.
- Explanation View (Chain-of-Thought): An optional "Explain how this was answered" toggle reveals a safe, summarized rationale of the steps taken without exposing raw prompts or sensitive internals. Default OFF; respects permissions and compliance policies.

### Additional Acceptance Scenarios (UX Components)
6. Given the user selects a preset "Overdue invoices this week" in the prompt builder and fills the date range, When they submit, Then the chat responds with the relevant overdue items scoped to their permissions, and the preset parameters are reflected in the answer summary.
7. Given the user types "overdue", When input suggestions appear, Then only safe, non-PII suggestions (e.g., "overdue invoices", "overdue count by clinic") are shown; selecting one updates the query text without auto-submitting.
8. Given the system is gathering data, When the operation is in progress, Then a visible loading indicator displays the stage (connecting/gathering/answering) and the user can cancel the request.
9. Given an answer is shown, When the user toggles "Explain how this was answered", Then a concise explanation is displayed that summarizes the reasoning steps without revealing internal prompts or patient data; toggling back hides it and no raw chain-of-thought is stored persistently.

- **FR-024**: The chat MUST offer a prompt builder experience with curated, business-friendly presets and parameter fields; presets MUST avoid exposing PII and MUST reflect in the answer summary.
- **FR-025**: The chat input MUST provide safe, non-PII search suggestions for intents/metrics; suggestions MUST be optional and never auto-submit without explicit user action.
- **FR-026**: The system MUST indicate loading/progress states throughout the request lifecycle; users MUST be able to cancel ongoing requests.
- **FR-027**: The system MUST provide an optional explanation view that summarizes reasoning steps in a privacy-preserving manner; raw chain-of-thought MUST NOT be stored or exposed; this control MUST default to OFF and obey permissions.
- **FR-028**: The system MUST record an audit event when an explanation view is requested and shown, without logging any sensitive internal reasoning.
- **FR-029**: The system MUST ensure suggestions, presets, and explanations are localized [NEEDS CLARIFICATION: locales; default likely pt-BR].
- **FR-030**: The system MUST ensure that prompt presets and suggestions are bounded by the user’s role and clinic scope; items outside authorization MUST NOT appear.

### Edge Cases (Components)
- Prompt Preset with missing parameters: The system requests required fields (e.g., date range) before submission.
- Suggestion implies restricted scope: The suggestion is hidden for unauthorized users.
- Loading canceled by user: The in-flight request is cancelled, UI resets to editable state, no partial data is shown.
- Explanation requested for sensitive patient answer: Explanation is shown only as a high-level summary; no PII or raw internal steps; may be disabled if compliance demands.

### Key Entities (Additions)
- **Prompt Template**: Curated preset describing a business question with required parameters (labels and descriptions for non-technical users); attributes: name, description, required fields, category (clinical/finance), localization keys, role visibility.

### Elements Components (AI SDK) — Business Expectations
- Context: User can provide optional additional context (e.g., “focus on Clinic A, August 2025”) that is used to narrow scope and is visible in the UI; context NEVER overrides permissions or consent.
- Conversation: The chat maintains a clear conversation thread per session; users can review past exchanges and clear history.
- Image: Users can attach non-PII images only when relevant to a question (e.g., treatment photo review) [NEEDS CLARIFICATION: scope and policy]. Any image data processed must follow storage and consent policies.
- Open-in-Chat: From other parts of the app (finance list, clinical dashboard), users can open a pre-filled chat query; the prefill MUST exclude PII unless justified and consented.
- Prompt Input: Input field supports suggestions, presets, and validation; hitting Enter submits; Shift+Enter inserts newline; accessibility ensured.
- Reasoning: The system offers a privacy-safe reasoning summary (not raw CoT) when toggled; default OFF; audit logged when shown.
- Response: Responses include structured data summaries with source context (e.g., “as of now”) and offer refinement actions.
- Suggestion: Safe, non-PII quick suggestions available below input to speed common queries.
- Task: Long-running tasks (data aggregation) show progress states and can be canceled; results appear when ready with clear status.

### Additional FRs (Elements)
- **FR-031**: Context entry MUST be optional and clearly separate from the main prompt; context MUST not expand access beyond authorized scope.
- **FR-032**: Conversation history MUST be per session and user-clearable; history handling MUST follow retention policy.
- **FR-033**: Image attachments MUST be blocked by default for PII; allowed images MUST follow explicit policy and consent [NEEDS CLARIFICATION].
- **FR-034**: Open-in-Chat MUST prefill only safe, authorized information; PII prefills require explicit consent and role.
- **FR-035**: Prompt input MUST support Enter/Shift+Enter, validation, and accessibility hints.
- **FR-036**: Reasoning summary MUST be off by default and summarized (no raw prompts); showing MUST be auditable.
- **FR-037**: Responses MUST include data freshness context and offer refine actions.
- **FR-038**: Suggestions MUST be safe, non-PII and filtered by role/clinic.
- **FR-039**: Task-type operations MUST expose progress and cancellation; partial results MUST not leak sensitive data.
