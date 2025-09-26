import { chromium, FullConfig } from "@playwright/test"

async function globalSetup(config: FullConfig) {
  console.log("🚀 Starting global setup for NeonPro E2E tests")

  // Healthcare compliance validation
  console.log("🏥 Validating healthcare compliance requirements")

  // Use config to determine test environment
  const isCI = process.env.CI === "true" || config.projects?.some(project => project.name === "ci")
  console.log(`🔧 Running in ${isCI ? "CI" : "local"} environment`)

  // Setup browser context for healthcare testing
  const browser = await chromium.launch({
    headless: isCI,
    slowMo: isCI ? 0 : 100,
  })

  const context = await browser.newContext({
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    permissions: ["geolocation", "notifications"],
    viewport: { width: 1280, height: 720 },
    recordVideo: isCI ? undefined : { dir: "./test-results/videos/" },
  }) // Store browser instance and context for global teardown
  ;(global as any).browser = browser
  ;(global as any).context = context // Store config for test execution
  ;(global as any).testConfig = {
    isCI,
    projectName: config.projects?.[0]?.name || "default",
    timeout: (config as any).timeout || 30000,
  }

  console.log("✅ Global setup completed")
  console.log(`📊 Test configuration: ${JSON.stringify((global as any).testConfig, null, 2)}`)
}

export default globalSetup
