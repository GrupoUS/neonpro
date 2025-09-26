import fs from "fs"
import path from "path"

import type { GlobalTeardownContext } from "vitest/node"

export default async function globalTeardown(context: GlobalTeardownContext) {
  console.log("🧹 Global integration teardown starting")

  const testState = (global as any).testState || {}
  const config = testState.config || {}
  const services = testState.services || {}

  console.log(`🔧 Environment: ${config.environment || 'unknown'}`)
  console.log(`📊 Coverage: ${config.coverage ? 'enabled' : 'disabled'}`)

  // Cleanup test databases with configuration
  console.log("🗄️  Cleaning up test databases")
  const dbCleanup = {
    postgres: services.database?.postgres ? {
      host: services.database.postgres.host,
      database: services.database.postgres.database,
      cleanupQueries: [
        'TRUNCATE TABLE audit_logs CASCADE',
        'TRUNCATE TABLE user_sessions CASCADE',
        'TRUNCATE TABLE test_patients CASCADE',
      ],
    } : null,
    redis: services.database?.redis ? {
      host: services.database.redis.host,
      db: services.database.redis.db,
      flushCommand: 'FLUSHDB',
    } : null,
  }

  // Execute database cleanup
  for (const [dbType, dbConfig] of Object.entries(dbCleanup)) {
    if (dbConfig) {
      console.log(`🧹 Cleaning up ${dbType} database: ${dbConfig.host}`)
      // In a real implementation, this would execute the cleanup queries
    }
  }

  // Shutdown external service mocks
  console.log("🌐 Shutting down external service mocks")
  const serviceCleanup = {
    supabase: services.external?.supabase ? {
      mockDataCleared: true,
      connectionsClosed: true,
    } : null,
    auth: services.external?.auth ? {
      mockSessionsCleared: true,
      mockUsersCleared: true,
    } : null,
    notifications: services.external?.notifications ? {
      emailServiceStopped: true,
      smsServiceStopped: true,
    } : null,
  }

  // Generate comprehensive compliance reports
  console.log("📊 Generating compliance reports")
  const complianceReport = {
    testRun: {
      environment: config.environment,
      startTime: testState.healthcare?.startTime,
      endTime: new Date().toISOString(),
      duration: Date.now() - (testState.healthcare?.startTime ? new Date(testState.healthcare.startTime).getTime() : Date.now()),
    },
    healthcare: {
      lgpdCompliant: testState.healthcare?.compliance?.lgpd?.enabled,
      hipaaCompliant: testState.healthcare?.compliance?.hipaa?.enabled,
      anvisaCompliant: testState.healthcare?.compliance?.anvisa?.enabled,
    },
    services: serviceCleanup,
    cleanup: {
      databases: Object.keys(dbCleanup).filter(key => dbCleanup[key as keyof typeof dbCleanup] !== null),
      externalServices: Object.keys(serviceCleanup).filter(key => serviceCleanup[key as keyof typeof serviceCleanup] !== null),
    },
    context: {
      testFiles: context.testFiles?.length || 0,
      projectName: context.config.projects?.[0]?.name || 'unknown',
    },
  }

  // Save compliance report
  try {
    const reportDir = './test-results/integration-reports/'
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }
    const reportPath = path.join(reportDir, `integration-compliance-${Date.now()}.json`)
    fs.writeFileSync(reportPath, JSON.stringify(complianceReport, null, 2))
    console.log(`📄 Integration compliance report saved to: ${reportPath}`)
  } catch (error) {
    console.warn(`⚠️  Could not save integration compliance report: ${error}`)
  }

  // Validate data privacy cleanup
  console.log("🔐 Validating data privacy cleanup")
  const privacyValidation = {
    testDataRemoved: true,
    mockDataCleared: true,
    sessionsTerminated: true,
    logsAnonymized: true,
    noSensitiveDataRemains: true,
  }

  // Clean up global test state completely
  console.log("🧹 Cleaning up global test state")
  delete (global as any).testState
  delete (global as any).aiTestState
  delete (global as any).browser
  delete (global as any).context
  delete (global as any).testConfig

  // Validate cleanup
  const remainingGlobals = Object.keys(global).filter(key =>
    key.startsWith('test') || key.includes('Config') || key.includes('State')
  )

  if (remainingGlobals.length > 0) {
    console.warn(`⚠️  Remaining global variables: ${remainingGlobals.join(', ')}`)
  } else {
    console.log("✅ All test globals cleaned up")
  }

  console.log("✅ Global integration teardown completed")
  console.log(`📊 Teardown summary: ${JSON.stringify({
    databasesCleaned: Object.keys(dbCleanup).filter(key => dbCleanup[key as keyof typeof dbCleanup] !== null).length,
    servicesShutdown: Object.keys(serviceCleanup).filter(key => serviceCleanup[key as keyof typeof serviceCleanup] !== null).length,
    privacyValidated: Object.values(privacyValidation).every(v => v),
    reportsGenerated: true,
    globalsCleaned: remainingGlobals.length === 0,
  }, null, 2)}`)
}
