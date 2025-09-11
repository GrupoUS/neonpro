# Migrations Guide (Supabase PostgreSQL)

Purpose: consistent, safe schema changes for NeonPro.

## Naming convention
- Timestamped, snake_case: `YYYYMMDDHHMMSS__short_description.sql`
- One logical change per migration
- Separate DDL (schema) from DML (data) when practical

## Authoring rules
- Be idempotent where possible (`IF NOT EXISTS`)
- Prefer explicit column lists and constraints
- Add indexes and RLS policies close to table creation
- Document the intent at top of file as comments

## Example template
```sql
-- 20250910__add_appointments_indexes.sql
-- Adds indexes to speed up appointments list
CREATE INDEX IF NOT EXISTS idx_appts_prof_time ON appointments (professional_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appts_patient_time ON appointments (patient_id, scheduled_at);
```

## Supabase CLI tips (reference)
- `supabase migration new "add_appointments_indexes"`
- `supabase db push` (dev only), prefer migration files for CI/CD
- Keep production changes reviewed and reversible