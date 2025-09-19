// Enhanced Multi-Model AI Assistant Recommendation Model
// Brazilian Healthcare Compliance: AI-driven recommendations for optimization
// Handles plan upgrades, cost optimization, and feature suggestions
// Date: 2025-09-19

import type {
  SubscriptionTier,
  EnhancedAIModel,
  AIFeatureCode,
  BillingMetrics,
  MedicalSpecialty,
} from '@neonpro/types';
import { Plan } from './plan';
import { UserPlan } from './user-plan';
import { UsageCounter } from './usage-counter';

// ================================================
// RECOMMENDATION INTERFACES
// ================================================

/**
 * Base recommendation interface
 */
export interface BaseRecommendation {
  readonly id: string;
  readonly type: 'plan_upgrade' | 'cost_optimization' | 'feature_suggestion' | 'model_optimization' | 'compliance_improvement';
  readonly priority: 'low' | 'medium' | 'high' | 'critical';
  readonly title: string;
  readonly description: string;
  readonly estimatedImpact: string;
  readonly implementationEffort: 'baixo' | 'médio' | 'alto';
  readonly category: 'cost' | 'performance' | 'compliance' | 'features' | 'usage';
  readonly createdAt: Date;
  readonly validUntil?: Date;
  readonly dismissed: boolean;
}

/**
 * Plan upgrade recommendation
 */
export interface PlanUpgradeRecommendation extends BaseRecommendation {
  readonly type: 'plan_upgrade';
  readonly currentPlan: SubscriptionTier;
  readonly recommendedPlan: SubscriptionTier;
  readonly unlockingFeatures: AIFeatureCode[];
  readonly additionalModels: EnhancedAIModel[];
  readonly costDifferenceUsd: number;
  readonly projectedSavings?: number;
  readonly reason: 'quota_exceeded' | 'feature_access' | 'cost_optimization' | 'compliance_requirement';
}

/**
 * Cost optimization recommendation
 */
export interface CostOptimizationRecommendation extends BaseRecommendation {
  readonly type: 'cost_optimization';
  readonly optimizationType: 'model_selection' | 'caching_improvement' | 'usage_pattern' | 'plan_adjustment';
  readonly currentCostUsd: number;
  readonly projectedSavingsUsd: number;
  readonly savingsPercentage: number;
  readonly actionItems: string[];
  readonly modelSuggestions?: {
    current: EnhancedAIModel;
    suggested: EnhancedAIModel;
    costSavings: number;
  }[];
}

/**
 * Feature suggestion recommendation
 */
export interface FeatureSuggestionRecommendation extends BaseRecommendation {
  readonly type: 'feature_suggestion';
  readonly suggestedFeatures: AIFeatureCode[];
  readonly useCases: string[];
  readonly businessValue: string;
  readonly prerequisites: string[];
  readonly relatedSpecialties?: MedicalSpecialty[];
}

/**
 * Model optimization recommendation
 */
export interface ModelOptimizationRecommendation extends BaseRecommendation {
  readonly type: 'model_optimization';
  readonly currentModel: EnhancedAIModel;
  readonly suggestedModel: EnhancedAIModel;
  readonly reason: 'cost_efficiency' | 'performance' | 'healthcare_optimized' | 'language_preference';
  readonly expectedImprovement: {
    costSavings?: number;
    performanceGain?: number;
    accuracyImprovement?: number;
  };
  readonly migrationComplexity: 'baixa' | 'média' | 'alta';
}

/**
 * Compliance improvement recommendation
 */
export interface ComplianceImprovementRecommendation extends BaseRecommendation {
  readonly type: 'compliance_improvement';
  readonly complianceArea: 'cfm' | 'anvisa' | 'lgpd' | 'audit_trail';
  readonly currentLevel: string;
  readonly recommendedLevel: string;
  readonly requirements: string[];
  readonly riskLevel: 'baixo' | 'médio' | 'alto' | 'crítico';
  readonly regulatoryImpact: string;
}

/**
 * Union type for all recommendation types
 */
export type Recommendation = 
  | PlanUpgradeRecommendation
  | CostOptimizationRecommendation
  | FeatureSuggestionRecommendation
  | ModelOptimizationRecommendation
  | ComplianceImprovementRecommendation;

// ================================================
// RECOMMENDATION CONTEXT
// ================================================

/**
 * Context data for generating recommendations
 */
export interface RecommendationContext {
  readonly userPlan: UserPlan;
  readonly usageCounter: UsageCounter;
  readonly billingMetrics: BillingMetrics;
  readonly recentActivity: {
    readonly requests: number;
    readonly errors: number;
    readonly averageLatency: number;
    readonly cacheHitRate: number;
  };
  readonly medicalSpecialties: MedicalSpecialty[];
  readonly complianceRequirements: {
    readonly cfmRequired: boolean;
    readonly anvisaRequired: boolean;
    readonly lgpdEnhanced: boolean;
  };
}

// ================================================
// RECOMMENDATION MODEL CLASS
// ================================================

/**
 * AI-driven recommendation system for multi-model AI assistant
 */
export class RecommendationModel {
  private readonly _context: RecommendationContext;
  private _recommendations: Map<string, Recommendation> = new Map();

  constructor(context: RecommendationContext) {
    this._context = context;
  }

  // ================================================
  // RECOMMENDATION GENERATION
  // ================================================

  /**
   * Generates all applicable recommendations based on current context
   */
  generateRecommendations(): Recommendation[] {
    this._recommendations.clear();

    // Generate different types of recommendations
    this.generatePlanUpgradeRecommendations();
    this.generateCostOptimizationRecommendations();
    this.generateFeatureSuggestionRecommendations();
    this.generateModelOptimizationRecommendations();
    this.generateComplianceImprovementRecommendations();

    // Sort by priority and return
    return Array.from(this._recommendations.values())
      .sort((a, b) => this.getPriorityScore(b.priority) - this.getPriorityScore(a.priority));
  }

  /**
   * Generates plan upgrade recommendations
   */
  private generatePlanUpgradeRecommendations(): void {
    const userPlan = this._context.userPlan;
    const quotaStatus = userPlan.getQuotaStatus();
    // usageInsights calculated for potential future use

    // Check if user is hitting quota limits
    if (quotaStatus.monthlyUsagePercentage > 90) {
      const upgrade = this.generateQuotaUpgradeRecommendation();
      if (upgrade) {
        this._recommendations.set(upgrade.id, upgrade);
      }
    }

    // Check if user needs advanced features
    if (this.shouldRecommendFeatureUpgrade()) {
      const featureUpgrade = this.generateFeatureUpgradeRecommendation();
      if (featureUpgrade) {
        this._recommendations.set(featureUpgrade.id, featureUpgrade);
      }
    }

    // Check for cost optimization through plan changes
    if (this._context.billingMetrics.cacheSavingsPercentage > 80 && userPlan.planCode === 'pro') {
      const costUpgrade = this.generateCostOptimizationUpgradeRecommendation();
      if (costUpgrade) {
        this._recommendations.set(costUpgrade.id, costUpgrade);
      }
    }
  }

  /**
   * Generates cost optimization recommendations
   */
  private generateCostOptimizationRecommendations(): void {
    const billingMetrics = this._context.billingMetrics;
    // usageInsights calculated for potential future use

    // Low cache hit rate optimization
    if (false /* usageInsights.efficiency.cacheOptimization < 50 */) {
      const cacheOptimization: CostOptimizationRecommendation = {
        id: `cost-cache-${Date.now()}`,
        type: 'cost_optimization',
        priority: 'high',
        title: 'Melhore a Taxa de Cache para Reduzir Custos',
        description: `Otimizar consultas similares pode reduzir custos em até 80%.`,
        estimatedImpact: `Economia potencial: $${(billingMetrics.totalCostUsd * 0.4).toFixed(2)}/mês`,
        implementationEffort: 'baixo',
        category: 'cost',
        optimizationType: 'caching_improvement',
        currentCostUsd: billingMetrics.totalCostUsd,
        projectedSavingsUsd: billingMetrics.totalCostUsd * 0.4,
        savingsPercentage: 40,
        actionItems: [
          'Revise consultas frequentes para reduzir variações desnecessárias',
          'Use templates padronizados para consultas comuns',
          'Configure cache semântico para especialidades médicas específicas',
        ],
        createdAt: new Date(),
        dismissed: false,
      };
      this._recommendations.set(cacheOptimization.id, cacheOptimization);
    }

    // Model selection optimization
    if (billingMetrics.averageCostPerRequest > 0.05) {
      const modelOptimization = this.generateModelCostOptimization();
      if (modelOptimization) {
        this._recommendations.set(modelOptimization.id, modelOptimization);
      }
    }
  }

  /**
   * Generates feature suggestion recommendations
   */
  private generateFeatureSuggestionRecommendations(): void {
    const userPlan = this._context.userPlan;
    const specialties = this._context.medicalSpecialties;

    // Advanced analytics for high-usage users
    if (!userPlan.plan.hasFeature('ai_analytics') && this._context.recentActivity.requests > 100) {
      const analyticsRecommendation: FeatureSuggestionRecommendation = {
        id: `feature-analytics-${Date.now()}`,
        type: 'feature_suggestion',
        priority: 'medium',
        title: 'Ative Analytics Avançado de IA',
        description: 'Com seu alto volume de uso, analytics avançado pode fornecer insights valiosos sobre padrões de consultas e otimizações.',
        estimatedImpact: 'Melhoria de 25-40% na eficiência das consultas',
        implementationEffort: 'baixo',
        category: 'features',
        suggestedFeatures: ['ai_analytics'],
        useCases: [
          'Análise de padrões de consultas por especialidade',
          'Identificação de oportunidades de otimização',
          'Métricas de performance por modelo de IA',
        ],
        businessValue: 'Maior ROI no uso de IA através de insights acionáveis',
        prerequisites: ['Upgrade para plano Pro ou superior'],
        relatedSpecialties: specialties,
        createdAt: new Date(),
        dismissed: false,
      };
      this._recommendations.set(analyticsRecommendation.id, analyticsRecommendation);
    }

    // API access for integration opportunities
    if (!userPlan.plan.hasFeature('api_access') && this.detectIntegrationOpportunity()) {
      const apiRecommendation = this.generateApiAccessRecommendation();
      if (apiRecommendation) {
        this._recommendations.set(apiRecommendation.id, apiRecommendation);
      }
    }
  }

  /**
   * Generates model optimization recommendations
   */
  private generateModelOptimizationRecommendations(): void {
    const insights = this._context.usageCounter.getUsageInsights();
    const preferredModels = insights.patterns.preferredModels;

    // Healthcare-optimized model recommendation
    if (this._context.medicalSpecialties.length > 0 && 
        !preferredModels.includes('healthcare-pt-br') &&
        this._context.userPlan.plan.hasModelAccess('healthcare-pt-br')) {
      
      const healthcareModelRec: ModelOptimizationRecommendation = {
        id: `model-healthcare-${Date.now()}`,
        type: 'model_optimization',
        priority: 'high',
        title: 'Use Modelo Otimizado para Saúde Brasileira',
        description: 'Detectamos uso em especialidades médicas. O modelo healthcare-pt-br oferece melhor precisão para contexto médico brasileiro.',
        estimatedImpact: 'Melhoria de 30% na precisão médica',
        implementationEffort: 'baixo',
        category: 'performance',
        currentModel: preferredModels[0] || 'gpt-4o',
        suggestedModel: 'healthcare-pt-br',
        reason: 'healthcare_optimized',
        expectedImprovement: {
          accuracyImprovement: 30,
          performanceGain: 15,
        },
        migrationComplexity: 'baixa',
        createdAt: new Date(),
        dismissed: false,
      };
      this._recommendations.set(healthcareModelRec.id, healthcareModelRec);
    }

    // Cost-efficient model recommendation
    if (this._context.billingMetrics.averageCostPerRequest > 0.03) {
      const costEfficientRec = this.generateCostEfficientModelRecommendation();
      if (costEfficientRec) {
        this._recommendations.set(costEfficientRec.id, costEfficientRec);
      }
    }
  }

  /**
   * Generates compliance improvement recommendations
   */
  private generateComplianceImprovementRecommendations(): void {
    const complianceReqs = this._context.complianceRequirements;
    const userPlan = this._context.userPlan;

    // CFM compliance recommendation
    if (complianceReqs.cfmRequired && userPlan.plan.cfmComplianceLevel === 'basic') {
      const cfmRec: ComplianceImprovementRecommendation = {
        id: `compliance-cfm-${Date.now()}`,
        type: 'compliance_improvement',
        priority: 'critical',
        title: 'Melhore Compliance CFM para Avançado',
        description: 'Suas atividades médicas requerem compliance CFM avançado conforme Resolução 2314/2022.',
        estimatedImpact: 'Conformidade total com regulamentações CFM',
        implementationEffort: 'médio',
        category: 'compliance',
        complianceArea: 'cfm',
        currentLevel: userPlan.plan.cfmComplianceLevel,
        recommendedLevel: 'advanced',
        requirements: [
          'Upgrade para plano Pro ou superior',
          'Configuração de auditoria médica avançada',
          'Treinamento em uso ético de IA médica',
        ],
        riskLevel: 'alto',
        regulatoryImpact: 'Não conformidade pode resultar em penalidades do CFM',
        createdAt: new Date(),
        dismissed: false,
      };
      this._recommendations.set(cfmRec.id, cfmRec);
    }

    // ANVISA compliance for specific specialties
    if (complianceReqs.anvisaRequired && !userPlan.plan.isAnvisaCertified) {
      const anvisaRec = this.generateAnvisaComplianceRecommendation();
      if (anvisaRec) {
        this._recommendations.set(anvisaRec.id, anvisaRec);
      }
    }

    // LGPD enhanced features
    if (complianceReqs.lgpdEnhanced && !userPlan.plan.hasLgpdEnhancedFeatures) {
      const lgpdRec = this.generateLgpdEnhancementRecommendation();
      if (lgpdRec) {
        this._recommendations.set(lgpdRec.id, lgpdRec);
      }
    }
  }

  // ================================================
  // RECOMMENDATION HELPERS
  // ================================================

  private generateQuotaUpgradeRecommendation(): PlanUpgradeRecommendation | null {
    const userPlan = this._context.userPlan;
    const nextTier = this.getNextTier(userPlan.planCode);
    
    if (!nextTier) return null;

    const nextPlan = new Plan(nextTier);
    const costDifference = this.estimatePlanCostDifference(userPlan.planCode, nextTier);

    return {
      id: `upgrade-quota-${Date.now()}`,
      type: 'plan_upgrade',
      priority: 'high',
      title: 'Upgrade Recomendado - Limite de Uso Atingido',
      description: `Você utilizou mais de 90% da sua cota mensal. O plano ${nextPlan.displayName} oferece ${nextPlan.isUnlimited ? 'uso ilimitado' : `${nextPlan.monthlyQueryLimit} consultas/mês`}.`,
      estimatedImpact: `${nextPlan.isUnlimited ? 'Uso ilimitado' : `${nextPlan.monthlyQueryLimit - userPlan.plan.monthlyQueryLimit} consultas adicionais/mês`}`,
      implementationEffort: 'baixo',
      category: 'usage',
      currentPlan: userPlan.planCode,
      recommendedPlan: nextTier,
      unlockingFeatures: nextPlan.availableFeatures.filter(f => !userPlan.plan.hasFeature(f)),
      additionalModels: nextPlan.availableModels.filter(m => !userPlan.plan.hasModelAccess(m)),
      costDifferenceUsd: costDifference,
      reason: 'quota_exceeded',
      createdAt: new Date(),
      dismissed: false,
    };
  }

  private generateFeatureUpgradeRecommendation(): PlanUpgradeRecommendation | null {
    const userPlan = this._context.userPlan;
    const missingFeatures = this.identifyMissingBeneficialFeatures();
    
    if (missingFeatures.length === 0) return null;

    const nextTier = this.getNextTier(userPlan.planCode);
    if (!nextTier) return null;

    const nextPlan = new Plan(nextTier);
    const costDifference = this.estimatePlanCostDifference(userPlan.planCode, nextTier);

    return {
      id: `upgrade-features-${Date.now()}`,
      type: 'plan_upgrade',
      priority: 'medium',
      title: 'Desbloqueie Recursos Avançados de IA',
      description: `Baseado no seu uso, recursos como ${missingFeatures.slice(0, 2).join(', ')} podem aumentar sua produtividade.`,
      estimatedImpact: 'Aumento de 40-60% na eficiência operacional',
      implementationEffort: 'baixo',
      category: 'features',
      currentPlan: userPlan.planCode,
      recommendedPlan: nextTier,
      unlockingFeatures: missingFeatures,
      additionalModels: nextPlan.availableModels.filter(m => !userPlan.plan.hasModelAccess(m)),
      costDifferenceUsd: costDifference,
      reason: 'feature_access',
      createdAt: new Date(),
      dismissed: false,
    };
  }

  private generateCostOptimizationUpgradeRecommendation(): PlanUpgradeRecommendation | null {
    const userPlan = this._context.userPlan;
    const billingMetrics = this._context.billingMetrics;
    
    // If user has high cache savings, enterprise plan might be more cost-effective
    if (userPlan.planCode === 'pro' && billingMetrics.cacheSavingsPercentage > 80) {
      const enterprisePlan = new Plan('enterprise');
      const projectedSavings = billingMetrics.totalCostUsd * 0.2; // 20% additional savings on enterprise

      return {
        id: `upgrade-cost-${Date.now()}`,
        type: 'plan_upgrade',
        priority: 'medium',
        title: 'Economize Mais com Plano Empresarial',
        description: 'Seu alto aproveitamento de cache indica que o plano Empresarial pode ser mais econômico a longo prazo.',
        estimatedImpact: `Economia adicional de $${projectedSavings.toFixed(2)}/mês`,
        implementationEffort: 'baixo',
        category: 'cost',
        currentPlan: userPlan.planCode,
        recommendedPlan: 'enterprise',
        unlockingFeatures: enterprisePlan.availableFeatures.filter(f => !userPlan.plan.hasFeature(f)),
        additionalModels: enterprisePlan.availableModels.filter(m => !userPlan.plan.hasModelAccess(m)),
        costDifferenceUsd: this.estimatePlanCostDifference('pro', 'enterprise'),
        projectedSavings,
        reason: 'cost_optimization',
        createdAt: new Date(),
        dismissed: false,
      };
    }

    return null;
  }

  private generateModelCostOptimization(): CostOptimizationRecommendation | null {
    const billingMetrics = this._context.billingMetrics;
    // insights calculated for potential future use

    // Suggest cheaper models for simple queries
    const modelSuggestions = this.generateModelCostSuggestions();
    if (modelSuggestions.length === 0) return null;

    const totalSavings = modelSuggestions.reduce((sum, s) => sum + s.costSavings, 0);

    return {
      id: `cost-model-${Date.now()}`,
      type: 'cost_optimization',
      priority: 'medium',
      title: 'Otimize Seleção de Modelos para Reduzir Custos',
      description: 'Análise sugere que modelos mais econômicos podem atender muitas de suas consultas mantendo qualidade.',
      estimatedImpact: `Economia de até $${totalSavings.toFixed(2)}/mês`,
      implementationEffort: 'médio',
      category: 'cost',
      optimizationType: 'model_selection',
      currentCostUsd: billingMetrics.totalCostUsd,
      projectedSavingsUsd: totalSavings,
      savingsPercentage: (totalSavings / billingMetrics.totalCostUsd) * 100,
      actionItems: [
        'Configure roteamento inteligente de modelos',
        'Use modelos econômicos para consultas simples',
        'Reserve modelos premium para casos complexos',
      ],
      modelSuggestions,
      createdAt: new Date(),
      dismissed: false,
    };
  }

  private generateApiAccessRecommendation(): FeatureSuggestionRecommendation | null {
    return {
      id: `feature-api-${Date.now()}`,
      type: 'feature_suggestion',
      priority: 'medium',
      title: 'Acesso à API para Integração Personalizada',
      description: 'Seu padrão de uso sugere benefícios de integração direta com sistemas clínicos existentes.',
      estimatedImpact: 'Automação de 60-80% das consultas rotineiras',
      implementationEffort: 'médio',
      category: 'features',
      suggestedFeatures: ['api_access'],
      useCases: [
        'Integração com sistema de prontuário eletrônico',
        'Automatização de triagem inicial',
        'Análise em lote de dados clínicos',
      ],
      businessValue: 'Redução significativa no tempo de processos manuais',
      prerequisites: ['Upgrade para plano Pro ou superior', 'Equipe técnica para implementação'],
      createdAt: new Date(),
      dismissed: false,
    };
  }

  private generateCostEfficientModelRecommendation(): ModelOptimizationRecommendation | null {
    const insights = this._context.usageCounter.getUsageInsights();
    const currentModel = insights.patterns.preferredModels[0];
    if (!currentModel) return null;

    // Suggest downgrading to more cost-effective model
    const suggestedModel: EnhancedAIModel = currentModel === 'gpt-4o' ? 'gpt-4o-mini' : 
                                           currentModel === 'claude-3.5-sonnet' ? 'gpt-4o' : 
                                           'gemini-pro';

    const costSavings = this._context.billingMetrics.averageCostPerRequest * 0.4 * this._context.recentActivity.requests;

    return {
      id: `model-cost-${Date.now()}`,
      type: 'model_optimization',
      priority: 'medium',
      title: 'Use Modelo Mais Econômico para Consultas Simples',
      description: `O modelo ${suggestedModel} pode atender a maioria de suas consultas com 60% menos custo.`,
      estimatedImpact: `Economia de $${costSavings.toFixed(2)}/mês`,
      implementationEffort: 'baixo',
      category: 'cost',
      currentModel,
      suggestedModel,
      reason: 'cost_efficiency',
      expectedImprovement: {
        costSavings,
      },
      migrationComplexity: 'baixa',
      createdAt: new Date(),
      dismissed: false,
    };
  }

  private generateAnvisaComplianceRecommendation(): ComplianceImprovementRecommendation | null {
    return {
      id: `compliance-anvisa-${Date.now()}`,
      type: 'compliance_improvement',
      priority: 'critical',
      title: 'Certificação ANVISA Requerida',
      description: 'Especialidades médicas detectadas requerem certificação ANVISA para uso de IA como dispositivo médico.',
      estimatedImpact: 'Conformidade regulatória completa',
      implementationEffort: 'alto',
      category: 'compliance',
      complianceArea: 'anvisa',
      currentLevel: 'não certificado',
      recommendedLevel: 'certificado',
      requirements: [
        'Upgrade para plano certificado pela ANVISA',
        'Implementação de sistema de qualidade',
        'Documentação de processos clínicos',
        'Auditoria de segurança médica',
      ],
      riskLevel: 'crítico',
      regulatoryImpact: 'Uso sem certificação pode violar regulamentações sanitárias',
      createdAt: new Date(),
      dismissed: false,
    };
  }

  private generateLgpdEnhancementRecommendation(): ComplianceImprovementRecommendation | null {
    return {
      id: `compliance-lgpd-${Date.now()}`,
      type: 'compliance_improvement',
      priority: 'high',
      title: 'Recursos LGPD Avançados Recomendados',
      description: 'Para conformidade total com LGPD, recursos avançados de proteção de dados são recomendados.',
      estimatedImpact: 'Proteção completa de dados pessoais',
      implementationEffort: 'médio',
      category: 'compliance',
      complianceArea: 'lgpd',
      currentLevel: 'básico',
      recommendedLevel: 'avançado',
      requirements: [
        'Upgrade para plano com LGPD avançado',
        'Configuração de consentimento granular',
        'Implementação de anonimização automática',
        'Auditoria de fluxo de dados',
      ],
      riskLevel: 'médio',
      regulatoryImpact: 'Melhor conformidade com LGPD reduz riscos legais',
      createdAt: new Date(),
      dismissed: false,
    };
  }

  // ================================================
  // UTILITY METHODS
  // ================================================

  private getPriorityScore(priority: BaseRecommendation['priority']): number {
    const scores = { critical: 4, high: 3, medium: 2, low: 1 };
    return scores[priority];
  }

  private getNextTier(currentTier: SubscriptionTier): SubscriptionTier | null {
    const tiers: SubscriptionTier[] = ['free', 'trial', 'pro', 'enterprise'];
    const currentIndex = tiers.indexOf(currentTier);
    return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
  }

  private estimatePlanCostDifference(currentTier: SubscriptionTier, targetTier: SubscriptionTier): number {
    // This would integrate with actual pricing data
    const pricing = { free: 0, trial: 0, pro: 49, enterprise: 199 };
    return pricing[targetTier] - pricing[currentTier];
  }

  private shouldRecommendFeatureUpgrade(): boolean {
    return this._context.recentActivity.requests > 50 || 
           this._context.medicalSpecialties.length > 2 ||
           this._context.billingMetrics.totalRequests > 200;
  }

  private identifyMissingBeneficialFeatures(): AIFeatureCode[] {
    const userPlan = this._context.userPlan;
    const beneficial: AIFeatureCode[] = [];

    if (!userPlan.plan.hasFeature('ai_analytics') && this._context.recentActivity.requests > 100) {
      beneficial.push('ai_analytics');
    }

    if (!userPlan.plan.hasFeature('api_access') && this.detectIntegrationOpportunity()) {
      beneficial.push('api_access');
    }

    if (!userPlan.plan.hasFeature('lgpd_advanced') && this._context.medicalSpecialties.length > 0) {
      beneficial.push('lgpd_advanced');
    }

    return beneficial;
  }

  private detectIntegrationOpportunity(): boolean {
    return this._context.recentActivity.requests > 200 ||
           this._context.usageCounter.getUsageInsights().patterns.peakHours.length > 8;
  }

  private generateModelCostSuggestions(): Array<{
    current: EnhancedAIModel;
    suggested: EnhancedAIModel;
    costSavings: number;
  }> {
    const insights = this._context.usageCounter.getUsageInsights();
    const suggestions: Array<{
      current: EnhancedAIModel;
      suggested: EnhancedAIModel;
      costSavings: number;
    }> = [];

    for (const model of insights.patterns.preferredModels) {
      let suggested: EnhancedAIModel | null = null;
      let savingsMultiplier = 0;

      if (model === 'gpt-4o') {
        suggested = 'gpt-4o-mini';
        savingsMultiplier = 0.6;
      } else if (model === 'claude-3.5-sonnet') {
        suggested = 'gpt-4o';
        savingsMultiplier = 0.4;
      }

      if (suggested) {
        const monthlyCost = this._context.billingMetrics.totalCostUsd;
        const modelUsagePercentage = 0.4; // Estimate 40% usage for this model
        const costSavings = monthlyCost * modelUsagePercentage * savingsMultiplier;

        suggestions.push({
          current: model,
          suggested,
          costSavings,
        });
      }
    }

    return suggestions;
  }

  // ================================================
  // PUBLIC METHODS
  // ================================================

  /**
   * Gets recommendations by type
   */
  getRecommendationsByType<T extends Recommendation['type']>(type: T): Array<Extract<Recommendation, { type: T }>> {
    return Array.from(this._recommendations.values())
      .filter((rec): rec is Extract<Recommendation, { type: T }> => rec.type === type);
  }

  /**
   * Gets recommendations by priority
   */
  getRecommendationsByPriority(priority: BaseRecommendation['priority']): Recommendation[] {
    return Array.from(this._recommendations.values())
      .filter(rec => rec.priority === priority);
  }

  /**
   * Gets active (non-dismissed) recommendations
   */
  getActiveRecommendations(): Recommendation[] {
    return Array.from(this._recommendations.values())
      .filter(rec => !rec.dismissed && (!rec.validUntil || rec.validUntil > new Date()));
  }

  /**
   * Dismisses a recommendation
   */
  dismissRecommendation(id: string): boolean {
    const recommendation = this._recommendations.get(id);
    if (recommendation) {
      this._recommendations.set(id, { ...recommendation, dismissed: true });
      return true;
    }
    return false;
  }

  /**
   * Gets summary of recommendations
   */
  getSummary(): {
    total: number;
    byPriority: Record<BaseRecommendation['priority'], number>;
    byCategory: Record<BaseRecommendation['category'], number>;
    totalPotentialSavings: number;
  } {
    const recommendations = this.getActiveRecommendations();
    
    const byPriority: Record<BaseRecommendation['priority'], number> = {
      critical: 0, high: 0, medium: 0, low: 0
    };
    
    const byCategory: Record<BaseRecommendation['category'], number> = {
      cost: 0, performance: 0, compliance: 0, features: 0, usage: 0
    };

    let totalPotentialSavings = 0;

    for (const rec of recommendations) {
      byPriority[rec.priority]++;
      byCategory[rec.category]++;

      // Calculate potential savings
      if (rec.type === 'cost_optimization') {
        totalPotentialSavings += rec.projectedSavingsUsd;
      } else if (rec.type === 'plan_upgrade' && rec.projectedSavings) {
        totalPotentialSavings += rec.projectedSavings;
      }
    }

    return {
      total: recommendations.length,
      byPriority,
      byCategory,
      totalPotentialSavings,
    };
  }

  /**
   * Converts to serializable object
   */
  toJSON(): {
    context: RecommendationContext;
    recommendations: Recommendation[];
    summary: ReturnType<RecommendationModel['getSummary']>;
  } {
    return {
      context: this._context,
      recommendations: this.getActiveRecommendations(),
      summary: this.getSummary(),
    };
  }

  /**
   * Creates RecommendationModel from context
   */
  static fromContext(context: RecommendationContext): RecommendationModel {
    return new RecommendationModel(context);
  }
}