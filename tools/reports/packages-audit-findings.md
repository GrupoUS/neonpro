## Packages Audit Findings (Phase 3)

### Duplicates
- Exact duplicates: none detected across packages/**/*.ts(x) after normalization.
  - Method: strip comments/blank lines, SHA1 hash per file (workpaper placeholders under tools/reports/_md5_*.txt)
  - Evidence: no duplicate groups found.

### Near-duplicates (≥85% line similarity)
- Template scaffolds likely share structure:
  - Group: packages/shared/src/templates/* (api-template.ts, feature-template.ts, component-template.tsx)
  - Rationale: intentional scaffold similarity. Low risk; exclude from consolidation.
  - Status: manual-review

### Redundancies (same responsibility)
- Auth utilities in two places
  - Paths: `packages/utils/src/auth/**` and `packages/shared/src/auth/**`
  - Severity: P2 (medium)
  - Impact: split ownership and surface area; risk of drift
  - Substitute: prefer `@neonpro/shared/auth`
  - Evidence:
    <augment_code_snippet path="packages/utils/src/auth/index.ts" mode="EXCERPT">
````ts
 * @deprecated Auth utilities have been consolidated into @neonpro/shared/auth
````
    </augment_code_snippet>
  - Status: manual-review (confirm no remaining imports from utils/auth)

### Obsolete / Deprecated / Out-of-PRD
- Enterprise API Gateway (Next-style gateway) vs Hono API
  - Paths: `packages/enterprise/src/api-gateway/**`
  - Severity: P3 (low)
  - Impact: dead surface; misleading alternative to apps/api
  - Substitute: use `apps/api/src` Hono routes
  - Evidence:
    <augment_code_snippet path="apps/api/src/routes/ai.ts" mode="EXCERPT">
````ts
// AR Simulator endpoints - INACTIVE
// ai.route("/ar-simulator", arSimulatorRoutes);
````
    </augment_code_snippet>
  - Status: manual-review

### Dead / Unused code (preliminary)
- See `tools/reports/unused-files.json` for candidate list and rationale.

### Feature flags permanently off
- No constants found that keep features always off; NEXT_PUBLIC_* flags present in turbo.json env. Needs runtime/env audit.
  - Status: manual-review

### Decision Required
- PRD vs Architecture: clarify scope of `@neonpro/enterprise` (keep as enterprise reference vs deprecate)

---

## Summary (Phases 2–3) — Enhanced Sweep
- Graph updated with more package→package edges based on turbo.json and aliases.
- Dynamic edges annotated; evidence from apps/web lazy AI hook included.
- “Unused” kept conservative; ambiguous items marked manual-review.
- Duplicates: none exact; near-duplicate templates intentionally similar.

### Next for Phase 4
- Confirm zero imports of `packages/utils/src/auth/**` across apps/packages/tests before scheduling removal.
- Decide enterprise package scope. If deprecated, plan doc note + archival PR.
- Optionally, run full similarity job offline to attach concrete % for template pairs.
