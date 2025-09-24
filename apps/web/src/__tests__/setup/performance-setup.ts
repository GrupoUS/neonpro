/**
 * Performance Test Setup
 *
 * Global setup for performance testing including:
 * - Performance monitoring initialization
 * - Mock performance API setup
 * - Benchmark utilities
 * - Performance metrics collection
 */

import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest'
import { PerformanceTestUtils } from '../utils/performance-utils'

// Performance metrics collection
let performanceMetrics: {
  renderTimes: number[]
  memoryUsage: number[]
  responseTimes: number[]
  websocketLatencies: number[]
} = {
  renderTimes: [],
  memoryUsage: [],
  responseTimes: [],
  websocketLatencies: [],
}

// Baseline metrics for regression detection
const baselineMetrics = {
  catalogRenderTime: 80,
  appointmentLoadTime: 150,
  websocketLatency: 50,
  memoryUsage: 30,
}

beforeAll(() => {
  // Setup performance monitoring
  PerformanceTestUtils.setupPerformanceMonitoring()

  // Setup mock performance API if not available
  if (!global.performance) {
    global.performance = {
      now: () => Date.now(),
      getEntriesByType: () => [],
      clearMarks: () => {},
      clearMeasures: () => {},
      mark: () => {},
      measure: () => {},
      memory: {
        usedJSHeapSize: 50 * 1024 * 1024,
        totalJSHeapSize: 60 * 1024 * 1024,
        jsHeapSizeLimit: 100 * 1024 * 1024,
      },
    } as any
  }

  // Setup WebSocket mock for performance testing
  if (!global.WebSocket) {
    global.WebSocket = class MockWebSocket {
      static readonly CONNECTING = 0
      static readonly OPEN = 1
      static readonly CLOSING = 2
      static readonly CLOSED = 3

      readyState: number = MockWebSocket.OPEN
      onopen: ((event: Event) => void) | null = null
      onmessage: ((event: MessageEvent) => void) | null = null
      onerror: ((event: Event) => void) | null = null
      onclose: ((event: CloseEvent) => void) | null = null

      constructor(private url: string) {
        // Simulate connection
        setTimeout(() => {
          if (this.onopen) {
            this.onopen(new Event('open'))
          }
        }, 10)
      }

      send(data: string) {
        // Simulate message processing
        setTimeout(() => {
          if (this.onmessage) {
            const message = JSON.parse(data)
            const response = {
              type: `${message.type}_response`,
              timestamp: Date.now(),
              data: message.data,
            }
            this.onmessage(
              new MessageEvent('message', {
                data: response,
              }),
            )
          }
        }, Math.random() * 50)
      }

      close() {
        this.readyState = MockWebSocket.CLOSED
        if (this.onclose) {
          this.onclose(new CloseEvent('close'))
        }
      }
    }
  }

  console.warn('🚀 Performance test setup complete')
})

afterAll(() => {
  // Generate performance report
  generatePerformanceReport()

  // Reset performance metrics
  performanceMetrics = {
    renderTimes: [],
    memoryUsage: [],
    responseTimes: [],
    websocketLatencies: [],
  }

  console.warn('✅ Performance test cleanup complete')
})

beforeEach(() => {
  // Clear performance marks and measures
  if (performance.clearMarks) {
    performance.clearMarks()
  }
  if (performance.clearMeasures) {
    performance.clearMeasures()
  }

  // Reset mock performance.now to ensure consistent timing
  const originalNow = performance.now
  performance.now = () => Date.now()
  setTimeout(() => {
    performance.now = originalNow
  }, 0)
})

afterEach(() => {
  // Collect performance metrics after each test
  collectPerformanceMetrics()
})

function collectPerformanceMetrics() {
  // Collect memory usage
  if (performance.memory) {
    const memoryUsage = performance.memory.usedJSHeapSize / (1024 * 1024)
    performanceMetrics.memoryUsage.push(memoryUsage)
  }

  // Log metrics for analysis
  if (performanceMetrics.memoryUsage.length > 0) {
    const avgMemory = performanceMetrics.memoryUsage.reduce((a, b) => a + b, 0)
      / performanceMetrics.memoryUsage.length
    const peakMemory = Math.max(...performanceMetrics.memoryUsage)

    console.warn(
      `📊 Memory Usage - Avg: ${avgMemory.toFixed(2)}MB, Peak: ${peakMemory.toFixed(2)}MB`,
    )
  }
}

function generatePerformanceReport() {
  const report = {
    timestamp: new Date().toISOString(),
    testCount: performanceMetrics.renderTimes.length,
    metrics: {
      renderTimes: calculateStats(performanceMetrics.renderTimes),
      memoryUsage: calculateStats(performanceMetrics.memoryUsage),
      responseTimes: calculateStats(performanceMetrics.responseTimes),
      websocketLatencies: calculateStats(performanceMetrics.websocketLatencies),
    },
    baseline: baselineMetrics,
    regressions: detectRegressions(),
  }

  console.warn('📈 Performance Report:', JSON.stringify(report, null, 2))

  // Store report for CI/CD
  if (typeof process !== 'undefined' && process.env) {
    // In CI/CD environment, save to file
    const fs = require('fs')
    const path = require('path')

    const reportDir = path.join(process.cwd(), 'performance-reports')
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }

    const reportFile = path.join(reportDir, `performance-report-${Date.now()}.json`)
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2))

    console.warn(`📄 Performance report saved to: ${reportFile}`)
  }
}

function calculateStats(values: number[]) {
  if (values.length === 0) {
    return {
      count: 0,
      average: 0,
      min: 0,
      max: 0,
      p95: 0,
      p99: 0,
    }
  }

  const sorted = values.sort((a, b) => a - b)
  const sum = values.reduce((a, b) => a + b, 0)
  const average = sum / values.length

  return {
    count: values.length,
    average: Number(average.toFixed(2)),
    min: Number(sorted[0].toFixed(2)),
    max: Number(sorted[sorted.length - 1].toFixed(2)),
    p95: Number(sorted[Math.floor(sorted.length * 0.95)].toFixed(2)),
    p99: Number(sorted[Math.floor(sorted.length * 0.99)].toFixed(2)),
  }
}

function detectRegressions() {
  const regressions = []

  // Detect render time regressions
  if (performanceMetrics.renderTimes.length > 0) {
    const avgRenderTime = performanceMetrics.renderTimes.reduce((a, b) => a + b, 0)
      / performanceMetrics.renderTimes.length
    if (avgRenderTime > baselineMetrics.catalogRenderTime * 1.2) {
      regressions.push({
        type: 'render_time',
        current: avgRenderTime,
        baseline: baselineMetrics.catalogRenderTime,
        increase:
          ((avgRenderTime - baselineMetrics.catalogRenderTime) / baselineMetrics.catalogRenderTime)
          * 100,
      })
    }
  }

  // Detect memory regressions
  if (performanceMetrics.memoryUsage.length > 0) {
    const avgMemory = performanceMetrics.memoryUsage.reduce((a, b) => a + b, 0)
      / performanceMetrics.memoryUsage.length
    if (avgMemory > baselineMetrics.memoryUsage * 1.2) {
      regressions.push({
        type: 'memory_usage',
        current: avgMemory,
        baseline: baselineMetrics.memoryUsage,
        increase: ((avgMemory - baselineMetrics.memoryUsage) / baselineMetrics.memoryUsage) * 100,
      })
    }
  }

  return regressions
}

// Export performance utilities for tests
export { baselineMetrics, performanceMetrics, PerformanceTestUtils }

// Global performance test helpers
globalThis.performanceTestHelpers = {
  measureRender: PerformanceTestUtils.measureRenderTime,
  measureLoad: PerformanceTestUtils.measureLoadTime,
  measureMemory: PerformanceTestUtils.measureMemoryUsage,
  simulateConcurrentUsers: PerformanceTestUtils.simulateConcurrentUsers,
  measureWebSocket: PerformanceTestUtils.measureWebSocketPerformance,
  expectPerformance: PerformanceTestUtils.expectPerformanceThreshold,
}

// Add custom matchers for performance assertions
declare global {
  namespace Vi {
    interface Assertion {
      toBePerformant(threshold?: number): void
      toHaveGoodPerformance(): void
      toMeetPerformanceBaseline(baseline: number): void
    }
  }
}

// Custom performance matchers
expect.extend({
  toBePerformant(received: number, threshold: number = 200) {
    const pass = received <= threshold
    const message = () =>
      `Expected performance to be ${
        pass ? 'at most' : 'less than'
      } ${threshold}ms, but received ${received}ms`

    return { pass, message }
  },

  toHaveGoodPerformance(received: any) {
    const metrics = received
    const checks = [
      metrics.renderTime < 200,
      metrics.memoryUsage < 100,
      metrics.responseTime < 500,
    ]

    const pass = checks.every(Boolean)
    const message = () =>
      `Expected good performance metrics, but received: ${JSON.stringify(metrics)}`

    return { pass, message }
  },

  toMeetPerformanceBaseline(received: number, baseline: number) {
    const threshold = baseline * 1.2 // 20% tolerance
    const pass = received <= threshold
    const message = () =>
      `Expected performance to be within 20% of baseline (${baseline}ms), but received ${received}ms`

    return { pass, message }
  },
})

console.warn('🔧 Performance test helpers initialized')
