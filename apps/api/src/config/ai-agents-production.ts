/**
 * AI Agents Production Configuration
 * Healthcare-compliant production settings for AI agents
 */

export interface AIAgentsProductionConfig {
  // Core Configuration
  enabled: boolean
  environment: 'production' | 'staging' | 'development' | 'test'
  debug: boolean
  
  // Provider Configuration
  providers: {
    primary: 'openai' | 'anthropic' | 'google'
    fallback: Array<'openai' | 'anthropic' | 'google'>
    autoFailover: boolean
    loadBalancing: boolean
  }
  
  // Model Configuration
  models: {
    default: string
    maxTokens: number
    temperature: number
    topP: number
    frequencyPenalty: number
    presencePenalty: number
  }
  
  // Agent Configuration
  agents: {
    maxConcurrentQueries: number
    queryTimeout: number
    healthCheckInterval: number
    restartOnFailure: boolean
    gracefulShutdownTimeout: number
  }
  
  // RAG Configuration
  rag: {
    enabled: boolean
    pythonPath: string
    agentPath: string
    maxConcurrentQueries: number
    queryTimeout: number
    embeddingModel: string
    vectorStoreSize: number
    retrievalK: number
    retrievalScoreThreshold: number
    cacheEnabled: boolean
    cacheTtl: number
  }
  
  // Session Management
  sessions: {
    timeout: number
    maxPerUser: number
    cleanupInterval: number
    persistenceEnabled: boolean
  }
  
  // Security & Compliance
  security: {
    lgpdCompliance: boolean
    consentValidation: boolean
    auditLogging: boolean
    dataAnonymization: boolean
    phiDetection: boolean
    contentFiltering: boolean
    emergencyMode: boolean
    rateLimiting: boolean
    rateLimitRequestsPerMinute: number
    rateLimitBurst: number
    inputValidation: boolean
    outputSanitization: boolean
    piiDetection: boolean
    encryptionAtRest: boolean
  }
  
  // Performance & Caching
  performance: {
    modelCaching: boolean
    modelCacheTtl: number
    responseCaching: boolean
    responseCacheTtl: number
    compression: boolean
    batchProcessing: boolean
    circuitBreaker: boolean
    circuitBreakerThreshold: number
  }
  
  // Monitoring & Analytics
  monitoring: {
    analytics: boolean
    usageTracking: boolean
    performanceMonitoring: boolean
    errorTracking: boolean
    sessionAnalytics: boolean
    costTracking: boolean
    tokenUsageTracking: boolean
  }
  
  // Healthcare Specific
  healthcare: {
    emergencyMode: boolean
    failoverProvider: boolean
    emergencyContacts: Array<{
      name: string
      role: string
      email: string
      phone: string
    }>
    complianceOfficer: {
      name: string
      email: string
      phone: string
    }
  }
}

// Production Configuration
export const productionConfig: AIAgentsProductionConfig = {
  enabled: true,
  environment: 'production',
  debug: false,
  
  providers: {
    primary: 'openai',
    fallback: ['anthropic', 'google'],
    autoFailover: true,
    loadBalancing: true,
  },
  
  models: {
    default: 'gpt-4o',
    maxTokens: 4000,
    temperature: 0.3, // Lower temperature for consistent healthcare responses
    topP: 0.9,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
  },
  
  agents: {
    maxConcurrentQueries: 20, // Higher capacity for production
    queryTimeout: 45000, // 45 seconds timeout
    healthCheckInterval: 30000,
    restartOnFailure: true,
    gracefulShutdownTimeout: 30000,
  },
  
  rag: {
    enabled: true,
    pythonPath: 'python3',
    agentPath: './agents/ag-ui-rag-agent',
    maxConcurrentQueries: 10,
    queryTimeout: 60000, // 60 seconds for RAG operations
    embeddingModel: 'text-embedding-3-small',
    vectorStoreSize: 10000,
    retrievalK: 5,
    retrievalScoreThreshold: 0.7,
    cacheEnabled: true,
    cacheTtl: 3600, // 1 hour cache
  },
  
  sessions: {
    timeout: 1800000, // 30 minutes (shorter for production security)
    maxPerUser: 3, // Reduced for production
    cleanupInterval: 300000, // 5 minutes cleanup
    persistenceEnabled: false, // No persistence for production security
  },
  
  security: {
    lgpdCompliance: true,
    consentValidation: true,
    auditLogging: true,
    dataAnonymization: true,
    phiDetection: true,
    contentFiltering: true,
    emergencyMode: true,
    rateLimiting: true,
    rateLimitRequestsPerMinute: 60,
    rateLimitBurst: 10,
    inputValidation: true,
    outputSanitization: true,
    piiDetection: true,
    encryptionAtRest: true,
  },
  
  performance: {
    modelCaching: true,
    modelCacheTtl: 1800, // 30 minutes
    responseCaching: true,
    responseCacheTtl: 900, // 15 minutes
    compression: true,
    batchProcessing: true,
    circuitBreaker: true,
    circuitBreakerThreshold: 5,
  },
  
  monitoring: {
    analytics: true,
    usageTracking: true,
    performanceMonitoring: true,
    errorTracking: true,
    sessionAnalytics: true,
    costTracking: true,
    tokenUsageTracking: true,
  },
  
  healthcare: {
    emergencyMode: true,
    failoverProvider: true,
    emergencyContacts: [
      {
        name: 'Dr. Ana Silva',
        role: 'Médica Coordenadora',
        email: 'ana.silva@neonpro.healthcare',
        phone: '+5511999999999',
      },
      {
        name: 'Carlos Oliveira',
        role: 'TI - Suporte',
        email: 'carlos.oliveira@neonpro.healthcare',
        phone: '+5511988888888',
      },
    ],
    complianceOfficer: {
      name: 'Dra. Maria Santos',
      email: 'maria.santos@neonpro.healthcare',
      phone: '+5511977777777',
    },
  },
}

// Staging Configuration (slightly relaxed for testing)
export const stagingConfig: AIAgentsProductionConfig = {
  ...productionConfig,
  environment: 'staging',
  debug: true,
  models: {
    ...productionConfig.models,
    temperature: 0.5, // Slightly higher for testing
  },
  agents: {
    ...productionConfig.agents,
    maxConcurrentQueries: 10, // Reduced for staging
  },
  sessions: {
    ...productionConfig.sessions,
    timeout: 3600000, // 1 hour for testing
    maxPerUser: 5,
    persistenceEnabled: true, // Enable for testing
  },
  security: {
    ...productionConfig.security,
    rateLimitRequestsPerMinute: 120, // More permissive for staging
    rateLimitBurst: 20,
  },
}

// Development Configuration
export const developmentConfig: AIAgentsProductionConfig = {
  ...stagingConfig,
  environment: 'development',
  debug: true,
  models: {
    ...productionConfig.models,
    default: 'gpt-4o-mini', // Use cheaper model for development
    temperature: 0.7,
  },
  agents: {
    ...productionConfig.agents,
    maxConcurrentQueries: 5,
    queryTimeout: 30000,
  },
  sessions: {
    ...productionConfig.sessions,
    timeout: 7200000, // 2 hours for development
    maxPerUser: 10,
  },
  security: {
    ...productionConfig.security,
    rateLimiting: false, // Disable rate limiting in development
    inputValidation: true,
    outputSanitization: true,
  },
}

// Configuration getter
export function getAIAgentsProductionConfig(): AIAgentsProductionConfig {
  const environment = process.env.NODE_ENV || 'development'
  
  switch (environment) {
    case 'production':
      return productionConfig
    case 'staging':
      return stagingConfig
    default:
      return developmentConfig
  }
}

// Validation function
export function validateAIAgentsConfig(config: AIAgentsProductionConfig): boolean {
  try {
    // Basic validation
    if (!config.enabled) return true // Disabled is valid
    
    if (!config.providers.primary || !config.providers.fallback.length) {
      console.error('Invalid provider configuration')
      return false
    }
    
    if (config.models.maxTokens <= 0 || config.models.temperature < 0 || config.models.temperature > 1) {
      console.error('Invalid model configuration')
      return false
    }
    
    if (config.agents.maxConcurrentQueries <= 0 || config.agents.queryTimeout <= 0) {
      console.error('Invalid agent configuration')
      return false
    }
    
    // Healthcare-specific validation
    if (config.environment === 'production' && !config.security.lgpdCompliance) {
      console.error('LGPD compliance required in production')
      return false
    }
    
    return true
  } catch (error) {
    console.error('Configuration validation error:', error)
    return false
  }
}

// Environment-specific configuration override
export function applyEnvironmentOverrides(config: AIAgentsProductionConfig): AIAgentsProductionConfig {
  const overrides = {
    ...config,
  }
  
  // Override with environment variables if they exist
  if (process.env.AI_DEFAULT_MODEL) {
    overrides.models.default = process.env.AI_DEFAULT_MODEL
  }
  
  if (process.env.AI_MAX_TOKENS) {
    overrides.models.maxTokens = parseInt(process.env.AI_MAX_TOKENS)
  }
  
  if (process.env.AI_TEMPERATURE) {
    overrides.models.temperature = parseFloat(process.env.AI_TEMPERATURE)
  }
  
  if (process.env.AI_AGENT_MAX_CONCURRENT_QUERIES) {
    overrides.agents.maxConcurrentQueries = parseInt(process.env.AI_AGENT_MAX_CONCURRENT_QUERIES)
  }
  
  if (process.env.RAG_AGENT_ENABLED === 'false') {
    overrides.rag.enabled = false
  }
  
  return overrides
}

export default getAIAgentsProductionConfig