---
title: "DB Consolidation Overlaps & Cutover Plan"
last_updated: 2025-09-05
form: reference
---

# DB Consolidation — Overlaps & Cutover Plan

## Summary
- Legacy package `packages/db`: not present (likely removed/archived).
- Code references to `@neonpro/db`: none found (only mentioned in reports/docs).
- Single Source of Truth (SoT): `packages/database`.
- Secondary Prisma schema found at: `apps/web/prisma/schema.prisma`.

## Evidence
- Search: pattern `@neonpro/db|packages/db` → only in `tools/*` docs.
- Existing DB package: `packages/database` with `prisma/`, `supabase/`, `types/`.
- Prisma schema locations:
  - `packages/database/prisma/schema.prisma` (SoT)
  - `apps/web/prisma/schema.prisma` (duplicate/domain-specific)
## Overlaps
- prisma:
  - SoT: `packages/database/prisma/`
  - Duplicate: `apps/web/prisma/`
- supabase:
  - SoT: `packages/database/supabase/`
  - Duplicate: none detected
- types:
  - SoT: `packages/database/types/`
  - Duplicate: possibly `packages/types` (ensure separation of domain vs infra types)

## Risks
- Drift between app schema and package schema (migrations diverge).
- Two sources defining models leading to type/runtime mismatches.
- CI/build pipelines referencing app-level schema inadvertently.
## Cutover Plan (Phased)
1) Freeze app-level schema changes (`apps/web/prisma/`).
2) Align models: port any app-only models/fields into SoT (if truly required).
3) Generate migration from SoT (packages/database) → apply to DB.
4) Remove/disable `apps/web/prisma/` usage (keep folder temporarily as backup).
5) Update scripts/CI to point Prisma CLI at `packages/database/prisma`.
6) Validate: type-check, unit/integration tests, RLS policies.
7) Delete stale app schema after 1-2 sprints of stability.

## Commands (verification)
```bash
# Find any lingering legacy imports
rg -n "@neonpro/db|packages/db" -S

# Ensure Prisma CLI uses SoT
export PRISMA_SCHEMA=packages/database/prisma/schema.prisma
pnpm prisma generate --schema $PRISMA_SCHEMA
pnpm prisma migrate status --schema $PRISMA_SCHEMA
```
