import { riskAssessmentService } from "@/app/lib/services/risk-assessment-automation";
import type {
  RiskAssessmentInput,
  RiskAssessmentResult,
  RiskLevel,
} from "@/app/types/risk-assessment-automation";

// ============================================================================
// PATIENT INSIGHTS INTEGRATION - TREATMENT PREDICTION CONNECTIVITY
// ============================================================================

/**
 * Integration with Treatment Prediction System
 * Connect risk assessment with existing AI treatment recommendations
 */
export class RiskAssessmentIntegration {
  /**
   * Enhance Treatment Prediction with Risk Assessment
   * Integrate risk factors into treatment recommendation algorithms
   */
  static async enhanceTreatmentPrediction(
    patientId: string,
    tenantId: string,
    treatmentOptions: {
      treatmentId: string;
      name: string;
      complexity: "LOW" | "MEDIUM" | "HIGH" | "COMPLEX";
      estimatedOutcome: number;
    }[],
    performedBy: string,
  ): Promise<
    {
      treatmentId: string;
      name: string;
      riskAdjustedOutcome: number;
      riskLevel: RiskLevel;
      riskFactors: string[];
      recommendations: string[];
      contraindications: string[];
    }[]
  > {
    try {
      // Get latest risk assessment for patient
      const riskHistory = await riskAssessmentService.getPatientRiskHistory(
        patientId,
        tenantId,
        1,
        performedBy,
      );

      if (riskHistory.length === 0) {
        // No risk assessment available - return treatments with default risk
        return treatmentOptions.map((treatment) => ({
          treatmentId: treatment.treatmentId,
          name: treatment.name,
          riskAdjustedOutcome: treatment.estimatedOutcome * 0.8, // Conservative default
          riskLevel: RiskLevel.MEDIUM,
          riskFactors: ["Avaliação de risco não disponível"],
          recommendations: ["Realizar avaliação de risco antes do tratamento"],
          contraindications: [],
        }));
      }

      const latestRiskAssessment = riskHistory[0];

      // Analyze each treatment option against risk factors
      const enhancedTreatments = treatmentOptions.map((treatment) => {
        const riskAnalysis = RiskAssessmentIntegration.analyzeTreatmentRisk(
          treatment,
          latestRiskAssessment,
        );

        return {
          treatmentId: treatment.treatmentId,
          name: treatment.name,
          riskAdjustedOutcome: riskAnalysis.adjustedOutcome,
          riskLevel: riskAnalysis.treatmentRiskLevel,
          riskFactors: riskAnalysis.applicableRiskFactors,
          recommendations: riskAnalysis.recommendations,
          contraindications: riskAnalysis.contraindications,
        };
      });

      // Sort by risk-adjusted outcome (highest first)
      return enhancedTreatments.sort(
        (a, b) => b.riskAdjustedOutcome - a.riskAdjustedOutcome,
      );
    } catch (error) {
      throw new Error(
        `Treatment enhancement failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Analyze Treatment Risk
   * Evaluate specific treatment against patient risk profile
   */
  private static analyzeTreatmentRisk(
    treatment: { name: string; complexity: string; estimatedOutcome: number },
    riskAssessment: RiskAssessmentResult,
  ): {
    adjustedOutcome: number;
    treatmentRiskLevel: RiskLevel;
    applicableRiskFactors: string[];
    recommendations: string[];
    contraindications: string[];
  } {
    const riskFactors: string[] = [];
    const recommendations: string[] = [];
    const contraindications: string[] = [];

    let riskMultiplier = 1;

    // Analyze overall patient risk level
    switch (riskAssessment.scoreBreakdown.riskLevel) {
      case RiskLevel.CRITICAL: {
        riskMultiplier *= 0.3; // Severely reduce outcome expectation
        riskFactors.push("Paciente em estado crítico");
        recommendations.push("Considerar estabilização antes do tratamento");
        if (treatment.complexity !== "LOW") {
          contraindications.push(
            "Tratamento complexo contraindicado em estado crítico",
          );
        }
        break;
      }

      case RiskLevel.HIGH: {
        riskMultiplier *= 0.6;
        riskFactors.push("Alto risco de complicações");
        recommendations.push("Monitoramento intensivo necessário");
        break;
      }

      case RiskLevel.MEDIUM: {
        riskMultiplier *= 0.8;
        riskFactors.push("Risco moderado presente");
        recommendations.push(
          "Seguimento padrão com atenção aos fatores de risco",
        );
        break;
      }

      case RiskLevel.LOW: {
        riskMultiplier *= 0.95;
        break;
      }
    }

    // Analyze specific risk factors that affect treatment
    const criticalFactors = riskAssessment.scoreBreakdown.criticalFactors;

    for (const factor of criticalFactors) {
      // Cardiovascular risks
      if (
        factor.factor.toLowerCase().includes("cardíac") ||
        factor.factor.toLowerCase().includes("pressão")
      ) {
        riskFactors.push(`Risco cardiovascular: ${factor.factor}`);

        if (
          treatment.name.toLowerCase().includes("anestesia") ||
          treatment.complexity === "HIGH"
        ) {
          riskMultiplier *= 0.7;
          recommendations.push("Avaliação cardiológica pré-procedimento");
        }
      }

      // Respiratory risks
      if (
        factor.factor.toLowerCase().includes("respirat") ||
        factor.factor.toLowerCase().includes("oxigen")
      ) {
        riskFactors.push(`Risco respiratório: ${factor.factor}`);

        if (treatment.name.toLowerCase().includes("sedação")) {
          riskMultiplier *= 0.6;
          recommendations.push("Monitoramento respiratório contínuo");
        }
      }

      // Metabolic risks
      if (
        factor.factor.toLowerCase().includes("diabet") ||
        factor.factor.toLowerCase().includes("metab")
      ) {
        riskFactors.push(`Risco metabólico: ${factor.factor}`);
        recommendations.push("Controle glicêmico otimizado");
        riskMultiplier *= 0.85;
      }

      // Allergic reactions
      if (factor.factor.toLowerCase().includes("alergi")) {
        riskFactors.push(`Risco alérgico: ${factor.factor}`);
        recommendations.push("Protocolo anti-alérgico profilático");

        if (treatment.name.toLowerCase().includes("medicament")) {
          riskMultiplier *= 0.75;
        }
      }

      // Age-related risks
      if (factor.factor.toLowerCase().includes("idade")) {
        riskFactors.push(`Fator etário: ${factor.factor}`);

        if (factor.factor.toLowerCase().includes("idoso")) {
          recommendations.push("Protocolo geriátrico especializado");
          riskMultiplier *= 0.8;
        }
      }
    }

    // Treatment complexity adjustment
    const complexityMultipliers = {
      LOW: 0.95,
      MEDIUM: 0.85,
      HIGH: 0.7,
      COMPLEX: 0.5,
    };

    riskMultiplier *=
      complexityMultipliers[
        treatment.complexity as keyof typeof complexityMultipliers
      ] || 0.8;

    // Determine treatment-specific risk level
    let treatmentRiskLevel: RiskLevel;
    const adjustedScore =
      riskAssessment.scoreBreakdown.overallScore * (2 - riskMultiplier);

    if (adjustedScore >= 86) {
      treatmentRiskLevel = RiskLevel.CRITICAL;
    } else if (adjustedScore >= 71) {
      treatmentRiskLevel = RiskLevel.HIGH;
    } else if (adjustedScore >= 31) {
      treatmentRiskLevel = RiskLevel.MEDIUM;
    } else {
      treatmentRiskLevel = RiskLevel.LOW;
    }

    // Final contraindication check
    if (
      treatmentRiskLevel === RiskLevel.CRITICAL &&
      treatment.complexity !== "LOW"
    ) {
      contraindications.push(
        "Risco crítico impede realização de tratamento complexo",
      );
      riskMultiplier *= 0.1; // Severely penalize
    }

    return {
      adjustedOutcome: Math.max(
        0,
        Math.min(100, treatment.estimatedOutcome * riskMultiplier),
      ),
      treatmentRiskLevel,
      applicableRiskFactors: riskFactors,
      recommendations,
      contraindications,
    };
  }

  /**
   * Real-Time Risk Monitoring Integration
   * Connect with vital signs monitoring for continuous risk assessment
   */
  static async integrateVitalSignsMonitoring(
    patientId: string,
    tenantId: string,
    vitalSigns: {
      bloodPressure: { systolic: number; diastolic: number };
      heartRate: number;
      temperature: number;
      respiratoryRate: number;
      oxygenSaturation: number;
    },
    performedBy: string,
  ): Promise<{
    riskUpdate: boolean;
    newRiskLevel?: RiskLevel;
    alerts: string[];
    recommendations: string[];
  }> {
    try {
      // Get current risk assessment
      const currentRisk = await riskAssessmentService.getPatientRiskHistory(
        patientId,
        tenantId,
        1,
        performedBy,
      );

      if (currentRisk.length === 0) {
        return {
          riskUpdate: false,
          alerts: ["Nenhuma avaliação de risco base encontrada"],
          recommendations: ["Realizar avaliação de risco completa"],
        };
      }

      const baseline = currentRisk[0];
      const alerts: string[] = [];
      const recommendations: string[] = [];

      // Check for critical vital sign changes
      let criticalChange = false;

      // Blood pressure assessment
      if (
        vitalSigns.bloodPressure.systolic > 180 ||
        vitalSigns.bloodPressure.diastolic > 110
      ) {
        alerts.push("Crise hipertensiva detectada");
        recommendations.push("Intervenção médica imediata necessária");
        criticalChange = true;
      }

      // Oxygen saturation
      if (vitalSigns.oxygenSaturation < 90) {
        alerts.push("Hipoxemia crítica");
        recommendations.push("Suporte ventilatório urgente");
        criticalChange = true;
      }

      // Heart rate
      if (vitalSigns.heartRate > 120 || vitalSigns.heartRate < 50) {
        alerts.push("Frequência cardíaca anormal");
        recommendations.push("Avaliação cardiológica urgente");
        criticalChange = true;
      }

      // Temperature
      if (vitalSigns.temperature > 39 || vitalSigns.temperature < 35) {
        alerts.push("Temperatura crítica");
        recommendations.push("Medidas de controle térmico imediatas");
        criticalChange = true;
      }

      // If critical changes detected, trigger new risk assessment
      if (criticalChange) {
        // Create updated input with new vital signs
        const updatedInput: Partial<RiskAssessmentInput> = {
          ...baseline.inputData,
          currentCondition: {
            ...baseline.inputData.currentCondition,
            vitalSigns: {
              bloodPressure: {
                systolic: vitalSigns.bloodPressure.systolic,
                diastolic: vitalSigns.bloodPressure.diastolic,
                timestamp: new Date(),
              },
              heartRate: {
                bpm: vitalSigns.heartRate,
                rhythm: "REGULAR", // Default, would need ECG integration
                timestamp: new Date(),
              },
              temperature: {
                celsius: vitalSigns.temperature,
                timestamp: new Date(),
              },
              respiratoryRate: {
                rpm: vitalSigns.respiratoryRate,
                timestamp: new Date(),
              },
              oxygenSaturation: {
                percentage: vitalSigns.oxygenSaturation,
                timestamp: new Date(),
              },
            },
          },
          assessmentType: "ONGOING_CARE" as const,
        };

        // Execute new risk assessment
        const newAssessment = await riskAssessmentService.executeRiskAssessment(
          updatedInput as RiskAssessmentInput,
          performedBy,
        );

        return {
          riskUpdate: true,
          newRiskLevel: newAssessment.scoreBreakdown.riskLevel,
          alerts,
          recommendations: [
            ...recommendations,
            ...newAssessment.recommendations.map((r) => r.action),
          ],
        };
      }

      return {
        riskUpdate: false,
        alerts,
        recommendations,
      };
    } catch {
      return {
        riskUpdate: false,
        alerts: ["Erro na integração de sinais vitais"],
        recommendations: ["Verificar sistema de monitoramento"],
      };
    }
  }
}

// Export main integration functions
export const { enhanceTreatmentPrediction, integrateVitalSignsMonitoring } =
  RiskAssessmentIntegration;

export default RiskAssessmentIntegration;
