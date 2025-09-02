# 📚 Database Schema Orchestrator (docs/database-schema)

Purpose: single source of truth for how to use, extend, and maintain the database schema docs. Follow this guide end‑to‑end before editing any file here.

## What lives here (inventory)

Current files:
- `AGENTS.md` (this file) — orchestrator and rules
- `database-schema-consolidated.md` — full architecture, functions, triggers, RLS patterns
- `tables/README.md` — table docs purpose and conventions
- `tables/tables-consolidated.md` — table reference (schemas, RLS, indexes)

Planned-but-missing (create when needed):
- `functions.md` — custom SQL/PLpgSQL functions (SECURITY DEFINER/INVOKER, params, returns)
- `triggers.md` — trigger catalog with table, event, timing, function
- `relationships.md` — FK map and cascade rules
- `enums.md` — enum types and allowed values

## How to work here (Archon-first)

1) Check Current Task
- Use Archon MCP → find or create a task for your schema change.
- Move to "doing" before edits.

2) Research for Task
- If unsure, read:
  - `database-schema-consolidated.md` for patterns
  - `tables/tables-consolidated.md` for table baselines
  - Rules in `docs/rules/` (see below)

3) Implement the Task (docs first)
- Update the relevant doc(s) in this folder first (KISS/YAGNI).
- For DB changes, prepare a migration (Supabase MCP) and link it from docs.

4) Update Task Status
- Move task to "review" with notes and affected files.

5) Get Next Task
- Repeat the cycle. No direct "done" without review.

## Mandatory rules to apply

Always follow these rules from `docs/rules`:
- `coding-standards.md` — KISS/YAGNI, TypeScript strict, quality ≥9.5/10
- `supabase-best-practices.md` — client factories, RLS, SRK usage boundaries
- `supabase-auth-guidelines.md` — auth patterns (client/server/SSR)
- `supabase-realtime-usage.md` — use wrapper, not direct channel in UI
- `variables-configuration.md` — required envs, never hardcode secrets
- `supabase-consolidation.md` — single source under packages/database/supabase

Compliance checkpoints (LGPD/ANVISA/Professional Councils):
- RLS enabled on sensitive tables; consent validation when applicable
- Audit trail present for sensitive operations
- Data retention policies documented where relevant (e.g., medical_records)

## Authoring standards (concise, actionable)

- Keep docs factual (current state). Avoid speculation/future ideas.
- Prefer tables, lists, and minimal SQL blocks over long prose.
- Link to migrations and code paths (services/repositories) when useful.
- Remove stale content immediately when schema changes.

## File templates

Table file (example structure):
```markdown
# <table_name>

## Schema
| Column | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|

## Relationships
- <fk_table>.<fk_col> → <table_name>.<pk>

## Row Level Security (RLS)
Status: ✅/❌ (risk if disabled)

### Policies
```sql
-- enable RLS/policies here
```
```

Functions file:
```markdown
# Database Functions

## <function_name>
Purpose: ...  
Parameters: ...  
Returns: ...  
Usage: ...

```sql
CREATE OR REPLACE FUNCTION ...
```
```

Triggers file:
```markdown
# Database Triggers

## <trigger_name>
Table: ...  
Event: INSERT/UPDATE/DELETE  
Timing: BEFORE/AFTER  
Function: ...  
Purpose: ...

```sql
CREATE TRIGGER ...
```
```

Enums file:
```markdown
# Enum Types

## <enum_name>
Values: a | b | c
```

## When to edit which file

- Broad patterns, architecture, common SQL templates → `database-schema-consolidated.md`
- Concrete table details (columns, RLS, indexes) → `tables/<table>.md` and update `tables-consolidated.md` if the baseline changes
- New PL/pgSQL functions → add to `functions.md` and reference from consolidated doc
- New triggers/policies → document under `triggers.md` and cross-link to affected tables
- Relationships changes → `relationships.md` and reflect on each table file
- New enums → `enums.md` and list usage sites

## Using Supabase MCP (required)

- Schema read/list: list tables, check RLS, verify extensions
- DDL changes: use migrations (apply_migration). Do not hardcode IDs in data migrations
- Validation: run advisors (security/performance) after structural changes
- Types: regenerate TS types when columns/enums change

## Minimal PR checklist (quality gates)

- [ ] Docs updated first (this folder) and consistent
- [ ] Migration created/applied in branch DB (no drift)
- [ ] RLS, consent, audit policies verified as needed
- [ ] Supabase advisors checked (security + performance)
- [ ] TS types regenerated and compile passes
- [ ] Links added to tasks; task moved to review

## Quick links

- Architecture: `./database-schema-consolidated.md`
- Tables reference: `./tables/tables-consolidated.md`
- Rules: `../rules/`

Notes: Keep this orchestrator short. Expand details in the consolidated docs and per-table files.