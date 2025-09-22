// Enhanced Multi-Model AI Assistant Usage Quota Configuration
// Real-time usage tracking, cost optimization, and Brazilian healthcare compliance
// Integrates with plan gating configuration for comprehensive quota management
// Date: 2025-09-15

import type {
  SubscriptionTier,
  EnhancedAIModel,
  QuotaStatus,
  AuditTrail,
} from "@neonpro/types";
import { PLAN_CONFIG } from "./plans";

// ================================================
// QUOTA CONFIGURATION INTERFACES
// ================================================

/**
 * Real-time quota configuration for usage enforcement
 */
export interface QuotaConfig {
  readonly monthlyQueries: number; // -1 for unlimited
  readonly dailyRateLimit: number;
  readonly concurrentRequests: number;
  readonly maxTokensPerRequest: number;
  readonly costBudgetUsd: number;
  readonly burstAllowance: number; // Temporary burst above daily limit
  readonly resetDay: number; // Day of month for quota reset (1-28)
}

/**
 * Cost tracking configuration per AI model
 */
export interface ModelCostConfig {
  readonly modelCode: EnhancedAIModel;
  readonly costPer1kInputTokens: number;
  readonly costPer1kOutputTokens: number;
  readonly averageLatencyMs: number;
  readonly cacheTtlMinutes: number;
  readonly costTier: "low" | "medium" | "high" | "premium";
}

/**
 * Usage alert configuration for proactive monitoring
 */
export interface UsageAlertConfig {
  readonly quotaWarningThreshold: number; // 0.0-1.0 (80% = 0.8)
  readonly costWarningThreshold: number; // 0.0-1.0
  readonly dailyLimitWarningThreshold: number; // 0.0-1.0
  readonly alertChannels: ("email" | "dashboard" | "webhook")[];
  readonly escalationThresholds: number[]; // [0.9, 0.95, 1.0]
}

// ================================================
// PLAN-BASED QUOTA CONFIGURATION
// ================================================

/**
 * Quota configurations mapped to subscription tiers
 * Derived from PLAN_CONFIG for consistency
 */
export const QUOTA_CONFIGURATION: Record<SubscriptionTier, QuotaConfig> = {
  free: {
    monthlyQueries: PLAN_CONFIG.free.monthlyQueryLimit,
    dailyRateLimit: PLAN_CONFIG.free.dailyRateLimit,
    concurrentRequests: PLAN_CONFIG.free.concurrentRequests,
    maxTokensPerRequest: PLAN_CONFIG.free.maxTokensPerRequest,
    costBudgetUsd: PLAN_CONFIG.free.costBudgetUsdMonthly,
    burstAllowance: 5, // Allow small burst for free users
    resetDay: 1, // Monthly reset on 1st
  },

  pro: {
    monthlyQueries: PLAN_CONFIG.pro.monthlyQueryLimit,
    dailyRateLimit: PLAN_CONFIG.pro.dailyRateLimit,
    concurrentRequests: PLAN_CONFIG.pro.concurrentRequests,
    maxTokensPerRequest: PLAN_CONFIG.pro.maxTokensPerRequest,
    costBudgetUsd: PLAN_CONFIG.pro.costBudgetUsdMonthly,
    burstAllowance: 20, // Reasonable burst for pro users
    resetDay: 1,
  },

  enterprise: {
    monthlyQueries: PLAN_CONFIG.enterprise.monthlyQueryLimit, // -1 (unlimited)
    dailyRateLimit: PLAN_CONFIG.enterprise.dailyRateLimit,
    concurrentRequests: PLAN_CONFIG.enterprise.concurrentRequests,
    maxTokensPerRequest: PLAN_CONFIG.enterprise.maxTokensPerRequest,
    costBudgetUsd: PLAN_CONFIG.enterprise.costBudgetUsdMonthly,
    burstAllowance: 50, // Large burst allowance for enterprise
    resetDay: 1,
  },

  trial: {
    monthlyQueries: PLAN_CONFIG.trial.monthlyQueryLimit,
    dailyRateLimit: PLAN_CONFIG.trial.dailyRateLimit,
    concurrentRequests: PLAN_CONFIG.trial.concurrentRequests,
    maxTokensPerRequest: PLAN_CONFIG.trial.maxTokensPerRequest,
    costBudgetUsd: PLAN_CONFIG.trial.costBudgetUsdMonthly,
    burstAllowance: 15, // Moderate burst for trial users
    resetDay: 1,
  },
} as const;

// ================================================
// MODEL COST CONFIGURATION
// ================================================

/**
 * Cost tracking configuration for all AI models
 * Updated with latest pricing as of 2025-09-15
 */
export const MODEL_COST_CONFIG: Record<EnhancedAIModel, ModelCostConfig> = {
  "gpt-4o-mini": {
    modelCode: "gpt-4o-mini",
    costPer1kInputTokens: 0.00015, // $0.15 per 1M input tokens
    costPer1kOutputTokens: 0.0006, // $0.60 per 1M output tokens
    averageLatencyMs: 800,
    cacheTtlMinutes: 60,
    costTier: "low",
  },

  "gpt-4o": {
    modelCode: "gpt-4o",
    costPer1kInputTokens: 0.0025, // $2.50 per 1M input tokens
    costPer1kOutputTokens: 0.01, // $10.00 per 1M output tokens
    averageLatencyMs: 1500,
    cacheTtlMinutes: 120,
    costTier: "high",
  },

  "claude-3.5-sonnet": {
    modelCode: "claude-3.5-sonnet",
    costPer1kInputTokens: 0.003, // $3.00 per 1M input tokens
    costPer1kOutputTokens: 0.015, // $15.00 per 1M output tokens
    averageLatencyMs: 2000,
    cacheTtlMinutes: 180,
    costTier: "premium",
  },

  "gemini-pro": {
    modelCode: "gemini-pro",
    costPer1kInputTokens: 0.00125, // $1.25 per 1M input tokens
    costPer1kOutputTokens: 0.005, // $5.00 per 1M output tokens
    averageLatencyMs: 1200,
    cacheTtlMinutes: 90,
    costTier: "medium",
  },

  "healthcare-pt-br": {
    modelCode: "healthcare-pt-br",
    costPer1kInputTokens: 0.002, // Custom pricing for healthcare model
    costPer1kOutputTokens: 0.008,
    averageLatencyMs: 1000,
    cacheTtlMinutes: 240, // Longer cache for specialized healthcare model
    costTier: "high",
  },

  "experimental-ai": {
    modelCode: "experimental-ai",
    costPer1kInputTokens: 0.001, // Lower cost for experimental model
    costPer1kOutputTokens: 0.004,
    averageLatencyMs: 800,
    cacheTtlMinutes: 30, // Shorter cache for experimental features
    costTier: "medium",
  },
} as const;

// ================================================
// USAGE ALERT CONFIGURATION
// ================================================

/**
 * Alert thresholds and notification settings per plan tier
 */
export const USAGE_ALERT_CONFIG: Record<SubscriptionTier, UsageAlertConfig> = {
  free: {
    quotaWarningThreshold: 0.8, // 80% usage warning
    costWarningThreshold: 0.9, // 90% cost warning (more critical for free)
    dailyLimitWarningThreshold: 0.7, // 70% daily limit warning
    alertChannels: ["dashboard"],
    escalationThresholds: [0.9, 0.95, 1.0],
  },

  pro: {
    quotaWarningThreshold: 0.75,
    costWarningThreshold: 0.85,
    dailyLimitWarningThreshold: 0.8,
    alertChannels: ["email", "dashboard"],
    escalationThresholds: [0.85, 0.95, 1.0],
  },

  enterprise: {
    quotaWarningThreshold: 0.9, // Higher threshold for enterprise
    costWarningThreshold: 0.8,
    dailyLimitWarningThreshold: 0.9,
    alertChannels: ["email", "dashboard", "webhook"],
    escalationThresholds: [0.8, 0.9, 0.95],
  },

  trial: {
    quotaWarningThreshold: 0.7, // Earlier warning for trial users
    costWarningThreshold: 0.8,
    dailyLimitWarningThreshold: 0.75,
    alertChannels: ["email", "dashboard"],
    escalationThresholds: [0.8, 0.9, 1.0],
  },
} as const;

// ================================================
// SEMANTIC CACHING CONFIGURATION
// ================================================

/**
 * Semantic caching configuration for cost optimization
 * Target: 80% cost reduction through intelligent caching
 */
export const SEMANTIC_CACHE_CONFIG = {
  enabled: true,

  // Cache similarity thresholds
  similarityThresholds: {
    exact: 1.0, // Exact match
    high: 0.95, // Very similar queries
    medium: 0.85, // Moderately similar queries
    low: 0.75, // Loosely similar queries (cache but flag for review)
  },

  // Cache TTL based on content type
  cacheTtl: {
    generalQueries: 60, // 1 hour for general queries
    medicalConsultation: 30, // 30 minutes for medical content
    diagnosticAnalysis: 15, // 15 minutes for diagnostic content
    prescriptionAdvice: 5, // 5 minutes for prescription-related content
  },

  // Cache invalidation rules
  invalidationRules: {
    patientDataChange: true, // Invalidate when patient data changes
    protocolUpdate: true, // Invalidate when medical protocols update
    regulatoryChange: true, // Invalidate when CFM/ANVISA regulations change
    modelUpdate: true, // Invalidate when AI model is updated
  },

  // Cost savings tracking
  costSavingsTracking: {
    enabled: true,
    reportingInterval: "daily",
    targetSavingsPercentage: 80, // 80% cost reduction goal
    alertOnLowSavings: true,
    lowSavingsThreshold: 60, // Alert if savings below 60%
  },

  // LGPD compliance for cached data
  lgpdCompliance: {
    anonymizePatientData: true,
    encryptCachedContent: true,
    auditCacheAccess: true,
    maxRetentionDays: 7, // Cache retention limit for compliance
  },
} as const;

// ================================================
// BRAZILIAN HEALTHCARE QUOTA COMPLIANCE
// ================================================

/**
 * Healthcare-specific quota and billing compliance for Brazil
 */
export const HEALTHCARE_COMPLIANCE_CONFIG = {
  // CFM Resolution 2314/2022 compliance
  cfmCompliance: {
    maxConsecutiveAiInteractions: 5, // Require human professional review after 5 AI interactions
    mandatoryProfessionalReview: true,
    auditTrailRequired: true,
    dataRetentionPolicyEnforced: true,
  },

  // ANVISA oversight requirements
  anvisaCompliance: {
    deviceRegistrationRequired: true, // AI as medical device
    qualityManagementSystem: true,
    adverseEventReporting: true,
    postMarketSurveillance: true,
  },

  // LGPD data protection
  lgpdCompliance: {
    explicitConsentRequired: true,
    dataMinimization: true,
    purposeLimitation: true,
    dataPortability: true,
    rightToErasure: true,
    auditLogging: true,
  },

  // Billing compliance for Brazilian market
  billingCompliance: {
    fiscalDocumentRequired: true, // Nota fiscal
    taxCalculation: {
      issRate: 0.05, // 5% ISS (municipal tax)
      pisRate: 0.0165, // 1.65% PIS
      cofinsRate: 0.076, // 7.6% COFINS
      irRate: 0.015, // 1.5% IR (withholding tax)
      csllRate: 0.01, // 1% CSLL
    },
    currencySupport: ["BRL", "USD"],
    paymentMethods: ["credit_card", "bank_transfer", "pix"],
  },
} as const;

// ================================================
// QUOTA MANAGEMENT FUNCTIONS
// ================================================

/**
 * Calculates current quota status for a user
 */
export function calculateQuotaStatus(
  plan: SubscriptionTier,
  currentUsage: {
    monthlyQueries: number;
    dailyQueries: number;
    currentCostUsd: number;
    concurrentRequests: number;
  },
): QuotaStatus {
  const quotaConfig = QUOTA_CONFIGURATION[plan];

  const monthlyRemaining =
    quotaConfig.monthlyQueries === -1
      ? Number.MAX_SAFE_INTEGER
      : Math.max(0, quotaConfig.monthlyQueries - currentUsage.monthlyQueries);

  const dailyRemaining = Math.max(
    0,
    quotaConfig.dailyRateLimit - currentUsage.dailyQueries,
  );
  const costRemaining = Math.max(
    0,
    quotaConfig.costBudgetUsd - currentUsage.currentCostUsd,
  );

  const monthlyUsagePercentage =
    quotaConfig.monthlyQueries === -1
      ? 0
      : (currentUsage.monthlyQueries / quotaConfig.monthlyQueries) * 100;

  const canMakeRequest =
    monthlyRemaining > 0 &&
    dailyRemaining > 0 &&
    costRemaining > 0 &&
    currentUsage.concurrentRequests < quotaConfig.concurrentRequests;

  return {
    monthlyQuotaRemaining: monthlyRemaining,
    dailyQuotaRemaining: dailyRemaining,
    costBudgetRemaining: costRemaining,
    monthlyUsagePercentage,
    canMakeRequest,
    quotaResetDate: getNextQuotaResetDate(quotaConfig.resetDay),
    planLimits: {
      monthlyQueries: quotaConfig.monthlyQueries,
      dailyRateLimit: quotaConfig.dailyRateLimit,
      concurrentRequests: quotaConfig.concurrentRequests,
      maxTokensPerRequest: quotaConfig.maxTokensPerRequest,
      costBudgetUsd: quotaConfig.costBudgetUsd,
    },
  };
}

/**
 * Calculates cost for a specific request
 */
export function calculateRequestCost(
  modelCode: EnhancedAIModel,
  inputTokens: number,
  outputTokens: number,
  cacheHit: boolean = false,
): number {
  const modelConfig = MODEL_COST_CONFIG[modelCode];

  const inputCost = (inputTokens / 1000) * modelConfig.costPer1kInputTokens;
  const outputCost = (outputTokens / 1000) * modelConfig.costPer1kOutputTokens;
  const totalCost = inputCost + outputCost;

  // Apply cache savings if applicable
  if (cacheHit) {
    return totalCost * 0.1; // 90% savings on cache hits
  }

  return totalCost;
}

/**
 * Determines if semantic caching should be applied
 */
export function shouldApplySemanticCache(
  query: string,
  previousQueries: string[],
  contextType:
    | "general"
    | "medical"
    | "diagnostic"
    | "prescription" = "general",
): { shouldCache: boolean; similarity: number; ttlMinutes: number } {
  if (!SEMANTIC_CACHE_CONFIG.enabled) {
    return { shouldCache: false, similarity: 0, ttlMinutes: 0 };
  }

  // Simple similarity check (in production, use more sophisticated NLP)
  const maxSimilarity = Math.max(...previousQueries.map((prev) =>
      calculateStringSimilarity(query.toLowerCase(), prev.toLowerCase()),
    ),
  );

  const shouldCache =
    maxSimilarity >= SEMANTIC_CACHE_CONFIG.similarityThresholds.medium;
  const ttlMap = SEMANTIC_CACHE_CONFIG.cacheTtl as Record<string, number>;
  const ttlMinutes = ttlMap[contextType] ?? ttlMap.generalQueries ?? 60;

  return {
    shouldCache,
    similarity: maxSimilarity,
    ttlMinutes,
  };
}

/**
 * Generates usage alerts based on current consumption
 */
export function generateUsageAlerts(
  plan: SubscriptionTier,
  quotaStatus: QuotaStatus,
): Array<{
  type: "warning" | "critical" | "info";
  message: string;
  threshold: number;
  currentUsage: number;
}> {
  const alertConfig = USAGE_ALERT_CONFIG[plan]; // keep reference for future enhancements
  const alerts: Array<{
    type: "warning" | "critical" | "info";
    message: string;
    threshold: number;
    currentUsage: number;
  }> = [];

  const usagePercentage = quotaStatus.monthlyUsagePercentage / 100;

  // Check quota warnings
  if (usagePercentage >= alertConfig.quotaWarningThreshold) {
    alerts.push({
      type: usagePercentage >= 0.95 ? "critical" : "warning",
      message: `Você utilizou ${quotaStatus.monthlyUsagePercentage.toFixed(1)}% da sua cota mensal de consultas IA`,
      threshold: alertConfig.quotaWarningThreshold,
      currentUsage: usagePercentage,
    });
  }

  // Check cost warnings
  const costUsagePercentage =
    1 - quotaStatus.costBudgetRemaining / quotaStatus.planLimits.costBudgetUsd;
  if (costUsagePercentage >= alertConfig.costWarningThreshold) {
    alerts.push({
      type: costUsagePercentage >= 0.95 ? "critical" : "warning",
      message: `Você utilizou ${(costUsagePercentage * 100).toFixed(1)}% do seu orçamento mensal de IA`,
      threshold: alertConfig.costWarningThreshold,
      currentUsage: costUsagePercentage,
    });
  }

  // Check daily limit warnings
  const dailyUsagePercentage =
    1 - quotaStatus.dailyQuotaRemaining / quotaStatus.planLimits.dailyRateLimit;
  if (dailyUsagePercentage >= alertConfig.dailyLimitWarningThreshold) {
    alerts.push({
      type: dailyUsagePercentage >= 0.95 ? "critical" : "warning",
      message: `Você utilizou ${(dailyUsagePercentage * 100).toFixed(1)}% do seu limite diário de consultas IA`,
      threshold: alertConfig.dailyLimitWarningThreshold,
      currentUsage: dailyUsagePercentage,
    });
  }

  return alerts;
}

// ================================================
// UTILITY FUNCTIONS
// ================================================

/**
 * Gets the next quota reset date
 */
function getNextQuotaResetDate(resetDay: number): Date {
  const now = new Date();
  const nextReset = new Date(now.getFullYear(), now.getMonth() + 1, resetDay);

  // If we're past the reset day this month, move to next month
  if (now.getDate() >= resetDay) {
    nextReset.setMonth(nextReset.getMonth() + 1);
  }

  return nextReset;
}

/**
 * Simple string similarity calculation (Jaccard similarity)
 * In production, use more sophisticated NLP similarity measures
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  const set1 = new Set(str1.split(" "));
  const set2 = new Set(str2.split(" "));

  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
}

/**
 * Creates LGPD-compliant audit trail entry
 */
export function createQuotaAuditTrail(
  action: string,
  userId: string,
  details: Record<string, unknown>,
): AuditTrail {
  return {
    action,
    timestamp: new Date(),
    userId,
    consentStatus: "valid", // Assume valid for quota operations
    dataProcessingPurpose: "audit",
    anonymizationLevel: "none",
    metadata: {
      quotaAction: true,
      ...details,
    },
  };
}

// ================================================
// EXPORT CONFIGURATION
// ================================================

// Named exports already declared above. Avoid re-declaring.
export type QuotaConfigType = typeof QUOTA_CONFIGURATION;
export type ModelCostConfigType = typeof MODEL_COST_CONFIG;
export type UsageAlertConfigType = typeof USAGE_ALERT_CONFIG;
