# Implementation Plan (Local Copy)

Source of truth in Archon (Doc ID: 12d5d2bf-0c38-4838-a595-fec649f42438). This local copy enables task generator compatibility.

## Scope
Deliver zero-error deploy pipeline for NeonPro (Turborepo + Hono API + Vite/TanStack Router web) on Vercel with standardized scripts, env hygiene, observability, performance guardrails, and rollback strategy.

## Technical Context
**Language/Version**: TypeScript 5.7.x, Node.js 20+, React 19
**Primary Dependencies**: Hono (API), Vite + TanStack Router (web), Turborepo, Supabase JS, Vitest, Playwright (later), Oxlint
**Storage**: Supabase Postgres (remote managed)
**Testing**: Vitest (unit/integration), custom contract tests, future Playwright for E2E
**Target Platform**: Vercel (Edge + Node runtimes), Browser (modern evergreen)
**Project Type**: Web (frontend + API) monorepo
**Performance Goals**: TTFB (API edge) <150ms p95, LCP <2.5s, CLS <0.1, build cold <40s, incremental <5s
**Constraints**: Healthcare compliance (LGPD), no PHI in logs, multi-env consistency, zero secret leakage in bundles
**Scale/Scope**: Initial single-tenant clinics; projected growth multi-clinic with moderate concurrent load (<500 RPS aggregate)

## Key Streams
1. Baseline & Scripts
2. Env & Secrets Governance
3. Runtime & Architecture (Edge vs Node)
4. Observability & Health
5. API Contract & Testing
6. Performance & Budgets
7. Documentation & Compliance
8. Deployment Automation & Rollback
9. Security & Integrity (added)

## High-Level Sequence
1. Baseline build/tests capture
2. Env variable audit + .env.example
3. Runtime decision & health endpoint
4. Logging standardization
5. OpenAPI spec + contract tests
6. Performance budgets + metrics collection
7. Smoke & rollback scripts
8. Documentation cross-linking
9. Security hooks & scanning

## Constraints
- Must not introduce breaking changes to existing consumers.
- All new endpoints require contract tests first.
- No leakage of service role key to client bundles.
- All test files created before implementation (TDD enforced).

## Success Metrics
- First deploy passes smoke test (health + homepage) <= 2s TTFB local baseline.
- Performance budgets integrated (fail fast on regression).
- 100% new tests precede implementations.
- No high/critical vulnerabilities unresolved at deploy time.

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Edge cold start variance | Latency spikes | Measure & document fallback to Node |
| Env drift preview vs prod | Hidden failures | Checklist + validation script |
| Logging noise | Signal dilution | Structured schema + level gating |
| Secret leakage (service role) | Security breach | Bundle scan + pre-commit hook |
| Spec drift (OpenAPI) | Client breakage | Contract test + CI check |

## Architecture & Structure Decision
Monorepo retains existing layout per `source-tree.md`. Edge runtime preferred for stateless routes; Node fallback documented if cold starts exceed threshold.

## Constitution Check (Initial)
**Simplicity**: 2 apps (api, web) + packages; no extra layering introduced. No unnecessary patterns (no repositories introduced).  
**Architecture**: Features expressed via tasks & packages; logging & env validation kept as utilities (no over-abstraction).  
**Testing**: RED phase enforced via Phase 2 tasks (contract & env tests before implementations).  
**Observability**: Structured logging + health + startup metrics tasks.  
**Versioning**: Internal versioning implicit; future semantic versioning of packages out-of-scope for initial deploy.  
Outcome: PASS.

## Progress Tracking
- [x] Phase 0 / Research (implicit via earlier analysis)
- [x] Phase 1 / Design (feature + plan + tasks baseline)
- [x] Phase 2 / Task planning generated
- [ ] Phase 3 / Implementation executing
- [ ] Phase 4 / Validation
- [ ] Phase 5 / Deployment sign-off

Gate Status:
- [x] Initial Constitution Check
- [x] Post-Design Constitution Check
- [ ] All runtime decisions finalized

## Stream-Specific Notes
- **Runtime Decision**: Pending empirical cold start measurement.
- **OpenAPI Strategy**: Minimal handcrafted spec evolving to automation later.
- **Security Hooks**: Pre-commit secret scan & bundle scan tasks to be added.

## References
See feature doc `docs/features/deploy-vercel.md` for detailed decisions.
