// Enhanced Multi-Model AI Assistant Plan Model
// Brazilian Healthcare Compliance: LGPD, CFM, ANVISA
// Subscription plan business logic and validation
// Date: 2025-09-19

import type {
  SubscriptionTier,
  SubscriptionPlan,
  CFMComplianceLevel,
  EnhancedAIModel,
  AIFeatureCode,
} from "@neonpro/types";
import {
  PLAN_CONFIG,
  validateFeatureAccess,
  validateModelAccess,
  getPreferredModel,
} from "@neonpro/config/plans";

// ================================================
// PLAN MODEL CLASS
// ================================================

/**
 * Business model for subscription plans with healthcare compliance
 * Provides plan validation, feature access control, and upgrade recommendations
 */
export class Plan {
  private readonly _config: (typeof PLAN_CONFIG)[SubscriptionTier];
  private readonly _tier: SubscriptionTier;

  constructor(tier: SubscriptionTier) {
    this._tier = tier;
    this._config = PLAN_CONFIG[tier];

    if (!this._config) {
      throw new Error(`Plano inválido: ${tier}`);
    }
  }

  // ================================================
  // BASIC PROPERTIES
  // ================================================

  get tier(): SubscriptionTier {
    return this._tier;
  }

  get displayName(): string {
    return this._config.displayName;
  }

  get description(): string {
    return this._config.description;
  }

  get isActive(): boolean {
    return true; // All configured plans are active
  }

  // ================================================
  // USAGE LIMITS
  // ================================================

  get monthlyQueryLimit(): number {
    return this._config.monthlyQueryLimit;
  }

  get dailyRateLimit(): number {
    return this._config.dailyRateLimit;
  }

  get concurrentRequests(): number {
    return this._config.concurrentRequests;
  }

  get maxTokensPerRequest(): number {
    return this._config.maxTokensPerRequest;
  }

  get maxClinics(): number {
    return this._config.maxClinics;
  }

  get costBudgetUsdMonthly(): number {
    return this._config.costBudgetUsdMonthly;
  }

  get isUnlimited(): boolean {
    return this._config.monthlyQueryLimit === -1;
  }

  // ================================================
  // HEALTHCARE COMPLIANCE
  // ================================================

  get cfmComplianceLevel(): CFMComplianceLevel {
    return this._config.compliance.cfmLevel;
  }

  get isAnvisaCertified(): boolean {
    return this._config.compliance.anvisaCertified;
  }

  get hasLgpdEnhancedFeatures(): boolean {
    return this._config.compliance.lgpdEnhanced;
  }

  get dataRetentionDays(): number {
    return this._config.compliance.dataRetentionDays;
  }

  get hasEnhancedAuditTrail(): boolean {
    return this._config.compliance.auditTrailEnhanced;
  }

  // ================================================
  // FEATURES AND MODELS
  // ================================================

  get availableFeatures(): AIFeatureCode[] {
    return [...this._config.features];
  }

  get availableModels(): EnhancedAIModel[] {
    return [...this._config.availableModels];
  }

  /**
   * Checks if the plan has access to a specific feature
   */
  hasFeature(featureCode: AIFeatureCode): boolean {
    return validateFeatureAccess(this._tier, featureCode);
  }

  /**
   * Checks if the plan has access to a specific AI model
   */
  hasModelAccess(modelCode: EnhancedAIModel): boolean {
    return validateModelAccess(this._tier, modelCode);
  }

  /**
   * Gets the preferred AI model for a specific use case
   */
  getPreferredModel(
    useCase: "chat" | "analysis" | "prediction" = "chat",
  ): EnhancedAIModel {
    return getPreferredModel(this._tier, useCase);
  }

  // ================================================
  // COST OPTIMIZATION
  // ================================================

  get hasSemanticCaching(): boolean {
    return this._config.costOptimization.semanticCaching;
  }

  get hasRateLimiting(): boolean {
    return this._config.costOptimization.rateLimiting;
  }

  get hasCostAlerts(): boolean {
    return this._config.costOptimization.costAlerts;
  }

  // ================================================
  // SUPPORT LEVEL
  // ================================================

  get hasPrioritySupport(): boolean {
    return this._config.support.priority;
  }

  get supportSlaHours(): number {
    return this._config.support.slaHours;
  }

  get hasDedicatedSupport(): boolean {
    return this._config.support.dedicatedSupport;
  }

  // ================================================
  // VALIDATION METHODS
  // ================================================

  /**
   * Validates if the plan can handle a specific request
   */
  canHandleRequest(_request: {
    tokens?: number;
    concurrentRequests?: number;
    features?: AIFeatureCode[];
    models?: EnhancedAIModel[];
  }): {
    canHandle: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check token limits
    if (_request.tokens && _request.tokens > this.maxTokensPerRequest) {
      issues.push(
        `Solicitação excede limite de tokens (${_request.tokens} > ${this.maxTokensPerRequest})`,
      );
      recommendations.push(
        "Reduza o tamanho da consulta ou faça upgrade do plano",
      );
    }

    // Check concurrent requests
    if (
      _request.concurrentRequests &&
      _request.concurrentRequests > this.concurrentRequests
    ) {
      issues.push(
        `Muitas solicitações simultâneas (${_request.concurrentRequests} > ${this.concurrentRequests})`,
      );
      recommendations.push(
        "Aguarde solicitações em andamento finalizarem ou faça upgrade do plano",
      );
    }

    // Check feature access
    if (_request.features) {
      for (const feature of _request.features) {
        if (!this.hasFeature(feature)) {
          issues.push(`Feature não disponível no plano atual: ${feature}`);
          recommendations.push(`Faça upgrade para acessar ${feature}`);
        }
      }
    }

    // Check model access
    if (_request.models) {
      for (const model of _request.models) {
        if (!this.hasModelAccess(model)) {
          issues.push(`Modelo AI não disponível no plano atual: ${model}`);
          recommendations.push(`Faça upgrade para acessar ${model}`);
        }
      }
    }

    return {
      canHandle: issues.length === 0,
      issues,
      recommendations,
    };
  }

  /**
   * Validates healthcare compliance requirements
   */
  validateHealthcareCompliance(requirement: {
    cfmLevel?: CFMComplianceLevel;
    anvisaRequired?: boolean;
    lgpdEnhanced?: boolean;
    dataRetentionDays?: number;
  }): {
    isCompliant: boolean;
    violations: string[];
    recommendations: string[];
  } {
    const violations: string[] = [];
    const recommendations: string[] = [];

    // Check CFM compliance level
    if (requirement.cfmLevel) {
      const levelOrder: Record<CFMComplianceLevel, number> = {
        basic: 1,
        advanced: 2,
        full: 3,
      };

      if (
        levelOrder[this.cfmComplianceLevel] < levelOrder[requirement.cfmLevel]
      ) {
        violations.push(
          `CFM compliance insuficiente: requer ${requirement.cfmLevel}, atual ${this.cfmComplianceLevel}`,
        );
        recommendations.push(
          "Faça upgrade para plano com maior compliance CFM",
        );
      }
    }

    // Check ANVISA certification
    if (requirement.anvisaRequired && !this.isAnvisaCertified) {
      violations.push(
        "Certificação ANVISA requerida mas não disponível no plano atual",
      );
      recommendations.push("Faça upgrade para plano certificado pela ANVISA");
    }

    // Check LGPD enhanced features
    if (requirement.lgpdEnhanced && !this.hasLgpdEnhancedFeatures) {
      violations.push(
        "Recursos LGPD avançados requeridos mas não disponíveis no plano atual",
      );
      recommendations.push(
        "Faça upgrade para plano com recursos LGPD avançados",
      );
    }

    // Check data retention requirements
    if (
      requirement.dataRetentionDays &&
      this.dataRetentionDays < requirement.dataRetentionDays
    ) {
      violations.push(
        `Retenção de dados insuficiente: requer ${requirement.dataRetentionDays} dias, atual ${this.dataRetentionDays}`,
      );
      recommendations.push(
        "Faça upgrade para plano com maior retenção de dados",
      );
    }

    return {
      isCompliant: violations.length === 0,
      violations,
      recommendations,
    };
  }

  // ================================================
  // UPGRADE RECOMMENDATIONS
  // ================================================

  /**
   * Gets upgrade recommendations for accessing missing features
   */
  getUpgradeRecommendations(desiredFeatures: AIFeatureCode[]): {
    currentPlan: SubscriptionTier;
    recommendedPlan: SubscriptionTier | null;
    missingFeatures: AIFeatureCode[];
    additionalBenefits: string[];
    costDifference?: string;
  } {
    const missingFeatures = desiredFeatures.filter((feature) => !this.hasFeature(feature),
    );

    if (missingFeatures.length === 0) {
      return {
        currentPlan: this._tier,
        recommendedPlan: null,
        missingFeatures: [],
        additionalBenefits: [],
      };
    }

    // Find the lowest tier that includes all desired features
    const tiers: SubscriptionTier[] = ["free", "trial", "pro", "enterprise"];
    const currentIndex = tiers.indexOf(this._tier);

    let recommendedPlan: SubscriptionTier | null = null;
    for (let i = currentIndex + 1; i < tiers.length; i++) {
      const tier = tiers[i];
      const plan = new Plan(tier);

      if (desiredFeatures.every((feature) => plan.hasFeature(feature))) {
        recommendedPlan = tier;
        break;
      }
    }

    // Calculate additional benefits
    const additionalBenefits: string[] = [];
    if (recommendedPlan) {
      const upgradePlan = new Plan(recommendedPlan);

      if (upgradePlan.monthlyQueryLimit > this.monthlyQueryLimit) {
        additionalBenefits.push(
          `Mais consultas mensais (${upgradePlan.monthlyQueryLimit === -1 ? "ilimitadas" : upgradePlan.monthlyQueryLimit})`,
        );
      }

      if (upgradePlan.availableModels.length > this.availableModels.length) {
        additionalBenefits.push("Acesso a modelos AI mais avançados");
      }

      if (upgradePlan.hasPrioritySupport && !this.hasPrioritySupport) {
        additionalBenefits.push("Suporte prioritário");
      }

      if (
        upgradePlan.hasLgpdEnhancedFeatures &&
        !this.hasLgpdEnhancedFeatures
      ) {
        additionalBenefits.push("Recursos LGPD avançados");
      }
    }

    return {
      currentPlan: this._tier,
      recommendedPlan,
      missingFeatures,
      additionalBenefits,
      costDifference: recommendedPlan
        ? `Consulte valores no painel de configurações`
        : undefined,
    };
  }

  // ================================================
  // SERIALIZATION
  // ================================================

  /**
   * Converts plan to a serializable object
   */
  toJSON(): SubscriptionPlan {
    return {
      planCode: this._tier,
      planName: this.displayName,
      planDescription: this.description,
      cfmComplianceLevel: this.cfmComplianceLevel,
      anvisaCertified: this.isAnvisaCertified,
      lgpdEnhancedFeatures: this.hasLgpdEnhancedFeatures,
      monthlyQueryLimit: this.monthlyQueryLimit,
      dailyRateLimit: this.dailyRateLimit,
      concurrentRequests: this.concurrentRequests,
      maxTokensPerRequest: this.maxTokensPerRequest,
      maxClinics: this.maxClinics,
      costBudgetUsdMonthly: this.costBudgetUsdMonthly,
      costPer1kTokens: 0, // This would be calculated based on usage
      features: {
        aiChatBasic: this.hasFeature("ai_chat_basic"),
        aiChatAdvanced: this.hasFeature("ai_chat_advanced"),
        aiAnalytics: this.hasFeature("ai_analytics"),
        aiInsights: this.hasFeature("ai_insights"),
        aiPredictions: this.hasFeature("ai_predictions"),
        customModelsAccess: this.hasFeature("custom_models"),
        prioritySupport: this.hasFeature("priority_support"),
      },
      dataRetentionDays: this.dataRetentionDays,
      anonymizationRequired: this._tier === "free", // Free tier requires anonymization
      auditTrailEnhanced: this.hasEnhancedAuditTrail,
      active: this.isActive,
      sortOrder:
        this._tier === "free"
          ? 1
          : this._tier === "trial"
            ? 2
            : this._tier === "pro"
              ? 3
              : 4,
    };
  }

  /**
   * Creates a Plan instance from a tier
   */
  static fromTier(tier: SubscriptionTier): Plan {
    return new Plan(tier);
  }

  /**
   * Gets all available plans
   */
  static getAllPlans(): Plan[] {
    return (["free", "trial", "pro", "enterprise"] as SubscriptionTier[]).map((tier) => new Plan(tier),
    );
  }

  /**
   * Finds a plan by tier with validation
   */
  static findByTier(tier: SubscriptionTier): Plan | null {
    try {
      return new Plan(tier);
    } catch {
      return null;
    }
  }
}
