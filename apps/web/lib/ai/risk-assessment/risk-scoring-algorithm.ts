import { riskAssessmentInputSchema } from "@/app/lib/validations/risk-assessment-automation";
import type {
  EmergencyEscalation,
  EscalationPriority,
  ProfessionalOversight,
  RiskAssessmentInput,
  RiskAssessmentResult,
  RiskLevel,
  RiskScoreBreakdown,
} from "@/app/types/risk-assessment-automation";
import { z } from "zod";
import {
  calculateComprehensiveRiskAssessment,
  determineEmergencyEscalation,
  validateModelAccuracy,
} from "./ml-risk-models";

// ============================================================================
// RISK SCORING ALGORITHM - REAL-TIME CONSTITUTIONAL HEALTHCARE COMPLIANCE
// ============================================================================

/**
 * Performance Monitoring Interface
 * Track algorithm performance for ≥98% accuracy requirement
 */
interface PerformanceMetrics {
  processingTime: number; // milliseconds
  accuracy: number; // percentage
  modelVersion: string;
  timestamp: Date;
  patientId: string;
  riskLevel: RiskLevel;
}

/**
 * Cache Configuration for Real-Time Performance
 * Optimize for <100ms response time requirement
 */
interface RiskAssessmentCache {
  patientId: string;
  inputHash: string;
  result: RiskAssessmentResult;
  cachedAt: Date;
  expiresAt: Date;
  hitCount: number;
}

/**
 * Professional Oversight Configuration
 * CFM compliance requirements
 */
interface ProfessionalOversightConfig {
  autoReviewThresholds: {
    [K in RiskLevel]: {
      required: boolean;
      timeframeMinutes: number;
      reviewLevel: "NURSE" | "PHYSICIAN" | "SPECIALIST" | "SENIOR_PHYSICIAN";
    };
  };
  escalationRules: {
    condition: (score: RiskScoreBreakdown) => boolean;
    priority: EscalationPriority;
    action: string;
  }[];
}

/**
 * Default Professional Oversight Configuration
 * Based on Brazilian healthcare standards and CFM guidelines
 */
const DEFAULT_OVERSIGHT_CONFIG: ProfessionalOversightConfig = {
  autoReviewThresholds: {
    [RiskLevel.LOW]: {
      required: false,
      timeframeMinutes: 60,
      reviewLevel: "NURSE",
    },
    [RiskLevel.MEDIUM]: {
      required: true,
      timeframeMinutes: 30,
      reviewLevel: "NURSE",
    },
    [RiskLevel.HIGH]: {
      required: true,
      timeframeMinutes: 15,
      reviewLevel: "PHYSICIAN",
    },
    [RiskLevel.CRITICAL]: {
      required: true,
      timeframeMinutes: 5,
      reviewLevel: "SENIOR_PHYSICIAN",
    },
  },
  escalationRules: [
    {
      condition: (score) => score.overallScore >= 95,
      priority: EscalationPriority.EMERGENCY,
      action: "immediate_physician_notification",
    },
    {
      condition: (score) => score.categoryScores.currentCondition >= 80,
      priority: EscalationPriority.IMMEDIATE,
      action: "vital_signs_monitoring",
    },
    {
      condition: (score) => score.criticalFactors.length >= 5,
      priority: EscalationPriority.URGENT,
      action: "comprehensive_review",
    },
  ],
}; /**
 * Main Risk Scoring Algorithm
 * Real-time risk assessment with constitutional healthcare compliance
 */

export class RiskScoringEngine {
  private performanceMetrics: PerformanceMetrics[] = [];
  private readonly cache: Map<string, RiskAssessmentCache> = new Map();
  private readonly oversightConfig: ProfessionalOversightConfig;

  constructor(customOversightConfig?: Partial<ProfessionalOversightConfig>) {
    this.oversightConfig = {
      ...DEFAULT_OVERSIGHT_CONFIG,
      ...customOversightConfig,
    };
  }

  /**
   * Execute Comprehensive Risk Assessment
   * Main entry point for risk scoring with constitutional compliance
   */
  async executeRiskAssessment(
    input: RiskAssessmentInput,
    requestId: string,
    performedBy: string,
  ): Promise<RiskAssessmentResult> {
    const startTime = performance.now();

    try {
      // Validate input data with healthcare standards
      const validatedInput = await this.validateInput(input);

      // Check cache for performance optimization
      const cachedResult = this.getCachedResult(validatedInput);
      if (cachedResult) {
        return this.updateAuditTrail(
          cachedResult,
          "CACHED_RESULT",
          performedBy,
        );
      }

      // Execute core risk assessment
      const scoreBreakdown = this.calculateRiskScore(validatedInput);

      // Determine professional oversight requirements
      const professionalOversight = this.determineProfessionalOversight(
        scoreBreakdown,
        validatedInput,
      );

      // Check for emergency escalation
      const emergencyEscalation = this.evaluateEmergencyEscalation(
        scoreBreakdown,
        validatedInput,
      );

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        scoreBreakdown,
        validatedInput,
      );

      // Create complete assessment result
      const result: RiskAssessmentResult = {
        id: requestId,
        patientId: validatedInput.patientId,
        tenantId: validatedInput.tenantId,
        assessmentDate: new Date(),
        inputData: validatedInput,
        scoreBreakdown,
        professionalOversight,
        emergencyEscalation: emergencyEscalation.requiresEscalation
          ? emergencyEscalation
          : undefined,
        recommendations,

        // Model Information for Explainable AI
        modelVersion: "1.0.0",
        algorithmUsed: "Multi-Factor Weighted Risk Assessment",
        trainingDataDate: new Date("2024-01-01"),
        accuracy: validateModelAccuracy().currentAccuracy,

        // Audit Trail
        createdBy: performedBy,
        createdAt: new Date(),
        reviewHistory: [],
      };

      // Cache result for performance
      this.cacheResult(validatedInput, result);

      // Record performance metrics
      this.recordPerformanceMetrics(
        startTime,
        result,
        validatedInput.patientId,
      );

      // Generate audit trail entry
      await this.generateAuditTrail(result, "CREATED", performedBy);

      return result;
    } catch (error) {
      const errorResult = this.handleError(
        error,
        input,
        requestId,
        performedBy,
      );
      this.recordPerformanceMetrics(startTime, errorResult, input.patientId);
      throw error;
    }
  }

  /**
   * Validate Input Data
   * Constitutional healthcare data validation with LGPD compliance
   */
  private async validateInput(
    input: RiskAssessmentInput,
  ): Promise<RiskAssessmentInput> {
    try {
      // Zod validation with healthcare standards
      const validatedInput = riskAssessmentInputSchema.parse(input);

      // Additional business logic validation
      await this.validateBusinessRules(validatedInput);

      return validatedInput;
    } catch (error) {
      throw new Error(
        `Validação de dados falhou: ${
          error instanceof z.ZodError
            ? error.errors.map((e) => e.message).join(", ")
            : error
        }`,
      );
    }
  }

  /**
   * Business Rules Validation
   * Healthcare-specific validation beyond schema
   */
  private async validateBusinessRules(
    input: RiskAssessmentInput,
  ): Promise<void> {
    // LGPD consent validation
    if (!input.consentGiven) {
      throw new Error(
        "Consentimento LGPD é obrigatório para processamento de dados de saúde",
      );
    }

    // Data freshness validation for real-time assessment
    const now = new Date();
    const vitalSignsAge =
      now.getTime() -
      input.currentCondition.vitalSigns.bloodPressure.timestamp.getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (vitalSignsAge > maxAge) {
      throw new Error(
        "Sinais vitais muito antigos para avaliação de risco em tempo real",
      );
    }

    // Age validation for procedure compatibility
    if (input.procedureSpecific) {
      const age = input.demographicFactors.age;
      const procedureType = input.procedureSpecific.plannedProcedure.type;

      if (age < 18 && procedureType === "COSMETIC") {
        throw new Error(
          "Procedimentos estéticos não são permitidos para menores de 18 anos",
        );
      }
    }

    // Medication interaction validation
    if (input.procedureSpecific?.drugInteractions) {
      const contraindicatedInteractions =
        input.procedureSpecific.drugInteractions.filter(
          (interaction) => interaction.severity === "CONTRAINDICATED",
        );

      if (contraindicatedInteractions.length > 0) {
        throw new Error(
          `Interações medicamentosas contraindicadas detectadas: ${contraindicatedInteractions
            .map((i) => `${i.medication1} + ${i.medication2}`)
            .join(", ")}`,
        );
      }
    }
  } /**
   * Calculate Risk Score
   * Execute comprehensive risk assessment using ML models
   */

  private calculateRiskScore(input: RiskAssessmentInput): RiskScoreBreakdown {
    try {
      return calculateComprehensiveRiskAssessment(input);
    } catch (error) {
      throw new Error(`Falha no cálculo de risco: ${error}`);
    }
  }

  /**
   * Determine Professional Oversight Requirements
   * CFM compliance for medical professional review
   */
  private determineProfessionalOversight(
    scoreBreakdown: RiskScoreBreakdown,
    input: RiskAssessmentInput,
  ): ProfessionalOversight {
    const riskLevel = scoreBreakdown.riskLevel;
    const thresholds = this.oversightConfig.autoReviewThresholds[riskLevel];

    // Check for specialist consultation requirements
    let specialistConsultation;

    // High-risk conditions requiring specialist consultation
    const highRiskConditions = input.medicalHistory.chronicConditions.filter(
      (condition) =>
        ["cardiopatia", "diabetes", "insuficiência renal", "câncer"].some(
          (risk) => condition.toLowerCase().includes(risk),
        ),
    );

    if (highRiskConditions.length > 0 && scoreBreakdown.overallScore > 70) {
      specialistConsultation = {
        specialty: this.determineRequiredSpecialty(highRiskConditions, input),
        urgency:
          scoreBreakdown.overallScore > 85
            ? ("URGENT" as const)
            : ("ROUTINE" as const),
        reason: `Condições de alto risco: ${highRiskConditions.join(", ")}`,
      };
    }

    // Check escalation rules
    const escalationRequired = this.oversightConfig.escalationRules.some(
      (rule) => rule.condition(scoreBreakdown),
    );

    return {
      requiredReview: thresholds.required,
      reviewLevel: thresholds.reviewLevel,
      timeframe: thresholds.timeframeMinutes,
      escalationRequired,
      escalationPriority: this.determineEscalationPriority(scoreBreakdown),
      specialistConsultation,
    };
  }

  /**
   * Evaluate Emergency Escalation
   * Real-time emergency detection with immediate alerts
   */
  private evaluateEmergencyEscalation(
    scoreBreakdown: RiskScoreBreakdown,
    input: RiskAssessmentInput,
  ): EmergencyEscalation & {
    requiresEscalation: boolean;
    escalationPriority: EscalationPriority;
    escalationReasons: string[];
  } {
    const escalationData = determineEmergencyEscalation(scoreBreakdown, input);

    if (!escalationData.requiresEscalation) {
      return {
        ...escalationData,
        triggered: false,
        triggerReason: [],
        alertLevel: "YELLOW" as const,
        notificationsSent: [],
        actionsTaken: [],
        resolutionStatus: "RESOLVED" as const,
      };
    }

    // Determine alert level based on escalation priority
    let alertLevel: "YELLOW" | "ORANGE" | "RED" | "BLACK";
    switch (escalationData.escalationPriority) {
      case EscalationPriority.EMERGENCY: {
        alertLevel = "BLACK";
        break;
      }
      case EscalationPriority.IMMEDIATE: {
        alertLevel = "RED";
        break;
      }
      case EscalationPriority.URGENT: {
        alertLevel = "ORANGE";
        break;
      }
      default: {
        alertLevel = "YELLOW";
      }
    }

    return {
      ...escalationData,
      triggered: true,
      triggerReason: escalationData.escalationReasons,
      alertLevel,
      notificationsSent: [], // Will be populated by notification service
      actionsTaken: [],
      resolutionStatus: "PENDING" as const,
    };
  }

  /**
   * Generate Clinical Recommendations
   * Evidence-based recommendations for patient care
   */
  private generateRecommendations(
    scoreBreakdown: RiskScoreBreakdown,
    input: RiskAssessmentInput,
  ): {
    category: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    action: string;
    rationale: string;
    timeframe: string;
  }[] {
    const recommendations: {
      category: string;
      priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
      action: string;
      rationale: string;
      timeframe: string;
    }[] = [];

    // Critical score recommendations
    if (scoreBreakdown.overallScore >= 86) {
      recommendations.push({
        category: "Risco Crítico",
        priority: "CRITICAL",
        action: "Revisão médica imediata e monitoramento contínuo",
        rationale: `Score de risco crítico (${scoreBreakdown.overallScore}/100) requer intervenção imediata`,
        timeframe: "Imediato",
      });
    }

    // Vital signs recommendations
    const vitals = input.currentCondition.vitalSigns;
    if (
      vitals.bloodPressure.systolic > 160 ||
      vitals.bloodPressure.diastolic > 100
    ) {
      recommendations.push({
        category: "Pressão Arterial",
        priority: "HIGH",
        action: "Monitoramento de pressão arterial e ajuste medicamentoso",
        rationale: `Pressão arterial elevada: ${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic} mmHg`,
        timeframe: "2-4 horas",
      });
    }

    if (vitals.oxygenSaturation.percentage < 95) {
      recommendations.push({
        category: "Oxigenação",
        priority: vitals.oxygenSaturation.percentage < 90 ? "CRITICAL" : "HIGH",
        action: "Avaliação respiratória e suporte de oxigênio se necessário",
        rationale: `Saturação de oxigênio baixa: ${vitals.oxygenSaturation.percentage}%`,
        timeframe:
          vitals.oxygenSaturation.percentage < 90 ? "Imediato" : "1 hora",
      });
    }

    // Medical history recommendations
    if (scoreBreakdown.categoryScores.medicalHistory > 60) {
      recommendations.push({
        category: "Histórico Médico",
        priority: "MEDIUM",
        action: "Revisão completa do histórico médico e medicações atuais",
        rationale: "Histórico médico complexo requer revisão detalhada",
        timeframe: "24 horas",
      });
    }

    // Procedure-specific recommendations
    if (
      input.procedureSpecific &&
      scoreBreakdown.categoryScores.procedureSpecific > 50
    ) {
      recommendations.push({
        category: "Procedimento",
        priority: "HIGH",
        action: "Avaliação de riscos/benefícios do procedimento planejado",
        rationale: "Riscos específicos do procedimento identificados",
        timeframe: "Antes do procedimento",
      });
    }

    // Environmental support recommendations
    if (scoreBreakdown.categoryScores.environmental > 40) {
      recommendations.push({
        category: "Suporte Social",
        priority: "MEDIUM",
        action: "Avaliação do suporte social e planejamento de alta",
        rationale: "Fatores ambientais podem impactar recuperação",
        timeframe: "48 horas",
      });
    }

    // Medication management recommendations
    const medicationCount = input.medicalHistory.currentMedications.length;
    if (medicationCount > 5) {
      recommendations.push({
        category: "Medicações",
        priority: "MEDIUM",
        action:
          "Revisão farmacêutica para identificar interações e simplificar regime",
        rationale: `Polifarmácia detectada: ${medicationCount} medicações simultâneas`,
        timeframe: "72 horas",
      });
    }

    // Follow-up recommendations based on risk level
    switch (scoreBreakdown.riskLevel) {
      case RiskLevel.CRITICAL: {
        recommendations.push({
          category: "Seguimento",
          priority: "CRITICAL",
          action: "Monitoramento contínuo com reavaliação a cada 4 horas",
          rationale: "Risco crítico requer monitoramento intensivo",
          timeframe: "Contínuo",
        });
        break;
      }
      case RiskLevel.HIGH: {
        recommendations.push({
          category: "Seguimento",
          priority: "HIGH",
          action: "Reavaliação em 12 horas e seguimento em 24 horas",
          rationale: "Alto risco requer seguimento próximo",
          timeframe: "12-24 horas",
        });
        break;
      }
      case RiskLevel.MEDIUM: {
        recommendations.push({
          category: "Seguimento",
          priority: "MEDIUM",
          action: "Reavaliação em 48 horas ou conforme sintomas",
          rationale: "Risco moderado requer seguimento padrão",
          timeframe: "48 horas",
        });
        break;
      }
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  } /**
   * Utility Methods for Risk Assessment
   */

  private determineRequiredSpecialty(
    conditions: string[],
    _input: RiskAssessmentInput,
  ): string {
    // Map conditions to medical specialties
    const specialtyMap: Record<string, string> = {
      cardiopatia: "Cardiologia",
      diabetes: "Endocrinologia",
      "insuficiência renal": "Nefrologia",
      câncer: "Oncologia",
      "doença hepática": "Gastroenterologia",
      "doença pulmonar": "Pneumologia",
      "doença neurológica": "Neurologia",
    };

    for (const condition of conditions) {
      for (const [key, specialty] of Object.entries(specialtyMap)) {
        if (condition.toLowerCase().includes(key)) {
          return specialty;
        }
      }
    }

    // Default to internal medicine for complex cases
    return "Clínica Médica";
  }

  private determineEscalationPriority(
    scoreBreakdown: RiskScoreBreakdown,
  ): EscalationPriority {
    if (scoreBreakdown.overallScore >= 95) {
      return EscalationPriority.EMERGENCY;
    }
    if (scoreBreakdown.overallScore >= 85) {
      return EscalationPriority.IMMEDIATE;
    }
    if (scoreBreakdown.overallScore >= 70) {
      return EscalationPriority.URGENT;
    }
    return EscalationPriority.ROUTINE;
  }

  /**
   * Caching System for Performance Optimization
   */

  private generateInputHash(input: RiskAssessmentInput): string {
    // Create a hash of significant input parameters for caching
    const hashInput = {
      patientId: input.patientId,
      assessmentType: input.assessmentType,
      // Include key demographic factors
      age: input.demographicFactors.age,
      bmi: input.demographicFactors.bmi,
      smokingStatus: input.demographicFactors.smokingStatus,
      // Include vital signs (rounded to reduce cache misses)
      vitalSigns: {
        systolic:
          Math.round(
            input.currentCondition.vitalSigns.bloodPressure.systolic / 5,
          ) * 5,
        diastolic:
          Math.round(
            input.currentCondition.vitalSigns.bloodPressure.diastolic / 5,
          ) * 5,
        heartRate:
          Math.round(input.currentCondition.vitalSigns.heartRate.bpm / 5) * 5,
        oxygenSat: Math.round(
          input.currentCondition.vitalSigns.oxygenSaturation.percentage,
        ),
      },
      // Include chronic conditions count
      chronicConditionsCount: input.medicalHistory.chronicConditions.length,
      // Include procedure if present
      procedureType: input.procedureSpecific?.plannedProcedure.type,
    };

    return btoa(JSON.stringify(hashInput));
  }

  private getCachedResult(
    input: RiskAssessmentInput,
  ): RiskAssessmentResult | null {
    const hash = this.generateInputHash(input);
    const cached = this.cache.get(input.patientId + hash);

    if (cached && cached.expiresAt > new Date()) {
      cached.hitCount++;
      return cached.result;
    }

    // Clean expired cache entries
    if (cached && cached.expiresAt <= new Date()) {
      this.cache.delete(input.patientId + hash);
    }

    return;
  }

  private cacheResult(
    input: RiskAssessmentInput,
    result: RiskAssessmentResult,
  ): void {
    const hash = this.generateInputHash(input);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15-minute cache

    this.cache.set(input.patientId + hash, {
      patientId: input.patientId,
      inputHash: hash,
      result,
      cachedAt: new Date(),
      expiresAt,
      hitCount: 0,
    });

    // Limit cache size to prevent memory issues
    if (this.cache.size > 1000) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Performance Monitoring
   */

  private recordPerformanceMetrics(
    startTime: number,
    result: RiskAssessmentResult,
    patientId: string,
  ): void {
    const processingTime = performance.now() - startTime;

    const metrics: PerformanceMetrics = {
      processingTime,
      accuracy: result.accuracy,
      modelVersion: result.modelVersion,
      timestamp: new Date(),
      patientId,
      riskLevel: result.scoreBreakdown.riskLevel,
    };

    this.performanceMetrics.push(metrics);

    // Keep only last 1000 metrics for memory management
    if (this.performanceMetrics.length > 1000) {
      this.performanceMetrics = this.performanceMetrics.slice(-1000);
    }

    // Log warning if processing time exceeds target
    if (processingTime > 100) {}
  }

  /**
   * Audit Trail and Error Handling
   */

  private async generateAuditTrail(
    result: RiskAssessmentResult,
    action: "CREATED" | "VIEWED" | "MODIFIED" | "CACHED_RESULT",
    performedBy: string,
  ): Promise<void> {
    // This would integrate with the audit trail service
    const _auditEntry = {
      id: crypto.randomUUID(),
      patientId: result.patientId,
      assessmentId: result.id,
      action,
      performedBy,
      performedAt: new Date(),
      ipAddress: "127.0.0.1", // Would be actual IP
      userAgent: "RiskScoringEngine",
      dataAccessed: ["risk_score", "recommendations"],
      dataModified: action === "CREATED" ? ["risk_assessment"] : [],
      justification: "Risk assessment calculation for patient care",
      digitalSignature: "digital_signature_placeholder",
      legalBasis: "VITAL_INTEREST" as const,
      dataSubjectNotified: false,
      retentionExpiry: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000), // 7 years
    };
  }

  private updateAuditTrail(
    result: RiskAssessmentResult,
    action: "CACHED_RESULT",
    performedBy: string,
  ): RiskAssessmentResult {
    // Update audit trail for cached result access
    this.generateAuditTrail(result, action, performedBy);
    return result;
  }

  private handleError(
    _error: unknown,
    input: RiskAssessmentInput,
    requestId: string,
    performedBy: string,
  ): RiskAssessmentResult {
    // Create minimal error result for audit purposes
    const errorResult: RiskAssessmentResult = {
      id: requestId,
      patientId: input.patientId,
      tenantId: input.tenantId,
      assessmentDate: new Date(),
      inputData: input,
      scoreBreakdown: {
        overallScore: 0,
        riskLevel: RiskLevel.LOW,
        categoryScores: {
          demographic: 0,
          medicalHistory: 0,
          currentCondition: 0,
          procedureSpecific: 0,
          environmental: 0,
          psychosocial: 0,
        },
        criticalFactors: [],
        confidenceInterval: { lower: 0, upper: 0, confidence: 0 },
      },
      professionalOversight: {
        requiredReview: true,
        reviewLevel: "PHYSICIAN",
        timeframe: 15,
        escalationRequired: true,
        escalationPriority: EscalationPriority.URGENT,
      },
      recommendations: [
        {
          category: "Erro do Sistema",
          priority: "CRITICAL",
          action:
            "Revisão médica manual imediata devido a falha no sistema de avaliação de risco",
          rationale:
            "Sistema de avaliação de risco falhou - revisão manual necessária",
          timeframe: "Imediato",
        },
      ],
      modelVersion: "ERROR",
      algorithmUsed: "Manual Fallback",
      trainingDataDate: new Date(),
      accuracy: 0,
      createdBy: performedBy,
      createdAt: new Date(),
      reviewHistory: [],
    };

    return errorResult;
  }

  /**
   * Public Performance API
   */

  public getPerformanceMetrics(): {
    averageProcessingTime: number;
    averageAccuracy: number;
    totalAssessments: number;
    cacheHitRate: number;
  } {
    if (this.performanceMetrics.length === 0) {
      return {
        averageProcessingTime: 0,
        averageAccuracy: 0,
        totalAssessments: 0,
        cacheHitRate: 0,
      };
    }

    const totalProcessingTime = this.performanceMetrics.reduce(
      (sum, m) => sum + m.processingTime,
      0,
    );
    const totalAccuracy = this.performanceMetrics.reduce(
      (sum, m) => sum + m.accuracy,
      0,
    );

    const cacheEntries = [...this.cache.values()];
    const totalCacheRequests = cacheEntries.reduce(
      (sum, entry) => sum + entry.hitCount,
      0,
    );
    const cacheHitRate =
      cacheEntries.length > 0
        ? (totalCacheRequests /
            (this.performanceMetrics.length + totalCacheRequests)) *
          100
        : 0;

    return {
      averageProcessingTime:
        totalProcessingTime / this.performanceMetrics.length,
      averageAccuracy: totalAccuracy / this.performanceMetrics.length,
      totalAssessments: this.performanceMetrics.length,
      cacheHitRate,
    };
  }

  public clearCache(): void {
    this.cache.clear();
  }

  public clearMetrics(): void {
    this.performanceMetrics = [];
  }
}

// Export singleton instance for application use
export const riskScoringEngine = new RiskScoringEngine();

// Export utility functions
export {
  DEFAULT_OVERSIGHT_CONFIG,
  type PerformanceMetrics,
  type ProfessionalOversightConfig,
  type RiskAssessmentCache,
};
