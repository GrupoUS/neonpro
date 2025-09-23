import fs from 'fs';
import path from 'path';

export interface AgentConfig {
  // Basic Configuration
  name: string;
  version: string;
  description: string;
  environment: 'development' | 'staging' | 'production';

  // Server Configuration
  host: string;
  port: number;
  protocol: 'ws' | 'wss';
  path?: string;

  // Database Configuration
  database: {
    type: 'supabase' | 'postgresql' | 'mysql';
    connectionString: string;
    poolSize: number;
    connectionTimeout: number;
    queryTimeout: number;
  };

  // AI/LLM Configuration
  ai: {
    provider: 'openai' | 'anthropic' | 'local';
    model: string;
    apiKey?: string;
    baseUrl?: string;
    maxTokens: number;
    temperature: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
  };

  // RAG Configuration
  rag: {
    enabled: boolean;
    vectorStore: {
      type: 'supabase' | 'pinecone' | 'chroma' | 'local';
      connectionString?: string;
      tableName?: string;
      dimension: number;
    };
    documentStore: {
      type: 'supabase' | 'local' | 's3';
      connectionString?: string;
      bucket?: string;
      path: string;
    };
    chunkSize: number;
    chunkOverlap: number;
    topK: number;
    scoreThreshold: number;
  };

  // AG-UI Protocol Configuration
  agui: {
    version: string;
    enabled: boolean;
    compression: boolean;
    heartbeatInterval: number;
    connectionTimeout: number;
    maxMessageSize: number;
    maxConnections: number;
  };

  // Healthcare Specific Configuration
  healthcare: {
    enabled: boolean;
    complianceStandards: ('lgpd' | 'hipaa' | 'gdpr')[];
    dataRetention: {
      conversationHistoryDays: number;
      auditLogDays: number;
      sessionDataDays: number;
    };
    piiDetection: {
      enabled: boolean;
      strictMode: boolean;
      customPatterns: string[];
    };
    emergency: {
      enabled: boolean;
      escalationTimeout: number;
      contactMethods: ('email' | 'sms' | 'webhook')[];
    };
  };

  // Security Configuration
  security: {
    enableAuthentication: boolean;
    enableAuthorization: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    rateLimiting: {
      enabled: boolean;
      maxRequests: number;
      windowMs: number;
    };
    encryption: {
      enabled: boolean;
      algorithm: string;
      keyRotationDays: number;
    };
  };

  // Logging Configuration
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'json' | 'text';
    enableConsole: boolean;
    enableFile: boolean;
    filePath?: string;
    maxSize: string;
    maxFiles: number;
    enableAudit: boolean;
  };

  // Monitoring Configuration
  monitoring: {
    enabled: boolean;
    metrics: {
      enabled: boolean;
      port: number;
      path: string;
    };
    health: {
      enabled: boolean;
      path: string;
      interval: number;
    };
    tracing: {
      enabled: boolean;
      sampleRate: number;
      exporter: string;
    };
  };

  // Development Configuration
  development: {
    enableHotReload: boolean;
    enableDebugTools: boolean;
    mockAI: boolean;
    mockDatabase: boolean;
    testMode: boolean;
  };
}

export class AgentConfigManager {
  private static instance: AgentConfigManager;
  private config: AgentConfig | null = null;
  private configPath: string;

  private constructor(configPath?: string) {
    this.configPath = configPath || path.join(process.cwd(), 'agent-config.json');
  }

  public static getInstance(configPath?: string): AgentConfigManager {
    if (!AgentConfigManager.instance) {
      AgentConfigManager.instance = new AgentConfigManager(configPath);
    }
    return AgentConfigManager.instance;
  }

  public loadConfig(): AgentConfig {
    try {
      if (fs.existsSync(this.configPath)) {
        const configData = fs.readFileSync(this.configPath, 'utf8');
        this.config = JSON.parse(configData);
      } else {
        this.config = this.createDefaultConfig();
        this.saveConfig();
      }

      this.validateConfig(this.config);
      this.applyEnvironmentOverrides(this.config);

      return this.config;
    } catch (error) {
      throw new Error(
        `Failed to load agent configuration: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  private createDefaultConfig(): AgentConfig {
    return {
      name: 'NeonPro AI Agent',
      version: '1.0.0',
      description: 'AI-powered healthcare assistant for NeonPro platform',
      environment: (process.env.NODE_ENV as 'development' | 'staging' | 'production')
        || 'development',

      host: process.env.HOST || 'localhost',
      port: parseInt(process.env.PORT || '8080'),
      protocol: process.env.PROTOCOL === 'wss' ? 'wss' : 'ws',

      database: {
        type: 'supabase',
        connectionString: process.env.SUPABASE_URL || '',
        poolSize: parseInt(process.env.DB_POOL_SIZE || '10'),
        connectionTimeout: parseInt(
          process.env.DB_CONNECTION_TIMEOUT || '30000',
        ),
        queryTimeout: parseInt(process.env.DB_QUERY_TIMEOUT || '30000'),
      },

      ai: {
        provider: 'openai',
        model: process.env.OPENAI_MODEL || 'gpt-4',
        apiKey: process.env.OPENAI_API_KEY,
        maxTokens: parseInt(process.env.AI_MAX_TOKENS || '2000'),
        temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
        topP: parseFloat(process.env.AI_TOP_P || '1.0'),
        frequencyPenalty: parseFloat(process.env.AI_FREQUENCY_PENALTY || '0'),
        presencePenalty: parseFloat(process.env.AI_PRESENCE_PENALTY || '0'),
      },

      rag: {
        enabled: true,
        vectorStore: {
          type: 'supabase',
          connectionString: process.env.SUPABASE_URL,
          tableName: 'document_embeddings',
          dimension: parseInt(process.env.VECTOR_DIMENSION || '1536'),
        },
        documentStore: {
          type: 'supabase',
          connectionString: process.env.SUPABASE_URL,
          bucket: 'documents',
          path: 'healthcare-docs',
        },
        chunkSize: parseInt(process.env.RAG_CHUNK_SIZE || '1000'),
        chunkOverlap: parseInt(process.env.RAG_CHUNK_OVERLAP || '200'),
        topK: parseInt(process.env.RAG_TOP_K || '5'),
        scoreThreshold: parseFloat(process.env.RAG_SCORE_THRESHOLD || '0.7'),
      },

      agui: {
        version: '1.0.0',
        enabled: true,
        compression: true,
        heartbeatInterval: parseInt(
          process.env.AGUI_HEARTBEAT_INTERVAL || '30000',
        ),
        connectionTimeout: parseInt(
          process.env.AGUI_CONNECTION_TIMEOUT || '10000',
        ),
        maxMessageSize: parseInt(
          process.env.AGUI_MAX_MESSAGE_SIZE || '1048576',
        ), // 1MB
        maxConnections: parseInt(process.env.AGUI_MAX_CONNECTIONS || '100'),
      },

      healthcare: {
        enabled: true,
        complianceStandards: ['lgpd'],
        dataRetention: {
          conversationHistoryDays: parseInt(
            process.env.CONVERSATION_RETENTION_DAYS || '365',
          ),
          auditLogDays: parseInt(
            process.env.AUDIT_LOG_RETENTION_DAYS || '1825',
          ), // 5 years
          sessionDataDays: parseInt(process.env.SESSION_RETENTION_DAYS || '30'),
        },
        piiDetection: {
          enabled: true,
          strictMode: true,
          customPatterns: [
            '\\b\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}\\b', // Brazilian CPF
            '\\b\\d{2}\\.\\d{3}\\.\\d{3}\\/\\d{4}-\\d{2}\\b', // Brazilian CNPJ
            '\\b\\d{11}\\b', // Brazilian phone numbers
            '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b', // Email
          ],
        },
        emergency: {
          enabled: true,
          escalationTimeout: parseInt(
            process.env.EMERGENCY_ESCALATION_TIMEOUT || '300000',
          ), // 5 minutes
          contactMethods: ['email', 'webhook'],
        },
      },

      security: {
        enableAuthentication: true,
        enableAuthorization: true,
        sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '3600000'), // 1 hour
        maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
        rateLimiting: {
          enabled: true,
          maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
          windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute
        },
        encryption: {
          enabled: true,
          algorithm: 'aes-256-gcm',
          keyRotationDays: parseInt(
            process.env.ENCRYPTION_KEY_ROTATION_DAYS || '90',
          ),
        },
      },

      logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: 'json',
        enableConsole: true,
        enableFile: true,
        filePath: process.env.LOG_FILE_PATH || 'logs/agent.log',
        maxSize: process.env.LOG_MAX_SIZE || '10MB',
        maxFiles: parseInt(process.env.LOG_MAX_FILES || '5'),
        enableAudit: true,
      },

      monitoring: {
        enabled: true,
        metrics: {
          enabled: true,
          port: parseInt(process.env.METRICS_PORT || '9090'),
          path: '/metrics',
        },
        health: {
          enabled: true,
          path: '/health',
          interval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000'),
        },
        tracing: {
          enabled: true,
          sampleRate: parseFloat(process.env.TRACING_SAMPLE_RATE || '0.1'),
          exporter: process.env.TRACING_EXPORTER || 'jaeger',
        },
      },

      development: {
        enableHotReload: process.env.ENABLE_HOT_RELOAD === 'true',
        enableDebugTools: process.env.ENABLE_DEBUG_TOOLS === 'true',
        mockAI: process.env.MOCK_AI === 'true',
        mockDatabase: process.env.MOCK_DATABASE === 'true',
        testMode: process.env.TEST_MODE === 'true',
      },
    };
  }

  private validateConfig(config: AgentConfig): void {
    const errors: string[] = [];

    // Validate required fields
    if (!config.name) errors.push('Agent name is required');
    if (!config.version) errors.push('Agent version is required');
    if (!config.host) errors.push('Host is required');
    if (!config.port || config.port <= 0) errors.push('Valid port is required');
    if (!config.database.connectionString) {
      errors.push('Database connection string is required');
    }
    if (!config.ai.model) errors.push('AI model is required');
    if (config.ai.provider === 'openai' && !config.ai.apiKey) {
      errors.push('OpenAI API key is required');
    }

    // Validate ranges
    if (config.ai.maxTokens <= 0) errors.push('AI max tokens must be positive');
    if (config.ai.temperature < 0 || config.ai.temperature > 2) {
      errors.push('AI temperature must be between 0 and 2');
    }
    if (config.rag.chunkSize <= 0) {
      errors.push('RAG chunk size must be positive');
    }
    if (config.agui.heartbeatInterval <= 0) {
      errors.push('AGUI heartbeat interval must be positive');
    }
    if (config.security.sessionTimeout <= 0) {
      errors.push('Session timeout must be positive');
    }

    if (errors.length > 0) {
      throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
    }
  }

  private applyEnvironmentOverrides(config: AgentConfig): void {
    // Override specific config values with environment variables
    if (process.env.AGENT_NAME) config.name = process.env.AGENT_NAME;
    if (process.env.AGENT_VERSION) config.version = process.env.AGENT_VERSION;
    if (process.env.AGENT_DESCRIPTION) {
      config.description = process.env.AGENT_DESCRIPTION;
    }
    if (process.env.AGENT_ENVIRONMENT) {
      config.environment = process.env.AGENT_ENVIRONMENT as
        | 'development'
        | 'staging'
        | 'production';
    }
  }

  public saveConfig(): void {
    try {
      if (!this.config) {
        throw new Error('No configuration to save');
      }

      const configDir = path.dirname(this.configPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      throw new Error(
        `Failed to save agent configuration: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  public getConfig(): AgentConfig {
    if (!this.config) {
      return this.loadConfig();
    }
    return this.config;
  }

  public updateConfig(updates: Partial<AgentConfig>): void {
    if (!this.config) {
      this.loadConfig();
    }

    this.config = { ...this.config, ...updates };
    this.validateConfig(this.config);
    this.saveConfig();
  }

  public getDatabaseConfig() {
    const config = this.getConfig();
    return {
      type: config.database.type,
      connectionString: config.database.connectionString,
      pool: {
        min: 2,
        max: config.database.poolSize,
      },
      acquireConnectionTimeout: config.database.connectionTimeout,
      queryTimeout: config.database.queryTimeout,
    };
  }

  public getAIConfig() {
    const config = this.getConfig();
    return {
      provider: config.ai.provider,
      model: config.ai.model,
      apiKey: config.ai.apiKey,
      baseUrl: config.ai.baseUrl,
      maxTokens: config.ai.maxTokens,
      temperature: config.ai.temperature,
      topP: config.ai.topP,
      frequencyPenalty: config.ai.frequencyPenalty,
      presencePenalty: config.ai.presencePenalty,
    };
  }

  public getRAGConfig() {
    const config = this.getConfig();
    return {
      enabled: config.rag.enabled,
      vectorStore: config.rag.vectorStore,
      documentStore: config.rag.documentStore,
      chunkSize: config.rag.chunkSize,
      chunkOverlap: config.rag.chunkOverlap,
      topK: config.rag.topK,
      scoreThreshold: config.rag.scoreThreshold,
    };
  }

  public getAGUIConfig() {
    const config = this.getConfig();
    return {
      version: config.agui.version,
      enabled: config.agui.enabled,
      compression: config.agui.compression,
      heartbeatInterval: config.agui.heartbeatInterval,
      connectionTimeout: config.agui.connectionTimeout,
      maxMessageSize: config.agui.maxMessageSize,
      maxConnections: config.agui.maxConnections,
    };
  }

  public isDevelopment(): boolean {
    const config = this.getConfig();
    return config.environment === 'development' || config.development.testMode;
  }

  public isProduction(): boolean {
    const config = this.getConfig();
    return config.environment === 'production';
  }
}
