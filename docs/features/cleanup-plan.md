# NeonPro Cleanup Plan — Execution Summary (Web Focus)

Status: Completed Option A, Phase 1; Phase 2–4 executed (apps/web scoped)

## Option A (Completed)

- Temporary TypeScript excludes added to apps/web/tsconfig.json for complex areas (PWA, chat, AI scheduling, TRPCProvider, lib/trpc, useSchedulingSubmission).
- Introduced minimal stubs to unblock compilation:
  - components/stubs/PWAInstallPrompt.tsx
  - components/stubs/PWAOfflineIndicator.tsx
  - components/stubs/TRPCProvider.tsx
  - utils/pwa-lite.ts (no-op IndexedDB/cache helpers)
- apps/web type-check now passes.

## Phase 1 — Source-tree Conformance (Completed)

- Audited apps/web/src for compiled artifacts; none found (aside from intentional shims.d.ts).
- Ensured excluded folders are not imported by included files (stubs prevent re-import).
- Type-check re-validated: PASS.

## Phase 2 — API/Validation Alignment (tRPC + Valibot)

- Kept TRPCProvider as a no-op stub until backend router types stabilize.
- Added minimal tRPC client shim that avoids importing router types:
  - src/lib/trpcClient.ts
  - Exposes `createTRPCClientShim()` and `trpcClient` with `query`/`mutation` no-ops.
- Zod → Valibot: only change where strictly necessary. Current web type-check did not require changes; defer schema migration to when specific schemas become active.
- apps/web type-check: PASS after shim introduction.

## Phase 3 — Final QA (apps/web scoped)

- Formatting: Scoped dprint run against apps/web (root formatter hits syntax issues elsewhere). No files matched under current dprint config; skipped.
- Type-check: PASS (@neonpro/web).
- Targeted tests: Attempted running apps/web/src/**tests**/simple.test.tsx
  - Blocker: vitest/vite peer resolution error in workspace context (`ERR_MODULE_NOT_FOUND vite/dist/node/index.js`).
  - Action: Defer running app tests until workspace test tooling is normalized; avoid installs without explicit approval.

## Phase 4 — Documentation Sync

- This document created to summarize current state and decisions.
- Plan to re-enable excluded components incrementally (see below).
- Architecture note added: docs/architecture/trpc-valibot-alignment.md

---

## Re-enable Plan (Incremental)

1. TRPC:
   - Replace TRPCProvider stub with a thin provider once backend router contracts are stable.
   - Use src/lib/trpcClient.ts shim as the stable import surface; wire real client methods gradually.
2. PWA:
   - Replace pwa-lite with real utils one module at a time; attach feature flags if necessary.
   - Swap stubs for real PWA components after utils are validated.
3. Chat / AI Scheduling / Clients:
   - Un-exclude directories one by one, starting with lowest dependency depth.
   - Keep type-check green after each step; revert if 3+ failures.
4. Validation:
   - Migrate active zod enums/schemas to Valibot only when they become active in code paths.

## Residual Technical Debt

- TRPC router/type surface pending backend stabilization.
- Test tooling (vitest/vite peer resolution) requires workspace normalization.
- Excluded feature areas (PWA, chat, AI scheduling, clients) require incremental re-enabling.

## Validation Log

- @neonpro/web type-check: PASS
- Formatting (apps/web only): Skipped (no files matched by dprint config)
- Tests (apps/web subset): Blocked by vitest/vite module resolution
