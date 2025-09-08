// AI Services Performance Testing Suite
// Load testing, stress testing, and performance benchmarking for AI services

import { performance, } from 'node:perf_hooks'
import { afterAll, beforeAll, describe, expect, it, } from 'vitest'

// Performance Test Configuration
const PERF_TEST_CONFIG = {
  thresholds: {
    // Response time thresholds (ms)
    chat_response_p95: 2000,
    chat_response_avg: 1200,
    compliance_check_p95: 1000,
    compliance_check_avg: 600,
    conversation_analysis_p95: 1500,
    conversation_analysis_avg: 900,

    // Throughput thresholds (requests/second)
    chat_throughput_min: 50,
    compliance_throughput_min: 100,
    analysis_throughput_min: 30,

    // Resource usage thresholds
    memory_usage_max_mb: 512,
    cpu_usage_max_percent: 80,

    // Error rates
    error_rate_max_percent: 1,

    // Concurrent user limits
    max_concurrent_users: 500,
    max_concurrent_sessions: 1000,
  },

  test_scenarios: {
    light_load: {
      concurrent_users: 10,
      duration_minutes: 2,
      ramp_up_seconds: 30,
    },
    normal_load: {
      concurrent_users: 50,
      duration_minutes: 5,
      ramp_up_seconds: 60,
    },
    stress_load: {
      concurrent_users: 200,
      duration_minutes: 10,
      ramp_up_seconds: 120,
    },
    spike_load: {
      concurrent_users: 500,
      duration_minutes: 3,
      ramp_up_seconds: 10,
    },
  },
}

// Performance Test Utilities
class PerformanceTestUtils {
  private static measurements: Map<string, number[]> = new Map()
  private static errors: Map<string, Error[]> = new Map()

  static startMeasurement(testName: string,): () => number {
    const startTime = performance.now()

    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime

      if (!PerformanceTestUtils.measurements.has(testName,)) {
        PerformanceTestUtils.measurements.set(testName, [],)
      }

      PerformanceTestUtils.measurements.get(testName,)?.push(duration,)
      return duration
    }
  }

  static recordError(testName: string, error: Error,): void {
    if (!PerformanceTestUtils.errors.has(testName,)) {
      PerformanceTestUtils.errors.set(testName, [],)
    }

    PerformanceTestUtils.errors.get(testName,)?.push(error,)
  }

  static getStatistics(testName: string,): {
    count: number
    min: number
    max: number
    avg: number
    p50: number
    p95: number
    p99: number
    errorRate: number
  } {
    const times = PerformanceTestUtils.measurements.get(testName,) || []
    const errors = PerformanceTestUtils.errors.get(testName,) || []

    if (times.length === 0) {
      return {
        count: 0,
        min: 0,
        max: 0,
        avg: 0,
        p50: 0,
        p95: 0,
        p99: 0,
        errorRate: 0,
      }
    }

    const sorted = [...times,].sort((a, b,) => a - b)
    const { length: count, } = times
    const totalRequests = count + errors.length

    return {
      count,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: times.reduce((a, b,) => a + b, 0,) / count,
      p50: sorted[Math.floor(count * 0.5,)],
      p95: sorted[Math.floor(count * 0.95,)],
      p99: sorted[Math.floor(count * 0.99,)],
      errorRate: totalRequests > 0 ? (errors.length / totalRequests) * 100 : 0,
    }
  }

  static clearMeasurements(): void {
    PerformanceTestUtils.measurements.clear()
    PerformanceTestUtils.errors.clear()
  }

  static async simulateLoad(
    testFunction: () => Promise<unknown>,
    concurrentUsers: number,
    durationMinutes: number,
    rampUpSeconds: number,
    testName: string,
  ): Promise<void> {
    // console.log(`Starting load test: ${testName}`);
    // console.log(
    //   `Concurrent Users: ${concurrentUsers}, Duration: ${durationMinutes}min, Ramp-up: ${rampUpSeconds}s`,
    // );

    const _totalRequests: Promise<void>[] = []
    const endTime = Date.now() + durationMinutes * 60 * 1000

    // Ramp up users gradually
    const rampUpInterval = (rampUpSeconds * 1000) / concurrentUsers

    for (let i = 0; i < concurrentUsers; i++) {
      setTimeout(async () => {
        // Each user makes requests until test ends
        while (Date.now() < endTime) {
          const stopTimer = PerformanceTestUtils.startMeasurement(testName,)

          try {
            await testFunction()
            stopTimer()
          } catch (_error) {
            stopTimer()
            PerformanceTestUtils.recordError(testName, _error as Error,)
          }

          // Small delay between requests (100-500ms)
          await new Promise((resolve,) => setTimeout(resolve, 100 + Math.random() * 400,))
        }
      }, i * rampUpInterval,)
    }

    // Wait for test duration + ramp up time
    await new Promise((resolve,) =>
      setTimeout(
        resolve,
        durationMinutes * 60 * 1000 + rampUpSeconds * 1000 + 5000,
      )
    )
  }
}

// Mock API client for performance testing
class MockAIServiceClient {
  private baseUrl: string

  constructor(baseUrl = 'http://localhost:3001',) {
    this.baseUrl = baseUrl
  }

  async sendChatMessage(sessionId: string, message: string,): Promise<unknown> {
    const response = await fetch(
      `${this.baseUrl}/api/ai/universal-chat/message`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-jwt-token',
        },
        body: JSON.stringify({
          session_id: sessionId,
          message,
          context: {
            emergency_detection: true,
            compliance_check: true,
          },
        },),
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`,)
    }

    return response.json()
  }

  async validateCompliance(data: unknown,): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/api/ai/compliance/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-jwt-token',
      },
      body: JSON.stringify(data,),
    },)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`,)
    }

    return response.json()
  }

  async analyzeConversation(sessionId: string,): Promise<unknown> {
    const response = await fetch(
      `${this.baseUrl}/api/ai/conversation/analyze`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-jwt-token',
        },
        body: JSON.stringify({
          session_id: sessionId,
          analysis_type: 'comprehensive',
        },),
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`,)
    }

    return response.json()
  }
}

// Performance Tests
describe('aI Services Performance Tests', () => {
  let client: MockAIServiceClient

  beforeAll(async () => {
    client = new MockAIServiceClient()
    // console.log("Performance testing initialized");
  },)

  afterAll(() => {
    PerformanceTestUtils.clearMeasurements()
    // console.log("Performance testing completed");
  },)

  describe('universal AI Chat Performance', () => {
    const testMessages = [
      'Estou sentindo dores no peito há 2 horas',
      'Tenho diabetes e minha glicemia está alta',
      'Preciso de ajuda com minha medicação',
      'Estou com sintomas de gripe',
      'Quando devo procurar o hospital?',
      'Minha pressão arterial está alterada',
      'Tenho dúvidas sobre o meu tratamento',
      'Como posso melhorar minha alimentação?',
      'Estou preocupado com os resultados dos exames',
      'Preciso remarcar minha consulta',
    ]

    it('should handle single chat requests within performance thresholds', async () => {
      const testSessionId = `perf-test-session-${Date.now()}`
      const testMessage = testMessages[Math.floor(Math.random() * testMessages.length,)]

      const stopTimer = PerformanceTestUtils.startMeasurement(
        'single_chat_request',
      )

      try {
        const result = await client.sendChatMessage(testSessionId, testMessage,)
        const duration = stopTimer()

        expect(result.success,).toBeTruthy()
        expect(duration,).toBeLessThan(
          PERF_TEST_CONFIG.thresholds.chat_response_p95,
        )

        console.log(
          `Single chat request completed in ${duration.toFixed(2,)}ms`,
        )
      } catch (_error) {
        PerformanceTestUtils.recordError('single_chat_request', _error as Error,)
        throw _error
      }
    }, 30_000,)

    it('should maintain performance under light load', async () => {
      const scenario = PERF_TEST_CONFIG.test_scenarios.light_load

      await PerformanceTestUtils.simulateLoad(
        async () => {
          const testSessionId = `light-load-session-${Date.now()}-${Math.random()}`
          const testMessage = testMessages[Math.floor(Math.random() * testMessages.length,)]
          await client.sendChatMessage(testSessionId, testMessage,)
        },
        scenario.concurrent_users,
        scenario.duration_minutes,
        scenario.ramp_up_seconds,
        'chat_light_load',
      )

      const stats = PerformanceTestUtils.getStatistics('chat_light_load',)

      console.log('Light Load Chat Performance:', {
        requests: stats.count,
        avgResponseTime: `${stats.avg.toFixed(2,)}ms`,
        p95ResponseTime: `${stats.p95.toFixed(2,)}ms`,
        errorRate: `${stats.errorRate.toFixed(2,)}%`,
      },)

      expect(stats.avg,).toBeLessThan(
        PERF_TEST_CONFIG.thresholds.chat_response_avg,
      )
      expect(stats.p95,).toBeLessThan(
        PERF_TEST_CONFIG.thresholds.chat_response_p95,
      )
      expect(stats.errorRate,).toBeLessThan(
        PERF_TEST_CONFIG.thresholds.error_rate_max_percent,
      )
    }, 180_000,) // 3 minutes timeout

    it('should handle normal production load', async () => {
      const scenario = PERF_TEST_CONFIG.test_scenarios.normal_load

      await PerformanceTestUtils.simulateLoad(
        async () => {
          const testSessionId = `normal-load-session-${Date.now()}-${Math.random()}`
          const testMessage = testMessages[Math.floor(Math.random() * testMessages.length,)]
          await client.sendChatMessage(testSessionId, testMessage,)
        },
        scenario.concurrent_users,
        scenario.duration_minutes,
        scenario.ramp_up_seconds,
        'chat_normal_load',
      )

      const stats = PerformanceTestUtils.getStatistics('chat_normal_load',)

      console.log('Normal Load Chat Performance:', {
        requests: stats.count,
        avgResponseTime: `${stats.avg.toFixed(2,)}ms`,
        p95ResponseTime: `${stats.p95.toFixed(2,)}ms`,
        errorRate: `${stats.errorRate.toFixed(2,)}%`,
        throughput: `${(stats.count / (scenario.duration_minutes * 60)).toFixed(2,)} req/s`,
      },)

      expect(stats.avg,).toBeLessThan(
        PERF_TEST_CONFIG.thresholds.chat_response_avg * 1.5,
      ) // Allow 50% degradation under load
      expect(stats.p95,).toBeLessThan(
        PERF_TEST_CONFIG.thresholds.chat_response_p95 * 1.3,
      ) // Allow 30% degradation for p95
      expect(stats.errorRate,).toBeLessThan(
        PERF_TEST_CONFIG.thresholds.error_rate_max_percent,
      )
    }, 400_000,) // 6-7 minutes timeout
  })

  describe('compliance Automation Performance', () => {
    const complianceTestData = [
      {
        operation: 'data_processing',
        category: 'lgpd',
        data: {
          patient: {
            id: 'test-patient-123',
            name: 'João Silva',
            cpf: '123.456.789-00',
            lgpd_consent: true,
            lgpd_consent_date: new Date().toISOString(),
          },
          processing_purpose: 'medical_care',
        },
      },
      {
        operation: 'medical_device_usage',
        category: 'anvisa',
        data: {
          device: {
            name: 'Monitor Cardíaco',
            registration_number: '80146170015',
            category: 'Class II',
          },
        },
      },
      {
        operation: 'telemedicine_consultation',
        category: 'cfm',
        data: {
          doctor: {
            crm: 'CRM-SP-123456',
            specialty: 'Cardiologia',
            telemedicine_certified: true,
          },
          consultation: {
            type: 'follow_up',
            patient_consent: true,
          },
        },
      },
    ]

    it('should process compliance validations quickly', async () => {
      const testData = complianceTestData[
        Math.floor(Math.random() * complianceTestData.length,)
      ]

      const stopTimer = PerformanceTestUtils.startMeasurement(
        'single_compliance_check',
      )

      try {
        const result = await client.validateCompliance(testData,)
        const duration = stopTimer()

        expect(result.success,).toBeTruthy()
        expect(duration,).toBeLessThan(
          PERF_TEST_CONFIG.thresholds.compliance_check_p95,
        )

        // console.log(
        //   `Single compliance check completed in ${duration.toFixed(2)}ms`,
        // );
      } catch (_error) {
        PerformanceTestUtils.recordError(
          'single_compliance_check',
          _error as Error,
        )
        throw _error
      }
    })

    it('should maintain high throughput for compliance checks', async () => {
      const scenario = PERF_TEST_CONFIG.test_scenarios.normal_load

      await PerformanceTestUtils.simulateLoad(
        async () => {
          const testData = complianceTestData[
            Math.floor(Math.random() * complianceTestData.length,)
          ]
          await client.validateCompliance(testData,)
        },
        scenario.concurrent_users,
        scenario.duration_minutes,
        scenario.ramp_up_seconds,
        'compliance_normal_load',
      )

      const stats = PerformanceTestUtils.getStatistics(
        'compliance_normal_load',
      )
      const throughput = stats.count / (scenario.duration_minutes * 60)

      // console.log("Compliance Check Performance:", {
      //   requests: stats.count,
      //   avgResponseTime: `${stats.avg.toFixed(2)}ms`,
      //   p95ResponseTime: `${stats.p95.toFixed(2)}ms`,
      //   errorRate: `${stats.errorRate.toFixed(2)}%`,
      //   throughput: `${throughput.toFixed(2)} req/s`,
      // });

      expect(stats.avg,).toBeLessThan(
        PERF_TEST_CONFIG.thresholds.compliance_check_avg,
      )
      expect(stats.p95,).toBeLessThan(
        PERF_TEST_CONFIG.thresholds.compliance_check_p95,
      )
      expect(throughput,).toBeGreaterThan(
        PERF_TEST_CONFIG.thresholds.compliance_throughput_min,
      )
      expect(stats.errorRate,).toBeLessThan(
        PERF_TEST_CONFIG.thresholds.error_rate_max_percent,
      )
    }, 400_000,)
  })

  describe('conversation Analysis Performance', () => {
    it('should analyze conversations within time limits', async () => {
      const testSessionId = `analysis-session-${Date.now()}`

      // First, send a few messages to have something to analyze
      const messages = [
        'Estou preocupado com minha saúde',
        'Tenho sentido dores de cabeça frequentes',
        'Minha pressão arterial tem estado alta',
      ]

      for (const message of messages) {
        await client.sendChatMessage(testSessionId, message,)
        // Small delay between messages
        await new Promise((resolve,) => setTimeout(resolve, 100,))
      }

      const stopTimer = PerformanceTestUtils.startMeasurement(
        'single_conversation_analysis',
      )

      try {
        const result = await client.analyzeConversation(testSessionId,)
        const duration = stopTimer()

        expect(result.success,).toBeTruthy()
        expect(duration,).toBeLessThan(
          PERF_TEST_CONFIG.thresholds.conversation_analysis_p95,
        )

        // console.log(
        //   `Conversation analysis completed in ${duration.toFixed(2)}ms`,
        // );
      } catch (_error) {
        PerformanceTestUtils.recordError(
          'single_conversation_analysis',
          _error as Error,
        )
        throw _error
      }
    }, 30_000,)

    it('should handle concurrent conversation analyses', async () => {
      const scenario = PERF_TEST_CONFIG.test_scenarios.light_load

      await PerformanceTestUtils.simulateLoad(
        async () => {
          const testSessionId = `concurrent-analysis-${Date.now()}-${Math.random()}`

          // Create a conversation first
          await client.sendChatMessage(
            testSessionId,
            'Preciso de ajuda médica',
          )

          // Then analyze it
          await client.analyzeConversation(testSessionId,)
        },
        Math.min(scenario.concurrent_users, 20,), // Limit concurrent analyses
        scenario.duration_minutes,
        scenario.ramp_up_seconds,
        'conversation_analysis_load',
      )

      const stats = PerformanceTestUtils.getStatistics(
        'conversation_analysis_load',
      )

      // console.log("Conversation Analysis Performance:", {
      //   requests: stats.count,
      //   avgResponseTime: `${stats.avg.toFixed(2)}ms`,
      //   p95ResponseTime: `${stats.p95.toFixed(2)}ms`,
      //   errorRate: `${stats.errorRate.toFixed(2)}%`,
      // });

      expect(stats.avg,).toBeLessThan(
        PERF_TEST_CONFIG.thresholds.conversation_analysis_avg * 1.5,
      )
      expect(stats.p95,).toBeLessThan(
        PERF_TEST_CONFIG.thresholds.conversation_analysis_p95 * 1.3,
      )
      expect(stats.errorRate,).toBeLessThan(
        PERF_TEST_CONFIG.thresholds.error_rate_max_percent,
      )
    }, 300_000,)
  })

  describe('system Resource Performance', () => {
    it('should monitor memory usage during load testing', async () => {
      const initialMemory = process.memoryUsage()
      // console.log("Initial memory usage:", {
      //   rss: `${Math.round(initialMemory.rss / 1024 / 1024)}MB`,
      //   heapUsed: `${Math.round(initialMemory.heapUsed / 1024 / 1024)}MB`,
      // });

      // Simulate moderate load for memory monitoring
      await PerformanceTestUtils.simulateLoad(
        async () => {
          const testSessionId = `memory-test-${Date.now()}-${Math.random()}`
          const testMessage = 'Test message for memory monitoring'
          await client.sendChatMessage(testSessionId, testMessage,)
        },
        30, // concurrent users
        2, // duration minutes
        30, // ramp up seconds
        'memory_monitoring',
      )

      const finalMemory = process.memoryUsage()
      const memoryIncrease = (finalMemory.rss - initialMemory.rss) / 1024 / 1024 // MB

      // console.log("Final memory usage:", {
      //   rss: `${Math.round(finalMemory.rss / 1024 / 1024)}MB`,
      //   heapUsed: `${Math.round(finalMemory.heapUsed / 1024 / 1024)}MB`,
      //   increase: `${Math.round(memoryIncrease)}MB`,
      // });

      // Memory increase should be reasonable (less than 200MB for this test)
      expect(memoryIncrease,).toBeLessThan(200,)
    }, 200_000,)
  })

  describe('end-to-End Performance Scenarios', () => {
    it('should handle complete healthcare workflow efficiently', async () => {
      const stopTimer = PerformanceTestUtils.startMeasurement('e2e_workflow',)

      try {
        const sessionId = `e2e-workflow-${Date.now()}`

        // Step 1 & 2: Create session and send message
        const chatResult = await client.sendChatMessage(
          sessionId,
          'Tenho diabetes e preciso de orientação sobre minha medicação',
        )
        expect(chatResult.success,).toBeTruthy()

        // Step 3: Validate compliance
        const complianceResult = await client.validateCompliance({
          operation: 'data_processing',
          category: 'lgpd',
          data: {
            patient: { id: 'test-patient', lgpd_consent: true, },
            session_id: sessionId,
          },
        },)
        expect(complianceResult.success,).toBeTruthy()

        // Step 4: Analyze conversation
        const analysisResult = await client.analyzeConversation(sessionId,)
        expect(analysisResult.success,).toBeTruthy()

        const duration = stopTimer()

        // console.log(
        //   `Complete E2E workflow completed in ${duration.toFixed(2)}ms`,
        // );

        // E2E workflow should complete in reasonable time
        expect(duration,).toBeLessThan(5000,) // 5 seconds max for complete workflow
      } catch (_error) {
        PerformanceTestUtils.recordError('e2e_workflow', _error as Error,)
        throw _error
      }
    })
  })
})

// Performance Report Generation
afterAll(async () => {
  // console.log(`\n${"=".repeat(60)}`);
  // console.log("AI SERVICES PERFORMANCE TEST REPORT");
  // console.log("=".repeat(60));

  const allTests = [
    'single_chat_request',
    'chat_light_load',
    'chat_normal_load',
    'single_compliance_check',
    'compliance_normal_load',
    'single_conversation_analysis',
    'conversation_analysis_load',
    'memory_monitoring',
    'e2e_workflow',
  ]

  allTests.forEach((testName,) => {
    const stats = PerformanceTestUtils.getStatistics(testName,)
    if (stats.count > 0) {
      // console.log(`\n${testName.toUpperCase()}:`);
      // console.log(`  Requests: ${stats.count}`);
      // console.log(`  Average: ${stats.avg.toFixed(2)}ms`);
      // console.log(`  P95: ${stats.p95.toFixed(2)}ms`);
      // console.log(`  Error Rate: ${stats.errorRate.toFixed(2)}%`);
    }
  },)

  // console.log(`\n${"=".repeat(60)}`);
},)
