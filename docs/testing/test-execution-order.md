# Test Execution Order & Priority

This repository organizes test execution by priority and sequence to maximize signal/feedback.

Priority levels
- P0 — Core web flows (fast, always-on)
- P1 — Feature units (UI/organisms)
- P2 — Extended suites (AI Chat, Governance)
- P3 — Integration/E2E/Performance

Sequential execution plan (by folder)
1. P0: Curated web suite
   - apps/web → `vitest` include list (6 tests)
2. P1: Shared UI and organisms (on-demand/CI)
   - apps/web `src/components/**` not in curated list
3. P2: Feature modules (AI chat, governance)
   - apps/web `src/__tests__/legacy/**`
4. P3: Integration/E2E (tools/tests/**)
   - Separate Playwright/Node suites

How to run by priority

```bash
# P0 — Curated fast suite
pnpm --filter @neonpro/web test

# P1 + P2 — Full web suite (nightly)
FULL_TESTS=1 pnpm --filter @neonpro/web test

# P3 — E2E (Playwright) from repo root
pnpm exec playwright test
```

Notes
- The P0 list is defined in `apps/web/vitest.config.ts`.
- Nightly CI job runs FULL_TESTS=1 to include legacy/excluídos.
- Documentation: see `docs/testing/curated-web-tests.md` for details.
