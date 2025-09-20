/**
 * AI Configuration for NeonPro Healthcare Platform
 * 
 * Centralized configuration for AI agent integration with healthcare compliance
 * Supports multiple providers and Brazilian healthcare context
 */

import { z } from 'zod';

// =====================================
// CONFIGURATION SCHEMAS
// =====================================

const AIProviderConfigSchema = z.object({
  apiKey: z.string().optional(),
  baseUrl: z.string().url().optional(),
  model: z.string(),
  maxTokens: z.number().int().min(1).max(32000),
  temperature: z.number().min(0).max(2),
  topP: z.number().min(0).max(1).optional(),
  frequencyPenalty: z.number().min(-2).max(2).optional(),
  presencePenalty: z.number().min(-2).max(2).optional(),
  timeout: z.number().int().min(1000).max(60000).default(30000),
});

const AIHealthcareConfigSchema = z.object({
  contextEnabled: z.boolean().default(true),
  lgpdCompliance: z.boolean().default(true),
  auditEnabled: z.boolean().default(true),
  anonymizationLevel: z.enum(['none', 'basic', 'strict', 'full']).default('strict'),
  dataRetentionDays: z.number().int().min(1).max(365).default(30),
  consentRequired: z.boolean().default(true),
  encryptionEnabled: z.boolean().default(true),
  brazilianContext: z.boolean().default(true),
  portugueseLanguage: z.boolean().default(true),
});

const AISecurityConfigSchema = z.object({
  rateLimiting: z.object({
    enabled: z.boolean().default(true),
    requestsPerMinute: z.number().int().min(1).default(60),
    burstLimit: z.number().int().min(1).default(10),
  }),
  inputValidation: z.object({
    maxLength: z.number().int().min(1).default(10000),
    allowedContentTypes: z.array(z.string()).default(['text/plain', 'application/json']),
    scanForMalicious: z.boolean().default(true),
  }),
  outputFiltering: z.object({
    enabled: z.boolean().default(true),
    blockPersonalInfo: z.boolean().default(true),
    blockMedicalAdvice: z.boolean().default(false), // Allow medical advice in healthcare context
    sanitizeOutput: z.boolean().default(true),
  }),
});

const AIPerformanceConfigSchema = z.object({
  caching: z.object({
    enabled: z.boolean().default(true),
    ttl: z.number().int().min(1).default(300), // 5 minutes
    maxSize: z.number().int().min(1).default(1000),
  }),
  streaming: z.object({
    enabled: z.boolean().default(true),
    chunkSize: z.number().int().min(1).default(1024), // 1KB chunks
    maxStreamTime: z.number().int().min(1000).default(300000), // 5 minutes
  }),
  monitoring: z.object({
    enabled: z.boolean().default(true),
    metricsInterval: z.number().int().min(1000).default(60000), // 1 minute
    alertThresholds: z.object({
      responseTime: z.number().int().min(1000).default(5000), // 5 seconds
      errorRate: z.number().min(0).max(1).default(0.05), // 5%
      timeoutRate: z.number().min(0).max(1).default(0.01), // 1%
    }),
  }),
});

// =====================================
// PROVIDER CONFIGURATIONS
// =====================================

export const AI_PROVIDERS = {
  openai: {
    gpt4: {
      model: 'gpt-4',
      maxTokens: 4000,
      temperature: 0.3,
      timeout: 30000,
      healthcareOptimized: true,
      capabilities: ['chat', 'analysis', 'prediction', 'medical-context'],
    },
    gpt35: {
      model: 'gpt-3.5-turbo',
      maxTokens: 4000,
      temperature: 0.3,
      timeout: 25000,
      healthcareOptimized: true,
      capabilities: ['chat', 'basic-analysis'],
    },
    gpt4o: {
      model: 'gpt-4o',
      maxTokens: 4000,
      temperature: 0.3,
      timeout: 30000,
      healthcareOptimized: true,
      capabilities: ['chat', 'analysis', 'vision', 'medical-context'],
    },
  },
  anthropic: {
    claude3: {
      model: 'claude-3-sonnet-20240229',
      maxTokens: 4000,
      temperature: 0.3,
      timeout: 30000,
      healthcareOptimized: true,
      capabilities: ['chat', 'analysis', 'medical-context', 'long-context'],
    },
    claude3haiku: {
      model: 'claude-3-haiku-20240307',
      maxTokens: 4000,
      temperature: 0.3,
      timeout: 20000,
      healthcareOptimized: true,
      capabilities: ['chat', 'fast-response'],
    },
  },
  google: {
    gemini: {
      model: 'gemini-pro',
      maxTokens: 4000,
      temperature: 0.3,
      timeout: 30000,
      healthcareOptimized: true,
      capabilities: ['chat', 'analysis', 'multimodal'],
    },
  },
  local: {
    default: {
      model: 'local-model',
      maxTokens: 2000,
      temperature: 0.2,
      timeout: 15000,
      healthcareOptimized: false,
      capabilities: ['chat'],
    },
  },
} as const;

// =====================================
// HEALTHCARE CONTEXTS
// =====================================

export const HEALTHCARE_CONTEXTS = {
  client: {
    systemPrompt: `Você é um assistente de IA especializado em atendimento ao paciente no sistema de saúde brasileiro.

**Contexto e Restrições:**
- Sempre responda em português brasileiro claro e empático
- Use terminologia médica brasileira apropriada
- Considere o sistema público de saúde (SUS) e planos de saúde privados
- Siga rigorosamente as regulamentações da ANVISA
- Cumpra as normas do Conselho Federal de Medicina (CFM)
- Mantenha compliance com a Lei Geral de Proteção de Dados (LGPD)

**Áreas de Atuação:**
- Agendamento de consultas e exames
- Orientações sobre preparação para procedimentos
- Explicação sobre condições médicas de forma acessível
- Acompanhamento pós-consulta
- Suporte para adesão ao tratamento
- Orientações sobre medicamentos e efeitos colaterais

**Limitações Importantes:**
- NUNCA substitua uma consulta médica presencial
- NUNCA forneça diagnóstico definitivo
- SEMPRE recomende procurar um profissional de saúde para questões específicas
- NUNCA prescreva medicamentos ou altere tratamentos existentes
- NUNCA ignore sintomas graves ou emergências médicas

**Tom e Estilo:**
- Calmo e tranquilizador
- Profissional porém acessível
- Informativo sem ser alarmista
- Respeitoso com a inteligência do paciente
- Culturalmente apropriado para o contexto brasileiro`,

    capabilities: [
      'agendamento',
      'triagem',
      'orientações',
      'acompanhamento',
      'educação',
    ],
    complianceLevel: 'strict',
  },

  financial: {
    systemPrompt: `Você é um assistente financeiro especializado em gestão de clínicas médicas e odontológicas no Brasil.

**Contexto e Responsabilidades:**
- Sempre responda em português brasileiro
- Domine a tabela de procedimentos médicos da AMB
- Conheça as regras fiscais brasileiras para serviços de saúde
- Entenda a regulamentação da ANS para planos de saúde
- Mantenha transparência total com os pacientes

**Áreas de Atuação:**
- Cotação de procedimentos e tratamentos
- Explicação sobre formas de pagamento
- Informações sobre cobertura de planos de saúde
- Políticas de cancelamento e reembolso
- Gestão de inadimplência com ética
- Relatórios financeiros para pacientes

**Compliance Financeiro:**
- Siga rigorosamente o Código de Defesa do Consumidor
- Mantenha transparência em todos os valores e taxas
- Respeite as regras do CFM para cobrança médica
- Cumpra a LGPD no tratamento de dados financeiros
- Forneça recibos e comprovantes detalhados

**Ética Profissional:**
- NUNCA pressione pacientes para procedimentos desnecessários
- SEMPRE ofereça opções adequadas ao perfil financeiro
- NUNCA discrimine pacientes por condição financeira
- SEMPRE explique claramente o que está incluso em cada valor
- Mantenha discrição e confidencialidade financeira`,

    capabilities: [
      'faturamento',
      'cobrança',
      'relatórios',
      'planejamento',
      'compliance',
    ],
    complianceLevel: 'strict',
  },

  appointment: {
    systemPrompt: `Você é um assistente de agendamento especializado em clínicas médicas brasileiras, focado em otimizar a experiência do paciente.

**Contexto Cultural Brasileiro:**
- Entenda e respeite a cultura brasileira de pontualidade flexível
- Considere os horários comerciais típicos do Brasil
- Esteja ciente dos feriados nacionais e regionais
- Conheça os padrões de transporte urbano brasileiros
- Adapte-se às preferências de comunicação local

**Funcionalidades Principais:**
- Agendamento eficiente de consultas e exames
- Confirmação inteligente de compromissos
- Gestão de listas de espera
- Otimização da agenda médica
- Lembretes personalizados via WhatsApp/SMS
- Gerenciamento de remarcações e cancelamentos

**Comunicação Eficaz:**
- Use linguagem clara e amigável
- Seja proativo em evitar no-shows
- Ofereça alternativas quando horários não estiverem disponíveis
- Confirme informações importantes por múltiplos canais
- Mantenha tom profissional porém acolhedor

**Otimização da Agenda:**
- Considere tempo de deslocamento dos pacientes
- Agrupe procedimentos do mesmo paciente quando possível
- Deixe tempo adequado entre consultas
- Antecipe possíveis atrasos e emergências
- Mantenha flexibilidade para casos urgentes

**Experiência do Paciente:**
- Reduza o tempo de espera no agendamento
- Ofereça lembretes inteligentes
- Forneça informações claras sobre preparação
- Facilite remarcações quando necessário
- Colete feedback para melhorar continuamente`,

    capabilities: [
      'agendamento',
      'confirmação',
      'otimização',
      'comunicação',
      'lembretes',
    ],
    complianceLevel: 'standard',
  },
} as const;

// =====================================
// DEFAULT CONFIGURATION
// =====================================

export const DEFAULT_AI_CONFIG = {
  // Provider settings
  defaultProvider: 'openai' as const,
  defaultModel: 'gpt4' as const,
  
  // Core settings
  streaming: true,
  maxResponseLength: 4000,
  temperature: 0.3,
  
  // Healthcare compliance
  healthcare: {
    contextEnabled: true,
    lgpdCompliance: true,
    auditEnabled: true,
    anonymizationLevel: 'strict' as const,
    dataRetentionDays: 30,
    consentRequired: true,
    encryptionEnabled: true,
    brazilianContext: true,
    portugueseLanguage: true,
  },
  
  // Security settings
  security: {
    rateLimiting: {
      enabled: true,
      requestsPerMinute: 60,
      burstLimit: 10,
    },
    inputValidation: {
      maxLength: 10000,
      allowedContentTypes: ['text/plain', 'application/json'],
      scanForMalicious: true,
    },
    outputFiltering: {
      enabled: true,
      blockPersonalInfo: true,
      blockMedicalAdvice: false,
      sanitizeOutput: true,
    },
  },
  
  // Performance optimization
  performance: {
    caching: {
      enabled: true,
      ttl: 300, // 5 minutes
      maxSize: 1000,
    },
    streaming: {
      enabled: true,
      chunkSize: 1024,
      maxStreamTime: 300000, // 5 minutes
    },
    monitoring: {
      enabled: true,
      metricsInterval: 60000, // 1 minute
      alertThresholds: {
        responseTime: 5000, // 5 seconds
        errorRate: 0.05, // 5%
        timeoutRate: 0.01, // 1%
      },
    },
  },
  
  // Feature flags
  features: {
    enableVoiceInput: false,
    enableFileAttachments: false,
    enableMultilingual: false,
    enableAnalytics: true,
    enableFeedback: true,
    enableKnowledgeBase: true,
    enableRAG: true,
  },
  
  // UI/UX settings
  ui: {
    showThinkingIndicator: true,
    showTypingIndicator: true,
    showProviderInfo: true,
    showConfidenceScore: true,
    showSources: true,
    maxMessageHistory: 100,
    autoScroll: true,
    mobileOptimized: true,
  },
} as const;

// =====================================
// ENVIRONMENT CONFIGURATION
// =====================================

export function getAIConfig() {
  return {
    // Environment-specific settings
    environment: process.env.NODE_ENV || 'development',
    
    // API keys and endpoints
    providers: {
      openai: {
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        baseUrl: process.env.NEXT_PUBLIC_OPENAI_BASE_URL,
      },
      anthropic: {
        apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
      },
      google: {
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY,
      },
      local: {
        baseUrl: process.env.NEXT_PUBLIC_LOCAL_AI_ENDPOINT || 'http://localhost:8000/v1',
      },
    },
    
    // Feature flags from environment
    features: {
      ...DEFAULT_AI_CONFIG.features,
      enableVoiceInput: process.env.NEXT_PUBLIC_ENABLE_VOICE_INPUT === 'true',
      enableFileAttachments: process.env.NEXT_PUBLIC_ENABLE_ATTACHMENTS === 'true',
      enableMultilingual: process.env.NEXT_PUBLIC_ENABLE_MULTILINGUAL === 'true',
    },
    
    // Compliance settings
    compliance: {
      lgpdEnabled: process.env.NEXT_PUBLIC_LGPD_ENABLED !== 'false',
      auditEnabled: process.env.NEXT_PUBLIC_AUDIT_ENABLED !== 'false',
      encryptionEnabled: process.env.NEXT_PUBLIC_ENCRYPTION_ENABLED !== 'false',
    },
    
    // Performance settings
    performance: {
      ...DEFAULT_AI_CONFIG.performance,
      caching: {
        ...DEFAULT_AI_CONFIG.performance.caching,
        enabled: process.env.NEXT_PUBLIC_ENABLE_CACHING !== 'false',
      },
    },
  };
}

// =====================================
// VALIDATION HELPERS
// =====================================

export function validateAIConfig(config: unknown) {
  try {
    const fullConfig = {
      healthcare: AIHealthcareConfigSchema.parse(config),
      security: AISecurityConfigSchema.parse(config),
      performance: AIPerformanceConfigSchema.parse(config),
    };
    
    return { valid: true, config: fullConfig };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors,
        message: 'Invalid AI configuration',
      };
    }
    
    return {
      valid: false,
      message: 'Unknown configuration validation error',
    };
  }
}

// =====================================
// PROVIDER SELECTION HELPER
// =====================================

export function selectOptimalProvider(
  agentType: keyof typeof HEALTHCARE_CONTEXTS,
  complexity: 'low' | 'medium' | 'high' = 'medium',
  availableProviders: string[] = ['openai', 'anthropic', 'google']
): { provider: string; model: string; reason: string } {
  const context = HEALTHCARE_CONTEXTS[agentType];
  
  // Priority mapping based on agent type and requirements
  const providerPriority = {
    client: {
      high: ['anthropic', 'openai', 'google'], // Claude for long context, GPT-4 for medical
      medium: ['openai', 'anthropic', 'google'],
      low: ['openai', 'anthropic'],
    },
    financial: {
      high: ['anthropic', 'openai', 'google'], // Claude for analytical tasks
      medium: ['openai', 'anthropic'],
      low: ['openai'],
    },
    appointment: {
      high: ['openai', 'anthropic', 'google'],
      medium: ['openai', 'anthropic'],
      low: ['openai'],
    },
  };

  const priorities = providerPriority[agentType]?.[complexity] || providerPriority.client.medium;
  
  // Find first available provider
  for (const provider of priorities) {
    if (availableProviders.includes(provider)) {
      const models = Object.keys(AI_PROVIDERS[provider as keyof typeof AI_PROVIDERS]);
      const recommendedModel = models[0]; // Use first available model
      
      return {
        provider,
        model: recommendedModel,
        reason: `Optimal provider for ${agentType} agent with ${complexity} complexity`,
      };
    }
  }
  
  // Fallback to default
  return {
    provider: 'openai',
    model: 'gpt4',
    reason: 'Default provider selection',
  };
}

// =====================================
// EXPORT CONFIGURATION
// =====================================

export {
  AIProviderConfigSchema,
  AIHealthcareConfigSchema,
  AISecurityConfigSchema,
  AIPerformanceConfigSchema,
  AI_PROVIDERS,
  HEALTHCARE_CONTEXTS,
  DEFAULT_AI_CONFIG,
};

export type AIProviderConfig = z.infer<typeof AIProviderConfigSchema>;
export type AIHealthcareConfig = z.infer<typeof AIHealthcareConfigSchema>;
export type AISecurityConfig = z.infer<typeof AISecurityConfigSchema>;
export type AIPerformanceConfig = z.infer<typeof AIPerformanceConfigSchema>;
export type AIConfig = ReturnType<typeof getAIConfig>;