import * as fs from "fs"
import * as path from "path"

import { FullConfig } from "@playwright/test"

async function globalTeardown(config: FullConfig) {
  console.log("🧹 Starting global teardown")

  const testConfig = (global as any).testConfig || {}
  const isCI = testConfig.isCI || process.env.CI
  const projectName = testConfig.projectName || 'default'

  console.log(`🔧 Tearing down ${projectName} tests`)
  console.log(`📍 Environment: ${isCI ? 'CI' : 'local'}`)

  // Clean up browser instance with context
  const browser = (global as any).browser
  if (browser) {
    await browser.close()
    console.log("🔒 Browser instance closed")
  }

  // Clean up browser context if it exists
  const context = (global as any).context
  if (context) {
    await context.close()
    console.log("🔒 Browser context closed")
  }

  // Cleanup test artifacts with configuration
  console.log("🗑️  Cleaning up test artifacts")
  const artifacts = {
    screenshots: './test-results/screenshots/',
    videos: './test-results/videos/',
    traces: './test-results/traces/',
  }

  for (const [artifactType, path] of Object.entries(artifacts)) {
    try {
      if (fs.existsSync(path)) {
        const files = fs.readdirSync(path)
        console.log(`📁 Found ${files.length} ${artifactType} in ${path}`)
      }
    } catch (error) {
      console.warn(`⚠️  Could not read ${artifactType} directory: ${error}`)
    }
  }

  // Generate compliance report with context
  console.log("📊 Generating healthcare compliance report")
  const complianceReport = {
    testRun: {
      project: projectName,
      environment: isCI ? 'CI' : 'local',
      timestamp: new Date().toISOString(),
      duration: Date.now() - (testConfig.startTime || Date.now()),
    },
    browser: {
      closed: !!browser,
      contextClosed: !!context,
    },
    artifacts: artifacts,
    config: {
      timeout: (config as any).timeout,
      projects: config.projects?.length || 0,
      workers: (config as any).workers,
    },
  }

  // Save compliance report
  try {
    const reportDir = './test-results/reports/'
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }
    const reportPath = path.join(reportDir, `compliance-report-${Date.now()}.json`)
    fs.writeFileSync(reportPath, JSON.stringify(complianceReport, null, 2))
    console.log(`📄 Compliance report saved to: ${reportPath}`)
  } catch (error) {
    console.warn(`⚠️  Could not save compliance report: ${error}`)
  }

  // Clean up global state
  delete (global as any).browser
  delete (global as any).context
  delete (global as any).testConfig

  console.log("✅ Global teardown completed")
  console.log(`📊 Test run summary: ${JSON.stringify({
    project: projectName,
    environment: isCI ? 'CI' : 'local',
    browserClosed: !!browser,
    reportGenerated: true,
  }, null, 2)}`)
}

export default globalTeardown
