// ============================================
// NeonPro AI Enhanced Types
// Task T003: Add types (Plan, UsageCounter, Recommendation, DomainDescriptor)
// ============================================

// Healthcare-compliant metadata types for AI Enhanced
export interface AIEnhancedMetadata {
  processingTime?: number;
  cacheHit?: boolean;
  modelVersion?: string;
  requestSource?: string;
  complianceLevel?: 'standard' | 'enhanced' | 'restricted';
  [key: string]: unknown;
}

// This file defines types that directly match the database schema and models
// It extends the existing enhanced-ai.ts types for specific database entities

// Import common types from enhanced-ai.ts
import type {
  EnhancedAIModel,
  MedicalSpecialty,
  SubscriptionTier,
  CFMComplianceLevel,
  SubscriptionPlan,
  PlanFeatures,
  AIUsageRecord,
  QuotaStatus,
  BillingMetrics,
  AuditTrail,
  EnhancedAIRequest,
  EnhancedAIResponse,
  UserSubscription,
} from "./enhanced-ai";

// Re-export the imported types
export type {
  EnhancedAIModel,
  MedicalSpecialty,
  SubscriptionTier,
  CFMComplianceLevel,
  SubscriptionPlan,
  PlanFeatures,
  AIUsageRecord,
  QuotaStatus,
  BillingMetrics,
  AuditTrail,
  EnhancedAIRequest,
  EnhancedAIResponse,
  UserSubscription,
};

// ================================================
// DATABASE SCHEMA MATCHING TYPES
// ================================================

/**
 * Plan entity matching the plans table
 * Maps to packages/core-services/src/models/plan.ts
 */
export interface Plan {
  readonly id: string;
  readonly planCode: SubscriptionTier;
  readonly planName: string;
  readonly planDescription: string;

  // Healthcare compliance
  readonly cfmComplianceLevel: CFMComplianceLevel;
  readonly anvisaCertified: boolean;
  readonly lgpdEnhancedFeatures: boolean;

  // Usage limits
  readonly monthlyQueryLimit: number; // -1 for unlimited
  readonly dailyRateLimit: number;
  readonly concurrentRequests: number;
  readonly maxTokensPerRequest: number;
  readonly maxClinics: number; // -1 for unlimited

  // Cost management
  readonly costBudgetUsdMonthly: number;
  readonly costPer1kTokens: number;

  // Features JSON
  readonly features: PlanFeatures;

  // Data retention and compliance
  readonly dataRetentionDays: number;
  readonly anonymizationRequired: boolean;
  readonly auditTrailEnhanced: boolean;

  // Plan metadata
  readonly active: boolean;
  readonly sortOrder: number;

  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Plan data structure for creating new plans
 */
export interface PlanData {
  planCode: SubscriptionTier;
  planName: string;
  planDescription: string;
  cfmComplianceLevel?: CFMComplianceLevel;
  anvisaCertified?: boolean;
  lgpdEnhancedFeatures?: boolean;
  monthlyQueryLimit?: number;
  dailyRateLimit?: number;
  concurrentRequests?: number;
  maxTokensPerRequest?: number;
  maxClinics?: number;
  costBudgetUsdMonthly?: number;
  costPer1kTokens?: number;
  features?: Partial<PlanFeatures>;
  dataRetentionDays?: number;
  anonymizationRequired?: boolean;
  auditTrailEnhanced?: boolean;
  active?: boolean;
  sortOrder?: number;
}

/**
 * UsageCounter entity matching the usage_counters table
 * Maps to packages/core-services/src/models/usage-counter.ts
 */
export interface UsageCounter {
  readonly id: string;
  readonly clinicId: string;
  readonly userId: string;
  readonly planCode: SubscriptionTier;

  // Usage metrics
  readonly monthlyQueries: number;
  readonly dailyQueries: number;
  readonly currentCostUsd: number;
  readonly concurrentRequests: number;

  // Lifetime metrics
  readonly totalRequests: number;
  readonly totalCostUsd: number;
  readonly totalTokensUsed: number;
  readonly cacheSavingsUsd: number;

  // Performance metrics
  readonly averageLatencyMs: number;
  readonly cacheHitRate: number; // 0.0 to 1.0
  readonly errorRate: number; // 0.0 to 1.0

  // Time tracking
  readonly periodStart: Date;
  readonly lastActivity: Date;
  readonly lastReset: Date;

  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Usage counter data structure for updates
 */
export interface UsageCounterData {
  clinicId: string;
  userId: string;
  planCode: SubscriptionTier;
  monthlyQueries: number;
  dailyQueries: number;
  currentCostUsd: number;
  concurrentRequests: number;
  totalRequests: number;
  totalCostUsd: number;
  totalTokensUsed: number;
  cacheSavingsUsd: number;
  averageLatencyMs: number;
  cacheHitRate: number;
  errorRate: number;
  periodStart: Date;
  lastActivity: Date;
  lastReset: Date;
}

/**
 * Usage aggregation for analytics
 */
export interface UsageAggregation {
  readonly period: "hour" | "day" | "week" | "month";
  readonly timestamp: Date;
  readonly queries: number;
  readonly costUsd: number;
  readonly tokens: number;
  readonly uniqueUsers: number;
  readonly modelBreakdown: Record<EnhancedAIModel, number>;
  readonly specialtyBreakdown: Record<MedicalSpecialty, number>;
}

/**
 * Recommendation entity matching the recommendations table
 * Maps to packages/core-services/src/models/recommendation.ts
 */
export interface Recommendation {
  readonly id: string;
  readonly clinicId: string;
  readonly userId: string;

  // Recommendation details
  readonly recommendationType: RecommendationType;
  readonly category: RecommendationCategory;
  readonly title: string;
  readonly description: string;

  // Scoring and priority
  readonly confidenceScore: number; // 0.00 to 100.00
  readonly impactScore: number; // 0.00 to 100.00
  readonly priority: RecommendationPriority;

  // Lifecycle
  readonly status: RecommendationStatus;

  // Additional details
  readonly metadata: Record<string, unknown>;
  readonly implementationEffort: ImplementationEffort;
  readonly expectedBenefit: string;
  readonly riskLevel: RiskLevel;
  readonly complianceImpact: ComplianceImpact;
  readonly costImpact: CostImpact;
  readonly timelineEstimate: string;
  readonly prerequisites: string[];

  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Recommendation types
 */
export type RecommendationType =
  | "plan_upgrade"
  | "cost_optimization"
  | "feature_suggestion"
  | "compliance_improvement"
  | "performance_enhancement"
  | "model_optimization";

/**
 * Recommendation categories
 */
export type RecommendationCategory =
  | "plan_optimization"
  | "compliance"
  | "performance"
  | "cost_efficiency"
  | "user_experience"
  | "security";

/**
 * Recommendation priority levels
 */
export type RecommendationPriority = "low" | "medium" | "high" | "critical";

/**
 * Recommendation status
 */
export type RecommendationStatus =
  | "active"
  | "dismissed"
  | "implemented"
  | "expired";

/**
 * Implementation effort levels
 */
export type ImplementationEffort = "low" | "medium" | "high";

/**
 * Risk levels
 */
export type RiskLevel = "low" | "medium" | "high";

/**
 * Compliance impact
 */
export type ComplianceImpact = "positive" | "neutral" | "negative";

/**
 * Cost impact levels
 */
export type CostImpact = "low" | "medium" | "high";

/**
 * Domain Descriptor entity matching the domain_descriptors table
 * Maps healthcare specialties to AI model configurations
 */
export interface DomainDescriptor {
  readonly id: string;
  readonly domainCode: string;
  readonly domainName: string;
  readonly description: string;

  // Healthcare specialty mapping
  readonly healthcareSpecialty: MedicalSpecialty;
  readonly cfmSpecialtyCode: string;
  readonly anvisaCategory: string;

  // AI model configuration
  readonly preferredAiModels: EnhancedAIModel[];
  readonly complianceRequirements: string[];
  readonly dataSensitivityLevel: DataSensitivityLevel;

  // Use case metadata
  readonly typicalUseCases: string[];
  readonly regulatoryFrameworks: string[];
  readonly performanceBenchmarks: PerformanceBenchmarks;
  readonly costOptimizationTips: string[];

  // Status
  readonly active: boolean;
  readonly metadata: Record<string, unknown>;

  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Data sensitivity levels for LGPD compliance
 */
export type DataSensitivityLevel = "low" | "medium" | "high" | "critical";

/**
 * Performance benchmarks for AI models in specific domains
 */
export interface PerformanceBenchmarks {
  readonly accuracyThreshold: number; // 0.0 to 1.0
  readonly responseTimeMs: number;
  readonly confidenceThreshold: number; // 0.0 to 1.0
  readonly costPerRequestUsd?: number;
}

/**
 * AI feature codes for plan features
 */
export type AIFeatureCode =
  | "ai_chat_basic"
  | "ai_chat_advanced"
  | "ai_analytics"
  | "ai_insights"
  | "ai_predictions"
  | "custom_models"
  | "priority_support";

// ================================================
// REQUEST AND RESPONSE TYPES
// ================================================

/**
 * Request types for AI enhanced endpoints
 */
export interface AIAnalyzeRequest {
  readonly query: string;
  readonly specialty?: MedicalSpecialty;
  readonly preferredModel?: EnhancedAIModel;
  readonly context?: Record<string, unknown>;
  readonly userId: string;
  readonly clinicId: string;
}

export interface AICrudRequest {
  readonly operation: "create" | "read" | "update" | "delete";
  readonly intent: string;
  readonly entity?: string;
  readonly data?: Record<string, unknown>;
  readonly userId: string;
  readonly clinicId: string;
}

export interface AIUsageRequest {
  readonly userId?: string;
  readonly clinicId?: string;
  readonly startDate?: Date;
  readonly endDate?: Date;
  readonly aggregation?: "hour" | "day" | "week" | "month";
}

export interface AIRecommendationsRequest {
  readonly userId: string;
  readonly clinicId: string;
  readonly category?: RecommendationCategory;
  readonly status?: RecommendationStatus;
  readonly priority?: RecommendationPriority;
}

/**
 * Response types for AI enhanced endpoints
 */
export interface AIAnalyzeResponse {
  readonly success: boolean;
  readonly analysis: string;
  readonly confidence: number;
  readonly model: EnhancedAIModel;
  readonly tokensUsed: number;
  readonly latencyMs: number;
  readonly metadata?: AIEnhancedMetadata;
}

export interface AICrudResponse {
  readonly success: boolean;
  readonly operation: string;
  readonly result?: unknown;
  readonly confirmation?: string;
  readonly tokensUsed: number;
  readonly metadata?: AIEnhancedMetadata;
}

export interface AIUsageResponse {
  readonly success: boolean;
  readonly usage: UsageCounter;
  readonly quotaStatus: QuotaStatus;
  readonly aggregations?: UsageAggregation[];
  readonly insights?: {
    readonly efficiency: {
      readonly cacheOptimization: number;
      readonly costEfficiency: number;
      readonly performanceScore: number;
    };
    readonly patterns: {
      readonly peakHours: number[];
      readonly preferredModels: EnhancedAIModel[];
      readonly commonSpecialties: MedicalSpecialty[];
    };
    readonly recommendations: string[];
  };
}

export interface AIRecommendationsResponse {
  readonly success: boolean;
  readonly recommendations: Recommendation[];
  readonly total: number;
  readonly metadata?: AIEnhancedMetadata;
}

export interface AIModelsResponse {
  readonly success: boolean;
  readonly models: EnhancedAIModel[];
  readonly availability: Record<EnhancedAIModel, boolean>;
  readonly metadata?: AIEnhancedMetadata;
}

// ================================================
// ERROR TYPES
// ================================================

export interface AIEnhancedError {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
  readonly timestamp: Date;
  readonly requestId?: string;
}

export type AIEnhancedErrorCode =
  | "QUOTA_EXCEEDED"
  | "PLAN_LIMIT_REACHED"
  | "MODEL_UNAVAILABLE"
  | "COMPLIANCE_VIOLATION"
  | "INVALID_REQUEST"
  | "INTERNAL_ERROR"
  | "RATE_LIMITED"
  | "AUTHENTICATION_FAILED"
  | "AUTHORIZATION_FAILED";
