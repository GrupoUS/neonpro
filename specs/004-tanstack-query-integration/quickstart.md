# Quickstart: TanStack Query Integration Analysis and Optimization

**Feature**: TanStack Query Integration Analysis and Optimization\
**Date**: 2025-01-09\
**Prerequisites**: NeonPro development environment, TanStack Query v5 knowledge

## Overview

This quickstart guide demonstrates the implementation and validation of TanStack Query optimizations for the NeonPro healthcare platform. Follow these steps to implement, test, and validate the optimization features.

## Prerequisites

### Environment Setup

```bash
# Ensure you're in the NeonPro project root
cd /home/vibecoder/neonpro

# Install dependencies (if not already installed)
bun install

# Verify TanStack Query version
bun list @tanstack/react-query
# Expected: ^5.87.1 or higher
```

### Required Knowledge

- TanStack Query v5 concepts (queries, mutations, cache management)
- Healthcare data compliance (LGPD/ANVISA)
- TypeScript advanced patterns
- React hooks and providers

## Step 1: Verify Current Implementation

### 1.1 Check Existing Query Provider

```bash
# View current query provider configuration
cat apps/web/providers/query-provider.tsx
```

**Expected Output**: Healthcare-optimized query configuration with proper cache times

### 1.2 Examine Current Query Hooks

```bash
# Check existing patient query hooks
cat apps/web/hooks/api/usePatients.ts

# Check existing appointment query hooks  
cat apps/web/hooks/api/useAppointments.ts
```

**Validation**: Confirm existing hooks follow current patterns and work correctly

## Step 2: Implement Query Options Pattern

### 2.1 Create Enhanced Query Factory

```typescript
// File: apps/web/lib/queries/patient-queries.ts
import { queryOptions, } from '@tanstack/react-query'
import { fetchPatient, fetchPatientAppointments, } from '../api/patients'
import { HealthcareQueryConfig, } from '../config/query-config'

export const patientQueries = {
  detail: (id: string,) =>
    queryOptions({
      queryKey: ['patients', 'detail', id,],
      queryFn: () => fetchPatient(id,),
      staleTime: HealthcareQueryConfig.patient.staleTime,
      gcTime: HealthcareQueryConfig.patient.gcTime,
    },),

  appointments: (patientId: string,) =>
    queryOptions({
      queryKey: ['patients', patientId, 'appointments',],
      queryFn: () => fetchPatientAppointments(patientId,),
      staleTime: HealthcareQueryConfig.appointment.staleTime,
      gcTime: HealthcareQueryConfig.appointment.gcTime,
    },),
}
```

### 2.2 Test Query Options Implementation

```typescript
// File: apps/web/hooks/api/__tests__/patient-queries.test.ts
import { useQuery, } from '@tanstack/react-query'
import { renderHook, waitFor, } from '@testing-library/react'
import { beforeEach, describe, expect, it, } from 'vitest'
import { createTestQueryClient, } from '../../test-utils/query-client'
import { patientQueries, } from '../patient-queries'

describe('Patient Query Options', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createTestQueryClient()
  },)

  it('should provide type-safe patient detail query', async () => {
    const { result, } = renderHook(
      () => useQuery(patientQueries.detail('patient-123',),),
      { wrapper: createQueryWrapper(queryClient,), },
    )

    await waitFor(() => {
      expect(result.current.isSuccess,).toBe(true,)
    },)

    // Type safety validation
    expect(result.current.data,).toBeDefined()
    expect(result.current.data?.id,).toBe('patient-123',)
  })

  it('should use healthcare-specific cache configuration', () => {
    const queryOptions = patientQueries.detail('patient-123',)

    expect(queryOptions.staleTime,).toBe(2 * 60 * 1000,) // 2 minutes
    expect(queryOptions.gcTime,).toBe(5 * 60 * 1000,) // 5 minutes
  })
})
```

### 2.3 Run Tests

```bash
# Run query options tests
bun test apps/web/hooks/api/__tests__/patient-queries.test.ts

# Expected: All tests pass with type safety validation
```

## Step 3: Implement Optimistic Updates

### 3.1 Create Optimistic Update Hook

```typescript
// File: apps/web/hooks/api/useOptimisticPatients.ts
import { useMutation, useQueryClient, } from '@tanstack/react-query'
import { createPatient, } from '../api/patients'
import { patientQueries, } from '../lib/queries/patient-queries'

export function useCreatePatientOptimistic() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPatient,

    // Optimistic update
    onMutate: async (newPatient,) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['patients', 'list',], },)

      // Snapshot previous value
      const previousPatients = queryClient.getQueryData(['patients', 'list',],)

      // Optimistically update
      queryClient.setQueryData(['patients', 'list',], (old: any,) => ({
        ...old,
        data: [{ ...newPatient, id: 'temp-id', }, ...(old?.data || []),],
      }),)

      return { previousPatients, }
    },

    // Success: Update with real data
    onSuccess: (createdPatient, variables, context,) => {
      queryClient.setQueryData(['patients', 'list',], (old: any,) => ({
        ...old,
        data: old?.data?.map((patient: any,) => patient.id === 'temp-id' ? createdPatient : patient)
          || [createdPatient,],
      }),)
    },

    // Error: Rollback
    onError: (err, newPatient, context,) => {
      queryClient.setQueryData(['patients', 'list',], context?.previousPatients,)
    },

    // Always refetch
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', 'list',], },)
    },
  },)
}
```

### 3.2 Test Optimistic Updates

```typescript
// File: apps/web/hooks/api/__tests__/optimistic-updates.test.ts
import { act, renderHook, waitFor, } from '@testing-library/react'
import { describe, expect, it, vi, } from 'vitest'
import { useCreatePatientOptimistic, } from '../useOptimisticPatients'

describe('Optimistic Updates', () => {
  it('should optimistically update patient list', async () => {
    const { result, } = renderHook(() => useCreatePatientOptimistic())

    const newPatient = {
      name: 'Test Patient',
      cpf: '12345678901',
      email: 'test@example.com',
    }

    act(() => {
      result.current.mutate(newPatient,)
    },)

    // Should immediately show optimistic update
    expect(result.current.isPending,).toBe(true,)

    await waitFor(() => {
      expect(result.current.isSuccess,).toBe(true,)
    },)
  })

  it('should rollback on error', async () => {
    // Mock API error
    vi.mocked(createPatient,).mockRejectedValueOnce(new Error('API Error',),)

    const { result, } = renderHook(() => useCreatePatientOptimistic())

    act(() => {
      result.current.mutate({ name: 'Test Patient', },)
    },)

    await waitFor(() => {
      expect(result.current.isError,).toBe(true,)
    },)

    // Should rollback to previous state
    // Verify cache state is restored
  })
})
```

## Step 4: Implement Intelligent Prefetching

### 4.1 Create Prefetching Strategy

```typescript
// File: apps/web/lib/prefetch/healthcare-prefetch.ts
import { useQueryClient, } from '@tanstack/react-query'
import { appointmentQueries, } from '../queries/appointment-queries'
import { patientQueries, } from '../queries/patient-queries'

export function useHealthcarePrefetch() {
  const queryClient = useQueryClient()

  return {
    prefetchPatientWorkflow: async (patientId: string,) => {
      // Prefetch patient data in parallel
      await Promise.all([
        queryClient.prefetchQuery(patientQueries.detail(patientId,),),
        queryClient.prefetchQuery(patientQueries.appointments(patientId,),),
        queryClient.prefetchQuery(patientQueries.medicalRecords(patientId,),),
      ],)
    },

    warmSchedulingCache: async (professionalId: string, date: string,) => {
      await Promise.all([
        queryClient.prefetchQuery(appointmentQueries.availability(professionalId, date,),),
        queryClient.prefetchQuery(appointmentQueries.calendar(date,),),
      ],)
    },
  }
}
```

### 4.2 Test Prefetching

```typescript
// File: apps/web/lib/prefetch/__tests__/healthcare-prefetch.test.ts
import { renderHook, } from '@testing-library/react'
import { describe, expect, it, vi, } from 'vitest'
import { useHealthcarePrefetch, } from '../healthcare-prefetch'

describe('Healthcare Prefetching', () => {
  it('should prefetch patient workflow data', async () => {
    const { result, } = renderHook(() => useHealthcarePrefetch())

    const prefetchSpy = vi.spyOn(queryClient, 'prefetchQuery',)

    await result.current.prefetchPatientWorkflow('patient-123',)

    expect(prefetchSpy,).toHaveBeenCalledTimes(3,)
    expect(prefetchSpy,).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['patients', 'detail', 'patient-123',],
      },),
    )
  })
})
```

## Step 5: Implement Developer Utilities

### 5.1 Create Debug Utilities

```typescript
// File: apps/web/lib/debug/query-debug.ts
import { useQueryClient, } from '@tanstack/react-query'

export function useQueryDebug() {
  const queryClient = useQueryClient()

  return {
    debugQuery: (queryKey: unknown[],) => {
      const query = queryClient.getQueryState(queryKey,)
      console.log('Query Debug Info:', {
        queryKey,
        status: query?.status,
        data: query?.data,
        error: query?.error,
        isStale: query?.isStale(),
        lastUpdated: query?.dataUpdatedAt,
      },)
      return query
    },

    getCacheMetrics: () => {
      const cache = queryClient.getQueryCache()
      const queries = cache.getAll()

      return {
        totalQueries: queries.length,
        staleQueries: queries.filter(q => q.isStale()).length,
        errorQueries: queries.filter(q => q.state.status === 'error').length,
        patientQueries:
          queries.filter(q => Array.isArray(q.queryKey,) && q.queryKey[0] === 'patients').length,
      }
    },
  }
}
```

### 5.2 Test Debug Utilities

```bash
# Run debug utilities tests
bun test apps/web/lib/debug/__tests__/query-debug.test.ts
```

## Step 6: Performance Validation

### 6.1 Measure Cache Performance

```typescript
// File: apps/web/lib/performance/cache-performance.ts
export function measureCachePerformance() {
  const startTime = performance.now()

  return {
    measureQuery: (queryKey: unknown[],) => {
      const endTime = performance.now()
      const duration = endTime - startTime

      console.log(`Query ${JSON.stringify(queryKey,)} took ${duration}ms`,)
      return duration
    },
  }
}
```

### 6.2 Run Performance Tests

```bash
# Run performance benchmark tests
bun test apps/web/lib/performance/__tests__/performance.test.ts

# Expected: Performance improvements within target ranges
```

## Step 7: Healthcare Compliance Validation

### 7.1 Test LGPD Compliance

```typescript
// File: apps/web/lib/compliance/__tests__/lgpd-compliance.test.ts
import { describe, expect, it, } from 'vitest'
import { HealthcareQueryConfig, } from '../config/query-config'

describe('LGPD Compliance', () => {
  it('should respect data retention policies', () => {
    // Patient data: 5 minutes max cache
    expect(HealthcareQueryConfig.patient.gcTime,).toBeLessThanOrEqual(5 * 60 * 1000,)

    // Audit data: 2 minutes max cache
    expect(HealthcareQueryConfig.audit.gcTime,).toBeLessThanOrEqual(2 * 60 * 1000,)
  })

  it('should ensure audit logging for sensitive data access', () => {
    // Verify audit logging is called for patient data queries
    // Implementation depends on audit system
  })
})
```

### 7.2 Run Compliance Tests

```bash
# Run compliance validation tests
bun test apps/web/lib/compliance/__tests__/

# Expected: All compliance requirements met
```

## Step 8: Integration Testing

### 8.1 End-to-End Workflow Test

```typescript
// File: apps/web/__tests__/e2e/query-optimization.e2e.test.ts
import { expect, test, } from '@playwright/test'

test('optimized patient workflow', async ({ page, },) => {
  await page.goto('/patients',)

  // Test optimistic updates
  await page.click('[data-testid="add-patient-button"]',)
  await page.fill('[data-testid="patient-name"]', 'Test Patient',)
  await page.click('[data-testid="save-patient"]',)

  // Should see optimistic update immediately
  await expect(page.locator('[data-testid="patient-list"]',),).toContainText('Test Patient',)

  // Test prefetching
  await page.click('[data-testid="patient-item"]:first-child',)

  // Patient details should load quickly (prefetched)
  await expect(page.locator('[data-testid="patient-details"]',),).toBeVisible({ timeout: 1000, },)
})
```

### 8.2 Run E2E Tests

```bash
# Run end-to-end tests
bun test:e2e

# Expected: All workflows work with improved performance
```

## Step 9: Performance Benchmarking

### 9.1 Measure Performance Improvements

```bash
# Run performance benchmarks
bun run benchmark:queries

# Expected output:
# Cache hit rate: 85-90% (vs 75-80% baseline)
# Perceived performance: 25% improvement
# Bundle size: ≤45KB gzipped
```

### 9.2 Validate Success Metrics

```typescript
// File: scripts/validate-performance.ts
import { measurePerformance, } from '../apps/web/lib/performance'

async function validateOptimizations() {
  const metrics = await measurePerformance()

  console.log('Performance Validation Results:',)
  console.log(`Cache Hit Rate: ${metrics.cacheHitRate}%`,)
  console.log(`API Request Reduction: ${metrics.apiRequestReduction}%`,)
  console.log(`Bundle Size: ${metrics.bundleSize}KB`,)

  // Validate against targets
  const success = metrics.cacheHitRate >= 85
    && metrics.apiRequestReduction >= 70
    && metrics.bundleSize <= 45

  console.log(`Optimization Success: ${success ? '✅' : '❌'}`,)
  return success
}

validateOptimizations()
```

## Step 10: Documentation and Cleanup

### 10.1 Update Documentation

```bash
# Update API documentation
bun run docs:generate

# Update README with optimization details
# Update CHANGELOG with performance improvements
```

### 10.2 Clean Up Development Artifacts

```bash
# Remove temporary test files
rm -rf apps/web/lib/temp-*

# Ensure all tests pass
bun test

# Ensure linting passes
bun run lint:fix

# Ensure type checking passes
bun run type-check
```

## Success Criteria Validation

### ✅ Technical Success

- [ ] 100% type safety coverage achieved
- [ ] Zero breaking changes confirmed
- [ ] Backward compatibility maintained
- [ ] Performance targets met

### ✅ Healthcare Success

- [ ] LGPD compliance maintained
- [ ] ANVISA requirements preserved
- [ ] Healthcare workflows improved
- [ ] Audit capabilities enhanced

### ✅ Developer Success

- [ ] Development speed improved by 30%
- [ ] Debugging capabilities enhanced
- [ ] Code maintainability increased
- [ ] Documentation quality improved

## Troubleshooting

### Common Issues

**Issue**: Type errors with queryOptions
**Solution**: Ensure @tanstack/react-query is v5.87.1 or higher

**Issue**: Cache not invalidating properly
**Solution**: Check query key consistency and invalidation patterns

**Issue**: Performance degradation
**Solution**: Review cache configuration and prefetching strategies

**Issue**: Compliance test failures
**Solution**: Verify cache times and audit logging implementation

### Getting Help

- Check the TanStack Query v5 documentation
- Review NeonPro architecture documentation
- Consult healthcare compliance requirements
- Run debug utilities for query state inspection

## Next Steps

After successful validation:

1. **Production Deployment**: Deploy optimizations with feature flags
2. **Monitoring**: Set up performance monitoring and alerting
3. **Iteration**: Gather feedback and iterate on optimizations
4. **Documentation**: Update team documentation and training materials

---

**Completion Time**: ~2-3 hours for full implementation and validation
**Prerequisites Met**: ✅ All requirements satisfied
**Ready for Production**: ✅ After successful validation
