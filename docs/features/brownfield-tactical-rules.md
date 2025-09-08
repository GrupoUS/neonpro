# Brownfield Tactical Rules — NeonPro

> Pragmatic rules to ship value safely in an existing codebase (MVP phase)

## Core principles

- Keep it small: scope each change to 1 objective, 1 surface, 1 reviewer.
- Prefer seams: add adapters/facades instead of deep rewrites.
- Preserve behavior: tests or manual smoke before/after high‑risk edits.
- Reversible by default: feature flags or guarded code paths.
- Security first: never weaken auth/RLS/secrets to “unblock”.

## Actionable rules (8–12)

1. Define the contract before code

- Inputs, outputs, error modes, success criteria written in the PR description.
- Add a tiny fixture or example payload if relevant.

2. Constrain the blast radius

- Touch ≤3 files or 1 module; if more, split into stacked PRs.
- No cross‑package refactors in feature PRs.

3. Tests: red → green → refactor (lite)

- Add 1–2 unit/integration tests (happy + 1 edge) when logic changes.
- E2E only when changing user flows; otherwise rely on smoke checklist.

4. Adopt shims instead of rewrites

- Wrap legacy behavior in a function/component; use the shim in new code.
- Leave a TODO with removal criteria and owner.

5. Feature‑flag risky paths

- Use environment‑controlled toggles (Vercel envs) or config switches.
- Default OFF for new behavior in staging until smoke passes.

6. Keep secrets and roles strict

- Never expose SERVICE_ROLE to web; prefer anon + RLS verified paths.
- Rotate keys on incident or role churn; track in runbook.

7. Logging and breadcrumbs

- Add request id and minimal breadcrumbs where new failures may occur.
- Avoid PII in logs; rely on IDs and hash references.

8. Optimize only after measurement

- Ship correctness first; add instrumentation; then tune hotspots.
- Use TypeScript types to prevent accidental regressions.

9. Avoid wide renames/reorgs

- Rename only co‑touched symbols; batch renames get separate PRs.
- Respect monorepo boundaries documented in source‑tree.md.

10. Document small, right where users look

- Update README or the closest docs page; link PR → doc diff.
- Add a short “how to test” block in PR.

11. Rollback strategy in PR

- State how to disable/rollback (flag, revert commit, config).
- Keep migrations backward‑compatible when possible.

12. Compliance guardrails (LGPD/Healthcare)

- Validate RLS on any new table/query path in staging.
- Avoid storing extra PHI; minimize retention and surface area.

## Practical criteria (use as checklist)

- [ ] PR affects ≤3 files or a single module
- [ ] Contract bullets present (IO, errors, success)
- [ ] Tests added/updated or justified with smoke
- [ ] Flags/guards in place for risky paths
- [ ] Secrets safe; no SERVICE_ROLE in web; envs mapped
- [ ] Logs minimal, no PII
- [ ] Rollback path described
- [ ] Docs nearby updated (1–3 lines ok)
- [ ] Compliance touchpoints considered (RLS/PHI)

See also

- docs/AGENTS.md, docs/memory.md, docs/architecture/source-tree.md
- docs/features/staging-deploy-runbook.md, docs/features/smoke-checklist.md
