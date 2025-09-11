# 🔍 NeonPro Comprehensive Code Quality & Integration Audit (Enhanced)

Robust, stack-aligned, and healthcare-aware audit workflow that merges our existing audit phases with the Quality Control command’s best ideas—kept lean, non‑redundant, and mapped to our actual tech stack and source tree.

- Frontend: React 19 + Vite + TanStack Router
- Backend: Hono + Node 20
- Data: Supabase (Postgres) + Prisma ORM
- QA: Vitest, Playwright, Oxlint, dprint, TypeScript strict
- Monorepo: Turborepo + PNPM + Bun (scripts)

Use this prompt as the single source of truth for audits, tests, and compliance validation in NeonPro.

---

## 📋 Mandatory Execution Sequence

1) sequential-thinking → Analyze scope and detect integration hotspots
2) archon MCP → Track work as atomic tasks (todo → doing → review)
3) serena MCP → Codebase analysis (structure, deps, change surface)
4) desktop-commander MCP → File edits + commands
5) supabase MCP → DB/RLS checks (when relevant)
6) docs to pre-load when needed:
   - `docs/architecture/source-tree.md`
   - `docs/architecture/tech-stack.md`
   - `docs/testing/coverage-policy.md`, `docs/testing/integration-testing.md`, `docs/testing/e2e-testing.md`
   - `docs/rules/coding-standards.md`

Tip: Prefer repo tasks when available (see VS Code Tasks palette and root scripts).
---

## 🗂 Phase 1 — Backend↔Database Integration (Critical)

Prisma is present (apps/api postinstall generates client), but Supabase is the source of truth. Validate both without duplication.

### 1.1 Schema & Client Checks

```bash
# Generate Prisma client (used by api & optionally web)
pnpm --filter @neonpro/api prisma:generate

# API build (ensures types align)
pnpm --filter @neonpro/api build
```

### 1.2 Database Structure & RLS Signals

- Use supabase MCP to list tables, policies, and verify RLS is enabled on sensitive tables
- Confirm snake_case DB vs camelCase usage in Prisma/TypeScript mapping where applicable
- Check FKs and enums consistency

### 1.3 API–DB Contract

- Scan Hono routes for field names used in queries
- Ensure error handling covers DB errors and RLS denials
- Verify multi-tenant scoping appears in all patient/clinic queries
---

## 🏥 Phase 2 — LGPD & Healthcare Security (Critical)

- Consent validation enforced on routes touching PHI/PII
- Audit trails for read/write operations
- Data retention and deletion logic validated
- Professional access controls (CFM) observed

RLS Integration
- Verify policies active for patient/clinic tables
- Ensure user context (clinic, role, professional id) propagates to DB queries
- Test tenant isolation

Security
- No PHI in logs or test fixtures
- TLS in transit, encrypted storage at rest
- Emergency access protocols documented
---

## 🧪 Phase 3 — Code Quality & Build Checks

Prefer workspace tasks and repo scripts; align with our stack.

```bash
# TypeScript type check (strict)
pnpm --filter ./ type-check

# Oxlint fast lint (quiet). Use package scripts where available
pnpm --filter @neonpro/api lint
pnpm --filter @neonpro/web lint

# Format (non-blocking but recommended)
pnpm --filter @neonpro/api format
pnpm --filter @neonpro/web format

# Security advisory scan (deps)
pnpm audit --json > audit-report.json || true
```

Optional VS Code tasks (fast):
- “🏛️ Constitutional Audit - Quick”
- “🏛️ Constitutional Audit - Full”
- “📈 Performance Benchmark”
- “🏥 Healthcare Compliance Check”
---

## 🧭 Phase 4 — Intelligent Test Orchestration

Auto-select tests from change surface and source-tree roles.

Inputs
- changed_files (git diff)
- integration_issues (schema, API, compliance)
- monorepo_map from `docs/architecture/source-tree.md`

Routing Rules (path → strategy)
- apps/api/** → Hono API integration + DB/RLS validation
- packages/database/** → schema & RLS verification + API regression
- apps/web/src/routes/** → TanStack Router tests + API contract checks
- apps/web/src/components|hooks/** → unit tests + Supabase client usage
- Healthcare domains (patients, appointments, clinical) → LGPD + RLS suites

Commands (examples)
```bash
# API
pnpm --filter @neonpro/api test

# Web
pnpm --filter @neonpro/web test

# E2E (web)
pnpm --filter @neonpro/web e2e
```

Coverage Policy
- Critical ≥95%, Important ≥85%, Useful ≥75% (see `docs/testing/coverage-policy.md`)
---

## 🛠️ Phase 5 — Systematic Fixing (Lean Priorities)

P0 — Integration blockers
- DB mismatches (naming/relations), RLS bypass risks
- API field errors, missing tenant/role scoping
- Missing consent/audit logging on PHI paths

P1 — Security & compliance
- no-eval, safe fetch options, URL safety
- PHI redaction; audit logs for sensitive ops

P2 — Type safety & contracts
- Replace `any` with `unknown`/specific types
- Align response types and zod schemas with routes

P3 — Module & hygiene
- ES module imports, remove dead code
- Query optimization and error handling
---

## ✅ Phase 6 — Quality Gates

Gate 0 — Backend/DB (blocking)
- API builds green; Prisma client generates
- No schema/field errors; RLS policies verified

Gate 1 — LGPD (blocking)
- Consent checks present on PHI routes
- Audit logs exist and pass review

Gate 2 — RLS (blocking)
- Queries enforce tenant + role context
- No cross-tenant leakage in tests

Gate 3 — Lint/Types/Sec
- Oxlint: 0 errors (<100 warnings)
- `pnpm type-check` passes
- `pnpm audit` has 0 criticals
---

## 🧾 Artifacts & Reporting

- Save lint/type/security outputs to repo root: `quality-report.txt`, `security-report.json`
- Update Archon tasks with decisions and evidence
- Append notable findings to `docs/mistakes/*.md` when applicable

## 🧩 Minimal Examples

Type safety
```ts
// Before
type Handler = (c: any) => any
// After
type Handler = (c: import('hono').Context) => Response | Promise<Response>
```

ESM imports
```ts
// Before
const { execSync } = require('node:child_process')
// After
import { execSync } from 'node:child_process'
```
---

## 🧭 Quick Start (Task Runner)

Use workspace tasks for speed:
- “🏛️ Constitutional Audit - Quick” → fast compliance validation
- “🏛️ Constitutional Audit - Full” → exhaustive validation
- “📈 Performance Benchmark” → perf checks
- “🏥 Healthcare Compliance Check” → LGPD/ANVISA heuristics

CLI fallbacks
```bash
# Root helpers
pnpm quality:full
pnpm workflow:ci

# Tools/audit
pnpm constitutional:quick
pnpm constitutional:full
pnpm constitutional:benchmark
```

---

This enhanced audit prompt integrates the Quality Control command’s strengths (testing, compliance, performance, security, cleanup, formatting) into our existing phases—mapped to NeonPro’s stack and source tree, without overengineering or redundant rules.
---

## 🔬 Optional Advanced DB Checks (keep if needed)

Prisma advanced (use only when investigating schema drift):
```bash
# Validate schema against DB (if script exists in packages/database)
cd packages/database && pnpm prisma:validate || npx prisma validate --schema prisma/schema.prisma

# Compare actual DB schema (read‑only)
cd packages/database && npx prisma db pull --print > schema-actual.prisma

diff packages/database/prisma/schema.prisma schema-actual.prisma || true
```

## 🧯 Optional Project-Specific Tests (if available)

```bash
# API route/database integration suites (run if these scripts exist)
cd apps/api && pnpm test:routes || true
cd apps/api && pnpm test:db-integration || true
cd apps/api && pnpm test:lgpd-compliance || true
cd apps/api && pnpm test:rls-security || true
```
