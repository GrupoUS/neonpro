# 🧪 Test Agent Orchestration Guide (docs/agents/test.md)

## 🧠 Intelligent Testing Context Engineering

- Purpose: Central navigation for testing docs (do not duplicate content here)
- Mission: Route AI agents and developers to the right testing guide fast
- Principle: Minimal context loading → precise document selection → efficient QA

> Note: Detailed rules, code samples, and configs live under `docs/testing/`. This file orchestrates and links to those authoritative sources.

## 📚 Testing Documentation Matrix

### React Component Testing

- **⚛️ @react-tests**: [docs/testing/react-test-patterns.md](../testing/react-test-patterns.md)
  - One‑line: Patterns and best practices for testing React components (unit/integration, a11y, performance)
  - Use when: Writing tests for components, hooks, forms, and UI accessibility
  - Metadata:
    ```yaml
    role: "React Testing Patterns"
    triggers: ["react", "component", "hook", "a11y", "integration"]
    outputs:
      ["test structure", "mocks/fixtures", "a11y checks", "performance tests"]
    ```

### End-to-End (E2E) Testing

- **🎭 @e2e-testing**: [docs/testing/e2e-testing.md](../testing/e2e-testing.md)
  - One‑line: Playwright patterns for patient workflows, appointments, AI chat, a11y, and mobile
  - Use when: Validating cross-layer user flows with accessibility and mobile responsiveness
  - Metadata:
    ```yaml
    role: "Playwright E2E Testing"
    triggers: ["e2e", "playwright", "flows", "a11y", "mobile"]
    outputs: ["end-to-end flows", "a11y checks", "device coverage"]
    ```

### Integration Testing

- **🔗 @integration-testing**: [docs/testing/integration-testing.md](../testing/integration-testing.md)
  - One‑line: Integration test strategy for APIs, database, realtime, and AI integrations
  - Use when: Validating contracts between modules and external systems
  - Metadata:
    ```yaml
    role: "Integration Testing Strategy"
    triggers: ["integration", "api", "database", "realtime", "ai"]
    outputs: ["contracts", "data integrity", "auth/RLS validation"]
    ```

### CI Pipelines

- **⚙️ @ci-pipelines**: [docs/testing/ci-pipelines.md](../testing/ci-pipelines.md)
  - One‑line: CI/CD pipeline stages, quality gates, artifacts, and failure criteria
  - Use when: Configuring automated testing workflows and enforcement
  - Metadata:
    ```yaml
    role: "CI/CD Testing Pipeline"
    triggers: ["ci", "pipeline", "quality gates", "github actions"]
    outputs: ["stages", "artifacts", "failure criteria"]
    ```

### Coverage Policy

- **📈 @coverage-policy**: [docs/testing/coverage-policy.md](../testing/coverage-policy.md)
  - One‑line: Coverage thresholds by component type with healthcare compliance
  - Use when: Enforcing coverage in CI and during PR reviews
  - Metadata:
    ```yaml
    role: "Coverage Requirements & Enforcement"
    triggers: ["coverage", "thresholds", "policy", "compliance"]
    outputs: ["targets", "reporting", "exemptions"]
    ```

### Code Review & Quality Gates

- **🧰 @code-review**: [docs/testing/code-review-checklist.md](../testing/code-review-checklist.md)
  - One‑line: Comprehensive code review checklist with healthcare compliance
  - Use when: Performing PR reviews, verifying security, compliance, and coverage
  - Metadata:
    ```yaml
    role: "Code Review & Compliance Checklist"
    triggers: ["review", "checklist", "security", "compliance", "coverage"]
    outputs: ["review steps", "security checks", "coverage targets"]
    ```

## 📚 References (correct link format)

- **⚛️ @react-tests**: [docs/testing/react-test-patterns.md](../testing/react-test-patterns.md)
- **🎭 @e2e-testing**: [docs/testing/e2e-testing.md](../testing/e2e-testing.md)
- **🔗 @integration-testing**: [docs/testing/integration-testing.md](../testing/integration-testing.md)
- **⚙️ @ci-pipelines**: [docs/testing/ci-pipelines.md](../testing/ci-pipelines.md)
- **📈 @coverage-policy**: [docs/testing/coverage-policy.md](../testing/coverage-policy.md)
- **🧰 @code-review**: [docs/testing/code-review-checklist.md](../testing/code-review-checklist.md)

## 🔄 Orchestrated Testing Workflows

### TDD Cycle (Red → Green → Refactor)

```yaml
workflow: "TDD for Features"
sequence:
  1. Define behavior → write failing test (RED)
  2. Implement minimal code to pass (GREEN)
  3. Refactor with tests green (REFACTOR)
references:
  - @react-tests → "Test structure, mocks, fixtures, a11y"
  - @code-review → "Quality gates before merge"
```

### PR Quality Gates

```yaml
workflow: "Pre-merge Quality"
sequence: 1. Unit/Integration tests passing
  2. Coverage thresholds met (see @code-review)
  3. A11y checks for UI components (@react-tests)
  4. Security/compliance checklist (@code-review)
```

## 🧭 Navigation Commands

```bash
# Component & Hook testing
@react-tests "padrões para componentes"
@react-tests "mocks, fixtures e providers"
@react-tests "acessibilidade (WCAG)"

# Code review & compliance
@code-review "checklist completo"
@code-review "segurança e LGPD"
@code-review "cobertura mínima"
```

## 🧠 Context Strategy

```yaml
CONTEXT_STRATEGY:
  minimal_loading: "Carregue apenas 1-2 arquivos por tarefa"
  when_to_load:
    componentes_react: [@react-tests]
    acessibilidade: [@react-tests]
    code_review: [@code-review]
    compliance: [@code-review]
```

## 🧩 Agent Identity (TDD Specialist)

```yaml
role: "Test-Driven Development & Quality Orchestration"
triggers: ["test", "tests", "tdd", "quality", "coverage", "ci"]
capabilities:
  - Route to authoritative testing docs (no duplication here)
  - Enforce TDD workflow and quality gates via references
  - Promote a11y, performance, and compliance testing
  - Orchestrate CI-friendly testing flows
```

---

Legacy appendix below is deprecated. For rules, patterns, or code examples, use the links above in `docs/testing/`. This file now focuses on navigation and orchestration only.

# Tester Agent Mode

## Purpose

Defines Test-Driven Development workflow for TypeScript/Jest projects. Follow this protocol to ensure quality code through testing.

## TDD Cycle (Red-Green-Refactor)

1. **RED**: Write failing test first
2. **GREEN**: Write minimal code to pass
3. **REFACTOR**: Improve code while keeping tests green

## Test Priority

```
🔥 CRITICAL (Must Test)
├── Business logic (payments, credits, limits)
├── AI agents (core functionality)
├── Public APIs (user-facing)
└── Financial operations

⚡ IMPORTANT (Should Test)
├── Complex hooks (state management)
├── Core utilities (widely used)
├── Data validation (schemas)
└── External integrations
```

## Decision Framework

**Test if:**

- Contains business logic
- Handles money/credits
- Processes user data
- Integrates external services
- Complex state management
- Used in multiple places

**Don't test:**

- Pure constants
- Simple getters/setters
- Third-party wrappers (without logic)

## TDD Workflow

1. **Understand requirement**
2. **Write failing test** (describe expected behavior)
3. **Run test** (should fail - RED)
4. **Write minimal code** to pass test
5. **Run test** (should pass - GREEN)
6. **Refactor** code while keeping tests green
7. **Repeat** for next requirement

## Test Structure Template

```typescript
import { functionToTest } from '@/path/to/module'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock dependencies with Vitest
vi.mock('@/lib/external-service', () => ({
  method: vi.fn(),
}))

describe('ModuleName', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()
  })

  describe('Success Cases', () => {
    it('should handle valid input', () => {
      // Arrange
      const input = 'valid'

      // Act
      const result = functionToTest(input)

      // Assert
      expect(result).toBe('expected')
    })
  })

  describe('Error Cases', () => {
    it('should throw on invalid input', () => {
      expect(() => functionToTest(null)).toThrow()
    })
  })

  describe('Edge Cases', () => {
    it('should handle boundary values', () => {
      // Test edge cases
    })
  })
})
```

## File Organization

```
tools/
├── tests/           # Unit & Integration tests (Vitest)
│   ├── core/        # Core business logic tests
│   ├── components/  # React component tests
│   ├── hooks/       # Custom hooks tests
│   ├── services/    # Service layer tests
│   ├── utils/       # Utility function tests
│   └── api/         # API endpoint tests
├── e2e/             # End-to-end tests (Playwright)
│   ├── auth/        # Authentication flows
│   ├── patient/     # Patient management flows
│   ├── mobile/      # Mobile-specific tests
│   └── fixtures/    # Test data and fixtures
└── reports/         # Test reports and coverage
    ├── unit/        # Vitest coverage reports
    ├── e2e/         # Playwright test reports
    └── performance/ # Performance metrics
```

## Mock Patterns

### Vitest Unit Test Mocks

```typescript
import { vi } from 'vitest'

// External service mock
vi.mock('@/lib/service', () => ({
  method: vi.fn(),
  asyncMethod: vi.fn().mockResolvedValue('success'),
}))

// Supabase mock
const mockSupabase = {
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  }),
}

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}))

// React hooks mock
vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return {
    ...actual,
    useState: vi.fn(),
    useEffect: vi.fn(),
  }
})

// Next.js router mock
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}))
```

### Playwright E2E Test Patterns

```typescript
import { expect, Page, test } from '@playwright/test'

// Page Object Model
class PatientPage {
  constructor(private page: Page) {}

  async navigateToPatients() {
    await this.page.goto('/patients')
  }

  async createPatient(data: PatientData) {
    await this.page.fill('[data-testid="patient-name"]', data.name)
    await this.page.fill('[data-testid="patient-cpf"]', data.cpf)
    await this.page.click('[data-testid="save-patient"]')
  }

  async expectPatientVisible(name: string) {
    await expect(this.page.locator(`text=${name}`)).toBeVisible()
  }
}

// Usage in test
test('should create new patient', async ({ page }) => {
  const patientPage = new PatientPage(page)

  await patientPage.navigateToPatients()
  await patientPage.createPatient({
    name: 'João Silva',
    cpf: '123.456.789-00',
  })

  await patientPage.expectPatientVisible('João Silva')
})
```

## Test Categories (Required)

1. **Success Cases**: Happy path, valid inputs
2. **Error Cases**: Invalid inputs, failures
3. **Edge Cases**: Boundary values, null/empty
4. **Business Logic**: Rules, calculations, conditions

## Coverage Requirements

- **Unit Tests**: 90%+ coverage (Vitest)
- **Integration Tests**: 80%+ coverage (Vitest)
- **E2E Tests**: Critical user flows (Playwright)
- **Business Logic**: 95%+ coverage
- **Component Tests**: 85%+ coverage
- **API Tests**: 90%+ coverage

### Coverage Configuration (vitest.config.ts)

```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 80,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        'packages/patient-management/**': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
      },
    },
  },
})
```

## Scripts

### Unit & Integration Tests (Vitest)

```json
{
  "scripts": {
    "test:unit": "vitest run",
    "test:unit:watch": "vitest",
    "test:unit:ui": "vitest --ui",
    "test:unit:coverage": "vitest run --coverage",
    "test:integration": "vitest run --config vitest.config.integration.ts",
    "test:integration:watch": "vitest --config vitest.config.integration.ts"
  }
}
```

### E2E Tests (Playwright)

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:install": "playwright install"
  }
}
```

### Code Quality (OXC Oxlint + Dprint)

```json
{
  "scripts": {
    "lint": "oxlint .",
    "lint:fix": "oxlint . --fix",
    "format": "dprint fmt",
    "format:check": "dprint check",
    "type-check": "tsc --noEmit"
  }
}
```

### Combined Quality Checks

```json
{
  "scripts": {
    "ci:check": "pnpm type-check && pnpm lint && pnpm format:check && pnpm test:unit && pnpm test:e2e",
    "ci:fix": "pnpm lint:fix && pnpm format && pnpm type-check",
    "test:all": "pnpm test:unit && pnpm test:integration && pnpm test:e2e",
    "test:safe": "pnpm ci:check"
  }
}
```

## Quality Checklist

### Pre-commit Checks

- [ ] **Type Safety**: `pnpm type-check` passes
- [ ] **Code Quality**: `pnpm lint` passes (OXC Oxlint)
- [ ] **Code Formatting**: `pnpm format:check` passes (Dprint)
- [ ] **Unit Tests**: `pnpm test:unit` passes (Vitest)
- [ ] **Coverage**: Meets thresholds (90%+ unit, 80%+ integration)

### Pre-push Checks

- [ ] **Integration Tests**: `pnpm test:integration` passes
- [ ] **E2E Tests**: `pnpm test:e2e` passes (Playwright)
- [ ] **Performance**: No regressions in critical paths
- [ ] **Accessibility**: WCAG compliance maintained
- [ ] **Mobile**: Responsive design validated

### CI/CD Pipeline

- [ ] **Full Suite**: `pnpm ci:check` passes
- [ ] **Build**: Production build succeeds
- [ ] **Security**: No vulnerabilities detected
- [ ] **Bundle Size**: Within acceptable limits

### Quality Gates

```typescript
// vitest.config.ts - Enforce quality thresholds
export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        global: {
          branches: 80,
          functions: 90,
          lines: 90,
          statements: 90,
        },
      },
    },
    // Fail fast on first test failure in CI
    bail: process.env.CI ? 1 : 0,
  },
})
```

```typescript
// playwright.config.ts - E2E quality gates
export default defineConfig({
  // Fail fast in CI
  fullyParallel: !process.env.CI,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,

  // Performance budgets
  use: {
    // Simulate slow network in CI
    launchOptions: {
      slowMo: process.env.CI ? 100 : 0,
    },
  },
})
```

## Common Issues & Solutions

### Vitest + TypeScript Configuration

```typescript
// vitest.config.ts
import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tools/tests/setup.ts'],
    include: [
      'tools/tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'packages/patient-management/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/components': path.resolve(__dirname, './components'),
    },
  },
})
```

### Mock Issues & Solutions

```typescript
// ❌ Wrong - Jest syntax
jest.mock('module', () => ({}))

// ✅ Correct - Vitest syntax
vi.mock('module', () => ({
  default: vi.fn(),
  namedExport: vi.fn(),
}))

// ❌ Wrong - Missing async for dynamic imports
vi.mock('react', () => ({
  useState: vi.fn(),
}))

// ✅ Correct - Proper async handling
vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return {
    ...actual,
    useState: vi.fn(),
  }
})
```

### Playwright Common Issues

```typescript
// ❌ Wrong - Flaky selectors
await page.click('button')

// ✅ Correct - Specific test IDs
await page.click('[data-testid="submit-button"]')

// ❌ Wrong - No wait for navigation
await page.click('[data-testid="login"]')
await page.fill('[data-testid="username"]', 'user')

// ✅ Correct - Wait for navigation
await page.click('[data-testid="login"]')
await page.waitForURL('/dashboard')
await page.fill('[data-testid="username"]', 'user')
```

### OXC Oxlint Configuration Issues

```json
// .oxlintrc.json - Common fixes
{
  "rules": {
    // Disable problematic rules for tests
    "no-unused-vars": "off",
    "@typescript-eslint/no-explicit-any": "off"
  },
  "overrides": [
    {
      "files": ["**/*.test.ts", "**/*.spec.ts"],
      "rules": {
        "no-magic-numbers": "off",
        "max-lines-per-function": "off"
      }
    }
  ]
}
```

### Dprint Formatting Issues

```json
// dprint.json - Test file handling
{
  "typescript": {
    "quoteStyle": "double",
    "semiColons": "always"
  },
  "includes": [
    "**/*.{ts,tsx,js,jsx}",
    "tools/tests/**/*.ts",
    "tools/e2e/**/*.ts"
  ],
  "excludes": ["test-results/**", "playwright-report/**", "coverage/**"]
}
```

## Performance Optimization

### Vitest Performance

```typescript
// vitest.config.ts - Performance optimizations
export default defineConfig({
  test: {
    // Enable parallel execution
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
      },
    },
    // Faster test discovery
    passWithNoTests: true,
    // Optimize coverage
    coverage: {
      provider: 'v8', // Faster than c8
      reporter: ['text-summary', 'html'],
      skipFull: true,
    },
  },
})
```

### Playwright Performance

```typescript
// playwright.config.ts - Performance settings
export default defineConfig({
  // Parallel execution
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,

  // Faster test execution
  use: {
    // Reduce action timeout
    actionTimeout: 10000,
    // Disable animations
    launchOptions: {
      args: [
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
      ],
    },
  },

  // Optimize projects
  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    // Only run mobile tests when needed
    ...(process.env.MOBILE_TESTS
      ? [
        {
          name: 'mobile-android',
          use: { ...devices['Pixel 5'] },
        },
      ]
      : []),
  ],
})
```

### Test Performance Best Practices

- **Keep unit tests fast** (< 50ms each)
- **Mock external dependencies** (APIs, databases)
- **Use `test.skip`** for slow/flaky tests during development
- **Parallel execution** enabled by default
- **Selective test running** with `--changed` flag
- **Coverage optimization** with `skipFull: true`

```typescript
// Fast test example
test('should calculate total quickly', () => {
  // Arrange - minimal setup
  const items = [{ price: 10 }, { price: 20 }]

  // Act - direct function call
  const total = calculateTotal(items)

  // Assert - simple assertion
  expect(total).toBe(30)
})

// Slow test - avoid in unit tests
test.skip('should handle large dataset', async () => {
  const largeDataset = Array.from({ length: 10000 }, (_, i) => ({ id: i }))
  const result = await processLargeDataset(largeDataset)
  expect(result).toBeDefined()
})
```

Follow this protocol to maintain high code quality through systematic testing.
