// Enhanced Multi-Model AI Assistant Usage Counter Model
// Brazilian Healthcare Compliance: Real-time usage tracking and aggregation
// Handles usage metrics, cost calculations, and quota enforcement
// Date: 2025-09-19

import type {
  SubscriptionTier,
  EnhancedAIModel,
  AIUsageRecord,
  BillingMetrics,
  AuditTrail,
  MedicalSpecialty,
  AIProvider,
} from "@neonpro/types";
import { calculateRequestCost } from "@neonpro/config/quotas";

// ================================================
// USAGE COUNTER INTERFACES
// ================================================

/**
 * Real-time usage tracking for a specific user/clinic
 */
export interface UsageCounterData {
  readonly clinicId: string;
  readonly _userId: string;
  readonly planCode: SubscriptionTier;

  // Current period counters
  readonly monthlyQueries: number;
  readonly dailyQueries: number;
  readonly currentCostUsd: number;
  readonly concurrentRequests: number;

  // Historical aggregations
  readonly totalRequests: number;
  readonly totalCostUsd: number;
  readonly totalTokensUsed: number;
  readonly cacheSavingsUsd: number;

  // Performance metrics
  readonly averageLatencyMs: number;
  readonly cacheHitRate: number;
  readonly errorRate: number;

  // Period tracking
  readonly periodStart: Date;
  readonly lastActivity: Date;
  readonly lastReset: Date;
}

/**
 * Usage aggregation by time period
 */
export interface UsageAggregation {
  readonly period: "hour" | "day" | "week" | "month";
  readonly timestamp: Date;
  queries: number;
  costUsd: number;
  tokens: number;
  readonly uniqueUsers: number;
  readonly modelBreakdown: Record<EnhancedAIModel, number>;
  readonly specialtyBreakdown: Record<MedicalSpecialty, number>;
}

// ================================================
// USAGE COUNTER MODEL CLASS
// ================================================

/**
 * Real-time usage counter with LGPD compliance and healthcare tracking
 */
export class UsageCounter {
  private _data: UsageCounterData;
  private _recentRequests: AIUsageRecord[] = [];
  private _aggregations: Map<string, UsageAggregation> = new Map();

  constructor(data: UsageCounterData) {
    this._data = { ...data };
  }

  // ================================================
  // BASIC PROPERTIES
  // ================================================

  get clinicId(): string {
    return this._data.clinicId;
  }

  get userId(): string {
    return this._data._userId;
  }

  get planCode(): SubscriptionTier {
    return this._data.planCode;
  }

  get monthlyQueries(): number {
    return this._data.monthlyQueries;
  }

  get dailyQueries(): number {
    return this._data.dailyQueries;
  }

  get currentCostUsd(): number {
    return this._data.currentCostUsd;
  }

  get concurrentRequests(): number {
    return this._data.concurrentRequests;
  }

  get totalRequests(): number {
    return this._data.totalRequests;
  }

  get totalCostUsd(): number {
    return this._data.totalCostUsd;
  }

  get totalTokensUsed(): number {
    return this._data.totalTokensUsed;
  }

  get cacheSavingsUsd(): number {
    return this._data.cacheSavingsUsd;
  }

  get lastActivity(): Date {
    return this._data.lastActivity;
  }

  // ================================================
  // PERFORMANCE METRICS
  // ================================================

  get averageLatencyMs(): number {
    return this._data.averageLatencyMs;
  }

  get cacheHitRate(): number {
    return this._data.cacheHitRate;
  }

  get errorRate(): number {
    return this._data.errorRate;
  }

  get cacheSavingsPercentage(): number {
    if (this._data.totalCostUsd === 0) return 0;
    return (
      (this._data.cacheSavingsUsd /
        (this._data.totalCostUsd + this._data.cacheSavingsUsd)) *
      100
    );
  }

  get averageCostPerRequest(): number {
    if (this._data.totalRequests === 0) return 0;
    return this._data.totalCostUsd / this._data.totalRequests;
  }

  get averageTokensPerRequest(): number {
    if (this._data.totalRequests === 0) return 0;
    return this._data.totalTokensUsed / this._data.totalRequests;
  }

  // ================================================
  // USAGE RECORDING
  // ================================================

  /**
   * Records a new AI request usage with real-time aggregation
   */
  recordUsage(usage: {
    modelCode: EnhancedAIModel;
    inputTokens: number;
    outputTokens: number;
    latencyMs: number;
    cacheHit: boolean;
    medicalSpecialty?: MedicalSpecialty;
    sessionId?: string;
    error?: boolean;
  }): {
    usageRecord: AIUsageRecord;
    updatedCounters: UsageCounterData;
    costCalculation: {
      totalCost: number;
      cacheSavings: number;
      effectiveCost: number;
    };
  } {
    const now = new Date();
    const totalTokens = usage.inputTokens + usage.outputTokens;

    // Calculate cost
    const fullCost = calculateRequestCost(
      usage.modelCode,
      usage.inputTokens,
      usage.outputTokens,
      false,
    );
    const effectiveCost = usage.cacheHit ? fullCost * 0.1 : fullCost;
    const cacheSavings = usage.cacheHit ? fullCost * 0.9 : 0;

    // Create usage record
    const usageRecord: AIUsageRecord = {
      id: `usage-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      clinicId: this._data.clinicId,
      userId: this._data._userId,
      sessionId: usage.sessionId,
      modelCode: usage.modelCode,
      provider: this.getProviderForModel(usage.modelCode),
      requestType: "chat",
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      totalTokens,
      costUsd: effectiveCost,
      latencyMs: usage.latencyMs,
      cacheHit: usage.cacheHit,
      cacheSavingsUsd: cacheSavings,
      medicalSpecialty: usage.medicalSpecialty,
      patientInvolved: Boolean(usage.medicalSpecialty),
      diagnosisAssistance: this.isDiagnosisSpecialty(usage.medicalSpecialty),
      prescriptionInvolved: false, // Would be determined by content analysis
      patientDataProcessed: Boolean(usage.medicalSpecialty),
      anonymizationApplied: true, // Always apply for healthcare
      auditTrail: {
        action: "ai_request_processed",
        timestamp: now,
        userId: this._data._userId,
        consentStatus: "valid",
        dataProcessingPurpose: usage.medicalSpecialty
          ? "diagnosis"
          : "analytics",
        anonymizationLevel: "pseudonymized",
        metadata: {
          modelCode: usage.modelCode,
          tokens: totalTokens,
          cacheHit: usage.cacheHit,
        },
      },
      userSatisfactionScore: undefined,
      responseQualityScore: undefined,
      contentFiltered: false,
      safetyFlags: [],
      regulatoryFlags: this.getRegulatoryFlags(usage.medicalSpecialty),
      createdAt: now,
    };

    // Update counters
    this._data = {
      ...this._data,
      monthlyQueries: this._data.monthlyQueries + 1,
      dailyQueries: this._data.dailyQueries + 1,
      currentCostUsd: this._data.currentCostUsd + effectiveCost,
      totalRequests: this._data.totalRequests + 1,
      totalCostUsd: this._data.totalCostUsd + effectiveCost,
      totalTokensUsed: this._data.totalTokensUsed + totalTokens,
      cacheSavingsUsd: this._data.cacheSavingsUsd + cacheSavings,
      lastActivity: now,

      // Update performance metrics (rolling average)
      averageLatencyMs: this.updateRollingAverage(
        this._data.averageLatencyMs,
        usage.latencyMs,
        this._data.totalRequests,
      ),
      cacheHitRate: this.updateCacheHitRate(usage.cacheHit),
      errorRate: this.updateErrorRate(Boolean(usage.error)),
    };

    // Store recent request for analysis
    this._recentRequests.push(usageRecord);
    if (this._recentRequests.length > 100) {
      this._recentRequests = this._recentRequests.slice(-100); // Keep last 100 requests
    }

    // Update aggregations
    this.updateAggregations(usageRecord);

    return {
      usageRecord,
      updatedCounters: this._data,
      costCalculation: {
        totalCost: fullCost,
        cacheSavings,
        effectiveCost,
      },
    };
  }

  /**
   * Increments concurrent request counter
   */
  startConcurrentRequest(): void {
    this._data = {
      ...this._data,
      concurrentRequests: this._data.concurrentRequests + 1,
    };
  }

  /**
   * Decrements concurrent request counter
   */
  endConcurrentRequest(): void {
    this._data = {
      ...this._data,
      concurrentRequests: Math.max(0, this._data.concurrentRequests - 1),
    };
  }

  // ================================================
  // QUOTA MANAGEMENT
  // ================================================

  /**
   * Resets daily counters
   */
  resetDailyCounters(): AuditTrail {
    const previousDaily = this._data.dailyQueries;

    this._data = {
      ...this._data,
      dailyQueries: 0,
      lastReset: new Date(),
    };

    return {
      action: "daily_counters_reset",
      timestamp: new Date(),
      userId: this._data._userId,
      consentStatus: "valid",
      dataProcessingPurpose: "audit",
      anonymizationLevel: "none",
      metadata: {
        previousDailyQueries: previousDaily,
        planCode: this._data.planCode,
      },
    };
  }

  /**
   * Resets monthly counters
   */
  resetMonthlyCounters(): AuditTrail {
    const previousMonthly = this._data.monthlyQueries;
    const previousCost = this._data.currentCostUsd;

    this._data = {
      ...this._data,
      monthlyQueries: 0,
      dailyQueries: 0,
      currentCostUsd: 0,
      periodStart: new Date(),
      lastReset: new Date(),
    };

    return {
      action: "monthly_counters_reset",
      timestamp: new Date(),
      userId: this._data._userId,
      consentStatus: "valid",
      dataProcessingPurpose: "audit",
      anonymizationLevel: "none",
      metadata: {
        previousMonthlyQueries: previousMonthly,
        previousCostUsd: previousCost,
        planCode: this._data.planCode,
      },
    };
  }

  // ================================================
  // ANALYTICS AND INSIGHTS
  // ================================================

  /**
   * Gets usage patterns and insights
   */
  getUsageInsights(): {
    efficiency: {
      cacheOptimization: number; // 0-100 score
      costEfficiency: number; // 0-100 score
      performanceScore: number; // 0-100 score
    };
    patterns: {
      peakHours: number[];
      preferredModels: EnhancedAIModel[];
      commonSpecialties: MedicalSpecialty[];
    };
    recommendations: string[];
  } {
    const insights = {
      efficiency: {
        cacheOptimization: Math.min(100, this.cacheHitRate * 100),
        costEfficiency: Math.min(100, this.cacheSavingsPercentage),
        performanceScore: Math.max(0, 100 - this.averageLatencyMs / 50), // Lower latency = higher score
      },
      patterns: {
        peakHours: this.calculatePeakHours(),
        preferredModels: this.getPreferredModels(),
        commonSpecialties: this.getCommonSpecialties(),
      },
      recommendations: [] as string[],
    };

    // Generate recommendations
    if (insights.efficiency.cacheOptimization < 50) {
      insights.recommendations.push(
        "Otimize consultas para melhorar cache hit rate",
      );
    }

    if (insights.efficiency.costEfficiency < 30) {
      insights.recommendations.push(
        "Considere usar modelos mais econômicos para consultas simples",
      );
    }

    if (this.averageLatencyMs > 3000) {
      insights.recommendations.push(
        "Latência alta detectada - verifique configuração de rede",
      );
    }

    if (this._data.errorRate > 0.05) {
      insights.recommendations.push(
        "Taxa de erro elevada - revise integrações",
      );
    }

    return insights;
  }

  /**
   * Gets billing metrics for a specific period
   */
  getBillingMetrics(startDate: Date, endDate: Date): BillingMetrics {
    const relevantRequests = this._recentRequests.filter(
      (req) => req.createdAt >= startDate && req.createdAt <= endDate,
    );

    const totalCostUsd = relevantRequests.reduce(
      (sum, req) => sum + req.costUsd,
      0,
    );
    const totalTokens = relevantRequests.reduce(
      (sum, req) => sum + req.totalTokens,
      0,
    );
    const cacheSavingsUsd = relevantRequests.reduce(
      (sum, req) => sum + req.cacheSavingsUsd,
      0,
    );

    return {
      totalCostUsd,
      totalCostBrl: totalCostUsd * 5.2, // Approximate USD to BRL conversion
      totalTokens,
      totalRequests: relevantRequests.length,
      cacheSavingsUsd,
      cacheSavingsPercentage:
        totalCostUsd > 0
          ? (cacheSavingsUsd / (totalCostUsd + cacheSavingsUsd)) * 100
          : 0,
      averageCostPerRequest:
        relevantRequests.length > 0
          ? totalCostUsd / relevantRequests.length
          : 0,
      averageTokensPerRequest:
        relevantRequests.length > 0 ? totalTokens / relevantRequests.length : 0,
      period: {
        start: startDate,
        end: endDate,
      },
    };
  }

  /**
   * Gets usage aggregations by period
   */
  getAggregations(
    period: "hour" | "day" | "week" | "month",
  ): UsageAggregation[] {
    return Array.from(this._aggregations.values())
      .filter((agg) => agg.period === period)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // ================================================
  // HELPER METHODS
  // ================================================

  private getProviderForModel(
    modelCode: EnhancedAIModel,
  ): AIProvider | "healthcare-br" {
    if (modelCode.startsWith("gpt-")) return "openai";
    if (modelCode.startsWith("claude-")) return "anthropic";
    if (modelCode.startsWith("gemini-")) return "google";
    if (modelCode === "healthcare-pt-br") return "healthcare-br";
    return "mock" as AIProvider;
  }

  private isDiagnosisSpecialty(specialty?: MedicalSpecialty): boolean {
    const diagnosisSpecialties: MedicalSpecialty[] = [
      "dermatologia",
      "cirurgia_plastica",
      "medicina_geral",
    ];
    return specialty ? diagnosisSpecialties.includes(specialty) : false;
  }

  private getRegulatoryFlags(specialty?: MedicalSpecialty): string[] {
    const flags: string[] = [];

    if (specialty) {
      flags.push("CFM_OVERSIGHT");

      if (
        ["dermatologia", "cirurgia_plastica", "cosmiatria"].includes(specialty)
      ) {
        flags.push("ANVISA_OVERSIGHT");
      }
    }

    return flags;
  }

  private updateRollingAverage(
    currentAvg: number,
    newValue: number,
    totalCount: number,
  ): number {
    if (totalCount <= 1) return newValue;
    return (currentAvg * (totalCount - 1) + newValue) / totalCount;
  }

  private updateCacheHitRate(cacheHit: boolean): number {
    const recentCacheHits = this._recentRequests.filter(
      (req) => req.cacheHit,
    ).length;
    const totalRecent = this._recentRequests.length;

    if (totalRecent === 0) return cacheHit ? 1 : 0;
    return (recentCacheHits + (cacheHit ? 1 : 0)) / (totalRecent + 1);
  }

  private updateErrorRate(hasError: boolean): number {
    const recentErrors = this._recentRequests.filter(
      (req) =>
        req.safetyFlags.length > 0 || req.regulatoryFlags.includes("ERROR"),
    ).length;
    const totalRecent = this._recentRequests.length;

    if (totalRecent === 0) return hasError ? 1 : 0;
    return (recentErrors + (hasError ? 1 : 0)) / (totalRecent + 1);
  }

  private calculatePeakHours(): number[] {
    const hourCounts = Array.from({ length: 24 }, () => 0);

    this._recentRequests.forEach((req) => {
      const hour = req.createdAt.getHours();
      if (hour !== undefined && hourCounts[hour] !== undefined) {
        hourCounts[hour]++;
      }
    });

    const maxCount = Math.max(...hourCounts);
    return hourCounts
      .map((count, hour) => ({ hour, count }))
      .filter(({ count }) => count > maxCount * 0.7)
      .map(({ hour }) => hour);
  }

  private getPreferredModels(): EnhancedAIModel[] {
    const modelCounts = new Map<EnhancedAIModel, number>();

    this._recentRequests.forEach((req) => {
      const current = modelCounts.get(req.modelCode) || 0;
      modelCounts.set(req.modelCode, current + 1);
    });

    return Array.from(modelCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([model]) => model);
  }

  private getCommonSpecialties(): MedicalSpecialty[] {
    const specialtyCounts = new Map<MedicalSpecialty, number>();

    this._recentRequests.forEach((req) => {
      if (req.medicalSpecialty) {
        const current = specialtyCounts.get(req.medicalSpecialty) || 0;
        specialtyCounts.set(req.medicalSpecialty, current + 1);
      }
    });

    return Array.from(specialtyCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([specialty]) => specialty);
  }

  private updateAggregations(usageRecord: AIUsageRecord): void {
    const periods: Array<"hour" | "day" | "week" | "month"> = [
      "hour",
      "day",
      "week",
      "month",
    ];

    periods.forEach((period) => {
      const key = this.getAggregationKey(usageRecord.createdAt, period);
      const existing = this._aggregations.get(key);

      if (existing) {
        existing.queries++;
        existing.costUsd += usageRecord.costUsd;
        existing.tokens += usageRecord.totalTokens;

        if (existing.modelBreakdown[usageRecord.modelCode]) {
          existing.modelBreakdown[usageRecord.modelCode]++;
        } else {
          existing.modelBreakdown[usageRecord.modelCode] = 1;
        }

        if (
          usageRecord.medicalSpecialty &&
          existing.specialtyBreakdown[usageRecord.medicalSpecialty]
        ) {
          existing.specialtyBreakdown[usageRecord.medicalSpecialty]++;
        } else if (usageRecord.medicalSpecialty) {
          existing.specialtyBreakdown[usageRecord.medicalSpecialty] = 1;
        }
      } else {
        const aggregation: UsageAggregation = {
          period,
          timestamp: this.getPeriodStart(usageRecord.createdAt, period),
          queries: 1,
          costUsd: usageRecord.costUsd,
          tokens: usageRecord.totalTokens,
          uniqueUsers: 1,
          modelBreakdown: { [usageRecord.modelCode]: 1 } as Record<
            EnhancedAIModel,
            number
          >,
          specialtyBreakdown: usageRecord.medicalSpecialty
            ? ({ [usageRecord.medicalSpecialty]: 1 } as Record<
                MedicalSpecialty,
                number
              >)
            : ({} as Record<MedicalSpecialty, number>),
        };

        this._aggregations.set(key, aggregation);
      }
    });
  }

  private getAggregationKey(
    date: Date,
    period: "hour" | "day" | "week" | "month",
  ): string {
    const d = new Date(date);

    switch (period) {
      case "hour":
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}`;
      case "day":
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      case "week":
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        return `${weekStart.getFullYear()}-W${Math.ceil(weekStart.getDate() / 7)}`;
      case "month":
        return `${d.getFullYear()}-${d.getMonth()}`;
    }
  }

  private getPeriodStart(
    date: Date,
    period: "hour" | "day" | "week" | "month",
  ): Date {
    const d = new Date(date);

    switch (period) {
      case "hour":
        return new Date(
          d.getFullYear(),
          d.getMonth(),
          d.getDate(),
          d.getHours(),
        );
      case "day":
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
      case "week":
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        return new Date(
          weekStart.getFullYear(),
          weekStart.getMonth(),
          weekStart.getDate(),
        );
      case "month":
        return new Date(d.getFullYear(), d.getMonth(), 1);
    }
  }

  // ================================================
  // SERIALIZATION
  // ================================================

  /**
   * Converts to serializable object
   */
  toJSON(): UsageCounterData & {
    insights: ReturnType<UsageCounter["getUsageInsights"]>;
    recentActivity: AIUsageRecord[];
  } {
    return {
      ...this._data,
      insights: this.getUsageInsights(),
      recentActivity: this._recentRequests.slice(-10), // Last 10 requests
    };
  }

  /**
   * Creates UsageCounter from data
   */
  static fromData(data: UsageCounterData): UsageCounter {
    return new UsageCounter(data);
  }

  /**
   * Creates new UsageCounter for user
   */
  static createNew(
    clinicId: string,
    _userId: string,
    planCode: SubscriptionTier,
  ): UsageCounter {
    const now = new Date();

    const data: UsageCounterData = {
      clinicId,
      _userId,
      planCode,
      monthlyQueries: 0,
      dailyQueries: 0,
      currentCostUsd: 0,
      concurrentRequests: 0,
      totalRequests: 0,
      totalCostUsd: 0,
      totalTokensUsed: 0,
      cacheSavingsUsd: 0,
      averageLatencyMs: 0,
      cacheHitRate: 0,
      errorRate: 0,
      periodStart: now,
      lastActivity: now,
      lastReset: now,
    };

    return new UsageCounter(data);
  }
}
