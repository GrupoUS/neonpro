import { spawn } from 'child_process'
import { promises as fs } from 'fs'
import path from 'path'
import { performance } from 'perf_hooks'

interface ColdStartMetrics {
  initialStartTime: number
  firstRequestTime: number
  subsequentRequests: number[]
  averageWarmTime: number
  coldStartDelta: number
  memoryUsage?: NodeJS.MemoryUsage
  environment: {
    nodeVersion: string
    platform: string
    arch: string
    timestamp: string
  }
}

interface MeasurementConfig {
  port: number
  warmupRequests: number
  measurementRequests: number
  restartDelay: number
  endpoints: string[]
}

/**
 * Cold Start Measurement Tool for Hono API on Vercel Edge Runtime
 * Simulates cold start conditions and measures performance metrics
 */
export class ColdStartMeasurement {
  private config: MeasurementConfig
  private serverProcess?: import('node:child_process').ChildProcess

  constructor(config: Partial<MeasurementConfig> = {}) {
    this.config = {
      port: 3004,
      warmupRequests: 5,
      measurementRequests: 10,
      restartDelay: 1000,
      endpoints: ['/api', '/api/health', '/api/v1/health', '/api/v1/info'],
      ...config,
    }
  }

  /**
   * Simulate cold start by restarting the server process
   */
  private async simulateColdStart(): Promise<void> {
    // Kill existing server if running
    if (this.serverProcess) {
      this.serverProcess.kill()
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    // Start new server process
    return new Promise((resolve, reject) => {
      const startTime = performance.now()

      this.serverProcess = spawn('bun', ['run', 'dev:api'], {
        cwd: '/root/neonpro',
        env: {
          ...process.env,
          NODE_ENV: 'development',
          PORT: this.config.port.toString(),
        },
        detached: false,
        stdio: ['pipe', 'pipe', 'pipe'],
      })

      let serverReady = false

      this.serverProcess.stdout?.on('data', (data: Buffer) => {
        const output = data.toString()
        if (output.includes('listening on') && !serverReady) {
          serverReady = true
          const readyTime = performance.now() - startTime
          console.log(`Server ready in ${readyTime.toFixed(2)}ms`)
          setTimeout(resolve, this.config.restartDelay)
        }
      })

      this.serverProcess.stderr?.on('data', (data: Buffer) => {
        console.error(`Server error: ${data.toString()}`)
      })

      this.serverProcess.on('error', (error) => {
        reject(new Error(`Failed to start server: ${error.message}`))
      })

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!serverReady) {
          reject(new Error('Server startup timeout'))
        }
      }, 10000)
    })
  }

  /**
   * Make HTTP request and measure response time
   */
  private async measureRequest(endpoint: string): Promise<number> {
    const startTime = performance.now()

    try {
      const response = await fetch(
        `http://localhost:${this.config.port}${endpoint}`,
        {
          method: 'GET',
          headers: { 'User-Agent': 'ColdStart-Measurement/1.0' },
        },
      )

      const endTime = performance.now()

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // Consume response body to complete the request
      await response.text()

      return endTime - startTime
    } catch (error) {
      throw new Error(
        `Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  /**
   * Wait for server to be ready
   */
  private async waitForServer(): Promise<void> {
    const maxAttempts = 20
    const retryDelay = 250

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.measureRequest('/api/health')
        return
      } catch (error) {
        console.warn(
          `Server not ready, attempt ${attempt}/${maxAttempts}:`,
          error,
        )
        if (attempt === maxAttempts) {
          throw new Error(`Server not ready after ${maxAttempts} attempts`)
        }
        await new Promise((resolve) => setTimeout(resolve, retryDelay))
      }
    }
  }

  /**
   * Perform cold start measurement for a specific endpoint
   */
  async measureEndpoint(endpoint: string): Promise<ColdStartMetrics> {
    console.log(`\\n📊 Measuring cold start performance for ${endpoint}`)

    // Simulate cold start
    console.log('🔄 Simulating cold start...')
    const initialStartTime = performance.now()
    await this.simulateColdStart()
    await this.waitForServer()

    // Measure first request (cold start)
    console.log('❄️  Measuring cold start request...')
    const firstRequestTime = await this.measureRequest(endpoint)

    // Warm up with several requests
    console.log(`🔥 Warming up with ${this.config.warmupRequests} requests...`)
    for (let i = 0; i < this.config.warmupRequests; i++) {
      try {
        await this.measureRequest(endpoint)
        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error) {
        console.warn(`Warmup request ${i + 1} failed:`, error)
      }
    }

    // Measure subsequent requests (warm)
    console.log(
      `🌡️  Measuring ${this.config.measurementRequests} warm requests...`,
    )
    const subsequentRequests: number[] = []

    for (let i = 0; i < this.config.measurementRequests; i++) {
      try {
        const responseTime = await this.measureRequest(endpoint)
        subsequentRequests.push(responseTime)
        await new Promise((resolve) => setTimeout(resolve, 50))
      } catch (error) {
        console.warn(`Measurement request ${i + 1} failed:`, error)
      }
    }

    const averageWarmTime = subsequentRequests.reduce((a, b) => a + b, 0)
      / subsequentRequests.length
    const coldStartDelta = firstRequestTime - averageWarmTime

    return {
      initialStartTime,
      firstRequestTime,
      subsequentRequests,
      averageWarmTime,
      coldStartDelta,
      memoryUsage: process.memoryUsage(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        timestamp: new Date().toISOString(),
      },
    }
  }

  /**
   * Run comprehensive cold start measurement for all endpoints
   */
  async measureAll(): Promise<Record<string, ColdStartMetrics>> {
    console.log('🚀 Starting comprehensive cold start measurement...')
    console.log(`📋 Testing endpoints: ${this.config.endpoints.join(', ')}`)

    const results: Record<string, ColdStartMetrics> = {}

    for (const endpoint of this.config.endpoints) {
      try {
        results[endpoint] = await this.measureEndpoint(endpoint)

        // Brief pause between endpoint measurements
        await new Promise((resolve) => setTimeout(resolve, 2000))
      } catch (error) {
        console.error(`❌ Failed to measure ${endpoint}:`, error)
        results[endpoint] = {
          initialStartTime: 0,
          firstRequestTime: -1,
          subsequentRequests: [],
          averageWarmTime: -1,
          coldStartDelta: -1,
          environment: {
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch,
            timestamp: new Date().toISOString(),
          },
        }
      }
    }

    return results
  }

  /**
   * Generate performance report
   */
  generateReport(results: Record<string, ColdStartMetrics>): string {
    let report = '# Cold Start Performance Report\\n\\n'
    report += `Generated: ${new Date().toISOString()}\\n`
    report += `Node.js: ${process.version}\\n`
    report += `Platform: ${process.platform} ${process.arch}\\n\\n`

    // Summary table
    report += '## Performance Summary\\n\\n'
    report += '| Endpoint | Cold Start (ms) | Warm Avg (ms) | Delta (ms) | Improvement |\\n'
    report += '|----------|----------------|---------------|------------|-------------|\\n'

    for (const [endpoint, metrics] of Object.entries(results)) {
      if (metrics.firstRequestTime === -1) {
        report += `| ${endpoint} | ❌ Failed | ❌ Failed | ❌ Failed | ❌ Failed |\\n`
        continue
      }

      const improvement = (
        (metrics.coldStartDelta / metrics.firstRequestTime)
        * 100
      ).toFixed(1)
      report += `| ${endpoint} | ${metrics.firstRequestTime.toFixed(2)} | ${
        metrics.averageWarmTime.toFixed(2)
      } | ${metrics.coldStartDelta.toFixed(2)} | ${improvement}% |\\n`
    }

    // Detailed analysis
    report += '\\n## Detailed Analysis\\n\\n'

    for (const [endpoint, metrics] of Object.entries(results)) {
      if (metrics.firstRequestTime === -1) continue

      report += `### ${endpoint}\\n\\n`
      report += `- **Cold Start Time**: ${metrics.firstRequestTime.toFixed(2)}ms\\n`
      report += `- **Average Warm Time**: ${metrics.averageWarmTime.toFixed(2)}ms\\n`
      report += `- **Cold Start Penalty**: ${metrics.coldStartDelta.toFixed(2)}ms\\n`
      report += `- **Warm Requests**: ${metrics.subsequentRequests.length}\\n`

      if (metrics.subsequentRequests.length > 0) {
        const min = Math.min(...metrics.subsequentRequests)
        const max = Math.max(...metrics.subsequentRequests)
        const p95 = metrics.subsequentRequests.sort((a, b) => a - b)[
          Math.floor(metrics.subsequentRequests.length * 0.95)
        ]

        report += `- **Min Warm Time**: ${min.toFixed(2)}ms\\n`
        report += `- **Max Warm Time**: ${max.toFixed(2)}ms\\n`
        report += `- **P95 Warm Time**: ${p95.toFixed(2)}ms\\n`
      }

      report += '\\n'
    }

    // Memory usage
    if (Object.values(results).some((m) => m.memoryUsage)) {
      report += '## Memory Usage\\n\\n'
      const memUsage = Object.values(results).find(
        (m) => m.memoryUsage,
      )?.memoryUsage
      if (memUsage) {
        report += `- **RSS**: ${(memUsage.rss / 1024 / 1024).toFixed(2)} MB\\n`
        report += `- **Heap Used**: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB\\n`
        report += `- **Heap Total**: ${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB\\n`
        report += `- **External**: ${(memUsage.external / 1024 / 1024).toFixed(2)} MB\\n\\n`
      }
    }

    // Recommendations
    report += '## Performance Recommendations\\n\\n'

    const avgColdStart = Object.values(results)
      .filter((m) => m.firstRequestTime !== -1)
      .reduce((sum, m) => sum + m.firstRequestTime, 0)
      / Object.values(results).filter((m) => m.firstRequestTime !== -1).length

    if (avgColdStart > 1000) {
      report += '⚠️  **High Cold Start Latency Detected**\\n'
      report += '- Consider reducing bundle size with tree shaking\\n'
      report += '- Minimize imports in entry points\\n'
      report += '- Use dynamic imports for heavy dependencies\\n\\n'
    }

    if (avgColdStart > 500) {
      report += '📦 **Bundle Optimization Opportunities**\\n'
      report += '- Analyze bundle composition with webpack-bundle-analyzer\\n'
      report += '- Split vendor dependencies into separate chunks\\n'
      report += '- Consider lazy loading non-critical routes\\n\\n'
    }

    if (avgColdStart < 300) {
      report += '✅ **Excellent Cold Start Performance**\\n'
      report += '- Cold start times are within optimal range\\n'
      report += '- Consider this baseline for performance regression testing\\n\\n'
    }

    report += '💡 **Edge Runtime Optimizations**\\n'
    report += '- Use `export const runtime = "edge"` in Vercel functions\\n'
    report += '- Minimize Node.js-specific APIs usage\\n'
    report += '- Prefer Web APIs over Node.js APIs when possible\\n'
    report += '- Keep bundle size under 1MB for optimal performance\\n\\n'

    return report
  }

  /**
   * Save results to JSON and markdown files
   */
  async saveResults(
    results: Record<string, ColdStartMetrics>,
    outputDir: string = '/root/neonpro/docs/performance',
  ): Promise<void> {
    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true })

    // Save raw JSON data
    const jsonPath = path.join(outputDir, 'cold-start-metrics.json')
    await fs.writeFile(jsonPath, JSON.stringify(results, null, 2))

    // Save markdown report
    const report = this.generateReport(results)
    const reportPath = path.join(outputDir, 'cold-start-performance-report.md')
    await fs.writeFile(reportPath, report)

    console.log(`\\n📄 Results saved:`)
    console.log(`   JSON: ${jsonPath}`)
    console.log(`   Report: ${reportPath}`)
  }

  /**
   * Cleanup: stop server process
   */
  async cleanup(): Promise<void> {
    if (this.serverProcess) {
      this.serverProcess.kill()
      this.serverProcess = undefined
    }
  }
}

/**
 * CLI interface for running cold start measurements
 */
async function runColdStartMeasurement() {
  const measurement = new ColdStartMeasurement()

  try {
    console.log('🔧 Initializing cold start measurement tool...')

    const results = await measurement.measureAll()

    console.log('\\n📊 Measurement completed!\\n')

    // Display summary
    console.log('=== PERFORMANCE SUMMARY ===')
    for (const [endpoint, metrics] of Object.entries(results)) {
      if (metrics.firstRequestTime === -1) {
        console.log(`❌ ${endpoint}: FAILED`)
        continue
      }

      console.log(`📍 ${endpoint}:`)
      console.log(`   Cold Start: ${metrics.firstRequestTime.toFixed(2)}ms`)
      console.log(`   Warm Average: ${metrics.averageWarmTime.toFixed(2)}ms`)
      console.log(`   Penalty: ${metrics.coldStartDelta.toFixed(2)}ms`)
    }

    // Save results
    await measurement.saveResults(results)

    console.log('\\n✅ Cold start measurement completed successfully!')
  } catch (error) {
    console.error('❌ Cold start measurement failed:', error)
    process.exit(1)
  } finally {
    await measurement.cleanup()
  }
}

// Export for programmatic use
export { runColdStartMeasurement }

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  runColdStartMeasurement()
}
