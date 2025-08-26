# Progressive Testing Strategies Framework

## 🧪 COMPREHENSIVE TESTING ARCHITECTURE

Testing strategies that scale intelligently with system complexity, domain criticality, and quality
requirements.

**Core Principle**: Progressive testing depth with automated quality gates that enforce higher
standards as system complexity increases.

## 📊 TESTING COMPLEXITY MATRIX

```yaml
testing_levels:
  L1_L2_foundation:
    coverage: "≥70% code coverage"
    focus: "Unit tests, basic integration, manual validation"
    automation: "Basic CI/CD with test execution"

  L3_L4_standard:
    coverage: "≥85% code coverage"
    focus: "Component testing, API testing, accessibility validation"
    automation: "Full CI/CD pipeline with quality gates"

  L5_L6_comprehensive:
    coverage: "≥90% code coverage"
    focus: "E2E testing, performance testing, security testing"
    automation: "Advanced pipelines with parallel execution"

  L7_L8_enterprise:
    coverage: "≥95% code coverage"
    focus: "Chaos engineering, load testing, compliance validation"
    automation: "Production monitoring with automated rollback"

  L9_L10_critical:
    coverage: "100% code coverage"
    focus: "Formal verification, regulatory compliance, disaster recovery"
    automation: "Zero-downtime deployments with canary releases"
```

## 🔧 L1-L2: FOUNDATION TESTING

**Scope**: Basic functionality validation, simple applications\
**Coverage Target**: ≥70% code coverage

### Unit Testing Framework

```typescript
// ✅ Comprehensive unit testing with Vitest
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UserRepository } from '../repositories/UserRepository';
import { UserService } from '../services/UserService';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as jest.Mocked<UserRepository>;

    userService = new UserService(mockUserRepository);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'SecurePassword123!',
      };

      const expectedUser = {
        id: '123',
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(expectedUser);

      // Act
      const result = await userService.createUser(userData);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockUserRepository.create).toHaveBeenCalledWith(userData);
    });

    it('should throw error for duplicate email', async () => {
      // Arrange
      const userData = {
        email: 'existing@example.com',
        name: 'Test User',
        password: 'SecurePassword123!',
      };

      const existingUser = { id: '456', email: userData.email };
      mockUserRepository.findByEmail.mockResolvedValue(existingUser as any);

      // Act & Assert
      await expect(userService.createUser(userData))
        .rejects
        .toThrow('User with this email already exists');

      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should validate email format', async () => {
      // Arrange
      const invalidUserData = {
        email: 'invalid-email',
        name: 'Test User',
        password: 'SecurePassword123!',
      };

      // Act & Assert
      await expect(userService.createUser(invalidUserData))
        .rejects
        .toThrow('Invalid email format');
    });
  });

  describe('password validation', () => {
    it.each([
      ['short password', 'short', 'Password must be at least 12 characters'],
      ['no uppercase', 'nouppercase123!', 'Password must contain uppercase letter'],
      ['no lowercase', 'NOLOWERCASE123!', 'Password must contain lowercase letter'],
      ['no numbers', 'NoNumbers!', 'Password must contain number'],
      ['no special chars', 'NoSpecialChars123', 'Password must contain special character'],
    ])('should reject %s', async (testName, password, expectedError) => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password,
      };

      await expect(userService.createUser(userData))
        .rejects
        .toThrow(expectedError);
    });
  });
});

// React component testing
describe('UserProfile Component', () => {
  const mockUser = {
    id: '123',
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: new Date('2024-01-01'),
  };

  it('should render user information correctly', () => {
    render(<UserProfile user={mockUser} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Member since: Jan 1, 2024')).toBeInTheDocument();
  });

  it('should handle edit button click', async () => {
    const mockOnEdit = vi.fn();
    render(<UserProfile user={mockUser} onEdit={mockOnEdit} />);

    const editButton = screen.getByRole('button', { name: /edit profile/i });
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(mockOnEdit).toHaveBeenCalledWith(mockUser.id);
    });
  });

  it('should be accessible', async () => {
    const { container } = render(<UserProfile user={mockUser} />);

    // Check for ARIA labels
    expect(screen.getByRole('heading', { name: /user profile/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/user email/i)).toBeInTheDocument();

    // Check for keyboard navigation
    const editButton = screen.getByRole('button', { name: /edit profile/i });
    editButton.focus();
    expect(editButton).toHaveFocus();
  });
});
```

### Basic Integration Testing

```typescript
// ✅ Integration testing with test database
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { app } from '../app';
import { UserController } from '../controllers/UserController';
import { UserRepository } from '../repositories/UserRepository';
import { UserService } from '../services/UserService';
import { cleanupTestDatabase, createTestDatabase } from '../test-utils/database';

describe('User Integration Tests', () => {
  let testDb: TestDatabase;

  beforeAll(async () => {
    testDb = await createTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase(testDb);
  });

  beforeEach(async () => {
    await testDb.clear();
  });

  describe('POST /api/users', () => {
    it('should create user and return 201', async () => {
      const userData = {
        email: 'integration@example.com',
        name: 'Integration Test User',
        password: 'SecurePassword123!',
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        email: userData.email,
        name: userData.name,
        createdAt: expect.any(String),
      });

      // Verify user was actually created in database
      const createdUser = await testDb.query(
        'SELECT * FROM users WHERE email = $1',
        [userData.email],
      );

      expect(createdUser.rows).toHaveLength(1);
      expect(createdUser.rows[0].email).toBe(userData.email);
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        email: 'invalid-email',
        name: '',
        password: 'weak',
      };

      const response = await request(app)
        .post('/api/users')
        .send(invalidData)
        .expect(400);

      expect(response.body.errors).toEqual([
        expect.objectContaining({
          field: 'email',
          message: expect.stringMatching(/invalid email/i),
        }),
        expect.objectContaining({
          field: 'name',
          message: expect.stringMatching(/name is required/i),
        }),
        expect.objectContaining({
          field: 'password',
          message: expect.stringMatching(/password must be at least/i),
        }),
      ]);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user by id', async () => {
      // Create user first
      const user = await testDb.query(
        `INSERT INTO users (email, name, password_hash) 
         VALUES ($1, $2, $3) RETURNING *`,
        ['get@example.com', 'Get User', 'hashedpassword'],
      );

      const userId = user.rows[0].id;

      const response = await request(app)
        .get(`/api/users/${userId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: userId,
        email: 'get@example.com',
        name: 'Get User',
      });

      // Should not include password_hash
      expect(response.body.password_hash).toBeUndefined();
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/999')
        .expect(404);

      expect(response.body.error).toBe('User not found');
    });
  });
});
```

### Error Handling & Edge Cases

```typescript
// ✅ Comprehensive error handling tests
describe('Error Handling', () => {
  it('should handle database connection errors', async () => {
    // Mock database connection failure
    mockUserRepository.create.mockRejectedValue(
      new Error('Database connection failed'),
    );

    const userData = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'SecurePassword123!',
    };

    await expect(userService.createUser(userData))
      .rejects
      .toThrow('Database connection failed');
  });

  it('should handle concurrent user creation', async () => {
    const userData = {
      email: 'concurrent@example.com',
      name: 'Concurrent User',
      password: 'SecurePassword123!',
    };

    // Simulate race condition
    mockUserRepository.findByEmail
      .mockResolvedValueOnce(null) // First check - no existing user
      .mockResolvedValueOnce(null); // Second check - still no user

    mockUserRepository.create
      .mockRejectedValueOnce(new Error('Unique constraint violation'));

    await expect(userService.createUser(userData))
      .rejects
      .toThrow('Unique constraint violation');
  });

  it('should handle memory constraints gracefully', async () => {
    // Test with extremely large input
    const largeUserData = {
      email: 'large@example.com',
      name: 'A'.repeat(1000000), // 1MB string
      password: 'SecurePassword123!',
    };

    await expect(userService.createUser(largeUserData))
      .rejects
      .toThrow('Input too large');
  });
});
```

## 🔄 L3-L4: STANDARD TESTING

**Scope**: Complex business logic, multi-component features\
**Coverage Target**: ≥85% code coverage

### Component & API Testing

```typescript
// ✅ Advanced component testing with MSW
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Mock service worker for API calls
const server = setupServer(
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: '1', name: 'John Doe', email: 'john@example.com' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    ]);
  }),
  http.post('/api/users', async ({ request }) => {
    const userData = await request.json();

    // Validate required fields
    if (!userData.email || !userData.name) {
      return HttpResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    return HttpResponse.json(
      { id: '3', ...userData },
      { status: 201 },
    );
  }),
  http.delete('/api/users/:id', ({ params }) => {
    return HttpResponse.json(
      { message: `User ${params.id} deleted` },
      { status: 200 },
    );
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('UserManagement Component', () => {
  const renderWithProviders = (ui: React.ReactElement) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>,
    );
  };

  it('should load and display users', async () => {
    renderWithProviders(<UserManagement />);

    // Show loading state
    expect(screen.getByText(/loading users/i)).toBeInTheDocument();

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    // Verify user details
    const johnRow = screen.getByTestId('user-row-1');
    expect(within(johnRow).getByText('john@example.com')).toBeInTheDocument();

    const janeRow = screen.getByTestId('user-row-2');
    expect(within(janeRow).getByText('jane@example.com')).toBeInTheDocument();
  });

  it('should create new user', async () => {
    const user = userEvent.setup();
    renderWithProviders(<UserManagement />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Open create form
    const createButton = screen.getByRole('button', { name: /add user/i });
    await user.click(createButton);

    // Fill form
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);

    await user.type(nameInput, 'New User');
    await user.type(emailInput, 'newuser@example.com');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create user/i });
    await user.click(submitButton);

    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/user created successfully/i)).toBeInTheDocument();
    });

    // Verify form closes
    expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument();
  });

  it('should handle form validation errors', async () => {
    const user = userEvent.setup();
    renderWithProviders(<UserManagement />);

    // Open create form
    const createButton = screen.getByRole('button', { name: /add user/i });
    await user.click(createButton);

    // Submit empty form
    const submitButton = screen.getByRole('button', { name: /create user/i });
    await user.click(submitButton);

    // Check client-side validation
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('should delete user with confirmation', async () => {
    const user = userEvent.setup();
    renderWithProviders(<UserManagement />);

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Click delete button
    const deleteButton = screen.getByTestId('delete-user-1');
    await user.click(deleteButton);

    // Confirm deletion in modal
    const confirmDialog = screen.getByRole('dialog');
    expect(within(confirmDialog).getByText(/are you sure/i)).toBeInTheDocument();

    const confirmButton = within(confirmDialog).getByRole('button', { name: /delete/i });
    await user.click(confirmButton);

    // Verify success
    await waitFor(() => {
      expect(screen.getByText(/user deleted successfully/i)).toBeInTheDocument();
    });

    // Verify modal closes
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
```

### Accessibility Testing

```typescript
// ✅ Comprehensive accessibility testing
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<UserManagement />);

    // Wait for component to fully render
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should support keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<UserManagement />);

    // Tab through interactive elements
    await user.tab();
    expect(screen.getByRole('button', { name: /add user/i })).toHaveFocus();

    await user.tab();
    expect(screen.getByTestId('delete-user-1')).toHaveFocus();

    await user.tab();
    expect(screen.getByTestId('delete-user-2')).toHaveFocus();

    // Test keyboard activation
    await user.keyboard('{Enter}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should have proper ARIA labels and roles', () => {
    render(<UserManagement />);

    // Check main landmarks
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();

    // Check ARIA labels
    expect(screen.getByLabelText(/user management table/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();

    // Check table structure
    const table = screen.getByRole('table');
    expect(within(table).getByRole('columnheader', { name: /name/i })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: /email/i })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: /actions/i })).toBeInTheDocument();
  });

  it('should provide screen reader announcements', async () => {
    const user = userEvent.setup();
    render(<UserManagement />);

    // Create user and check for announcement
    const createButton = screen.getByRole('button', { name: /add user/i });
    await user.click(createButton);

    // Fill and submit form
    await user.type(screen.getByLabelText(/name/i), 'New User');
    await user.type(screen.getByLabelText(/email/i), 'newuser@example.com');
    await user.click(screen.getByRole('button', { name: /create user/i }));

    // Check for live region announcement
    await waitFor(() => {
      const announcement = screen.getByRole('status');
      expect(announcement).toHaveTextContent(/user created successfully/i);
    });
  });
});
```

## 🚀 L5-L6: COMPREHENSIVE TESTING

**Scope**: Performance-critical systems, complex integrations\
**Coverage Target**: ≥90% code coverage

### End-to-End Testing

```typescript
// ✅ E2E testing with Playwright
import { BrowserContext, expect, Page, test } from '@playwright/test';

test.describe('User Management E2E', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();

    // Setup test data
    await setupTestDatabase();
  });

  test.afterAll(async () => {
    await cleanupTestDatabase();
    await context.close();
  });

  test('complete user workflow', async () => {
    // Login
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'admin@example.com');
    await page.fill('[data-testid="password"]', 'AdminPassword123!');
    await page.click('[data-testid="login-button"]');

    await expect(page).toHaveURL('/dashboard');

    // Navigate to user management
    await page.click('[data-testid="nav-users"]');
    await expect(page).toHaveURL('/users');

    // Create new user
    await page.click('[data-testid="add-user-button"]');

    const modal = page.locator('[data-testid="user-modal"]');
    await expect(modal).toBeVisible();

    await modal.locator('[data-testid="name-input"]').fill('E2E Test User');
    await modal.locator('[data-testid="email-input"]').fill('e2e@example.com');
    await modal.locator('[data-testid="password-input"]').fill('TestPassword123!');

    await modal.locator('[data-testid="submit-button"]').click();

    // Verify user creation
    await expect(page.locator('text=User created successfully')).toBeVisible();
    await expect(page.locator('text=E2E Test User')).toBeVisible();

    // Edit user
    const userRow = page.locator('[data-testid="user-row"]').filter({ hasText: 'E2E Test User' });
    await userRow.locator('[data-testid="edit-button"]').click();

    await modal.locator('[data-testid="name-input"]').fill('Updated E2E User');
    await modal.locator('[data-testid="submit-button"]').click();

    await expect(page.locator('text=User updated successfully')).toBeVisible();
    await expect(page.locator('text=Updated E2E User')).toBeVisible();

    // Delete user
    await userRow.locator('[data-testid="delete-button"]').click();

    const confirmDialog = page.locator('[data-testid="confirm-dialog"]');
    await expect(confirmDialog).toBeVisible();
    await confirmDialog.locator('[data-testid="confirm-button"]').click();

    await expect(page.locator('text=User deleted successfully')).toBeVisible();
    await expect(page.locator('text=Updated E2E User')).not.toBeVisible();
  });

  test('should handle network failures gracefully', async () => {
    await page.goto('/users');

    // Intercept API calls and simulate network failure
    await page.route('**/api/users', route => route.abort());

    await page.reload();

    // Verify error handling
    await expect(page.locator('text=Failed to load users')).toBeVisible();
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();

    // Restore network and retry
    await page.unroute('**/api/users');
    await page.click('[data-testid="retry-button"]');

    await expect(page.locator('text=Failed to load users')).not.toBeVisible();
    await expect(page.locator('[data-testid="user-table"]')).toBeVisible();
  });

  test('should be responsive across devices', async () => {
    // Desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/users');

    await expect(page.locator('[data-testid="desktop-layout"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-menu"]')).not.toBeVisible();

    // Tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();

    await expect(page.locator('[data-testid="tablet-layout"]')).toBeVisible();

    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();

    await expect(page.locator('[data-testid="mobile-layout"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();

    // Test mobile navigation
    await page.click('[data-testid="mobile-menu-button"]');
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
  });
});
```

### Performance Testing

```typescript
// ✅ Performance testing framework
import { expect, test } from '@playwright/test';
import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';

describe('Performance Tests', () => {
  test('page load performance', async ({ page }) => {
    // Start performance measurement
    await page.goto('/users', { waitUntil: 'networkidle' });

    // Measure Core Web Vitals
    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const vitals = {};

          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              vitals.fcp = entry.startTime;
            }
            if (entry.name === 'largest-contentful-paint') {
              vitals.lcp = entry.startTime;
            }
            if (entry.entryType === 'layout-shift') {
              vitals.cls = (vitals.cls || 0) + entry.value;
            }
          });

          resolve(vitals);
        }).observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift'] });
      });
    });

    // Assert performance metrics
    expect(vitals.fcp).toBeLessThan(2000); // FCP < 2s
    expect(vitals.lcp).toBeLessThan(4000); // LCP < 4s
    expect(vitals.cls).toBeLessThan(0.1); // CLS < 0.1
  });

  test('API response times', async ({ request }) => {
    const responses = [];

    // Test multiple API calls
    for (let i = 0; i < 10; i++) {
      const start = Date.now();
      const response = await request.get('/api/users');
      const duration = Date.now() - start;

      responses.push({
        status: response.status(),
        duration,
      });
    }

    // Assert all requests succeeded
    responses.forEach(({ status }) => {
      expect(status).toBe(200);
    });

    // Assert performance metrics
    const avgDuration = responses.reduce((sum, { duration }) => sum + duration, 0)
      / responses.length;
    const maxDuration = Math.max(...responses.map(({ duration }) => duration));

    expect(avgDuration).toBeLessThan(200); // Average < 200ms
    expect(maxDuration).toBeLessThan(500); // Max < 500ms
  });

  test('memory usage under load', async ({ page }) => {
    await page.goto('/users');

    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory.usedJSHeapSize;
    });

    // Simulate heavy usage
    for (let i = 0; i < 100; i++) {
      await page.click('[data-testid="add-user-button"]');
      await page.click('[data-testid="cancel-button"]');
    }

    // Force garbage collection
    await page.evaluate(() => {
      if ((window as any).gc) {
        (window as any).gc();
      }
    });

    // Check final memory usage
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory.usedJSHeapSize;
    });

    const memoryIncrease = finalMemory - initialMemory;
    const memoryIncreasePercentage = (memoryIncrease / initialMemory) * 100;

    // Assert memory didn't increase by more than 50%
    expect(memoryIncreasePercentage).toBeLessThan(50);
  });
});

// Load testing with artillery
const loadTestConfig = {
  config: {
    target: 'http://localhost:3000',
    phases: [
      { duration: 60, arrivalRate: 10 }, // Warm up
      { duration: 120, arrivalRate: 50 }, // Sustained load
      { duration: 60, arrivalRate: 100 }, // Peak load
    ],
    defaults: {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  },
  scenarios: [
    {
      name: 'User Management Load Test',
      weight: 100,
      flow: [
        { get: { url: '/api/users' } },
        { think: 1 },
        {
          post: {
            url: '/api/users',
            json: {
              name: 'Load Test User {{ $randomString() }}',
              email: 'loadtest{{ $randomInt(1, 10000) }}@example.com',
              password: 'LoadTestPassword123!',
            },
          },
        },
        { think: 2 },
        { get: { url: '/api/users/{{ id }}' } },
        { think: 1 },
        { delete: { url: '/api/users/{{ id }}' } },
      ],
    },
  ],
};
```

## 🏢 L7-L8: ENTERPRISE TESTING

**Scope**: Mission-critical systems, high availability requirements\
**Coverage Target**: ≥95% code coverage

### Chaos Engineering

```typescript
// ✅ Chaos engineering with automated fault injection
import { MonitoringService } from '@company/monitoring';
import { ServiceMesh } from '@company/service-mesh';
import { ChaosMonkey } from 'chaos-monkey';

class ChaosEngineeringFramework {
  constructor(
    private readonly serviceMesh: ServiceMesh,
    private readonly monitoring: MonitoringService,
    private readonly chaosMonkey: ChaosMonkey,
  ) {}

  async runChaosExperiments(): Promise<ChaosExperimentResults> {
    const experiments = [
      this.latencyInjectionExperiment(),
      this.serviceFailureExperiment(),
      this.networkPartitionExperiment(),
      this.resourceExhaustionExperiment(),
      this.databaseFailoverExperiment(),
    ];

    const results = [];

    for (const experiment of experiments) {
      const result = await this.executeExperiment(experiment);
      results.push(result);

      // Wait for system recovery between experiments
      await this.waitForSystemStability();
    }

    return {
      experiments: results,
      overallResilience: this.calculateResilienceScore(results),
      recommendations: this.generateResilienceRecommendations(results),
    };
  }

  private async executeExperiment(experiment: ChaosExperiment): Promise<ExperimentResult> {
    const baseline = await this.collectBaselineMetrics();

    try {
      // Start monitoring
      const monitor = this.monitoring.startExperiment(experiment.name);

      // Inject fault
      await this.chaosMonkey.injectFault(experiment.fault);

      // Monitor system behavior
      const behavior = await this.observeSystemBehavior(experiment.duration);

      // Stop fault injection
      await this.chaosMonkey.stopFault(experiment.fault);

      // Collect recovery metrics
      const recovery = await this.observeRecovery();

      return {
        name: experiment.name,
        success: behavior.systemStable && recovery.recoveryTime < experiment.maxRecoveryTime,
        metrics: {
          baseline,
          duringFault: behavior.metrics,
          recovery: recovery.metrics,
        },
        observations: behavior.observations,
        recommendations: this.analyzeExperimentResults(behavior, recovery),
      };
    } catch (error) {
      // Ensure fault is cleaned up even if experiment fails
      await this.chaosMonkey.stopAllFaults();
      throw error;
    }
  }

  private latencyInjectionExperiment(): ChaosExperiment {
    return {
      name: 'Database Latency Injection',
      description: 'Inject 2-second latency to database connections',
      fault: {
        type: 'network_latency',
        target: 'database_connections',
        parameters: {
          latency: '2000ms',
          jitter: '500ms',
        },
      },
      duration: 300000, // 5 minutes
      maxRecoveryTime: 60000, // 1 minute
      successCriteria: {
        maxErrorRate: 0.01, // < 1% error rate
        maxResponseTimeDegradation: 2.5, // < 2.5x baseline
      },
    };
  }

  private serviceFailureExperiment(): ChaosExperiment {
    return {
      name: 'User Service Failure',
      description: 'Simulate complete failure of user service',
      fault: {
        type: 'service_failure',
        target: 'user_service',
        parameters: {
          failureMode: 'complete_shutdown',
        },
      },
      duration: 180000, // 3 minutes
      maxRecoveryTime: 120000, // 2 minutes
      successCriteria: {
        maxErrorRate: 0.05, // < 5% error rate (circuit breaker should activate)
        gracefulDegradation: true,
      },
    };
  }

  private async observeSystemBehavior(duration: number): Promise<SystemBehavior> {
    const startTime = Date.now();
    const observations: Observation[] = [];

    while (Date.now() - startTime < duration) {
      const metrics = await this.monitoring.collectMetrics();

      observations.push({
        timestamp: new Date(),
        metrics,
        alerts: await this.monitoring.getActiveAlerts(),
        systemHealth: await this.assessSystemHealth(metrics),
      });

      await this.sleep(10000); // Sample every 10 seconds
    }

    return {
      systemStable: observations.every(obs => obs.systemHealth.stable),
      metrics: this.aggregateMetrics(observations),
      observations,
    };
  }
}

// Chaos experiment definitions
const chaosExperiments = {
  userServiceDown: {
    hypothesis:
      'When user service fails, the system should gracefully degrade and recover automatically',
    steps: [
      'Terminate user service pods',
      'Monitor error rates and response times',
      'Verify circuit breaker activation',
      'Observe automatic pod restart',
      'Confirm system recovery',
    ],
    expectedOutcome: '< 5% error rate, automatic recovery within 2 minutes',
  },

  databaseLatency: {
    hypothesis: 'System should handle database latency spikes without cascading failures',
    steps: [
      'Inject 2-second latency to database queries',
      'Monitor connection pool exhaustion',
      'Verify timeout handling',
      'Check for memory leaks',
      'Confirm graceful recovery',
    ],
    expectedOutcome: 'No connection pool exhaustion, response times < 5 seconds',
  },

  networkPartition: {
    hypothesis: 'Microservices should handle network partitions with eventual consistency',
    steps: [
      'Create network partition between services',
      'Verify service isolation',
      'Monitor data consistency',
      'Restore network connectivity',
      'Confirm eventual consistency',
    ],
    expectedOutcome: 'No data corruption, eventual consistency achieved',
  },
};
```

### Compliance Testing

```typescript
// ✅ Automated compliance validation
import { AuditTrail } from '@company/audit';
import { ANVISA, CFM, LGPD } from '@company/compliance';

class ComplianceTestingFramework {
  constructor(
    private readonly lgpdValidator: LGPD.Validator,
    private readonly anvisaValidator: ANVISA.Validator,
    private readonly cfmValidator: CFM.Validator,
    private readonly auditTrail: AuditTrail,
  ) {}

  async validateHealthcareCompliance(): Promise<ComplianceReport> {
    const testCases = [
      this.validatePatientDataAccess(),
      this.validateConsentManagement(),
      this.validateDataRetention(),
      this.validateProfessionalAccess(),
      this.validateAuditTrail(),
      this.validateDataPortability(),
      this.validateRightToErasure(),
      this.validateMedicalDeviceCompliance(),
      this.validateProfessionalEthics(),
    ];

    const results = await Promise.all(testCases);
    const overallCompliance = results.every(result => result.compliant);

    return {
      overallCompliant: overallCompliance,
      results,
      criticalViolations: results
        .filter(r => !r.compliant && r.severity === 'CRITICAL')
        .map(r => r.violations)
        .flat(),
      recommendations: this.generateComplianceRecommendations(results),
      timestamp: new Date(),
    };
  }

  private async validatePatientDataAccess(): Promise<ComplianceTestResult> {
    const testScenarios = [
      {
        name: 'Unauthorized access attempt',
        test: async () => {
          const unauthorizedUser = await this.createTestUser({ role: 'receptionist' });
          const patientData = await this.createTestPatient();

          try {
            await this.accessPatientData(unauthorizedUser.id, patientData.id);
            return { success: false, error: 'Access should have been denied' };
          } catch (error) {
            return { success: true, expectedError: error.message };
          }
        },
      },

      {
        name: 'Professional access with valid license',
        test: async () => {
          const doctor = await this.createTestUser({
            role: 'doctor',
            license: 'CRM123456',
            licenseValid: true,
          });
          const patientData = await this.createTestPatient();

          const access = await this.accessPatientData(doctor.id, patientData.id);
          return {
            success: access.granted,
            auditTrail: access.auditEntry,
          };
        },
      },

      {
        name: 'Access logging and audit trail',
        test: async () => {
          const doctor = await this.createTestUser({ role: 'doctor' });
          const patient = await this.createTestPatient();

          await this.accessPatientData(doctor.id, patient.id);

          const auditEntries = await this.auditTrail.getEntries({
            type: 'patient_data_access',
            userId: doctor.id,
            resourceId: patient.id,
            timeRange: { start: new Date(Date.now() - 60000) },
          });

          return {
            success: auditEntries.length > 0,
            auditComplete: this.validateAuditEntry(auditEntries[0]),
          };
        },
      },
    ];

    const results = await Promise.all(
      testScenarios.map(scenario => scenario.test()),
    );

    return {
      testName: 'Patient Data Access',
      compliant: results.every(r => r.success),
      violations: results.filter(r => !r.success).map(r => r.error),
      severity: 'CRITICAL',
      regulatoryFramework: 'LGPD + CFM',
      evidence: results,
    };
  }

  private async validateConsentManagement(): Promise<ComplianceTestResult> {
    const patient = await this.createTestPatient();
    const doctor = await this.createTestUser({ role: 'doctor' });

    // Test explicit consent collection
    const consentResult = await this.collectPatientConsent({
      patientId: patient.id,
      consentTypes: ['data_processing', 'treatment_sharing'],
      digitalSignature: true,
      granularPermissions: {
        dataProcessing: true,
        researchParticipation: false,
        marketingCommunications: false,
      },
    });

    // Test consent withdrawal
    const withdrawalResult = await this.withdrawConsent({
      patientId: patient.id,
      consentType: 'marketing_communications',
    });

    // Test consent verification before data processing
    const verificationResult = await this.verifyConsentBeforeProcessing({
      patientId: patient.id,
      processingType: 'research_analysis',
    });

    return {
      testName: 'Consent Management',
      compliant: consentResult.valid
        && withdrawalResult.processed
        && !verificationResult.allowed, // Should be denied
      violations: this.findConsentViolations([
        consentResult,
        withdrawalResult,
        verificationResult,
      ]),
      severity: 'CRITICAL',
      regulatoryFramework: 'LGPD',
      evidence: { consentResult, withdrawalResult, verificationResult },
    };
  }
}
```

## 🏥 L9-L10: CRITICAL TESTING

**Scope**: Life-critical systems, regulatory compliance, zero-tolerance failure\
**Coverage Target**: 100% code coverage

### Formal Verification Testing

```typescript
// ✅ Mathematical proof of critical system properties
import { FormalVerifier } from '@company/formal-verification';
import { ModelChecker } from '@company/model-checking';

class CriticalSystemVerification {
  constructor(
    private readonly formalVerifier: FormalVerifier,
    private readonly modelChecker: ModelChecker,
  ) {}

  async verifyPatientSafetyProperties(): Promise<VerificationReport> {
    const safetyProperties = [
      this.verifyMedicationSafety(),
      this.verifyTreatmentProtocols(),
      this.verifyEmergencyProcedures(),
      this.verifyDataIntegrity(),
      this.verifyAccessControlInvariants(),
    ];

    const results = await Promise.all(safetyProperties);

    return {
      allPropertiesVerified: results.every(r => r.verified),
      properties: results,
      criticalFailures: results.filter(r => !r.verified && r.criticality === 'LIFE_CRITICAL'),
      timestamp: new Date(),
    };
  }

  private async verifyMedicationSafety(): Promise<VerificationResult> {
    // TLA+ specification for medication safety
    const medicationSafetySpec = `
      ---- MODULE MedicationSafety ----
      EXTENDS TLC, Integers, Sequences
      
      VARIABLES 
        prescriptions,
        dispensedMeds,
        patientAllergies,
        drugInteractions
      
      (* Safety invariants *)
      NoAllergyViolations ==
        \\A prescription \\in DOMAIN prescriptions :
          prescription.medication \\notin patientAllergies[prescription.patientId]
      
      NoDangerdouInteractions ==
        \\A p1, p2 \\in DOMAIN prescriptions :
          p1 \\neq p2 /\\ prescriptions[p1].patientId = prescriptions[p2].patientId
          => <<prescriptions[p1].medication, prescriptions[p2].medication>> 
             \\notin drugInteractions
      
      DosageWithinSafeLimits ==
        \\A prescription \\in DOMAIN prescriptions :
          prescription.dosage <= MaxSafeDosage[prescription.medication]
      
      PrescriptionByLicensedProfessional ==
        \\A prescription \\in DOMAIN prescriptions :
          IsValidMedicalLicense[prescription.prescriberId]
      
      (* Specification *)
      Init == /\\ prescriptions = {}
              /\\ dispensedMeds = {}
              /\\ patientAllergies = [patient |-> {}]
              /\\ drugInteractions = SafeDrugInteractionMatrix
              
      PrescribeMedication(patientId, medication, dosage, prescriberId) ==
        /\\ IsValidMedicalLicense[prescriberId]
        /\\ medication \\notin patientAllergies[patientId]
        /\\ dosage <= MaxSafeDosage[medication]
        /\\ \\A existingPrescription \\in {p \\in DOMAIN prescriptions : 
                prescriptions[p].patientId = patientId} :
             <<medication, prescriptions[existingPrescription].medication>> 
             \\notin drugInteractions
        /\\ prescriptions' = prescriptions @@
             (CHOOSE id \\in STRING : id \\notin DOMAIN prescriptions) :>
             [patientId |-> patientId, 
              medication |-> medication,
              dosage |-> dosage,
              prescriberId |-> prescriberId,
              timestamp |-> Now]
        /\\ UNCHANGED <<dispensedMeds, patientAllergies, drugInteractions>>
      
      (* Safety theorems *)
      THEOREM Spec => []NoAllergyViolations
      THEOREM Spec => []NoDangerdouInteractions  
      THEOREM Spec => []DosageWithinSafeLimits
      THEOREM Spec => []PrescriptionByLicensedProfessional
      ====
    `;

    const verificationResult = await this.modelChecker.verify(medicationSafetySpec);

    return {
      propertyName: 'Medication Safety',
      verified: verificationResult.allInvariantsHold,
      criticality: 'LIFE_CRITICAL',
      proof: verificationResult.proof,
      counterExamples: verificationResult.counterExamples,
      formalSpecification: medicationSafetySpec,
    };
  }

  private async verifyDataIntegrity(): Promise<VerificationResult> {
    // Coq proof for data integrity
    const dataIntegrityProof = `
      Require Import Coq.Arith.Arith.
      Require Import Coq.Crypto.Hash.
      
      (* Define patient data structure *)
      Record PatientData := {
        patientId : nat;
        medicalHistory : list MedicalRecord;
        treatments : list Treatment;
        hash : Hash;
        timestamp : nat;
        digitalSignature : Signature
      }.
      
      (* Define integrity property *)
      Definition DataIntegrityPreserved (data : PatientData) : Prop :=
        hash data = CalculateHash (medicalHistory data) (treatments data) (timestamp data) /\\
        VerifySignature (digitalSignature data) (hash data) = true.
      
      (* Define data modification operation *)
      Definition UpdatePatientData (data : PatientData) (newRecord : MedicalRecord) 
                                  (professional : ProfessionalId) : PatientData :=
        let newHistory := newRecord :: (medicalHistory data) in
        let newTimestamp := timestamp data + 1 in
        let newHash := CalculateHash newHistory (treatments data) newTimestamp in
        let newSignature := SignData newHash professional in
        {|
          patientId := patientId data;
          medicalHistory := newHistory;
          treatments := treatments data;
          hash := newHash;
          timestamp := newTimestamp;
          digitalSignature := newSignature
        |}.
      
      (* Theorem: Data integrity is preserved through updates *)
      Theorem UpdatePreservesIntegrity : 
        forall (data : PatientData) (record : MedicalRecord) (professional : ProfessionalId),
        DataIntegrityPreserved data ->
        IsAuthorizedProfessional professional ->
        DataIntegrityPreserved (UpdatePatientData data record professional).
      
      Proof.
        intros data record professional H_integrity H_auth.
        unfold DataIntegrityPreserved in *.
        unfold UpdatePatientData.
        split.
        
        (* Hash correctness *)
        - simpl. 
          rewrite CalculateHash_correct.
          reflexivity.
          
        (* Signature verification *)
        - simpl.
          apply SignData_produces_valid_signature.
          exact H_auth.
      Qed.
      
      (* Theorem: Immutable audit trail *)
      Theorem AuditTrailImmutable :
        forall (data1 data2 : PatientData),
        patientId data1 = patientId data2 ->
        timestamp data1 < timestamp data2 ->
        exists (record : MedicalRecord),
        medicalHistory data2 = record :: medicalHistory data1.
      
      Proof.
        intros data1 data2 H_same_patient H_timestamp.
        (* Proof by construction - new data must include old data *)
        exists (hd default_record (medicalHistory data2)).
        apply audit_trail_append_only.
        - exact H_same_patient.
        - exact H_timestamp.
      Qed.
    `;

    const proofResult = await this.formalVerifier.verifyCoqProof(dataIntegrityProof);

    return {
      propertyName: 'Data Integrity',
      verified: proofResult.valid,
      criticality: 'CRITICAL',
      proof: dataIntegrityProof,
      proofValidation: proofResult,
      mathematicalGuarantees: [
        'Hash integrity preserved through all operations',
        'Digital signatures cannot be forged',
        'Audit trail is immutable and append-only',
      ],
    };
  }
}

// Regulatory compliance testing
class RegulatoryComplianceTests {
  async validateANVISACompliance(): Promise<ANVISAComplianceReport> {
    const tests = [
      this.testMedicalDeviceValidation(),
      this.testDrugTraceability(),
      this.testAdverseEventReporting(),
      this.testQualityManagement(),
      this.testRiskManagement(),
    ];

    const results = await Promise.all(tests);

    return {
      compliant: results.every(r => r.passed),
      testResults: results,
      anvisaRequirements: this.mapToANVISARequirements(results),
      auditTrail: await this.generateANVISAAuditTrail(),
      timestamp: new Date(),
    };
  }

  private async testMedicalDeviceValidation(): Promise<ComplianceTestResult> {
    // Test that all medical devices are properly validated
    const devices = await this.getAllMedicalDevices();
    const validationResults = [];

    for (const device of devices) {
      const validation = await this.validateMedicalDevice(device);
      validationResults.push({
        deviceId: device.id,
        anvisaRegistration: validation.anvisaRegistered,
        qualityCertification: validation.qualityCertified,
        riskClassification: validation.riskClass,
        clinicalEvidence: validation.clinicalEvidence,
      });
    }

    const allValid = validationResults.every(v => v.anvisaRegistration && v.qualityCertification);

    return {
      testName: 'Medical Device Validation',
      passed: allValid,
      evidence: validationResults,
      anvisaRequirement: 'RDC 185/2001',
    };
  }

  async validateCFMEthics(): Promise<CFMComplianceReport> {
    const ethicsTests = [
      this.testProfessionalLicenseValidation(),
      this.testPatientConfidentiality(),
      this.testInformedConsent(),
      this.testContinuousEducation(),
      this.testEthicalGuidelines(),
    ];

    const results = await Promise.all(ethicsTests);

    return {
      ethicallyCompliant: results.every(r => r.passed),
      testResults: results,
      cfmResolution: 'CFM 2217/2018',
      professionalResponsibility: await this.assessProfessionalResponsibility(),
      timestamp: new Date(),
    };
  }
}
```

### Disaster Recovery Testing

```typescript
// ✅ Comprehensive disaster recovery validation
class DisasterRecoveryTesting {
  async validateDisasterRecovery(): Promise<DRTestReport> {
    const scenarios = [
      this.testDataCenterFailure(),
      this.testDatabaseCorruption(),
      this.testCyberAttackRecovery(),
      this.testNaturalDisasterScenario(),
      this.testSupplierFailure(),
    ];

    const results = await Promise.all(scenarios);

    return {
      rtoAchieved: Math.max(...results.map(r => r.recoveryTime)),
      rpoAchieved: Math.max(...results.map(r => r.dataLoss)),
      scenarios: results,
      overallReadiness: this.calculateReadinessScore(results),
      recommendations: this.generateDRRecommendations(results),
    };
  }

  private async testDataCenterFailure(): Promise<DRScenarioResult> {
    const startTime = Date.now();

    try {
      // Simulate complete data center failure
      await this.simulateDataCenterOutage();

      // Verify automated failover to secondary site
      const failoverStart = Date.now();
      await this.waitForFailoverCompletion();
      const failoverTime = Date.now() - failoverStart;

      // Validate service availability
      const servicesHealthy = await this.validateAllServicesHealthy();

      // Verify data consistency
      const dataConsistent = await this.validateDataConsistency();

      // Test primary site recovery
      await this.recoverPrimarySite();
      const failbackTime = Date.now() - startTime;

      return {
        scenario: 'Data Center Failure',
        success: servicesHealthy && dataConsistent,
        recoveryTime: failoverTime / 1000, // Convert to seconds
        dataLoss: await this.calculateDataLoss(),
        servicesAffected: await this.getAffectedServices(),
        failbackTime: failbackTime / 1000,
        lessons: await this.captureLessonsLearned(),
      };
    } catch (error) {
      return {
        scenario: 'Data Center Failure',
        success: false,
        recoveryTime: (Date.now() - startTime) / 1000,
        error: error.message,
        criticalIssues: await this.identifyCriticalIssues(),
      };
    }
  }

  private async testCyberAttackRecovery(): Promise<DRScenarioResult> {
    const startTime = Date.now();

    // Simulate ransomware attack
    await this.simulateRansomwareAttack();

    // Verify security incident response
    const incidentResponse = await this.validateIncidentResponse();

    // Test backup restoration
    const backupRestoration = await this.testBackupRestoration();

    // Verify security hardening
    const securityHardening = await this.validateSecurityHardening();

    // Test business continuity
    const businessContinuity = await this.validateBusinessContinuity();

    return {
      scenario: 'Cyber Attack Recovery',
      success: incidentResponse.effective
        && backupRestoration.successful
        && securityHardening.implemented
        && businessContinuity.maintained,
      recoveryTime: (Date.now() - startTime) / 1000,
      dataLoss: backupRestoration.dataLossHours,
      securityMeasures: securityHardening.measures,
      businessImpact: businessContinuity.impactAssessment,
    };
  }
}
```

## 🎯 TESTING DECISION FRAMEWORK

### Test Automation Strategy

```yaml
automation_strategy:
  pyramid_distribution:
    unit_tests: 70%
    integration_tests: 20%
    e2e_tests: 10%

  ci_cd_gates:
    L1_L2: ["unit_tests", "basic_integration", "security_scan"]
    L3_L4: ["comprehensive_unit", "api_tests", "accessibility_validation"]
    L5_L6: ["performance_tests", "e2e_tests", "security_penetration"]
    L7_L8: ["chaos_engineering", "load_tests", "compliance_validation"]
    L9_L10: ["formal_verification", "disaster_recovery", "regulatory_audit"]

  quality_metrics:
    code_coverage: "Progressive 70% → 100%"
    mutation_score: "Progressive 60% → 95%"
    performance_budgets: "Enforced at all levels"
    accessibility_compliance: "WCAG 2.1 AA+ mandatory"
```

### Testing Tool Selection Matrix

```typescript
const TESTING_TOOLS = {
  unit_testing: {
    L1_L4: ['vitest', 'jest', 'testing-library'],
    L5_L8: ['property-based-testing', 'mutation-testing'],
    L9_L10: ['formal-verification', 'model-checking'],
  },

  integration_testing: {
    L1_L4: ['supertest', 'msw', 'test-containers'],
    L5_L8: ['contract-testing', 'service-virtualization'],
    L9_L10: ['formal-integration-proofs', 'byzantine-fault-testing'],
  },

  e2e_testing: {
    L1_L4: ['playwright', 'cypress'],
    L5_L8: ['cross-browser-testing', 'mobile-testing'],
    L9_L10: ['regulatory-scenario-testing', 'disaster-recovery-validation'],
  },

  performance_testing: {
    L1_L4: ['lighthouse', 'web-vitals'],
    L5_L8: ['k6', 'artillery', 'jmeter'],
    L9_L10: ['chaos-engineering', 'formal-performance-bounds'],
  },
};
```

---

**🏛 CONSTITUTIONAL ADHERENCE**: All testing strategies must align with VIBECODER principles and
progressive quality frameworks while ensuring comprehensive validation at every complexity level.

**🔄 CONTINUOUS EVOLUTION**: Testing strategies evolve with system complexity, automatically scaling
test depth and rigor based on criticality assessment and regulatory requirements.
