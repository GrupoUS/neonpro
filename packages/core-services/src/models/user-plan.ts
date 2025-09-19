// Enhanced Multi-Model AI Assistant UserPlan Model
// Brazilian Healthcare Compliance: LGPD, CFM, ANVISA
// User subscription management with usage tracking and billing
// Date: 2025-09-19

import type {
  SubscriptionTier,
  SubscriptionStatus,
  UserSubscription,
  QuotaStatus,
  AuditTrail,
} from '@neonpro/types';
import { Plan } from './plan';
import { calculateQuotaStatus, createQuotaAuditTrail } from '@neonpro/config/quotas';

// ================================================
// USER PLAN MODEL CLASS
// ================================================

/**
 * Business model for user subscription management
 * Handles subscription lifecycle, usage tracking, and billing compliance
 */
export class UserPlan {
  private readonly _subscription: UserSubscription;
  private readonly _plan: Plan;
  private _currentUsage: {
    monthlyQueries: number;
    dailyQueries: number;
    currentCostUsd: number;
    concurrentRequests: number;
  };

  constructor(subscription: UserSubscription, currentUsage?: {
    monthlyQueries: number;
    dailyQueries: number;
    currentCostUsd: number;
    concurrentRequests: number;
  }) {
    this._subscription = subscription;
    this._plan = new Plan(subscription.planCode);
    this._currentUsage = currentUsage || {
      monthlyQueries: subscription.currentMonthQueries || 0,
      dailyQueries: 0,
      currentCostUsd: subscription.currentMonthCostUsd || 0,
      concurrentRequests: 0,
    };
  }

  // ================================================
  // BASIC PROPERTIES
  // ================================================

  get id(): string {
    return this._subscription.id;
  }

  get clinicId(): string {
    return this._subscription.clinicId;
  }

  get userId(): string {
    return this._subscription.userId;
  }

  get planCode(): SubscriptionTier {
    return this._subscription.planCode;
  }

  get plan(): Plan {
    return this._plan;
  }

  get status(): SubscriptionStatus {
    return this._subscription.status;
  }

  get isActive(): boolean {
    return this._subscription.status === 'active';
  }

  get isTrial(): boolean {
    return this._subscription.status === 'trial' || this._subscription.planCode === 'trial';
  }

  // ================================================
  // SUBSCRIPTION LIFECYCLE
  // ================================================

  get subscriptionStart(): Date {
    return this._subscription.subscriptionStart;
  }

  get subscriptionEnd(): Date | null {
    return this._subscription.subscriptionEnd || null;
  }

  get autoRenew(): boolean {
    return this._subscription.autoRenew;
  }

  get trialEndDate(): Date | null {
    return this._subscription.trialEndDate || null;
  }

  get daysUntilExpiry(): number | null {
    const endDate = this.subscriptionEnd || this.trialEndDate;
    if (!endDate) return null;
    
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get isExpired(): boolean {
    const endDate = this.subscriptionEnd || this.trialEndDate;
    if (!endDate) return false;
    
    return new Date() > endDate;
  }

  get isExpiringSoon(): boolean {
    const days = this.daysUntilExpiry;
    return days !== null && days <= 7 && days > 0;
  }

  // ================================================
  // USAGE TRACKING
  // ================================================

  get currentMonthQueries(): number {
    return this._currentUsage.monthlyQueries;
  }

  get currentDayQueries(): number {
    return this._currentUsage.dailyQueries;
  }

  get currentMonthCostUsd(): number {
    return this._currentUsage.currentCostUsd;
  }

  get currentConcurrentRequests(): number {
    return this._currentUsage.concurrentRequests;
  }

  get lastUsageReset(): Date {
    return this._subscription.lastUsageReset;
  }

  /**
   * Gets current quota status
   */
  getQuotaStatus(): QuotaStatus {
    return calculateQuotaStatus(this._subscription.planCode, this._currentUsage);
  }

  /**
   * Checks if user can make a new request
   */
  canMakeRequest(requestCostUsd: number = 0): {
    canMake: boolean;
    reason?: string;
    quotaStatus: QuotaStatus;
  } {
    if (!this.isActive) {
      return {
        canMake: false,
        reason: `Assinatura inativa: ${this._subscription.status}`,
        quotaStatus: this.getQuotaStatus(),
      };
    }

    if (this.isExpired) {
      return {
        canMake: false,
        reason: 'Assinatura expirada',
        quotaStatus: this.getQuotaStatus(),
      };
    }

    const quotaStatus = this.getQuotaStatus();
    
    if (!quotaStatus.canMakeRequest) {
      let reason = 'Limite de uso excedido: ';
      if (quotaStatus.monthlyQuotaRemaining <= 0) {
        reason += 'cota mensal esgotada';
      } else if (quotaStatus.dailyQuotaRemaining <= 0) {
        reason += 'limite diário esgotado';
      } else if (quotaStatus.costBudgetRemaining < requestCostUsd) {
        reason += 'orçamento mensal esgotado';
      }
      
      return {
        canMake: false,
        reason,
        quotaStatus,
      };
    }

    return {
      canMake: true,
      quotaStatus,
    };
  }

  // ================================================
  // USAGE UPDATES
  // ================================================

  /**
   * Records a new AI request usage
   */
  recordUsage(usage: {
    tokens: number;
    costUsd: number;
    concurrent?: boolean;
  }): AuditTrail {
    if (usage.concurrent) {
      this._currentUsage.concurrentRequests++;
    }
    
    this._currentUsage.monthlyQueries++;
    this._currentUsage.dailyQueries++;
    this._currentUsage.currentCostUsd += usage.costUsd;

    return createQuotaAuditTrail(
      'usage_recorded',
      this._subscription.userId,
      {
        planCode: this._subscription.planCode,
        tokens: usage.tokens,
        costUsd: usage.costUsd,
        newMonthlyTotal: this._currentUsage.monthlyQueries,
        newCostTotal: this._currentUsage.currentCostUsd,
      }
    );
  }

  /**
   * Completes a concurrent request
   */
  completeRequest(): void {
    if (this._currentUsage.concurrentRequests > 0) {
      this._currentUsage.concurrentRequests--;
    }
  }

  /**
   * Resets daily usage counters
   */
  resetDailyUsage(): AuditTrail {
    const previousDaily = this._currentUsage.dailyQueries;
    this._currentUsage.dailyQueries = 0;

    return createQuotaAuditTrail(
      'daily_quota_reset',
      this._subscription.userId,
      {
        planCode: this._subscription.planCode,
        previousDailyQueries: previousDaily,
        resetDate: new Date().toISOString(),
      }
    );
  }

  /**
   * Resets monthly usage counters
   */
  resetMonthlyUsage(): AuditTrail {
    const previousMonthly = this._currentUsage.monthlyQueries;
    const previousCost = this._currentUsage.currentCostUsd;
    
    this._currentUsage.monthlyQueries = 0;
    this._currentUsage.currentCostUsd = 0;
    this._currentUsage.dailyQueries = 0;

    return createQuotaAuditTrail(
      'monthly_quota_reset',
      this._subscription.userId,
      {
        planCode: this._subscription.planCode,
        previousMonthlyQueries: previousMonthly,
        previousCostUsd: previousCost,
        resetDate: new Date().toISOString(),
      }
    );
  }

  // ================================================
  // BILLING INFORMATION
  // ================================================

  get billingEmail(): string | null {
    return this._subscription.billingEmail || null;
  }

  get paymentMethodId(): string | null {
    return this._subscription.paymentMethodId || null;
  }

  get nextBillingDate(): Date | null {
    return this._subscription.nextBillingDate || null;
  }

  get billingConsentId(): string | null {
    return this._subscription.billingConsentId || null;
  }

  get hasMarketingConsent(): boolean {
    return this._subscription.marketingConsent;
  }

  // ================================================
  // PLAN OPERATIONS
  // ================================================

  /**
   * Checks if upgrade is available and beneficial
   */
  canUpgradeTo(targetTier: SubscriptionTier): {
    canUpgrade: boolean;
    benefits: string[];
    estimatedCostSavings?: string;
    warnings: string[];
  } {
    if (targetTier === this._subscription.planCode) {
      return {
        canUpgrade: false,
        benefits: [],
        warnings: ['Você já está neste plano'],
      };
    }

    const targetPlan = new Plan(targetTier);
    const benefits: string[] = [];
    const warnings: string[] = [];

    // Check feature benefits
    for (const feature of targetPlan.availableFeatures) {
      if (!this._plan.hasFeature(feature)) {
        benefits.push(`Nova funcionalidade: ${feature}`);
      }
    }

    // Check model benefits
    for (const model of targetPlan.availableModels) {
      if (!this._plan.hasModelAccess(model)) {
        benefits.push(`Acesso ao modelo: ${model}`);
      }
    }

    // Check usage benefits
    if (targetPlan.monthlyQueryLimit > this._plan.monthlyQueryLimit) {
      benefits.push(`Mais consultas mensais: ${targetPlan.monthlyQueryLimit === -1 ? 'ilimitadas' : targetPlan.monthlyQueryLimit}`);
    }

    // Check for warnings
    if (this.isExpiringSoon) {
      warnings.push('Assinatura atual expira em breve');
    }

    if (this._currentUsage.monthlyQueries > this._plan.monthlyQueryLimit * 0.8) {
      warnings.push('Uso elevado detectado - upgrade recomendado');
    }

    return {
      canUpgrade: true,
      benefits,
      warnings,
      estimatedCostSavings: benefits.length > 0 ? 'Consulte o painel de preços' : undefined,
    };
  }

  /**
   * Simulates plan change effects
   */
  simulatePlanChange(newTier: SubscriptionTier): {
    newLimits: {
      monthlyQueries: number;
      dailyRateLimit: number;
      costBudgetUsd: number;
    };
    impactOnCurrentUsage: {
      willExceedLimits: boolean;
      issues: string[];
    };
    complianceChanges: {
      cfmLevel: string;
      anvisaStatus: boolean;
      lgpdEnhanced: boolean;
    };
  } {
    const newPlan = new Plan(newTier);
    const issues: string[] = [];

    // Check if current usage exceeds new plan limits
    if (newPlan.monthlyQueryLimit !== -1 && this._currentUsage.monthlyQueries > newPlan.monthlyQueryLimit) {
      issues.push(`Uso mensal atual (${this._currentUsage.monthlyQueries}) excede novo limite (${newPlan.monthlyQueryLimit})`);
    }

    if (this._currentUsage.currentCostUsd > newPlan.costBudgetUsdMonthly) {
      issues.push(`Custo mensal atual ($${this._currentUsage.currentCostUsd}) excede novo orçamento ($${newPlan.costBudgetUsdMonthly})`);
    }

    return {
      newLimits: {
        monthlyQueries: newPlan.monthlyQueryLimit,
        dailyRateLimit: newPlan.dailyRateLimit,
        costBudgetUsd: newPlan.costBudgetUsdMonthly,
      },
      impactOnCurrentUsage: {
        willExceedLimits: issues.length > 0,
        issues,
      },
      complianceChanges: {
        cfmLevel: newPlan.cfmComplianceLevel,
        anvisaStatus: newPlan.isAnvisaCertified,
        lgpdEnhanced: newPlan.hasLgpdEnhancedFeatures,
      },
    };
  }

  // ================================================
  // NOTIFICATIONS AND ALERTS
  // ================================================

  /**
   * Gets important notifications for the user
   */
  getNotifications(): Array<{
    type: 'info' | 'warning' | 'critical';
    title: string;
    message: string;
    actionRequired: boolean;
  }> {
    const notifications: Array<{
      type: 'info' | 'warning' | 'critical';
      title: string;
      message: string;
      actionRequired: boolean;
    }> = [];

    // Expiration warnings
    if (this.isExpired) {
      notifications.push({
        type: 'critical',
        title: 'Assinatura Expirada',
        message: 'Sua assinatura expirou. Renove para continuar usando os recursos de IA.',
        actionRequired: true,
      });
    } else if (this.isExpiringSoon) {
      const days = this.daysUntilExpiry!;
      notifications.push({
        type: 'warning',
        title: 'Assinatura Expirando',
        message: `Sua assinatura expira em ${days} dia${days > 1 ? 's' : ''}. Configure renovação automática.`,
        actionRequired: true,
      });
    }

    // Usage warnings
    const quotaStatus = this.getQuotaStatus();
    if (quotaStatus.monthlyUsagePercentage > 80) {
      notifications.push({
        type: quotaStatus.monthlyUsagePercentage > 95 ? 'critical' : 'warning',
        title: 'Limite de Uso',
        message: `Você usou ${quotaStatus.monthlyUsagePercentage.toFixed(1)}% da sua cota mensal.`,
        actionRequired: quotaStatus.monthlyUsagePercentage > 95,
      });
    }

    // Cost warnings
    const costPercentage = (this._currentUsage.currentCostUsd / this._plan.costBudgetUsdMonthly) * 100;
    if (costPercentage > 80) {
      notifications.push({
        type: costPercentage > 95 ? 'critical' : 'warning',
        title: 'Orçamento de IA',
        message: `Você usou ${costPercentage.toFixed(1)}% do seu orçamento mensal de IA.`,
        actionRequired: costPercentage > 95,
      });
    }

    // Trial notifications
    if (this.isTrial && this.trialEndDate) {
      const trialDays = this.daysUntilExpiry;
      if (trialDays !== null && trialDays <= 3) {
        notifications.push({
          type: 'warning',
          title: 'Trial Encerrando',
          message: `Seu período de trial encerra em ${trialDays} dia${trialDays > 1 ? 's' : ''}. Escolha um plano para continuar.`,
          actionRequired: true,
        });
      }
    }

    return notifications;
  }

  // ================================================
  // SERIALIZATION
  // ================================================

  /**
   * Converts UserPlan to a serializable object
   */
  toJSON(): UserSubscription & {
    planDetails: ReturnType<Plan['toJSON']>;
    quotaStatus: QuotaStatus;
    notifications: ReturnType<UserPlan['getNotifications']>;
  } {
    return {
      ...this._subscription,
      currentMonthQueries: this._currentUsage.monthlyQueries,
      currentMonthCostUsd: this._currentUsage.currentCostUsd,
      planDetails: this._plan.toJSON(),
      quotaStatus: this.getQuotaStatus(),
      notifications: this.getNotifications(),
    };
  }

  /**
   * Creates a UserPlan instance from subscription data
   */
  static fromSubscription(subscription: UserSubscription, currentUsage?: {
    monthlyQueries: number;
    dailyQueries: number;
    currentCostUsd: number;
    concurrentRequests: number;
  }): UserPlan {
    return new UserPlan(subscription, currentUsage);
  }

  /**
   * Creates a new trial subscription
   */
  static createTrial(clinicId: string, userId: string, trialDays: number = 30): UserPlan {
    const now = new Date();
    const trialEnd = new Date(now.getTime() + (trialDays * 24 * 60 * 60 * 1000));

    const subscription: UserSubscription = {
      id: `trial-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      clinicId,
      userId,
      planCode: 'trial',
      subscriptionStart: now,
      autoRenew: false,
      currentMonthQueries: 0,
      currentMonthCostUsd: 0,
      lastUsageReset: now,
      status: 'trial',
      trialEndDate: trialEnd,
      marketingConsent: false,
      createdAt: now,
      updatedAt: now,
    };

    return new UserPlan(subscription);
  }
}