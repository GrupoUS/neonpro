# NeonPro Copilot Instructions

Concise project-specific guidance for AI coding agents. Focus on this repository's real architecture, workflows, and conventions. Keep answers actionable and reference concrete files.

## 1. Big Picture
- Monorepo (Turborepo + Bun-first workflow; PNPM workspace metadata still present) with two primary apps: `apps/api` (Hono-based backend / edge oriented) and `apps/web` (React 19 + TanStack Router + Vite + Tailwind + shadcn/ui). Shared code in `packages/*` (types, utils, ui, security, database, etc.).
- Compliance-driven (LGPD / ANVISA / CFM) → treat personal/medical data defensively; never introduce logging of PHI outside secure utilities.
- AI / Agent workflows documented in `AGENTS.md` and `docs/AGENTS.md`; they govern task execution (Think → Research → Decompose → Plan → Implement → Validate).
- Intelligent context loading strategy: see `docs/architecture/context-engineering.md` (load minimal layers: topology → contracts → implementation → compliance → tests).

## 2. Core Workflows
- Dev: Always run with Bun: `bunx turbo dev` (root) or `bunx turbo dev --filter @neonpro/web`. Use `pnpm --filter @neonpro/web dev` ONLY if a Bun invocation fails or a script is explicitly unsupported.
- Build: `bunx turbo build` (root) or Vercel pipeline (`vercel-build` script filters web).
- Tests (root orchestrated): `bunx turbo test`. Categories via scripts: `test:frontend`, `test:backend`, `test:database`, `test:e2e`, `test:a11y`, `test:rls`, `test:compliance`, orchestration with `test:orchestrate` and flags (`--healthcare-compliance`).
- Lint / Format / Types: `bunx turbo lint`, `bunx turbo format`, `bunx turbo type-check`. For quick focused type narrowing of web UI: uses `tsconfig.typecheck.json` (exclude heavy dirs & examples).
- Integration test config: `vitest.integration.config.ts` (30s timeout, JSON reporter → `./test-results.json`). Setup file: `tools/tests/setup.ts` (refer when adding globals).
- E2E / accessibility likely via Playwright (see `playwright.config.ts` / `playwright-report/`). Reuse existing helpers instead of new harness.

## 3. Architecture & Code Layout Patterns
- Web app: `apps/web/src/routes` (file-based TanStack Router), `components/ui` (shadcn generated), `features/*` (feature slices), `lib/*` (infrastructure helpers), `hooks/`, `providers/`, `contexts/` for cross-cutting state.
- API side: `api/*.ts` simple Edge handlers and `apps/api/src` for more structured code (routes, middleware, clients like `apps/api/src/clients/supabase.ts`).
- Shared path aliases (see `tsconfig.json`): `@/*` roots to multiple app srcs, `@neonpro/*` maps to package sources, specialized: `@shared/*`, `@utils`, etc. Prefer existing alias instead of relative `../../../`.
- Supabase integration: placeholder stub client (`apps/api/src/clients/supabase.ts`) plus types in `packages/database/src/types/`. Extend by adding real factory functions; keep RLS helpers (`healthcareRLS`, `RLSQueryBuilder`) consistent.
- Type boundaries: UI logic stays in `features/` or `components/`; cross-app domain types live in `packages/shared` or specific domain package.

## 4. Conventions & Practices
- Always lean minimal (KISS, YAGNI). Do not scaffold speculative modules; add only when a concrete test/feature requires it.
- Follow TDD cycle (RED → GREEN → REFACTOR) for business logic, security, compliance, and AI agent orchestration code; lightweight components may have direct tests if logic present.
- New utilities go into the closest existing domain package (e.g., formatting → `packages/utils`, security helpers → `packages/security`). Avoid duplicating a similar helper—search with aliases first.
- For UI: Prefer existing shadcn/ui components; extend via composition, not mutation of vendor code. Put shared variants in `packages/ui` if used outside web app.
- Avoid leaking secrets or PHI in logs; if adding logging, route through a central logger (add if absent in `packages/*` rather than inline `console.log`).
- Keep path alias usage consistent; if adding new alias update `tsconfig.json` and ensure turbo cache behavior unaffected.
- Exclude heavy experimental directories similarly to `tsconfig.typecheck.json` style if adding new large prototype areas.

## 5. When Updating / Adding Code
- For any feature that changes architecture / schema / external contracts: also update or create under `docs/features/` and if DB-related `docs/database-schema/` (keep RLS notes).
- If introducing a new API route: mirror pattern in `api/*.ts` or the structured `apps/api/src/routes/*` style; ensure content-type set and JSON stable shape; document in `docs/apis/`.
- After meaningful refactors: revisit `AGENTS.md` only if the prescribed workflow materially changes (avoid churn).
- Add tests in the corresponding category script path (respect naming in `tools/tests` or per package). Ensure integration tests don't exceed 30s default timeout unless justified.

## 6. Pull Request / Quality Gate Expectations
- Run (root): `bun run format && bun run lint && bun run type-check && bun run test` before proposing changes. Fix high-signal issues first; defer micro refactors unrelated to the change.
- Avoid breaking public exports of shared packages without a migration note in the related feature doc.
- Security / compliance additions require at least one negative test (e.g., unauthorized access) plus success path.

## 7. Common Pitfalls to Avoid
- Duplicating Supabase client logic—centralize in `clients/supabase.ts` & extend there.
- Deep relative paths instead of aliases.
- Adding new global state providers without checking existing contexts.
- Large feature PRs without intermediate docs—split and document incrementally.

## 8. How to Ask the Model for Help (Meta)
When formulating answers: reference concrete files (e.g., "see `tsconfig.typecheck.json` for excluded paths"). Provide commands exactly as runnable. Prefer incremental refactors with rationale.

---
Feedback welcome: Identify unclear areas (e.g., missing logging standard, deployment nuance). Propose additions with file references.
