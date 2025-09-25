/**
 * Circuit Breaker Tests
 * Tests the circuit breaker pattern implementation for AI providers
 */

import { CircuitBreaker, CircuitBreakerRegistry, createCircuitBreaker } from '../services/circuit-breaker/circuit-breaker-service.js'

describe('CircuitBreaker', () => {
  let circuitBreaker: CircuitBreaker

  beforeEach(() => {
    circuitBreaker = new CircuitBreaker({
      failureThreshold: 3,
      resetTimeout: 1000, // 1 second for faster testing
      monitoringPeriod: 5000, // 5 seconds
      requestVolumeThreshold: 5,
    })

    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Basic Circuit Breaker Functionality', () => {
    test('should allow requests when closed', async () => {
      const operation = jest.fn().mockResolvedValue('success')
      
      const result = await circuitBreaker.execute(operation, 'test')
      
      expect(result).toBe('success')
      expect(operation).toHaveBeenCalledTimes(1)
    })

    test('should open circuit after failure threshold', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('failure'))
      
      // Execute enough failures to open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(operation, 'test')
        } catch (error) {
          // Expected to fail
        }
      }

      expect(circuitBreaker.getState().state).toBe('OPEN')
      expect(circuitBreaker.getState().isOpen).toBe(true)
    })

    test('should reject requests when circuit is open', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('failure'))
      
      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(operation, 'test')
        } catch (error) {
          // Expected to fail
        }
      }

      // Next request should be rejected without calling the operation
      await expect(circuitBreaker.execute(operation, 'test')).rejects.toThrow(
        'Circuit breaker is OPEN'
      )
      
      expect(operation).toHaveBeenCalledTimes(3) // No additional calls
    })

    test('should attempt reset after timeout', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('failure'))
      
      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(operation, 'test')
        } catch (error) {
          // Expected to fail
        }
      }

      expect(circuitBreaker.getState().state).toBe('OPEN')

      // Fast forward past reset timeout
      jest.advanceTimersByTime(1100)

      // Should now allow one request to test the circuit
      const testOperation = jest.fn().mockResolvedValue('recovery')
      const result = await circuitBreaker.execute(testOperation, 'test-recovery')
      
      expect(result).toBe('recovery')
      expect(circuitBreaker.getState().state).toBe('CLOSED')
    })

    test('should close circuit on successful recovery', async () => {
      const failingOperation = jest.fn().mockRejectedValue(new Error('failure'))
      const successOperation = jest.fn().mockResolvedValue('success')
      
      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(failingOperation, 'test')
        } catch (error) {
          // Expected to fail
        }
      }

      expect(circuitBreaker.getState().state).toBe('OPEN')

      // Fast forward past reset timeout
      jest.advanceTimersByTime(1100)

      // Successful request should close the circuit
      const result = await circuitBreaker.execute(successOperation, 'test-recovery')
      
      expect(result).toBe('success')
      expect(circuitBreaker.getState().state).toBe('CLOSED')
    })
  })

  describe('Failure Rate Calculation', () => {
    test('should open circuit based on failure rate', async () => {
      const successOperation = jest.fn().mockResolvedValue('success')
      const failingOperation = jest.fn().mockRejectedValue(new Error('failure'))
      
      // Execute mix of operations to trigger failure rate threshold
      for (let i = 0; i < 10; i++) {
        const operation = i < 6 ? failingOperation : successOperation // 60% failure rate
        try {
          await circuitBreaker.execute(operation, 'test')
        } catch (error) {
          // Expected to fail
        }
      }

      // Should open due to high failure rate
      expect(circuitBreaker.getState().state).toBe('OPEN')
    })

    test('should not open circuit for low failure rate', async () => {
      const successOperation = jest.fn().mockResolvedValue('success')
      const failingOperation = jest.fn().mockRejectedValue(new Error('failure'))
      
      // Execute operations with low failure rate
      for (let i = 0; i < 10; i++) {
        const operation = i < 2 ? failingOperation : successOperation // 20% failure rate
        try {
          await circuitBreaker.execute(operation, 'test')
        } catch (error) {
          // Expected to fail
        }
      }

      // Should remain closed due to low failure rate
      expect(circuitBreaker.getState().state).toBe('CLOSED')
    })
  })

  describe('Metrics and Monitoring', () => {
    test('should provide accurate state information', () => {
      const state = circuitBreaker.getState()
      
      expect(state).toHaveProperty('isOpen')
      expect(state).toHaveProperty('failureCount')
      expect(state).toHaveProperty('lastFailureTime')
      expect(state).toHaveProperty('nextAttemptTime')
      expect(state).toHaveProperty('state')
      expect(typeof state.isOpen).toBe('boolean')
      expect(typeof state.failureCount).toBe('number')
      expect(typeof state.state).toBe('string')
    })

    test('should calculate failure rate correctly', async () => {
      const failingOperation = jest.fn().mockRejectedValue(new Error('failure'))
      
      // Generate some failures
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(failingOperation, 'test')
        } catch (error) {
          // Expected to fail
        }
      }

      const failureRate = circuitBreaker.getFailureRate()
      expect(failureRate).toBe(1) // 100% failure rate
    })

    test('should provide detailed metrics', () => {
      const metrics = circuitBreaker.getMetrics()
      
      expect(metrics).toHaveProperty('state')
      expect(metrics).toHaveProperty('isOpen')
      expect(metrics).toHaveProperty('failureCount')
      expect(metrics).toHaveProperty('recentFailures')
      expect(metrics).toHaveProperty('failureRate')
      expect(metrics).toHaveProperty('lastFailureTime')
      expect(metrics).toHaveProperty('nextAttemptTime')
    })
  })

  describe('Manual Control', () => {
    test('should force open circuit manually', () => {
      circuitBreaker.forceOpen()
      
      expect(circuitBreaker.getState().state).toBe('OPEN')
      expect(circuitBreaker.getState().isOpen).toBe(true)
    })

    test('should force close circuit manually', () => {
      circuitBreaker.forceOpen()
      circuitBreaker.forceClose()
      
      expect(circuitBreaker.getState().state).toBe('CLOSED')
      expect(circuitBreaker.getState().isOpen).toBe(false)
    })
  })

  describe('Cleanup and Maintenance', () => {
    test('should clean up old failures', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('failure'))
      
      // Generate failures
      for (let i = 0; i < 2; i++) {
        try {
          await circuitBreaker.execute(operation, 'test')
        } catch (error) {
          // Expected to fail
        }
      }

      expect(circuitBreaker.getState().failureCount).toBe(2)

      // Fast forward past monitoring period
      jest.advanceTimersByTime(5100)

      // Execute successful operation to trigger cleanup
      const successOperation = jest.fn().mockResolvedValue('success')
      await circuitBreaker.execute(successOperation, 'test')

      // Old failures should be cleaned up
      expect(circuitBreaker.getState().failureCount).toBe(0)
    })
  })
})

describe('CircuitBreakerRegistry', () => {
  beforeEach(() => {
    CircuitBreakerRegistry.resetAll()
    jest.clearAllMocks()
  })

  describe('Registry Management', () => {
    test('should create and retrieve circuit breakers', () => {
      const cb1 = CircuitBreakerRegistry.getCircuitBreaker('provider1')
      const cb2 = CircuitBreakerRegistry.getCircuitBreaker('provider2')
      
      expect(cb1).toBeDefined()
      expect(cb2).toBeDefined()
      expect(cb1).not.toBe(cb2) // Different instances
    })

    test('should return same circuit breaker instance for same provider', () => {
      const cb1 = CircuitBreakerRegistry.getCircuitBreaker('provider1')
      const cb2 = CircuitBreakerRegistry.getCircuitBreaker('provider1')
      
      expect(cb1).toBe(cb2) // Same instance
    })

    test('should use provider-specific configurations', () => {
      const openaiCB = CircuitBreakerRegistry.getCircuitBreaker('openai')
      const googleCB = CircuitBreakerRegistry.getCircuitBreaker('google')
      
      expect(openaiCB).toBeDefined()
      expect(googleCB).toBeDefined()
      
      // Should have different configurations based on provider type
      const openaiMetrics = openaiCB.getMetrics()
      const googleMetrics = googleCB.getMetrics()
      
      expect(openaiMetrics).toBeDefined()
      expect(googleMetrics).toBeDefined()
    })
  })

  describe('Bulk Operations', () => {
    test('should get all circuit breaker states', () => {
      CircuitBreakerRegistry.getCircuitBreaker('provider1')
      CircuitBreakerRegistry.getCircuitBreaker('provider2')
      
      const states = CircuitBreakerRegistry.getAllStates()
      
      expect(states).toHaveProperty('provider1')
      expect(states).toHaveProperty('provider2')
      expect(typeof states.provider1.state).toBe('string')
    })

    test('should get all circuit breaker metrics', () => {
      CircuitBreakerRegistry.getCircuitBreaker('provider1')
      
      const metrics = CircuitBreakerRegistry.getAllMetrics()
      
      expect(metrics).toHaveProperty('provider1')
      expect(metrics.provider1).toHaveProperty('state')
      expect(metrics.provider1).toHaveProperty('failureRate')
    })

    test('should reset all circuit breakers', () => {
      const cb1 = CircuitBreakerRegistry.getCircuitBreaker('provider1')
      const cb2 = CircuitBreakerRegistry.getCircuitBreaker('provider2')
      
      // Force them open
      cb1.forceOpen()
      cb2.forceOpen()
      
      expect(cb1.getState().state).toBe('OPEN')
      expect(cb2.getState().state).toBe('OPEN')
      
      // Reset all
      CircuitBreakerRegistry.resetAll()
      
      expect(cb1.getState().state).toBe('CLOSED')
      expect(cb2.getState().state).toBe('CLOSED')
    })

    test('should force open all circuit breakers', () => {
      const cb1 = CircuitBreakerRegistry.getCircuitBreaker('provider1')
      const cb2 = CircuitBreakerRegistry.getCircuitBreaker('provider2')
      
      CircuitBreakerRegistry.forceOpenAll()
      
      expect(cb1.getState().state).toBe('OPEN')
      expect(cb2.getState().state).toBe('OPEN')
    })
  })
})

describe('createCircuitBreaker', () => {
  test('should create circuit breaker with default configuration', () => {
    const circuitBreaker = createCircuitBreaker('unknown-provider')
    
    expect(circuitBreaker).toBeDefined()
    expect(circuitBreaker.getState().state).toBe('CLOSED')
  })

  test('should create circuit breaker with custom configuration', async () => {
    const customConfig = {
      failureThreshold: 5,
      resetTimeout: 2000,
      monitoringPeriod: 10000,
      requestVolumeThreshold: 15,
    }
    
    const circuitBreaker = createCircuitBreaker('custom-provider', customConfig)
    
    expect(circuitBreaker).toBeDefined()
    
    // Test with some failures to verify custom config
    const failingOperation = jest.fn().mockRejectedValue(new Error('failure'))
    
    // Should require more failures to open
    for (let i = 0; i < 4; i++) {
      try {
        await circuitBreaker.execute(failingOperation, 'test')
      } catch (error) {
        // Expected to fail
      }
    }
    
    // Should still be closed due to higher threshold
    expect(circuitBreaker.getState().state).toBe('CLOSED')
  })
})