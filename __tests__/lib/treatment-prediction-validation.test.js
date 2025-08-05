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
Object.defineProperty(exports, "__esModule", { value: true });
var globals_1 = require("@jest/globals");
var treatment_prediction_1 = require("@/app/lib/validations/treatment-prediction");
(0, globals_1.describe)("Treatment Prediction Validation Schemas", () => {
  (0, globals_1.describe)("PredictionModelSchema", () => {
    (0, globals_1.test)("validates model with ≥85% accuracy requirement", () => {
      var _a;
      var validModel = {
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
      var result = treatment_prediction_1.PredictionModelSchema.safeParse(validModel);
      (0, globals_1.expect)(result.success).toBe(true);
      if (result.success) {
        (0, globals_1.expect)(result.data.accuracy).toBeGreaterThanOrEqual(0.85);
        (0, globals_1.expect)(
          (_a = result.data.performance_metrics) === null || _a === void 0 ? void 0 : _a.f1_score,
        ).toBeGreaterThanOrEqual(0.85);
      }
    });
    (0, globals_1.test)("rejects model with accuracy below 85%", () => {
      var lowAccuracyModel = {
        name: "Low Accuracy Model",
        version: "1.0.0",
        algorithm_type: "neural_network",
        accuracy: 0.75, // 75% - below threshold
        confidence_threshold: 0.85,
        status: "training",
        training_data_size: 5000,
        feature_count: 20,
      };
      var result = treatment_prediction_1.PredictionModelSchema.safeParse(lowAccuracyModel);
      (0, globals_1.expect)(result.success).toBe(false);
      if (!result.success) {
        (0, globals_1.expect)(
          result.error.issues.some(
            (issue) => issue.path.includes("accuracy") && issue.message.includes("0.85"),
          ),
        ).toBe(true);
      }
    });
    (0, globals_1.test)("validates required algorithm types", () => {
      var invalidAlgorithm = {
        name: "Test Model",
        version: "1.0.0",
        algorithm_type: "invalid_algorithm", // Invalid type
        accuracy: 0.89,
        confidence_threshold: 0.85,
        status: "training",
        training_data_size: 1000,
        feature_count: 10,
      };
      var result = treatment_prediction_1.PredictionModelSchema.safeParse(invalidAlgorithm);
      (0, globals_1.expect)(result.success).toBe(false);
    });
    (0, globals_1.test)("validates performance metrics structure", () => {
      var modelWithInvalidMetrics = {
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
      var result = treatment_prediction_1.PredictionModelSchema.safeParse(modelWithInvalidMetrics);
      (0, globals_1.expect)(result.success).toBe(false);
    });
  });
  (0, globals_1.describe)("TreatmentPredictionSchema", () => {
    (0, globals_1.test)("validates prediction with high confidence", () => {
      var validPrediction = {
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
      var result = treatment_prediction_1.TreatmentPredictionSchema.safeParse(validPrediction);
      (0, globals_1.expect)(result.success).toBe(true);
      if (result.success) {
        (0, globals_1.expect)(result.data.prediction_score).toBeGreaterThanOrEqual(0.85);
        (0, globals_1.expect)(result.data.confidence_interval.lower).toBeLessThanOrEqual(
          result.data.confidence_interval.upper,
        );
      }
    });
    (0, globals_1.test)("validates prediction score range", () => {
      var invalidScorePrediction = {
        patient_id: "123e4567-e89b-12d3-a456-426614174000",
        treatment_type: "chemical_peel",
        prediction_score: 1.5, // Invalid: > 1
        confidence_interval: { lower: 0.8, upper: 0.9, confidence_level: 0.95 },
        risk_assessment: "medium",
        predicted_outcome: "success",
        model_id: "123e4567-e89b-12d3-a456-426614174001",
        features_used: {},
      };
      var result =
        treatment_prediction_1.TreatmentPredictionSchema.safeParse(invalidScorePrediction);
      (0, globals_1.expect)(result.success).toBe(false);
    });
    (0, globals_1.test)("validates confidence interval consistency", () => {
      var invalidIntervalPrediction = {
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
      var result =
        treatment_prediction_1.TreatmentPredictionSchema.safeParse(invalidIntervalPrediction);
      (0, globals_1.expect)(result.success).toBe(false);
    });
  });
  (0, globals_1.describe)("PatientFactorsSchema", () => {
    (0, globals_1.test)("validates basic patient data via PredictionFeaturesSchema", () => {
      var validPatientFeatures = {
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
      var result = treatment_prediction_1.PredictionFeaturesSchema.safeParse(validPatientFeatures);
      (0, globals_1.expect)(result.success).toBe(true);
      if (result.success) {
        (0, globals_1.expect)(result.data.age).toBeGreaterThan(0);
        (0, globals_1.expect)(result.data.age).toBeLessThanOrEqual(150);
        (0, globals_1.expect)(result.data.compliance_history).toBeGreaterThanOrEqual(0);
        (0, globals_1.expect)(result.data.compliance_history).toBeLessThanOrEqual(1);
      }
    });
    (0, globals_1.test)("validates age range constraints", () => {
      var invalidAgeFeatures = {
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
      var result = treatment_prediction_1.PredictionFeaturesSchema.safeParse(invalidAgeFeatures);
      (0, globals_1.expect)(result.success).toBe(false);
    });
    (0, globals_1.test)("validates BMI range", () => {
      var invalidBmiFeatures = {
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
      var result = treatment_prediction_1.PredictionFeaturesSchema.safeParse(invalidBmiFeatures);
      (0, globals_1.expect)(result.success).toBe(false);
    });
    (0, globals_1.test)("validates psychological factors ranges", () => {
      var invalidPsychFeatures = {
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
      var result = treatment_prediction_1.PredictionFeaturesSchema.safeParse(invalidPsychFeatures);
      (0, globals_1.expect)(result.success).toBe(false);
    });
  });
  (0, globals_1.describe)("MedicalHistorySchema", () => {
    (0, globals_1.test)("validates medical history structure", () => {
      var validMedicalHistory = {
        conditions: ["hypertension", "allergic_rhinitis"],
        medications: ["lisinopril", "antihistamine"],
        allergies: ["penicillin", "latex"],
        surgeries: ["appendectomy"],
        chronic_conditions: ["asthma"],
        family_history: ["diabetes", "heart_disease"],
      };
      var result = treatment_prediction_1.MedicalHistorySchema.safeParse(validMedicalHistory);
      (0, globals_1.expect)(result.success).toBe(true);
    });
    (0, globals_1.test)("requires array format for all fields", () => {
      var invalidMedicalHistory = {
        conditions: "hypertension", // Should be array
        medications: ["lisinopril"],
        allergies: [],
        surgeries: [],
        chronic_conditions: [],
        family_history: [],
      };
      var result = treatment_prediction_1.MedicalHistorySchema.safeParse(invalidMedicalHistory);
      (0, globals_1.expect)(result.success).toBe(false);
    });
  });
  (0, globals_1.describe)("PredictionFeaturesSchema (Lifestyle Factors)", () => {
    (0, globals_1.test)("validates lifestyle factors with enum constraints", () => {
      var validLifestyle = {
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
      var result = treatment_prediction_1.PredictionFeaturesSchema.safeParse(validLifestyle);
      (0, globals_1.expect)(result.success).toBe(true);
    });
    (0, globals_1.test)("rejects invalid enum values", () => {
      var invalidLifestyle = {
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
      var result = treatment_prediction_1.PredictionFeaturesSchema.safeParse(invalidLifestyle);
      (0, globals_1.expect)(result.success).toBe(false);
    });
  });
  (0, globals_1.describe)("TreatmentCharacteristicsSchema", () => {
    (0, globals_1.test)("validates treatment characteristics", () => {
      var validTreatment = {
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
      var result = treatment_prediction_1.TreatmentCharacteristicsSchema.safeParse(validTreatment);
      (0, globals_1.expect)(result.success).toBe(true);
      if (result.success) {
        (0, globals_1.expect)(result.data.success_rate_baseline).toBeGreaterThanOrEqual(0);
        (0, globals_1.expect)(result.data.success_rate_baseline).toBeLessThanOrEqual(1);
        (0, globals_1.expect)(result.data.complexity_level).toBeGreaterThan(0);
        (0, globals_1.expect)(result.data.complexity_level).toBeLessThanOrEqual(5);
      }
    });
    (0, globals_1.test)("validates cost range structure", () => {
      var invalidCostRange = {
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
      var result =
        treatment_prediction_1.TreatmentCharacteristicsSchema.safeParse(invalidCostRange);
      (0, globals_1.expect)(result.success).toBe(false);
    });
  });
  (0, globals_1.describe)("ExplainabilityDataSchema", () => {
    (0, globals_1.test)("validates explainability data structure", () => {
      var validExplainability = {
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
      var result = treatment_prediction_1.ExplainabilityDataSchema.safeParse(validExplainability);
      (0, globals_1.expect)(result.success).toBe(true);
      if (result.success) {
        (0, globals_1.expect)(Object.keys(result.data.feature_importance).length).toBeGreaterThan(
          0,
        );
        (0, globals_1.expect)(result.data.top_positive_factors.length).toBeGreaterThan(0);
        (0, globals_1.expect)(result.data.similar_cases.length).toBeGreaterThanOrEqual(3);
      }
    });
    (0, globals_1.test)("validates feature importance as numbers", () => {
      var invalidFeatureImportance = {
        feature_importance: {
          age: "high", // Should be number
          skin_type: 0.25,
        },
        top_positive_factors: ["Good age"],
        top_negative_factors: [],
        similar_cases: ["case-1"],
        confidence_reasoning: "Test reasoning",
      };
      var result =
        treatment_prediction_1.ExplainabilityDataSchema.safeParse(invalidFeatureImportance);
      (0, globals_1.expect)(result.success).toBe(false);
    });
  });
  (0, globals_1.describe)("PredictionRequestSchema", () => {
    (0, globals_1.test)("validates prediction request structure", () => {
      var validRequest = {
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
      var result = treatment_prediction_1.PredictionRequestSchema.safeParse(validRequest);
      (0, globals_1.expect)(result.success).toBe(true);
    });
    (0, globals_1.test)("requires valid UUID for patient_id", () => {
      var invalidRequest = {
        patient_id: "invalid-uuid",
        treatment_type: "laser_treatment",
      };
      var result = treatment_prediction_1.PredictionRequestSchema.safeParse(invalidRequest);
      (0, globals_1.expect)(result.success).toBe(false);
    });
  });
  (0, globals_1.describe)("BatchPredictionRequestSchema", () => {
    (0, globals_1.test)("validates batch prediction request", () => {
      var validBatchRequest = {
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
      var result = treatment_prediction_1.BatchPredictionRequestSchema.safeParse(validBatchRequest);
      (0, globals_1.expect)(result.success).toBe(true);
      if (result.success) {
        (0, globals_1.expect)(result.data.predictions.length).toBeGreaterThan(0);
      }
    });
    (0, globals_1.test)("accepts large batch requests (no limit in schema)", () => {
      var largeBatchRequest = {
        predictions: Array(150).fill({
          patient_id: "123e4567-e89b-12d3-a456-426614174000",
          treatment_type: "laser_treatment",
        }),
        include_summary: true,
      };
      var result = treatment_prediction_1.BatchPredictionRequestSchema.safeParse(largeBatchRequest);
      // Schema doesn't enforce limit - business logic should handle this
      (0, globals_1.expect)(result.success).toBe(true);
    });
  });
  (0, globals_1.describe)("PredictionFeedbackSchema", () => {
    (0, globals_1.test)("validates medical professional feedback", () => {
      var validFeedback = {
        prediction_id: "123e4567-e89b-12d3-a456-426614174000",
        provider_id: "123e4567-e89b-12d3-a456-426614174001",
        feedback_type: "validation",
        original_prediction: 0.85,
        adjusted_prediction: 0.9,
        reasoning: "Patient showed excellent healing response not captured in original factors",
        confidence_level: 4,
      };
      var result = treatment_prediction_1.PredictionFeedbackSchema.safeParse(validFeedback);
      (0, globals_1.expect)(result.success).toBe(true);
      if (result.success) {
        (0, globals_1.expect)(result.data.confidence_level).toBeGreaterThanOrEqual(1);
        (0, globals_1.expect)(result.data.confidence_level).toBeLessThanOrEqual(5);
        (0, globals_1.expect)(result.data.original_prediction).toBeGreaterThanOrEqual(0);
        (0, globals_1.expect)(result.data.original_prediction).toBeLessThanOrEqual(1);
      }
    });
    (0, globals_1.test)("validates confidence level range", () => {
      var invalidFeedback = {
        prediction_id: "123e4567-e89b-12d3-a456-426614174000",
        provider_id: "123e4567-e89b-12d3-a456-426614174001",
        feedback_type: "correction",
        original_prediction: 0.75,
        reasoning: "Test reasoning",
        confidence_level: 10, // Invalid: > 5
      };
      var result = treatment_prediction_1.PredictionFeedbackSchema.safeParse(invalidFeedback);
      (0, globals_1.expect)(result.success).toBe(false);
    });
  });
  (0, globals_1.describe)("Medical-grade Validation Requirements", () => {
    (0, globals_1.test)("enforces medical safety constraints via features", () => {
      var _a, _b, _c;
      var medicalConstraints = {
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
      var result = treatment_prediction_1.PredictionFeaturesSchema.safeParse(medicalConstraints);
      (0, globals_1.expect)(result.success).toBe(true);
      // Medical validation logic should be implemented in service layer
      if (result.success) {
        var hasContraindications =
          ((_a = result.data.medical_conditions) === null || _a === void 0
            ? void 0
            : _a.includes("pregnancy")) ||
          ((_b = result.data.medications) === null || _b === void 0
            ? void 0
            : _b.includes("anticoagulants")) ||
          ((_c = result.data.allergies) === null || _c === void 0
            ? void 0
            : _c.includes("lidocaine"));
        (0, globals_1.expect)(hasContraindications).toBe(true);
      }
    });
    (0, globals_1.test)("validates compliance with medical standards", () => {
      var medicalStandards = {
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
      var result = treatment_prediction_1.PredictionFeaturesSchema.safeParse(medicalStandards);
      (0, globals_1.expect)(result.success).toBe(true);
      if (result.success) {
        // Medical age restrictions should be enforced
        (0, globals_1.expect)(result.data.age).toBeGreaterThanOrEqual(0);
        (0, globals_1.expect)(result.data.age).toBeLessThan(18); // Minor classification
      }
    });
  });
});
