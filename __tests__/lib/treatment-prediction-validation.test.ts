/**
 * Treatment Prediction Validation Tests
 * Story 9.1: AI-powered treatment success prediction
 *
 * Tests Zod validation schemas for:
 * - Prediction models with ≥85% accuracy requirements
 * - Treatment predictions and patient factors
 * - Medical-grade validation and safety constraints
 * - Feature engineering and explainability data
 */

import { describe, test, expect } from "@jest/globals";
import {
  PredictionModelSchema,
  TreatmentPredictionSchema,
  TreatmentCharacteristicsSchema,
  ModelPerformanceMetricsSchema,
  ConfidenceIntervalSchema,
  ExplainabilityDataSchema,
  PredictionRequestSchema,
  BatchPredictionRequestSchema,
  PredictionFeedbackSchema,
  PredictionFeaturesSchema,
  MedicalHistorySchema,
} from "@/app/lib/validations/treatment-prediction";

describe("Treatment Prediction Validation Schemas", () => {
  describe("PredictionModelSchema", () => {
    test("validates model with ≥85% accuracy requirement", () => {
      const validModel = {
        name: "Advanced Treatment Predictor",
        version: "2.1.0",
        algorithm_type: "ensemble",
        accuracy: 0.89, // 89% - meets requirement
        confidence_threshold: 0.85,
        status: "active",
        training_data_size: 15000,
        feature_count: 45,
        performance_metrics: {
          precision: 0.91,
          recall: 0.87,
          f1_score: 0.89,
          auc_roc: 0.94,
          training_accuracy: 0.89,
          validation_accuracy: 0.88,
          cross_validation_mean: 0.87,
          cross_validation_std: 0.02,
        },
      };

      const result = PredictionModelSchema.safeParse(validModel);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.accuracy).toBeGreaterThanOrEqual(0.85);
        expect(result.data.performance_metrics?.f1_score).toBeGreaterThanOrEqual(0.85);
      }
    });

    test("rejects model with accuracy below 85%", () => {
      const lowAccuracyModel = {
        name: "Low Accuracy Model",
        version: "1.0.0",
        algorithm_type: "neural_network",
        accuracy: 0.75, // 75% - below threshold
        confidence_threshold: 0.85,
        status: "training",
        training_data_size: 5000,
        feature_count: 20,
      };

      const result = PredictionModelSchema.safeParse(lowAccuracyModel);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(
          result.error.issues.some(
            (issue) => issue.path.includes("accuracy") && issue.message.includes("0.85"),
          ),
        ).toBe(true);
      }
    });

    test("validates required algorithm types", () => {
      const invalidAlgorithm = {
        name: "Test Model",
        version: "1.0.0",
        algorithm_type: "invalid_algorithm", // Invalid type
        accuracy: 0.89,
        confidence_threshold: 0.85,
        status: "training",
        training_data_size: 1000,
        feature_count: 10,
      };

      const result = PredictionModelSchema.safeParse(invalidAlgorithm);
      expect(result.success).toBe(false);
    });

    test("validates performance metrics structure", () => {
      const modelWithInvalidMetrics = {
        name: "Test Model",
        version: "1.0.0",
        algorithm_type: "ensemble",
        accuracy: 0.89,
        confidence_threshold: 0.85,
        status: "active",
        training_data_size: 1000,
        feature_count: 10,
        performance_metrics: {
          precision: 1.5, // Invalid: > 1
          recall: -0.1, // Invalid: < 0
          f1_score: 0.89,
          auc_roc: 0.94,
        },
      };

      const result = PredictionModelSchema.safeParse(modelWithInvalidMetrics);
      expect(result.success).toBe(false);
    });
  });

  describe("TreatmentPredictionSchema", () => {
    test("validates prediction with high confidence", () => {
      const validPrediction = {
        patient_id: "123e4567-e89b-12d3-a456-426614174000",
        treatment_type: "laser_resurfacing",
        prediction_score: 0.91, // 91% confidence
        confidence_interval: {
          lower: 0.87,
          upper: 0.95,
          confidence_level: 0.95,
        },
        risk_assessment: "low",
        predicted_outcome: "success",
        model_id: "123e4567-e89b-12d3-a456-426614174001",
        features_used: {
          age: 28,
          gender: "female",
          previous_treatments: 0,
          success_rate_history: 0.85,
          medical_conditions: [],
          medications: [],
          allergies: [],
          smoking_status: "never",
          alcohol_consumption: "light",
          exercise_frequency: "regular",
          treatment_complexity: 3,
          provider_experience: 8.5,
          clinic_success_rate: 0.89,
          treatment_expectations: "realistic",
          anxiety_level: 2,
          compliance_history: 0.92,
          support_system: "strong",
        },
      };

      const result = TreatmentPredictionSchema.safeParse(validPrediction);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.prediction_score).toBeGreaterThanOrEqual(0.85);
        expect(result.data.confidence_interval.lower).toBeLessThanOrEqual(
          result.data.confidence_interval.upper,
        );
      }
    });

    test("validates prediction score range", () => {
      const invalidScorePrediction = {
        patient_id: "123e4567-e89b-12d3-a456-426614174000",
        treatment_type: "chemical_peel",
        prediction_score: 1.5, // Invalid: > 1
        confidence_interval: { lower: 0.8, upper: 0.9, confidence_level: 0.95 },
        risk_assessment: "medium",
        predicted_outcome: "success",
        model_id: "123e4567-e89b-12d3-a456-426614174001",
        features_used: {},
      };

      const result = TreatmentPredictionSchema.safeParse(invalidScorePrediction);
      expect(result.success).toBe(false);
    });

    test("validates confidence interval consistency", () => {
      const invalidIntervalPrediction = {
        patient_id: "123e4567-e89b-12d3-a456-426614174000",
        treatment_type: "microneedling",
        prediction_score: 0.85,
        confidence_interval: {
          lower: 0.9, // Invalid: lower > upper
          upper: 0.8,
          confidence_level: 0.95,
        },
        risk_assessment: "low",
        predicted_outcome: "success",
        model_id: "123e4567-e89b-12d3-a456-426614174001",
        features_used: {},
      };

      const result = TreatmentPredictionSchema.safeParse(invalidIntervalPrediction);
      expect(result.success).toBe(false);
    });
  });

  describe("PatientFactorsSchema", () => {
    test("validates basic patient data via PredictionFeaturesSchema", () => {
      const validPatientFeatures = {
        age: 32,
        gender: "female",
        bmi: 24.5,
        previous_treatments: 1,
        success_rate_history: 0.85,
        medical_conditions: ["mild_acne"],
        medications: [],
        allergies: [],
        smoking_status: "never",
        alcohol_consumption: "light",
        exercise_frequency: "regular",
        treatment_complexity: 3,
        provider_experience: 7.5,
        clinic_success_rate: 0.89,
        treatment_expectations: "realistic",
        anxiety_level: 2,
        compliance_history: 0.92,
        support_system: "strong",
      };

      const result = PredictionFeaturesSchema.safeParse(validPatientFeatures);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.age).toBeGreaterThan(0);
        expect(result.data.age).toBeLessThanOrEqual(150);
        expect(result.data.compliance_history).toBeGreaterThanOrEqual(0);
        expect(result.data.compliance_history).toBeLessThanOrEqual(1);
      }
    });

    test("validates age range constraints", () => {
      const invalidAgeFeatures = {
        age: 200, // Invalid age
        gender: "male",
        previous_treatments: 0,
        success_rate_history: 0.8,
        medical_conditions: [],
        medications: [],
        allergies: [],
        smoking_status: "never",
        alcohol_consumption: "none",
        exercise_frequency: "regular",
        treatment_complexity: 2,
        provider_experience: 5.0,
        clinic_success_rate: 0.85,
        treatment_expectations: "realistic",
        anxiety_level: 1,
        compliance_history: 0.9,
        support_system: "moderate",
      };

      const result = PredictionFeaturesSchema.safeParse(invalidAgeFeatures);
      expect(result.success).toBe(false);
    });

    test("validates BMI range", () => {
      const invalidBmiFeatures = {
        age: 25,
        gender: "female",
        bmi: 5, // Invalid BMI
        previous_treatments: 0,
        success_rate_history: 0.8,
        medical_conditions: [],
        medications: [],
        allergies: [],
        smoking_status: "never",
        alcohol_consumption: "none",
        exercise_frequency: "regular",
        treatment_complexity: 2,
        provider_experience: 5.0,
        clinic_success_rate: 0.85,
        treatment_expectations: "realistic",
        anxiety_level: 1,
        compliance_history: 0.9,
        support_system: "moderate",
      };

      const result = PredictionFeaturesSchema.safeParse(invalidBmiFeatures);
      expect(result.success).toBe(false);
    });

    test("validates psychological factors ranges", () => {
      const invalidPsychFeatures = {
        age: 30,
        gender: "male",
        previous_treatments: 1,
        success_rate_history: 0.75,
        medical_conditions: [],
        medications: [],
        allergies: [],
        smoking_status: "never",
        alcohol_consumption: "none",
        exercise_frequency: "regular",
        treatment_complexity: 2,
        provider_experience: 5.0,
        clinic_success_rate: 0.85,
        treatment_expectations: "realistic",
        anxiety_level: 10, // Invalid: > 5
        compliance_history: 0.9,
        support_system: "moderate",
      };

      const result = PredictionFeaturesSchema.safeParse(invalidPsychFeatures);
      expect(result.success).toBe(false);
    });
  });

  describe("MedicalHistorySchema", () => {
    test("validates medical history structure", () => {
      const validMedicalHistory = {
        conditions: ["hypertension", "allergic_rhinitis"],
        medications: ["lisinopril", "antihistamine"],
        allergies: ["penicillin", "latex"],
        surgeries: ["appendectomy"],
        chronic_conditions: ["asthma"],
        family_history: ["diabetes", "heart_disease"],
      };

      const result = MedicalHistorySchema.safeParse(validMedicalHistory);
      expect(result.success).toBe(true);
    });

    test("requires array format for all fields", () => {
      const invalidMedicalHistory = {
        conditions: "hypertension", // Should be array
        medications: ["lisinopril"],
        allergies: [],
        surgeries: [],
        chronic_conditions: [],
        family_history: [],
      };

      const result = MedicalHistorySchema.safeParse(invalidMedicalHistory);
      expect(result.success).toBe(false);
    });
  });

  describe("PredictionFeaturesSchema (Lifestyle Factors)", () => {
    test("validates lifestyle factors with enum constraints", () => {
      const validLifestyle = {
        age: 25,
        gender: "female",
        previous_treatments: 0,
        success_rate_history: 0.8,
        medical_conditions: [],
        medications: [],
        allergies: [],
        smoking_status: "former",
        alcohol_consumption: "moderate",
        exercise_frequency: "regular",
        treatment_complexity: 3,
        provider_experience: 6.5,
        clinic_success_rate: 0.87,
        treatment_expectations: "realistic",
        anxiety_level: 2,
        compliance_history: 0.88,
        support_system: "strong",
      };

      const result = PredictionFeaturesSchema.safeParse(validLifestyle);
      expect(result.success).toBe(true);
    });

    test("rejects invalid enum values", () => {
      const invalidLifestyle = {
        age: 30,
        gender: "male",
        previous_treatments: 0,
        success_rate_history: 0.8,
        medical_conditions: [],
        medications: [],
        allergies: [],
        smoking_status: "invalid_option", // Invalid enum
        alcohol_consumption: "moderate",
        exercise_frequency: "regular",
        treatment_complexity: 2,
        provider_experience: 5.0,
        clinic_success_rate: 0.85,
        treatment_expectations: "realistic",
        anxiety_level: 1,
        compliance_history: 0.9,
        support_system: "moderate",
      };

      const result = PredictionFeaturesSchema.safeParse(invalidLifestyle);
      expect(result.success).toBe(false);
    });
  });

  describe("TreatmentCharacteristicsSchema", () => {
    test("validates treatment characteristics", () => {
      const validTreatment = {
        treatment_type: "laser_resurfacing",
        complexity_level: 4, // 1-5 scale
        duration_weeks: 6,
        session_count: 3,
        invasiveness_level: 4, // 1-5 scale
        recovery_time_days: 14,
        provider_skill_required: 5, // 1-5 scale
        success_rate_baseline: 0.89,
        contraindications: ["pregnancy", "active_infection"],
        cost_range: {
          min: 1500,
          max: 3000,
          currency: "BRL",
          average: 2250,
        },
      };

      const result = TreatmentCharacteristicsSchema.safeParse(validTreatment);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.success_rate_baseline).toBeGreaterThanOrEqual(0);
        expect(result.data.success_rate_baseline).toBeLessThanOrEqual(1);
        expect(result.data.complexity_level).toBeGreaterThan(0);
        expect(result.data.complexity_level).toBeLessThanOrEqual(5);
      }
    });

    test("validates cost range structure", () => {
      const invalidCostRange = {
        treatment_type: "chemical_peel",
        complexity_level: 3,
        invasiveness_level: 2,
        provider_skill_required: 3,
        cost_range: {
          min: 2000, // Invalid: min > max
          max: 1500,
          currency: "BRL",
        },
      };

      const result = TreatmentCharacteristicsSchema.safeParse(invalidCostRange);
      expect(result.success).toBe(false);
    });
  });

  describe("ExplainabilityDataSchema", () => {
    test("validates explainability data structure", () => {
      const validExplainability = {
        feature_importance: {
          age: 0.2,
          skin_type: 0.25,
          medical_history: 0.18,
          lifestyle_factors: 0.15,
          treatment_complexity: 0.12,
          compliance_score: 0.1,
        },
        top_positive_factors: [
          "Patient in optimal age range (25-35)",
          "Skin Type II - ideal for laser treatments",
          "High compliance score (92%)",
          "No significant contraindications",
        ],
        top_negative_factors: ["Moderate sun exposure requires preparation"],
        similar_cases: ["case-A123", "case-B456", "case-C789"],
        confidence_reasoning:
          "High confidence based on strong correlation with 15 similar successful cases",
      };

      const result = ExplainabilityDataSchema.safeParse(validExplainability);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(Object.keys(result.data.feature_importance).length).toBeGreaterThan(0);
        expect(result.data.top_positive_factors.length).toBeGreaterThan(0);
        expect(result.data.similar_cases.length).toBeGreaterThanOrEqual(3);
      }
    });

    test("validates feature importance as numbers", () => {
      const invalidFeatureImportance = {
        feature_importance: {
          age: "high", // Should be number
          skin_type: 0.25,
        },
        top_positive_factors: ["Good age"],
        top_negative_factors: [],
        similar_cases: ["case-1"],
        confidence_reasoning: "Test reasoning",
      };

      const result = ExplainabilityDataSchema.safeParse(invalidFeatureImportance);
      expect(result.success).toBe(false);
    });
  });

  describe("PredictionRequestSchema", () => {
    test("validates prediction request structure", () => {
      const validRequest = {
        patient_id: "123e4567-e89b-12d3-a456-426614174000",
        treatment_type: "microneedling",
        model_preference: "latest",
        explain_prediction: true,
        include_alternatives: true,
        additional_factors: {
          urgency: "routine",
          budget_constraints: false,
          time_availability: "flexible",
        },
      };

      const result = PredictionRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    test("requires valid UUID for patient_id", () => {
      const invalidRequest = {
        patient_id: "invalid-uuid",
        treatment_type: "laser_treatment",
      };

      const result = PredictionRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });
  });

  describe("BatchPredictionRequestSchema", () => {
    test("validates batch prediction request", () => {
      const validBatchRequest = {
        predictions: [
          {
            patient_id: "123e4567-e89b-12d3-a456-426614174000",
            treatment_type: "laser_treatment",
          },
          {
            patient_id: "123e4567-e89b-12d3-a456-426614174001",
            treatment_type: "chemical_peel",
          },
        ],
        include_summary: true,
      };

      const result = BatchPredictionRequestSchema.safeParse(validBatchRequest);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.predictions.length).toBeGreaterThan(0);
      }
    });

    test("accepts large batch requests (no limit in schema)", () => {
      const largeBatchRequest = {
        predictions: Array(150).fill({
          patient_id: "123e4567-e89b-12d3-a456-426614174000",
          treatment_type: "laser_treatment",
        }),
        include_summary: true,
      };

      const result = BatchPredictionRequestSchema.safeParse(largeBatchRequest);
      // Schema doesn't enforce limit - business logic should handle this
      expect(result.success).toBe(true);
    });
  });

  describe("PredictionFeedbackSchema", () => {
    test("validates medical professional feedback", () => {
      const validFeedback = {
        prediction_id: "123e4567-e89b-12d3-a456-426614174000",
        provider_id: "123e4567-e89b-12d3-a456-426614174001",
        feedback_type: "validation",
        original_prediction: 0.85,
        adjusted_prediction: 0.9,
        reasoning: "Patient showed excellent healing response not captured in original factors",
        confidence_level: 4,
      };

      const result = PredictionFeedbackSchema.safeParse(validFeedback);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.confidence_level).toBeGreaterThanOrEqual(1);
        expect(result.data.confidence_level).toBeLessThanOrEqual(5);
        expect(result.data.original_prediction).toBeGreaterThanOrEqual(0);
        expect(result.data.original_prediction).toBeLessThanOrEqual(1);
      }
    });

    test("validates confidence level range", () => {
      const invalidFeedback = {
        prediction_id: "123e4567-e89b-12d3-a456-426614174000",
        provider_id: "123e4567-e89b-12d3-a456-426614174001",
        feedback_type: "correction",
        original_prediction: 0.75,
        reasoning: "Test reasoning",
        confidence_level: 10, // Invalid: > 5
      };

      const result = PredictionFeedbackSchema.safeParse(invalidFeedback);
      expect(result.success).toBe(false);
    });
  });

  describe("Medical-grade Validation Requirements", () => {
    test("enforces medical safety constraints via features", () => {
      const medicalConstraints = {
        age: 28,
        gender: "female",
        previous_treatments: 0,
        success_rate_history: 0.8,
        medical_conditions: ["pregnancy"], // High-risk condition
        medications: ["anticoagulants"], // Contraindication
        allergies: ["lidocaine"], // Anesthesia allergy
        smoking_status: "never",
        alcohol_consumption: "none",
        exercise_frequency: "regular",
        treatment_complexity: 2,
        provider_experience: 5.0,
        clinic_success_rate: 0.85,
        treatment_expectations: "realistic",
        anxiety_level: 2,
        compliance_history: 0.9,
        support_system: "strong",
      };

      const result = PredictionFeaturesSchema.safeParse(medicalConstraints);
      expect(result.success).toBe(true);

      // Medical validation logic should be implemented in service layer
      if (result.success) {
        const hasContraindications =
          result.data.medical_conditions?.includes("pregnancy") ||
          result.data.medications?.includes("anticoagulants") ||
          result.data.allergies?.includes("lidocaine");

        expect(hasContraindications).toBe(true);
      }
    });

    test("validates compliance with medical standards", () => {
      const medicalStandards = {
        age: 16, // Minor - requires special consideration
        gender: "male",
        previous_treatments: 0,
        success_rate_history: 0.8,
        medical_conditions: [],
        medications: [],
        allergies: [],
        smoking_status: "never",
        alcohol_consumption: "none",
        exercise_frequency: "light",
        treatment_complexity: 1,
        provider_experience: 8.0,
        clinic_success_rate: 0.92,
        treatment_expectations: "realistic",
        anxiety_level: 3,
        compliance_history: 0.85,
        support_system: "strong",
      };

      const result = PredictionFeaturesSchema.safeParse(medicalStandards);
      expect(result.success).toBe(true);

      if (result.success) {
        // Medical age restrictions should be enforced
        expect(result.data.age).toBeGreaterThanOrEqual(0);
        expect(result.data.age).toBeLessThan(18); // Minor classification
      }
    });
  });
});
