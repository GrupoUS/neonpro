# Jest to Vitest Migration Guide

## Overview

This guide outlines the migration of existing Jest tests to Vitest in the NeonPro monorepo. The
migration will modernize our testing infrastructure and provide better performance and developer
experience.

## Current Status

### ✅ Completed

- Vitest configuration created at `tools/testing/vitest.config.ts`
- Test environment set up with jsdom
- Sample tests working in `tools/testing/unit/`
- Coverage reporting configured
- HTML and JSON reports enabled

### 🚧 In Progress

- Migration of existing Jest tests to Vitest structure

### ❌ Temporarily Disabled

The following Jest-based test files have been temporarily excluded from Vitest runs:

- `apps/web/**/__tests__/**`
- `apps/web/**/*.test.{js,ts,jsx,tsx}`
- `apps/web/**/*.spec.{js,ts,jsx,tsx}`
- `apps/web/lib/**/*.test.{js,ts,jsx,tsx}`
- `apps/web/app/**/*.test.{js,ts,jsx,tsx}`

## Migration Steps

### 1. Import Changes

**Before (Jest):**

```typescript
import { jest } from "@jest/globals";
import { describe, expect, it } from "@jest/globals";
```

**After (Vitest):**

```typescript
import { describe, expect, it, vi } from "vitest";
// Note: globals are enabled, so these imports are optional
```

### 2. Mock Syntax Changes

**Before (Jest):**

```typescript
jest.mock("@/app/utils/supabase/client", () => ({
  createClient: jest.fn(),
}));

const mockFn = jest.fn();
jest.spyOn(object, "method");
```

**After (Vitest):**

```typescript
vi.mock("@/app/utils/supabase/client", () => ({
  createClient: vi.fn(),
}));

const mockFn = vi.fn();
vi.spyOn(object, "method");
```

### 3. Path Resolution

The new Vitest config includes proper path aliases:

- `@` → Project root
- `@/apps` → apps directory
- `@/packages` → packages directory
- `@/tools` → tools directory

### 4. Test File Organization

**New Structure:**

```
tools/testing/
├── unit/                    # Unit tests
│   ├── setup.ts            # Global test setup
│   └── **/*.test.ts        # Unit test files
├── e2e/                     # E2E tests (Playwright)
│   └── tests/
├── reports/                 # Test reports and coverage
├── mocks/                   # Shared test mocks
├── vitest.config.ts        # Vitest configuration
└── playwright.config.ts    # Playwright configuration
```

## Migration Priority

### High Priority (Core functionality)

1. Authentication and authorization tests
2. LGPD compliance tests
3. Medical records tests
4. Stock management tests

### Medium Priority (Services)

1. Consent service tests
2. Stock alert service tests
3. Connection pool tests

### Low Priority (Components)

1. UI component tests
2. Integration tests

## Migration Process

### For Each Test File:

1. **Create new test file** in `tools/testing/unit/[domain]/[feature].test.ts`

2. **Update imports:**

   ```typescript
   // Remove Jest imports
   - import { jest } from "@jest/globals";

   // Add Vitest imports (if not using globals)
   + import { vi } from "vitest";
   ```

3. **Update mocks:**

   ```typescript
   // Replace jest with vi
   - jest.mock(...)
   + vi.mock(...)

   - jest.fn()
   + vi.fn()
   ```

4. **Fix import paths:**
   - Use proper aliases from vitest.config.ts
   - Ensure all imported modules exist

5. **Test the migration:**
   ```bash
   pnpm test:unit
   ```

## Benefits of Vitest

- **Faster**: Native ESM support and faster test execution
- **Better DX**: Hot reload, better error messages, UI mode
- **TypeScript**: Native TypeScript support without transpilation
- **Vite Integration**: Seamless integration with Vite ecosystem
- **Jest Compatible**: Most Jest APIs work with minimal changes

## Commands

```bash
# Run unit tests
pnpm test:unit

# Run with coverage
pnpm test:coverage

# Run with UI (development)
pnpm exec vitest --ui

# Run specific test file
pnpm exec vitest run tools/testing/unit/auth/auth.test.ts
```

## Next Steps

1. **Enable Vitest config include paths** after migration:

   ```typescript
   include: [
     "tools/testing/unit/**/*.{test,spec}.{js,ts,jsx,tsx}",
     "apps/**/*.{test,spec}.{js,ts,jsx,tsx}", // Re-enable
     "packages/**/*.{test,spec}.{js,ts,jsx,tsx}", // Re-enable
   ];
   ```

2. **Remove Jest dependencies** from package.json
3. **Update CI/CD pipelines** to use Vitest
4. **Document new testing patterns** and best practices

## Support

For migration help:

1. Check this guide
2. Review working examples in `tools/testing/unit/`
3. Consult [Vitest documentation](https://vitest.dev/)
4. Check [Jest to Vitest migration guide](https://vitest.dev/guide/migration.html)
