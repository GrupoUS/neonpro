// Enhanced Multi-Model AI Assistant Plan Gating Configuration
// Brazilian Healthcare Compliance: Feature access control and plan-based model selection
// Integrates with governance.config.json patterns for consistent configuration management
// Date: 2025-09-15

import type {
  SubscriptionTier,
  EnhancedAIModel,
  AIFeatureCode,
  CFMComplianceLevel,
  MedicalSpecialty,
} from "@neonpro/types";

// ================================================
// FEATURE GATES CONFIGURATION
// ================================================

/**
 * Feature access control matrix based on subscription plans
 * Defines which features are available for each subscription tier
 */
export const FEATURE_GATES: Record<AIFeatureCode, SubscriptionTier[]> = {
  // Basic AI Chat - Available to all plans including free
  ai_chat_basic: ["free", "pro", "enterprise", "trial"],

  // Advanced AI Chat - Professional and enterprise features
  ai_chat_advanced: ["pro", "enterprise", "trial"],

  // Analytics - Business intelligence for practices
  ai_analytics: ["pro", "enterprise", "trial"],

  // Advanced Insights - Predictive analytics
  ai_insights: ["enterprise"],

  // AI Predictions - Advanced forecasting and risk analysis
  ai_predictions: ["enterprise"],

  // Custom Models - Enterprise-only personalized AI models
  custom_models: ["enterprise"],

  // Beta Features - Early access to new capabilities
  beta_features: ["pro", "enterprise"],

  // Enhanced LGPD Features - Advanced compliance tools
  lgpd_advanced: ["pro", "enterprise", "trial"],

  // API Access - Programmatic integration
  api_access: ["pro", "enterprise"],

  // Priority Support - Enhanced customer support
  priority_support: ["pro", "enterprise"],
} as const;

// ================================================
// MODEL ACCESS CONTROL CONFIGURATION
// ================================================

/**
 * AI model access control based on subscription plans
 * Defines which AI models are available for each subscription tier
 */
export const MODEL_ACCESS_CONTROL: Record<
  EnhancedAIModel,
  {
    minimumPlan: SubscriptionTier;
    requiresApproval: boolean;
    healthcareOptimized: boolean;
    cfmApproved: boolean;
    anvisaCertified: boolean;
    costTier: "low" | "medium" | "high" | "premium";
  }
> = {
  // OpenAI GPT-4o Mini - Entry-level model for all plans
  "gpt-4o-mini": {
    minimumPlan: "free",
    requiresApproval: false,
    healthcareOptimized: false,
    cfmApproved: false,
    anvisaCertified: false,
    costTier: "low",
  },

  // Google Gemini Pro - Balanced performance for all plans
  "gemini-pro": {
    minimumPlan: "free",
    requiresApproval: false,
    healthcareOptimized: false,
    cfmApproved: false,
    anvisaCertified: false,
    costTier: "medium",
  },

  // OpenAI GPT-4o - Premium model for pro and enterprise
  "gpt-4o": {
    minimumPlan: "pro",
    requiresApproval: false,
    healthcareOptimized: false,
    cfmApproved: false,
    anvisaCertified: false,
    costTier: "high",
  },

  // Anthropic Claude 3.5 Sonnet - Enterprise-only premium reasoning
  "claude-3.5-sonnet": {
    minimumPlan: "enterprise",
    requiresApproval: false,
    healthcareOptimized: false,
    cfmApproved: false,
    anvisaCertified: false,
    costTier: "premium",
  },

  // Brazilian Healthcare Model - Pro+ with CFM approval
  "healthcare-pt-br": {
    minimumPlan: "pro",
    requiresApproval: true,
    healthcareOptimized: true,
    cfmApproved: true,
    anvisaCertified: true,
    costTier: "high",
  },

  // Experimental AI - Enterprise-only testing
  "experimental-ai": {
    minimumPlan: "enterprise",
    requiresApproval: true,
    healthcareOptimized: true,
    cfmApproved: false,
    anvisaCertified: false,
    costTier: "medium",
  },
} as const;

// ================================================
// PLAN CONFIGURATION MATRIX
// ================================================

/**
 * Complete plan configuration including limits, features, and compliance levels
 */
export const PLAN_CONFIG: Record<
  SubscriptionTier,
  {
    displayName: string;
    description: string;

    // Usage Limits
    monthlyQueryLimit: number; // -1 for unlimited
    dailyRateLimit: number;
    concurrentRequests: number;
    maxTokensPerRequest: number;
    maxClinics: number; // -1 for unlimited

    // Cost Management
    costBudgetUsdMonthly: number;
    costOptimization: {
      semanticCaching: boolean;
      rateLimiting: boolean;
      costAlerts: boolean;
    };

    // Brazilian Healthcare Compliance
    compliance: {
      cfmLevel: CFMComplianceLevel;
      anvisaCertified: boolean;
      lgpdEnhanced: boolean;
      dataRetentionDays: number;
      auditTrailEnhanced: boolean;
    };

    // Available Models
    availableModels: EnhancedAIModel[];

    // Feature Access
    features: AIFeatureCode[];

    // Support Level
    support: {
      priority: boolean;
      slaHours: number;
      dedicatedSupport: boolean;
    };
  }
> = {
  free: {
    displayName: "NeonPro AI Gratuito",
    description:
      "Plano gratuito para consultórios iniciantes com IA básica em português brasileiro",

    // Conservative limits for free tier
    monthlyQueryLimit: 50,
    dailyRateLimit: 10,
    concurrentRequests: 1,
    maxTokensPerRequest: 2000,
    maxClinics: 1,

    costBudgetUsdMonthly: 0,
    costOptimization: {
      semanticCaching: true,
      rateLimiting: true,
      costAlerts: false,
    },

    compliance: {
      cfmLevel: "basic",
      anvisaCertified: false,
      lgpdEnhanced: false,
      dataRetentionDays: 30,
      auditTrailEnhanced: false,
    },

    availableModels: ["gpt-4o-mini", "gemini-pro"],
    features: ["ai_chat_basic"],

    support: {
      priority: false,
      slaHours: 72,
      dedicatedSupport: false,
    },
  },

  pro: {
    displayName: "NeonPro AI Profissional",
    description:
      "Plano profissional com IA avançada e análises para clínicas médias",

    // Professional usage limits
    monthlyQueryLimit: 1000,
    dailyRateLimit: 50,
    concurrentRequests: 3,
    maxTokensPerRequest: 4000,
    maxClinics: 3,

    costBudgetUsdMonthly: 50,
    costOptimization: {
      semanticCaching: true,
      rateLimiting: true,
      costAlerts: true,
    },

    compliance: {
      cfmLevel: "advanced",
      anvisaCertified: true,
      lgpdEnhanced: true,
      dataRetentionDays: 90,
      auditTrailEnhanced: true,
    },

    availableModels: [
      "gpt-4o-mini",
      "gemini-pro",
      "gpt-4o",
      "healthcare-pt-br",
    ],
    features: [
      "ai_chat_basic",
      "ai_chat_advanced",
      "ai_analytics",
      "beta_features",
      "lgpd_advanced",
      "api_access",
      "priority_support",
    ],

    support: {
      priority: true,
      slaHours: 24,
      dedicatedSupport: false,
    },
  },

  enterprise: {
    displayName: "NeonPro AI Empresarial",
    description:
      "Solução empresarial completa com todos os recursos de IA e conformidade total",

    // Enterprise unlimited usage
    monthlyQueryLimit: -1, // Unlimited
    dailyRateLimit: 200,
    concurrentRequests: 10,
    maxTokensPerRequest: 8000,
    maxClinics: -1, // Unlimited

    costBudgetUsdMonthly: 200,
    costOptimization: {
      semanticCaching: true,
      rateLimiting: false, // More lenient for enterprise
      costAlerts: true,
    },

    compliance: {
      cfmLevel: "full",
      anvisaCertified: true,
      lgpdEnhanced: true,
      dataRetentionDays: 365,
      auditTrailEnhanced: true,
    },

    availableModels: [
      "gpt-4o-mini",
      "gemini-pro",
      "gpt-4o",
      "claude-3.5-sonnet",
      "healthcare-pt-br",
      "experimental-ai",
    ],
    features: [
      "ai_chat_basic",
      "ai_chat_advanced",
      "ai_analytics",
      "ai_insights",
      "ai_predictions",
      "custom_models",
      "beta_features",
      "lgpd_advanced",
      "api_access",
      "priority_support",
    ],

    support: {
      priority: true,
      slaHours: 4,
      dedicatedSupport: true,
    },
  },

  trial: {
    displayName: "NeonPro AI Trial",
    description:
      "Teste gratuito de 30 dias com acesso aos recursos profissionais",

    // Trial with pro-level limits
    monthlyQueryLimit: 500,
    dailyRateLimit: 25,
    concurrentRequests: 2,
    maxTokensPerRequest: 4000,
    maxClinics: 1,

    costBudgetUsdMonthly: 25,
    costOptimization: {
      semanticCaching: true,
      rateLimiting: true,
      costAlerts: true,
    },

    compliance: {
      cfmLevel: "advanced",
      anvisaCertified: true,
      lgpdEnhanced: true,
      dataRetentionDays: 30, // Shorter retention for trial
      auditTrailEnhanced: true,
    },

    availableModels: [
      "gpt-4o-mini",
      "gemini-pro",
      "gpt-4o",
      "healthcare-pt-br",
    ],
    features: [
      "ai_chat_basic",
      "ai_chat_advanced",
      "ai_analytics",
      "lgpd_advanced",
      "priority_support",
    ],

    support: {
      priority: true,
      slaHours: 24,
      dedicatedSupport: false,
    },
  },
} as const;

// ================================================
// HEALTHCARE COMPLIANCE CONFIGURATION
// ================================================

/**
 * Medical specialty access requirements for AI features
 */
export const MEDICAL_SPECIALTY_REQUIREMENTS: Record<
  MedicalSpecialty,
  {
    requiredCfmLevel: CFMComplianceLevel;
    anvisaOversight: boolean;
    specialPermissions: string[];
    dataRetentionDays: number;
  }
> = {
  dermatologia: {
    requiredCfmLevel: "advanced",
    anvisaOversight: true,
    specialPermissions: ["dermatology_ai", "image_analysis"],
    dataRetentionDays: 180,
  },
  estetica: {
    requiredCfmLevel: "basic",
    anvisaOversight: false,
    specialPermissions: ["aesthetic_consultation"],
    dataRetentionDays: 90,
  },
  cosmiatria: {
    requiredCfmLevel: "advanced",
    anvisaOversight: true,
    specialPermissions: ["cosmetic_procedures", "treatment_planning"],
    dataRetentionDays: 365,
  },
  cirurgia_plastica: {
    requiredCfmLevel: "full",
    anvisaOversight: true,
    specialPermissions: ["surgical_planning", "risk_assessment"],
    dataRetentionDays: 730, // 2 years for surgical procedures
  },
  medicina_geral: {
    requiredCfmLevel: "basic",
    anvisaOversight: false,
    specialPermissions: ["general_consultation"],
    dataRetentionDays: 180,
  },
  nutricao: {
    requiredCfmLevel: "basic",
    anvisaOversight: false,
    specialPermissions: ["nutrition_planning"],
    dataRetentionDays: 90,
  },
  fisioterapia: {
    requiredCfmLevel: "basic",
    anvisaOversight: false,
    specialPermissions: ["physiotherapy_planning"],
    dataRetentionDays: 180,
  },
} as const;

// ================================================
// COST OPTIMIZATION CONFIGURATION
// ================================================

/**
 * Cost optimization settings per plan tier
 */
export const COST_OPTIMIZATION_CONFIG = {
  semanticCaching: {
    enabled: true,
    cacheTtlMinutes: 60,
    costSavingsTarget: 0.8, // 80% cost reduction goal
    similarityThreshold: 0.85,
  },

  modelRouting: {
    // Route to cheaper models when appropriate
    free: {
      preferredModel: "gpt-4o-mini" as EnhancedAIModel,
      fallbackModel: "gemini-pro" as EnhancedAIModel,
    },
    pro: {
      preferredModel: "gpt-4o" as EnhancedAIModel,
      fallbackModel: "gpt-4o-mini" as EnhancedAIModel,
    },
    enterprise: {
      preferredModel: "claude-3.5-sonnet" as EnhancedAIModel,
      fallbackModel: "gpt-4o" as EnhancedAIModel,
    },
    trial: {
      preferredModel: "gpt-4o" as EnhancedAIModel,
      fallbackModel: "gpt-4o-mini" as EnhancedAIModel,
    },
  },

  rateLimiting: {
    adaptiveThrottling: true,
    burstAllowance: 2, // Allow 2x rate limit for short bursts
    backoffMultiplier: 1.5,
  },
} as const;

// ================================================
// VALIDATION FUNCTIONS
// ================================================

/**
 * Validates if a user has access to a specific feature based on their plan
 */
export function validateFeatureAccess(
  userPlan: SubscriptionTier,
  featureCode: AIFeatureCode,
): boolean {
  const allowedPlans = FEATURE_GATES[featureCode];
  return allowedPlans.includes(userPlan);
}

/**
 * Validates if a user has access to a specific AI model based on their plan
 */
export function validateModelAccess(
  userPlan: SubscriptionTier,
  modelCode: EnhancedAIModel,
): boolean {
  const modelConfig = MODEL_ACCESS_CONTROL[modelCode];
  const planConfig = PLAN_CONFIG[userPlan];

  return (
    planConfig.availableModels.includes(modelCode) &&
    getPlanPriority(userPlan) >= getPlanPriority(modelConfig.minimumPlan)
  );
}

/**
 * Gets plan priority for comparison (higher number = higher tier)
 */
function getPlanPriority(plan: SubscriptionTier): number {
  const priorities: Record<SubscriptionTier, number> = {
    free: 1,
    trial: 2,
    pro: 3,
    enterprise: 4,
  };
  return priorities[plan];
}

/**
 * Gets recommended upgrade plan for accessing a specific feature
 */
export function getRecommendedUpgrade(
  currentPlan: SubscriptionTier,
  desiredFeature: AIFeatureCode,
): SubscriptionTier | null {
  const allowedPlans = FEATURE_GATES[desiredFeature];
  const currentPriority = getPlanPriority(currentPlan);

  // Find the lowest tier plan that has access to the feature
  const availableUpgrades = allowedPlans
    .map((plan) => ({ plan, priority: getPlanPriority(plan) }))
    .filter(({ priority }) => priority > currentPriority)
    .sort((a, b) => a.priority - b.priority);

  return availableUpgrades.length > 0 ? (availableUpgrades[0]?.plan ?? null) : null;
}

/**
 * Gets the preferred AI model for a given plan and use case
 */
export function getPreferredModel(
  plan: SubscriptionTier,
  useCase: "chat" | "analysis" | "prediction" = "chat",
): EnhancedAIModel {
  const planConfig = PLAN_CONFIG[plan];
  const routingConfig = COST_OPTIMIZATION_CONFIG.modelRouting[plan];

  // For healthcare-specific use cases, prefer healthcare-optimized models
  if (useCase === "analysis" || useCase === "prediction") {
    const healthcareModel = planConfig.availableModels.find((model) => MODEL_ACCESS_CONTROL[model].healthcareOptimized,
    );
    if (healthcareModel) return healthcareModel;
  }

  return routingConfig.preferredModel;
}

// ================================================
// EXPORT CONFIGURATION
// ================================================

// Named exports already declared above. Avoid re-declaring.
export type PlanConfigType = typeof PLAN_CONFIG;
export type FeatureGatesType = typeof FEATURE_GATES;
export type ModelAccessControlType = typeof MODEL_ACCESS_CONTROL;
