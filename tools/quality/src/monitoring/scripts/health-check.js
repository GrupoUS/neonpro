#!/usr/bin/env node

import fs from 'fs'
import https from 'https'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class HealthChecker {
  constructor() {
    this.config = this.loadConfig()
    this.results = []
  }

  loadConfig() {
    const configPath = path.join(__dirname, '../config/health-checks.json')
    return JSON.parse(fs.readFileSync(configPath, 'utf8'))
  }

  async checkEndpoint(name, config) {
    const startTime = Date.now()

    return new Promise((resolve) => {
      const options = {
        hostname: process.env.DEPLOYMENT_URL || 'localhost',
        port: 443,
        path: config.endpoint,
        method: 'GET',
        timeout: config.timeout * 1000,
      }

      const req = https.request(options, (res) => {
        const responseTime = Date.now() - startTime
        const success = res.statusCode === config.expectedStatus

        resolve({
          name,
          endpoint: config.endpoint,
          success,
          statusCode: res.statusCode,
          responseTime,
          timestamp: new Date().toISOString(),
        })
      })

      req.on('error', (error) => {
        resolve({
          name,
          endpoint: config.endpoint,
          success: false,
          error: error.message,
          responseTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        })
      })

      req.on('timeout', () => {
        resolve({
          name,
          endpoint: config.endpoint,
          success: false,
          error: 'Timeout',
          responseTime: config.timeout * 1000,
          timestamp: new Date().toISOString(),
        })
      })

      req.end()
    })
  }

  async runHealthChecks() {
    console.error('🏥 Running Health Checks...')
    console.error('============================')

    for (const [name, config] of Object.entries(this.config.healthChecks)) {
      const result = await this.checkEndpoint(name, config)
      this.results.push(result)

      const status = result.success ? '✅' : '❌'
      const time = result.responseTime ? `(${result.responseTime}ms)` : ''

      console.error(`${status} ${name}: ${result.endpoint} ${time}`)

      if (!result.success && result.error) {
        console.error(`   Error: ${result.error}`)
      }
    }

    this.saveResults()
    this.checkAlerts()
  }

  saveResults() {
    const logPath = path.join(__dirname, '../logs/health-check-results.json')
    const logEntry = {
      timestamp: new Date().toISOString(),
      results: this.results,
    }

    // Append to log file
    const logs = this.loadExistingLogs(logPath)
    logs.push(logEntry)

    // Keep only last 1000 entries
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000)
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

  checkAlerts() {
    const failedChecks = this.results.filter((r) => !r.success)

    if (failedChecks.length > 0) {
      console.error('🚨 ALERT: Health check failures detected!')
      console.error('Failed checks:', failedChecks.map((f) => f.name).join(', '))

      // Here you would integrate with your alerting system
      // this.sendAlert(failedChecks);
    } else {
      console.error('✅ All health checks passed!')
    }
  }
}

// Run health checks
;(async () => {
  const checker = new HealthChecker()
  try {
    await checker.runHealthChecks()
  } catch (error) {
    console.error(error)
  }
})()
