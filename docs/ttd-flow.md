# TDD Flow Protocol - Version: 1.0.0

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
## 🤖 APEX Healthcare Agent Strategy

### **🔄 Intelligent Loading Pattern**

**Always Active** (Base Coordinator):
- **💻 apex-dev** - Full-stack healthcare development and coordination

**On-Demand Activation**:
- **🔬 apex-researcher** - Multi-source research when planning/analyzing
- **🎨 apex-ui-ux-designer** - UI/UX expertise when creating interfaces

### **🎯 Agent Specialization Matrix**

#### **💻 apex-dev.md** - Base Coordinator (Always Active)
```yaml
role: "Full-Stack Healthcare Development + Agent Coordination"
always_active: true
capabilities:
  - Next.js 15 + React 19 + TypeScript development
  - Healthcare compliance (LGPD/ANVISA/CFM) built-in
  - Constitutional principles (KISS/YAGNI/CoT) enforcement
  - Agent coordination and workflow orchestration
  - Production deployment and quality gates
```

#### **🔬 apex-researcher.md** - Research Intelligence (On-Demand)
```yaml
role: "Multi-Source Research and Healthcare Compliance"
activation_triggers: ["research", "analyze", "investigate", "pesquisar", "analisar", "planejar"]
capabilities:
  - Context7 → Tavily → Exa intelligence chain
  - Healthcare documentation and regulatory research
  - LGPD/ANVISA/CFM compliance validation
  - Medical best practices and technology evaluation
  - Evidence-based implementation guidance
```

#### **🎨 apex-ui-ux-designer.md** - Design Excellence (On-Demand)
```yaml
role: "Healthcare UI/UX with Constitutional Accessibility"
activation_triggers: ["design", "ui", "ux", "interface", "página", "componente", "acessibilidade"]
capabilities:
  - WCAG 2.1 AA+ accessibility compliance
  - shadcn/ui v4 healthcare optimization
  - Patient-centered design patterns
  - Emergency scenario interface design
  - Mobile-first responsive healthcare interfaces
```

## 🛠️ Ruler Integration - Optimized Configuration

### **ruler.toml Configuration**
```toml
# OPTIMIZED: Only APEX Healthcare Agents
# GitHub Copilot handles claude/copilot/trae automatically
default_agents = ["apex-dev"]

[agents.apex-dev]
enabled = true
output_path = ".claude/agents/apex-dev.md"
source_path = ".ruler/agents/apex-dev.md"
description = "Always Active - Base Healthcare Development Coordinator"

[agents.apex-researcher]
enabled = true
output_path = ".claude/agents/apex-researcher.md"
source_path = ".ruler/agents/apex-researcher.md"
description = "On-Demand - Research and Compliance Intelligence"

[agents.apex-ui-ux-designer]
enabled = true
output_path = ".claude/agents/apex-ui-ux-designer.md"
source_path = ".ruler/agents/apex-ui-ux-designer.md"
description = "On-Demand - Healthcare Interface Design Excellence"
```

### **Usage Commands**
```bash
# Generate base coordinator (apex-dev always active)
ruler

# Activate researcher for planning/analysis tasks
ruler --agents apex-dev,apex-researcher

# Activate UI/UX designer for interface work
ruler --agents apex-dev,apex-ui-ux-designer

# Full healthcare team activation
ruler --agents apex-dev,apex-researcher,apex-ui-ux-designer
```

## 🏥 Workflow Orchestration

#### **Research & Planning Phase**
```bash
# Triggers: research, analyze, investigate, pesquisar, analisar, planejar
ruler --agents apex-dev,apex-researcher
```
- **apex-dev**: Coordinates research with development context
- **apex-researcher**: Multi-source intelligence (Context7 → Tavily → Exa)
- **Focus**: Compliance validation, best practices, evidence-based decisions

#### **UI/UX Development Phase**
```bash
# Triggers: design, ui, ux, interface, página, componente, acessibilidade
ruler --agents apex-dev,apex-ui-ux-designer
```
- **apex-dev**: Provides technical implementation context
- **apex-ui-ux-designer**: Healthcare accessibility and design expertise
- **Focus**: WCAG 2.1 AA+, patient-centered design, emergency scenarios

#### **Core Development Phase**
```bash
# Default: apex-dev always active
ruler --agents apex-dev
```
- **apex-dev**: Full-stack healthcare development
- **Focus**: Constitutional principles, compliance, quality gates

## 📚 Benefits of Optimized Strategy

### **🚀 Performance Improvements**
- **Reduced Overhead**: Eliminates redundant configurations
- **Contextual Loading**: Specialists activate only when needed
- **Intelligent Coordination**: apex-dev orchestrates team efficiently

### **🎯 Focus Enhancement**
- **Healthcare Specialization**: All agents optimize for medical workflows
- **Constitutional Principles**: Consistent quality and compliance
- **On-Demand Expertise**: Right specialist for the right task

### **🔧 Maintenance Simplification**
- **Single Source**: Only APEX agents in Ruler configuration
- **Auto-Loading**: Copilot and Claude code handles its own configurations
- **Clear Separation**: Healthcare vs general development concerns

## 📚 References

- **🌟 Complete Workflow**: [`.ruler/dev-workflow.md`](../.ruler/dev-workflow.md)
- **⚙️ Always Follow Project Standards**: [`docs/project.md`](../docs/project.md)

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
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { functionToTest } from "@/path/to/module";

// Mock dependencies with Vitest
vi.mock("@/lib/external-service", () => ({
  method: vi.fn(),
}));

describe("ModuleName", () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  describe("Success Cases", () => {
    it("should handle valid input", () => {
      // Arrange
      const input = "valid";

      // Act
      const result = functionToTest(input);

      // Assert
      expect(result).toBe("expected");
    });
  });

  describe("Error Cases", () => {
    it("should throw on invalid input", () => {
      expect(() => functionToTest(null)).toThrow();
    });
  });

  describe("Edge Cases", () => {
    it("should handle boundary values", () => {
      // Test edge cases
    });
  });
});
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
import { vi } from "vitest";

// External service mock
vi.mock("@/lib/service", () => ({
  method: vi.fn(),
  asyncMethod: vi.fn().mockResolvedValue("success"),
}));

// Supabase mock
const mockSupabase = {
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  }),
};

vi.mock("@/lib/supabase", () => ({
  supabase: mockSupabase,
}));

// React hooks mock
vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    useState: vi.fn(),
    useEffect: vi.fn(),
  };
});

// Next.js router mock
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  })),
  usePathname: vi.fn(() => "/"),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));
```

### Playwright E2E Test Patterns

```typescript
import { test, expect, Page } from "@playwright/test";

// Page Object Model
class PatientPage {
  constructor(private page: Page) {}

  async navigateToPatients() {
    await this.page.goto("/patients");
  }

  async createPatient(data: PatientData) {
    await this.page.fill('[data-testid="patient-name"]', data.name);
    await this.page.fill('[data-testid="patient-cpf"]', data.cpf);
    await this.page.click('[data-testid="save-patient"]');
  }

  async expectPatientVisible(name: string) {
    await expect(this.page.locator(`text=${name}`)).toBeVisible();
  }
}

// Usage in test
test("should create new patient", async ({ page }) => {
  const patientPage = new PatientPage(page);
  
  await patientPage.navigateToPatients();
  await patientPage.createPatient({
    name: "João Silva",
    cpf: "123.456.789-00"
  });
  
  await patientPage.expectPatientVisible("João Silva");
});
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
});
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
    "test:integration": "vitest run --config vitest.integration.config.ts",
    "test:integration:watch": "vitest --config vitest.integration.config.ts"
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
});
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
});
```

## Common Issues & Solutions

### Vitest + TypeScript Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

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
});
```

### Mock Issues & Solutions

```typescript
// ❌ Wrong - Jest syntax
jest.mock("module", () => ({}));

// ✅ Correct - Vitest syntax
vi.mock("module", () => ({
  default: vi.fn(),
  namedExport: vi.fn(),
}));

// ❌ Wrong - Missing async for dynamic imports
vi.mock("react", () => ({
  useState: vi.fn(),
}));

// ✅ Correct - Proper async handling
vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    useState: vi.fn(),
  };
});
```

### Playwright Common Issues

```typescript
// ❌ Wrong - Flaky selectors
await page.click('button');

// ✅ Correct - Specific test IDs
await page.click('[data-testid="submit-button"]');

// ❌ Wrong - No wait for navigation
await page.click('[data-testid="login"]');
await page.fill('[data-testid="username"]', 'user');

// ✅ Correct - Wait for navigation
await page.click('[data-testid="login"]');
await page.waitForURL('/dashboard');
await page.fill('[data-testid="username"]', 'user');
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
  "excludes": [
    "test-results/**",
    "playwright-report/**",
    "coverage/**"
  ]
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
});
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
      args: ['--disable-web-security', '--disable-features=VizDisplayCompositor'],
    },
  },
  
  // Optimize projects
  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    // Only run mobile tests when needed
    ...(process.env.MOBILE_TESTS ? [{
      name: 'mobile-android',
      use: { ...devices['Pixel 5'] },
    }] : []),
  ],
});
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
  const items = [{ price: 10 }, { price: 20 }];
  
  // Act - direct function call
  const total = calculateTotal(items);
  
  // Assert - simple assertion
  expect(total).toBe(30);
});

// Slow test - avoid in unit tests
test.skip('should handle large dataset', async () => {
  const largeDataset = Array.from({ length: 10000 }, (_, i) => ({ id: i }));
  const result = await processLargeDataset(largeDataset);
  expect(result).toBeDefined();
});
```

Follow this protocol to maintain high code quality through systematic testing.
