/**
 * Environment configuration for ottomator-agents
 * Healthcare-compliant agent configuration with security and compliance settings
 */

export interface AgentEnvironmentConfig {
  // Agent identification
  agentId: string;
  agentName: string;
  version: string;
  
  // Environment settings
  nodeEnv: 'development' | 'staging' | 'production';
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  
  // Database configuration
  database: {
    supabaseUrl: string;
    supabaseServiceKey: string;
    connectionPoolMin: number;
    connectionPoolMax: number;
    queryTimeout: number;
  };
  
  // AI model configuration
  aiModels: {
    primary: {
      provider: 'openai' | 'anthropic';
      model: string;
      apiKey: string;
      maxTokens: number;
      temperature: number;
    };
    fallback?: {
      provider: 'openai' | 'anthropic';
      model: string;
      apiKey: string;
      maxTokens: number;
      temperature: number;
    };
  };
  
  // Communication settings
  communication: {
    websocketPort: number;
    httpPort: number;
    allowedOrigins: string[];
    corsEnabled: boolean;
  };
  
  // Healthcare compliance
  healthcare: {
    lgpdCompliance: boolean;
    anvisaCompliance: boolean;
    cfmCompliance: boolean;
    auditLogging: boolean;
    dataClassification: 'public' | 'internal' | 'confidential' | 'healthcare_sensitive';
  };
  
  // Security settings
  security: {
    requireAuthentication: boolean;
    sessionTimeout: number;
    encryptionEnabled: boolean;
    rateLimitingEnabled: boolean;
    maxRequestsPerMinute: number;
  };
  
  // Performance settings
  performance: {
    cachingEnabled: boolean;
    cacheTtl: number;
    responseTimeThreshold: number;
    enableCompression: boolean;
  };
}

/**
 * Load agent environment configuration from environment variables
 */
export function loadAgentEnvironmentConfig(): AgentEnvironmentConfig {
  return {
    // Agent identification
    agentId: process.env.AGENT_ID || 'neonpro-healthcare-agent',
    agentName: process.env.AGENT_NAME || 'NeonPro Healthcare AI Agent',
    version: process.env.AGENT_VERSION || '1.0.0',
    
    // Environment settings
    nodeEnv: (process.env.NODE_ENV as any) || 'development',
    logLevel: (process.env.LOG_LEVEL as any) || 'info',
    
    // Database configuration
    database: {
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      connectionPoolMin: parseInt(process.env.DB_POOL_MIN || '2'),
      connectionPoolMax: parseInt(process.env.DB_POOL_MAX || '10'),
      queryTimeout: parseInt(process.env.DB_QUERY_TIMEOUT || '30000'),
    },
    
    // AI model configuration
    aiModels: {
      primary: {
        provider: (process.env.AI_PRIMARY_PROVIDER as any) || 'openai',
        model: process.env.AI_PRIMARY_MODEL || 'gpt-4',
        apiKey: process.env.OPENAI_API_KEY || process.env.AI_PRIMARY_API_KEY || '',
        maxTokens: parseInt(process.env.AI_MAX_TOKENS || '2000'),
        temperature: parseFloat(process.env.AI_TEMPERATURE || '0.3'),
      },
      fallback: process.env.AI_FALLBACK_PROVIDER ? {
        provider: (process.env.AI_FALLBACK_PROVIDER as any) || 'anthropic',
        model: process.env.AI_FALLBACK_MODEL || 'claude-3-sonnet-20240229',
        apiKey: process.env.ANTHROPIC_API_KEY || process.env.AI_FALLBACK_API_KEY || '',
        maxTokens: parseInt(process.env.AI_FALLBACK_MAX_TOKENS || '2000'),
        temperature: parseFloat(process.env.AI_FALLBACK_TEMPERATURE || '0.3'),
      } : undefined,
    },
    
    // Communication settings
    communication: {
      websocketPort: parseInt(process.env.AGENT_WS_PORT || '8080'),
      httpPort: parseInt(process.env.AGENT_HTTP_PORT || '8081'),
      allowedOrigins: (process.env.AGENT_ALLOWED_ORIGINS || 
        'https://neonpro.com.br,https://www.neonpro.com.br,https://neonpro.vercel.app'
      ).split(','),
      corsEnabled: process.env.AGENT_CORS_ENABLED !== 'false',
    },
    
    // Healthcare compliance
    healthcare: {
      lgpdCompliance: process.env.HEALTHCARE_LGPD_COMPLIANCE !== 'false',
      anvisaCompliance: process.env.HEALTHCARE_ANVISA_COMPLIANCE !== 'false',
      cfmCompliance: process.env.HEALTHCARE_CFM_COMPLIANCE !== 'false',
      auditLogging: process.env.HEALTHCARE_AUDIT_LOGGING !== 'false',
      dataClassification: (process.env.HEALTHCARE_DATA_CLASSIFICATION as any) || 'healthcare_sensitive',
    },
    
    // Security settings
    security: {
      requireAuthentication: process.env.AGENT_REQUIRE_AUTH !== 'false',
      sessionTimeout: parseInt(process.env.AGENT_SESSION_TIMEOUT || '1800000'), // 30 minutes
      encryptionEnabled: process.env.AGENT_ENCRYPTION_ENABLED !== 'false',
      rateLimitingEnabled: process.env.AGENT_RATE_LIMITING_ENABLED !== 'false',
      maxRequestsPerMinute: parseInt(process.env.AGENT_MAX_REQUESTS_PER_MINUTE || '60'),
    },
    
    // Performance settings
    performance: {
      cachingEnabled: process.env.AGENT_CACHING_ENABLED !== 'false',
      cacheTtl: parseInt(process.env.AGENT_CACHE_TTL || '300000'), // 5 minutes
      responseTimeThreshold: parseInt(process.env.AGENT_RESPONSE_TIME_THRESHOLD || '2000'), // 2 seconds
      enableCompression: process.env.AGENT_COMPRESSION_ENABLED !== 'false',
    },
  };
}

/**
 * Validate agent environment configuration
 */
export function validateAgentEnvironmentConfig(config: AgentEnvironmentConfig): void {
  const errors: string[] = [];
  
  // Validate required database settings
  if (!config.database.supabaseUrl) {
    errors.push('SUPABASE_URL is required');
  }
  
  if (!config.database.supabaseServiceKey) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY is required');
  }
  
  // Validate AI model settings
  if (!config.aiModels.primary.apiKey) {
    errors.push('AI API key is required (OPENAI_API_KEY or AI_PRIMARY_API_KEY)');
  }
  
  // Validate communication settings
  if (config.communication.websocketPort < 1 || config.communication.websocketPort > 65535) {
    errors.push('Invalid WebSocket port number');
  }
  
  if (config.communication.httpPort < 1 || config.communication.httpPort > 65535) {
    errors.push('Invalid HTTP port number');
  }
  
  // Validate healthcare compliance in production
  if (config.nodeEnv === 'production') {
    if (!config.healthcare.lgpdCompliance) {
      errors.push('LGPD compliance is mandatory in production');
    }
    
    if (!config.healthcare.auditLogging) {
      errors.push('Audit logging is mandatory in production');
    }
    
    if (!config.security.requireAuthentication) {
      errors.push('Authentication is mandatory in production');
    }
    
    if (!config.security.encryptionEnabled) {
      errors.push('Encryption is mandatory in production');
    }
  }
  
  // Validate performance settings
  if (config.performance.responseTimeThreshold < 500) {
    errors.push('Response time threshold too low (minimum 500ms)');
  }
  
  if (config.performance.responseTimeThreshold > 10000) {
    errors.push('Response time threshold too high (maximum 10s)');
  }
  
  if (errors.length > 0) {
    throw new Error(`Agent configuration validation failed:\n${errors.join('\n')}`);
  }
}

/**
 * Get agent configuration for specific environment
 */
export function getAgentConfig(): AgentEnvironmentConfig {
  const config = loadAgentEnvironmentConfig();
  validateAgentEnvironmentConfig(config);
  return config;
}

/**
 * Create environment variables template for agent setup
 */
export function generateEnvironmentTemplate(): string {
  return `# NeonPro Healthcare Agent Configuration
# Copy this file to .env and configure the values

# Agent Identification
AGENT_ID=neonpro-healthcare-agent
AGENT_NAME="NeonPro Healthcare AI Agent"
AGENT_VERSION=1.0.0

# Environment
NODE_ENV=development
LOG_LEVEL=info

# Database Configuration (Required)
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_QUERY_TIMEOUT=30000

# AI Model Configuration (Required)
AI_PRIMARY_PROVIDER=openai
AI_PRIMARY_MODEL=gpt-4
OPENAI_API_KEY=your_openai_api_key_here
AI_MAX_TOKENS=2000
AI_TEMPERATURE=0.3

# Fallback AI Model (Optional)
AI_FALLBACK_PROVIDER=anthropic
AI_FALLBACK_MODEL=claude-3-sonnet-20240229
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Communication Settings
AGENT_WS_PORT=8080
AGENT_HTTP_PORT=8081
AGENT_ALLOWED_ORIGINS=https://neonpro.com.br,https://www.neonpro.com.br,https://neonpro.vercel.app
AGENT_CORS_ENABLED=true

# Healthcare Compliance
HEALTHCARE_LGPD_COMPLIANCE=true
HEALTHCARE_ANVISA_COMPLIANCE=true
HEALTHCARE_CFM_COMPLIANCE=true
HEALTHCARE_AUDIT_LOGGING=true
HEALTHCARE_DATA_CLASSIFICATION=healthcare_sensitive

# Security Settings
AGENT_REQUIRE_AUTH=true
AGENT_SESSION_TIMEOUT=1800000
AGENT_ENCRYPTION_ENABLED=true
AGENT_RATE_LIMITING_ENABLED=true
AGENT_MAX_REQUESTS_PER_MINUTE=60

# Performance Settings
AGENT_CACHING_ENABLED=true
AGENT_CACHE_TTL=300000
AGENT_RESPONSE_TIME_THRESHOLD=2000
AGENT_COMPRESSION_ENABLED=true
`;
}