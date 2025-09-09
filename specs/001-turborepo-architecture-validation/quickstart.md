# Quickstart (Phase 1)

1. Read `/docs/architecture/*` for local architecture reference.
2. Review `turbo.json`, root `package.json`, and workspace package manifests.
3. Cross-check with Turborepo docs (internal packages, deps, structuring, tasks, running tasks).
4. Fill the YAML validation report template with PASS/FAIL per item and fixes.


## Validate Setup (Quality Gates)

Run all checks:
```bash
# VS Code Task (recommended)
# Task: "✅ Full Code Check"

# CLI equivalent
npx dprint check && npx oxlint . && npx tsc --noEmit --skipLibCheck
```

Expected result now:
- 0 lint errors, typecheck clean, format clean (warnings may appear and are non-blocking for this feature).
