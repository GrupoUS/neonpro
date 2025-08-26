import { neonproAIIntegration } from "../integrations/neonpro-integration";
import type { PatientProfile, SkinType, TreatmentRequest } from "../types";

/**
 * Utility Helper Functions for NeonPro AI Prediction Engine
 * Simplifies integration and usage of the AI system
 */

// Type definitions for specific concerns, expectations, and urgency levels
type ConcernType = "wrinkles" | "acne-scars" | "pigmentation" | "texture";
type ExpectationType = "subtle" | "moderate" | "dramatic";
type UrgencyType = "low" | "moderate" | "high";

// Constants for time calculations and business rules
const _MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const _BUSINESS_DAYS = [1, 2, 3, 4, 5]; // Monday to Friday

/**
 * Initialize the complete AI prediction system
 * Call this once during application startup
 */
export async function initializeAIPredictionEngine(): Promise<void> {
  await neonproAIIntegration.initialize();
}

/**
 * Create a patient profile with sensible defaults
 * Useful for testing and rapid prototyping
 */
export function createPatientProfile(
  overrides: Partial<PatientProfile> = {},
): PatientProfile {
  const defaultProfile: PatientProfile = {
    id: overrides.id || `patient_${Date.now()}`,
    age: 35,
    gender: "female",
    skinType: "fitzpatrick-3",
    medicalHistory: {
      allergies: [],
      medications: [],
      conditions: [],
      autoimmuneDiseases: [],
      bloodThinnersUse: false,
      keloidProneness: false,
    },
    lifestyle: {
      smoking: false,
      alcohol: false,
      sunExposure: "moderate",
      exerciseLevel: "moderate",
      stressLevel: 5,
      sleepQuality: 7,
      skincare: {
        cleansing: true,
        moisturizing: true,
        sunscreenUse: true,
        retinoidUse: false,
        exfoliation: true,
        professionalTreatments: [],
      },
    },
    previousTreatments: [],
    goals: {
      primary: "Aesthetic improvement",
      secondary: ["Preventive care"],
      expectations: "moderate",
      maintenance: true,
      naturalLook: true,
    },
    consentStatus: {
      dataProcessingConsent: true,
      aiPredictionConsent: true,
      consentDate: new Date(),
      consentVersion: "1.0",
      dataRetentionPeriod: 365,
      anonymizationRequested: false,
    },
  };

  return { ...defaultProfile, ...overrides };
}

/**
 * Create a treatment request with sensible defaults
 */
export function createTreatmentRequest(
  patientId: string,
  treatmentType: string,
  targetAreas: string[],
  overrides: Partial<TreatmentRequest> = {},
): TreatmentRequest {
  const defaultRequest: TreatmentRequest = {
    patientId,
    treatmentType: treatmentType as any,
    targetAreas: targetAreas.map((area) => ({
      region: area as any,
      concern: "wrinkles" as ConcernType,
      severity: 5,
      priority: 1,
    })),
    goals: {
      primary: "Aesthetic improvement",
      secondary: [],
      expectations: "moderate" as ExpectationType,
      maintenance: false,
      naturalLook: true,
    },
    urgency: "moderate" as UrgencyType,
    budgetRange: {
      min: 1000,
      max: 5000,
      currency: "BRL",
      flexible: true,
    },
    timeframe: "within-month",
  };

  return { ...defaultRequest, ...overrides };
}

/**
 * Validate patient data for AI predictions
 */
export function validatePatientData(patient: PatientProfile): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields validation
  if (!patient.id) {
    errors.push("Patient ID is required");
  }
  if (!patient.age || patient.age < 18 || patient.age > 100) {
    errors.push("Patient age must be between 18 and 100");
  }
  if (!patient.skinType) {
    errors.push("Skin type is required");
  }
  if (!patient.consentStatus.aiPredictionConsent) {
    errors.push("AI prediction consent is required");
  }

  // Warnings for data quality
  if (patient.previousTreatments.length === 0) {
    warnings.push(
      "No previous treatment history - predictions may be less accurate",
    );
  }
  if (!patient.medicalHistory.medications) {
    warnings.push(
      "No medication history provided - risk assessment may be incomplete",
    );
  }
  if (patient.lifestyle.smoking) {
    warnings.push(
      "Smoking detected - may affect treatment outcomes and healing",
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Format skin type from string to SkinType enum
 */
export function formatSkinType(skinType: string | number): SkinType {
  if (typeof skinType === "number") {
    const typeMap: Record<number, SkinType> = {
      1: "fitzpatrick-1",
      2: "fitzpatrick-2",
      3: "fitzpatrick-3",
      4: "fitzpatrick-4",
      5: "fitzpatrick-5",
      6: "fitzpatrick-6",
    };
    return typeMap[skinType] || "fitzpatrick-3";
  }

  if (skinType.includes("fitzpatrick")) {
    return skinType as SkinType;
  }

  // Handle common variations
  const normalizedType = skinType.toLowerCase();
  if (
    normalizedType.includes("very fair") ||
    normalizedType.includes("type 1")
  ) {
    return "fitzpatrick-1";
  }
  if (normalizedType.includes("fair") || normalizedType.includes("type 2")) {
    return "fitzpatrick-2";
  }
  if (normalizedType.includes("medium") || normalizedType.includes("type 3")) {
    return "fitzpatrick-3";
  }
  if (normalizedType.includes("olive") || normalizedType.includes("type 4")) {
    return "fitzpatrick-4";
  }
  if (normalizedType.includes("brown") || normalizedType.includes("type 5")) {
    return "fitzpatrick-5";
  }
  if (normalizedType.includes("dark") || normalizedType.includes("type 6")) {
    return "fitzpatrick-6";
  }

  return "fitzpatrick-3"; // Default to medium skin type
}

/**
 * Calculate risk score from risk assessment
 */
export function calculateRiskScore(riskLevel: string): number {
  const riskMap: Record<string, number> = {
    "very-low": 0.1,
    low: 0.25,
    moderate: 0.5,
    high: 0.75,
    "very-high": 0.9,
  };

  return riskMap[riskLevel] || 0.5;
}

/**
 * Format treatment recommendations for display
 */
export function formatRecommendations(recommendations: string[]): {
  critical: string[];
  important: string[];
  general: string[];
} {
  const critical = recommendations.filter(
    (rec) =>
      rec.toLowerCase().includes("urgent") ||
      rec.toLowerCase().includes("contraindication") ||
      rec.toLowerCase().includes("immediate"),
  );

  const important = recommendations.filter(
    (rec) =>
      rec.toLowerCase().includes("consider") ||
      rec.toLowerCase().includes("recommend") ||
      rec.toLowerCase().includes("significant"),
  );

  const general = recommendations.filter(
    (rec) => !(critical.includes(rec) || important.includes(rec)),
  );

  return { critical, important, general };
}

/**
 * Check if system accuracy meets targets
 */
export async function checkAccuracyTargets(): Promise<{
  overallTarget: boolean;
  individualTargets: Record<string, boolean>;
  recommendations: string[];
}> {
  try {
    const health = await neonproAIIntegration.getSystemHealth();

    const targetAccuracy = 0.85;
    const individualTargets: Record<string, boolean> = {};
    const recommendations: string[] = [];

    for (const [model, accuracy] of Object.entries(health.accuracy)) {
      individualTargets[model] = accuracy >= targetAccuracy;

      if (accuracy < targetAccuracy) {
        recommendations.push(
          `Model ${model} accuracy (${(accuracy * 100).toFixed(1)}%) below target (85%)`,
        );
      }
    }

    const overallAccuracy =
      Object.values(health.accuracy).reduce((sum, acc) => sum + acc, 0) /
      Object.values(health.accuracy).length;
    const overallTarget = overallAccuracy >= targetAccuracy;

    if (!overallTarget) {
      recommendations.push(
        "Overall system accuracy below target - consider model retraining",
      );
    }

    return {
      overallTarget,
      individualTargets,
      recommendations,
    };
  } catch {
    return {
      overallTarget: false,
      individualTargets: {},
      recommendations: [
        "Unable to check accuracy targets - system may be offline",
      ],
    };
  }
}

/**
 * Export commonly used constants
 */
export const AESTHETIC_CONSTANTS = {
  TREATMENT_TYPES: [
    "botox",
    "dermal-fillers",
    "laser-resurfacing",
    "laser-hair-removal",
    "chemical-peel",
    "microneedling",
    "coolsculpting",
    "radiofrequency",
    "photofacial",
    "thread-lift",
  ] as const,

  FACIAL_REGIONS: [
    "forehead",
    "glabella",
    "crows-feet",
    "under-eyes",
    "cheeks",
    "nasolabial-folds",
    "marionette-lines",
    "lips",
    "jawline",
    "neck",
  ] as const,

  BODY_REGIONS: [
    "abdomen",
    "thighs",
    "arms",
    "back",
    "chest",
    "flanks",
    "buttocks",
  ] as const,

  SKIN_TYPES: [
    "fitzpatrick-1",
    "fitzpatrick-2",
    "fitzpatrick-3",
    "fitzpatrick-4",
    "fitzpatrick-5",
    "fitzpatrick-6",
  ] as const,

  ACCURACY_TARGET: 0.85,
  RESPONSE_TIME_TARGET: 2000, // milliseconds

  RISK_LEVELS: {
    VERY_LOW: "very-low",
    LOW: "low",
    MODERATE: "moderate",
    HIGH: "high",
    VERY_HIGH: "very-high",
  } as const,
};
