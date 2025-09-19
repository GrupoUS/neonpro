/**
 * AI Optimization Data Model for Healthcare Platform
 * 
 * This module provides comprehensive data structures for AI optimization,
 * semantic caching, cost tracking, and healthcare AI compliance.
 * 
 * @package neonpro/shared
 */

import { z } from 'zod';

// =============================================================================
// Base Types and Enums
// =============================================================================

/**
 * AI Provider Enumeration
 * Defines supported AI providers with their specific configurations
 */
export const AIProviderSchema = z.enum([
  'openai',
  'anthropic',
  'cohere',
  'google',
  'azure-openai',
  'aws-bedrock',
  'local-model',
]);

export type AIProvider = z.infer<typeof AIProviderSchema>;

/**
 * AI Model Categories for Healthcare Applications
 */
export const AIModelCategorySchema = z.enum([
  'diagnostic',
  'treatment-recommendation',
  'patient-communication',
  'medical-imaging',
  'clinical-notes',
  'administrative',
  'research',
  'telemedicine',
]);

export type AIModelCategory = z.infer<typeof AIModelCategorySchema>;

/**
 * Semantic Cache Strategy Types
 */
export const CacheStrategySchema = z.enum([
  'semantic-similarity',
  'exact-match',
  'fuzzy-match',
  'context-aware',
  'hybrid',
]);

export type CacheStrategy = z.infer<typeof CacheStrategySchema>;

/**
 * Cost Tracking Dimensions
 */
export const CostDimensionSchema = z.enum([
  'tokens-input',
  'tokens-output',
  'api-calls',
  'compute-time',
  'storage',
  'bandwidth',
]);

export type CostDimension = z.infer<typeof CostDimensionSchema>;

/**
 * Healthcare AI Compliance Levels
 */
export const ComplianceLevelSchema = z.enum([
  'hipaa',
  'gdpr',
  'lgpd',
  'anvisa',
  'cfm',
  'hl7-fhir',
  'dicom',
]);

export type ComplianceLevel = z.infer<typeof ComplianceLevelSchema>;

// =============================================================================
// Core AI Optimization Interfaces
// =============================================================================

/**
 * AI Provider Configuration
 * Defines configuration for each AI provider
 */
export const AIProviderConfigSchema = z.object({
  id: z.string(),
  provider: AIProviderSchema,
  model: z.string(),
  baseUrl: z.string().url().optional(),
  apiKey: z.string().optional(),
  maxTokens: z.number().int().positive().default(4096),
  temperature: z.number().min(0).max(2).default(0.7),
  topP: z.number().min(0).max(1).default(1),
  frequencyPenalty: z.number().min(-2).max(2).default(0),
  presencePenalty: z.number().min(-2).max(2).default(0),
  timeoutMs: z.number().int().positive().default(30000),
  retryAttempts: z.number().int().min(0).max(5).default(3),
  costPerToken: z.object({
    input: z.number().positive(),
    output: z.number().positive(),
  }),
  categories: z.array(AIModelCategorySchema),
  compliance: z.array(ComplianceLevelSchema),
  enabled: z.boolean().default(true),
  priority: z.number().int().min(1).max(10).default(5),
});

export type AIProviderConfig = z.infer<typeof AIProviderConfigSchema>;

/**
 * Vector Embedding Configuration
 * Defines how text is converted to vector embeddings for semantic search
 */
export const VectorEmbeddingConfigSchema = z.object({
  model: z.string().default('text-embedding-ada-002'),
  dimensions: z.number().int().positive().default(1536),
  provider: AIProviderSchema.default('openai'),
  batchSize: z.number().int().positive().default(100),
  normalization: z.enum(['l2', 'none']).default('l2'),
  cacheStrategy: CacheStrategySchema.default('semantic-similarity'),
  similarityThreshold: z.number().min(0).max(1).default(0.85),
});

export type VectorEmbeddingConfig = z.infer<typeof VectorEmbeddingConfigSchema>;

/**
 * Semantic Cache Entry
 * Represents a cached AI response with semantic search capabilities
 */
export const SemanticCacheEntrySchema = z.object({
  id: z.string(),
  prompt: z.string(),
  response: z.string(),
  embedding: z.array(z.number()).length(1536),
  metadata: z.object({
    provider: AIProviderSchema,
    model: z.string(),
    tokensUsed: z.object({
      input: z.number().int().nonnegative(),
      output: z.number().int().nonnegative(),
    }),
    cost: z.number().positive(),
    responseTimeMs: z.number().int().positive(),
    category: AIModelCategorySchema,
    compliance: z.array(ComplianceLevelSchema),
    patientId: z.string().optional(),
    sessionId: z.string().optional(),
    tags: z.array(z.string()),
  }),
  createdAt: z.date(),
  accessedAt: z.date(),
  accessCount: z.number().int().nonnegative().default(0),
  ttl: z.date().optional(),
  hash: z.string(),
});

export type SemanticCacheEntry = z.infer<typeof SemanticCacheEntrySchema>;

/**
 * Cache Statistics
 * Provides metrics about cache performance and usage
 */
export const CacheStatsSchema = z.object({
  totalEntries: z.number().int().nonnegative(),
  hitCount: z.number().int().nonnegative(),
  missCount: z.number().int().nonnegative(),
  hitRate: z.number().min(0).max(1),
  avgResponseTimeMs: z.number().positive(),
  tokensSaved: z.object({
    input: z.number().int().nonnegative(),
    output: z.number().int().nonnegative(),
  }),
  costSaved: z.number().nonnegative(),
  evictionCount: z.number().int().nonnegative(),
  lastCleanup: z.date(),
});

export type CacheStats = z.infer<typeof CacheStatsSchema>;

/**
 * Cache Configuration
 * Defines how the semantic cache should behave
 */
export const CacheConfigSchema = z.object({
  enabled: z.boolean().default(true),
  maxSize: z.number().int().positive().default(10000),
  ttlMs: z.number().int().positive().default(24 * 60 * 60 * 1000), // 24 hours
  strategy: CacheStrategySchema.default('semantic-similarity'),
  embedding: VectorEmbeddingConfigSchema,
  cleanupIntervalMs: z.number().int().positive().default(60 * 60 * 1000), // 1 hour
  compressionEnabled: z.boolean().default(true),
  persistToDisk: z.boolean().default(false),
  healthCheckIntervalMs: z.number().int().positive().default(5 * 60 * 1000), // 5 minutes
});

export type CacheConfig = z.infer<typeof CacheConfigSchema>;

// =============================================================================
// Cost Tracking and Analytics
// =============================================================================

/**
 * Cost Tracking Entry
 * Individual cost event for analytics
 */
export const CostEntrySchema = z.object({
  id: z.string(),
  timestamp: z.date(),
  provider: AIProviderSchema,
  model: z.string(),
  dimension: CostDimensionSchema,
  quantity: z.number().positive(),
  unitCost: z.number().positive(),
  totalCost: z.number().positive(),
  metadata: z.object({
    sessionId: z.string().optional(),
    patientId: z.string().optional(),
    category: AIModelCategorySchema.optional(),
    apiEndpoint: z.string().optional(),
    success: z.boolean().default(true),
    error: z.string().optional(),
  }),
});

export type CostEntry = z.infer<typeof CostEntrySchema>;

/**
 * Cost Budget Definition
 * Defines spending limits for AI usage
 */
export const CostBudgetSchema = z.object({
  id: z.string(),
  name: z.string(),
  period: z.enum(['hourly', 'daily', 'weekly', 'monthly']),
  limit: z.number().positive(),
  dimensions: z.array(CostDimensionSchema),
  providers: z.array(AIProviderSchema).optional(),
  categories: z.array(AIModelCategorySchema).optional(),
  alerts: z.object({
    enabled: z.boolean().default(true),
    thresholdPercent: z.number().min(0).max(100).default(80),
    notificationChannels: z.array(z.enum(['email', 'slack', 'webhook'])),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CostBudget = z.infer<typeof CostBudgetSchema>;

/**
 * Cost Analytics Summary
 * Aggregated cost data for reporting
 */
export const CostAnalyticsSchema = z.object({
  period: z.object({
    start: z.date(),
    end: z.date(),
  }),
  totalCost: z.number().nonnegative(),
  breakdown: z.object({
    byProvider: z.record(AIProviderSchema, z.number().nonnegative()),
    byCategory: z.record(AIModelCategorySchema, z.number().nonnegative()),
    byDimension: z.record(CostDimensionSchema, z.number().nonnegative()),
  }),
  trends: z.object({
    daily: z.array(z.object({
      date: z.date(),
      cost: z.number().nonnegative(),
    })),
    weeklyAverage: z.number().nonnegative(),
    monthlyProjection: z.number().nonnegative(),
  }),
  efficiency: z.object({
    cacheHitRate: z.number().min(0).max(1),
    avgCostPerRequest: z.number().nonnegative(),
    totalRequests: z.number().int().nonnegative(),
    costSavingsFromCache: z.number().nonnegative(),
  }),
  budgets: z.array(z.object({
    budgetId: z.string(),
    usage: z.number().min(0).max(1),
    overBudget: z.boolean(),
    remaining: z.number(),
  })),
});

export type CostAnalytics = z.infer<typeof CostAnalyticsSchema>;

// =============================================================================
// Healthcare AI Compliance Structures
// =============================================================================

/**
 * Healthcare AI Usage Context
 * Context for AI usage in healthcare scenarios
 */
export const HealthcareAIContextSchema = z.object({
  patientId: z.string().optional(),
  encounterId: z.string().optional(),
  clinicalContext: z.enum([
    'diagnosis',
    'treatment-planning',
    'patient-education',
    'clinical-documentation',
    'medical-imaging',
    'laboratory-results',
    'medication-management',
    'care-coordination',
    'administrative',
  ]),
  urgency: z.enum(['routine', 'urgent', 'emergency']),
  dataSensitivity: z.enum(['low', 'medium', 'high', 'critical']),
  consentPresent: z.boolean().default(true),
  retentionRequired: z.boolean().default(true),
  auditRequired: z.boolean().default(true),
});

export type HealthcareAIContext = z.infer<typeof HealthcareAIContextSchema>;

/**
 * AI Output Validation Result
 * Ensures AI outputs meet healthcare standards
 */
export const AIOutputValidationSchema = z.object({
  id: z.string(),
  timestamp: z.date(),
  provider: AIProviderSchema,
  model: z.string(),
  input: z.string(),
  output: z.string(),
  validationResults: z.object({
    clinicallySound: z.boolean(),
    piiDetected: z.boolean(),
    harmfulContent: z.boolean(),
    accuracyScore: z.number().min(0).max(1),
    completenessScore: z.number().min(0).max(1),
    biasDetected: z.boolean(),
    recommendations: z.array(z.string()),
  }),
  healthcareContext: HealthcareAIContextSchema,
  approved: z.boolean().default(false),
  reviewer: z.string().optional(),
  reviewTimestamp: z.date().optional(),
});

export type AIOutputValidation = z.infer<typeof AIOutputValidationSchema>;

/**
 * Privacy Preserving Techniques
 * Methods for ensuring patient data privacy in AI processing
 */
export const PrivacyTechniqueSchema = z.enum([
  'anonymization',
  'pseudonymization',
  'data-masking',
  'federated-learning',
  'differential-privacy',
  'homomorphic-encryption',
  'secure-multi-party-computation',
]);

export type PrivacyTechnique = z.infer<typeof PrivacyTechniqueSchema>;

/**
 * AI Privacy Configuration
 * Configuration for privacy-preserving AI processing
 */
export const AIPrivacyConfigSchema = z.object({
  enabled: z.boolean().default(true),
  techniques: z.array(PrivacyTechniqueSchema),
  dataRetentionPolicy: z.object({
    anonymizeAfterDays: z.number().int().positive().default(90),
    deleteAfterDays: z.number().int().positive().default(365),
  }),
  accessControls: z.object({
    requireExplicitConsent: z.boolean().default(true),
    roleBasedAccess: z.boolean().default(true),
    auditAllAccess: z.boolean().default(true),
  }),
  compliance: z.array(ComplianceLevelSchema),
  dataMinimization: z.boolean().default(true),
  purposeLimitation: z.boolean().default(true),
});

export type AIPrivacyConfig = z.infer<typeof AIPrivacyConfigSchema>;

// =============================================================================
// Main AI Optimization Interface
// =============================================================================

/**
 * AI Optimization Configuration
 * Main configuration object for the AI optimization system
 */
export const AIOptimizationConfigSchema = z.object({
  providers: z.array(AIProviderConfigSchema),
  cache: CacheConfigSchema,
  privacy: AIPrivacyConfigSchema,
  costTracking: z.object({
    enabled: z.boolean().default(true),
    budgets: z.array(CostBudgetSchema),
    analyticsRetentionDays: z.number().int().positive().default(90),
  }),
  monitoring: z.object({
    enabled: z.boolean().default(true),
    metricsIntervalMs: z.number().int().positive().default(60000), // 1 minute
    healthCheckIntervalMs: z.number().int().positive().default(30000), // 30 seconds
    alertingEnabled: z.boolean().default(true),
  }),
  fallback: z.object({
    enabled: z.boolean().default(true),
    providers: z.array(AIProviderSchema),
    timeoutMs: z.number().int().positive().default(10000),
  }),
  experimental: z.object({
    features: z.array(z.string()),
    enabled: z.boolean().default(false),
  }),
});

export type AIOptimizationConfig = z.infer<typeof AIOptimizationConfigSchema>;

/**
 * AI Optimization Status
 * Current status and health of the AI optimization system
 */
export const AIOptimizationStatusSchema = z.object({
  healthy: z.boolean(),
  providers: z.array(z.object({
    provider: AIProviderSchema,
    healthy: z.boolean(),
    latencyMs: z.number().int().positive(),
    errorRate: z.number().min(0).max(1),
    lastCheck: z.date(),
  })),
  cache: z.object({
    healthy: z.boolean(),
    entries: z.number().int().nonnegative(),
    hitRate: z.number().min(0).max(1),
    lastCleanup: z.date(),
  }),
  cost: z.object({
    currentSpend: z.number().nonnegative(),
    budgetUtilization: z.number().min(0).max(1),
    alertsActive: z.number().int().nonnegative(),
  }),
  uptime: z.object({
    start: z.date(),
    incidents: z.number().int().nonnegative(),
    lastIncident: z.date().optional(),
  }),
  version: z.string(),
});

export type AIOptimizationStatus = z.infer<typeof AIOptimizationStatusSchema>;

// =============================================================================
// Utility Functions and Validators
// =============================================================================

/**
 * Validate AI Provider Configuration
 */
export function validateAIProviderConfig(config: unknown): AIProviderConfig {
  return AIProviderConfigSchema.parse(config);
}

/**
 * Validate Semantic Cache Entry
 */
export function validateSemanticCacheEntry(entry: unknown): SemanticCacheEntry {
  return SemanticCacheEntrySchema.parse(entry);
}

/**
 * Validate Cost Entry
 */
export function validateCostEntry(entry: unknown): CostEntry {
  return CostEntrySchema.parse(entry);
}

/**
 * Validate Healthcare AI Context
 */
export function validateHealthcareAIContext(context: unknown): HealthcareAIContext {
  return HealthcareAIContextSchema.parse(context);
}

/**
 * Validate AI Optimization Configuration
 */
export function validateAIOptimizationConfig(config: unknown): AIOptimizationConfig {
  return AIOptimizationConfigSchema.parse(config);
}

/**
 * Calculate cache hit rate
 */
export function calculateHitRate(hits: number, misses: number): number {
  const total = hits + misses;
  return total > 0 ? hits / total : 0;
}

/**
 * Calculate cost efficiency
 */
export function calculateCostEfficiency(
  totalCost: number,
  totalRequests: number,
  cacheSavings: number
): number {
  const effectiveCost = totalCost - cacheSavings;
  return totalRequests > 0 ? effectiveCost / totalRequests : 0;
}

/**
 * Check if provider is configured for healthcare
 */
export function isHealthcareProvider(
  provider: AIProviderConfig,
  category: AIModelCategory
): boolean {
  return provider.categories.includes(category) &&
         provider.compliance.includes('lgpd') &&
         provider.compliance.includes('anvisa');
}

/**
 * Generate cache key for semantic search
 */
export function generateCacheKey(
  prompt: string,
  provider: AIProvider,
  model: string,
  context?: HealthcareAIContext
): string {
  const base = `${provider}:${model}:${prompt}`;
  const contextStr = context ? `:${context.clinicalContext}:${context.urgency}` : '';
  return Buffer.from(base + contextStr).toString('base64');
}

// =============================================================================
// Default Configurations
// =============================================================================

/**
 * Default AI Provider Configurations
 */
export const DEFAULT_AI_PROVIDERS: AIProviderConfig[] = [
  {
    id: 'openai-gpt-4',
    provider: 'openai',
    model: 'gpt-4',
    baseUrl: 'https://api.openai.com/v1',
    maxTokens: 8192,
    temperature: 0.7,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    timeoutMs: 30000,
    retryAttempts: 3,
    enabled: true,
    costPerToken: { input: 0.00003, output: 0.00006 },
    categories: ['diagnostic', 'treatment-recommendation', 'clinical-notes'],
    compliance: ['lgpd', 'anvisa'],
    priority: 8,
  },
  {
    id: 'anthropic-claude-3',
    provider: 'anthropic',
    model: 'claude-3-sonnet-20240229',
    maxTokens: 4096,
    temperature: 0.7,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    timeoutMs: 30000,
    retryAttempts: 3,
    enabled: true,
    costPerToken: { input: 0.000015, output: 0.000075 },
    categories: ['patient-communication', 'medical-imaging', 'telemedicine'],
    compliance: ['lgpd', 'anvisa', 'hipaa'],
    priority: 9,
  },
  {
    id: 'local-medical-model',
    provider: 'local-model',
    model: 'medical-assistant-v1',
    maxTokens: 2048,
    temperature: 0.5,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    timeoutMs: 30000,
    retryAttempts: 3,
    enabled: true,
    costPerToken: { input: 0.000001, output: 0.000001 },
    categories: ['administrative', 'research'],
    compliance: ['lgpd', 'anvisa'],
    priority: 5,
  },
];

/**
 * Default Cache Configuration
 */
export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  enabled: true,
  maxSize: 10000,
  ttlMs: 24 * 60 * 60 * 1000,
  strategy: 'semantic-similarity',
  embedding: {
    model: 'text-embedding-ada-002',
    dimensions: 1536,
    provider: 'openai',
    batchSize: 100,
    normalization: 'l2',
    cacheStrategy: 'semantic-similarity',
    similarityThreshold: 0.85,
  },
  cleanupIntervalMs: 60 * 60 * 1000,
  compressionEnabled: true,
  persistToDisk: false,
  healthCheckIntervalMs: 5 * 60 * 1000,
};

/**
 * Default Privacy Configuration
 */
export const DEFAULT_PRIVACY_CONFIG: AIPrivacyConfig = {
  enabled: true,
  techniques: ['anonymization', 'pseudonymization', 'data-masking'],
  dataRetentionPolicy: {
    anonymizeAfterDays: 90,
    deleteAfterDays: 365,
  },
  accessControls: {
    requireExplicitConsent: true,
    roleBasedAccess: true,
    auditAllAccess: true,
  },
  compliance: ['lgpd', 'anvisa', 'cfm'],
  dataMinimization: true,
  purposeLimitation: true,
};

/**
 * Default AI Optimization Configuration
 */
export const DEFAULT_AI_OPTIMIZATION_CONFIG: AIOptimizationConfig = {
  providers: DEFAULT_AI_PROVIDERS,
  cache: DEFAULT_CACHE_CONFIG,
  privacy: DEFAULT_PRIVACY_CONFIG,
  costTracking: {
    enabled: true,
    budgets: [],
    analyticsRetentionDays: 90,
  },
  monitoring: {
    enabled: true,
    metricsIntervalMs: 60000,
    healthCheckIntervalMs: 30000,
    alertingEnabled: true,
  },
  fallback: {
    enabled: true,
    providers: ['openai', 'anthropic'],
    timeoutMs: 10000,
  },
  experimental: {
    features: [],
    enabled: false,
  },
};

// =============================================================================
// All types are already exported inline above - no duplicate exports needed