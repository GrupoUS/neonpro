---
title: "Backend Architecture Testing - API, Integration & Monorepo"
last_updated: 2025-09-16
form: how-to
tags: [backend, api, hono, integration, monorepo, architecture]
agent_coordination:
  primary: architect-review
  support: [code-reviewer, security-auditor]
  validation: [api-contracts, service-boundaries, integration-patterns]
related:
  - ./AGENTS.md
  - ./front-end-testing.md
  - ./database-security-testing.md
  - ../agents/code-review/architect-review.md
---

# Backend Architecture Testing - API, Integration & Monorepo — Version: 3.0.0

## Overview

Comprehensive backend testing strategy for Hono.dev APIs, service integration, and Turborepo monorepo architecture. Coordinated by **architect-review** agent with focus on API contracts, service boundaries, and integration patterns for healthcare applications.

**Target Audience**: Backend developers, API architects, DevOps engineers
**Agent Coordinator**: `architect-review.md` with service architecture validation

## Prerequisites

- Hono.dev framework for edge/server APIs
- Turborepo monorepo setup
- Vitest testing framework
- Zod for validation schemas
- Supabase for database integration
- Healthcare compliance requirements (LGPD, ANVISA)

## Quick Start

### Basic API Route Testing

```typescript
// apps/api/src/__tests__/patients.get.test.ts
import { describe, expect, it } from 'vitest'
import { app } from '../app' // Your Hono app
import { createTestContext } from '../test/utils'

describe('GET /patients', () => {
  it('returns 200 with patients list', async () => {
    const res = await app.request('/patients', {
      method: 'GET',
      headers: { Authorization: 'Bearer valid-token' },
    })

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data.patients)).toBe(true)
    expect(data).toHaveProperty('total')
    expect(data).toHaveProperty('page')
  })

  it('validates authentication', async () => {
    const res = await app.request('/patients', { method: 'GET' })
    expect(res.status).toBe(401)

    const error = await res.json()
    expect(error.message).toMatch(/unauthorized|token/i)
  })

  it('handles query parameters correctly', async () => {
    const res = await app.request('/patients?search=João&page=2&limit=5', {
      method: 'GET',
      headers: { Authorization: 'Bearer valid-token' },
    })

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.page).toBe(2)
    expect(data.limit).toBe(5)
  })
})
```

## Hono.dev API Testing Patterns

### 1. Route Handler Testing

```typescript
// Comprehensive route testing patterns
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'

const patientSchema = z.object({
  name: z.string().min(2),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/),
  birthDate: z.string().date(),
  condition: z.string().optional(),
})

describe('POST /patients - Create Patient', () => {
  it('creates patient with valid data', async () => {
    const validPatient = {
      name: 'João Silva',
      cpf: '123.456.789-00',
      birthDate: '1985-03-15',
      condition: 'Diabetes',
    }

    const res = await app.request('/patients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid-token',
      },
      body: JSON.stringify(validPatient),
    })

    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.patient).toMatchObject(validPatient)
    expect(data.patient.id).toBeDefined()
  })

  it('validates request body with Zod', async () => {
    const invalidPatient = {
      name: 'A', // Too short
      cpf: '123', // Invalid format
      birthDate: 'not-a-date',
    }

    const res = await app.request('/patients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid-token',
      },
      body: JSON.stringify(invalidPatient),
    })

    expect(res.status).toBe(400)
    const error = await res.json()
    expect(error.message).toMatch(/validation/i)
    expect(error.issues).toHaveLength(3)
  })
})
```

### 2. Middleware Testing

```typescript
// Test authentication and logging middleware
describe('Authentication Middleware', () => {
  it('validates JWT tokens', async () => {
    const validToken = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'
    const res = await app.request('/protected-route', {
      headers: { Authorization: validToken },
    })

    expect(res.status).not.toBe(401)
  })

  it('rejects expired tokens', async () => {
    const expiredToken = 'Bearer expired.jwt.token'
    const res = await app.request('/protected-route', {
      headers: { Authorization: expiredToken },
    })

    expect(res.status).toBe(401)
    const error = await res.json()
    expect(error.code).toBe('TOKEN_EXPIRED')
  })

  it('handles missing authorization header', async () => {
    const res = await app.request('/protected-route')
    expect(res.status).toBe(401)
  })
})

describe('CORS Middleware', () => {
  it('sets correct CORS headers', async () => {
    const res = await app.request('/', {
      method: 'OPTIONS',
      headers: { Origin: 'https://neonpro.app' },
    })

    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(
      'https://neonpro.app',
    )
    expect(res.headers.get('Access-Control-Allow-Methods')).toContain('POST')
  })
})
```

### 3. Error Handling Testing

````typescript
// Test comprehensive error handling
describe('Error Handling', () => {
  it('handles database connection errors', async () => {
    // Mock database failure
    vi.mocked(supabase.from).mockImplementation(() => {
      throw new Error('Connection timeout');
    });

    const res = await app.request('/patients');

    expect(res.status).toBe(500);
    const error = await res.json();
    expect(error.message).toBe('Internal server error');
    expect(error.requestId).toBeDefined();
  });

  it('handles resource not found', async () => {
    const res = await app.request('/patients/nonexistent-id');

    expect(res.status).toBe(404);
    const error = await res.json();
    expect(error.message).toMatch(/not found/i);
  });

  it('handles rate limiting', async () => {
    // Simulate multiple rapid requests
    const requests = Array(10).fill(null).map(() =>
      app.request('/patients', {
        headers: { 'Authorization': 'Bearer valid-token' }
      })
    );

    const responses = await Promise.all(requests);
    const rateLimited = responses.find(res => res.status === 429);

    if (rateLimited) {
      expect(rateLimited.headers.get('Retry-After')).toBeDefined();
    }
  });
});
```## Integration Testing Patterns

### 1. Service-to-Service Integration

```typescript
// Test integration between internal services
describe('Patient-Appointment Integration', () => {
  it('creates appointment when patient is registered', async () => {
    // Step 1: Create patient
    const patientRes = await app.request('/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer valid-token' },
      body: JSON.stringify({
        name: 'João Silva',
        cpf: '123.456.789-00',
        birthDate: '1985-03-15',
      })
    });

    const patient = await patientRes.json();
    expect(patient.patient.id).toBeDefined();

    // Step 2: Create appointment
    const appointmentRes = await app.request('/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer valid-token' },
      body: JSON.stringify({
        patientId: patient.patient.id,
        doctorId: 'doctor-123',
        scheduledFor: '2024-12-01T10:00:00Z',
        type: 'consultation'
      })
    });

    expect(appointmentRes.status).toBe(201);
    const appointment = await appointmentRes.json();
    expect(appointment.appointment.patientId).toBe(patient.patient.id);
  });

  it('validates cross-service constraints', async () => {
    // Try to create appointment with non-existent patient
    const appointmentRes = await app.request('/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer valid-token' },
      body: JSON.stringify({
        patientId: 'nonexistent-patient',
        doctorId: 'doctor-123',
        scheduledFor: '2024-12-01T10:00:00Z',
        type: 'consultation'
      })
    });

    expect(appointmentRes.status).toBe(400);
    const error = await appointmentRes.json();
    expect(error.message).toMatch(/patient.*not found/i);
  });
});
````

### 2. External Service Integration Testing

```typescript
// Test integration with external services (email, AI, payments)
import { MockAgent, setGlobalDispatcher } from 'undici'

describe('External Service Integration', () => {
  let mockAgent: MockAgent

  beforeEach(() => {
    mockAgent = new MockAgent()
    setGlobalDispatcher(mockAgent)
  })

  afterEach(async () => {
    await mockAgent.close()
  })

  it('sends email notification on patient registration', async () => {
    // Mock email service
    const mockPool = mockAgent.get('https://api.emailprovider.com')
    mockPool
      .intercept({
        path: '/send',
        method: 'POST',
      })
      .reply(200, { messageId: 'msg-123', status: 'sent' })

    // Register patient
    const res = await app.request('/patients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid-token',
      },
      body: JSON.stringify({
        name: 'João Silva',
        email: 'joao@email.com',
        cpf: '123.456.789-00',
        birthDate: '1985-03-15',
      }),
    })

    expect(res.status).toBe(201)

    // Verify email was sent (check logs or mock calls)
    // This would depend on your email service implementation
  })

  it('handles external service failures gracefully', async () => {
    // Mock email service failure
    const mockPool = mockAgent.get('https://api.emailprovider.com')
    mockPool
      .intercept({
        path: '/send',
        method: 'POST',
      })
      .reply(500, { error: 'Service temporarily unavailable' })

    // Register patient - should still succeed even if email fails
    const res = await app.request('/patients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid-token',
      },
      body: JSON.stringify({
        name: 'João Silva',
        email: 'joao@email.com',
        cpf: '123.456.789-00',
        birthDate: '1985-03-15',
      }),
    })

    // Patient creation should succeed
    expect(res.status).toBe(201)

    // But email failure should be logged
    // Check logs for email failure notification
  })
})
```

### 3. Database Integration Testing

```typescript
// Test database operations and transactions
describe('Database Integration', () => {
  beforeEach(async () => {
    // Setup test database
    await setupTestDatabase()
  })

  afterEach(async () => {
    // Cleanup test data
    await cleanupTestDatabase()
  })

  it('handles database transactions correctly', async () => {
    // Test that creates multiple related records in a transaction
    const res = await app.request('/patients/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid-token',
      },
      body: JSON.stringify({
        patients: [
          {
            name: 'João Silva',
            cpf: '123.456.789-00',
            birthDate: '1985-03-15',
          },
          {
            name: 'Maria Santos',
            cpf: '987.654.321-00',
            birthDate: '1990-08-22',
          },
          {
            name: 'Pedro Costa',
            cpf: '456.789.123-00',
            birthDate: '1978-12-05',
          },
        ],
      }),
    })

    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.patients).toHaveLength(3)
    expect(data.created).toBe(3)
  })

  it('rolls back transaction on partial failure', async () => {
    // Include one invalid record that should cause rollback
    const res = await app.request('/patients/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid-token',
      },
      body: JSON.stringify({
        patients: [
          {
            name: 'João Silva',
            cpf: '123.456.789-00',
            birthDate: '1985-03-15',
          },
          {
            name: 'Invalid Patient',
            cpf: 'invalid-cpf',
            birthDate: '1990-08-22',
          }, // Invalid CPF
          {
            name: 'Pedro Costa',
            cpf: '456.789.123-00',
            birthDate: '1978-12-05',
          },
        ],
      }),
    })

    expect(res.status).toBe(400)

    // Verify no patients were created (transaction rolled back)
    const checkRes = await app.request('/patients')
    const checkData = await checkRes.json()
    expect(checkData.total).toBe(0)
  })
})
```

## Monorepo Testing Strategies

### 1. Turborepo Integration

```bash
# Package-specific testing commands

# Run unit tests only for changed packages and their dependents
pnpm --filter ...^... test:unit

# Run all tests for specific app
pnpm --filter @neonpro/api test

# Run integration tests workspace-wide
pnpm test:integration

# Run tests with coverage for specific scope
pnpm --filter "@neonpro/api..." test:coverage

# Test only packages affected by changes
turbo test --filter=...[HEAD^]
```

### 2. Test Organization Structure

```
neonpro/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── patients.ts
│   │   │   │   └── patients.test.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts
│   │   │   │   └── auth.test.ts
│   │   │   └── utils/
│   │   │       └── validation.test.ts
│   │   ├── tests/
│   │   │   ├── integration/
│   │   │   ├── fixtures/
│   │   │   └── setup.ts
│   │   └── vitest.config.ts
│   └── web/
│       └── [frontend tests structure]
├── packages/
│   ├── shared-types/
│   │   ├── src/
│   │   └── tests/
│   ├── validators/
│   │   ├── src/
│   │   └── tests/
│   └── test-utils/
│       ├── src/
│       └── tests/
└── tools/
    └── testing/
        ├── configs/
        └── utilities/
```

### 3. Shared Testing Utilities

```typescript
// packages/test-utils/src/api-testing.ts
import type { Hono } from 'hono'

export interface TestApiOptions {
  authToken?: string
  baseUrl?: string
  timeout?: number
}

export class TestApiClient {
  constructor(
    private app: Hono,
    private options: TestApiOptions = {},
  ) {}

  async get(path: string, headers: Record<string, string> = {}) {
    return this.request('GET', path, undefined, headers)
  }

  async post(path: string, body?: any, headers: Record<string, string> = {}) {
    return this.request('POST', path, body, headers)
  }

  async put(path: string, body?: any, headers: Record<string, string> = {}) {
    return this.request('PUT', path, body, headers)
  }

  async delete(path: string, headers: Record<string, string> = {}) {
    return this.request('DELETE', path, undefined, headers)
  }

  private async request(
    method: string,
    path: string,
    body?: any,
    headers: Record<string, string> = {},
  ) {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(this.options.authToken && {
        Authorization: `Bearer ${this.options.authToken}`,
      }),
      ...headers,
    }

    const requestOptions = {
      method,
      headers: defaultHeaders,
      ...(body && { body: JSON.stringify(body) }),
    }

    return this.app.request(path, requestOptions)
  }

  // Helper methods for common patterns
  async expectSuccess(response: Response, expectedStatus = 200) {
    expect(response.status).toBe(expectedStatus)
    const data = await response.json()
    expect(data.error).toBeUndefined()
    return data
  }

  async expectError(response: Response, expectedStatus = 400) {
    expect(response.status).toBe(expectedStatus)
    const data = await response.json()
    expect(data.error || data.message).toBeDefined()
    return data
  }
}

// Usage in tests:
// const client = new TestApiClient(app, { authToken: 'valid-token' });
// const data = await client.expectSuccess(await client.get('/patients'));
```

### 4. Test Execution Order & Dependencies

````typescript
// tests/integration/test-order.config.ts
export const testExecutionOrder = {
  // Core infrastructure tests first
  phase1: [
    'database-connection',
    'authentication-setup',
    'middleware-initialization'
  ],

  // Service layer tests
  phase2: [
    'patient-service',
    'appointment-service',
    'notification-service'
  ],

  // Integration tests last
  phase3: [
    'patient-appointment-flow',
    'notification-integration',
    'billing-integration'
  ]
};

// Custom test runner with dependencies
export async function runOrderedTests() {
  for (const [phase, tests] of Object.entries(testExecutionOrder)) {
    console.log(`Running ${phase} tests...`);

    for (const testSuite of tests) {
      await import(`./suites/${testSuite}.test.ts`);
    }
  }
}
```## Coverage & Quality Metrics

### 1. Coverage Configuration

```typescript
// vitest.config.ts - API coverage setup
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.test.ts',
        '**/*.spec.ts',
        'tests/**',
        'coverage/**',
      ],
      thresholds: {
        // Healthcare API critical paths
        'src/routes/patients/**': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
        'src/routes/appointments/**': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
        // Important but less critical
        'src/middleware/**': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
        // Utilities and helpers
        'src/utils/**': {
          branches: 75,
          functions: 75,
          lines: 75,
          statements: 75,
        },
      },
    },
  },
});
````

### 2. Merge Coverage Reports

```bash
# Merge coverage from multiple packages
npx nyc merge coverage coverage/merged.json
npx nyc report --reporter=html --temp-dir=coverage --report-dir=coverage/html

# Generate combined coverage report
pnpm --filter="@neonpro/*" test:coverage
node scripts/merge-coverage.js
```

### 3. CI Integration with Coverage

```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - run: pnpm install

      - name: Run API Tests
        run: pnpm --filter @neonpro/api test:coverage
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
          JWT_SECRET: test-secret

      - name: Check Coverage Thresholds
        run: pnpm --filter @neonpro/api coverage:check

      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./apps/api/coverage/lcov.info
          flags: api
          name: API Coverage
```

## Architecture Testing Patterns

### 1. Service Layer Architecture

```typescript
// Test service architecture patterns
describe('Service Layer Architecture', () => {
  it('maintains proper service separation', async () => {
    // Test that patient service doesn't directly access appointment data
    const patientService = new PatientService()
    const appointmentService = new AppointmentService()

    // Services should communicate through defined interfaces
    expect(patientService.getAppointments).toBeUndefined()
    expect(() => {
      // This should fail - services shouldn't cross boundaries
      ;(patientService as any).directAppointmentAccess()
    }).toThrow()
  })

  it('enforces dependency injection patterns', () => {
    // Test that services receive dependencies rather than creating them
    const mockDb = vi.fn()
    const mockLogger = vi.fn()

    const service = new PatientService({
      database: mockDb,
      logger: mockLogger,
      emailService: vi.fn(),
    })

    expect(service.dependencies.database).toBe(mockDb)
    expect(service.dependencies.logger).toBe(mockLogger)
  })
})
```

### 2. API Contract Testing

```typescript
// Test API contracts and backward compatibility
describe('API Contract Validation', () => {
  it('maintains backward compatibility', async () => {
    // Test that API responses match expected schema
    const res = await app.request('/patients/123')
    const data = await res.json()

    // Use schema validation to ensure contract compliance
    const patientSchema = z.object({
      id: z.string(),
      name: z.string(),
      cpf: z.string(),
      birthDate: z.string(),
      createdAt: z.string(),
      updatedAt: z.string(),
      // These fields should always be present for backward compatibility
      email: z.string().optional(),
      phone: z.string().optional(),
    })

    expect(() => patientSchema.parse(data.patient)).not.toThrow()
  })

  it('validates request/response schemas', async () => {
    // Test schema evolution and versioning
    const v1Response = await app.request('/v1/patients/123')
    const v2Response = await app.request('/v2/patients/123')

    const v1Data = await v1Response.json()
    const v2Data = await v2Response.json()

    // V2 should be superset of V1
    expect(v2Data.patient).toMatchObject(v1Data.patient)
    expect(v2Data.patient.metadata).toBeDefined() // New field in v2
  })
})
```

### 3. Performance Testing

```typescript
// Test API performance characteristics
describe('API Performance', () => {
  it('responds within acceptable time limits', async () => {
    const start = Date.now()

    const res = await app.request('/patients?limit=100')

    const duration = Date.now() - start
    expect(duration).toBeLessThan(500) // 500ms SLA
    expect(res.status).toBe(200)
  })

  it('handles high concurrent load', async () => {
    const concurrentRequests = 50
    const requests = Array(concurrentRequests)
      .fill(null)
      .map(() => app.request('/patients/123'))

    const start = Date.now()
    const responses = await Promise.all(requests)
    const duration = Date.now() - start

    // All requests should succeed
    expect(responses.every((r) => r.status === 200)).toBe(true)

    // Should handle concurrent load efficiently
    expect(duration).toBeLessThan(2000) // 2s for 50 concurrent requests
  })
})
```

## Troubleshooting

### Common Issues

- **Issue**: Tests failing due to database connection timeouts
  **Solution**: Use connection pooling and proper test isolation with transactions

- **Issue**: Integration tests interfering with each other
  **Solution**: Use test databases with proper cleanup between tests

- **Issue**: Mock services not reflecting real API behavior
  **Solution**: Use contract testing and keep mocks in sync with real services

- **Issue**: Flaky tests due to timing issues
  **Solution**: Use proper async/await patterns and avoid arbitrary timeouts

### Performance Optimization

```typescript
// Optimize test performance
describe.concurrent('Patient API Endpoints', () => {
  // Run independent tests in parallel
  test('GET /patients', async () => {
    /* test implementation */
  })
  test('GET /patients/:id', async () => {
    /* test implementation */
  })
  test('POST /patients', async () => {
    /* test implementation */
  })
})

// Use test database transactions for isolation
beforeEach(async () => {
  await db.beginTransaction()
})

afterEach(async () => {
  await db.rollbackTransaction()
})
```

### Debugging Integration Tests

```typescript
// Debug integration test failures
import { createLogger } from '@/utils/logger'

const testLogger = createLogger('integration-test', 'debug')

describe('Patient-Appointment Integration', () => {
  it('debugs complex integration flow', async () => {
    testLogger.info('Starting patient creation')

    const patientRes = await app.request('/patients', {
      method: 'POST',
      body: JSON.stringify({
        /* patient data */
      }),
    })

    testLogger.info('Patient created', { status: patientRes.status })

    if (patientRes.status !== 201) {
      const error = await patientRes.json()
      testLogger.error('Patient creation failed', { error })
      throw new Error(`Patient creation failed: ${JSON.stringify(error)}`)
    }

    // Continue with appointment creation...
  })
})
```

## Examples

### Complete API Integration Test

```typescript
// Complete example combining all patterns
import { TestApiClient } from '@neonpro/test-utils'
import { createMockAppointment, createMockPatient } from './fixtures'
import { cleanupTestDatabase, setupTestDatabase } from './helpers/database'

describe('Healthcare API Integration', () => {
  let client: TestApiClient

  beforeAll(async () => {
    await setupTestDatabase()
    client = new TestApiClient(app, { authToken: 'valid-doctor-token' })
  })

  afterAll(async () => {
    await cleanupTestDatabase()
  })

  it('handles complete patient care workflow', async () => {
    // 1. Register new patient
    const patientData = createMockPatient()
    const createPatientRes = await client.post('/patients', patientData)
    const patient = await client.expectSuccess(createPatientRes, 201)

    // 2. Schedule appointment
    const appointmentData = createMockAppointment({
      patientId: patient.patient.id,
      doctorId: 'doctor-123',
    })
    const createAppointmentRes = await client.post(
      '/appointments',
      appointmentData,
    )
    const appointment = await client.expectSuccess(createAppointmentRes, 201)

    // 3. Update patient medical history
    const medicalUpdate = {
      conditions: ['Diabetes Tipo 2'],
      medications: ['Metformina 500mg'],
      allergies: ['Penicilina'],
    }
    const updateRes = await client.put(
      `/patients/${patient.patient.id}/medical`,
      medicalUpdate,
    )
    const updatedPatient = await client.expectSuccess(updateRes)

    // 4. Verify integration
    expect(updatedPatient.patient.medicalHistory).toMatchObject(medicalUpdate)
    expect(appointment.appointment.patientId).toBe(patient.patient.id)

    // 5. Test cascading operations
    const deleteRes = await client.delete(`/patients/${patient.patient.id}`)
    await client.expectSuccess(deleteRes)

    // Verify appointment was also handled appropriately
    const appointmentCheckRes = await client.get(
      `/appointments/${appointment.appointment.id}`,
    )
    const appointmentData = await client.expectError(appointmentCheckRes, 404)
    expect(appointmentData.message).toMatch(/appointment.*not found/i)
  })
})
```

## See Also

- [Frontend Testing](./front-end-testing.md) - Frontend integration patterns
- [Database Security Testing](./database-security-testing.md) - Database and RLS patterns
- [Code Review & Audit](./code-review-auditfix.md) - Quality gates and reviews
- [AGENTS.md](./AGENTS.md) - Testing orchestration guide
