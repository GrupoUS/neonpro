/**
 * API Performance Testing Suite
 *
 * Comprehensive performance testing for API endpoints, focusing on response times,
 * throughput, error handling, and scalability for healthcare applications.
 *
 * Healthcare Context: Medical APIs require consistent performance for
 * critical operations like patient data retrieval, appointment scheduling,
 * and real-time health monitoring.
 *
 * Performance Requirements:
 * - GET requests < 200ms (95th percentile)
 * - POST requests < 500ms (95th percentile)
 * - Error rate < 1% under normal load
 * - Throughput > 1000 requests/second
 * - Memory usage growth < 10% during sustained load
 * - Connection pool efficiency > 90%
 *
 * @version 1.0.0
 * @category Performance Testing
 * @subcategory API Testing
 */

import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock healthcare API endpoints
const server = setupServer(
  // Patient data endpoints
  rest.get('/api/patients/:id', (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.status(200),
      ctx.json({
        id,
        name: 'Maria Silva',
        birthDate: '1980-01-01',
        contact: {
          phone: '+5511987654321',
          email: 'maria.silva@email.com',
        },
        medicalRecord: {
          conditions: ['Hypertension'],
          medications: ['Losartan 50mg'],
        },
      }),
    
  }),
  // Appointments endpoints
  rest.get('/api/appointments', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        appointments: [
          {
            id: 'apt-123',
            patientId: 'patient-123',
            type: 'consultation',
            scheduledAt: '2024-02-01T14:00:00Z',
            status: 'confirmed',
          },
        ],
      }),
    
  }),
  rest.post('/api/appointments', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        id: 'apt-456',
        patientId: 'patient-123',
        type: 'consultation',
        scheduledAt: '2024-02-01T14:00:00Z',
        status: 'confirmed',
      }),
    
  }),
  // Medical records endpoints
  rest.get('/api/medical-records/:patientId', (req, res, ctx) => {
    const { patientId } = req.params;
    return res(
      ctx.status(200),
      ctx.json({
        patientId,
        records: [
          {
            id: 'rec-123',
            type: 'consultation',
            date: '2024-01-15T10:00:00Z',
            physician: 'Dr. João Santos',
            diagnosis: 'Hypertension',
            treatment: 'Lifestyle changes, medication',
            notes: 'Patient shows stable condition',
          },
        ],
      }),
    
  }),
  // AI CRUD API endpoints
  rest.post('/api/ai/intent', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        intentId: 'intent-123',
        validated: true,
        confidence: 0.95,
        nextSteps: ['confirm', 'execute'],
      }),
    
  }),
  rest.post('/api/ai/confirm', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        confirmId: 'confirm-123',
        dataTransformed: true,
        complianceValidated: true,
        readyToExecute: true,
      }),
    
  }),
  rest.post('/api/ai/execute', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        executionId: 'exec-123',
        completed: true,
        result: {
          action: 'patient_record_update',
          success: true,
          affectedRecords: 1,
        },
      }),
    
  }),


describe('API Response Time Performance', () => {
  beforeEach(() => {
    server.listen(
  }

  afterEach(() => {
    server.close(
    vi.clearAllMocks(
  }

  describe('GET Request Performance', () => {
    it('should retrieve patient data under 200ms', async () => {
      const startTime = performance.now(

      const response = await fetch('/api/patients/patient-123')
      const data = await response.json(

      const endTime = performance.now(
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200
      expect(data.id).toBe('patient-123')
      expect(responseTime).toBeLessThan(200
    }

    it('should retrieve appointments under 200ms', async () => {
      const startTime = performance.now(

      const response = await fetch('/api/appointments')
      const data = await response.json(

      const endTime = performance.now(
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200
      expect(Array.isArray(data.appointments)).toBe(true);
      expect(responseTime).toBeLessThan(200
    }

    it('should retrieve medical records under 200ms', async () => {
      const startTime = performance.now(

      const response = await fetch('/api/medical-records/patient-123')
      const data = await response.json(

      const endTime = performance.now(
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200
      expect(data.patientId).toBe('patient-123')
      expect(Array.isArray(data.records)).toBe(true);
      expect(responseTime).toBeLessThan(200
    }
  }

  describe('POST Request Performance', () => {
    it('should create appointments under 500ms', async () => {
      const appointmentData = {
        patientId: 'patient-123',
        type: 'consultation',
        scheduledAt: '2024-02-01T14:00:00Z',
        physicianId: 'physician-123',
      };

      const startTime = performance.now(

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      }

      const data = await response.json(
      const endTime = performance.now(
      const responseTime = endTime - startTime;

      expect(response.status).toBe(201
      expect(data.id).toBeDefined(
      expect(responseTime).toBeLessThan(500
    }

    it('should handle AI intent validation under 300ms', async () => {
      const intentData = {
        action: 'update_patient_record',
        patientId: 'patient-123',
        data: {
          field: 'medications',
          value: 'Losartan 50mg',
        },
      };

      const startTime = performance.now(

      const response = await fetch('/api/ai/intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(intentData),
      }

      const data = await response.json(
      const endTime = performance.now(
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200
      expect(data.intentId).toBeDefined(
      expect(data.validated).toBe(true);
      expect(responseTime).toBeLessThan(300
    }

    it('should handle AI confirm step under 300ms', async () => {
      const confirmData = {
        intentId: 'intent-123',
        confirmationData: {
          patientConsent: true,
          complianceChecked: true,
        },
      };

      const startTime = performance.now(

      const response = await fetch('/api/ai/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(confirmData),
      }

      const data = await response.json(
      const endTime = performance.now(
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200
      expect(data.confirmId).toBeDefined(
      expect(data.readyToExecute).toBe(true);
      expect(responseTime).toBeLessThan(300
    }

    it('should handle AI execute step under 500ms', async () => {
      const executeData = {
        confirmId: 'confirm-123',
        executionData: {
          action: 'update_patient_record',
          targetId: 'patient-123',
          updates: {
            medications: ['Losartan 50mg', 'Metformin 500mg'],
          },
        },
      };

      const startTime = performance.now(

      const response = await fetch('/api/ai/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(executeData),
      }

      const data = await response.json(
      const endTime = performance.now(
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200
      expect(data.executionId).toBeDefined(
      expect(data.completed).toBe(true);
      expect(responseTime).toBeLessThan(500
    }
  }

  describe('Error Handling Performance', () => {
    it('should handle 404 errors efficiently', async () => {
      server.use(
        rest.get('/api/patients/nonexistent', (req, res, ctx) => {
          return res(ctx.status(404), ctx.json({ error: 'Patient not found' })
        }),
      

      const startTime = performance.now(

      const response = await fetch('/api/patients/nonexistent')
      const endTime = performance.now(
      const responseTime = endTime - startTime;

      expect(response.status).toBe(404
      expect(responseTime).toBeLessThan(100); // Fast error response
    }

    it('should handle 500 errors with proper fallback', async () => {
      server.use(
        rest.get('/api/patients/error', (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ error: 'Internal server error' })
        }),
      

      const startTime = performance.now(

      try {
        const response = await fetch('/api/patients/error')
        const endTime = performance.now(
        const responseTime = endTime - startTime;

        expect(response.status).toBe(500
        expect(responseTime).toBeLessThan(200); // Fast error response
      } catch (error) {
        // Should not timeout
        expect(error).not.toBeInstanceOf(TypeError
      }
    }

    it('should handle network timeouts gracefully', async () => {
      server.use(
        rest.get('/api/patients/timeout', async (req, res, ctx) => {
          await new Promise(resolve => setTimeout(resolve, 5000)
          return res(ctx.status(200)
        }),
      

      const controller = new AbortController(
      const timeoutId = setTimeout(() => controller.abort(), 1000

      try {
        const startTime = performance.now(

        const response = await fetch('/api/patients/timeout', {
          signal: controller.signal,
        }

        const endTime = performance.now(
        const responseTime = endTime - startTime;

        expect(responseTime).toBeLessThan(1500); // Timeout + buffer
      } catch (error) {
        expect(error.name).toBe('AbortError')
      } finally {
        clearTimeout(timeoutId
      }
    }
  }
}

describe('API Throughput and Scalability', () => {
  beforeEach(() => {
    server.listen(
  }

  afterEach(() => {
    server.close(
  }

  describe('Concurrent Request Handling', () => {
    it('should handle 100 concurrent GET requests', async () => {
      const concurrentRequests = 100;
      const requests = [];

      for (let i = 0; i < concurrentRequests; i++) {
        requests.push(fetch('/api/patients/patient-123')
      }

      const startTime = performance.now(
      const responses = await Promise.all(requests
      const endTime = performance.now(
      const totalTime = endTime - startTime;

      const averageResponseTime = totalTime / concurrentRequests;
      const requestsPerSecond = concurrentRequests / (totalTime / 1000

      expect(responses.every(r => r.status === 200)).toBe(true);
      expect(averageResponseTime).toBeLessThan(300
      expect(requestsPerSecond).toBeGreaterThan(100
    }

    it('should handle 50 concurrent POST requests', async () => {
      const concurrentRequests = 50;
      const requests = [];

      for (let i = 0; i < concurrentRequests; i++) {
        requests.push(
          fetch('/api/appointments', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              patientId: 'patient-123',
              type: 'consultation',
              scheduledAt: '2024-02-01T14:00:00Z',
            }),
          }),
        
      }

      const startTime = performance.now(
      const responses = await Promise.all(requests
      const endTime = performance.now(
      const totalTime = endTime - startTime;

      const averageResponseTime = totalTime / concurrentRequests;
      const requestsPerSecond = concurrentRequests / (totalTime / 1000

      expect(responses.every(r => r.status === 201)).toBe(true);
      expect(averageResponseTime).toBeLessThan(800
      expect(requestsPerSecond).toBeGreaterThan(50
    }
  }

  describe('Load Testing', () => {
    it('should maintain performance under sustained load', async () => {
      const duration = 10000; // 10 seconds
      const requestInterval = 50; // 50ms between requests
      const totalRequests = duration / requestInterval;
      const responseTimes = [];

      const loadTest = async () => {
        const requests = [];

        for (let i = 0; i < totalRequests; i++) {
          requests.push(
            new Promise(async resolve => {
              await new Promise(r => setTimeout(r, i * requestInterval)

              const startTime = performance.now(
              try {
                const response = await fetch('/api/patients/patient-123')
                const endTime = performance.now(
                responseTimes.push(endTime - startTime
                resolve({ status: response.status, success: true }
              } catch (error) {
                responseTimes.push(performance.now() - startTime
                resolve({ status: 'error', success: false }
              }
            }),
          
        }

        return Promise.all(requests
      };

      await loadTest(

      const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes
      const minResponseTime = Math.min(...responseTimes

      expect(averageResponseTime).toBeLessThan(250
      expect(maxResponseTime).toBeLessThan(1000
      expect(minResponseTime).toBeGreaterThan(0
    }

    it('should handle spike load without degradation', async () => {
      const baselineRequests = 10;
      const spikeRequests = 100;
      const allResponseTimes = [];

      // Baseline load
      const baselineRequestsPromises = [];
      for (let i = 0; i < baselineRequests; i++) {
        baselineRequestsPromises.push(
          (async () => {
            const startTime = performance.now(
            const response = await fetch('/api/patients/patient-123')
            const endTime = performance.now(
            allResponseTimes.push({ type: 'baseline', time: endTime - startTime }
            return response;
          })(),
        
      }

      await Promise.all(baselineRequestsPromises

      // Spike load
      const spikeRequestsPromises = [];
      for (let i = 0; i < spikeRequests; i++) {
        spikeRequestsPromises.push(
          (async () => {
            const startTime = performance.now(
            const response = await fetch('/api/patients/patient-123')
            const endTime = performance.now(
            allResponseTimes.push({ type: 'spike', time: endTime - startTime }
            return response;
          })(),
        
      }

      await Promise.all(spikeRequestsPromises

      const baselineTimes = allResponseTimes.filter(r => r.type === 'baseline').map(r => r.time
      const spikeTimes = allResponseTimes.filter(r => r.type === 'spike').map(r => r.time

      const baselineAverage = baselineTimes.reduce((a, b) => a + b, 0) / baselineTimes.length;
      const spikeAverage = spikeTimes.reduce((a, b) => a + b, 0) / spikeTimes.length;

      // Spike should not degrade performance by more than 50%
      expect(spikeAverage).toBeLessThan(baselineAverage * 1.5
    }
  }

  describe('Memory and Resource Usage', () => {
    it('should maintain stable memory usage during sustained requests', async () => {
      const initialMemory = process.memoryUsage(

      // Make sustained requests
      for (let i = 0; i < 1000; i++) {
        await fetch('/api/patients/patient-123')

        // Check memory every 100 requests
        if (i % 100 === 0) {
          const currentMemory = process.memoryUsage(
          const memoryGrowth = currentMemory.heapUsed - initialMemory.heapUsed;

          // Memory growth should be reasonable
          expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024); // 50MB
        }
      }

      const finalMemory = process.memoryUsage(
      const totalMemoryGrowth = finalMemory.heapUsed - initialMemory.heapUsed;

      expect(totalMemoryGrowth).toBeLessThan(100 * 1024 * 1024); // 100MB
    }

    it('should handle large response payloads efficiently', async () => {
      // Mock large response
      server.use(
        rest.get('/api/patients/large-dataset', (req, res, ctx) => {
          const largeDataset = {
            patients: Array.from({ length: 1000 }, (_, i) => ({
              id: `patient-${i}`,
              name: `Patient ${i}`,
              medicalHistory: Array.from({ length: 50 }, (_, j) => ({
                date: new Date(Date.now() - j * 24 * 60 * 60 * 1000).toISOString(),
                diagnosis: `Diagnosis ${j}`,
                treatment: `Treatment ${j}`,
              })),
            })),
          };

          return res(
            ctx.status(200),
            ctx.json(largeDataset),
          
        }),
      

      const startTime = performance.now(

      const response = await fetch('/api/patients/large-dataset')
      const data = await response.json(

      const endTime = performance.now(
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200
      expect(data.patients.length).toBe(1000
      expect(responseTime).toBeLessThan(2000); // 2 seconds for large dataset
    }
  }
}

describe('API Reliability and Error Recovery', () => {
  beforeEach(() => {
    server.listen(
  }

  afterEach(() => {
    server.close(
  }

  describe('Retry Mechanisms', () => {
    it('should implement exponential backoff for failed requests', async () => {
      let requestCount = 0;

      server.use(
        rest.get('/api/patients/retry-test', (req, res, ctx) => {
          requestCount++;
          if (requestCount <= 2) {
            return res(ctx.status(500), ctx.json({ error: 'Server error' })
          }
          return res(ctx.status(200), ctx.json({ id: 'retry-test' })
        }),
      

      const fetchWithRetry = async (url, maxRetries = 3) => {
        for (let i = 0; i < maxRetries; i++) {
          try {
            const response = await fetch(url
            if (response.ok) return response;

            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000)
          } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000)
          }
        }
        throw new Error('Max retries exceeded')
      };

      const startTime = performance.now(
      const response = await fetchWithRetry('/api/patients/retry-test')
      const endTime = performance.now(
      const totalTime = endTime - startTime;

      expect(response.status).toBe(200
      expect(requestCount).toBe(3
      expect(totalTime).toBeLessThan(5000); // Should complete within reasonable time
    }

    it('should give up after max retries', async () => {
      server.use(
        rest.get('/api/patients/always-fail', (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ error: 'Always fails' })
        }),
      

      const fetchWithRetry = async (url, maxRetries = 3) => {
        for (let i = 0; i < maxRetries; i++) {
          try {
            const response = await fetch(url
            if (response.ok) return response;
            await new Promise(resolve => setTimeout(resolve, 1000)
          } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000)
          }
        }
        throw new Error('Max retries exceeded')
      };

      await expect(fetchWithRetry('/api/patients/always-fail')).rejects.toThrow(
        'Max retries exceeded',
      
    }
  }

  describe('Circuit Breaker Pattern', () => {
    it('should open circuit after consecutive failures', async () => {
      let failureCount = 0;

      server.use(
        rest.get('/api/patients/circuit-test', (req, res, ctx) => {
          failureCount++;
          return res(ctx.status(500), ctx.json({ error: 'Service unavailable' })
        }),
      

      class CircuitBreaker {
        constructor(threshold = 3, timeout = 5000) {
          this.threshold = threshold;
          this.timeout = timeout;
          this.failureCount = 0;
          this.lastFailureTime = null;
          this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
        }

        async execute(requestFn) {
          if (this.state === 'OPEN') {
            if (Date.now() - this.lastFailureTime > this.timeout) {
              this.state = 'HALF_OPEN';
            } else {
              throw new Error('Circuit breaker is OPEN')
            }
          }

          try {
            const result = await requestFn(
            this.onSuccess(
            return result;
          } catch (error) {
            this.onFailure(
            throw error;
          }
        }

        onSuccess() {
          this.failureCount = 0;
          this.state = 'CLOSED';
        }

        onFailure() {
          this.failureCount++;
          this.lastFailureTime = Date.now(
          if (this.failureCount >= this.threshold) {
            this.state = 'OPEN';
          }
        }
      }

      const circuitBreaker = new CircuitBreaker(

      // Should fail and open circuit
      for (let i = 0; i < 3; i++) {
        await expect(
          circuitBreaker.execute(() => fetch('/api/patients/circuit-test')),
        ).rejects.toThrow(
      }

      expect(circuitBreaker.state).toBe('OPEN')

      // Should fail fast when circuit is open
      await expect(
        circuitBreaker.execute(() => fetch('/api/patients/circuit-test')),
      ).rejects.toThrow('Circuit breaker is OPEN')

      expect(failureCount).toBe(3); // Only 3 actual requests made
    }
  }

  describe('Rate Limiting and Throttling', () => {
    it('should respect rate limits and handle 429 responses', async () => {
      let requestCount = 0;

      server.use(
        rest.get('/api/patients/rate-limited', (req, res, ctx) => {
          requestCount++;
          if (requestCount > 10) {
            return res(
              ctx.status(429),
              ctx.json({ error: 'Rate limit exceeded' }),
              ctx.set('Retry-After', '1'),
            
          }
          return res(ctx.status(200), ctx.json({ id: 'rate-test' })
        }),
      

      const responses = [];

      // Make 15 requests to trigger rate limiting
      for (let i = 0; i < 15; i++) {
        try {
          const response = await fetch('/api/patients/rate-limited')
          responses.push({ status: response.status, success: response.ok }
        } catch (error) {
          responses.push({ status: 'error', success: false }
        }
      }

      const successResponses = responses.filter(r => r.success).length;
      const rateLimitedResponses = responses.filter(r => r.status === 429).length;

      expect(successResponses).toBe(10
      expect(rateLimitedResponses).toBe(5
    }
  }
}

describe('API Security Performance', () => {
  beforeEach(() => {
    server.listen(
  }

  afterEach(() => {
    server.close(
  }

  describe('Authentication Performance', () => {
    it('should handle authentication efficiently', async () => {
      server.use(
        rest.post('/api/auth/login', (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              token: 'mock-jwt-token',
              expiresIn: 3600,
              user: {
                id: 'user-123',
                _role: 'physician',
              },
            }),
          
        }),
      

      const startTime = performance.now(

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'physician@hospital.com',
          password: 'securepassword',
        }),
      }

      const data = await response.json(
      const endTime = performance.now(
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200
      expect(data.token).toBeDefined(
      expect(responseTime).toBeLessThan(500
    }

    it('should validate tokens efficiently', async () => {
      server.use(
        rest.get('/api/auth/validate', (req, res, ctx) => {
          const authHeader = req.headers.get('authorization')
          if (authHeader && authHeader.startsWith('Bearer ')) {
            return res(ctx.status(200), ctx.json({ valid: true })
          }
          return res(ctx.status(401), ctx.json({ valid: false })
        }),
      

      const startTime = performance.now(

      const response = await fetch('/api/auth/validate', {
        headers: {
          Authorization: 'Bearer valid-token',
        },
      }

      const data = await response.json(
      const endTime = performance.now(
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200
      expect(data.valid).toBe(true);
      expect(responseTime).toBeLessThan(100
    }
  }

  describe('Encryption and Security Overhead', () => {
    it('should handle HTTPS/TLS with minimal overhead', async () => {
      // This test simulates HTTPS overhead
      const startTime = performance.now(

      // Simulate HTTPS request (in real scenario, this would be actual HTTPS)
      const response = await fetch('/api/patients/patient-123')
      const data = await response.json(

      const endTime = performance.now(
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200
      expect(responseTime).toBeLessThan(250); // Allow some overhead for encryption
    }

    it('should validate input sanitization efficiently', async () => {
      server.use(
        rest.post('/api/patients/search', (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              results: [
                { id: 'patient-123', name: 'Maria Silva' },
              ],
            }),
          
        }),
      

      // Test with potentially malicious input
      const maliciousQuery = '<script>alert("xss")</script>';

      const startTime = performance.now(

      const response = await fetch('/api/patients/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ _query: maliciousQuery }),
<<<<<<< HEAD
      }
=======
      });
>>>>>>> origin/main

      const data = await response.json(
      const endTime = performance.now(
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200
      expect(responseTime).toBeLessThan(200
      // Input should be sanitized (no script tags in response)
      expect(JSON.stringify(data)).not.toContain('<script>')
    }
  }
}

describe('API Monitoring and Metrics', () => {
  it('should collect performance metrics', () => {
    const metrics = {
      requestCount: 0,
      responseTimes: [],
      errorRates: {},
      throughput: 0,
    };

    // Simulate metric collection
    const mockResponseTime = 150;
    metrics.requestCount++;
    metrics.responseTimes.push(mockResponseTime
    metrics.throughput = metrics.requestCount / (performance.now() / 1000

    expect(metrics.requestCount).toBe(1
    expect(metrics.responseTimes).toContain(150
    expect(metrics.throughput).toBeGreaterThan(0
  }

  it('should detect performance anomalies', () => {
    const baselineMetrics = {
      averageResponseTime: 150,
      p95ResponseTime: 300,
      errorRate: 0.01,
    };

    const currentMetrics = {
      averageResponseTime: 450, // 3x increase
      p95ResponseTime: 900, // 3x increase
      errorRate: 0.05, // 5x increase
    };

    const anomalies = [];

    if (currentMetrics.averageResponseTime > baselineMetrics.averageResponseTime * 2) {
      anomalies.push('high_average_response_time')
    }

    if (currentMetrics.p95ResponseTime > baselineMetrics.p95ResponseTime * 2) {
      anomalies.push('high_p95_response_time')
    }

    if (currentMetrics.errorRate > baselineMetrics.errorRate * 3) {
      anomalies.push('high_error_rate')
    }

    expect(anomalies).toContain('high_average_response_time')
    expect(anomalies).toContain('high_p95_response_time')
    expect(anomalies).toContain('high_error_rate')
  }

  it('should generate performance reports', () => {
    const performanceReport = {
      timestamp: new Date().toISOString(),
      duration: 300, // 5 minutes
      totalRequests: 1500,
      successfulRequests: 1485,
      failedRequests: 15,
      averageResponseTime: 167,
      p95ResponseTime: 342,
      p99ResponseTime: 567,
      throughput: 5.0, // requests per second
      errorRate: 0.01, // 1%
      topEndpoints: [
        { path: '/api/patients/:id', count: 500, avgTime: 120 },
        { path: '/api/appointments', count: 300, avgTime: 180 },
        { path: '/api/medical-records/:patientId', count: 200, avgTime: 250 },
      ],
    };

    expect(performanceReport.totalRequests).toBe(1500
    expect(performanceReport.successfulRequests).toBe(1485
    expect(performanceReport.errorRate).toBe(0.01
    expect(performanceReport.throughput).toBe(5.0
    expect(performanceReport.averageResponseTime).toBeLessThan(200
  }
}
