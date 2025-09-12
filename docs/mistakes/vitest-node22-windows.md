# Vitest failures on Windows with Node 22 and route tests rendering 500

Date: 2025-09-12

Symptoms
- pnpm test fails with: ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL @neonpro/web test: `vitest --run`
- Route tests render the Server Error (500) page instead of expected UI
- jsdom warning: Not implemented: navigation (except hash changes)
- Vitest worker error on Windows/Node 22: ERR_MODULE_NOT_FOUND for @vitest/utils/dist/source-map.js, Tinypool "Worker exited unexpectedly"

Root causes
- Runtime errors during tests from UI theme toggler and analytics (missing providers / DOM access) trigger ErrorBoundary → 500 page.
- Tinypool + Node 22 on Windows has a module resolution/worker issue.

Fix
1) Partial mock of UI toggler to avoid ThemeProvider requirement, preserving other exports:
   File: `apps/web/src/test/setup.ts`
   - Replace direct mock with:
     - `const actual = await vi.importActual<any>('@neonpro/ui');`
     - `return { ...actual, AnimatedThemeToggler: () => null }`

2) Expand analytics mock to include LGPD methods used by tests:
   - `exportUserData: vi.fn().mockResolvedValue({})`
   - `deleteUserData: vi.fn().mockResolvedValue(undefined)`

3) Mitigate Tinypool/Node 22 issue by using forks:
   File: `apps/web/vitest.config.ts`
   - Add under `test`: `pool: 'forks', threads: false`

4) Supabase test mock ensures signed-in session in `onAuthStateChange` so dashboard/pages render.

Validation
- `pnpm --filter @neonpro/web test` → 18/18 files, 79/79 tests passed
- `pnpm --filter @neonpro/web build` → smoke build successful (see CI/logs)

Notes
- Keep analytics and UI mocks centralized in `setup.ts` to avoid per-test boilerplate.
- If upgrading Node/Vitest/Tinypool, try removing `pool: 'forks'` to restore parallel workers.
