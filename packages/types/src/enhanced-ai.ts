// Enhanced Multi-Model AI Assistant Types
// Brazilian Healthcare Compliance: LGPD, CFM, ANVISA
// Extends existing AI provider types for subscription plans and usage tracking
// Date: 2025-09-15

// Healthcare-compliant metadata types for Enhanced AI
export interface EnhancedAIMetadata {
  complianceLevel?: 'standard' | 'enhanced' | 'restricted'
  dataSensitivity?: 'public' | 'internal' | 'confidential' | 'restricted'
  auditTrail?: boolean
  encryptionLevel?: 'none' | 'basic' | 'advanced' | 'military'
  retentionPeriod?: number
  [key: string]: unknown
}

import type {
  AIProvider,
  AIProviderConfig,
  GenerateAnswerInput,
  GenerateAnswerResult,
} from './ai-provider'

// ================================================
// ENHANCED AI MODEL TYPES
// ================================================

/**
 * Enhanced AI model identifiers including healthcare-specialized models
 */
export type EnhancedAIModel =
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'claude-3.5-sonnet'
  | 'gemini-pro'
  | 'healthcare-pt-br'
  | 'experimental-ai'

/**
 * Medical specialties supported by AI models
 */
export type MedicalSpecialty =
  | 'dermatologia'
  | 'estetica'
  | 'cosmiatria'
  | 'cirurgia_plastica'
  | 'medicina_geral'
  | 'nutricao'
  | 'fisioterapia'

/**
 * Enhanced AI model configuration with healthcare compliance
 */
export interface EnhancedAIModelConfig extends AIProviderConfig {
  readonly modelCode: EnhancedAIModel
  readonly modelName: string
  readonly provider: AIProvider | 'healthcare-br'
  readonly modelVersion: string

  // Context and Performance
  readonly contextWindow: number
  readonly maxOutputTokens: number
  readonly supportsStreaming: boolean
  readonly supportsFunctionCalling: boolean

  // Healthcare Specialization
  readonly healthcareOptimized: boolean
  readonly portugueseOptimized: boolean
  readonly medicalSpecialties: MedicalSpecialty[]
  readonly cfmApproved: boolean
  readonly anvisaCertified: boolean

  // Cost and Performance Metrics
  readonly costPer1kInputTokens: number
  readonly costPer1kOutputTokens: number
  readonly averageLatencyMs: number
  readonly availabilitySla: number

  // Access Control
  readonly minimumPlanRequired: SubscriptionTier
  readonly requiresSpecialApproval: boolean

  // LGPD Compliance
  readonly logsPatientData: boolean
  readonly dataResidencyCompliant: boolean
  readonly encryptionAtRest: boolean

  // Model Status
  readonly status: 'active' | 'deprecated' | 'maintenance' | 'experimental'
  readonly deploymentDate?: Date
  readonly deprecationDate?: Date
}

// ================================================
// SUBSCRIPTION PLAN TYPES
// ================================================

/**
 * Subscription tier levels
 */
export type SubscriptionTier = 'free' | 'pro' | 'enterprise' | 'trial'

/**
 * CFM compliance levels for Brazilian medical practice
 */
export type CFMComplianceLevel = 'basic' | 'advanced' | 'full'

/**
 * Subscription plan configuration with Brazilian healthcare features
 */
export interface SubscriptionPlan {
  readonly planCode: SubscriptionTier
  readonly planName: string
  readonly planDescription: string

  // Brazilian Healthcare Compliance
  readonly cfmComplianceLevel: CFMComplianceLevel
  readonly anvisaCertified: boolean
  readonly lgpdEnhancedFeatures: boolean

  // Usage Limits
  readonly monthlyQueryLimit: number // -1 for unlimited
  readonly dailyRateLimit: number
  readonly concurrentRequests: number
  readonly maxTokensPerRequest: number
  readonly maxClinics: number // -1 for unlimited

  // Cost Management
  readonly costBudgetUsdMonthly: number
  readonly costPer1kTokens: number

  // Feature Access
  readonly features: PlanFeatures

  // LGPD Compliance
  readonly dataRetentionDays: number
  readonly anonymizationRequired: boolean
  readonly auditTrailEnhanced: boolean

  // Plan Metadata
  readonly active: boolean
  readonly sortOrder: number
}

/**
 * Features available per subscription plan
 */
export interface PlanFeatures {
  readonly aiChatBasic: boolean
  readonly aiChatAdvanced: boolean
  readonly aiAnalytics: boolean
  readonly aiInsights: boolean
  readonly aiPredictions: boolean
  readonly customModelsAccess: boolean
  readonly prioritySupport: boolean
}

/**
 * Plan limits for quota management
 */
export interface PlanLimits {
  readonly monthlyQueries: number
  readonly dailyRateLimit: number
  readonly concurrentRequests: number
  readonly maxTokensPerRequest: number
  readonly costBudgetUsd: number
}

// ================================================
// USAGE TRACKING TYPES
// ================================================

/**
 * AI usage record with LGPD compliance and audit trail
 */
export interface AIUsageRecord {
  readonly id: string

  // User and Context
  readonly clinicId: string
  readonly userId: string
  readonly sessionId?: string

  // Model and Request Details
  readonly modelCode: EnhancedAIModel
  readonly provider: AIProvider | 'healthcare-br'
  readonly requestType: 'chat' | 'completion' | 'analysis' | 'prediction'

  // Token Usage
  readonly inputTokens: number
  readonly outputTokens: number
  readonly totalTokens: number

  // Cost Tracking
  readonly costUsd: number
  readonly costBrl?: number
  readonly exchangeRateUsdBrl?: number

  // Performance Metrics
  readonly latencyMs: number
  readonly cacheHit: boolean
  readonly cacheSavingsUsd: number

  // Healthcare Context
  readonly medicalSpecialty?: MedicalSpecialty
  readonly patientInvolved: boolean
  readonly diagnosisAssistance: boolean
  readonly prescriptionInvolved: boolean

  // LGPD Compliance
  readonly patientDataProcessed: boolean
  readonly anonymizationApplied: boolean
  readonly consentId?: string
  readonly auditTrail: AuditTrail

  // Quality Metrics
  readonly userSatisfactionScore?: number // 1-5
  readonly responseQualityScore?: number // 0.0-5.0

  // Compliance and Safety
  readonly contentFiltered: boolean
  readonly safetyFlags: string[]
  readonly regulatoryFlags: string[] // CFM, ANVISA compliance flags

  readonly createdAt: Date
}

/**
 * Real-time quota status for usage monitoring
 */
export interface QuotaStatus {
  readonly monthlyQuotaRemaining: number
  readonly dailyQuotaRemaining: number
  readonly costBudgetRemaining: number
  readonly monthlyUsagePercentage: number
  readonly canMakeRequest: boolean
  readonly quotaResetDate: Date
  readonly planLimits: PlanLimits
}

/**
 * Billing metrics with cost optimization
 */
export interface BillingMetrics {
  readonly totalCostUsd: number
  readonly totalCostBrl: number
  readonly totalTokens: number
  readonly totalRequests: number
  readonly cacheSavingsUsd: number
  readonly cacheSavingsPercentage: number
  readonly averageCostPerRequest: number
  readonly averageTokensPerRequest: number
  readonly period: {
    readonly start: Date
    readonly end: Date
  }
}

/**
 * LGPD-compliant audit trail
 */
export interface AuditTrail {
  readonly action: string
  readonly timestamp: Date
  readonly userId: string
  readonly userRole?: string
  readonly ipAddress?: string
  readonly userAgent?: string
  readonly consentStatus: 'valid' | 'missing' | 'invalid' | 'withdrawn'
  readonly dataProcessingPurpose:
    | 'analytics'
    | 'diagnosis'
    | 'training'
    | 'audit'
  readonly anonymizationLevel: 'none' | 'pseudonymized' | 'anonymized'
  readonly metadata?: EnhancedAIMetadata
}

// ================================================
// FEATURE GATE TYPES
// ================================================

/**
 * AI feature identifiers
 */
export type AIFeatureCode =
  | 'ai_chat_basic'
  | 'ai_chat_advanced'
  | 'ai_analytics'
  | 'ai_insights'
  | 'ai_predictions'
  | 'custom_models'
  | 'beta_features'
  | 'lgpd_advanced'
  | 'api_access'
  | 'priority_support'

/**
 * Feature gate configuration for plan-based access control
 */
export interface FeatureGate {
  readonly featureCode: AIFeatureCode
  readonly featureName: string
  readonly featureDescription: string

  // Access Control
  readonly requiredPlans: SubscriptionTier[]
  readonly requiredPermissions: string[]

  // Healthcare Compliance
  readonly requiresCfmValidation: boolean
  readonly requiresMedicalLicense: boolean
  readonly anvisaOversightRequired: boolean
  readonly patientSafetyCritical: boolean

  // LGPD Requirements
  readonly processesPatientData: boolean
  readonly requiresExplicitConsent: boolean
  readonly dataRetentionOverrideDays?: number

  // Feature Configuration
  readonly rateLimitOverride?: number
  readonly costMultiplier: number
  readonly betaFeature: boolean
  readonly geographicRestrictions: string[] // ['BR'] for Brazil-only

  // Status
  readonly active: boolean
  readonly rolloutPercentage: number // 0-100
}

// ================================================
// USER SUBSCRIPTION TYPES
// ================================================

/**
 * User subscription status
 */
export type SubscriptionStatus = 'active' | 'suspended' | 'cancelled' | 'trial'

/**
 * User subscription assignment with Brazilian billing support
 */
export interface UserSubscription {
  readonly id: string
  readonly clinicId: string
  readonly userId: string
  readonly planCode: SubscriptionTier

  // Subscription Details
  readonly subscriptionStart: Date
  readonly subscriptionEnd?: Date
  readonly autoRenew: boolean

  // Usage Tracking
  readonly currentMonthQueries: number
  readonly currentMonthCostUsd: number
  readonly lastUsageReset: Date

  // Billing
  readonly billingEmail?: string
  readonly paymentMethodId?: string
  readonly nextBillingDate?: Date

  // Status
  readonly status: SubscriptionStatus
  readonly trialEndDate?: Date

  // LGPD Compliance
  readonly billingConsentId?: string
  readonly marketingConsent: boolean

  readonly createdAt: Date
  readonly updatedAt: Date
}

// ================================================
// REQUEST AND RESPONSE TYPES
// ================================================

/**
 * Enhanced AI request with healthcare context
 */
export interface EnhancedAIRequest extends GenerateAnswerInput {
  readonly modelCode: EnhancedAIModel
  readonly clinicId: string
  readonly userId: string
  readonly sessionId?: string

  // Healthcare Context
  readonly medicalSpecialty?: MedicalSpecialty
  readonly patientInvolved?: boolean
  readonly diagnosisAssistance?: boolean
  readonly prescriptionInvolved?: boolean

  // LGPD Compliance
  readonly consentId?: string
  readonly dataProcessingPurpose:
    | 'analytics'
    | 'diagnosis'
    | 'training'
    | 'audit'
  readonly anonymizationRequired?: boolean

  // Feature Access
  readonly featureCode?: AIFeatureCode
  readonly planValidation?: boolean
}

/**
 * Enhanced AI response with usage tracking
 */
export interface EnhancedAIResponse extends GenerateAnswerResult {
  readonly usageRecord: AIUsageRecord
  readonly quotaStatus: QuotaStatus
  readonly complianceFlags: {
    readonly lgpdCompliant: boolean
    readonly cfmCompliant: boolean
    readonly anvisaCompliant: boolean
  }
  readonly performanceMetrics: {
    readonly latencyMs: number
    readonly cacheHit: boolean
    readonly cacheSavingsUsd: number
  }
}

// ================================================
// ERROR TYPES
// ================================================

/**
 * Enhanced AI error types with healthcare compliance context
 */
export type EnhancedAIErrorCode =
  | 'QUOTA_EXCEEDED'
  | 'PLAN_UPGRADE_REQUIRED'
  | 'MODEL_UNAVAILABLE'
  | 'CFM_VALIDATION_REQUIRED'
  | 'MEDICAL_LICENSE_REQUIRED'
  | 'CONSENT_REQUIRED'
  | 'PATIENT_SAFETY_BLOCK'
  | 'GEOGRAPHIC_RESTRICTION'
  | 'ANVISA_OVERSIGHT_REQUIRED'
  | 'LGPD_COMPLIANCE_ERROR'

/**
 * Enhanced AI error with compliance information
 */
export interface EnhancedAIError extends Error {
  readonly code: EnhancedAIErrorCode
  readonly modelCode?: EnhancedAIModel
  readonly featureCode?: AIFeatureCode
  readonly planRequired?: SubscriptionTier
  readonly complianceRequirements?: {
    readonly cfmValidation?: boolean
    readonly medicalLicense?: boolean
    readonly patientConsent?: boolean
    readonly anvisaOversight?: boolean
  }
  readonly quotaStatus?: QuotaStatus
  readonly retryAfter?: Date
}

// ================================================
// UTILITY TYPES
// ================================================

/**
 * Plan comparison for upgrade recommendations
 */
export interface PlanComparison {
  readonly currentPlan: SubscriptionTier
  readonly recommendedPlan: SubscriptionTier
  readonly additionalFeatures: AIFeatureCode[]
  readonly additionalModels: EnhancedAIModel[]
  readonly costDifferenceUsd: number
  readonly upgradeReasons: string[]
}

/**
 * AI model availability for a specific plan
 */
export interface ModelAvailability {
  readonly modelCode: EnhancedAIModel
  readonly available: boolean
  readonly requiresUpgrade?: SubscriptionTier
  readonly requiresApproval?: boolean
  readonly complianceRequirements?: {
    readonly cfmValidation: boolean
    readonly medicalLicense: boolean
    readonly anvisaOversight: boolean
  }
}

/**
 * Feature access validation result
 */
export interface FeatureAccessValidation {
  readonly featureCode: AIFeatureCode
  readonly hasAccess: boolean
  readonly planRequirement?: SubscriptionTier
  readonly missingPermissions?: string[]
  readonly complianceBlocks?: {
    readonly cfmValidation?: boolean
    readonly medicalLicense?: boolean
    readonly patientConsent?: boolean
    readonly geographicRestriction?: boolean
  }
}
