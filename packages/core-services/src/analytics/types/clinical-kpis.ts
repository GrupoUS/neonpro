/**
 * Clinical KPIs - Healthcare Analytics for Patient Outcomes & Quality
 *
 * Comprehensive clinical performance indicators with ANVISA/CFM compliance,
 * patient safety metrics, and quality outcome tracking.
 */

import {
  BaseMetric,
  HealthcareContext,
  MetricFrequency,
  RiskLevel,
} from "./base-metrics";

/**
 * Clinical metric categories aligned with healthcare standards
 */
export type ClinicalCategory =
  | "patient_safety"
  | "clinical_quality"
  | "patient_outcomes"
  | "care_coordination"
  | "medication_safety"
  | "infection_control"
  | "diagnostic_accuracy"
  | "treatment_effectiveness"
  | "patient_satisfaction"
  | "readmission_rates"
  | "mortality_rates"
  | "adverse_events";

/**
 * Clinical specialties for context-specific metrics
 */
export type ClinicalSpecialty =
  | "cardiology"
  | "oncology"
  | "emergency"
  | "surgery"
  | "pediatrics"
  | "psychiatry"
  | "obstetrics"
  | "geriatrics"
  | "primary_care"
  | "intensive_care"
  | "radiology"
  | "pathology"
  | "general";

/**
 * Base clinical KPI interface extending BaseMetric with healthcare-specific properties
 */
export interface ClinicalKPI extends BaseMetric {
  /** Clinical category classification */
  category: ClinicalCategory;

  /** Clinical specialty context */
  specialty: ClinicalSpecialty;

  /** Healthcare context */
  healthcareContext: HealthcareContext;

  /** Patient population demographics */
  populationContext?: {
    ageRange?: string;
    gender?: "M" | "F" | "other" | "all";
    conditions?: string[];
    riskFactors?: string[];
  };

  /** Clinical outcome type */
  outcomeType: "process" | "outcome" | "structure" | "experience";

  /** Evidence level supporting this metric */
  evidenceLevel: "A" | "B" | "C" | "expert_opinion";

  /** Benchmark comparison data */
  benchmark?: {
    national?: number;
    international?: number;
    specialty?: number;
    previousPeriod?: number;
  };
} /**
 * Patient Safety KPIs - Critical safety indicators
 */
export interface PatientSafetyKPI extends ClinicalKPI {
  category: "patient_safety";

  /** Safety event details */
  safetyContext: {
    eventType:
      | "fall"
      | "medication_error"
      | "surgical_complication"
      | "infection"
      | "other";
    severity: "minor" | "moderate" | "severe" | "life_threatening";
    preventable: boolean;
    reportingSource: "staff" | "patient" | "family" | "automated";
  };

  /** Intervention tracking */
  interventions?: {
    implemented: string[];
    pending: string[];
    effectiveness: number; // 0-1 scale
  };
}

/**
 * Clinical Quality KPIs - Care quality and adherence metrics
 */
export interface ClinicalQualityKPI extends ClinicalKPI {
  category: "clinical_quality";

  /** Quality measure details */
  qualityMeasure: {
    measureType: "process" | "outcome" | "structure";
    guideline: string; // Reference to clinical guideline
    complianceRequired: boolean;
    auditFrequency: MetricFrequency;
  };

  /** Performance targets */
  targets: {
    minimum: number;
    target: number;
    excellence: number;
  };
}

/**
 * Patient Outcome KPIs - Treatment effectiveness and results
 */
export interface PatientOutcomeKPI extends ClinicalKPI {
  category: "patient_outcomes";

  /** Outcome measurement details */
  outcomeDetails: {
    measurementTool: string;
    timeframe: "immediate" | "short_term" | "medium_term" | "long_term";
    clinicalSignificance: number; // Minimal clinically important difference
    patientReported: boolean;
  };

  /** Risk adjustment factors */
  riskAdjustment?: {
    factors: string[];
    adjustedValue?: number;
    confidence: number;
  };
}

/**
 * Medication Safety KPIs - Drug safety and adverse events
 */
export interface MedicationSafetyKPI extends ClinicalKPI {
  category: "medication_safety";

  /** Medication context */
  medicationContext: {
    drugClass?: string;
    route: "oral" | "iv" | "topical" | "injection" | "other";
    riskCategory: "low" | "medium" | "high" | "black_box";
    interactions: boolean;
  };

  /** ANVISA reporting requirements */
  anvisaReporting?: {
    required: boolean;
    reportingCategory: "serious" | "unexpected" | "expected";
    timeframe: number; // Days to report
  };
}

/**
 * Quality of Care KPIs - Overall quality assessment
 */
export interface QualityOfCareKPI extends ClinicalKPI {
  category: "clinical_quality";

  /** Quality measurement details */
  qualityDetails: {
    measurementTool: string;
    guidelines: string[];
    assessmentPeriod: "daily" | "weekly" | "monthly" | "quarterly";
    clinicalEvidence: "A" | "B" | "C" | "D";
  };

  /** Performance indicators */
  performanceIndicators?: {
    processCompliance: number;
    outcomeAchievement: number;
    patientSatisfaction: number;
    safetyMetrics: number;
  };
}

/**
 * Infection Control KPIs - Healthcare-associated infections
 */
export interface InfectionControlKPI extends ClinicalKPI {
  category: "infection_control";

  /** Infection details */
  infectionContext: {
    type: "hai" | "ssi" | "uti" | "bloodstream" | "pneumonia" | "other";
    organism?: string;
    resistance: "sensitive" | "resistant" | "mdr" | "xdr";
    acquisition: "community" | "healthcare" | "unknown";
  };

  /** Prevention measures */
  preventionMeasures: {
    bundleCompliance: number; // 0-1 scale
    surveillanceActive: boolean;
    isolationRequired: boolean;
  };
}

/**
 * Specific Clinical KPI Implementations
 */

/**
 * Hospital-Acquired Infection Rate
 */
export interface HAIRateKPI extends InfectionControlKPI {
  name: "hospital_acquired_infection_rate";
  unit: "per_1000_patient_days";
  complianceFrameworks: ["ANVISA", "CFM"];
  riskLevel: RiskLevel;

  /** ANVISA-specific requirements */
  anvisaMetrics: {
    reportingRequired: true;
    benchmarkComparison: number;
    interventionThreshold: number;
  };
}

/**
 * Medication Error Rate
 */
export interface MedicationErrorRateKPI extends MedicationSafetyKPI {
  name: "medication_error_rate";
  unit: "per_1000_doses";
  complianceFrameworks: ["ANVISA", "CFM"];

  /** Error classification */
  errorClassification: {
    category: "prescribing" | "dispensing" | "administration" | "monitoring";
    severity: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I"; // NCC MERP scale
    causation: "human" | "system" | "communication" | "other";
  };
}

/**
 * Patient Fall Rate
 */
export interface PatientFallRateKPI extends PatientSafetyKPI {
  name: "patient_fall_rate";
  unit: "per_1000_patient_days";
  complianceFrameworks: ["CFM"];

  /** Fall assessment */
  fallAssessment: {
    riskScore: number; // Morse Fall Scale or similar
    preventionProtocol: boolean;
    injuryOccurred: boolean;
    injurySeverity?: "none" | "minor" | "moderate" | "major";
  };
}

/**
 * Readmission Rate (30-day)
 */
export interface ReadmissionRateKPI extends PatientOutcomeKPI {
  name: "readmission_rate_30day";
  unit: "percentage";
  complianceFrameworks: ["CFM"];

  /** Readmission details */
  readmissionContext: {
    planned: boolean;
    sameCondition: boolean;
    preventable: boolean;
    riskFactors: string[];
  };
}

/**
 * Surgical Site Infection Rate
 */
export interface SSIRateKPI extends InfectionControlKPI {
  name: "surgical_site_infection_rate";
  unit: "percentage";
  complianceFrameworks: ["ANVISA", "CFM"];

  /** Surgical context */
  surgicalContext: {
    procedure: string;
    riskIndex: 0 | 1 | 2 | 3; // NHSN risk index
    prophylaxisCompliant: boolean;
    surveillancePeriod: number; // Days
  };
}

/**
 * Patient Satisfaction Score
 */
export interface PatientSatisfactionKPI extends ClinicalKPI {
  category: "patient_satisfaction";
  name: "patient_satisfaction_score";
  unit: "scale_1_10";
  complianceFrameworks: ["CFM"];

  /** Satisfaction survey details */
  surveyDetails: {
    tool: "hcahps" | "cahps" | "custom";
    responseRate: number;
    dimensions: string[];
    benchmarkPercentile: number;
  };
}

/**
 * Mortality Rate (Risk-Adjusted)
 */
export interface MortalityRateKPI extends ClinicalKPI {
  category: "mortality_rates";
  name: "risk_adjusted_mortality_rate";
  unit: "percentage";
  complianceFrameworks: ["CFM"];

  /** Mortality analysis */
  mortalityAnalysis: {
    expected: number;
    observed: number;
    ratio: number; // Observed/Expected
    caseComplexity: "low" | "medium" | "high";
    comorbidities: string[];
  };
}

/**
 * Diagnostic Accuracy KPI
 */
export interface DiagnosticAccuracyKPI extends ClinicalKPI {
  category: "diagnostic_accuracy";
  name: "diagnostic_accuracy_rate";
  unit: "percentage";
  complianceFrameworks: ["CFM"];

  /** Diagnostic context */
  diagnosticContext: {
    modality: "imaging" | "laboratory" | "clinical" | "pathology";
    goldStandard: string;
    sensitivity: number;
    specificity: number;
    timeToResult: number; // Hours
  };
}

/**
 * Clinical KPI Factory Functions
 */

/**
 * Create a patient safety KPI with default compliance settings
 */
export function createPatientSafetyKPI(params: {
  name: string;
  value: number;
  clinicId: string;
  eventType: PatientSafetyKPI["safetyContext"]["eventType"];
  severity: PatientSafetyKPI["safetyContext"]["severity"];
}): PatientSafetyKPI {
  return {
    id: `safety_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: params.name,
    description: `Patient safety metric: ${params.name}`,
    dataType: "number",
    value: params.value,
    unit: "count",
    frequency: "daily",
    aggregation: "sum",
    status: "active",
    riskLevel:
      params.severity === "life_threatening"
        ? "CRITICAL"
        : params.severity === "severe"
          ? "HIGH"
          : "MEDIUM",
    complianceFrameworks: ["CFM", "ANVISA"],
    source: "clinical_system",
    timestamp: new Date(),
    lastUpdated: new Date(),
    createdAt: new Date(),
    category: "patient_safety",
    specialty: "general",
    healthcareContext: {
      clinicId: params.clinicId,
      regulatoryContext: {
        framework: "CFM",
        requirements: ["incident_reporting", "root_cause_analysis"],
        auditRequired: true,
      },
    },
    outcomeType: "process",
    evidenceLevel: "A",
    safetyContext: {
      eventType: params.eventType,
      severity: params.severity,
      preventable: true,
      reportingSource: "staff",
    },
  };
}

/**
 * Create a clinical quality KPI with benchmark tracking
 */
export function createClinicalQualityKPI(params: {
  name: string;
  value: number;
  target: number;
  clinicId: string;
  guideline: string;
}): ClinicalQualityKPI {
  return {
    id: `quality_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: params.name,
    description: `Clinical quality metric: ${params.name}`,
    dataType: "percentage",
    value: params.value,
    unit: "%",
    targetValue: params.target,
    frequency: "monthly",
    aggregation: "average",
    status: "active",
    riskLevel: params.value < params.target * 0.8 ? "HIGH" : "LOW",
    complianceFrameworks: ["CFM"],
    source: "quality_system",
    timestamp: new Date(),
    lastUpdated: new Date(),
    createdAt: new Date(),
    category: "clinical_quality",
    specialty: "general",
    healthcareContext: {
      clinicId: params.clinicId,
    },
    outcomeType: "process",
    evidenceLevel: "A",
    qualityMeasure: {
      measureType: "process",
      guideline: params.guideline,
      complianceRequired: true,
      auditFrequency: "monthly",
    },
    targets: {
      minimum: params.target * 0.8,
      target: params.target,
      excellence: params.target * 1.1,
    },
  };
}

/**
 * Utility functions for clinical KPI analysis
 */

/**
 * Validate clinical KPI for compliance requirements
 */
export function validateClinicalCompliance(kpi: ClinicalKPI): {
  compliant: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check CFM requirements
  if (kpi.complianceFrameworks.includes("CFM")) {
    if (!kpi.healthcareContext.clinicId) {
      issues.push("CFM requires clinic identification");
    }
    if (kpi.category === "patient_safety" && kpi.riskLevel === "CRITICAL") {
      recommendations.push(
        "CFM notification required for critical safety events",
      );
    }
  }

  // Check ANVISA requirements
  if (kpi.complianceFrameworks.includes("ANVISA")) {
    if (kpi.category === "medication_safety") {
      recommendations.push("ANVISA adverse event reporting may be required");
    }
    if (kpi.category === "infection_control") {
      recommendations.push("ANVISA surveillance reporting required");
    }
  }

  return {
    compliant: issues.length === 0,
    issues,
    recommendations,
  };
}

/**
 * Create a Quality of Care KPI instance
 */
export function createQualityOfCareKPI(
  options: Partial<QualityOfCareKPI>,
): QualityOfCareKPI {
  const now = new Date();

  return {
    id: options.id || "qoc_" + Math.random().toString(36).substr(2, 9),
    name: options.name || "Quality of Care Score",
    description: "Comprehensive quality of care assessment",
    dataType: "percentage",
    value: options.value || 0,
    unit: "%",
    frequency: "monthly",
    aggregation: "average",
    status: "active",
    riskLevel: "MEDIUM",
    complianceFrameworks: ["CFM", "ANVISA"],
    source: "clinical_system",
    timestamp: now,
    lastUpdated: now,
    createdAt: now,
    category: "clinical_quality",
    specialty: "general",
    healthcareContext: options.healthcareContext || {},
    outcomeType: "process",
    evidenceLevel: "B",
    qualityDetails: {
      measurementTool: "CFM Standard Assessment",
      guidelines: ["CFM Guidelines 2024"],
      assessmentPeriod: "monthly",
      clinicalEvidence: "B",
    },
    ...options,
  };
}

/**
 * Create a Patient Outcome KPI instance
 */
export function createPatientOutcomeKPI(
  options: Partial<PatientOutcomeKPI>,
): PatientOutcomeKPI {
  const now = new Date();

  return {
    id: options.id || "outcome_" + Math.random().toString(36).substr(2, 9),
    name: options.name || "Patient Outcome Score",
    description: "Patient treatment outcome assessment",
    dataType: "percentage",
    value: options.value || 0,
    unit: "%",
    frequency: "monthly",
    aggregation: "average",
    status: "active",
    riskLevel: "MEDIUM",
    complianceFrameworks: ["CFM"],
    source: "clinical_system",
    timestamp: now,
    lastUpdated: now,
    createdAt: now,
    category: "patient_outcomes",
    specialty: "general",
    healthcareContext: options.healthcareContext || {},
    outcomeType: "outcome",
    evidenceLevel: "B",
    outcomeDetails: {
      measurementTool: "Clinical Outcome Assessment",
      timeframe: "medium_term",
      clinicalSignificance: 0.5,
      patientReported: true,
    },
    ...options,
  };
}

/**
 * Calculate clinical risk score based on various KPIs
 */
export function calculateClinicalRiskScore(kpis: ClinicalKPI[]): {
  overallRisk: RiskLevel;
  riskScore: number;
  criticalAreas: string[];
  recommendations: string[];
} {
  if (kpis.length === 0) {
    return {
      overallRisk: "LOW",
      riskScore: 0,
      criticalAreas: [],
      recommendations: ["No KPIs available for assessment"],
    };
  }

  let totalScore = 0;
  const criticalAreas: string[] = [];
  const recommendations: string[] = [];

  kpis.forEach((kpi) => {
    let kpiScore = 0;

    // Calculate score based on risk level
    switch (kpi.riskLevel) {
      case "CRITICAL":
        kpiScore = 100;
        criticalAreas.push(kpi.name);
        break;
      case "HIGH":
        kpiScore = 75;
        break;
      case "MEDIUM":
        kpiScore = 50;
        break;
      case "LOW":
        kpiScore = 25;
        break;
    }

    // Adjust score based on value vs target
    if (kpi.targetValue) {
      const targetRatio = kpi.value / kpi.targetValue;
      if (targetRatio < 0.7) {
        kpiScore *= 1.5; // Increase risk if well below target
      } else if (targetRatio > 1.1) {
        kpiScore *= 0.7; // Decrease risk if well above target
      }
    }

    totalScore += kpiScore;
  });

  const averageScore = totalScore / kpis.length;

  let overallRisk: RiskLevel = "LOW";
  if (averageScore >= 80) {
    overallRisk = "CRITICAL";
    recommendations.push("Immediate intervention required");
  } else if (averageScore >= 60) {
    overallRisk = "HIGH";
    recommendations.push("Enhanced monitoring and corrective actions needed");
  } else if (averageScore >= 40) {
    overallRisk = "MEDIUM";
    recommendations.push(
      "Regular monitoring and preventive measures recommended",
    );
  }

  return {
    overallRisk,
    riskScore: Math.round(averageScore),
    criticalAreas,
    recommendations,
  };
}
