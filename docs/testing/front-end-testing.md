---
title: "Frontend Testing Guide - React, Router & E2E"
last_updated: 2025-09-16
form: how-to
tags: [frontend, react, testing, e2e, accessibility, healthcare]
agent_coordination:
  primary: code-reviewer
  support: [architect-review, test]
  validation: [component-patterns, accessibility, healthcare-ui]
related:
  - ./AGENTS.md
  - ./backend-architecture-testing.md
  - ../agents/code-review/code-reviewer.md
---

# Frontend Testing Guide - React, Router & E2E — Version: 3.0.0

## Overview

Comprehensive frontend testing strategy for React 19 applications with TanStack Router, covering component testing, routing, accessibility (WCAG), and end-to-end scenarios. Coordinated by **code-reviewer** agent with healthcare UI compliance validation.

**Target Audience**: Frontend developers, QA engineers, UI/UX teams
**Agent Coordinator**: `code-reviewer.md` with accessibility and healthcare UI validation

## Prerequisites

- React 19 with TypeScript
- TanStack Router v1.x
- Vitest + Testing Library
- Playwright for E2E
- Healthcare UI compliance (WCAG 2.1 AA+)
- NeonPro design system components

## Quick Start

### Basic Component Test Setup

```typescript
// apps/web/src/components/Button/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders with correct label', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

## Component Testing Patterns

### 1. Estrutura de Arquivos

```
apps/web/src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx           # Unit tests
│   │   └── Button.stories.tsx        # Storybook
│   ├── PatientCard/
│   │   ├── PatientCard.tsx
│   │   ├── PatientCard.test.tsx
│   │   └── PatientCard.integration.test.tsx  # Integration tests
│   └── forms/
│       ├── PatientForm.tsx
│       ├── PatientForm.test.tsx
│       └── PatientForm.a11y.test.tsx  # Accessibility tests
└── test/
    ├── setup.ts                      # Test configuration
    ├── utils/                        # Testing utilities
    └── fixtures/                     # Test data
```

### 2. Convenções de Nomenclatura

- **Unit tests**: `Component.test.tsx`
- **Integration tests**: `Component.integration.test.tsx`
- **Accessibility tests**: `Component.a11y.test.tsx`
- **E2E tests**: `feature.e2e.test.ts`

### 3. Healthcare Component Testing

````typescript
// Healthcare-specific component testing patterns
import { render, screen } from '@testing-library/react';
import { PatientCard } from './PatientCard';
import { createMockPatient } from '@/test/fixtures/patient';

describe('PatientCard - Healthcare Compliance', () => {
  const mockPatient = createMockPatient({
    name: 'João Silva',
    cpf: '***.***.***-12', // Masked for privacy
    condition: 'Diabetes Tipo 2'
  });

  it('displays patient info with LGPD compliance', () => {
    render(<PatientCard patient={mockPatient} />);

    // Verify sensitive data is properly masked
    expect(screen.getByText(/\*\*\*\.\*\*\*\.\*\*\*-12/)).toBeInTheDocument();
    expect(screen.queryByText(/\d{3}\.\d{3}\.\d{3}-\d{2}/)).not.toBeInTheDocument();
  });

  it('meets accessibility requirements', async () => {
    render(<PatientCard patient={mockPatient} />);

    // WCAG compliance checks
    expect(screen.getByRole('article')).toHaveAttribute('aria-label');
    expect(screen.getByText('João Silva')).toBeInTheDocument();

    // Color contrast and focus management
    const card = screen.getByRole('article');
    expect(card).toHaveClass('focus-visible:ring-2');
  });
});
```## TanStack Router Testing

### 1. Route Component Testing

```typescript
// apps/web/src/routes/patients/$patientId.test.tsx
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from '@tanstack/react-router';
import { Route } from './$patientId';

const createTestRouter = (patientId: string) => {
  return createMemoryRouter({
    routes: [Route],
    history: [`/patients/${patientId}`]
  });
};

describe('Patient Detail Route', () => {
  it('renders patient detail data', async () => {
    const router = createTestRouter('123');
    render(<RouterProvider router={router} />);

    expect(await screen.findByText(/Paciente/)).toBeInTheDocument();
    expect(screen.getByText(/Detalhes/)).toBeInTheDocument();
  });

  it('handles invalid patient ID', async () => {
    const router = createTestRouter('invalid');
    render(<RouterProvider router={router} />);

    expect(await screen.findByText(/Paciente não encontrado/)).toBeInTheDocument();
  });
});
````

### 2. Loader & Search Params Testing

```typescript
// Test route loaders and search parameters
import { Route } from "./patients/index";

describe("Patients List Route", () => {
  it("validates search params schema", () => {
    const validParams = { search: "João", page: "1" };
    const result = Route.validateSearch(validParams);

    expect(result.search).toBe("João");
    expect(result.page).toBe(1);
  });

  it("handles loader with mock data", async () => {
    const mockLoader = vi.fn().mockResolvedValue({
      patients: [{ id: "1", name: "João Silva" }],
      total: 1,
    });

    Route.loader = mockLoader;
    const result = await Route.loader({ params: {}, search: {} });

    expect(result.patients).toHaveLength(1);
    expect(mockLoader).toHaveBeenCalledOnce();
  });
});
```

### 3. Navigation Testing

```typescript
// Test navigation and link behavior
import { render, screen, fireEvent } from '@testing-library/react';
import { Link } from '@tanstack/react-router';
import { PatientsList } from './PatientsList';

describe('Navigation Tests', () => {
  it('navigates to patient detail on card click', async () => {
    const mockNavigate = vi.fn();
    render(
      <PatientsList
        patients={mockPatients}
        onNavigate={mockNavigate}
      />
    );

    const patientCard = screen.getByTestId('patient-card-1');
    fireEvent.click(patientCard);

    expect(mockNavigate).toHaveBeenCalledWith('/patients/1');
  });

  it('preserves search params during navigation', () => {
    render(
      <Link
        to="/patients/$patientId"
        params={{ patientId: '1' }}
        search={{ from: 'dashboard' }}
      >
        View Patient
      </Link>
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/patients/1?from=dashboard');
  });
});
```

## End-to-End Testing

### 1. Playwright Setup for Healthcare

```typescript
// playwright.config.ts - Healthcare optimized
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",

  // Healthcare-specific settings
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    // LGPD compliance - no sensitive data in screenshots
    video: "retain-on-failure",
    actionTimeout: 15000, // Healthcare apps can be slower
  },

  projects: [
    {
      name: "healthcare-chrome",
      use: {
        ...devices["Desktop Chrome"],
        // Simulate healthcare professional environment
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 1,
      },
    },
    {
      name: "healthcare-mobile",
      use: {
        ...devices["iPhone 13"],
        // Mobile healthcare scenarios
      },
    },
  ],
});
```

### 2. Patient Management E2E Flow

````typescript
// tests/e2e/patient-management.e2e.test.ts
import { test, expect } from '@playwright/test';

test.describe('Patient Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Login as healthcare professional
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'doctor@clinic.com');
    await page.fill('[data-testid="password"]', 'secure-password');
    await page.click('[data-testid="login-button"]');

    // Verify login success
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
  });

  test('complete patient registration flow', async ({ page }) => {
    // Navigate to patient registration
    await page.click('[data-testid="new-patient-button"]');

    // Fill patient form
    await page.fill('[data-testid="patient-name"]', 'Maria Santos');
    await page.fill('[data-testid="patient-cpf"]', '123.456.789-00');
    await page.selectOption('[data-testid="patient-gender"]', 'F');
    await page.fill('[data-testid="patient-birthdate"]', '1985-06-15');

    // Healthcare-specific fields
    await page.fill('[data-testid="patient-condition"]', 'Hipertensão');
    await page.selectOption('[data-testid="patient-priority"]', 'high');

    // Submit form
    await page.click('[data-testid="save-patient"]');

    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('text=Maria Santos')).toBeVisible();
  });

  test('search and filter patients', async ({ page }) => {
    await page.goto('/patients');

    // Search functionality
    await page.fill('[data-testid="search-input"]', 'Maria');
    await page.click('[data-testid="search-button"]');

    // Verify search results
    await expect(page.locator('[data-testid="patient-card"]')).toContainText('Maria');

    // Filter by condition
    await page.selectOption('[data-testid="condition-filter"]', 'diabetes');
    await expect(page.locator('[data-testid="patient-count"]')).toContainText('diabetes');
  });

  test('accessibility compliance in patient forms', async ({ page }) => {
    await page.goto('/patients/new');

    // Keyboard navigation test
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="patient-name"]')).toBeFocused();

    // Screen reader labels
    const nameInput = page.locator('[data-testid="patient-name"]');
    await expect(nameInput).toHaveAttribute('aria-label', /nome do paciente/i);

    // Error handling accessibility
    await page.click('[data-testid="save-patient"]'); // Submit empty form
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toHaveAttribute('role', 'alert');
    await expect(errorMessage).toHaveAttribute('aria-live', 'assertive');
  });
});
```## Accessibility Testing (WCAG 2.1 AA+)

### 1. Automated Accessibility Tests

```typescript
// Accessibility testing with jest-axe
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { PatientForm } from './PatientForm';

expect.extend(toHaveNoViolations);

describe('PatientForm Accessibility', () => {
  it('meets WCAG 2.1 AA standards', async () => {
    const { container } = render(<PatientForm />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('supports keyboard navigation', async () => {
    render(<PatientForm />);

    // Test tab order
    const inputs = screen.getAllByRole('textbox');
    inputs[0].focus();

    await user.keyboard('[Tab]');
    expect(inputs[1]).toHaveFocus();

    await user.keyboard('[Shift>][Tab][/Shift]');
    expect(inputs[0]).toHaveFocus();
  });

  it('provides proper ARIA labels for healthcare data', () => {
    render(<PatientForm />);

    expect(screen.getByLabelText(/nome completo do paciente/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cpf do paciente/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /condição médica/i })).toBeInTheDocument();
  });
});
````

### 2. Screen Reader Compatibility

```typescript
// Test screen reader announcements
describe('Screen Reader Support', () => {
  it('announces form errors correctly', async () => {
    render(<PatientForm />);

    // Submit invalid form
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    // Verify error announcements
    const errorRegion = screen.getByRole('alert');
    expect(errorRegion).toHaveTextContent(/nome é obrigatório/i);
    expect(errorRegion).toHaveAttribute('aria-live', 'assertive');
  });

  it('provides status updates for async operations', async () => {
    render(<PatientForm />);

    // Start save operation
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    // Loading state
    expect(screen.getByText(/salvando paciente/i)).toHaveAttribute('aria-live', 'polite');

    // Success state
    await waitFor(() => {
      expect(screen.getByText(/paciente salvo com sucesso/i))
        .toHaveAttribute('aria-live', 'polite');
    });
  });
});
```

## Testing Utilities & Mocks

### 1. Custom Render Function

```typescript
// apps/web/src/test/utils/render.tsx
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { routeTree } from '../routeTree.gen';

interface CustomRenderOptions extends RenderOptions {
  initialEntries?: string[];
  queryClient?: QueryClient;
}

const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const {
    initialEntries = ['/'],
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    }),
    ...renderOptions
  } = options;

  const router = createMemoryRouter({
    routeTree,
    history: initialEntries,
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router}>
        {children}
      </RouterProvider>
    </QueryClientProvider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

export * from '@testing-library/react';
export { customRender as render };
```

### 2. Healthcare Data Fixtures

```typescript
// apps/web/src/test/fixtures/patient.ts
import type { Patient } from "@/types/patient";

export const createMockPatient = (
  overrides: Partial<Patient> = {},
): Patient => ({
  id: "1",
  name: "João Silva",
  cpf: "***.***.***-12", // LGPD compliant masking
  email: "joao.silva@email.com",
  phone: "+55 11 99999-9999",
  birthDate: "1985-03-15",
  gender: "M",
  address: {
    street: "Rua das Flores, 123",
    city: "São Paulo",
    state: "SP",
    zipCode: "01234-567",
  },
  medicalInfo: {
    conditions: ["Diabetes Tipo 2"],
    allergies: ["Penicilina"],
    medications: ["Metformina 500mg"],
    emergencyContact: {
      name: "Maria Silva",
      phone: "+55 11 88888-8888",
      relationship: "Esposa",
    },
  },
  clinicId: "clinic-123",
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T10:30:00Z",
  ...overrides,
});

export const createMockPatients = (count: number = 5): Patient[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockPatient({
      id: `patient-${index + 1}`,
      name: `Paciente ${index + 1}`,
      cpf: `***.***.***-${String(index + 10).padStart(2, "0")}`,
    }),
  );
};
```

### 3. API Mocks with MSW

```typescript
// apps/web/src/test/mocks/api.ts
import { rest } from "msw";
import { createMockPatients } from "../fixtures/patient";

export const patientHandlers = [
  // Get patients list
  rest.get("/api/patients", (req, res, ctx) => {
    const search = req.url.searchParams.get("search");
    const patients = createMockPatients(10);

    const filtered = search
      ? patients.filter((p) =>
          p.name.toLowerCase().includes(search.toLowerCase()),
        )
      : patients;

    return res(
      ctx.status(200),
      ctx.json({
        data: filtered,
        total: filtered.length,
        page: 1,
        pageSize: 10,
      }),
    );
  }),

  // Get single patient
  rest.get("/api/patients/:id", (req, res, ctx) => {
    const { id } = req.params;
    const patient = createMockPatient({ id: id as string });

    return res(ctx.status(200), ctx.json({ data: patient }));
  }),

  // Create patient
  rest.post("/api/patients", (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        data: createMockPatient({ id: "new-patient-id" }),
        message: "Paciente criado com sucesso",
      }),
    );
  }),
];
```

## Troubleshooting

### Common Issues

- **Issue**: TanStack Router tests failing with "No router found"
  **Solution**: Use `createMemoryRouter` and `RouterProvider` in test setup

- **Issue**: Accessibility tests showing false positives
  **Solution**: Configure jest-axe with healthcare-specific rules

- **Issue**: E2E tests flaky due to data loading
  **Solution**: Use proper `waitFor` and `expect.toBeVisible()` patterns

- **Issue**: LGPD compliance failing in tests
  **Solution**: Ensure all test data uses masked/anonymized values

### Performance Tips

```typescript
// Optimize test performance
describe.concurrent("Patient Components", () => {
  test("renders patient card", async () => {
    // Run tests in parallel when possible
  });
});

// Use test.each for similar test cases
test.each([
  ["João Silva", "valid"],
  ["", "invalid"],
  ["Maria Santos", "valid"],
])("validates patient name: %s (%s)", (name, expected) => {
  const result = validatePatientName(name);
  expect(result.isValid).toBe(expected === "valid");
});
```

## Examples

### Complete Patient Component Test

```typescript
// Complete example combining all patterns
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import { PatientCard } from './PatientCard';
import { createMockPatient } from '@/test/fixtures/patient';
import { axe } from 'jest-axe';

describe('PatientCard Integration', () => {
  const mockPatient = createMockPatient();

  it('renders and handles all interactions', async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    const { container } = render(
      <PatientCard
        patient={mockPatient}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    // Accessibility check
    expect(await axe(container)).toHaveNoViolations();

    // Content verification
    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText(/\*\*\*\.\*\*\*\.\*\*\*-12/)).toBeInTheDocument();

    // Interaction testing
    fireEvent.click(screen.getByRole('button', { name: /editar/i }));
    expect(onEdit).toHaveBeenCalledWith(mockPatient.id);

    // Confirmation dialog
    fireEvent.click(screen.getByRole('button', { name: /excluir/i }));
    const confirmButton = await screen.findByRole('button', { name: /confirmar/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith(mockPatient.id);
    });
  });
});
```

## See Also

- [Backend Architecture Testing](./backend-architecture-testing.md) - API integration patterns
- [Database Security Testing](./database-security-testing.md) - Data validation
- [Code Review & Audit](./code-review-auditfix.md) - Quality standards
- [AGENTS.md](./AGENTS.md) - Testing orchestration guide
