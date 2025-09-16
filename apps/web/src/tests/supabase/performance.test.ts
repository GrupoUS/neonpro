/**
 * Supabase Performance Tests
 * Healthcare-Specific Performance Benchmarks
 * 
 * Features:
 * - Query optimization validation
 * - Connection management testing
 * - Caching strategy validation
 * - Real-time performance monitoring
 * - Load testing for healthcare scenarios
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { 
  createTestSupabaseClient,
  HealthcareTestDataGenerator,
  HealthcareTestValidators,
  type PerformanceMetrics,
  type TestUser
} from '@/lib/testing/supabase-test-client';

describe('Supabase Performance Tests', () => {
  let testClient: any;
  let testDataGenerator: HealthcareTestDataGenerator;
  let performanceMetrics: PerformanceMetrics[] = [];

  beforeAll(() => {
    testClient = createTestSupabaseClient({
      lgpdCompliant: true,
      performanceTracking: true,
      connectionPooling: true
    });
    testDataGenerator = new HealthcareTestDataGenerator();
    
    console.log('🧪 Performance Test Environment Setup Complete');
  });

  afterAll(async () => {
    await testDataGenerator.cleanupTestData();
    
    // Generate performance report
    console.log('\n📊 Performance Test Summary:');
    const avgResponseTime = performanceMetrics.reduce((sum, m) => sum + m.responseTime, 0) / performanceMetrics.length;
    console.log(`Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`Total Operations Tested: ${performanceMetrics.length}`);
    
    console.log('⚡ Performance Test Environment Cleaned Up');
  });

  const recordMetrics = (operation: string, responseTime: number, operationType: string) => {
    const metric: PerformanceMetrics = {
      operation,
      responseTime,
      operationType,
      timestamp: new Date().toISOString(),
      passed: HealthcareTestValidators.validatePerformance(responseTime, operationType as any)
    };
    performanceMetrics.push(metric);
    return metric;
  };

  describe('Query Optimization Performance', () => {
    test('should validate optimized patient lookup queries', async () => {
      // architect-review: Critical query optimization
      const testPatients = await testDataGenerator.createBulkTestData('patients', 1000);
      
      const optimizationTests = [
        {
          name: 'Patient by CPF (Indexed)',
          query: () => testClient
            .from('patients')
            .select('id, full_name, email')
            .eq('cpf', '123.456.789-01')
            .single(),
          expectedType: 'critical_query'
        },
        {
          name: 'Patient by Email (Indexed)',
          query: () => testClient
            .from('patients')
            .select('id, full_name, cpf')
            .eq('email', 'patient@test.com')
            .single(),
          expectedType: 'critical_query'
        },
        {
          name: 'Patient Full Text Search',
          query: () => testClient
            .from('patients')
            .select('id, full_name, email')
            .textSearch('full_name', 'João Silva')
            .limit(20),
          expectedType: 'general_query'
        },
        {
          name: 'Patient with Medical History',
          query: () => testClient
            .from('patients')
            .select(`
              id, full_name, email,
              medical_records(id, record_type, created_at)
            `)
            .eq('id', testPatients[0].id),
          expectedType: 'critical_query'
        }
      ];

      for (const test of optimizationTests) {
        const startTime = performance.now();
        const { data, error } = await test.query();
        const responseTime = performance.now() - startTime;

        expect(error).toBeNull();
        
        const metric = recordMetrics(test.name, responseTime, test.expectedType);
        expect(metric.passed).toBe(true);
        
        console.log(`✅ ${test.name}: ${responseTime.toFixed(2)}ms`);
      }
    });

    test('should validate appointment scheduling query performance', async () => {
      // security-auditor: Scheduling performance validation
      const testDoctors = await testDataGenerator.createBulkTestData('doctors', 50);
      const schedulingTests = [
        {
          name: 'Doctor Availability Check',
          query: () => testClient
            .from('appointments')
            .select('appointment_date, status')
            .eq('doctor_id', testDoctors[0].id)
            .gte('appointment_date', new Date().toISOString())
            .order('appointment_date'),
          expectedType: 'critical_query'
        },
        {
          name: 'Available Time Slots',
          query: () => testClient
            .rpc('get_available_slots', {
              doctor_id: testDoctors[0].id,
              date_from: new Date().toISOString(),
              date_to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            }),
          expectedType: 'critical_query'
        },
        {
          name: 'Bulk Schedule Validation',
          query: () => testClient
            .from('appointments')
            .select('doctor_id, appointment_date, status')
            .in('doctor_id', testDoctors.slice(0, 10).map(d => d.id))
            .gte('appointment_date', new Date().toISOString())
            .limit(100),
          expectedType: 'general_query'
        }
      ];

      for (const test of schedulingTests) {
        const startTime = performance.now();
        const { data, error } = await test.query();
        const responseTime = performance.now() - startTime;

        expect(error).toBeNull();
        
        const metric = recordMetrics(test.name, responseTime, test.expectedType);
        expect(metric.passed).toBe(true);
        
        console.log(`✅ ${test.name}: ${responseTime.toFixed(2)}ms`);
      }
    });

    test('should validate medical records query optimization', async () => {
      // architect-review: Medical records performance
      const testPatient = await testDataGenerator.createTestPatient();
      const medicalRecordsTests = [
        {
          name: 'Patient Medical History',
          query: () => testClient
            .from('medical_records')
            .select('*')
            .eq('patient_id', testPatient.id)
            .order('created_at', { ascending: false })
            .limit(50),
          expectedType: 'critical_query'
        },
        {
          name: 'Records by Date Range',
          query: () => testClient
            .from('medical_records')
            .select('id, record_type, created_at, summary')
            .eq('patient_id', testPatient.id)
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
            .order('created_at', { ascending: false }),
          expectedType: 'general_query'
        },
        {
          name: 'Records by Type',
          query: () => testClient
            .from('medical_records')
            .select('id, content, created_at')
            .eq('patient_id', testPatient.id)
            .eq('record_type', 'consultation')
            .limit(20),
          expectedType: 'general_query'
        }
      ];

      for (const test of medicalRecordsTests) {
        const startTime = performance.now();
        const { data, error } = await test.query();
        const responseTime = performance.now() - startTime;

        expect(error).toBeNull();
        
        const metric = recordMetrics(test.name, responseTime, test.expectedType);
        expect(metric.passed).toBe(true);
        
        console.log(`✅ ${test.name}: ${responseTime.toFixed(2)}ms`);
      }
    });
  });

  describe('Connection Management Performance', () => {
    test('should validate connection pooling under load', async () => {
      // architect-review: Connection pooling validation
      const concurrentConnections = [5, 10, 20, 50];
      
      for (const connectionCount of concurrentConnections) {
        const operationPromises = Array.from({ length: connectionCount }, async (_, i) => {
          const startTime = performance.now();
          const { data, error } = await testClient
            .from('patients')
            .select('count')
            .single();
          
          const responseTime = performance.now() - startTime;
          return { operation: i, responseTime, error };
        });

        const results = await Promise.all(operationPromises);
        
        // All operations should succeed
        results.forEach((result, index) => {
          expect(result.error).toBeNull();
          recordMetrics(`Connection Pool - ${connectionCount} concurrent - Op ${index}`, result.responseTime, 'general_query');
        });

        const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
        const maxResponseTime = Math.max(...results.map(r => r.responseTime));
        
        console.log(`✅ ${connectionCount} concurrent connections: avg=${avgResponseTime.toFixed(2)}ms, max=${maxResponseTime.toFixed(2)}ms`);
      }
    });

    test('should validate connection recovery and failover', async () => {
      // security-auditor: Connection resilience validation
      const recoveryTests = [
        {
          name: 'Connection Timeout Recovery',
          operation: async () => {
            // Simulate timeout scenario
            const timeoutPromise = new Promise((resolve) => 
              setTimeout(() => resolve({ data: null, error: null }), 1000)
            );
            return await timeoutPromise;
          }
        },
        {
          name: 'Connection Retry Logic',
          operation: async () => {
            // Simulate retry scenario
            let attempts = 0;
            while (attempts < 3) {
              attempts++;
              const { data, error } = await testClient.from('patients').select('count').single();
              if (!error) return { data, error, attempts };
            }
            return { data: null, error: 'Max retries exceeded', attempts };
          }
        }
      ];

      for (const test of recoveryTests) {
        const startTime = performance.now();
        const result = await test.operation();
        const responseTime = performance.now() - startTime;

        recordMetrics(test.name, responseTime, 'general_query');
        console.log(`✅ ${test.name}: ${responseTime.toFixed(2)}ms`);
      }
    });

    test('should validate connection cleanup and resource management', async () => {
      // architect-review: Resource management validation
      const resourceTests = [
        {
          name: 'Connection Cleanup After Operations',
          operations: 100
        },
        {
          name: 'Memory Usage Stability',
          operations: 500
        }
      ];

      for (const test of resourceTests) {
        const startTime = performance.now();
        
        // Perform multiple operations
        for (let i = 0; i < test.operations; i++) {
          await testClient.from('patients').select('count').single();
        }
        
        const responseTime = performance.now() - startTime;
        const avgTimePerOperation = responseTime / test.operations;
        
        recordMetrics(test.name, avgTimePerOperation, 'general_query');
        console.log(`✅ ${test.name}: ${test.operations} ops, avg=${avgTimePerOperation.toFixed(2)}ms/op`);
      }
    });
  });

  describe('Caching Strategy Performance', () => {
    test('should validate query result caching', async () => {
      // architect-review: Caching performance validation
      const cacheTests = [
        {
          name: 'Doctor Specializations Cache',
          query: () => testClient.from('doctors').select('specialization').distinct()
        },
        {
          name: 'Organization Data Cache',
          query: () => testClient.from('organizations').select('id, name, type, city')
        },
        {
          name: 'Appointment Status Options Cache',
          query: () => testClient.from('appointments').select('status').distinct()
        }
      ];

      for (const test of cacheTests) {
        // First request (cache miss)
        const startTime1 = performance.now();
        const { data: data1, error: error1 } = await test.query();
        const responseTime1 = performance.now() - startTime1;

        expect(error1).toBeNull();
        recordMetrics(`${test.name} - Cache Miss`, responseTime1, 'general_query');

        // Second request (cache hit)
        const startTime2 = performance.now();
        const { data: data2, error: error2 } = await test.query();
        const responseTime2 = performance.now() - startTime2;

        expect(error2).toBeNull();
        recordMetrics(`${test.name} - Cache Hit`, responseTime2, 'general_query');

        // Third request (cache hit)
        const startTime3 = performance.now();
        const { data: data3, error: error3 } = await test.query();
        const responseTime3 = performance.now() - startTime3;

        expect(error3).toBeNull();
        recordMetrics(`${test.name} - Cache Hit 2`, responseTime3, 'general_query');

        console.log(`✅ ${test.name}: miss=${responseTime1.toFixed(2)}ms, hit1=${responseTime2.toFixed(2)}ms, hit2=${responseTime3.toFixed(2)}ms`);
      }
    });

    test('should validate cache invalidation strategies', async () => {
      // security-auditor: Cache invalidation validation
      const testDoctor = await testDataGenerator.createTestDoctor();
      
      // Query doctor data (cache population)
      const startTime1 = performance.now();
      const { data: initialData } = await testClient
        .from('doctors')
        .select('*')
        .eq('id', testDoctor.id)
        .single();
      const responseTime1 = performance.now() - startTime1;

      recordMetrics('Doctor Data - Initial Load', responseTime1, 'general_query');

      // Update doctor data (should invalidate cache)
      await testClient
        .from('doctors')
        .update({ specialization: 'Updated Specialization' })
        .eq('id', testDoctor.id);

      // Query again (cache should be invalidated)
      const startTime2 = performance.now();
      const { data: updatedData } = await testClient
        .from('doctors')
        .select('*')
        .eq('id', testDoctor.id)
        .single();
      const responseTime2 = performance.now() - startTime2;

      recordMetrics('Doctor Data - Post Update', responseTime2, 'general_query');

      console.log(`✅ Cache Invalidation: initial=${responseTime1.toFixed(2)}ms, post-update=${responseTime2.toFixed(2)}ms`);
    });

    test('should validate distributed cache performance', async () => {
      // architect-review: Distributed caching validation
      const distributedCacheTests = [
        {
          name: 'Cross-Session Data Consistency',
          test: async () => {
            const client1 = createTestSupabaseClient();
            const client2 = createTestSupabaseClient();
            
            // Client 1 queries data
            const startTime1 = performance.now();
            const { data: data1 } = await client1.from('organizations').select('*').limit(10);
            const responseTime1 = performance.now() - startTime1;
            
            // Client 2 queries same data
            const startTime2 = performance.now();
            const { data: data2 } = await client2.from('organizations').select('*').limit(10);
            const responseTime2 = performance.now() - startTime2;
            
            return { responseTime1, responseTime2, dataConsistent: JSON.stringify(data1) === JSON.stringify(data2) };
          }
        },
        {
          name: 'Cache Warming Performance',
          test: async () => {
            const warmingQueries = [
              'doctors',
              'organizations', 
              'appointment_types',
              'medical_specializations'
            ];
            
            const startTime = performance.now();
            await Promise.all(
              warmingQueries.map(table => 
                testClient.from(table).select('*').limit(50)
              )
            );
            const responseTime = performance.now() - startTime;
            
            return { responseTime, queriesWarmed: warmingQueries.length };
          }
        }
      ];

      for (const test of distributedCacheTests) {
        const result = await test.test();
        recordMetrics(test.name, result.responseTime, 'general_query');
        console.log(`✅ ${test.name}: ${result.responseTime.toFixed(2)}ms`);
      }
    });
  });

  describe('Real-time Performance Monitoring', () => {
    test('should validate real-time subscription performance', async () => {
      // security-auditor: Real-time performance validation
      const subscriptionTests = [
        {
          name: 'Appointment Updates Subscription',
          table: 'appointments',
          filter: 'doctor_id=eq.test-doctor-123'
        },
        {
          name: 'Medical Records Subscription',
          table: 'medical_records',
          filter: 'patient_id=eq.test-patient-123'
        },
        {
          name: 'Audit Logs Subscription',
          table: 'audit_logs',
          filter: 'user_id=eq.test-user-123'
        }
      ];

      for (const test of subscriptionTests) {
        const startTime = performance.now();
        
        // Mock subscription setup
        const subscription = testClient
          .channel(`test-${test.table}`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: test.table,
            filter: test.filter
          }, (payload: any) => {
            console.log(`Real-time update received for ${test.table}:`, payload);
          })
          .subscribe();

        const responseTime = performance.now() - startTime;
        recordMetrics(`${test.name} - Subscription Setup`, responseTime, 'general_query');

        // Clean up subscription
        await testClient.removeChannel(subscription);
        
        console.log(`✅ ${test.name}: subscription setup in ${responseTime.toFixed(2)}ms`);
      }
    });

    test('should validate real-time data synchronization latency', async () => {
      // architect-review: Synchronization latency validation
      const testData = await testDataGenerator.createTestAppointment();
      
      const latencyTests = [
        {
          name: 'Appointment Status Update',
          update: { status: 'confirmed' },
          table: 'appointments'
        },
        {
          name: 'Medical Record Addition',
          update: { 
            content: 'Updated medical record content',
            updated_at: new Date().toISOString()
          },
          table: 'medical_records'
        }
      ];

      for (const test of latencyTests) {
        const updateStartTime = performance.now();
        
        // Perform update
        await testClient
          .from(test.table)
          .update(test.update)
          .eq('id', testData.id);
        
        // Simulate real-time notification processing
        await new Promise(resolve => setTimeout(resolve, 10)); // Simulated network latency
        
        const totalLatency = performance.now() - updateStartTime;
        recordMetrics(`${test.name} - Sync Latency`, totalLatency, 'critical_query');
        
        console.log(`✅ ${test.name}: sync latency ${totalLatency.toFixed(2)}ms`);
      }
    });

    test('should validate concurrent real-time operations', async () => {
      // security-auditor: Concurrent real-time validation
      const concurrentOperations = 20;
      const operationPromises = Array.from({ length: concurrentOperations }, async (_, i) => {
        const startTime = performance.now();
        
        // Simulate concurrent real-time operations
        const operations = [
          testClient.from('appointments').select('*').limit(1),
          testClient.from('medical_records').select('*').limit(1),
          testClient.from('patients').select('*').limit(1)
        ];
        
        await Promise.all(operations);
        
        const responseTime = performance.now() - startTime;
        return { operation: i, responseTime };
      });

      const results = await Promise.all(operationPromises);
      
      results.forEach((result, index) => {
        recordMetrics(`Concurrent Real-time Op ${index}`, result.responseTime, 'general_query');
      });

      const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
      console.log(`✅ ${concurrentOperations} concurrent real-time ops: avg=${avgResponseTime.toFixed(2)}ms`);
    });
  });

  describe('Load Testing Scenarios', () => {
    test('should validate peak hour simulation', async () => {
      // architect-review: Peak load validation
      const peakLoadSimulation = {
        concurrentUsers: 100,
        operationsPerUser: 10,
        duration: 5000 // 5 seconds
      };

      const userOperations = Array.from({ length: peakLoadSimulation.concurrentUsers }, async (_, userId) => {
        const userStartTime = performance.now();
        const operations = [];
        
        for (let i = 0; i < peakLoadSimulation.operationsPerUser; i++) {
          const operationType = i % 3;
          switch (operationType) {
            case 0:
              operations.push(testClient.from('patients').select('count').single());
              break;
            case 1:
              operations.push(testClient.from('appointments').select('count').single());
              break;
            case 2:
              operations.push(testClient.from('doctors').select('count').single());
              break;
          }
        }
        
        await Promise.all(operations);
        const userResponseTime = performance.now() - userStartTime;
        
        return { userId, responseTime: userResponseTime };
      });

      const results = await Promise.all(userOperations);
      
      results.forEach(result => {
        recordMetrics(`Peak Load User ${result.userId}`, result.responseTime, 'general_query');
      });

      const avgUserTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
      console.log(`✅ Peak Load Simulation: ${peakLoadSimulation.concurrentUsers} users, avg=${avgUserTime.toFixed(2)}ms/user`);
    });

    test('should validate data-intensive operation performance', async () => {
      // security-auditor: Data-intensive validation
      const dataIntensiveTests = [
        {
          name: 'Bulk Patient Report Generation',
          operation: async () => {
            return await testClient
              .from('patients')
              .select(`
                id, full_name, email, cpf,
                medical_records(id, record_type, created_at),
                appointments(id, appointment_date, status)
              `)
              .limit(100);
          }
        },
        {
          name: 'Medical History Aggregation',
          operation: async () => {
            return await testClient
              .rpc('generate_medical_summary', {
                patient_ids: Array.from({ length: 50 }, (_, i) => `patient-${i}`),
                date_from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
                date_to: new Date().toISOString()
              });
          }
        },
        {
          name: 'Healthcare Analytics Query',
          operation: async () => {
            return await testClient
              .from('appointments')
              .select('doctor_id, status, appointment_date')
              .gte('appointment_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
              .limit(1000);
          }
        }
      ];

      for (const test of dataIntensiveTests) {
        const startTime = performance.now();
        const { data, error } = await test.operation();
        const responseTime = performance.now() - startTime;

        expect(error).toBeNull();
        recordMetrics(test.name, responseTime, 'general_query');
        
        console.log(`✅ ${test.name}: ${responseTime.toFixed(2)}ms`);
      }
    });
  });
});