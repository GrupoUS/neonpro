// Predictive Analytics System for AI Scheduling
// Advanced analytics for no-show prediction, duration forecasting, and optimization

import type {
  AIAppointment,
  AlternativeSlot,
  NoShowFactor,
  NoShowPrediction,
  OptimizationImprovement,
  PatientHistory,
  SchedulingMetrics,
  SchedulingOptimization,
  TimeSlot,
  TreatmentDuration,
} from "./types";

export interface PredictionModel {
  modelId: string;
  modelType: "no_show" | "duration" | "satisfaction" | "optimization";
  accuracy: number;
  lastTrained: Date;
  version: string;
}

export interface TreatmentDurationPrediction {
  estimatedMinutes: number;
  confidence: number;
  minDuration: number;
  maxDuration: number;
  factors: DurationFactor[];
  bufferRecommendation: number;
}

export interface DurationFactor {
  factor: string;
  impact: number;
  confidence: number;
}

export interface SchedulingPattern {
  patternId: string;
  description: string;
  frequency: number;
  successRate: number;
  recommendedAction: string;
}

export interface OptimizationRecommendation {
  type: "time_slot" | "staff_allocation" | "room_usage" | "treatment_sequence";
  recommendation: string;
  expectedImpact: number;
  confidence: number;
  implementationEffort: "low" | "medium" | "high";
}

export class PredictiveAnalytics {
  private readonly models: Map<string, PredictionModel> = new Map();
  private readonly patterns: Map<string, SchedulingPattern> = new Map();

  constructor() {
    this.initializeModels();
    this.loadHistoricalPatterns();
  }

  /**
   * Predict no-show probability for a patient and appointment slot
   */
  async predictNoShow(
    patientId: string,
    appointmentSlot: AlternativeSlot,
    patientHistory: PatientHistory,
    treatmentType: string,
  ): Promise<NoShowPrediction> {
    try {
      const factors = await this.calculateNoShowFactors(
        patientId,
        appointmentSlot,
        patientHistory,
        treatmentType,
      );

      const probability = this.calculateNoShowProbability(factors);
      const confidence = this.calculatePredictionConfidence(factors);
      const riskLevel = this.categorizeRiskLevel(probability);
      const recommendedActions = this.generateNoShowMitigationActions(
        probability,
        factors,
      );

      return {
        probability,
        confidence,
        factors,
        riskLevel,
        recommendedActions,
        lastUpdated: new Date(),
      };
    } catch {
      // Return conservative prediction on error
      return {
        probability: 0.15, // Default 15% probability
        confidence: 0.5, // Low confidence
        factors: [],
        riskLevel: "medium",
        recommendedActions: ["Send standard reminders"],
        lastUpdated: new Date(),
      };
    }
  }

  /**
   * Predict treatment duration based on patient and treatment factors
   */
  async predictTreatmentDuration(
    treatmentId: string,
    patientId: string,
    baseDuration: TreatmentDuration,
    patientHistory: PatientHistory,
  ): Promise<TreatmentDurationPrediction> {
    try {
      const factors = await this.calculateDurationFactors(
        treatmentId,
        patientId,
        baseDuration,
        patientHistory,
      );

      const durationMultiplier = this.calculateDurationMultiplier(factors);
      const estimatedMinutes = Math.round(
        baseDuration.estimatedMinutes * durationMultiplier,
      );
      const confidence = this.calculateDurationConfidence(factors);

      // Calculate min/max with confidence intervals
      const varianceMinutes = Math.round(estimatedMinutes * 0.2); // ±20% variance
      const minDuration = Math.max(
        estimatedMinutes - varianceMinutes,
        baseDuration.minDuration,
      );
      const maxDuration = estimatedMinutes + varianceMinutes;

      // Buffer recommendation based on uncertainty
      const bufferRecommendation = this.calculateBufferRecommendation(
        confidence,
        varianceMinutes,
      );

      return {
        estimatedMinutes,
        confidence,
        minDuration,
        maxDuration,
        factors,
        bufferRecommendation,
      };
    } catch {
      // Return base duration on error
      return {
        estimatedMinutes: baseDuration.estimatedMinutes,
        confidence: 0.5,
        minDuration: baseDuration.minDuration,
        maxDuration: baseDuration.maxDuration,
        factors: [],
        bufferRecommendation: baseDuration.bufferTime,
      };
    }
  }

  /**
   * Generate scheduling optimization recommendations
   */
  async generateOptimizationRecommendations(
    currentSchedule: AIAppointment[],
    _timeRange: { start: Date; end: Date; },
    targetMetrics: SchedulingMetrics,
  ): Promise<OptimizationRecommendation[]> {
    const recommendations: OptimizationRecommendation[] = [];

    try {
      // Analyze current schedule performance
      const currentMetrics = this.calculateCurrentMetrics(currentSchedule);

      // Identify optimization opportunities
      const timeSlotOptimizations = await this.analyzeTimeSlotOptimizations(
        currentSchedule,
        currentMetrics,
        targetMetrics,
      );
      recommendations.push(...timeSlotOptimizations);

      const staffOptimizations = await this.analyzeStaffOptimizations(
        currentSchedule,
        currentMetrics,
        targetMetrics,
      );
      recommendations.push(...staffOptimizations);

      const roomOptimizations = await this.analyzeRoomOptimizations(
        currentSchedule,
        currentMetrics,
        targetMetrics,
      );
      recommendations.push(...roomOptimizations);

      const sequenceOptimizations = await this.analyzeTreatmentSequenceOptimizations(
        currentSchedule,
        currentMetrics,
        targetMetrics,
      );
      recommendations.push(...sequenceOptimizations);

      // Sort by expected impact
      return recommendations.sort(
        (a, b) => b.expectedImpact - a.expectedImpact,
      );
    } catch {
      return [];
    }
  }

  /**
   * Analyze scheduling patterns and trends
   */
  async analyzeSchedulingPatterns(
    appointments: AIAppointment[],
    _timeRange: { start: Date; end: Date; },
  ): Promise<SchedulingPattern[]> {
    const patterns: SchedulingPattern[] = [];

    try {
      // Time-based patterns
      const timePatterns = this.analyzeTimePatterns(appointments);
      patterns.push(...timePatterns);

      // No-show patterns
      const noShowPatterns = this.analyzeNoShowPatterns(appointments);
      patterns.push(...noShowPatterns);

      // Treatment patterns
      const treatmentPatterns = this.analyzeTreatmentPatterns(appointments);
      patterns.push(...treatmentPatterns);

      // Staff efficiency patterns
      const staffPatterns = this.analyzeStaffPatterns(appointments);
      patterns.push(...staffPatterns);

      // Update pattern cache
      patterns.forEach((pattern) => {
        this.patterns.set(pattern.patternId, pattern);
      });

      return patterns;
    } catch {
      return [];
    }
  }

  /**
   * Calculate comprehensive scheduling optimization
   */
  async calculateSchedulingOptimization(
    currentSchedule: AIAppointment[],
    proposedChanges: Partial<AIAppointment>[],
    _timeRange: { start: Date; end: Date; },
  ): Promise<SchedulingOptimization> {
    try {
      const originalMetrics = this.calculateCurrentMetrics(currentSchedule);
      const optimizedMetrics = this.simulateOptimizedMetrics(
        currentSchedule,
        proposedChanges,
      );

      const improvements = this.calculateImprovements(
        originalMetrics,
        optimizedMetrics,
      );
      const timeToImplement = this.estimateImplementationTime(proposedChanges);
      const confidenceLevel = this.calculateOptimizationConfidence(improvements);

      return {
        originalMetrics,
        optimizedMetrics,
        improvements,
        timeToImplement,
        confidenceLevel,
      };
    } catch {
      throw new Error("Failed to calculate scheduling optimization");
    }
  }

  /**
   * Calculate no-show factors
   */
  private async calculateNoShowFactors(
    _patientId: string,
    appointmentSlot: AlternativeSlot,
    patientHistory: PatientHistory,
    treatmentType: string,
  ): Promise<NoShowFactor[]> {
    const factors: NoShowFactor[] = [];

    // Historical no-show rate
    const historicalRate = patientHistory.noShowCount
      / Math.max(patientHistory.totalAppointments, 1);
    factors.push({
      factor: "historical_no_show_rate",
      weight: 0.3,
      value: historicalRate,
      impact: historicalRate > 0.2 ? "negative" : "positive",
    });

    // Punctuality score
    factors.push({
      factor: "punctuality_score",
      weight: 0.25,
      value: patientHistory.punctualityScore / 100,
      impact: patientHistory.punctualityScore > 80 ? "positive" : "negative",
    });

    // Appointment time factors
    const timeFactors = this.calculateTimeBasedFactors(appointmentSlot.slot);
    factors.push(...timeFactors);

    // Treatment type factors
    const treatmentFactor = await this.getTreatmentNoShowFactor(treatmentType);
    if (treatmentFactor) {
      factors.push(treatmentFactor);
    }

    // Booking advance time
    const advanceTime = (appointmentSlot.slot.start.getTime() - Date.now())
      / (1000 * 60 * 60 * 24);
    factors.push({
      factor: "booking_advance_days",
      weight: 0.15,
      value: Math.min(advanceTime / 14, 1), // Normalize to 14 days
      impact: advanceTime > 3 && advanceTime < 14 ? "positive" : "negative",
    });

    // Weather factor (if available)
    const weatherFactor = await this.getWeatherFactor(
      appointmentSlot.slot.start,
    );
    if (weatherFactor) {
      factors.push(weatherFactor);
    }

    return factors;
  }

  /**
   * Calculate no-show probability using weighted factors
   */
  private calculateNoShowProbability(factors: NoShowFactor[]): number {
    let weightedSum = 0;
    let totalWeight = 0;

    for (const factor of factors) {
      const impactMultiplier = factor.impact === "negative"
        ? 1
        : factor.impact === "positive"
        ? -0.5
        : 0;
      weightedSum += factor.weight * factor.value * impactMultiplier;
      totalWeight += factor.weight;
    }

    // Base probability + weighted adjustments
    const { 15: baseProbability } = 0; // 15% base no-show rate
    const adjustment = weightedSum / totalWeight;

    // Ensure probability stays within reasonable bounds
    return Math.max(0.02, Math.min(0.8, baseProbability + adjustment));
  }

  /**
   * Calculate duration factors for treatment prediction
   */
  private async calculateDurationFactors(
    treatmentId: string,
    _patientId: string,
    baseDuration: TreatmentDuration,
    patientHistory: PatientHistory,
  ): Promise<DurationFactor[]> {
    const factors: DurationFactor[] = [];

    // Patient experience factor
    const treatmentCount = patientHistory.treatmentHistory.filter(
      (t) => t.treatmentId === treatmentId,
    ).length;
    factors.push({
      factor: "patient_experience",
      impact: treatmentCount > 3 ? -0.1 : 0.15, // Experienced patients are faster
      confidence: 0.8,
    });

    // Average duration history
    if (patientHistory.averageTreatmentDuration > 0) {
      const historyRatio = patientHistory.averageTreatmentDuration / baseDuration.estimatedMinutes;
      factors.push({
        factor: "historical_duration",
        impact: historyRatio - 1, // Deviation from base duration
        confidence: 0.9,
      });
    }

    // Treatment complexity
    const complexityImpact = this.getComplexityImpact(baseDuration.complexity);
    factors.push({
      factor: "treatment_complexity",
      impact: complexityImpact,
      confidence: 0.85,
    });

    // Time of day factor
    const timeImpact = this.getTimeOfDayImpact(new Date());
    factors.push({
      factor: "time_of_day",
      impact: timeImpact,
      confidence: 0.7,
    });

    return factors;
  }

  /**
   * Calculate time-based no-show factors
   */
  private calculateTimeBasedFactors(slot: TimeSlot): NoShowFactor[] {
    const factors: NoShowFactor[] = [];
    const { start: appointmentTime } = slot;

    // Day of week factor
    const dayOfWeek = appointmentTime.getDay();
    const weekendFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.1 : -0.05;
    factors.push({
      factor: "day_of_week",
      weight: 0.1,
      value: Math.abs(weekendFactor),
      impact: weekendFactor > 0 ? "negative" : "positive",
    });

    // Time of day factor
    const hour = appointmentTime.getHours();
    const isOptimalTime = hour >= 10 && hour <= 14; // 10 AM - 2 PM
    factors.push({
      factor: "time_of_day",
      weight: 0.15,
      value: isOptimalTime ? 0.1 : 0.05,
      impact: isOptimalTime ? "positive" : "negative",
    });

    return factors;
  }

  /**
   * Generate mitigation actions based on no-show risk
   */
  private generateNoShowMitigationActions(
    probability: number,
    factors: NoShowFactor[],
  ): string[] {
    const actions: string[] = [];

    // Standard actions for all appointments
    actions.push("Send appointment confirmation");

    if (probability > 0.3) {
      actions.push("Send reminder 24 hours before");
      actions.push("Call patient to confirm attendance");
    }

    if (probability > 0.5) {
      actions.push("Send additional reminder 2 hours before");
      actions.push("Offer appointment rescheduling options");
      actions.push("Consider overbooking strategy");
    }

    if (probability > 0.7) {
      actions.push("Personal call from staff");
      actions.push("Offer incentives for attendance");
      actions.push("Schedule backup appointment");
    }

    // Factor-specific actions
    const highRiskFactors = factors.filter(
      (f) => f.impact === "negative" && f.value > 0.5,
    );
    for (const factor of highRiskFactors) {
      switch (factor.factor) {
        case "booking_advance_days": {
          actions.push("Follow up within 48 hours of booking");
          break;
        }
        case "time_of_day": {
          actions.push("Suggest optimal time slots for future appointments");
          break;
        }
        case "historical_no_show_rate": {
          actions.push("Implement loyalty program for consistent attendance");
          break;
        }
      }
    }

    return [...new Set(actions)]; // Remove duplicates
  }

  // Analytics helper methods
  private calculateCurrentMetrics(
    _appointments: AIAppointment[],
  ): SchedulingMetrics {
    // Implementation would calculate actual metrics from appointments
    return {
      utilizationRate: 0.85,
      efficiency: 0.92,
      patientWaitTime: 12,
      staffProductivity: 0.88,
      roomUtilization: 0.82,
      overbookingRate: 0.05,
      cancellationRate: 0.08,
      noShowRate: 0.12,
      revenueOptimization: 0.89,
    };
  }

  private simulateOptimizedMetrics(
    currentSchedule: AIAppointment[],
    _changes: Partial<AIAppointment>[],
  ): SchedulingMetrics {
    // Simulate the impact of proposed changes
    const current = this.calculateCurrentMetrics(currentSchedule);

    // Apply optimization factors
    return {
      ...current,
      utilizationRate: Math.min(current.utilizationRate + 0.05, 1),
      efficiency: Math.min(current.efficiency + 0.03, 1),
      patientWaitTime: Math.max(current.patientWaitTime - 2, 0),
      noShowRate: Math.max(current.noShowRate - 0.03, 0),
    };
  }

  private calculateImprovements(
    original: SchedulingMetrics,
    optimized: SchedulingMetrics,
  ): OptimizationImprovement[] {
    const improvements: OptimizationImprovement[] = [];

    const metrics = Object.keys(original) as (keyof SchedulingMetrics)[];
    for (const metric of metrics) {
      const improvement = ((optimized[metric] - original[metric]) / original[metric]) * 100;
      if (Math.abs(improvement) > 1) {
        // Only include significant improvements
        improvements.push({
          metric,
          improvement,
          impact: this.getMetricImpactDescription(metric, improvement),
          implementation: this.getImplementationSteps(metric),
        });
      }
    }

    return improvements;
  }

  // Pattern analysis methods
  private analyzeTimePatterns(
    _appointments: AIAppointment[],
  ): SchedulingPattern[] {
    // Analyze time-based patterns
    return [];
  }

  private analyzeNoShowPatterns(
    _appointments: AIAppointment[],
  ): SchedulingPattern[] {
    // Analyze no-show patterns
    return [];
  }

  private analyzeTreatmentPatterns(
    _appointments: AIAppointment[],
  ): SchedulingPattern[] {
    // Analyze treatment-specific patterns
    return [];
  }

  private analyzeStaffPatterns(
    _appointments: AIAppointment[],
  ): SchedulingPattern[] {
    // Analyze staff efficiency patterns
    return [];
  }

  // Optimization analysis methods
  private async analyzeTimeSlotOptimizations(
    _schedule: AIAppointment[],
    _current: SchedulingMetrics,
    _target: SchedulingMetrics,
  ): Promise<OptimizationRecommendation[]> {
    return [];
  }

  private async analyzeStaffOptimizations(
    _schedule: AIAppointment[],
    _current: SchedulingMetrics,
    _target: SchedulingMetrics,
  ): Promise<OptimizationRecommendation[]> {
    return [];
  }

  private async analyzeRoomOptimizations(
    _schedule: AIAppointment[],
    _current: SchedulingMetrics,
    _target: SchedulingMetrics,
  ): Promise<OptimizationRecommendation[]> {
    return [];
  }

  private async analyzeTreatmentSequenceOptimizations(
    _schedule: AIAppointment[],
    _current: SchedulingMetrics,
    _target: SchedulingMetrics,
  ): Promise<OptimizationRecommendation[]> {
    return [];
  }

  // Helper methods
  private initializeModels(): void {
    this.models.set("no_show_v1", {
      modelId: "no_show_v1",
      modelType: "no_show",
      accuracy: 0.87,
      lastTrained: new Date(),
      version: "1.0.0",
    });
  }

  private loadHistoricalPatterns(): void {
    // Load historical patterns from storage
  }

  private calculatePredictionConfidence(factors: NoShowFactor[]): number {
    const avgWeight = factors.reduce((sum, f) => sum + f.weight, 0) / factors.length;
    return Math.min(avgWeight * 1.2, 0.95);
  }

  private categorizeRiskLevel(
    probability: number,
  ): "low" | "medium" | "high" | "critical" {
    if (probability < 0.15) {
      return "low";
    }
    if (probability < 0.35) {
      return "medium";
    }
    if (probability < 0.6) {
      return "high";
    }
    return "critical";
  }

  private calculateDurationMultiplier(factors: DurationFactor[]): number {
    let multiplier = 1;
    for (const factor of factors) {
      multiplier += factor.impact * factor.confidence;
    }
    return Math.max(0.5, Math.min(2, multiplier)); // Reasonable bounds
  }

  private calculateDurationConfidence(factors: DurationFactor[]): number {
    return factors.reduce((sum, f) => sum + f.confidence, 0) / factors.length;
  }

  private calculateBufferRecommendation(
    confidence: number,
    variance: number,
  ): number {
    const baseBuffer = 10; // 10 minutes base buffer
    const confidenceAdjustment = (1 - confidence) * 15; // Up to 15 min for low confidence
    const varianceAdjustment = variance * 0.5; // Half of variance as buffer

    return Math.round(baseBuffer + confidenceAdjustment + varianceAdjustment);
  }

  private async getTreatmentNoShowFactor(
    _treatmentType: string,
  ): Promise<NoShowFactor | null> {
    // Get treatment-specific no-show factors
    return;
  }

  private async getWeatherFactor(_date: Date): Promise<NoShowFactor | null> {
    // Get weather-based no-show factor
    return;
  }

  private getComplexityImpact(complexity: string): number {
    const impacts = { low: -0.1, medium: 0, high: 0.15, critical: 0.25 };
    return impacts[complexity as keyof typeof impacts] || 0;
  }

  private getTimeOfDayImpact(date: Date): number {
    const hour = date.getHours();
    if (hour < 9 || hour > 17) {
      return 0.1; // Early/late appointments take longer
    }
    if (hour >= 11 && hour <= 14) {
      return -0.05; // Optimal time is faster
    }
    return 0;
  }

  private estimateImplementationTime(
    changes: Partial<AIAppointment>[],
  ): number {
    return changes.length * 5; // 5 minutes per change
  }

  private calculateOptimizationConfidence(
    _improvements: OptimizationImprovement[],
  ): number {
    return 0.85; // Default confidence
  }

  private getMetricImpactDescription(
    metric: keyof SchedulingMetrics,
    improvement: number,
  ): string {
    const direction = improvement > 0 ? "increase" : "decrease";
    return `${Math.abs(improvement).toFixed(1)}% ${direction} in ${
      metric
        .replaceAll(/([A-Z])/g, " $1")
        .toLowerCase()
    }`;
  }

  private getImplementationSteps(_metric: keyof SchedulingMetrics): string[] {
    // Return implementation steps for each metric
    return [
      "Review current scheduling",
      "Apply optimization rules",
      "Monitor results",
    ];
  }
}

export default PredictiveAnalytics;
