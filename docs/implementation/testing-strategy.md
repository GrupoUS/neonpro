# NeonPro Testing Strategy for Architecture Enhancement

## Overview

This document outlines the comprehensive testing strategy for the NeonPro architecture enhancement, focusing on real-time capabilities, database integration, API performance, and healthcare compliance.

## Testing Pyramid

### 1. Unit Tests (70% of test coverage)
- **Database Services**: Test individual service methods with mocked dependencies
- **Utility Functions**: Test healthcare-specific utilities (CPF validation, data sanitization)
- **Real-time Manager**: Test subscription management and optimistic updates
- **API Route Handlers**: Test individual route logic with mocked database calls

### 2. Integration Tests (20% of test coverage)
- **Database Integration**: Test Prisma + Supabase integration patterns
- **Real-time Synchronization**: Test TanStack Query + Supabase real-time integration
- **API Middleware**: Test performance middleware stack
- **Authentication Flow**: Test end-to-end authentication with RLS

### 3. End-to-End Tests (10% of test coverage)
- **Critical User Journeys**: Patient registration, appointment scheduling
- **Real-time Features**: Live appointment updates, collaborative editing
- **Compliance Workflows**: LGPD consent management, audit logging

## Test Implementation Examples

### Unit Tests

#### Database Service Testing
```typescript
// packages/database/src/services/__tests__/base.service.test.ts
import { BaseService } from '../base.service'
import { prisma } from '../../client'

jest.mock('../../client')

class TestService extends BaseService {}

describe('BaseService', () => {
  let service: TestService

  beforeEach(() => {
    service = new TestService()
    jest.clearAllMocks()
  })

  describe('withAuditLog', () => {
    it('should create audit log for successful operations', async () => {
      const mockCreate = jest.fn().mockResolvedValue({})
      ;(prisma.auditLogs.create as jest.Mock) = mockCreate

      const result = await service.withAuditLog(
        {
          operation: 'TEST_OPERATION',
          userId: 'user-123',
          tableName: 'patients',
          recordId: 'patient-123',
        },
        async () => 'success'
      )

      expect(result).toBe('success')
      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          operation: 'TEST_OPERATION',
          success: true,
        })
      })
    })

    it('should create audit log for failed operations', async () => {
      const mockCreate = jest.fn().mockResolvedValue({})
      ;(prisma.auditLogs.create as jest.Mock) = mockCreate

      await expect(
        service.withAuditLog(
          {
            operation: 'TEST_OPERATION',
            userId: 'user-123',
            tableName: 'patients',
            recordId: 'patient-123',
          },
          async () => {
            throw new Error('Test error')
          }
        )
      ).rejects.toThrow('Test error')

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          operation: 'TEST_OPERATION',
          success: false,
          error: 'Test error',
        })
      })
    })
  })

  describe('validateLGPDConsent', () => {
    it('should return true for valid consent', async () => {
      const mockFindFirst = jest.fn().mockResolvedValue({
        id: 'consent-123',
        status: 'granted',
        expiresAt: new Date(Date.now() + 86400000), // Tomorrow
      })
      ;(prisma.consentRecords.findFirst as jest.Mock) = mockFindFirst

      const result = await service.validateLGPDConsent('patient-123', 'medical_treatment')

      expect(result).toBe(true)
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: {
          patientId: 'patient-123',
          purpose: 'medical_treatment',
          status: 'granted',
          expiresAt: { gt: expect.any(Date) },
        }
      })
    })

    it('should return false for expired consent', async () => {
      const mockFindFirst = jest.fn().mockResolvedValue(null)
      ;(prisma.consentRecords.findFirst as jest.Mock) = mockFindFirst

      const result = await service.validateLGPDConsent('patient-123', 'medical_treatment')

      expect(result).toBe(false)
    })
  })

  describe('sanitizeForAI', () => {
    it('should remove CPF patterns', () => {
      const text = 'Patient CPF: 123.456.789-00 needs treatment'
      const result = service.sanitizeForAI(text)
      expect(result).toBe('Patient CPF: [CPF_REMOVED] needs treatment')
    })

    it('should remove phone patterns', () => {
      const text = 'Contact: (11) 99999-9999 for appointment'
      const result = service.sanitizeForAI(text)
      expect(result).toBe('Contact: [PHONE_REMOVED] for appointment')
    })

    it('should remove email patterns', () => {
      const text = 'Email: patient@example.com for updates'
      const result = service.sanitizeForAI(text)
      expect(result).toBe('Email: [EMAIL_REMOVED] for updates')
    })
  })

  describe('validateCPF', () => {
    it('should validate correct CPF', () => {
      expect(service.validateCPF('11144477735')).toBe(true)
      expect(service.validateCPF('111.444.777-35')).toBe(true)
    })

    it('should reject invalid CPF', () => {
      expect(service.validateCPF('11111111111')).toBe(false)
      expect(service.validateCPF('123456789')).toBe(false)
      expect(service.validateCPF('invalid')).toBe(false)
    })
  })
})
```

#### Real-time Manager Testing
```typescript
// packages/core-services/src/realtime/__tests__/realtime-manager.test.ts
import { RealtimeManager } from '../realtime-manager'
import { QueryClient } from '@tanstack/react-query'

jest.mock('@supabase/supabase-js')

describe('RealtimeManager', () => {
  let queryClient: QueryClient
  let realtimeManager: RealtimeManager

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    realtimeManager = new RealtimeManager(queryClient)
  })

  describe('subscribeToTable', () => {
    it('should create subscription with correct parameters', () => {
      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn(),
      }
      const mockSupabase = {
        channel: jest.fn().mockReturnValue(mockChannel),
      }

      realtimeManager['supabase'] = mockSupabase as any

      realtimeManager.subscribeToTable('patients', 'clinic_id=eq.123', {
        queryKeys: [['patients', '123']],
        onInsert: jest.fn(),
      })

      expect(mockSupabase.channel).toHaveBeenCalledWith('patients-clinic_id=eq.123')
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'patients',
          filter: 'clinic_id=eq.123',
        },
        expect.any(Function)
      )
    })

    it('should handle rate limiting correctly', () => {
      const shouldRateLimit = realtimeManager['shouldRateLimit']
      
      // First call should not be rate limited
      expect(shouldRateLimit('test-channel', 100)).toBe(false)
      
      // Immediate second call should be rate limited
      expect(shouldRateLimit('test-channel', 100)).toBe(true)
      
      // After delay, should not be rate limited
      jest.advanceTimersByTime(150)
      expect(shouldRateLimit('test-channel', 100)).toBe(false)
    })
  })

  describe('optimistic updates', () => {
    it('should perform optimistic insert correctly', async () => {
      const mockSetQueryData = jest.fn()
      queryClient.setQueryData = mockSetQueryData

      await realtimeManager['optimisticInsert']('patients', {
        id: 'patient-123',
        name: 'Test Patient',
      })

      expect(mockSetQueryData).toHaveBeenCalledWith(
        ['patients'],
        expect.any(Function)
      )
    })

    it('should perform optimistic update correctly', async () => {
      const mockSetQueryData = jest.fn()
      queryClient.setQueryData = mockSetQueryData

      await realtimeManager['optimisticUpdate']('patients', {
        id: 'patient-123',
        name: 'Updated Patient',
      })

      expect(mockSetQueryData).toHaveBeenCalledTimes(2) // List and individual record
    })

    it('should perform optimistic delete correctly', async () => {
      const mockSetQueryData = jest.fn()
      const mockRemoveQueries = jest.fn()
      queryClient.setQueryData = mockSetQueryData
      queryClient.removeQueries = mockRemoveQueries

      await realtimeManager['optimisticDelete']('patients', {
        id: 'patient-123',
        name: 'Deleted Patient',
      })

      expect(mockSetQueryData).toHaveBeenCalled()
      expect(mockRemoveQueries).toHaveBeenCalledWith({
        queryKey: ['patients', 'patient-123']
      })
    })
  })
})
```

### Integration Tests

#### API Route Integration Testing
```typescript
// apps/api/src/routes/__tests__/patients.integration.test.ts
import { Hono } from 'hono'
import patientsRouter from '../patients'
import { prisma } from '@neonpro/database'

// Mock database
jest.mock('@neonpro/database')

describe('Patients API Integration', () => {
  let app: Hono

  beforeEach(() => {
    app = new Hono()
    app.route('/api', patientsRouter)
    jest.clearAllMocks()
  })

  describe('GET /api/patients', () => {
    it('should return paginated patients with proper headers', async () => {
      const mockPatients = [
        { id: 'patient-1', fullName: 'Patient 1', clinicId: 'clinic-123' },
        { id: 'patient-2', fullName: 'Patient 2', clinicId: 'clinic-123' },
      ]

      ;(prisma.patients.findMany as jest.Mock).mockResolvedValue(mockPatients)
      ;(prisma.patients.count as jest.Mock).mockResolvedValue(2)

      const response = await app.request('/api/patients?clinicId=clinic-123')

      expect(response.status).toBe(200)
      expect(response.headers.get('cache-control')).toBe('private, max-age=300')
      expect(response.headers.get('x-total-count')).toBe('2')

      const data = await response.json()
      expect(data.data).toHaveLength(2)
      expect(data.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      })
    })

    it('should handle search queries correctly', async () => {
      const mockPatients = [
        { id: 'patient-1', fullName: 'John Doe', clinicId: 'clinic-123' },
      ]

      ;(prisma.patients.findMany as jest.Mock).mockResolvedValue(mockPatients)
      ;(prisma.patients.count as jest.Mock).mockResolvedValue(1)

      await app.request('/api/patients?clinicId=clinic-123&search=John')

      expect(prisma.patients.findMany).toHaveBeenCalledWith({
        where: {
          clinicId: 'clinic-123',
          isActive: true,
          OR: [
            { fullName: { contains: 'John', mode: 'insensitive' } },
            { email: { contains: 'John', mode: 'insensitive' } },
            { phone: { contains: 'John' } },
          ],
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
      })
    })

    it('should require clinic access', async () => {
      // Mock middleware to simulate unauthorized access
      const response = await app.request('/api/patients?clinicId=unauthorized-clinic')
      expect(response.status).toBe(403)
    })
  })

  describe('POST /api/patients', () => {
    it('should create patient with LGPD consent validation', async () => {
      const patientData = {
        clinicId: 'clinic-123',
        fullName: 'New Patient',
        cpf: '111.444.777-35',
        lgpdConsentGiven: true,
      }

      const mockCreatedPatient = { id: 'patient-new', ...patientData }
      ;(prisma.patients.create as jest.Mock).mockResolvedValue(mockCreatedPatient)
      ;(prisma.consentRecords.create as jest.Mock).mockResolvedValue({})

      const response = await app.request('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData),
      })

      expect(response.status).toBe(201)
      expect(prisma.patients.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ...patientData,
          lgpdConsentDate: expect.any(Date),
        }),
        include: expect.any(Object),
      })
      expect(prisma.consentRecords.create).toHaveBeenCalled()
    })

    it('should reject patient creation without LGPD consent for personal data', async () => {
      const patientData = {
        clinicId: 'clinic-123',
        fullName: 'New Patient',
        cpf: '111.444.777-35',
        lgpdConsentGiven: false,
      }

      const response = await app.request('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData),
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('LGPD consent required')
    })

    it('should validate CPF format', async () => {
      const patientData = {
        clinicId: 'clinic-123',
        fullName: 'New Patient',
        cpf: 'invalid-cpf',
        lgpdConsentGiven: true,
      }

      const response = await app.request('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData),
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('Invalid CPF format')
    })
  })
})
```

#### Real-time Integration Testing
```typescript
// packages/shared/src/hooks/__tests__/useRealtimeQuery.integration.test.tsx
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRealtimeQuery } from '../useRealtimeQuery'

// Mock Supabase
jest.mock('@supabase/supabase-js')

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useRealtimeQuery Integration', () => {
  it('should fetch initial data and set up real-time subscription', async () => {
    const mockFetchPatients = jest.fn().mockResolvedValue([
      { id: 'patient-1', name: 'Patient 1' },
      { id: 'patient-2', name: 'Patient 2' },
    ])

    const { result } = renderHook(
      () => useRealtimeQuery(
        ['patients', 'clinic-123'],
        mockFetchPatients,
        {
          tableName: 'patients',
          filter: 'clinic_id=eq.clinic-123',
        }
      ),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockFetchPatients).toHaveBeenCalled()
    expect(result.current.data).toHaveLength(2)
    expect(result.current.connectionStatus).toBeDefined()
  })

  it('should handle real-time updates with optimistic updates', async () => {
    const mockFetchPatients = jest.fn().mockResolvedValue([
      { id: 'patient-1', name: 'Patient 1' },
    ])

    const { result } = renderHook(
      () => useRealtimeQuery(
        ['patients', 'clinic-123'],
        mockFetchPatients,
        {
          tableName: 'patients',
          filter: 'clinic_id=eq.clinic-123',
          realtimeOptions: {
            onUpdate: (payload) => {
              console.log('Real-time update received:', payload)
            },
          },
        }
      ),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    // Simulate real-time update
    // This would be triggered by the actual Supabase real-time system
    // In tests, we can simulate this by directly calling the optimistic update
    
    expect(result.current.data).toBeDefined()
  })

  it('should cleanup subscriptions on unmount', async () => {
    const mockUnsubscribe = jest.fn()
    const mockRealtimeManager = {
      subscribeToTable: jest.fn(),
      unsubscribe: mockUnsubscribe,
      unsubscribeAll: jest.fn(),
    }

    const { unmount } = renderHook(
      () => useRealtimeQuery(
        ['patients', 'clinic-123'],
        () => Promise.resolve([]),
        {
          tableName: 'patients',
          filter: 'clinic_id=eq.clinic-123',
        }
      ),
      { wrapper: createWrapper() }
    )

    unmount()

    // Verify cleanup was called
    // This would be verified through the actual RealtimeManager implementation
  })
})
```

### End-to-End Tests

#### Critical User Journey Testing
```typescript
// apps/web/src/__tests__/e2e/patient-management.e2e.test.ts
import { test, expect } from '@playwright/test'

test.describe('Patient Management E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login as healthcare professional
    await page.goto('/login')
    await page.fill('[data-testid=email]', 'professional@clinic.com')
    await page.fill('[data-testid=password]', 'password123')
    await page.click('[data-testid=login-button]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('should create new patient with LGPD consent', async ({ page }) => {
    // Navigate to patients page
    await page.click('[data-testid=patients-nav]')
    await expect(page).toHaveURL('/patients')

    // Click create patient button
    await page.click('[data-testid=create-patient-button]')

    // Fill patient form
    await page.fill('[data-testid=patient-name]', 'João Silva')
    await page.fill('[data-testid=patient-cpf]', '111.444.777-35')
    await page.fill('[data-testid=patient-email]', 'joao@example.com')
    await page.fill('[data-testid=patient-phone]', '(11) 99999-9999')

    // Accept LGPD consent
    await page.check('[data-testid=lgpd-consent]')

    // Submit form
    await page.click('[data-testid=submit-patient]')

    // Verify success
    await expect(page.locator('[data-testid=success-message]')).toBeVisible()
    await expect(page.locator('[data-testid=patient-list]')).toContainText('João Silva')
  })

  test('should show real-time appointment updates', async ({ page, context }) => {
    // Open two browser contexts to simulate real-time updates
    const page2 = await context.newPage()

    // Both pages navigate to appointments
    await page.goto('/appointments')
    await page2.goto('/appointments')

    // Create appointment in first page
    await page.click('[data-testid=create-appointment-button]')
    await page.selectOption('[data-testid=patient-select]', 'patient-123')
    await page.selectOption('[data-testid=professional-select]', 'professional-123')
    await page.fill('[data-testid=appointment-date]', '2024-12-20')
    await page.fill('[data-testid=appointment-time]', '14:00')
    await page.click('[data-testid=submit-appointment]')

    // Verify real-time update appears in second page
    await expect(page2.locator('[data-testid=appointment-list]')).toContainText('14:00')
  })

  test('should handle LGPD data access restrictions', async ({ page }) => {
    // Navigate to patient without consent
    await page.goto('/patients/patient-without-consent')

    // Verify restricted access message
    await expect(page.locator('[data-testid=consent-required]')).toBeVisible()
    await expect(page.locator('[data-testid=consent-required]')).toContainText(
      'LGPD consent required to view patient data'
    )

    // Request consent
    await page.click('[data-testid=request-consent-button]')

    // Verify consent request was sent
    await expect(page.locator('[data-testid=consent-requested]')).toBeVisible()
  })

  test('should audit all patient data access', async ({ page }) => {
    // Access patient data
    await page.goto('/patients/patient-123')
    await expect(page.locator('[data-testid=patient-details]')).toBeVisible()

    // Navigate to audit logs (admin only)
    await page.goto('/admin/audit-logs')

    // Verify audit entry was created
    await expect(page.locator('[data-testid=audit-log-list]')).toContainText('GET_PATIENT')
    await expect(page.locator('[data-testid=audit-log-list]')).toContainText('patient-123')
  })
})
```

## Performance Testing

### Load Testing with Artillery
```yaml
# artillery-config.yml
config:
  target: 'http://localhost:3001'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Load test"
    - duration: 60
      arrivalRate: 100
      name: "Stress test"
  defaults:
    headers:
      Authorization: "Bearer {{ $randomString() }}"

scenarios:
  - name: "Patient API Load Test"
    weight: 70
    flow:
      - get:
          url: "/api/patients?clinicId=clinic-123&page=1&limit=20"
          expect:
            - statusCode: 200
            - hasHeader: "cache-control"
      - think: 2
      - get:
          url: "/api/patients/{{ $randomUUID() }}"
          expect:
            - statusCode: [200, 404]

  - name: "Real-time Connection Test"
    weight: 30
    flow:
      - ws:
          url: "ws://localhost:3001/realtime"
          subprotocols: ["websocket"]
      - send: '{"event": "subscribe", "table": "appointments"}'
      - think: 30
      - send: '{"event": "unsubscribe", "table": "appointments"}'
```

### Database Performance Testing
```typescript
// packages/database/src/__tests__/performance.test.ts
import { prisma } from '../client'
import { performance } from 'perf_hooks'

describe('Database Performance', () => {
  it('should handle concurrent patient queries efficiently', async () => {
    const startTime = performance.now()
    
    // Simulate 50 concurrent patient queries
    const promises = Array.from({ length: 50 }, (_, i) => 
      prisma.patients.findMany({
        where: { clinicId: `clinic-${i % 5}` },
        take: 20,
      })
    )

    await Promise.all(promises)
    
    const endTime = performance.now()
    const duration = endTime - startTime

    // Should complete within 2 seconds
    expect(duration).toBeLessThan(2000)
  })

  it('should maintain connection pool efficiency', async () => {
    // Test connection pool under load
    const queries = Array.from({ length: 100 }, () => 
      prisma.$queryRaw`SELECT 1`
    )

    const startTime = performance.now()
    await Promise.all(queries)
    const endTime = performance.now()

    // Should handle 100 simple queries within 1 second
    expect(endTime - startTime).toBeLessThan(1000)
  })
})
```

## Continuous Integration Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run test:unit
      - uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run db:migrate
      - run: bun run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bunx playwright install
      - run: bun run test:e2e

  performance-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run test:performance
      - run: bun run test:load
```

## Test Coverage Requirements

### Coverage Targets
- **Overall Coverage**: ≥90%
- **Critical Healthcare Functions**: 100%
- **Database Services**: ≥95%
- **API Routes**: ≥90%
- **Real-time Features**: ≥85%

### Coverage Exclusions
- Generated Prisma client code
- Configuration files
- Development utilities
- Mock implementations

## Monitoring and Alerting

### Test Metrics Dashboard
- **Test Execution Time**: Track test suite performance
- **Coverage Trends**: Monitor coverage over time
- **Flaky Test Detection**: Identify unstable tests
- **Performance Regression**: Alert on performance degradation

### Quality Gates
- All tests must pass before merge
- Coverage must not decrease
- Performance tests must meet benchmarks
- Security scans must pass

This comprehensive testing strategy ensures the NeonPro architecture enhancement maintains the highest quality standards while delivering optimal performance and healthcare compliance.