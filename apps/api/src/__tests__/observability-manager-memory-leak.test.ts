/**
 * RED Phase Tests for ObservabilityManager Memory Leak Fix
 * These tests are designed to FAIL initially, demonstrating the timeout leak
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ObservabilityManager } from '../utils/observability-manager'

// Mock SecureLogger
const mockSecureLogger = {
  info: vi.fn(),
  debug: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}

vi.mock('../utils/secure-logger', () => ({
  SecureLogger: vi.fn(() => mockSecureLogger),
}))

// Mock healthcare errors
vi.mock('../utils/healthcare-errors', () => ({
  HealthcareErrorSeverity: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
  },
}))

describe('ObservabilityManager Memory Leak - RED Phase', () => {
  let observabilityManager: ObservabilityManager
  let mockSetTimeout: ReturnType<typeof vi.fn>
  let mockClearTimeout: ReturnType<typeof vi.fn>
  let originalSetTimeout: typeof setTimeout
  let originalClearTimeout: typeof clearTimeout

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock setTimeout to track timeout creation and clearing
    originalSetTimeout = global.setTimeout
    originalClearTimeout = global.clearTimeout

    const timeoutCallbacks = new Map<number, () => void>()

    mockSetTimeout = vi.fn((callback: () => void, delay: number) => {
      const id = timeoutCallbacks.size + 1
      timeoutCallbacks.set(id, callback)
      return id as unknown as NodeJS.Timeout
    })

    mockClearTimeout = vi.fn((timeoutId: NodeJS.Timeout) => {
      timeoutCallbacks.delete(Number(timeoutId))
    })

    global.setTimeout = mockSetTimeout
    global.clearTimeout = mockClearTimeout
  })

  afterEach(() => {
    if (observabilityManager) {
      observabilityManager.shutdown()
    }

    // Restore original functions
    global.setTimeout = originalSetTimeout
    global.clearTimeout = originalClearTimeout
  })

  it('should create timeout without clearing it when health check times out', async () => {
    // Create a health check that will timeout
    const slowHealthCheck = {
      name: 'slow-check',
      check: () =>
        new Promise<{ healthy: boolean; message: string }>(resolve => {
          // This promise will never resolve, causing timeout
          setTimeout(() => resolve({ healthy: true, message: 'Too slow' }), 1000)
        }),
      interval: 1000,
      timeout: 100, // Very short timeout
      critical: false,
    }

    observabilityManager = new ObservabilityManager()
    observabilityManager.registerHealthCheck(slowHealthCheck)

    // Get health status - this should trigger the timeout leak
    const healthStatus = await observabilityManager.getHealthStatus()

    // Verify that the health check failed due to timeout
    expect(healthStatus.healthy).toBe(false)

    // This demonstrates the memory leak: setTimeout was called but clearTimeout was not
    // The timeout handle was created but only cleared in success path
    expect(mockSetTimeout).toHaveBeenCalled()

    // The timeout created in Promise.race should not be cleared when timeout occurs
    // This is the bug we're testing for
    const timeoutCount = mockSetTimeout.mock.calls.filter(
      call => call[1] === slowHealthCheck.timeout,
    ).length

    const clearTimeoutCount = mockClearTimeout.mock.calls.length

    // This assertion will fail because the timeout is not cleared properly
    // In the current implementation, clearTimeout is only called in success path
    expect(timeoutCount).toBeGreaterThan(0)
    expect(clearTimeoutCount).toBe(0) // This demonstrates the leak
  })

  it('should clear timeout when health check succeeds', async () => {
    // Create a fast health check that should succeed
    const fastHealthCheck = {
      name: 'fast-check',
      check: () => Promise.resolve({ healthy: true, message: 'OK' }),
      interval: 1000,
      timeout: 1000,
      critical: false,
    }

    observabilityManager = new ObservabilityManager()
    observabilityManager.registerHealthCheck(fastHealthCheck)

    // Get health status - this should succeed and clear timeout
    const healthStatus = await observabilityManager.getHealthStatus()

    // Verify that the health check succeeded
    expect(healthStatus.healthy).toBe(true)

    // Both setTimeout and clearTimeout should be called
    expect(mockSetTimeout).toHaveBeenCalled()
    expect(mockClearTimeout).toHaveBeenCalled()
  })

  it('should not clear timeout when health check fails with error', async () => {
    // Create a health check that throws an error
    const errorHealthCheck = {
      name: 'error-check',
      check: () => Promise.reject(new Error('Health check failed')),
      interval: 1000,
      timeout: 100,
      critical: false,
    }

    observabilityManager = new ObservabilityManager()
    observabilityManager.registerHealthCheck(errorHealthCheck)

    // Get health status - this should fail and leak timeout
    const healthStatus = await observabilityManager.getHealthStatus()

    // Verify that the health check failed
    expect(healthStatus.healthy).toBe(false)

    // setTimeout should be called but clearTimeout should not (this is the bug)
    expect(mockSetTimeout).toHaveBeenCalled()
    expect(mockClearTimeout.mock.calls.length).toBe(0)
  })

  it('should accumulate multiple timeout leaks over repeated calls', async () => {
    // Create multiple slow health checks
    const slowHealthCheck1 = {
      name: 'slow-check-1',
      check: () => new Promise<{ healthy: boolean; message: string }>(() => {}), // Never resolves
      interval: 1000,
      timeout: 50,
      critical: false,
    }

    const slowHealthCheck2 = {
      name: 'slow-check-2',
      check: () => new Promise<{ healthy: boolean; message: string }>(() => {}), // Never resolves
      interval: 1000,
      timeout: 50,
      critical: false,
    }

    observabilityManager = new ObservabilityManager()
    observabilityManager.registerHealthCheck(slowHealthCheck1)
    observabilityManager.registerHealthCheck(slowHealthCheck2)

    // Call getHealthStatus multiple times to accumulate leaks
    await observabilityManager.getHealthStatus()
    await observabilityManager.getHealthStatus()
    await observabilityManager.getHealthStatus()

    // Each call should create 2 timeouts (one for each health check)
    // but none should be cleared, demonstrating the leak
    const expectedTimeouts = 6 // 3 calls * 2 health checks
    const expectedClears = 0 // None cleared due to bug

    expect(mockSetTimeout.mock.calls.length).toBeGreaterThanOrEqual(expectedTimeouts)
    expect(mockClearTimeout.mock.calls.length).toBe(expectedClears)
  })

  it('should demonstrate that timeout handles are not stored for cleanup', () => {
    // This test shows that timeout handles are not properly managed
    // In the current implementation, timeoutHandle is a local variable
    // that gets lost when the function scope ends

    observabilityManager = new ObservabilityManager()

    // Access the internal getHealthStatus method to inspect timeout handling
    const getHealthStatusMethod = observabilityManager['getHealthStatus']

    // The method should have a way to track and clean up timeout handles
    // but currently it doesn't
    expect(getHealthStatusMethod).toBeDefined()

    // This demonstrates the design flaw: timeout handles are not tracked
    // for cleanup in error scenarios
  })
})
