/**
 * @fileoverview Constitutional AI Ethics Validator
 * @description Validates AI decisions against constitutional healthcare principles and CFM standards
 * @compliance Constitutional AI Ethics + CFM Medical Standards + Patient Safety
 * @quality ≥9.9/10 Healthcare Excellence Standard
 */

import { z } from "zod";

/**
 * AI Decision Schema for Constitutional Validation
 */
export const AIDecisionSchema = z.object({
  id: z.string().uuid(),
  type: z.enum([
    "prediction",
    "recommendation",
    "classification",
    "triage",
    "scheduling",
  ]),
  input: z.record(z.any()),
  output: z.record(z.any()),
  confidence: z.number().min(0).max(1),
  accuracy: z.number().min(0).max(100),
  explanation: z.string().min(10),
  timestamp: z.string().datetime(),
  patientId: z.string().optional(),
  medicalContext: z.string(),
  reviewRequired: z.boolean(),
  humanOversight: z.boolean(),
  riskLevel: z.enum(["low", "medium", "high", "critical"]),
});

export type AIDecision = z.infer<typeof AIDecisionSchema>;

/**
 * Ethics Validation Result
 */
export interface EthicsValidationResult {
  isValid: boolean;
  score: number; // 0-100
  violations: EthicsViolation[];
  recommendations: string[];
  requiresHumanReview: boolean;
  complianceStatus: "compliant" | "partial" | "non_compliant";
  cfmCompliance: boolean;
  patientSafetyRisk: "none" | "low" | "medium" | "high" | "critical";
}

/**
 * Ethics Violation
 */
export interface EthicsViolation {
  principle: string;
  severity: "minor" | "moderate" | "serious" | "critical";
  description: string;
  recommendation: string;
  cfmStandard?: string;
  patientImpact: string;
}

/**
 * Constitutional AI Ethics Validator
 */
export class ConstitutionalAIEthicsValidator {
  private readonly MINIMUM_ACCURACY_THRESHOLD = 95; // ≥95% for healthcare AI

  /**
   * Validate AI decision against constitutional healthcare principles
   */
  async validateAIDecision(
    decision: AIDecision,
  ): Promise<EthicsValidationResult> {
    const violations: EthicsViolation[] = [];
    let score = 100;

    // 1. Validate Medical Accuracy Requirement (≥95%)
    if (decision.accuracy < this.MINIMUM_ACCURACY_THRESHOLD) {
      violations.push({
        principle: "Medical Accuracy First",
        severity: "critical",
        description: `AI accuracy ${decision.accuracy}% below constitutional requirement of ≥95%`,
        recommendation:
          "Retrain model or require human review for all decisions below threshold",
        cfmStandard: "CFM Resolution 2273/2020 - AI in Medicine",
        patientImpact:
          "CRITICAL: Low accuracy AI decisions can lead to medical errors and patient harm",
      });
      score -= 30;
    }

    // 2. Validate Explainability Requirement
    if (!decision.explanation || decision.explanation.length < 50) {
      violations.push({
        principle: "Explainable AI",
        severity: "serious",
        description:
          "AI decision lacks adequate explanation for medical professionals",
        recommendation:
          "Implement detailed explanation generation for all AI decisions",
        cfmStandard: "CFM Resolution 2273/2020 - Transparency in AI",
        patientImpact:
          "HIGH: Unexplained AI decisions undermine medical professional judgment",
      });
      score -= 20;
    }

    // 3. Validate Human Oversight Requirement
    if (!decision.humanOversight && decision.riskLevel !== "low") {
      violations.push({
        principle: "Human Medical Oversight",
        severity: "serious",
        description: `${decision.riskLevel} risk AI decision lacks required human oversight`,
        recommendation:
          "Implement mandatory human review for medium/high/critical risk decisions",
        cfmStandard: "CFM Resolution 2273/2020 - Human Supervision",
        patientImpact:
          "HIGH: Unsupervised AI decisions in healthcare can lead to medical errors",
      });
      score -= 25;
    }

    // 4. Validate Patient Safety Priority
    if (decision.riskLevel === "critical" && decision.confidence < 0.99) {
      violations.push({
        principle: "Patient Safety First",
        severity: "critical",
        description:
          "Critical risk decision with insufficient confidence level",
        recommendation:
          "Require ≥99% confidence for critical patient safety decisions",
        cfmStandard: "Hippocratic Oath - First, do no harm",
        patientImpact:
          "CRITICAL: Low confidence critical decisions pose immediate patient safety risk",
      });
      score -= 35;
    }

    // 5. Validate Constitutional Privacy Protection
    if (
      this.containsPersonalData(decision.input) &&
      !this.isDataMinimized(decision.input)
    ) {
      violations.push({
        principle: "Privacy Protection (LGPD)",
        severity: "moderate",
        description:
          "AI processing includes excessive personal data beyond medical necessity",
        recommendation:
          "Implement data minimization and privacy-preserving AI techniques",
        cfmStandard: "LGPD Art. 6 - Data Minimization Principle",
        patientImpact:
          "MEDIUM: Excessive data processing violates patient privacy rights",
      });
      score -= 15;
    }

    // 6. Validate Bias Detection
    const biasScore = await this.detectAlgorithmicBias(decision);
    if (biasScore > 0.1) {
      // >10% bias threshold
      violations.push({
        principle: "Algorithmic Fairness",
        severity: "serious",
        description: `Detected algorithmic bias score: ${(biasScore * 100).toFixed(1)}%`,
        recommendation:
          "Implement bias mitigation techniques and diverse training data",
        cfmStandard: "CFM Code of Ethics - Equality in Healthcare",
        patientImpact:
          "HIGH: Biased AI decisions can lead to unequal healthcare treatment",
      });
      score -= 20;
    }

    // Determine compliance status
    const complianceStatus = this.determineComplianceStatus(violations);
    const cfmCompliance = violations.every((v) => v.severity !== "critical");
    const patientSafetyRisk = this.assessPatientSafetyRisk(violations);
    const requiresHumanReview =
      violations.some((v) => v.severity === "critical") ||
      decision.riskLevel === "critical" ||
      decision.accuracy < this.MINIMUM_ACCURACY_THRESHOLD;

    return {
      isValid:
        violations.length === 0 ||
        violations.every((v) => v.severity === "minor"),
      score: Math.max(0, score),
      violations,
      recommendations: this.generateRecommendations(violations),
      requiresHumanReview,
      complianceStatus,
      cfmCompliance,
      patientSafetyRisk,
    };
  } /**
   * Check if input contains personal data
   */

  private containsPersonalData(input: Record<string, any>): boolean {
    const personalDataFields = [
      "cpf",
      "email",
      "phone",
      "address",
      "name",
      "birthDate",
    ];
    return personalDataFields.some((field) => field in input);
  }

  /**
   * Check if data is minimized according to LGPD principles
   */
  private isDataMinimized(input: Record<string, any>): boolean {
    const _necessaryFields = [
      "age",
      "symptoms",
      "medical_history",
      "allergies",
      "medications",
    ];
    const unnecessaryFields = [
      "social_media",
      "income",
      "education",
      "occupation",
    ];

    // Check if only necessary fields are present
    const hasUnnecessaryData = unnecessaryFields.some(
      (field) => field in input,
    );
    return !hasUnnecessaryData;
  }

  /**
   * Detect algorithmic bias in AI decision
   */
  private async detectAlgorithmicBias(decision: AIDecision): Promise<number> {
    // Simplified bias detection (in real implementation, use statistical analysis)
    // Check for demographic bias indicators
    const input = decision.input;
    let biasScore = 0;

    // Age bias detection
    if (input.age && (input.age < 18 || input.age > 65)) {
      const confidenceDrop = this.calculateConfidenceDrop(input.age);
      biasScore += confidenceDrop * 0.3;
    }

    // Gender bias detection
    if (input.gender && decision.confidence < 0.8) {
      biasScore += 0.1;
    }

    // Geographic bias detection
    if (input.location?.includes("rural")) {
      biasScore += 0.05;
    }

    return Math.min(biasScore, 1); // Cap at 100%
  }

  /**
   * Calculate confidence drop based on age bias
   */
  private calculateConfidenceDrop(age: number): number {
    if (age < 18) {
      return 0.2; // 20% confidence drop for minors
    }
    if (age > 65) {
      return 0.15; // 15% confidence drop for elderly
    }
    return 0;
  }

  /**
   * Determine overall compliance status
   */
  private determineComplianceStatus(
    violations: EthicsViolation[],
  ): "compliant" | "partial" | "non_compliant" {
    if (violations.length === 0) {
      return "compliant";
    }

    const hasCritical = violations.some((v) => v.severity === "critical");
    const hasSerious = violations.some((v) => v.severity === "serious");

    if (hasCritical) {
      return "non_compliant";
    }
    if (hasSerious) {
      return "partial";
    }
    return "compliant";
  }

  /**
   * Assess patient safety risk from violations
   */
  private assessPatientSafetyRisk(
    violations: EthicsViolation[],
  ): "none" | "low" | "medium" | "high" | "critical" {
    if (violations.length === 0) {
      return "none";
    }

    const criticalViolations = violations.filter(
      (v) => v.severity === "critical",
    );
    const seriousViolations = violations.filter(
      (v) => v.severity === "serious",
    );

    if (criticalViolations.length > 0) {
      return "critical";
    }
    if (seriousViolations.length > 2) {
      return "high";
    }
    if (seriousViolations.length > 0) {
      return "medium";
    }
    return "low";
  }

  /**
   * Generate recommendations based on violations
   */
  private generateRecommendations(violations: EthicsViolation[]): string[] {
    if (violations.length === 0) {
      return [
        "AI decision meets all constitutional healthcare ethics standards",
      ];
    }

    const recommendations = new Set<string>();

    violations.forEach((violation) => {
      recommendations.add(violation.recommendation);

      // Add specific constitutional healthcare recommendations
      if (violation.severity === "critical") {
        recommendations.add(
          "IMMEDIATE ACTION: Stop AI system and require manual medical review",
        );
        recommendations.add(
          "Implement emergency fallback procedures for patient safety",
        );
      }

      if (violation.principle.includes("Accuracy")) {
        recommendations.add(
          "Retrain AI model with larger, more diverse medical dataset",
        );
        recommendations.add(
          "Implement ensemble methods to improve prediction accuracy",
        );
      }

      if (violation.principle.includes("Explainable")) {
        recommendations.add("Implement LIME/SHAP explainability techniques");
        recommendations.add(
          "Create medical professional-friendly explanation interfaces",
        );
      }

      if (violation.principle.includes("Privacy")) {
        recommendations.add(
          "Implement differential privacy and federated learning",
        );
        recommendations.add(
          "Review and minimize data collection to medical necessity only",
        );
      }
    });

    return [...recommendations];
  }

  /**
   * Generate constitutional AI audit report
   */
  async generateAuditReport(decisions: AIDecision[]): Promise<{
    overallCompliance: number;
    totalDecisions: number;
    compliantDecisions: number;
    criticalViolations: number;
    averageAccuracy: number;
    cfmComplianceRate: number;
    patientSafetyScore: number;
    recommendations: string[];
    summary: string;
  }> {
    const validationResults = await Promise.all(
      decisions.map((decision) => this.validateAIDecision(decision)),
    );

    const totalDecisions = decisions.length;
    const compliantDecisions = validationResults.filter(
      (r) => r.isValid,
    ).length;
    const criticalViolations = validationResults.reduce(
      (sum, r) =>
        sum + r.violations.filter((v) => v.severity === "critical").length,
      0,
    );

    const averageAccuracy =
      decisions.reduce((sum, d) => sum + d.accuracy, 0) / totalDecisions;
    const cfmCompliantDecisions = validationResults.filter(
      (r) => r.cfmCompliance,
    ).length;
    const cfmComplianceRate = (cfmCompliantDecisions / totalDecisions) * 100;

    // Patient safety score based on risk levels
    const patientSafetyScore =
      validationResults.reduce((sum, r) => {
        const riskScore =
          r.patientSafetyRisk === "none"
            ? 100
            : r.patientSafetyRisk === "low"
              ? 80
              : r.patientSafetyRisk === "medium"
                ? 60
                : r.patientSafetyRisk === "high"
                  ? 40
                  : 0;
        return sum + riskScore;
      }, 0) / totalDecisions;

    const overallCompliance = (compliantDecisions / totalDecisions) * 100;

    // Generate comprehensive recommendations
    const allRecommendations = new Set<string>();
    validationResults.forEach((r) =>
      r.recommendations.forEach((rec) => allRecommendations.add(rec)),
    );

    const summary =
      `Constitutional AI Ethics Audit: ${compliantDecisions}/${totalDecisions} decisions compliant | ` +
      `Average Accuracy: ${averageAccuracy.toFixed(1)}% | ` +
      `CFM Compliance: ${cfmComplianceRate.toFixed(1)}% | ` +
      `Critical Issues: ${criticalViolations} | ` +
      `Patient Safety Score: ${patientSafetyScore.toFixed(1)}/100`;

    return {
      overallCompliance,
      totalDecisions,
      compliantDecisions,
      criticalViolations,
      averageAccuracy,
      cfmComplianceRate,
      patientSafetyScore,
      recommendations: [...allRecommendations],
      summary,
    };
  }

  /**
   * Validate critical healthcare AI operation
   */
  async validateCriticalOperation(
    decision: AIDecision,
    operationType:
      | "emergency_triage"
      | "drug_interaction"
      | "allergy_alert"
      | "vital_signs_critical",
  ): Promise<EthicsValidationResult> {
    // Enhanced validation for critical operations
    const baseValidation = await this.validateAIDecision(decision);

    // Additional critical operation checks
    const additionalViolations: EthicsViolation[] = [];

    // Critical operations require 99% accuracy
    if (decision.accuracy < 99) {
      additionalViolations.push({
        principle: "Critical Operation Accuracy",
        severity: "critical",
        description: `Critical ${operationType} requires ≥99% accuracy, got ${decision.accuracy}%`,
        recommendation:
          "Use ensemble methods and require dual AI system validation",
        cfmStandard: "Patient Safety in Critical Care",
        patientImpact:
          "CRITICAL: Inaccurate critical decisions can be life-threatening",
      });
    }

    // Critical operations require immediate human review
    if (!decision.reviewRequired) {
      additionalViolations.push({
        principle: "Critical Operation Review",
        severity: "critical",
        description: `Critical ${operationType} must require immediate human review`,
        recommendation:
          "Enable mandatory human review for all critical operations",
        cfmStandard: "Human Oversight in Critical Care",
        patientImpact:
          "CRITICAL: Unreviewed critical decisions pose immediate patient risk",
      });
    }

    return {
      ...baseValidation,
      violations: [...baseValidation.violations, ...additionalViolations],
      requiresHumanReview: true, // Always require human review for critical operations
      patientSafetyRisk:
        additionalViolations.length > 0
          ? "critical"
          : baseValidation.patientSafetyRisk,
    };
  }
}
