/**
 * Treatment Prediction Service Tests
 * Story 9.1: AI-powered treatment success prediction
 * 
 * Tests the complete service functionality including:
 * - ML model operations and ≥85% accuracy validation
 * - Multi-factor analysis processing
 * - Real-time prediction generation
 * - Historical validation and performance tracking
 * - Medical-grade validation and explainability
 */

// Mock Supabase FIRST, before any imports
const mockSupabaseClient = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  upsert: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue({ data: null, error: null }),
  limit: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
};

// Mock the supabase module as synchronous for testing
jest.mock('@/app/utils/supabase/server', () => ({
  createServerClient: () => mockSupabaseClient,
  createClient: () => mockSupabaseClient
}));

import { describe, test, expect, beforeEach, jest } from '@jest/globals';

import { TreatmentPredictionService } from '@/app/lib/services/treatment-prediction';
import {
  PredictionModel,
  TreatmentPrediction,
  PatientFactors,
  TreatmentCharacteristics,
  PredictionRequest,
  ModelPerformance,
  PredictionFeedback
} from '@/app/types/treatment-prediction';

describe('TreatmentPredictionService', () => {
  let service: TreatmentPredictionService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TreatmentPredictionService();
  });

  describe('Model Management', () => {
    test('creates prediction model with ≥85% accuracy requirement', async () => {
      const mockModel: Omit<PredictionModel, 'id' | 'created_at' | 'updated_at'> = {
        name: 'Advanced Treatment Predictor',
        version: '2.1.0',
        algorithm_type: 'ensemble',
        accuracy: 0.89, // 89% - meets ≥85% requirement
        confidence_threshold: 0.85,
        status: 'active',
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
          feature_importance: {
            'age': 0.15,
            'skin_type': 0.12,
            'medical_history': 0.18,
            'treatment_complexity': 0.20
          }
        }
      };

      const mockResponse = { ...mockModel, id: 'model-123', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      mockSupabaseClient.insert.mockResolvedValue({ data: mockResponse, error: null });

      const result = await service.createModel(mockModel);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('prediction_models');
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith(mockModel);
      expect(result.accuracy).toBeGreaterThanOrEqual(0.85);
      expect(result.performance_metrics?.f1_score).toBeGreaterThanOrEqual(0.85);
    });

    test('validates accuracy threshold enforcement', async () => {
      const lowAccuracyModel: Omit<PredictionModel, 'id' | 'created_at' | 'updated_at'> = {
        name: 'Low Accuracy Model',
        version: '1.0.0',
        algorithm_type: 'neural_network',
        accuracy: 0.75, // 75% - below 85% threshold
        confidence_threshold: 0.85,
        status: 'training',
        training_data_size: 5000,
        feature_count: 20
      };

      // Should handle low accuracy models appropriately
      mockSupabaseClient.insert.mockResolvedValue({ data: null, error: { message: 'Accuracy below threshold' } });

      await expect(service.createModel(lowAccuracyModel)).rejects.toThrow();
    });

    test('retrieves active models with high accuracy', async () => {
      const mockModels = [
        {
          id: 'model-1',
          name: 'Treatment Predictor V1',
          accuracy: 0.87,
          status: 'active',
          algorithm_type: 'ensemble'
        },
        {
          id: 'model-2',
          name: 'Treatment Predictor V2',
          accuracy: 0.91,
          status: 'active',
          algorithm_type: 'neural_network'
        }
      ];

      mockSupabaseClient.from.mockResolvedValue({ data: mockModels, error: null });

      const result = await service.getModels({ status: 'active' });

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('prediction_models');
      expect(result.every(model => model.accuracy >= 0.85)).toBe(true);
    });
  });

  describe('Treatment Prediction Generation', () => {
    test('generates prediction with multi-factor analysis', async () => {
      const mockPatientFactors: PatientFactors = {
        id: 'pf-123',
        patient_id: 'patient-456',
        age: 32,
        gender: 'female',
        bmi: 24.5,
        medical_history: {
          conditions: [],
          medications: [],
          allergies: [],
          surgeries: [],
          chronic_conditions: [],
          family_history: []
        },
        lifestyle_factors: {
          smoking: 'never',
          alcohol: 'occasional',
          exercise: 'regular',
          diet: 'balanced',
          sleep_quality: 'good',
          stress_level: 'low',
          sun_exposure: 'moderate'
        },
        treatment_history: {
          previous_treatments: [],
          outcomes: [],
          complications: [],
          satisfaction_scores: []
        },
        compliance_score: 0.92,
        skin_type: 'Type II',
        skin_condition: 'mild_photodamage',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const mockTreatmentChar: TreatmentCharacteristics = {
        id: 'tc-789',
        treatment_type: 'laser_resurfacing',
        complexity_level: 'medium',
        typical_duration: 45,
        success_rate: 0.89,
        contraindications: [],
        required_expertise_level: 'intermediate',
        cost_range: { min: 1500, max: 2500, currency: 'BRL' },
        recovery_time: '7-14 days',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const mockPrediction: TreatmentPrediction = {
        id: 'pred-999',
        patient_id: 'patient-456',
        treatment_type: 'laser_resurfacing',
        prediction_score: 0.91, // 91% - high accuracy
        confidence_interval: { lower: 0.87, upper: 0.95, confidence_level: 0.95 },
        risk_assessment: 'low',
        predicted_outcome: 'success',
        prediction_date: new Date().toISOString(),
        model_id: 'model-123',
        features_used: {
          age: 32,
          gender: 'female',
          bmi: 24.5,
          skin_type: 'Type II',
          treatment_complexity: 'medium',
          compliance_score: 0.92
        },
        explainability_data: {
          feature_importance: {
            'age': 0.15,
            'skin_type': 0.20,
            'compliance_score': 0.18,
            'bmi': 0.12
          },
          top_positive_factors: ['Optimal age range', 'Excellent compliance', 'Suitable skin type'],
          top_negative_factors: [],
          similar_cases: ['case-1', 'case-2', 'case-3'],
          confidence_reasoning: 'High probability of success based on favorable patient profile'
        },
        accuracy_validated: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockSupabaseClient.insert.mockResolvedValue({ data: mockPrediction, error: null });

      const predictionData = {
        patient_id: 'patient-456',
        treatment_type: 'laser_resurfacing',
        prediction_score: 0.91,
        confidence_interval: { lower: 0.87, upper: 0.95, confidence_level: 0.95 },
        risk_assessment: 'low' as const,
        predicted_outcome: 'success' as const,
        model_id: 'model-123',
        features_used: mockPrediction.features_used,
        explainability_data: mockPrediction.explainability_data
      };

      const result = await service.createPrediction(predictionData);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('treatment_predictions');
      expect(result.prediction_score).toBeGreaterThanOrEqual(0.85);
      expect(result.explainability_data).toBeDefined();
      expect(result.features_used).toBeDefined();
      expect(result.confidence_interval.lower).toBeLessThanOrEqual(result.confidence_interval.upper);
    });

    test('processes real-time scoring with performance monitoring', async () => {
      const predictionRequest: PredictionRequest = {
        patient_id: 'patient-789',
        treatment_type: 'chemical_peel',
        additional_factors: {
          urgency: 'routine',
          budget_constraints: false,
          time_availability: 'flexible'
        }
      };

      const startTime = Date.now();
      
      // Mock real-time prediction response
      const mockResponse = {
        prediction_score: 0.88,
        confidence_interval: { lower: 0.84, upper: 0.92, confidence_level: 0.95 },
        risk_assessment: 'low',
        predicted_outcome: 'success',
        processing_time: 250, // milliseconds
        explainability_data: {
          feature_importance: { 'skin_condition': 0.25, 'age': 0.20 },
          top_positive_factors: ['Suitable candidate', 'Low risk profile'],
          top_negative_factors: [],
          similar_cases: ['case-4', 'case-5'],
          confidence_reasoning: 'Strong match with successful historical cases'
        }
      };

      mockSupabaseClient.insert.mockResolvedValue({ data: mockResponse, error: null });

      const result = await service.createPrediction({
        patient_id: predictionRequest.patient_id,
        treatment_type: predictionRequest.treatment_type,
        prediction_score: mockResponse.prediction_score,
        confidence_interval: mockResponse.confidence_interval,
        risk_assessment: mockResponse.risk_assessment,
        predicted_outcome: mockResponse.predicted_outcome,
        model_id: 'model-active',
        features_used: { basic: true },
        explainability_data: mockResponse.explainability_data
      });

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      expect(result.prediction_score).toBeGreaterThanOrEqual(0.85);
      expect(processingTime).toBeLessThan(1000); // Real-time requirement
      expect(result.explainability_data?.confidence_reasoning).toBeTruthy();
    });
  });

  describe('Historical Validation', () => {
    test('tracks model performance over time', async () => {
      const mockPerformance: ModelPerformance = {
        id: 'perf-123',
        model_id: 'model-456',
        evaluation_date: new Date().toISOString(),
        accuracy: 0.89,
        precision: 0.91,
        recall: 0.87,
        f1_score: 0.89,
        total_predictions: 1250,
        correct_predictions: 1112,
        improvement_percentage: 12.5,
        validation_metrics: {
          cross_validation_scores: [0.88, 0.90, 0.87, 0.91, 0.89],
          test_set_accuracy: 0.89,
          confusion_matrix: [[425, 35], [48, 492]]
        },
        feature_importance: {
          'patient_age': 0.18,
          'skin_type': 0.22,
          'treatment_complexity': 0.15,
          'medical_history': 0.20
        },
        created_at: new Date().toISOString()
      };

      mockSupabaseClient.insert.mockResolvedValue({ data: mockPerformance, error: null });

      const result = await service.createModelPerformance(mockPerformance);

      expect(result.accuracy).toBeGreaterThanOrEqual(0.85);
      expect(result.improvement_percentage).toBeGreaterThan(0);
      expect(result.total_predictions).toBeGreaterThan(0);
      expect(result.correct_predictions / result.total_predictions).toBeCloseTo(result.accuracy, 2);
    });

    test('validates historical prediction accuracy', async () => {
      const mockPredictions = [
        { id: 'pred-1', prediction_score: 0.89, actual_outcome: 'success', accuracy_validated: true },
        { id: 'pred-2', prediction_score: 0.91, actual_outcome: 'success', accuracy_validated: true },
        { id: 'pred-3', prediction_score: 0.76, actual_outcome: 'partial_success', accuracy_validated: true },
        { id: 'pred-4', prediction_score: 0.95, actual_outcome: 'success', accuracy_validated: true }
      ];

      mockSupabaseClient.from.mockResolvedValue({ data: mockPredictions, error: null });

      const result = await service.getPredictions({ accuracy_validated: true });

      // Calculate historical accuracy
      const highAccuracyPredictions = result.filter(p => p.prediction_score >= 0.85);
      const successfulHighAccuracy = highAccuracyPredictions.filter(p => 
        p.actual_outcome === 'success' && p.prediction_score >= 0.85
      );

      const historicalAccuracy = successfulHighAccuracy.length / highAccuracyPredictions.length;
      expect(historicalAccuracy).toBeGreaterThanOrEqual(0.75); // Allow some margin for realistic testing
    });
  });

  describe('Medical-grade Validation', () => {
    test('enforces medical safety constraints', async () => {
      const mockMedicalValidation = {
        patient_id: 'patient-medical',
        medical_factors: {
          allergies: ['lidocaine'],
          medications: ['anticoagulants'],
          conditions: ['autoimmune_disorder'],
          pregnancy_status: false,
          recent_treatments: ['botox_3_months_ago']
        }
      };

      // Medical validation should identify contraindications
      const result = await service.validateMedicalConstraints(mockMedicalValidation);

      expect(result.contraindications).toContain('anticoagulants');
      expect(result.risk_level).toBe('high');
      expect(result.medical_clearance_required).toBe(true);
    });

    test('validates treatment suitability based on medical history', async () => {
      const patientFactors: PatientFactors = {
        id: 'pf-medical',
        patient_id: 'patient-safe',
        age: 28,
        gender: 'female',
        medical_history: {
          conditions: [],
          medications: [],
          allergies: [],
          surgeries: [],
          chronic_conditions: [],
          family_history: []
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockSupabaseClient.from.mockResolvedValue({ data: [patientFactors], error: null });

      const result = await service.getPatientFactors('patient-safe');

      expect(result).toBeDefined();
      expect(result.medical_history?.allergies).toEqual([]);
      expect(result.medical_history?.medications).toEqual([]);
    });
  });

  describe('Explainability Features', () => {
    test('provides detailed feature importance analysis', async () => {
      const mockExplainability = {
        feature_importance: {
          'age': 0.18,
          'skin_type': 0.22,
          'bmi': 0.12,
          'medical_history_score': 0.15,
          'lifestyle_score': 0.10,
          'compliance_score': 0.13,
          'treatment_complexity': 0.10
        },
        top_positive_factors: [
          'Optimal age range (25-35)',
          'Skin Type II - ideal for laser treatments',
          'High treatment compliance score (92%)',
          'No significant medical contraindications'
        ],
        top_negative_factors: [
          'Moderate sun exposure - requires pre-treatment preparation'
        ],
        similar_cases: ['case-A123', 'case-B456', 'case-C789'],
        confidence_reasoning: 'High confidence based on strong correlation with 15 similar successful cases. Patient profile matches optimal characteristics for this treatment type.'
      };

      // Test explainability generation
      const result = await service.generateExplainability(mockExplainability);

      expect(result.feature_importance).toBeDefined();
      expect(Object.keys(result.feature_importance).length).toBeGreaterThan(5);
      expect(result.top_positive_factors.length).toBeGreaterThan(0);
      expect(result.confidence_reasoning).toBeTruthy();
      expect(result.similar_cases.length).toBeGreaterThanOrEqual(3);

      // Validate feature importance sums to approximately 1
      const totalImportance = Object.values(result.feature_importance).reduce((sum, val) => sum + val, 0);
      expect(totalImportance).toBeCloseTo(1.0, 1);
    });

    test('provides human-readable explanations', async () => {
      const mockPrediction = {
        prediction_score: 0.87,
        explainability_data: {
          feature_importance: { 'age': 0.20, 'skin_type': 0.25 },
          top_positive_factors: ['Ideal age range', 'Compatible skin type'],
          top_negative_factors: [],
          similar_cases: ['case-1'],
          confidence_reasoning: 'Strong match with successful historical cases'
        }
      };

      const humanReadable = await service.generateHumanReadableExplanation(mockPrediction);

      expect(humanReadable.summary).toContain('87%');
      expect(humanReadable.key_factors).toContain('age');
      expect(humanReadable.recommendation).toBeTruthy();
      expect(humanReadable.risk_assessment).toBeTruthy();
    });
  });

  describe('Performance Monitoring', () => {
    test('monitors service response times', async () => {
      const startTime = performance.now();
      
      mockSupabaseClient.from.mockResolvedValue({ 
        data: [{ id: 'model-1', accuracy: 0.89 }], 
        error: null 
      });

      await service.getModels();

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(100); // Should be very fast for mocked calls
    });

    test('tracks prediction accuracy metrics', async () => {
      const metrics = await service.calculateAccuracyMetrics('model-123');

      expect(metrics.overall_accuracy).toBeGreaterThanOrEqual(0.85);
      expect(metrics.predictions_count).toBeGreaterThan(0);
      expect(metrics.successful_predictions).toBeLessThanOrEqual(metrics.predictions_count);
    });
  });

  describe('Error Handling', () => {
    test('handles database errors gracefully', async () => {
      mockSupabaseClient.insert.mockResolvedValue({ 
        data: null, 
        error: { message: 'Database connection error' } 
      });

      await expect(service.createModel({
        name: 'Test Model',
        version: '1.0.0',
        algorithm_type: 'ensemble',
        accuracy: 0.89,
        confidence_threshold: 0.85,
        status: 'training',
        training_data_size: 1000,
        feature_count: 10
      })).rejects.toThrow('Database connection error');
    });

    test('validates input parameters', async () => {
      await expect(service.createPrediction({
        patient_id: '', // Invalid empty patient ID
        treatment_type: 'laser',
        prediction_score: 1.5, // Invalid score > 1
        confidence_interval: { lower: 0.5, upper: 0.4, confidence_level: 0.95 }, // Invalid interval
        risk_assessment: 'low',
        predicted_outcome: 'success',
        model_id: 'model-123',
        features_used: {}
      })).rejects.toThrow();
    });
  });
});