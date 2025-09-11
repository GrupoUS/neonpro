# Vercel Deployment Enablement (Feature Doc)

Status: In Progress
Last Updated: 2025-09-11
Related Project (Archon): f81ffced-2e7a-452d-b694-11936aaa8c06
PRD Doc ID: 46e0298a-2f05-4176-8446-406ad10143d2
Implementation Plan Doc ID: 12d5d2bf-0c38-4838-a595-fec649f42438

## 1. Overview

This feature delivers a reliable, reproducible, zero-regression deployment path of the NeonPro monorepo (Turborepo + Hono API + Vite/TanStack Router frontend) to Vercel. It closes gaps in scripts, environment variables, observability, compliance, and documentation while eliminating stale Next.js references.

## 2. Objectives

- Achieve first successful production-ready deploy with green build, tests, smoke check.
- Standardize build & run scripts across packages for Vercel auto-detection.
- Harden environment variable management (complete `.env.example`, docs, rotation guidance).
- Decide and document Edge vs Node runtime for Hono API with measured trade-offs.
- Provide observability (structured logs, health endpoint, optional error tracking stub).
- Establish performance budgets & monitoring hooks.
- Supply rollback and recovery strategy with clear operator steps.
- Produce comprehensive deployment checklist for repeatability.

## 3. Architecture & Key Decisions

| Topic               | Decision (Draft)                        | Rationale                                               | Tasks                           |
| ------------------- | --------------------------------------- | ------------------------------------------------------- | ------------------------------- |
| Runtime (API)       | TBD (Edge likely)                       | Low latency, smaller cold starts                        | Hono runtime target & edge test |
| vercel.json         | TBD (Assess zero-config)                | Avoid unnecessary config unless region/runtime override | Vercel config decision          |
| OpenAPI Exposure    | Provide /openapi.json                   | Contract clarity & tooling                              | API schema / OpenAPI generation |
| Logging Format      | JSON structured                         | Easier parsing & future log drain                       | Structured logging task         |
| Performance Budgets | LCP<2.5s, CLS<0.1, TTFB<200ms (initial) | Baseline guardrails                                     | Performance budgets task        |
| Rollback            | Deploy revert + env gating              | Fast mitigation                                         | Rollback strategy doc           |
| Smoke Test          | Script curling /health + homepage       | Early detection                                         | Deployment smoke test script    |

## 4. Task Matrix (Archon)

> Source of truth: Archon project. Status will evolve from `todo` -> `doing` -> `review` -> `done`.

| Order | Task Title                                 | Archon ID                            | Status |
| ----- | ------------------------------------------ | ------------------------------------ | ------ |
| 100   | Baseline local build & test verification   | badfb1e3-782e-49c8-aac8-c289948ae30f | todo   |
| 95    | Standardize Vercel deployment scripts      | 16d69139-9f1f-4ce0-a702-087f949d57b9 | todo   |
| 90    | Environment variables audit & template     | e23b97f6-d51b-4bd2-9b72-b59ee03787a6 | todo   |
| 85    | Vercel config decision (vercel.json)       | 1abffd74-0c88-42d0-84ce-445c9213d06a | todo   |
| 80    | Hono runtime target & edge test            | 05793ae6-4df2-44c1-8782-94a451cea2cb | todo   |
| 75    | Structured logging & error handling review | 33879bee-4795-4a5c-8b3f-eb78a85ae30d | todo   |
| 70    | CI pipeline deploy job alignment           | 2551a9d7-b192-423f-81a8-45cf884d4064 | todo   |
| 65    | Secrets & env management documentation     | a0cbddaf-a63e-469d-b51c-4a3afec8f1b7 | todo   |
| 60    | Remove stale Next.js references            | 18d1d6f1-8c85-408c-b4f1-4909028765b6 | todo   |
| 55    | Supabase connectivity & RLS smoke tests    | b796fbbc-e605-4597-9a90-d7dc03c9d695 | todo   |
| 50    | Prisma migration deploy step review        | 65028843-b9cd-4884-aef2-a4cc6c140906 | todo   |
| 45    | API schema / OpenAPI generation            | e94dde6b-669f-4f97-9142-92227a210360 | todo   |
| 42    | Turborepo remote cache verification        | e691cd6e-2bf1-4a03-99c4-3b70826a51e5 | todo   |
| 40    | Performance budgets & monitoring config    | e44d1abc-377c-4755-9b5f-4e3d678653b7 | todo   |
| 37    | Dependency vulnerability audit             | 51852a22-2f79-4823-aba7-6116313c9e5f | todo   |
| 35    | Custom error & fallback pages              | 60feec87-77f9-4353-993f-e319ce6d6927 | todo   |
| 32    | Edge cold start measurement                | 86cc2e23-537e-4adc-81af-19ac5647ba90 | todo   |
| 30    | Error tracking integration placeholder     | 7dd3e968-db01-4744-8fda-d0cb2cd5fb3b | todo   |
| 27    | Rollback & recovery strategy doc           | a3bce9df-2845-42a6-9806-29018fd0f914 | todo   |
| 25    | Analytics & consent integration            | fd4e0cd1-6568-482f-af61-9462e7c61034 | todo   |
| 20    | Deployment smoke test script               | dab60313-ab72-4893-b196-744cb7cd1e44 | todo   |
| 15    | Feature documentation creation             | 186ffc5e-fc54-4570-bb92-89c1a186b706 | todo   |
| 10    | Cross-link documentation updates           | 87d92868-e222-4b93-ab26-2f8b0ddfc220 | todo   |
| 5     | Dry-run deployment checklist               | 803b451a-076c-4169-80cc-71289fdb9e8b | todo   |

## 5. Environment Variables (Draft Inventory)

| Variable                  | Scope   | Required     | Description                | Notes                                         |
| ------------------------- | ------- | ------------ | -------------------------- | --------------------------------------------- |
| SUPABASE_URL              | API/Web | Yes          | Supabase project URL       | Set in Vercel dashboard                       |
| SUPABASE_ANON_KEY         | Web     | Yes          | Public anon key for client | Do not expose service role on client          |
| SUPABASE_SERVICE_ROLE_KEY | API     | Yes (server) | Elevated server ops        | Restrict via Vercel env (not in .env.example) |
| SENTRY_DSN                | Web/API | Optional     | Error tracking DSN         | Placeholder until integration enabled         |
| NEXT_PUBLIC_*             | -       | Remove       | Legacy prefix from Next.js | To be refactored to VITE_ or custom           |
| VITE_API_BASE             | Web     | Yes          | Browser API base URL       | Provided at build time                        |
| LOG_LEVEL                 | API     | Optional     | Logging verbosity          | default=info                                  |
| ANALYTICS_KEY             | Web     | Optional     | Analytics provider key     | Load after consent                            |

Action: finalize and generate `.env.example` (see related tasks).

## 6. Pre-Deploy Checklist (Will Evolve)

1. All tasks with order >=50 completed (core foundations).
2. `pnpm build` passes with zero errors.
3. `pnpm test` green; coverage meets policy (see coverage-policy doc).
4. `.env.example` updated & validated.
5. Vercel project env vars configured (spot-check 3 random critical ones).
6. Smoke test script passes locally (`./tools/...`).
7. Edge runtime decision validated and documented.
8. Performance budget test executed (baseline captured).
9. OpenAPI spec accessible and parses cleanly.
10. Rollback instructions verified by dry run (simulate revert scenario).

## 7. Rollback & Recovery (Draft)

| Scenario               | Detection Signal   | Immediate Action                      | Follow-up                            |
| ---------------------- | ------------------ | ------------------------------------- | ------------------------------------ |
| API 5xx spike          | Monitoring alert   | Revert to previous deploy             | Triage logs, root cause doc          |
| Env var misconfig      | Health check fail  | Restore last known good value         | Add validation guard                 |
| Performance regression | Budget test fail   | Rollback & open perf issue            | Optimize & raise threshold gradually |
| Auth outage            | Login errors surge | Feature flag disable optional modules | Engage Supabase status, comms        |

## 8. Observability & Monitoring (Initial)

- Health Endpoint: `/health` returns { status: 'ok', commit, timestamp }.
- Structured Logs: JSON lines with fields: ts, level, svc, msg, ctx.
- Edge Metrics: Cold start log tag `startup=true` for first request measurement.
- Error Tracking: Placeholder stub; toggle-able by `SENTRY_DSN` presence.

## 9. Performance Strategy (Seed)

- Measure initial bundle size post build (Vercel preview) — record in doc.
- Introduce route-level code splitting if bundle > target (TBD threshold 180KB gzipped).
- Add Lighthouse CI integration (stretch goal, not blocking initial deploy).

## 10. Compliance Notes

- Ensure no PHI/PII in logs (sanitizer in logger pipeline - separate task if emerges).
- Analytics blocked until consent event dispatch.
- Service role key never bundled client side (verify via build artifact grep).

## 11. Open Questions (To Resolve Early)

- Do we require region pinning to `gru1` via vercel.json? (Assess latency metrics.)
- Will we pursue immediate error tracking (Sentry) or defer until post-MVP?
- Are Prisma migrations active or is Supabase SQL migration path canonical now?

## 12. References

- Architecture: `docs/architecture/source-tree.md`, `docs/architecture/tech-stack.md`
- Coding Standards: `docs/rules/coding-standards.md`
- Testing Policies: `docs/testing/coverage-policy.md`
- Supabase Best Practices: `docs/rules/supabase-best-practices.md`

## 13. Change Log

| Date       | Change                       | Author       |
| ---------- | ---------------------------- | ------------ |
| 2025-09-11 | Initial feature doc creation | AI IDE Agent |

---

This document will be updated as tasks progress. All authoritative task status lives in Archon; this file provides an engineering narrative and deployment traceability.
