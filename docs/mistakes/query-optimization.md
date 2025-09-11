# Query Optimization Troubleshooting Guide

**NeonPro Healthcare Platform - TanStack Query Issues & Solutions**

This guide helps developers troubleshoot common issues with the optimized TanStack Query implementation.

## Common Issues & Solutions

### 1. Cache-Related Issues

#### Issue: Data Appears Stale

**Symptoms**: UI shows outdated patient information, appointments not reflecting recent changes

**Diagnosis**:

```typescript
// Check current cache configuration
const patientQuery = patientQueries.detail(patientId);
console.log('Stale time:', patientQuery.staleTime); // Should be 2 minutes for patients
console.log('GC time:', patientQuery.gcTime); // Should be 5 minutes for patients
```

**Solutions**:

```typescript
// 1. For real-time data, use audit queries
const { data: auditData } = useQuery(patientQueries.audit(patientId)); // Always fresh

// 2. Force refresh when needed
queryClient.invalidateQueries({ queryKey: ['patients', 'detail', patientId] });

// 3. Check if data is within healthcare compliance limits
// Patient data: 2min stale (LGPD requirement)
// If you need fresher data, consider if it's actually required for compliance
```

#### Issue: Cache Hit Rate Too Low

**Symptoms**: Performance monitoring shows <85% cache hit rate

**Diagnosis**:

```typescript
import { createPerformanceMonitor } from '@/lib/performance/healthcare-performance-monitor';

const performanceMonitor = createPerformanceMonitor(queryClient);
const report = performanceMonitor.reporting.generate();
console.log('Cache hit rate:', report.summary.cacheHitRate);
```

**Solutions**:

```typescript
// 1. Implement prefetching for common workflows
await healthcarePrefetchStrategy.prefetchPatientWorkflow(queryClient, patientId) // 2. Check query key consistency
  // ❌ Inconsistent keys
  ['patient', patientId]['patients', patientId] // ✅ Consistent keys
  ['patients', 'detail', patientId]['patients', 'detail', patientId];

// 3. Verify cache configuration
expect(patientQuery.staleTime).toBe(2 * 60 * 1000); // 2 minutes
```

### 2. Performance Issues

#### Issue: Slow Initial Page Load

**Symptoms**: First page load takes >500ms, poor user experience

**Diagnosis**:

```typescript
// Measure query execution time
const start = performance.now();
await queryClient.fetchQuery(patientQueries.detail(patientId));
const end = performance.now();
console.log('Query time:', end - start, 'ms');
```

**Solutions**:

```typescript
// 1. Implement parallel loading
// ❌ Sequential loading
await queryClient.fetchQuery(patientQueries.detail(patientId));
await queryClient.fetchQuery(appointmentQueries.patient(patientId));

// ✅ Parallel loading
await Promise.all([
  queryClient.fetchQuery(patientQueries.detail(patientId)),
  queryClient.fetchQuery(appointmentQueries.patient(patientId)),
]);

// 2. Use prefetching strategies
useEffect(() => {
  healthcarePrefetchStrategy.prefetchPatientWorkflow(queryClient, patientId);
}, [patientId]);

// 3. Optimize query functions
// ❌ Heavy processing in queryFn
queryFn: ;
(async () => {
  const data = await fetchPatient(patientId);
  return processHeavyData(data); // Move this to component
});

// ✅ Lightweight queryFn
queryFn: ;
(async () => fetchPatient(patientId));
```

#### Issue: Bundle Size Too Large

**Symptoms**: Bundle size >45KB, slow app loading

**Diagnosis**:

```bash
# Analyze bundle size
bun run build
bun run analyze # If available

# Check specific imports
grep -r "@tanstack" apps/web/lib/
```

**Solutions**:

```typescript
// 1. Use selective imports
// ❌ Import everything
import * as ReactQuery from '@tanstack/react-query'

// ✅ Import only what you need
import { useQuery, useMutation, queryOptions } from '@tanstack/react-query'

// 2. Avoid importing devtools in production
// ❌ Always imported
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// ✅ Conditional import
const ReactQueryDevtools = process.env.NODE_ENV === 'development' 
  ? require('@tanstack/react-query-devtools').ReactQueryDevtools 
  : () => null

// 3. Check for duplicate dependencies
bun pm ls | grep tanstack
```

### 3. Healthcare Compliance Issues

#### Issue: LGPD Compliance Violations

**Symptoms**: Data cached longer than allowed, audit failures

**Diagnosis**:

```typescript
// Check cache times against LGPD requirements
const patientQuery = patientQueries.detail(patientId);
const isLGPDCompliant = patientQuery.gcTime <= 5 * 60 * 1000; // ≤5 minutes

console.log('LGPD Compliant:', isLGPDCompliant);
console.log('Cache time:', patientQuery.gcTime / 1000 / 60, 'minutes');
```

**Solutions**:

```typescript
// 1. Use healthcare-compliant configuration
import { healthcareQueryConfig } from '@/lib/config/healthcare-query-config';

// Ensure all patient queries use compliant cache times
const patientQuery = queryOptions({
  queryKey: ['patients', 'detail', patientId],
  queryFn: fetchPatient,
  staleTime: healthcareQueryConfig.patient.staleTime, // 2 minutes
  gcTime: healthcareQueryConfig.patient.gcTime, // 5 minutes
});

// 2. Use audit queries for sensitive operations
const { data: auditData } = useQuery(patientQueries.audit(patientId));

// 3. Implement automatic cleanup
queryClient.setDefaultOptions({
  queries: {
    gcTime: Math.min(gcTime, 5 * 60 * 1000), // Never exceed 5 minutes
  },
});
```

#### Issue: ANVISA Compliance Issues

**Symptoms**: Medical data validation failures, professional access issues

**Solutions**:

```typescript
// 1. Validate professional access
const professionalQuery = queryOptions({
  queryKey: ['professionals', 'detail', professionalId],
  queryFn: async () => {
    const response = await fetchProfessional(professionalId);
    // ANVISA: Validate professional license
    if (!response.licenseValid) {
      throw new Error('Professional license invalid');
    }
    return response;
  },
  staleTime: healthcareQueryConfig.professional.staleTime, // 10 minutes
});

// 2. Implement medical data validation
const appointmentQuery = queryOptions({
  queryKey: ['appointments', 'detail', appointmentId],
  queryFn: async () => {
    const appointment = await fetchAppointment(appointmentId);
    // ANVISA: Validate medical procedure codes
    validateMedicalProcedures(appointment.procedures);
    return appointment;
  },
});
```

### 4. Testing Issues

#### Issue: Tests Failing Due to Cache

**Symptoms**: Tests interfering with each other, inconsistent results

**Solutions**:

```typescript
// 1. Clear cache between tests
afterEach(() => {
  queryClient.clear();
});

// 2. Use isolated test query clients
import { createTestQueryClient } from '@/test-utils/query-client';

beforeEach(() => {
  queryClient = createTestQueryClient();
});

// 3. Mock time-sensitive operations
vi.spyOn(Date, 'now').mockReturnValue(1234567890);
```

#### Issue: Performance Tests Inconsistent

**Symptoms**: Performance tests sometimes pass, sometimes fail

**Solutions**:

```typescript
// 1. Use consistent timing
vi.spyOn(performance, 'now').mockImplementation(() => Date.now());

// 2. Account for test environment overhead
const performanceThreshold = process.env.CI ? 200 : 100; // Higher threshold in CI

// 3. Use relative performance measurements
const baselineTime = await measureOperation(baselineOperation);
const optimizedTime = await measureOperation(optimizedOperation);
const improvement = (baselineTime - optimizedTime) / baselineTime;
expect(improvement).toBeGreaterThan(0.25); // 25% improvement
```

### 5. Development Issues

#### Issue: TypeScript Errors with Query Options

**Symptoms**: Type errors when using queryOptions pattern

**Solutions**:

```typescript
// 1. Ensure proper typing
import { queryOptions } from '@tanstack/react-query';

export const patientQueries = {
  detail: (patientId: string) =>
    queryOptions({
      queryKey: ['patients', 'detail', patientId] as const, // 'as const' is important
      queryFn: async (): Promise<Patient> => { // Explicit return type
        // ...
      },
    }),
};

// 2. Use type-safe query keys
type PatientQueryKey = ['patients', 'detail', string];

// 3. Extend types if needed
declare module '@tanstack/react-query' {
  interface Register {
    defaultError: ApiError;
  }
}
```

#### Issue: Hot Reload Issues

**Symptoms**: Changes not reflecting during development

**Solutions**:

```typescript
// 1. Clear cache on hot reload
if (process.env.NODE_ENV === 'development') {
  if (module.hot) {
    module.hot.accept(() => {
      queryClient.clear();
    });
  }
}

// 2. Use stable query keys
// ❌ Unstable keys
const queryKey = [Math.random(), patientId];

// ✅ Stable keys
const queryKey = ['patients', 'detail', patientId] as const;
```

## Debugging Tools

### 1. Performance Monitoring

```typescript
import { createPerformanceMonitor } from '@/lib/performance/healthcare-performance-monitor';

const performanceMonitor = createPerformanceMonitor(queryClient);

// Start monitoring
performanceMonitor.monitoring.start();

// Generate reports
const report = performanceMonitor.reporting.generate();
console.log('Performance Report:', report);
```

### 2. Cache Inspection

```typescript
// Inspect cache contents
console.log('Cache:', queryClient.getQueryCache().getAll());

// Check specific query
const queryData = queryClient.getQueryData(['patients', 'detail', patientId]);
console.log('Patient data:', queryData);

// Check query state
const queryState = queryClient.getQueryState(['patients', 'detail', patientId]);
console.log('Query state:', queryState);
```

### 3. Development Tools

```typescript
// Enable React Query Devtools in development
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <>
      {/* Your app */}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
    </>
  );
}
```

## Getting Help

### 1. Check Logs

```bash
# Check application logs
bun run dev --verbose

# Check test logs
bun test --verbose
```

### 2. Performance Analysis

```bash
# Run performance tests
bun test lib/performance/__tests__/

# Check bundle size
bun run build && ls -la dist/
```

### 3. Compliance Validation

```bash
# Run compliance tests
bun test --grep "compliance"
bun test --grep "LGPD"
bun test --grep "ANVISA"
```

---

**Need More Help?**

- Review [Query Optimization Documentation](../development/query-optimization.md)
- Check [Migration Guide](../guides/tanstack-query-migration.md)
- Run validation tests: `bun test lib/performance/__tests__/`
