# NeonPro Testing Infrastructure

## Overview

This directory contains the unified testing infrastructure for the NeonPro monorepo, featuring modern tools and best practices for comprehensive test coverage.

## Architecture

```
tools/testing/
├── unit/                           # Unit Tests (Vitest)
│   ├── setup.ts                   # Global test setup & configuration
│   └── sample.test.ts             # Example unit tests
├── e2e/                           # End-to-End Tests (Playwright)
│   └── tests/
│       └── homepage.spec.ts       # Example E2E tests
├── mocks/                         # Shared test mocks and fixtures
├── reports/                       # Test reports and coverage output
│   ├── coverage/                  # Coverage reports
│   ├── vitest-results.json       # Vitest results
│   └── playwright-report/        # Playwright HTML reports
├── vitest.config.ts              # Vitest configuration
├── playwright.config.ts          # Playwright configuration
└── README.md                     # This file
```

## Testing Tools

### 🧪 Vitest (Unit & Integration Tests)
- **Purpose**: Fast unit and integration testing
- **Features**: Native ESM, TypeScript support, hot reload
- **Config**: `vitest.config.ts`
- **Location**: `tools/testing/unit/`

### 🎭 Playwright (End-to-End Tests)  
- **Purpose**: Cross-browser E2E testing
- **Features**: Multi-browser, parallel execution, debugging tools
- **Config**: `playwright.config.ts`
- **Location**: `tools/testing/e2e/`

### 🔧 Biome + Ultracite (Code Quality)
- **Purpose**: Linting, formatting, code quality
- **Features**: Lightning-fast, unified toolchain
- **Integration**: Pre-commit hooks via Husky

### 🪝 Husky + lint-staged (Pre-commit Hooks)
- **Purpose**: Automated quality checks before commits
- **Features**: Linting, formatting, type checking, unit tests

## Quick Start

### Prerequisites
```bash
# Install dependencies
pnpm install

# Install Playwright browsers
pnpm exec playwright install
```

### Running Tests

```bash
# Unit tests (Vitest)
pnpm test:unit                     # Run all unit tests
pnpm test:unit:watch              # Watch mode  
pnpm test:coverage                # With coverage

# E2E tests (Playwright)
pnpm test:e2e                     # Run all E2E tests
pnpm test:e2e:headed              # With browser UI
pnpm test:e2e:debug               # Debug mode

# All tests
pnpm test                         # Run all tests

# Quality checks
pnpm lint                         # Lint code
pnpm format                       # Format code
pnpm type-check                   # TypeScript checks
```

### Writing Tests

#### Unit Tests (Vitest)

```typescript
// tools/testing/unit/auth/auth.test.ts
import { describe, it, expect, vi } from 'vitest';

describe('Auth Service', () => {
  it('should authenticate user', () => {
    // Test implementation
    expect(true).toBe(true);
  });
});
```

#### E2E Tests (Playwright)

```typescript
// tools/testing/e2e/tests/login.spec.ts
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[data-testid=email]', 'user@example.com');
  await page.fill('[data-testid=password]', 'password');
  await page.click('[data-testid=submit]');
  
  await expect(page).toHaveURL('/dashboard');
});
```

## Configuration

### Vitest Configuration

**Key Features:**
- **Environment**: jsdom for DOM testing
- **Globals**: Enabled for describe, it, expect
- **Coverage**: v8 provider with 80% thresholds
- **Reports**: JSON, HTML, and console output
- **Aliases**: Proper path resolution for monorepo

**Important Paths:**
```typescript
{
  '@': resolve(__dirname, '../../'),           // Project root
  '@/apps': resolve(__dirname, '../../apps'), // Apps directory
  '@/packages': resolve(__dirname, '../../packages')
}
```

### Playwright Configuration

**Key Features:**
- **Browsers**: Chromium, Firefox, WebKit
- **Parallel**: 8 workers for fast execution
- **Reports**: HTML, JSON, and console output  
- **Web Server**: Auto-starts dev server on port 3000
- **Screenshots**: On failure for debugging

### Pre-commit Hooks

**Configured in `.husky/pre-commit`:**
1. **lint-staged**: Format and lint staged files
2. **Type check**: Ensure TypeScript compilation
3. **Unit tests**: Run fast unit tests

## Scripts

### Package.json Scripts

```json
{
  "test": "pnpm test:unit && pnpm test:e2e",
  "test:unit": "vitest run --config tools/testing/vitest.config.ts",
  "test:unit:watch": "vitest --config tools/testing/vitest.config.ts",
  "test:coverage": "vitest run --coverage --config tools/testing/vitest.config.ts",
  "test:e2e": "playwright test --config tools/testing/playwright.config.ts",
  "test:e2e:headed": "playwright test --config tools/testing/playwright.config.ts --headed",
  "test:e2e:debug": "playwright test --config tools/testing/playwright.config.ts --debug"
}
```

### Quality Scripts

```json
{
  "lint": "biome lint .",
  "lint:fix": "biome lint --apply .",
  "format": "biome format --write .",
  "check": "biome check .",
  "check:fix": "biome check --apply ."
}
```

## Coverage

### Coverage Reports

- **Location**: `tools/testing/reports/coverage/`
- **Formats**: HTML, JSON, LCOV, Text
- **Thresholds**: 80% for branches, functions, lines, statements
- **View**: Open `tools/testing/reports/coverage/index.html`

### Coverage Commands

```bash
# Generate coverage
pnpm test:coverage

# View HTML report  
open tools/testing/reports/coverage/index.html

# CI coverage check
pnpm test:coverage --reporter=json
```

## Migration from Jest

### Current Status
- ✅ Vitest infrastructure complete
- ✅ New test structure working
- 🚧 Jest test migration in progress
- 📋 See `JEST_TO_VITEST_MIGRATION_GUIDE.md`

### Temporarily Excluded
Old Jest tests are temporarily excluded until migration:
- `apps/web/**/__tests__/**`
- `apps/web/**/*.test.{js,ts,jsx,tsx}`

## Debugging

### Vitest Debugging

```bash
# Run specific test
pnpm exec vitest run auth.test.ts

# Debug mode
pnpm exec vitest --inspect-brk

# UI mode (development)
pnpm exec vitest --ui
```

### Playwright Debugging

```bash
# Debug mode
pnpm test:e2e:debug

# Headed mode (see browser)
pnpm test:e2e:headed

# Record tests
pnpm exec playwright codegen localhost:3000
```

### Common Issues

1. **Path resolution errors**: Check aliases in vitest.config.ts
2. **Module not found**: Ensure imports are correct for monorepo
3. **Browser not found**: Run `pnpm exec playwright install`
4. **Port conflicts**: Ensure dev server port is available

## CI/CD Integration

### GitHub Actions

```yaml
- name: Run Tests
  run: |
    pnpm test:unit
    pnpm test:e2e

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./tools/testing/reports/coverage/lcov.info
```

### Quality Gates

All tests must pass before:
- ✅ Merging pull requests
- ✅ Deploying to staging/production
- ✅ Creating releases

## Best Practices

### Unit Testing
- Test business logic thoroughly
- Use descriptive test names
- Mock external dependencies
- Aim for 80%+ coverage

### E2E Testing  
- Test critical user journeys
- Use page object patterns
- Test across browsers
- Keep tests independent

### Performance
- Run unit tests in parallel
- Use selective test running
- Cache dependencies
- Optimize test data

### Maintenance
- Review test failures promptly
- Update tests with feature changes
- Remove obsolete tests
- Monitor test performance

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://testing-library.com/docs/guiding-principles/)
- [Jest to Vitest Migration](https://vitest.dev/guide/migration.html)

## Support

For testing infrastructure questions:
1. Check this README
2. Review configuration files
3. Consult tool documentation  
4. Ask the development team

---

*Last updated: January 2025*