---
title: "BMAD Brownfield MVP Plan — NeonPro"
last_updated: 2025-09-06
form: reference
tags: [mvp, brownfield, bmad, planning]
related:
  - ../AGENTS.md
  - ../memory.md
  - ../architecture/source-tree.md
  - ../production-deployment-guide.md
---

# BMAD Brownfield MVP Plan — NeonPro

> Objective: Deliver a minimal, testable, deployable MVP for real clients with zero type errors and passing unit tests, following Brownfield + BMAD principles and project agent protocols.

## 1) Architecture Analysis

- Read: docs/AGENTS.md, docs/memory.md, docs/architecture/source-tree.md, docs/production-deployment-guide.md
- Current state: 2 apps (web Next.js 15, api Hono), 8 packages consolidated, TypeScript strict, tests green (unit), lint warnings tolerated, formatter aligned
- Constraints: LGPD/CFM compliance patterns in @neonpro/security and @neonpro/database
- Env targets: Vercel (apps/web+api), Supabase (DB)

## 2) Backend Integration Audit

- Database: Supabase + Prisma via @neonpro/database; RLS validators present (tests/mocks simulate)
- API: apps/api routes cover analytics/whatsapp; health checks present; AI services integrated in core-services
- Action: keep production data access mocked/minimized for MVP; verify connection script `apps/web/test-supabase-connection.ts` on staging only

## 3) Archon Project Setup

- Project: NeonPro MVP (Brownfield + BMAD)
- Active planning tasks:
  - Synthesize MVP gaps and objectives (doing)
  - Load Brownfield & BMAD guides (doing — fallback: use AGENTS.md + memory.md since working-in-the-brownfield.md not found)
- Next: Create execution tasks (deploy runbook, smoke tests, env setup)

## 4) MVP Scope (Minimal, Client-Ready)

- Patient CRUD with LGPD consent checks (apps/web hooks + shared schemas)
- Scheduling basic flows with mocked analytics
- Authentication flows (login/logout) with Supabase client
- Core UI components (button, card, form) with a11y
- Health checks and simple monitoring page

Acceptance criteria:

- pnpm type-check passes; unit tests (project=unit) pass w/ coverage
- oxlint: no errors (warnings allowed for MVP)
- dprint check passes
- Deploys to Vercel (preview) with environment config template

## 5) Gaps & Risks

- Missing working-in-the-brownfield.md: use AGENTS.md/memory.md as authoritative guides
- Many lint warnings (unused vars/imports): non-blocking for MVP, schedule cleanup
- Compliance testers are mocks; ensure messaging and labels indicate MVP status
- Supabase RLS tests are mocked; real RLS validation deferred to staging checklists

## 6) Execution Tasks (Next)

- Create .env.example.monorepo and Vercel env mapping
- Create Deploy Runbook (staging) + Smoke Test checklist
- Add scripts: type-check, lint, format, test:unit to CI; enforce on PRs
- Prepare quickstart README for clients (how to login, demo flows)

## 7) Rollback & Safety

- Feature-flag any external integrations (WhatsApp/AI) by default off
- Keep production keys out of repo; use Vercel envs
- If deployment fails: rollback to previous Vercel build; keep database migrations paused for MVP demo

## 8) Deliverables

- This plan file (docs/features/bmad-brownfield-mvp-plan.md)
- Archon tasks created for execution
- Optional: staging deploy + smoke report

See also: ../AGENTS.md · ../memory.md · ../architecture/source-tree.md

## Linked Artifacts

- Runbook: `docs/features/staging-deploy-runbook.md`
- Quickstart: `README-QUICKSTART.md`

## 9) Validation & Readiness (Current)

- Format (dprint): PASS (after fmt)
- Lint (oxlint): PASS with warnings (1088 warnings, 0 errors) — non-blocking for MVP; create cleanup task post-MVP
- Type check (tsc): PASS (no errors, strict mode)
- Unit tests (Vitest, project=unit): PASS — 77 tests, 10 files, coverage enabled
- E2E smoke (Playwright): Executed previously — no failures observed (headless smoke)
- Coverage artifact: Present at `coverage/coverage-final.json`

Decision: Ready for staging deploy (preview) with feature flags default-off for external integrations. Proceed to run the staging runbook and capture smoke results.
