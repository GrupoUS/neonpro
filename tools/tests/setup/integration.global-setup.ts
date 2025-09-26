/* eslint-disable no-console */

import { GlobalSetupContext } from "vitest/node"

export default async function globalSetup(context: GlobalSetupContext) {
  console.log("🚀 Global integration setup starting")

  // Extract configuration from context
  const testConfig = {
    environment: context.config.environment || 'test',
    coverage: context.config.coverage,
    testNamePattern: context.config.testNamePattern,
    hookTimeout: context.config.hookTimeout,
  }

  console.log(`🔧 Integration environment: ${testConfig.environment}`)
  console.log(`📊 Coverage enabled: ${testConfig.coverage ? 'yes' : 'no'}`)

  // Setup healthcare compliance infrastructure
  console.log("🏥 Setting up healthcare compliance infrastructure")
  const healthcareCompliance = {
    lgpd: {
      enabled: true,
      dataRetentionDays: 365,
      consentRequired: true,
    },
    hipaa: {
      enabled: testConfig.environment === 'production',
      auditLogging: true,
      encryptionAtRest: true,
    },
    anvisa: {
      enabled: true,
      electronicRecords: true,
      digitalSignature: true,
    },
  }

  // Initialize mock external services
  console.log("🌐 Initializing external service mocks")
  const externalServices = {
    supabase: {
      url: process.env.SUPABASE_URL,
      anonKey: process.env.SUPABASE_ANON_KEY,
      mockData: generateMockHealthcareData(),
    },
    auth: {
      provider: 'supabase',
      mockUsers: generateMockUsers(),
      mockSessions: generateMockSessions(),
    },
    notifications: {
      email: {
        enabled: process.env.EMAIL_SERVICE_ENABLED === 'true',
        provider: 'sendgrid',
      },
      sms: {
        enabled: process.env.SMS_SERVICE_ENABLED === 'true',
        provider: 'twilio',
      },
    },
  }

  // Setup test databases with healthcare data
  console.log("🗄️  Setting up test databases")
  const databaseConfig = {
    postgres: {
      host: process.env.TEST_DB_HOST || 'localhost',
      port: parseInt(process.env.TEST_DB_PORT || '5432'),
      database: process.env.TEST_DB_NAME || 'neonpro_test',
      ssl: process.env.NODE_ENV === 'production',
    },
    redis: {
      host: process.env.TEST_REDIS_HOST || 'localhost',
      port: parseInt(process.env.TEST_REDIS_PORT || '6379'),
      db: parseInt(process.env.TEST_REDIS_DB || '0'),
    },
  }

  // Configure compliance logging with context
  console.log("📊 Configuring compliance logging")
  const loggingConfig = {
    level: testConfig.environment === 'production' ? 'warn' : 'debug',
    sensitiveDataMasking: true,
    auditTrail: true,
    structuredLogging: true,
    outputs: ['console', 'file'],
    filePath: './test-results/integration-logs.json',
  }

  // Store comprehensive global test state
  ;(global as any).testState = {
    config: testConfig,
    healthcare: {
      compliance: healthcareCompliance,
      locale: "pt-BR",
      timezone: "America/Sao_Paulo",
      startTime: new Date().toISOString(),
    },
    services: {
      database: databaseConfig,
      external: externalServices,
      compliance: healthcareCompliance,
      logging: loggingConfig,
    },
    context: {
      project: context.config.project,
      testFiles: (context.config as any).testFiles,
      watchMode: context.config.watch,
    },
  }

  console.log("✅ Global integration setup completed")
  console.log(`📊 Test state size: ${JSON.stringify((global as any).testState).length} characters`)
}

// Helper functions to generate mock data
function generateMockHealthcareData() {
  return {
    patients: Array.from({ length: 10 }, (_, i) => ({
      id: `patient-${i + 1}`,
      name: `Patient ${i + 1}`,
      cpf: `${String(i + 1).padStart(3, '0')}.${String(i + 1).padStart(3, '0')}.${String(i + 1).padStart(3, '0')}-${Math.floor(Math.random() * 10)}`,
      birthDate: new Date(1990 + i, i % 12, (i % 28) + 1).toISOString().split('T')[0],
    })),
    appointments: Array.from({ length: 5 }, (_, i) => ({
      id: `appointment-${i + 1}`,
      patientId: `patient-${(i % 10) + 1}`,
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
      status: ['scheduled', 'completed', 'cancelled'][i % 3],
    })),
  }
}

function generateMockUsers() {
  return [
    {
      id: 'user-1',
      email: 'doctor@neonpro.com',
      role: 'doctor',
      permissions: ['read:patients', 'write:appointments'],
    },
    {
      id: 'user-2',
      email: 'nurse@neonpro.com',
      role: 'nurse',
      permissions: ['read:patients', 'write:vitals'],
    },
    {
      id: 'user-3',
      email: 'admin@neonpro.com',
      role: 'admin',
      permissions: ['*'],
    },
  ]
}

function generateMockSessions() {
  return generateMockUsers().map(user => ({
    id: `session-${user.id}`,
    userId: user.id,
    token: `mock-token-${user.id}`,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }))
}
