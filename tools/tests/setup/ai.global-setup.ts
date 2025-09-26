import { GlobalSetupContext } from "vitest/node"

export default async function globalSetup(context: GlobalSetupContext) {
  console.log("🤖 AI testing global setup starting")

  // Initialize AI testing environment with context
  console.log("🧠 Setting up AI testing environment")

  // Use context to configure test environment
  const testConfig = {
    projectDir: context.config.project,
    testFiles: (context.config as any).testFiles,
    environment: context.config.environment,
    coverage: context.config.coverage,
  }

  console.log(`📁 Project directory: ${testConfig.projectDir}`)
  console.log(`🧪 Test files: ${testConfig.testFiles?.length || 0}`)

  // Mock AI services for testing based on environment
  console.log("🌐 Setting up AI service mocks")
  const aiServices = {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4",
      enabled: !!process.env.OPENAI_API_KEY,
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: "claude-3-sonnet-20240229",
      enabled: !!process.env.ANTHROPIC_API_KEY,
    },
    custom: {
      endpoint: process.env.CUSTOM_AI_ENDPOINT,
      enabled: !!process.env.CUSTOM_AI_ENDPOINT,
    },
  }

  // Configure AI agent test utilities
  console.log("🔧 Configuring AI agent utilities")
  const agentUtilities = {
    sequentialThinking: {
      enabled: true,
      maxSteps: 10,
    },
    archon: {
      enabled: true,
      projectId: process.env.ARCHON_PROJECT_ID,
    },
    serena: {
      enabled: true,
      codebasePath: testConfig.projectDir,
    },
  }

  // Setup compliance validation for AI systems with context
  console.log("🏥 Setting up healthcare AI compliance")
  const complianceConfig = {
    healthcare: {
      lgpdCompliant: true,
      dataMasking: true,
      auditTrail: true,
    },
    privacy: {
      dataEncryption: true,
      accessControl: true,
      retentionPolicy: "90d",
    },
    security: {
      rateLimiting: true,
      inputValidation: true,
      outputFiltering: true,
    },
  } // Store global AI test state with full context
  ;(global as any).aiTestState = {
    services: aiServices,
    utilities: agentUtilities,
    compliance: complianceConfig,
    testConfig,
    locale: "pt-BR",
    timezone: "America/Sao_Paulo",
    startTime: new Date().toISOString(),
  }

  console.log("✅ AI testing global setup completed")
  console.log(
    `🔧 Enabled services: ${
      Object.entries(aiServices).filter(([_, s]) => s.enabled).map(([k]) => k).join(", ") || "none"
    }`,
  )
}
