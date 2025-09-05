# Monorepo Package Audit Methodology & Roadmap

Date: 2025-09-05
Owner: Archon (AI IDE Agent)

## Goals
- Reduce package count, eliminate redundancies, maintain clear boundaries
- Preserve apps/web stability via re-exports and incremental migrations

## Methodology
1) Inventory & Categorization
   - UI, domain/types, utils/tooling, services (API/monitoring/security), data (database), integrations
2) Import Graph & Usage Metrics
   - Use tools/reports/package-dep-graph.json to identify inbound=0 (removal/merge), low inbound (candidates), high inbound (core)
3) Overlap Detection
   - Name/intent similarity (e.g., multiple UI dashboards)
   - Shared or duplicated components/types
4) Candidate Selection & Scoring
   - Impact: consumer count × surface area
   - Complexity: transitive deps, build setups, TS errors
   - Maintenance: overlap extent, churn
5) Migration Design
   - Target package, API surface, re-export shim, codemods (optional)
   - Testing matrix (type-check, lint, unit)
6) Execution & Validation (per candidate)
   - Implement move/merge, add re-exports, update docs
   - Validate with turbo build, type-check (exclude compliance), unit tests
   - Rollback plan ready (revert commits, keep shims)

## Initial Categorization (24 packages)
- Core: @neonpro/types, @neonpro/utils, @neonpro/core-services, @neonpro/database
- UI: @neonpro/ui, @neonpro/brazilian-healthcare-ui (deprecated), @neonpro/health-dashboard (deprecated)
- Services: @neonpro/api, @neonpro/monitoring, @neonpro/security, @neonpro/auth (low inbound)
- Tooling/Shared: @neonpro/shared, @neonpro/tooling, @neonpro/config, @neonpro/docs
- AI/Domain: @neonpro/ai, @neonpro/domain, @neonpro/performance
- Apps: @neonpro/web
- Compliance: @neonpro/compliance (excluded from current type-check phase)

## Priority Candidates (beyond UI quick wins)
- @neonpro/auth (inbound=0): Evaluate removal/merge into @neonpro/security or @neonpro/core-services
- Overlap between @neonpro/shared and @neonpro/ui (shared templates import UI): ensure direction is UI <- shared (avoid UI depending on shared); consider moving UI-templating to @neonpro/ui/docs or keeping in @neonpro/shared as docs-only
- Monitoring UI surface: ensure all presentational UI moved under @neonpro/ui and @neonpro/monitoring remains logic-only

## Migration Roadmap (Phased)
1) Completed Quick Wins (this PR set)
   - Merge @neonpro/brazilian-healthcare-ui → @neonpro/ui (tokens/components; re-export shim)
   - Merge @neonpro/health-dashboard → @neonpro/ui/components/dashboard/health (presentational; shim)
2) UI Stabilization
   - Reduce @neonpro/ui TS errors (batch by component area)
   - Export maps: consider adding explicit export entries for dashboard/health and themes components
3) Service Consolidation
   - @neonpro/auth → audit usage; merge into @neonpro/security/@neonpro/core-services if unused
   - Ensure monitoring remains headless; UI in @neonpro/ui only
4) Shared/Docs Cleanup
   - Normalize @neonpro/shared templates to not pull UI code at runtime; move examples to docs or keep dev-only
5) Compliance Isolation
   - Keep @neonpro/compliance excluded until dedicated refactor phase; plan separate consolidation/removal of experimental modules

## Risk & Rollback
- Risk: Implicit consumers via dynamic imports
  - Mitigation: repo-wide search for import() patterns; telemetry optional
- Risk: Export path instability
  - Mitigation: add package.json exports for new UI subpaths; maintain shims for ≥2 releases
- Rollback: revert merge commits; keep deprecated packages intact with re-exports during trial period

## Validation Checklist (each step)
- turbo run build,type-check --filter='@neonpro/*' --filter='!@neonpro/compliance'
- Affected apps: build and run smoke tests for apps/web pages using UI
- Lint & minimal unit tests where present

