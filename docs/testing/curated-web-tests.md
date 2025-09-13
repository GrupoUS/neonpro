# Curated Web Test Suite (Fast)

This repository maintains a compact, fast-running Vitest suite for the web app to speed up iteration while keeping confidence.

Kept tests (6 total):
- src/__tests__/routes/dashboard.test.tsx — Dashboard smoke + cards present
- src/__tests__/routes/appointments.test.tsx — Appointments route empty state
- src/__tests__/routes/clients.test.tsx — Clients route empty state
- src/__tests__/auth-form.test.tsx — Auth form mode switching
- src/components/organisms/__tests__/NotificationCard.test.tsx — Aggregated notifications + navigation
- src/components/ui/__tests__/SharedAnimatedList.test.tsx — Loading/empty/items render states

Excluded by default (still in repo):
- AI chat component tests
- Governance panels and tables
- Legacy or slow suites, integration/e2e/performance

Why: These tests overlap with the core suite’s goals or are heavier. They remain available for CI/nightly or when developing those areas.

How to run

```bash
# Web tests (curated) — from repo root
pnpm --filter @neonpro/web test

# Type check and lint (fast feedback)
pnpm --filter @neonpro/web type-check
pnpm --filter @neonpro/web lint
```

Notes
- The curated list is configured in `apps/web/vitest.config.ts` via an explicit `include` list.
- To temporarily run an excluded test, launch Vitest directly with a path:

```bash
pnpm --filter @neonpro/web exec vitest run src/components/ui/ai-chat/__tests__/ai-chat.test.tsx
```
