# Monorepo Testing Strategies (Turborepo)

Purpose: Efficient test execution in a Turborepo monorepo.

## Key Strategies

- Place tests close to code (`apps/*/src/**.test.*` and `packages/*/src/**.test.*`)
- Use `pnpm --filter` to target scopes locally and in CI
- Leverage Turborepo cache; keep outputs and inputs configured

## Commands

```bash
# Run unit tests only for changed package and its dependents
pnpm --filter ...^... test:unit

# Run all tests for apps/web
pnpm --filter @neonpro/web... test

# Run integration tests workspace-wide
pnpm test:integration
```

## Coverage

- Generate per-scope coverage, then merge
- Enforce thresholds per `coverage-policy.md`

## CI Integration

- Parallelize by stage (unit → integration → e2e)
- Upload artifacts per stage; run `coverage:verify` at the end
