# Data Model – Phase 1 AI Chat

## Entity Overview
| Entity | Purpose | Key Fields | Notes |
|--------|---------|-----------|-------|
| ChatSession | Group of messages within 60m inactivity | id, clinic_id, user_id, started_at, last_activity_at, locale | TTL via inactivity check |
| ChatMessage | Individual user/system exchange | id, session_id, role(enum user|assistant|system), content, created_at, redaction_flags[] | Store only redacted content for logs |
| AuditEvent | Immutable interaction audit | id, clinic_id, user_id, session_id, action_type, consent_status, query_type, redaction_applied(bool), outcome(enum success|refusal|error|limit), latency_ms, created_at | Partition yearly |
| RateCounter | Fairness tracking (ephemeral) | key(user_id), window_5m_count, window_1h_count, updated_at | Memory only Phase 1 |
| Suggestion | Follow-up prompt (generated) | id, session_id, text, created_at | Not persisted long-term (optional ephemeral) |
| ExplanationSummary | Redacted restatement of an answer | id, message_id, content, created_at | Derivable; may store for speed |

## Tables (Proposed SQL Sketch)
```sql
-- chat_sessions
id uuid PK
clinic_id uuid FK clinics
user_id uuid FK users
started_at timestamptz NOT NULL DEFAULT now()
last_activity_at timestamptz NOT NULL
locale text CHECK (locale IN ('pt-BR','en-US'))

-- chat_messages
id uuid PK
session_id uuid FK chat_sessions
role text CHECK (role IN ('user','assistant','system'))
content text NOT NULL
redaction_flags text[] DEFAULT '{}'
created_at timestamptz DEFAULT now()

-- audit_events
id uuid PK
clinic_id uuid
user_id uuid
session_id uuid NULL
action_type text -- query|explanation|suggestion|rate_limit|refusal|error
consent_status text CHECK (consent_status IN ('valid','missing','invalid'))
query_type text NULL -- treatment|finance|mixed|other
redaction_applied boolean DEFAULT false
outcome text CHECK (outcome IN ('success','refusal','error','limit'))
latency_ms int
created_at timestamptz DEFAULT now()

-- (No persistent rate_counter table Phase 1)
```

## Relationships
ChatSession 1—* ChatMessage  
ChatSession 1—* Suggestion  
ChatMessage 1—1? ExplanationSummary  
User 1—* AuditEvent  
Session 1—* AuditEvent

## Validation Rules
- locale must be supported set.
- message content length <= 4000 chars (prevent abuse).
- latency_ms >=0.
- action_type constrained to controlled vocabulary.

## Derived / Computed
- Session inactivity = now() - last_activity_at > 60m → closed.
- Freshness flag if now() - message.created_at > 5m.

## State Transitions
ChatSession: active → idle (>=60m) → closed (no further messages appended).

## Indexes (Performance)
- chat_messages(session_id, created_at)
- audit_events(user_id, created_at)
- audit_events(clinic_id, created_at)

## Security / RLS Considerations
- chat_sessions: row clinic_id = auth context.
- audit_events: restricted to compliance/admin roles.

## Open Questions (Deferred)
- Do we need explanation_summary persistence or regenerate on demand? (Start: regenerate; add cache if >200ms cost).
