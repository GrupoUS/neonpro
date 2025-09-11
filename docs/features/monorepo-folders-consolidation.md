# Monorepo Folders Consolidation

Date: 2025-09-11

## Summary
Consolidated out-of-tree folders into documented monorepo layout per `docs/architecture/source-tree.md`.

## Moves
- `api/` → `apps/api/vercel/` (Vercel function wrappers: `index.ts`, `health.ts`, `openapi.json.ts`, `v1/health.ts`)
- `libs/cli/` → `packages/cli/` (internal CLI helpers package)
- `public/` → `apps/web/public/` (static assets for the web app)
- `monitoring/` → `tools/monitoring/` (health/perf scripts, configs, dashboards)
- `examples/` → `apps/api/examples/` (API runtime examples)

## Rationale
- Align with monorepo structure (apps/*, packages/*, tools/*).
- Make Vercel function wrappers live alongside the API app.
- Keep CLI code as a proper workspace package.
- Keep static assets under the web app.
- Keep monitoring under tools/ for ops usage.

## Follow-ups
- Optionally wire `apps/api/vercel` functions into Vercel config/routes if needed.
- Ensure `pnpm-workspace.yaml` continues to include new paths (it does: apps/*, packages/*, tools/*).
- Run a quick build to catch broken imports.
