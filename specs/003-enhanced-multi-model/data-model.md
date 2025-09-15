# Data Model – Enhanced Multi-Model Assistant

## Entities
| Entity | Purpose | Fields (key) | Notes |
|--------|---------|--------------|-------|
| Plan | Defines entitlements | id, name, allows_crud(bool), analytics_window_days, model_tiers[] | Seed basic, premium |
| UserPlan | Associates user to plan | user_id, plan_id, assigned_at | Could fallback to clinic default |
| UsageCounter | Track daily usage | user_id, date, read_count, modify_count | Reset daily; indices (user_id,date) |
| AbuseWindow (memory) | Sliding window stats | user_id, last_queries_timestamps[], last_modifies_timestamps[] | Not persisted table Phase 1 |
| Recommendation | Generated actionable item | id, user_id, type(enum PAYMENT_FOLLOWUP|SCHEDULING_OPTIMIZATION|CLIENT_ENGAGEMENT), content, created_at | Optional persist for analytics |
| OperationLog | Extended audit for CRUD & analytics | id, user_id, action, domain, outcome, latency_ms, model_used, failover(bool), created_at | Could be view over audit_events + join |
| DomainDescriptor | Onboard domain metadata | id, name, operations[], sensitivity_level | Drives safe CRUD parsing |
| PartialOutcomeReport | Result structure | id, request_id, successes[], failures[] | Structured JSON only |

## Table Sketches
```sql
-- plans
id uuid pk
name text unique
allows_crud boolean
analytics_window_days int
model_tiers text[] -- ARRAY of allowed model identifiers

-- user_plan
user_id uuid pk
plan_id uuid fk plans
assigned_at timestamptz default now()

-- usage_counters
user_id uuid
usage_date date
read_count int default 0
modify_count int default 0
PRIMARY KEY(user_id, usage_date)

-- recommendations
id uuid pk
user_id uuid
category text check (category in ('PAYMENT_FOLLOWUP','SCHEDULING_OPTIMIZATION','CLIENT_ENGAGEMENT'))
content text
created_at timestamptz default now()

-- domain_descriptors
id uuid pk
name text unique
operations text[] -- create, read, update, delete subset
sensitivity_level text check (sensitivity_level in ('low','medium','high'))

```

## Indexes
- usage_counters(user_id, usage_date)
- recommendations(user_id, created_at DESC)

## Derived Rules
- Approaching quota = read_count >= 0.8 * free_limit
- Abuse triggers: queries_60s > 12 OR modifies_10m > 5

## Security
- RLS: usage_counters scoped to user or admin
- Domain descriptors admin-only write

## Open Questions
- Persist partial outcome reports? (Start: return only) |
