# CI (Unified)

Este repositório utiliza um único workflow do GitHub Actions para executar a cadeia de validações e, quando aplicável, realizar deploy na Vercel.

## Eventos que disparam
- push: main, develop
- pull_request: main, develop
- workflow_dispatch (manual)

## Concurrency
```
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
```

## Jobs
1) setup-and-install
- Node 20.x, pnpm 9.x (com cache), pnpm install --frozen-lockfile

2) lint
- npx oxlint . (erros falham, warnings permitidos)
- npx dprint check

3) type-check
- npx tsc --noEmit --skipLibCheck

4) test-and-coverage
- pnpm vitest run --project unit --coverage --reporter=verbose
- artifacts: coverage/ (lcov-report/index.html, coverage-summary.json)

5) quality-gates
- Recalcula TSC_SCORE, LINT_SCORE, TYPE_SCORE, SECURITY_SCORE, e QUALITY_SCORE
- Gera quality-gates-report.md e exporta outputs via $GITHUB_OUTPUT
- Gates:
  - tsc_score == 25
  - security_score >= 10
  - quality_score >= 7.0

6) deploy-vercel
- Apenas em push na main e após quality-gates passar
- Requer secrets: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID
- Passos: vercel pull/build/deploy

## Como rodar localmente
- Lint: `npx oxlint .` e `npx dprint check`
- Type-check: `npx tsc --noEmit --skipLibCheck`
- Testes + cobertura: `pnpm vitest run --project unit --coverage --reporter=verbose`

## Artifacts
- coverage/: relatórios de cobertura
- quality-gates-report.md: relatório consolidado de qualidade

