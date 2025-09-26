#!/usr/bin/env node

/**
 * Certificate Monitoring Script for NeonPro
 * Runs periodic certificate checks and sends alerts
 */

const { certificateMonitor } = require('../dist/services/certificate-monitor')

// Configuration
const CHECK_INTERVAL = process.env.CERT_CHECK_INTERVAL || 6 * 60 * 60 * 1000 // 6 hours
const RUN_ONCE = process.argv.includes('--once')

async function runCertificateCheck() {
  console.warn(`[${new Date().toISOString()}] Starting certificate monitoring check`)

  try {
    // Run the periodic check
    await certificateMonitor.runPeriodicCheck()

    // Get health status
    const healthStatus = await certificateMonitor.getHealthStatus()

    console.warn(`[${new Date().toISOString()}] Certificate check completed:`)
    console.warn(`  Overall Status: ${healthStatus.status}`)
    console.warn(`  Certificates Checked: ${healthStatus.certificates.length}`)

    healthStatus.certificates.forEach(cert => {
      const daysText =
        cert.daysRemaining !== undefined ? ` (${cert.daysRemaining} days remaining)` : ''
      console.warn(`    ${cert.domain}: ${cert.status}${daysText}`)
    })

    // Exit with appropriate code for cron monitoring
    if (healthStatus.status === 'critical') {
      process.exit(2)
    } else if (healthStatus.status === 'warning') {
      process.exit(1)
    } else {
      process.exit(0)
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Certificate monitoring failed:`, error.message)
    process.exit(3)
  }
}

async function startMonitoring() {
  if (RUN_ONCE) {
    // Run once and exit (for cron)
    await runCertificateCheck()
  } else {
    // Run continuously (for daemon mode)
    console.warn(`[${new Date().toISOString()}] Starting certificate monitoring daemon`)
    console.warn(`Check interval: ${CHECK_INTERVAL / 1000 / 60} minutes`)

    // Run initial check
    await runCertificateCheck()

    // Schedule periodic checks
    setInterval(async () => {
      try {
        await runCertificateCheck()
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Monitoring error:`, error.message)
      }
    }, CHECK_INTERVAL)

    // Keep the process running
    process.on('SIGTERM', () => {
      console.warn(`[${new Date().toISOString()}] Received SIGTERM, shutting down gracefully`)
      process.exit(0)
    })

    process.on('SIGINT', () => {
      console.warn(`[${new Date().toISOString()}] Received SIGINT, shutting down gracefully`)
      process.exit(0)
    })
  }
}

// Handle uncaught errors
process.on('uncaughtException', error => {
  console.error(`[${new Date().toISOString()}] Uncaught exception:`, error)
  process.exit(4)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error(`[${new Date().toISOString()}] Unhandled rejection at:`, promise, 'reason:', reason)
  process.exit(5)
})

// Start monitoring
startMonitoring().catch(error => {
  console.error(`[${new Date().toISOString()}] Failed to start monitoring:`, error.message)
  process.exit(6)
})
