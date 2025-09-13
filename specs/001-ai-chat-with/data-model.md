# Phase 1 — Data Model

## Entities
- Chat Session
  - id, userId, clinicId, createdAt, updatedAt
  - transcriptSummary (no raw PII), locale, lastInteractionAt
- Query Intent
  - id, type (clinical|finance|patient), params (safe), sensitivityLevel, consentRequired
- Audit Event
  - id, actorId, clinicId, action, domain, timestamp, outcome (allowed|blocked), reasonCode
- Consent Record
  - id, patientId, clinicId, scope, grantedAt, expiresAt?, source
- Prompt Template
  - id, name, description, requiredFields, category, i18nKeys, roleVisibility

## Relationships
- Chat Session belongs to User; scoped by Clinic
- Audit Event references actor (User) and Clinic
- Consent Record references Patient and Clinic
- Prompt Template visibility filtered by Role and Clinic

## Validation Rules
- No PII in transcriptSummary or prompt/suggestion previews
- Explanation summary cannot expose raw internal reasoning or PII
- All entity operations emit Audit Events where applicable


## Additional Entities (Elements)
- Conversation Thread
  - id, sessionId, title?, createdAt, updatedAt
- Context Note
  - id, sessionId, text, createdAt, createdBy
- Task Run
  - id, sessionId, type, status (pending|running|done|canceled|error), startedAt, finishedAt?, progress?
- Image Attachment
  - id, sessionId, url/ref, type, consentId?, policyTag, createdAt
