# CI/CD Testing Pipelines (NeonPro Healthcare)

> Purpose: Define automated testing workflows, quality gates, and performance/compliance checks in CI.

## Overview

- Pipelines run on GitHub Actions
- Stages: unit → integration → e2e → security → compliance
- Fast feedback by parallelization and caching
- Fail-fast policy on critical gates (security/compliance)

## Quality Gates

- Lint & Type-check must pass (no warnings in protected paths)
- Coverage thresholds enforced (see Coverage Policy)
- A11y checks on critical UI
- Security (dependency + static checks) green
- Compliance checklist pass (LGPD/ANVISA/CFM)

## Example GitHub Actions Workflow

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  setup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"
      - run: pnpm install --frozen-lockfile

  unit:
    needs: setup
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:unit -- --coverage
      - name: Upload coverage
        uses: actions/upload-artifact@v4
        with:
          name: coverage-unit
          path: coverage/

  integration:
    needs: unit
    runs-on: ubuntu-latest
    services:
      postgres:
        image: supabase/postgres:15
        ports: ["5432:5432"]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:integration -- --coverage
      - name: Upload coverage
        uses: actions/upload-artifact@v4
        with:
          name: coverage-integration
          path: coverage/

  e2e:
    needs: integration
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"
      - run: pnpm install --frozen-lockfile
      - uses: microsoft/playwright-github-action@v1
      - run: npx playwright install --with-deps
      - run: pnpm test:e2e
      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/

  security:
    needs: e2e
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"
      - run: pnpm install --frozen-lockfile
      - name: Dependency audit (fail on high/critical)
        run: |
          pnpm audit --json > audit.json || true
          COUNT=$(jq -r '(.metadata.vulnerabilities.high + .metadata.vulnerabilities.critical) // 0' audit.json)
          echo "High+Critical vulnerabilities: ${COUNT}"
          if [ "$COUNT" -gt 0 ]; then
            echo "Failing due to high/critical vulnerabilities"
            cat audit.json
            exit 1
          fi
      - name: Static analysis (example)
        run: pnpm lint:security

  compliance:
    needs: security
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"
      - run: pnpm install --frozen-lockfile
      - name: Run compliance checklist
        run: pnpm run compliance:check
      - name: Verify coverage thresholds
        run: pnpm run coverage:verify
```

## Performance Benchmarks & Failure Criteria

- Unit tests: < 3 min; coverage ≥ thresholds; no flaky retries
- Integration tests: < 5 min; DB-connected; deterministic mocks for externals
- E2E: < 10 min; key flows green on Chromium + 1 mobile
- Security: No high severity vulns allowed
- Compliance: All mandatory checks pass; exemptions require approval

## Artifacts & Observability

- Upload coverage reports per stage
- Upload Playwright reports with traces on failure
- Preserve logs for auth/database/ai mocks
- Track pipeline timing; regressions trigger investigation
