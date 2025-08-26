import {
  EscalationPriority,
  RiskFactorCategory,
  RiskLevel,
} from "@/app/types/risk-assessment-automation";
import { z } from "zod";

// ============================================================================
// HEALTHCARE VALIDATION SCHEMAS - CONSTITUTIONAL COMPLIANCE
// ============================================================================

/**
 * Brazilian CPF Validation
 * LGPD compliant patient identification
 */
const cpfSchema = z
  .string()
  .regex(/^\d{11}$/, "CPF deve conter exatamente 11 dígitos");

/**
 * Healthcare Professional CRM Validation
 * CFM compliance for medical professional identification
 */
const crmSchema = z
  .string()
  .regex(/^\d{4,6}\/[A-Z]{2}$/, "CRM deve estar no formato XXXXXX/UF");

/**
 * Vital Signs Validation
 * Medical accuracy requirements for real-time monitoring
 */
const vitalSignsSchema = z.object({
  bloodPressure: z
    .object({
      systolic: z
        .number()
        .min(60)
        .max(300, "Pressão sistólica fora do range válido"),
      diastolic: z
        .number()
        .min(30)
        .max(200, "Pressão diastólica fora do range válido"),
      timestamp: z.date(),
    })
    .refine((data) => data.systolic > data.diastolic, {
      message: "Pressão sistólica deve ser maior que diastólica",
    }),

  heartRate: z.object({
    bpm: z
      .number()
      .min(30)
      .max(250, "Frequência cardíaca fora do range válido"),
    rhythm: z.enum(["REGULAR", "IRREGULAR"]),
    timestamp: z.date(),
  }),

  temperature: z.object({
    celsius: z.number().min(30).max(45, "Temperatura fora do range válido"),
    timestamp: z.date(),
  }),

  respiratoryRate: z.object({
    rpm: z
      .number()
      .min(8)
      .max(60, "Frequência respiratória fora do range válido"),
    timestamp: z.date(),
  }),

  oxygenSaturation: z.object({
    percentage: z
      .number()
      .min(70)
      .max(100, "Saturação de oxigênio fora do range válido"),
    timestamp: z.date(),
  }),
});

/**
 * Demographic Risk Factors Validation
 * LGPD compliant with consent tracking
 */
const demographicRiskFactorsSchema = z.object({
  age: z.number().min(0).max(150, "Idade deve estar entre 0 e 150 anos"),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "NOT_SPECIFIED"]),
  bmi: z.number().min(10).max(80, "IMC deve estar entre 10 e 80"),
  geneticPredispositions: z.array(z.string().min(1)),
  pregnancyStatus: z
    .enum(["PREGNANT", "BREASTFEEDING", "NOT_APPLICABLE"])
    .optional(),
  smokingStatus: z.enum(["NEVER", "FORMER", "CURRENT"]),
  alcoholConsumption: z.enum(["NONE", "LIGHT", "MODERATE", "HEAVY"]),
  physicalActivityLevel: z.enum(["SEDENTARY", "LIGHT", "MODERATE", "INTENSE"]),
}); /**
 * Medical History Validation
 * Constitutional healthcare data with audit trail requirements
 */

const medicalHistorySchema = z.object({
  chronicConditions: z.array(z.string().min(1)),

  previousSurgeries: z.array(
    z.object({
      procedure: z.string().min(1, "Nome do procedimento é obrigatório"),
      date: z.date().max(new Date(), "Data da cirurgia não pode ser futura"),
      complications: z.array(z.string()).optional(),
      outcome: z.enum(["SUCCESSFUL", "COMPLICATED", "FAILED"]),
    }),
  ),

  allergies: z.array(
    z.object({
      allergen: z.string().min(1, "Alérgeno deve ser especificado"),
      severity: z.enum(["MILD", "MODERATE", "SEVERE", "ANAPHYLACTIC"]),
      reaction: z.string().min(1, "Reação deve ser descrita"),
    }),
  ),

  familyHistory: z.array(
    z.object({
      condition: z.string().min(1, "Condição familiar deve ser especificada"),
      relationship: z.string().min(1, "Grau de parentesco obrigatório"),
      ageAtDiagnosis: z.number().min(0).max(150).optional(),
    }),
  ),

  currentMedications: z.array(
    z.object({
      name: z.string().min(1, "Nome da medicação obrigatório"),
      dosage: z.string().min(1, "Dosagem deve ser especificada"),
      frequency: z.string().min(1, "Frequência obrigatória"),
      startDate: z.date().max(new Date(), "Data de início não pode ser futura"),
      indication: z.string().min(1, "Indicação obrigatória"),
    }),
  ),

  immunizationStatus: z.record(
    z.object({
      vaccinated: z.boolean(),
      lastDose: z.date().optional(),
      boosterRequired: z.boolean().optional(),
    }),
  ),
}); /**
 * Current Condition Risk Factors Validation
 * Real-time monitoring with medical accuracy
 */

const currentConditionSchema = z.object({
  vitalSigns: vitalSignsSchema,

  currentSymptoms: z.array(
    z.object({
      symptom: z.string().min(1, "Sintoma deve ser especificado"),
      severity: z.number().min(1).max(5, "Severidade deve estar entre 1 e 5"),
      duration: z.string().min(1, "Duração deve ser especificada"),
      onset: z.date().max(new Date(), "Data de início não pode ser futura"),
    }),
  ),

  painLevel: z.number().min(0).max(10, "Nível de dor deve estar entre 0 e 10"),
  mentalStatus: z.enum(["ALERT", "CONFUSED", "DROWSY", "UNCONSCIOUS"]),
  mobilityStatus: z.enum(["AMBULATORY", "ASSISTED", "WHEELCHAIR", "BEDRIDDEN"]),
});

/**
 * Procedure-Specific Risk Factors Validation
 * ANVISA compliance for medical device tracking
 */
const procedureSpecificSchema = z
  .object({
    plannedProcedure: z
      .object({
        name: z.string().min(1, "Nome do procedimento obrigatório"),
        type: z.enum([
          "SURGICAL",
          "NON_SURGICAL",
          "MINIMALLY_INVASIVE",
          "COSMETIC",
        ]),
        complexity: z.enum(["LOW", "MEDIUM", "HIGH", "COMPLEX"]),
        duration: z.number().min(1, "Duração deve ser maior que 0 minutos"),
        anesthesiaRequired: z.boolean(),
        anesthesiaType: z
          .enum(["LOCAL", "REGIONAL", "GENERAL", "SEDATION"])
          .optional(),
      })
      .refine(
        (data) => {
          return !data.anesthesiaRequired || data.anesthesiaType !== undefined;
        },
        {
          message: "Tipo de anestesia obrigatório quando anestesia é requerida",
        },
      ),

    equipmentRequired: z.array(
      z.object({
        device: z.string().min(1, "Equipamento deve ser especificado"),
        anvisaRegistration: z.string().optional(),
        riskClass: z.enum(["I", "II", "III", "IV"]),
      }),
    ),

    contraindicationsPresent: z.array(z.string()),

    drugInteractions: z.array(
      z.object({
        medication1: z.string().min(1),
        medication2: z.string().min(1),
        severity: z.enum(["MINOR", "MODERATE", "MAJOR", "CONTRAINDICATED"]),
        description: z.string().min(1, "Descrição da interação obrigatória"),
      }),
    ),
  })
  .optional(); /**
 * Environmental Risk Factors Validation
 * Social determinants of health assessment
 */

const environmentalSchema = z.object({
  supportSystem: z.object({
    hasCaregiver: z.boolean(),
    familySupport: z.enum(["STRONG", "MODERATE", "WEAK", "NONE"]),
    socialIsolation: z.boolean(),
    languageBarriers: z.boolean(),
  }),

  accessibilityFactors: z.object({
    transportationAvailable: z.boolean(),
    distanceToClinic: z.number().min(0, "Distância não pode ser negativa"),
    financialConstraints: z.boolean(),
    insuranceCoverage: z.enum(["FULL", "PARTIAL", "NONE"]),
  }),

  complianceHistory: z.object({
    previousAppointmentAttendance: z
      .number()
      .min(0)
      .max(100, "Porcentagem deve estar entre 0 e 100"),
    medicationCompliance: z.enum(["EXCELLENT", "GOOD", "FAIR", "POOR"]),
    followUpCompliance: z.enum(["EXCELLENT", "GOOD", "FAIR", "POOR"]),
  }),
});

/**
 * LGPD Consent Validation
 * Constitutional privacy compliance
 */
const lgpdConsentSchema = z.object({
  consentGiven: z.boolean().refine((val) => val === true, {
    message:
      "Consentimento LGPD é obrigatório para processamento de dados de saúde",
  }),
  consentDate: z
    .date()
    .max(new Date(), "Data de consentimento não pode ser futura"),
  dataProcessingPurpose: z
    .array(z.string().min(1))
    .min(1, "Pelo menos uma finalidade deve ser especificada"),
  retentionPeriod: z.number().min(1, "Período de retenção deve ser positivo"),
}); /**
 * Risk Assessment Input Validation
 * Complete patient risk profile validation
 */

export const riskAssessmentInputSchema = z.object({
  patientId: z.string().uuid("ID do paciente deve ser um UUID válido"),
  tenantId: z.string().uuid("ID do tenant deve ser um UUID válido"),
  assessmentDate: z
    .date()
    .max(new Date(), "Data de avaliação não pode ser futura"),
  assessmentType: z.enum([
    "PRE_PROCEDURE",
    "ONGOING_CARE",
    "POST_PROCEDURE",
    "EMERGENCY",
  ]),

  demographicFactors: demographicRiskFactorsSchema,
  medicalHistory: medicalHistorySchema,
  currentCondition: currentConditionSchema,
  procedureSpecific: procedureSpecificSchema.optional(),
  environmental: environmentalSchema,

  // LGPD Compliance
  ...lgpdConsentSchema.shape,
});

/**
 * Professional Oversight Validation
 * CFM compliance for medical professional review
 */
export const professionalOversightSchema = z.object({
  requiredReview: z.boolean(),
  reviewLevel: z.enum(["NURSE", "PHYSICIAN", "SPECIALIST", "SENIOR_PHYSICIAN"]),
  timeframe: z.number().min(1, "Prazo deve ser positivo (em minutos)"),
  escalationRequired: z.boolean(),
  escalationPriority: z.nativeEnum(EscalationPriority),

  specialistConsultation: z
    .object({
      specialty: z.string().min(1, "Especialidade deve ser especificada"),
      urgency: z.enum(["ROUTINE", "URGENT", "STAT"]),
      reason: z.string().min(1, "Razão da consulta obrigatória"),
    })
    .optional(),
});

/**
 * Emergency Escalation Validation
 * Real-time alert system validation
 */
export const emergencyEscalationSchema = z.object({
  triggered: z.boolean(),
  triggerReason: z
    .array(z.string().min(1))
    .min(1, "Pelo menos uma razão deve ser especificada"),
  alertLevel: z.enum(["YELLOW", "ORANGE", "RED", "BLACK"]),

  notificationsSent: z.array(
    z.object({
      recipient: z.string().min(1, "Destinatário obrigatório"),
      role: z.string().min(1, "Função obrigatória"),
      sentAt: z.date(),
      acknowledged: z.boolean(),
      acknowledgedAt: z.date().optional(),
    }),
  ),

  actionsTaken: z.array(
    z.object({
      action: z.string().min(1, "Ação deve ser especificada"),
      performedBy: z.string().min(1, "Responsável obrigatório"),
      timestamp: z.date(),
      outcome: z.string().min(1, "Resultado obrigatório"),
    }),
  ),

  resolutionStatus: z.enum(["PENDING", "IN_PROGRESS", "RESOLVED", "ESCALATED"]),
}); /**
 * Risk Assessment Result Validation
 * Complete assessment output with professional oversight
 */

export const riskAssessmentResultSchema = z.object({
  id: z.string().uuid("ID da avaliação deve ser um UUID válido"),
  patientId: z.string().uuid("ID do paciente deve ser um UUID válido"),
  tenantId: z.string().uuid("ID do tenant deve ser um UUID válido"),
  assessmentDate: z.date(),

  inputData: riskAssessmentInputSchema,

  scoreBreakdown: z.object({
    overallScore: z
      .number()
      .min(0)
      .max(100, "Score geral deve estar entre 0 e 100"),
    riskLevel: z.nativeEnum(RiskLevel),

    categoryScores: z.object({
      demographic: z.number().min(0).max(100),
      medicalHistory: z.number().min(0).max(100),
      currentCondition: z.number().min(0).max(100),
      procedureSpecific: z.number().min(0).max(100),
      environmental: z.number().min(0).max(100),
      psychosocial: z.number().min(0).max(100),
    }),

    criticalFactors: z.array(
      z.object({
        factor: z.string().min(1, "Fator deve ser especificado"),
        category: z.nativeEnum(RiskFactorCategory),
        impact: z.number().min(0).max(100, "Impacto deve estar entre 0 e 100"),
        explanation: z.string().min(1, "Explicação obrigatória"),
      }),
    ),

    confidenceInterval: z
      .object({
        lower: z.number().min(0).max(100),
        upper: z.number().min(0).max(100),
        confidence: z
          .number()
          .min(0)
          .max(100, "Confiança deve estar entre 0 e 100"),
      })
      .refine((data) => data.lower <= data.upper, {
        message: "Limite inferior deve ser menor ou igual ao superior",
      }),
  }),

  professionalOversight: professionalOversightSchema,
  emergencyEscalation: emergencyEscalationSchema.optional(),

  recommendations: z.array(
    z.object({
      category: z.string().min(1, "Categoria obrigatória"),
      priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
      action: z.string().min(1, "Ação obrigatória"),
      rationale: z.string().min(1, "Justificativa obrigatória"),
      timeframe: z.string().min(1, "Prazo obrigatório"),
    }),
  ),

  // Model Information for Explainable AI
  modelVersion: z.string().min(1, "Versão do modelo obrigatória"),
  algorithmUsed: z.string().min(1, "Algoritmo usado obrigatório"),
  trainingDataDate: z.date(),
  accuracy: z.number().min(0).max(100, "Acurácia deve estar entre 0 e 100"),

  // Audit Trail
  createdBy: crmSchema,
  createdAt: z.date(),
  lastModifiedBy: crmSchema.optional(),
  lastModifiedAt: z.date().optional(),

  reviewHistory: z.array(
    z.object({
      reviewedBy: crmSchema,
      reviewedAt: z.date(),
      decision: z.enum(["APPROVED", "MODIFIED", "REJECTED", "ESCALATED"]),
      comments: z.string().min(1, "Comentários obrigatórios"),
      digitalSignature: z.string().min(1, "Assinatura digital obrigatória"),
    }),
  ),
}); /**
 * Audit Trail Validation
 * Constitutional healthcare compliance with LGPD requirements
 */

export const auditTrailEntrySchema = z.object({
  id: z.string().uuid("ID da auditoria deve ser um UUID válido"),
  patientId: z.string().uuid("ID do paciente deve ser um UUID válido"),
  assessmentId: z.string().uuid("ID da avaliação deve ser um UUID válido"),
  action: z.enum([
    "CREATED",
    "VIEWED",
    "MODIFIED",
    "DELETED",
    "ESCALATED",
    "REVIEWED",
  ]),
  performedBy: crmSchema,
  performedAt: z.date(),
  ipAddress: z.string().ip("Endereço IP inválido"),
  userAgent: z.string().min(1, "User agent obrigatório"),
  dataAccessed: z.array(z.string().min(1)),
  dataModified: z.array(z.string().min(1)),
  justification: z.string().min(1, "Justificativa obrigatória"),
  digitalSignature: z.string().min(1, "Assinatura digital obrigatória"),

  // LGPD Compliance
  legalBasis: z.enum([
    "CONSENT",
    "LEGITIMATE_INTEREST",
    "VITAL_INTEREST",
    "LEGAL_OBLIGATION",
  ]),
  dataSubjectNotified: z.boolean(),
  retentionExpiry: z
    .date()
    .min(new Date(), "Data de expiração deve ser futura"),
});

/**
 * System Configuration Validation
 * Risk assessment algorithm parameters and thresholds
 */
export const riskAssessmentConfigSchema = z.object({
  modelVersion: z.string().min(1, "Versão do modelo obrigatória"),
  accuracyThreshold: z
    .number()
    .min(95)
    .max(100, "Limite de acurácia deve ser ≥95%"),

  riskThresholds: z
    .object({
      low: z.object({
        min: z.number().min(0),
        max: z.number().max(100),
      }),
      medium: z.object({
        min: z.number().min(0),
        max: z.number().max(100),
      }),
      high: z.object({
        min: z.number().min(0),
        max: z.number().max(100),
      }),
      critical: z.object({
        min: z.number().min(0),
        max: z.number().max(100),
      }),
    })
    .refine(
      (data) => {
        // Validate threshold ranges don't overlap
        return (
          data.low.max < data.medium.min &&
          data.medium.max < data.high.min &&
          data.high.max < data.critical.min
        );
      },
      {
        message: "Faixas de risco não podem se sobrepor",
      },
    ),

  escalationRules: z.array(
    z.object({
      condition: z.string().min(1, "Condição obrigatória"),
      threshold: z.number().min(0).max(100),
      action: z.string().min(1, "Ação obrigatória"),
      timeframe: z.number().min(1, "Prazo deve ser positivo"),
    }),
  ),

  weightings: z
    .object({
      demographic: z.number().min(0).max(1),
      medicalHistory: z.number().min(0).max(1),
      currentCondition: z.number().min(0).max(1),
      procedureSpecific: z.number().min(0).max(1),
      environmental: z.number().min(0).max(1),
      psychosocial: z.number().min(0).max(1),
    })
    .refine(
      (data) => {
        const sum = Object.values(data).reduce((acc, val) => acc + val, 0);
        return Math.abs(sum - 1) < 0.001; // Account for floating point precision
      },
      {
        message: "Pesos devem somar 1.0 (100%)",
      },
    ),

  lastUpdated: z.date(),
  updatedBy: crmSchema,
});

// Export individual schemas for specific use cases
export {
  cpfSchema,
  crmSchema,
  currentConditionSchema,
  demographicRiskFactorsSchema,
  environmentalSchema,
  lgpdConsentSchema,
  medicalHistorySchema,
  procedureSpecificSchema,
  vitalSignsSchema,
};
