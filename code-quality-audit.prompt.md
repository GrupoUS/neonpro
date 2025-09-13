# Code Quality Audit — Test Orchestration

Objective: Run all testing layers in a sequenced, priority-driven manner using the docs/testing guides.

Priority Plan
1) P0 — Curated fast suite (apps/web)
2) P1 — Extended web suite (FULL_TESTS=1)
3) P2 — E2E (Playwright)
4) P3 — Tooling audits (optional)

Sequential Commands (Linux/bash)
```bash
# P0 — Curated fast suite
pnpm --filter @neonpro/web test

# P1 — Full web suite (includes legacy/excluídos)
FULL_TESTS=1 pnpm --filter @neonpro/web test

# P2 — E2E tests (Playwright)
pnpm exec playwright test
```

References
- Curated suite: docs/testing/curated-web-tests.md
- Order & priority: docs/testing/test-execution-order.md

Notes
- FULL_TESTS alterna o include em apps/web/vitest.config.ts para buscar todos os testes.
- Em CI noturno, o workflow `.github/workflows/nightly-full-tests.yml` executa FULL_TESTS=1 automaticamente.
- Para executar um teste específico excluído por padrão, use vitest diretamente com o caminho do arquivo.
