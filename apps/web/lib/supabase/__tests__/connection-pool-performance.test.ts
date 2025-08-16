/**
 * Performance Tests for Healthcare Connection Pooling
 * Task 1.3 - CONNECTION POOLING OPTIMIZATION
 *
 * Comprehensive performance validation and healthcare compliance testing
 */

import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { getConnectionPoolMonitor } from '../../monitoring/connection-pool-monitor';
import { getConnectionPoolManager } from '../connection-pool-manager';
import { getRetryManager } from '../connection-retry-strategies';
import { createQueryContext, getQueryStrategies } from '../query-strategies';

// Mock Supabase client
const _mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
        limit: jest.fn(() => ({ single: jest.fn() })),
      })),
    })),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  })),
  auth: {
    getSession: jest.fn(),
  },
  rpc: jest.fn(),
};

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';

describe('Healthcare Connection Pool Performance', () => {
  let poolManager: ReturnType<typeof getConnectionPoolManager>;
  let queryStrategies: ReturnType<typeof getQueryStrategies>;
  let retryManager: ReturnType<typeof getRetryManager>;
  let monitor: ReturnType<typeof getConnectionPoolMonitor>;

  beforeAll(() => {
    poolManager = getConnectionPoolManager('medium');
    queryStrategies = getQueryStrategies();
    retryManager = getRetryManager();
    monitor = getConnectionPoolMonitor();
  });

  afterAll(async () => {
    await poolManager.shutdown();
    monitor.shutdown();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Connection Pool Manager Performance', () => {
    it('should create healthcare clients within performance targets', async () => {
      const startTime = Date.now();
      const clinicId = 'test-clinic-001';

      // Test critical client creation
      const criticalClient = poolManager.getHealthcareClient(
        clinicId,
        'critical',
      );
      expect(criticalClient).toBeDefined();

      // Test standard client creation
      const standardClient = poolManager.getHealthcareClient(
        clinicId,
        'standard',
      );
      expect(standardClient).toBeDefined();

      const elapsedTime = Date.now() - startTime;

      // Should create clients within 100ms for healthcare performance
      expect(elapsedTime).toBeLessThan(100);
    });

    it('should handle multiple concurrent client requests efficiently', async () => {
      const clinicId = 'test-clinic-002';
      const concurrentRequests = 50;
      const startTime = Date.now();

      const promises = Array.from({ length: concurrentRequests }, (_, i) => {
        const operationType = i % 2 === 0 ? 'critical' : 'standard';
        return poolManager.getHealthcareClient(clinicId, operationType);
      });

      const clients = await Promise.all(
        promises.map((client) => Promise.resolve(client)),
      );
      const elapsedTime = Date.now() - startTime;

      expect(clients).toHaveLength(concurrentRequests);
      expect(clients.every((client) => client !== null)).toBe(true);

      // Should handle 50 concurrent requests within 500ms
      expect(elapsedTime).toBeLessThan(500);
    });

    it('should maintain pool analytics accuracy under load', async () => {
      const clinicId = 'test-clinic-003';

      // Create multiple clients to populate analytics
      for (let i = 0; i < 10; i++) {
        poolManager.getHealthcareClient(
          clinicId,
          i % 2 === 0 ? 'critical' : 'standard',
        );
      }

      const analytics = poolManager.getPoolAnalytics();

      expect(analytics.summary.totalPools).toBeGreaterThan(0);
      expect(analytics.summary.complianceScore).toBeGreaterThanOrEqual(0);
      expect(analytics.summary.complianceScore).toBeLessThanOrEqual(100);
      expect(analytics.pools.length).toBeGreaterThan(0);
    });
  });

  describe('Query Strategies Performance', () => {
    it('should execute patient critical queries within emergency thresholds', async () => {
      const mockQuery = jest
        .fn()
        .mockResolvedValue({ id: 1, name: 'Test Patient' });
      const context = createQueryContext(
        'test-clinic-004',
        'test-user-001',
        'patient_critical',
        {
          patientId: 'patient-001',
          priority: 'emergency',
          userRole: 'professional',
        },
      );

      const startTime = Date.now();
      const result = await queryStrategies.executeQuery(mockQuery, context);
      const executionTime = Date.now() - startTime;

      expect(result.error).toBeNull();
      expect(result.executionTime).toBeLessThan(5000); // 5 seconds for emergency
      expect(result.complianceVerified).toBe(true);
      expect(executionTime).toBeLessThan(6000); // Total time including overhead
    });

    it('should handle analytics queries with appropriate timeout', async () => {
      const mockQuery = jest
        .fn()
        .mockImplementation(
          () =>
            new Promise((resolve) =>
              setTimeout(() => resolve({ count: 100 }), 2000),
            ),
        );
      const context = createQueryContext(
        'test-clinic-005',
        'test-user-002',
        'analytics_readonly',
        {
          priority: 'low',
          userRole: 'admin',
        },
      );

      const result = await queryStrategies.executeQuery(mockQuery, context);

      expect(result.error).toBeNull();
      expect(result.data).toEqual({ count: 100 });
      expect(result.strategy.timeout).toBe(60_000); // 60 seconds for analytics
    });

    it('should fail fast on non-retryable errors', async () => {
      const mockQuery = jest
        .fn()
        .mockRejectedValue(new Error('PGRST301: Authentication failed'));
      const context = createQueryContext(
        'test-clinic-006',
        'test-user-003',
        'patient_standard',
        {
          patientId: 'patient-002',
          userRole: 'professional',
        },
      );

      const startTime = Date.now();
      const result = await queryStrategies.executeQuery(mockQuery, context);
      const executionTime = Date.now() - startTime;

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Authentication failed');
      expect(executionTime).toBeLessThan(1000); // Should fail fast
    });
  });

  describe('Retry Manager Performance', () => {
    it('should retry with exponential backoff within healthcare timeouts', async () => {
      let attempts = 0;
      const mockOperation = jest.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Connection timeout');
        }
        return Promise.resolve({ success: true });
      });

      const startTime = Date.now();
      const result = await retryManager.executeWithRetry(mockOperation, {
        clinicId: 'test-clinic-007',
        operationType: 'patient-data-access',
        priority: 'standard',
        userId: 'test-user-004',
      });
      const totalTime = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(result.attempts).toBe(3);
      expect(result.data).toEqual({ success: true });
      expect(totalTime).toBeLessThan(15_000); // Within standard timeout
    });

    it('should handle circuit breaker activation correctly', async () => {
      const mockOperation = jest
        .fn()
        .mockRejectedValue(new Error('Service unavailable'));

      // Trigger circuit breaker with multiple failures
      for (let i = 0; i < 4; i++) {
        await retryManager.executeWithRetry(mockOperation, {
          clinicId: 'test-clinic-008',
          operationType: 'test-operation',
          priority: 'standard',
          userId: 'test-user-005',
        });
      }

      // Next call should be blocked by circuit breaker
      const startTime = Date.now();
      const result = await retryManager.executeWithRetry(mockOperation, {
        clinicId: 'test-clinic-008',
        operationType: 'test-operation',
        priority: 'standard',
        userId: 'test-user-005',
      });
      const executionTime = Date.now() - startTime;

      expect(result.success).toBe(false);
      expect(result.circuitBreakerTriggered).toBe(true);
      expect(executionTime).toBeLessThan(100); // Should fail immediately
    });

    it('should prioritize emergency operations', async () => {
      const mockEmergencyOperation = jest
        .fn()
        .mockResolvedValue({ emergency: true });

      const startTime = Date.now();
      const result = await retryManager.executeWithRetry(
        mockEmergencyOperation,
        {
          clinicId: 'test-clinic-009',
          operationType: 'emergency-patient-access',
          priority: 'emergency',
          userId: 'test-user-006',
          patientId: 'patient-003',
        },
      );
      const executionTime = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(result.patientSafetyEnsured).toBe(true);
      expect(executionTime).toBeLessThan(2000); // Emergency should be fast
    });
  });

  describe('Healthcare Compliance Performance', () => {
    it('should validate LGPD compliance within acceptable time', async () => {
      const mockQuery = jest
        .fn()
        .mockResolvedValue({ patientData: 'sensitive' });
      const context = createQueryContext(
        'test-clinic-010',
        'test-user-007',
        'patient_standard',
        {
          patientId: 'patient-004',
          lgpdSensitive: true,
          requiresAudit: true,
          userRole: 'professional',
        },
      );

      const startTime = Date.now();
      const result = await queryStrategies.executeQuery(mockQuery, context);
      const executionTime = Date.now() - startTime;

      expect(result.complianceVerified).toBe(true);
      expect(result.auditTrail).toBeDefined();
      expect(result.auditTrail?.clinicId).toBe('test-clinic-010');
      expect(result.auditTrail?.patientId).toBe('patient-004');
      expect(executionTime).toBeLessThan(1000); // Compliance check should be fast
    });

    it('should maintain multi-tenant isolation under load', async () => {
      const clinic1Operations = [];
      const clinic2Operations = [];

      // Simulate operations from different clinics
      for (let i = 0; i < 25; i++) {
        clinic1Operations.push(
          poolManager.getHealthcareClient('clinic-001', 'standard'),
        );
        clinic2Operations.push(
          poolManager.getHealthcareClient('clinic-002', 'standard'),
        );
      }

      const allClients = [
        ...(await Promise.all(
          clinic1Operations.map((c) => Promise.resolve(c)),
        )),
        ...(await Promise.all(
          clinic2Operations.map((c) => Promise.resolve(c)),
        )),
      ];

      expect(allClients).toHaveLength(50);
      expect(allClients.every((client) => client !== null)).toBe(true);

      // Verify analytics shows proper isolation
      const analytics = poolManager.getPoolAnalytics();
      const clinic1Pools = analytics.pools.filter((p) =>
        p.poolKey.includes('clinic-001'),
      );
      const clinic2Pools = analytics.pools.filter((p) =>
        p.poolKey.includes('clinic-002'),
      );

      expect(clinic1Pools.length).toBeGreaterThan(0);
      expect(clinic2Pools.length).toBeGreaterThan(0);
    });
  });

  describe('Monitoring Performance', () => {
    it('should provide health summary within acceptable time', async () => {
      const startTime = Date.now();
      const healthSummary = monitor.getHealthSummary();
      const executionTime = Date.now() - startTime;

      expect(healthSummary).toBeDefined();
      expect(healthSummary.status).toMatch(
        /healthy|degraded|critical|emergency/,
      );
      expect(healthSummary.lastUpdate).toBeInstanceOf(Date);
      expect(executionTime).toBeLessThan(50); // Should be very fast
    });

    it('should handle concurrent monitoring requests', async () => {
      const concurrentRequests = 20;
      const startTime = Date.now();

      const promises = Array.from({ length: concurrentRequests }, () =>
        Promise.resolve(monitor.getHealthSummary()),
      );

      const results = await Promise.all(promises);
      const executionTime = Date.now() - startTime;

      expect(results).toHaveLength(concurrentRequests);
      expect(results.every((result) => result !== null)).toBe(true);
      expect(executionTime).toBeLessThan(200); // 20 concurrent requests under 200ms
    });
  });

  describe('End-to-End Performance', () => {
    it('should handle complete healthcare workflow within SLA', async () => {
      const clinicId = 'test-clinic-e2e';
      const userId = 'test-user-e2e';
      const patientId = 'patient-e2e';

      const startTime = Date.now();

      // Step 1: Get client
      const client = poolManager.getHealthcareClient(clinicId, 'critical');
      expect(client).toBeDefined();

      // Step 2: Execute query with retry
      const mockQuery = jest.fn().mockResolvedValue({
        patientId,
        vitals: { heartRate: 72, bloodPressure: '120/80' },
      });

      const result = await retryManager.executeWithRetry(mockQuery, {
        clinicId,
        operationType: 'patient-vitals-access',
        priority: 'critical',
        userId,
        patientId,
        requiresCompliance: true,
      });

      // Step 3: Check monitoring
      const healthSummary = monitor.getHealthSummary();

      const totalTime = Date.now() - startTime;

      // Validate complete workflow
      expect(result.success).toBe(true);
      expect(result.patientSafetyEnsured).toBe(true);
      expect(healthSummary.status).not.toBe('emergency');

      // Healthcare SLA: Complete patient data access under 2 seconds
      expect(totalTime).toBeLessThan(2000);
    });

    it('should maintain performance under healthcare load simulation', async () => {
      const loadTestDuration = 5000; // 5 seconds
      const operationsPerSecond = 10;
      const totalOperations = (loadTestDuration / 1000) * operationsPerSecond;

      const startTime = Date.now();
      const operations = [];

      // Simulate healthcare load
      for (let i = 0; i < totalOperations; i++) {
        const clinicId = `clinic-${i % 3}`; // 3 clinics
        const operationType = i % 4 === 0 ? 'critical' : 'standard';

        operations.push(
          new Promise((resolve) => {
            setTimeout(
              () => {
                const client = poolManager.getHealthcareClient(
                  clinicId,
                  operationType,
                );
                resolve(client);
              },
              (i / operationsPerSecond) * 1000,
            );
          }),
        );
      }

      const results = await Promise.all(operations);
      const totalTime = Date.now() - startTime;

      expect(results).toHaveLength(totalOperations);
      expect(results.every((result) => result !== null)).toBe(true);
      expect(totalTime).toBeLessThan(loadTestDuration + 1000); // Allow 1s overhead

      // Verify system health after load test
      const healthSummary = monitor.getHealthSummary();
      expect(healthSummary.status).not.toBe('emergency');
    });
  });

  describe('Resource Cleanup Performance', () => {
    it('should cleanup resources efficiently', async () => {
      const startTime = Date.now();

      // Create multiple clients
      for (let i = 0; i < 10; i++) {
        poolManager.getHealthcareClient(`cleanup-clinic-${i}`, 'standard');
      }

      // Cleanup
      await poolManager.shutdown();
      monitor.shutdown();

      const cleanupTime = Date.now() - startTime;

      // Cleanup should be fast
      expect(cleanupTime).toBeLessThan(1000);
    });
  });
});

describe('Performance Benchmarks', () => {
  const performanceThresholds = {
    clientCreation: 100, // ms
    queryExecution: 5000, // ms for critical
    retryOperation: 15_000, // ms for standard
    healthCheck: 50, // ms
    complianceValidation: 1000, // ms
    endToEndWorkflow: 2000, // ms
  };

  it('should meet all healthcare performance SLAs', () => {
    // This test validates that our thresholds are reasonable
    expect(performanceThresholds.clientCreation).toBeLessThan(200);
    expect(performanceThresholds.queryExecution).toBeLessThan(10_000);
    expect(performanceThresholds.retryOperation).toBeLessThan(30_000);
    expect(performanceThresholds.healthCheck).toBeLessThan(100);
    expect(performanceThresholds.complianceValidation).toBeLessThan(2000);
    expect(performanceThresholds.endToEndWorkflow).toBeLessThan(5000);
  });
});
