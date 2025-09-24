# 🧪 NeonPro Frontend Testing Strategy

## Overview

This document outlines the comprehensive testing strategy for the NeonPro aesthetic clinic frontend application, ensuring high-quality, reliable, and maintainable code through efficient testing practices.

## Testing Pyramid

```
  ┌─────────────┐
  │   E2E       │ 10%
  │  Playwright │
  └─────────────┘
 ┌─────────────┐
 │ Integration │ 30%
 │   Vitest    │
 └─────────────┘
┌─────────────┐
│    Unit     │ 60%
│   Vitest    │
└─────────────┘
```

## Test Types

### 1. Unit Tests (60%)

- **Purpose**: Test individual components and functions in isolation
- **Tools**: Vitest with React Testing Library
- **Coverage**: All critical business logic, UI components, utilities
- **Location**: `src/__tests__/components/`, `src/__tests__/utils/`

### 2. Integration Tests (30%)

- **Purpose**: Test component interactions and data flow
- **Tools**: Vitest with MSW for API mocking
- **Coverage**: User flows, API integration, state management
- **Location**: `src/__tests__/integration/`

### 3. End-to-End Tests (10%)

- **Purpose**: Test complete user scenarios
- **Tools**: Playwright
- **Coverage**: Critical user journeys, authentication, key workflows
- **Location**: `tools/e2e/tests/`

## Testing Configuration

### Vitest Configuration

- **Environment**: jsdom for browser-like testing
- **Coverage**: 80% minimum threshold
- **Performance**: Parallel test execution with worker threads
- **Timeout**: 10 seconds default
- **Setup**: Global setup/teardown with MSW server

### Playwright Configuration

- **Browsers**: Chromium, Firefox, WebKit
- **Mobile**: Pixel 5, iPhone 12 (conditional execution)
- **Parallel**: Fully parallel execution
- **Reporter**: HTML, JSON, JUnit, List
- **Screenshots**: On failure only
- **Videos**: Retain on failure

## Test Organization

### File Naming Convention

- Unit tests: `ComponentName.test.tsx`
- Integration tests: `FeatureName.integration.test.tsx`
- E2E tests: `FeatureName.e2e.ts`

### Directory Structure

```
src/
├── __tests__/
│   ├── components/           # Unit tests for individual components
│   ├── integration/         # Integration tests
│   └── utils/               # Test utilities and helpers
└── test/
    ├── mocks/               # API mock handlers
    ├── utils.ts             # Test utilities
    ├── global-setup.ts      # Global test setup
    └── global-teardown.ts   # Global test cleanup
```

## Testing Best Practices

### 1. Test Writing Guidelines

- **AAA Pattern**: Arrange, Act, Assert
- **Descriptive Names**: Use clear, action-oriented test names
- **Independent Tests**: Each test should run in isolation
- **Minimal Setup**: Use factories and helpers for test data
- **Error Testing**: Test both success and error scenarios

### 2. Component Testing

```typescript
describe('ComponentName', () => {
  it('should render with required props', () => {
    render(<ComponentName prop='value' />);
    expect(screen.getByText('value')).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    const user = userEvent.setup();
    render(<ComponentName />);

    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Expected Result')).toBeInTheDocument();
  });
});
```

### 3. Integration Testing

```typescript
describe('Feature Integration', () => {
  it('should complete user flow', async () => {
    render(<FeatureComponent />);

    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
    });
  });
});
```

### 4. E2E Testing

```typescript
test.describe('User Journey', () => {
  test('should complete appointment booking', async ({ page }) => {
    await page.goto('/');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.click('[data-testid="login-button"]');

    await expect(page).toHaveURL('/dashboard');
    await page.click('[data-testid="new-appointment"]');

    // Complete appointment flow
  });
});
```

## Test Data Management

### Mock Data

- **Location**: `src/test/mocks/`
- **Format**: TypeScript interfaces with mock implementations
- **Reset**: Clear mocks between tests

### Test Factories

```typescript
export const generateMockPatient = (overrides = {}) => ({
  id: 'test-patient-id',
  fullName: 'Test Patient',
  email: 'test@example.com',
  ...overrides,
});
```

## Performance Testing

### Performance Metrics

- **Test Execution Time**: < 2 seconds for unit tests
- **Bundle Size**: Monitor for regression
- **Memory Usage**: No memory leaks in tests
- **Network Requests**: Mock all external calls

### Optimization Techniques

- **Parallel Execution**: Use all available CPU cores
- **Selective Testing**: Run only relevant tests on changes
- **Caching**: Cache test results where appropriate
- **Isolation**: Ensure tests don't share state

## Accessibility Testing

### Automated Checks

- ** axe-core**: Integration with Playwright
- **WCAG 2.1 AA**: Compliant color contrast and focus management
- **Screen Reader**: Test with NVDA/VoiceOver simulations

### Manual Testing Guidelines

- **Keyboard Navigation**: All functionality accessible via keyboard
- **Screen Readers**: Compatible with major screen readers
- **Mobile**: Touch targets minimum 44x44px

## CI/CD Integration

### GitHub Actions

```yaml
test:
  runs-on: ubuntu-latest
  strategy:
    matrix:
      test-type: [unit, integration, e2e]
  steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
    - run: bun install
    - run: bun test:${{ matrix.test-type }}
```

### Quality Gates

- **Code Coverage**: Minimum 80% for all components
- **Test Success Rate**: 100% required for merge
- **Performance**: No performance regression
- **Security**: No security vulnerabilities

## LGPD Compliance Testing

### Data Privacy Tests

- **Data Masking**: Verify sensitive data is masked in logs
- **Consent Management**: Test LGPD consent flows
- **Data Retention**: Verify data deletion workflows
- **Audit Trails**: Test user action logging

### Security Testing

- **Input Validation**: Test all user inputs for security
- **XSS Prevention**: Verify output encoding
- **CSRF Protection**: Test form submissions
- **Authentication**: Test auth flows and session management

## Testing Utilities

### Custom Matchers

```typescript
expect.extend({
  toBeValidEmail(received) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    return {
      message: () => `expected ${received} to be a valid email`,
      pass,
    };
  },
});
```

### Test Helpers

```typescript
export const renderWithProviders = (ui: ReactElement) => {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>,
  );
};
```

## Running Tests

### Development

```bash
# Run all tests
bun test

# Run with coverage
bun test:coverage

# Run in watch mode
bun test:watch

# Run UI for debugging
bun test:ui
```

### E2E Testing

```bash
# Run E2E tests
bun test:e2e

# Run specific browser
bun test:e2e --project=chromium

# Run with UI
bun test:e2e --ui
```

## Debugging Tests

### Vitest Debug Mode

```bash
# Run with debug breakpoint
bun test --debug

# Run specific test with debug
bun test --debug AppointmentForm.test.tsx
```

### Playwright Debug Mode

```bash
# Run with debug tools
bun test:e2e --debug

# Run with headed browser
bun test:e2e --headed
```

## Continuous Improvement

### Test Metrics

- **Test Execution Time**: Monitor and optimize
- **Coverage Reports**: Review and improve
- **Flaky Tests**: Identify and fix
- **Test Maintenance**: Regular review and updates

### Documentation

- **Test Cases**: Document complex test scenarios
- **Known Issues**: Track flaky tests and limitations
- **Best Practices**: Update with team learnings
- **Onboarding**: Provide test writing guidelines

## Conclusion

This testing strategy ensures that the NeonPro frontend application maintains high quality, reliability, and performance through comprehensive testing practices. By following this strategy, we can catch bugs early, ensure feature stability, and provide confidence in our releases.

---

**Key Principles:**

- **Test Early, Test Often**: Shift left testing practices
- **Quality Gates**: Maintain high standards for test coverage and success rates
- **Performance**: Optimize test execution speed
- **Accessibility**: Ensure inclusive design for all users
- **Compliance**: Meet LGPD and security requirements
