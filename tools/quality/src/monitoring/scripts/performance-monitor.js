#!/usr/bin/env node

import fs from 'fs'
import https from 'https'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class PerformanceMonitor {
  constructor() {
    this.config = this.loadConfig()
    this.metrics = {
      responseTime: [],
      errorRate: 0,
      throughput: 0,
      uptime: 100,
    }
  }

  loadConfig() {
    const configPath = path.join(
      __dirname,
      '../config/performance-monitoring.json',
    )
    return JSON.parse(fs.readFileSync(configPath, 'utf8'))
  }

  async measureEndpoint(endpoint) {
    const startTime = process.hrtime.bigint()

    return new Promise((resolve) => {
      const options = {
        hostname: process.env.DEPLOYMENT_URL || 'localhost',
        port: 443,
        path: endpoint,
        method: 'GET',
        timeout: 10000,
      }

      const req = https.request(options, (res) => {
        const endTime = process.hrtime.bigint()
        const responseTime = Number(endTime - startTime) / 1000000 // Convert to ms

        let data = ''
        res.on('data', (chunk) => (data += chunk))
        res.on('end', () => {
          resolve({
            endpoint,
            statusCode: res.statusCode,
            responseTime,
            contentLength: data.length,
            success: res.statusCode >= 200 && res.statusCode < 300,
            timestamp: new Date().toISOString(),
          })
        })
      })

      req.on('error', (error) => {
        resolve({
          endpoint,
          success: false,
          error: error.message,
          responseTime: 0,
          timestamp: new Date().toISOString(),
        })
      })

      req.end()
    })
  }

  async runPerformanceTests() {
    console.error('⚡ Running Performance Tests...')
    console.error('==============================')

    const results = []

    for (const endpoint of this.config.endpoints) {
      const result = await this.measureEndpoint(endpoint)
      results.push(result)

      const status = result.success ? '✅' : '❌'
      const time = result.responseTime
        ? `${result.responseTime.toFixed(2)}ms`
        : 'N/A'
      const warning = result.responseTime > this.config.metrics.responseTime.warning
        ? '⚠️'
        : ''

      console.error(`${status} ${endpoint}: ${time} ${warning}`)
    }

    this.analyzeResults(results)
    this.saveResults(results)
  }

  analyzeResults(results) {
    const successfulResults = results.filter((r) => r.success)
    const avgResponseTime = successfulResults.reduce((sum, r) => sum + r.responseTime, 0)
      / successfulResults.length
    const errorRate = ((results.length - successfulResults.length) / results.length) * 100

    console.error('\n📊 Performance Summary:')
    console.error(`Average Response Time: ${avgResponseTime.toFixed(2)}ms`)
    console.error(`Error Rate: ${errorRate.toFixed(2)}%`)
    console.error(
      `Successful Requests: ${successfulResults.length}/${results.length}`,
    )

    // Check thresholds
    if (avgResponseTime > this.config.metrics.responseTime.critical) {
      console.error('🚨 CRITICAL: Response time exceeds critical threshold!')
    } else if (avgResponseTime > this.config.metrics.responseTime.warning) {
      console.error('⚠️ WARNING: Response time exceeds warning threshold')
    }

    if (errorRate > this.config.metrics.errorRate.critical) {
      console.error('🚨 CRITICAL: Error rate exceeds critical threshold!')
    } else if (errorRate > this.config.metrics.errorRate.warning) {
      console.error('⚠️ WARNING: Error rate exceeds warning threshold')
    }
  }

  saveResults(results) {
    const logPath = path.join(__dirname, '../logs/performance-results.json')
    const logEntry = {
      timestamp: new Date().toISOString(),
      results,
      summary: {
        avgResponseTime: results.reduce((sum, r) => sum + (r.responseTime || 0), 0)
          / results.length,
        errorRate: ((results.length - results.filter((r) => r.success).length)
          / results.length)
          * 100,
        totalRequests: results.length,
      },
    }

    const logs = this.loadExistingLogs(logPath)
    logs.push(logEntry)

    if (logs.length > 500) {
      logs.splice(0, logs.length - 500)
    }

    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2))
  }

  loadExistingLogs(logPath) {
    try {
      return JSON.parse(fs.readFileSync(logPath, 'utf8'))
    } catch {
      return []
    }
  }
}

const monitor = new PerformanceMonitor()
monitor.runPerformanceTests().catch(console.error)
