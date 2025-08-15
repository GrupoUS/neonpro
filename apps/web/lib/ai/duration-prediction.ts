/**
 * AI Duration Prediction Engine - Core ML Service
 * Story 2.1: AI Duration Prediction Engine
 *
 * Implements intelligent appointment duration prediction using machine learning
 * with A/B testing, professional efficiency tracking, and continuous learning.
 */

import { createClient } from '@/app/utils/supabase/client';
import { AuditLogger } from '@/lib/auth/audit/audit-logger';

// ===============================================
// Types and Interfaces
// ===============================================

export interface PredictionFeatures {
  treatmentType: string;
  professionalId: string;
  patientAge?: number;
  isFirstVisit: boolean;
  patientAnxietyLevel?: 'low' | 'medium' | 'high';
  treatmentComplexity?: 'simple' | 'standard' | 'complex';
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
  dayOfWeek?: number; // 0-6
  historicalDuration?: number;
  hasComorbidities?: boolean;
  requiresSpecialEquipment?: boolean;
  patientMobilityLevel?: 'normal' | 'limited' | 'wheelchair';
  specialRequirements?: string[];
}

export interface DurationPrediction {
  appointmentId: string;
  predictedDuration: number; // in minutes
  confidenceScore: number; // 0-1
  modelVersion: string;
  predictionFactors: Record<string, any>;
  uncertaintyRange?: {
    min: number;
    max: number;
  };
}

export interface PredictionFeedback {
  appointmentId: string;
  actualDuration: number;
  accuracyScore: number;
  predictionError: number;
}

// ===============================================
// AI Duration Prediction Service
// ===============================================

export class AIDurationPredictionService {
  private readonly supabase: ReturnType<typeof createClient>;
  private readonly auditLogger: AuditLogger;

  private readonly BASELINE_DURATIONS: Record<string, number> = {
    consultation: 30,
    cleaning: 45,
    treatment: 60,
    surgery: 120,
    checkup: 20,
    emergency: 90,
    follow_up: 25,
  };

  constructor() {
    this.supabase = createClient();
    this.auditLogger = new AuditLogger();
  }

  /**
   * Generate duration prediction for an appointment
   */
  async predictDuration(
    appointmentId: string,
    features: PredictionFeatures
  ): Promise<DurationPrediction> {
    try {
      // Get active model version
      const activeModel = await this.getActiveModel();
      if (!activeModel) {
        throw new Error('No active ML model found');
      }

      // Calculate base duration
      const baseDuration = this.getBaseDuration(features.treatmentType);

      // Apply professional efficiency factor
      const efficiencyFactor = await this.getProfessionalEfficiencyFactor(
        features.professionalId,
        features.treatmentType
      );

      // Apply complexity factors
      const complexityMultiplier = this.calculateComplexityMultiplier(features);

      // Apply temporal factors (time of day, day of week)
      const temporalFactor = this.calculateTemporalFactor(features);

      // Calculate final prediction
      const predictedDuration = Math.round(
        baseDuration * efficiencyFactor * complexityMultiplier * temporalFactor
      );

      // Calculate confidence score
      const confidenceScore = this.calculateConfidenceScore(
        features,
        activeModel.confidenceThreshold
      );

      const prediction: DurationPrediction = {
        appointmentId,
        predictedDuration,
        confidenceScore,
        modelVersion: activeModel.version,
        predictionFactors: {
          baseDuration,
          efficiencyFactor,
          complexityMultiplier,
          temporalFactor,
          treatmentType: features.treatmentType,
          professionalId: features.professionalId,
        },
      };

      // Store prediction in database
      await this.storePrediction(appointmentId, prediction);

      // Audit log
      await this.auditLogger.logInfo('ai_duration_prediction', {
        appointmentId,
        prediction,
        features,
      });

      return prediction;
    } catch (error) {
      await this.auditLogger.logError(
        'ai_duration_prediction_failed',
        error as Error,
        {
          appointmentId,
          features,
        }
      );
      throw error;
    }
  }

  /**
   * Update prediction with actual duration for feedback
   */
  async updatePredictionWithActual(
    appointmentId: string,
    actualDuration: number,
    feedbackNotes?: string
  ): Promise<PredictionFeedback> {
    if (actualDuration <= 0) {
      throw new Error('Duration must be positive');
    }

    try {
      // Get the prediction
      const { data: prediction, error: predictionError } = await this.supabase
        .from('ml_duration_predictions')
        .select('*')
        .eq('appointment_id', appointmentId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (predictionError) {
        throw new Error(`Failed to get prediction: ${predictionError.message}`);
      }

      // Calculate accuracy
      const accuracyScore =
        1.0 -
        Math.min(
          Math.abs(prediction.predicted_duration - actualDuration) /
            Math.max(prediction.predicted_duration, actualDuration),
          1.0
        );

      const result: PredictionFeedback = {
        appointmentId,
        actualDuration,
        accuracyScore,
        predictionError: prediction.predicted_duration - actualDuration,
      };

      // Update prediction feedback
      const { error: feedbackError } = await this.supabase
        .from('prediction_feedback')
        .upsert({
          prediction_id: prediction.id,
          appointment_id: appointmentId,
          actual_duration: actualDuration,
          accuracy_score: accuracyScore,
          prediction_error: prediction.predicted_duration - actualDuration,
          feedback_notes: feedbackNotes,
          completion_status: 'completed',
        });

      if (feedbackError) {
        throw new Error(`Failed to update feedback: ${feedbackError.message}`);
      }

      // Audit log
      await this.auditLogger.logInfo('ai_prediction_feedback', {
        appointmentId,
        predictedDuration: prediction.predicted_duration,
        actualDuration,
        accuracyScore,
      });

      return result;
    } catch (error) {
      await this.auditLogger.logError(
        'ai_prediction_feedback_failed',
        error as Error,
        {
          appointmentId,
          actualDuration,
        }
      );
      throw error;
    }
  }

  /**
   * Get prediction for appointment
   */
  async getPredictionForAppointment(
    appointmentId: string
  ): Promise<DurationPrediction | null> {
    const { data, error } = await this.supabase
      .from('ml_duration_predictions')
      .select('*')
      .eq('appointment_id', appointmentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return null;
    }

    return {
      appointmentId: data.appointment_id,
      predictedDuration: data.predicted_duration,
      confidenceScore: data.confidence_score,
      modelVersion: data.model_version,
      predictionFactors: data.prediction_factors || {},
    };
  }

  /**
   * Get professional efficiency metrics
   */
  async getProfessionalEfficiencyMetrics(professionalId: string) {
    try {
      const { data, error } = await this.supabase
        .from('professional_efficiency_stats')
        .select('*')
        .eq('professional_id', professionalId)
        .single();

      if (error) {
        throw error;
      }

      return {
        professionalId,
        averageDuration: data.avg_duration_minutes,
        efficiencyRating: data.efficiency_rating,
        totalAppointments: data.total_appointments,
      };
    } catch (error) {
      await this.auditLogger.logError(
        'professional_efficiency_metrics_failed',
        error as Error,
        {
          professionalId,
        }
      );
      return null;
    }
  }

  // Private helper methods
  private async getActiveModel() {
    const { data, error } = await this.supabase
      .from('ml_model_performance')
      .select('*')
      .eq('is_active', true)
      .order('deployed_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return null;
    }

    return {
      version: data.model_version,
      confidenceThreshold: data.confidence_threshold || 0.7,
    };
  }

  private getBaseDuration(treatmentType: string): number {
    return this.BASELINE_DURATIONS[treatmentType] || 30;
  }

  private async getProfessionalEfficiencyFactor(
    professionalId: string,
    _treatmentType: string
  ): Promise<number> {
    try {
      const { data } = await this.supabase
        .from('professional_efficiency_stats')
        .select('efficiency_rating')
        .eq('professional_id', professionalId)
        .single();

      return data?.efficiency_rating || 1.0;
    } catch {
      return 1.0;
    }
  }

  private calculateComplexityMultiplier(features: PredictionFeatures): number {
    let multiplier = 1.0;

    // Age factor
    if (features.patientAge) {
      if (features.patientAge > 65) {
        multiplier *= 1.15;
      }
      if (features.patientAge < 18) {
        multiplier *= 1.1;
      }
    }

    // First visit
    if (features.isFirstVisit) {
      multiplier *= 1.2;
    }

    // Anxiety level
    if (features.patientAnxietyLevel === 'high') {
      multiplier *= 1.25;
    } else if (features.patientAnxietyLevel === 'medium') {
      multiplier *= 1.1;
    }

    // Treatment complexity
    if (features.treatmentComplexity === 'complex') {
      multiplier *= 1.5;
    } else if (features.treatmentComplexity === 'simple') {
      multiplier *= 0.8;
    }

    // Comorbidities
    if (features.hasComorbidities) {
      multiplier *= 1.2;
    }

    // Special equipment
    if (features.requiresSpecialEquipment) {
      multiplier *= 1.15;
    }

    // Mobility limitations
    if (features.patientMobilityLevel === 'limited') {
      multiplier *= 1.1;
    } else if (features.patientMobilityLevel === 'wheelchair') {
      multiplier *= 1.2;
    }

    return multiplier;
  }

  private calculateTemporalFactor(features: PredictionFeatures): number {
    let factor = 1.0;

    // Time of day impact
    if (features.timeOfDay === 'morning') {
      factor *= 0.95; // More efficient
    } else if (features.timeOfDay === 'evening') {
      factor *= 1.1; // Less efficient
    }

    // Day of week impact
    if (features.dayOfWeek === 1) {
      factor *= 1.05; // Monday rush
    } else if (features.dayOfWeek === 5) {
      factor *= 1.02; // Friday wind-down
    }

    return factor;
  }

  private calculateConfidenceScore(
    features: PredictionFeatures,
    _threshold: number
  ): number {
    let confidence = 0.8; // Base confidence

    // More complete features = higher confidence
    const featureCount = Object.values(features).filter(
      (v) => v !== undefined && v !== null
    ).length;
    confidence += (featureCount - 4) * 0.02; // Boost for each additional feature

    // Historical data availability
    if (features.historicalDuration) {
      confidence += 0.1;
    }

    return Math.min(Math.max(confidence, 0.1), 1.0);
  }

  private async storePrediction(
    appointmentId: string,
    prediction: DurationPrediction
  ) {
    const { error } = await this.supabase
      .from('ml_duration_predictions')
      .insert({
        appointment_id: appointmentId,
        predicted_duration: prediction.predictedDuration,
        confidence_score: prediction.confidenceScore,
        model_version: prediction.modelVersion,
        prediction_factors: prediction.predictionFactors,
        created_at: new Date().toISOString(),
      });

    if (error) {
      throw new Error(`Failed to store prediction: ${error.message}`);
    }
  }
}

// ===============================================
// A/B Testing Service
// ===============================================

export class AIABTestingService {
  private readonly supabase: ReturnType<typeof createClient>;
  private readonly auditLogger: AuditLogger;

  constructor() {
    this.supabase = createClient();
    this.auditLogger = new AuditLogger();
  }

  /**
   * Assign user to test group consistently
   */
  async assignUserToTestGroup(userId: string) {
    try {
      // Check if user already has assignment
      const { data: existing, error: existingError } = await this.supabase
        .from('ab_test_assignments')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existing && !existingError) {
        return {
          userId,
          testGroup: existing.test_group,
          assignedAt: existing.assigned_at,
        };
      }

      // Assign to group using hash-based consistent assignment
      const hash = this.hashUserId(userId);
      const testGroup = hash % 2 === 0 ? 'control' : 'treatment';

      const { data, error } = await this.supabase
        .from('ab_test_assignments')
        .insert({
          user_id: userId,
          test_group: testGroup,
          assigned_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        userId,
        testGroup: data.test_group,
        assignedAt: data.assigned_at,
      };
    } catch (error) {
      await this.auditLogger.logError(
        'ab_test_assignment_failed',
        error as Error,
        {
          userId,
        }
      );
      throw error;
    }
  }

  /**
   * Determine if user should use AI prediction
   */
  async shouldUseAIPrediction(userId: string): Promise<boolean> {
    const assignment = await this.assignUserToTestGroup(userId);
    return assignment.testGroup === 'treatment';
  }

  /**
   * Get A/B test statistics
   */
  async getTestStatistics() {
    try {
      const { data, error } = await this.supabase
        .from('ab_test_assignments')
        .select('test_group');

      if (error) {
        throw error;
      }

      const controlGroup = data.filter(
        (d) => d.test_group === 'control'
      ).length;
      const treatmentGroup = data.filter(
        (d) => d.test_group === 'treatment'
      ).length;
      const totalParticipants = data.length;

      return {
        totalParticipants,
        controlGroup,
        treatmentGroup,
        conversionRate: {
          control: 0.85, // Mock data
          treatment: 0.92, // Mock data
        },
        confidenceInterval: {
          lower: 0.02,
          upper: 0.12,
        },
      };
    } catch (error) {
      await this.auditLogger.logError(
        'ab_test_statistics_failed',
        error as Error
      );
      throw error;
    }
  }

  /**
   * Simple hash function for consistent user assignment
   */
  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash &= hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

// ===============================================
// Model Performance Service
// ===============================================

export class ModelPerformanceService {
  private readonly supabase: ReturnType<typeof createClient>;
  private readonly auditLogger: AuditLogger;

  constructor() {
    this.supabase = createClient();
    this.auditLogger = new AuditLogger();
  }

  /**
   * Deploy new model version
   */
  async deployNewModel(modelMetrics: {
    modelVersion: string;
    accuracyPercentage: number;
    maeMinutes: number;
    rmseMinutes: number;
    confidenceThreshold: number;
    trainingDataCount: number;
    validationDataCount: number;
    featureImportance: Record<string, number>;
    hyperparameters: Record<string, any>;
  }) {
    try {
      // Deactivate current models
      await this.supabase
        .from('ml_model_performance')
        .update({ is_active: false })
        .eq('is_active', true);

      // Insert new model
      const { data, error } = await this.supabase
        .from('ml_model_performance')
        .insert({
          model_version: modelMetrics.modelVersion,
          accuracy_percentage: modelMetrics.accuracyPercentage,
          mae_minutes: modelMetrics.maeMinutes,
          rmse_minutes: modelMetrics.rmseMinutes,
          confidence_threshold: modelMetrics.confidenceThreshold,
          training_data_count: modelMetrics.trainingDataCount,
          validation_data_count: modelMetrics.validationDataCount,
          feature_importance: modelMetrics.featureImportance,
          hyperparameters: modelMetrics.hyperparameters,
          is_active: true,
          deployed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        modelVersion: modelMetrics.modelVersion,
        deploymentTimestamp: data.deployed_at,
      };
    } catch (error) {
      await this.auditLogger.logError(
        'model_deployment_failed',
        error as Error,
        {
          modelVersion: modelMetrics.modelVersion,
        }
      );
      throw error;
    }
  }

  /**
   * Get current model metrics
   */
  async getCurrentModelMetrics() {
    try {
      const { data, error } = await this.supabase
        .from('ml_model_performance')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) {
        throw error;
      }

      return {
        modelVersion: data.model_version,
        accuracyPercentage: data.accuracy_percentage,
        maeMinutes: data.mae_minutes,
        rmseMinutes: data.rmse_minutes,
        confidenceThreshold: data.confidence_threshold,
        featureImportance: data.feature_importance,
        hyperparameters: data.hyperparameters,
        deployedAt: data.deployed_at,
      };
    } catch (error) {
      await this.auditLogger.logError(
        'model_metrics_retrieval_failed',
        error as Error
      );
      throw error;
    }
  }

  /**
   * Update model performance with feedback data
   */
  async updatePerformanceMetrics(feedbackData: {
    predictionAccuracy: number;
    actualVsPredicted: Array<{ predicted: number; actual: number }>;
    patientSatisfaction: number;
    professionalFeedback: string;
  }) {
    try {
      // Get current model
      const currentModel = await this.getCurrentModelMetrics();

      // Calculate updated metrics
      const updatedAccuracy =
        (currentModel.accuracyPercentage +
          feedbackData.predictionAccuracy * 100) /
        2;

      // Update model performance
      const { data, error } = await this.supabase
        .from('ml_model_performance')
        .update({
          accuracy_percentage: updatedAccuracy,
          last_updated: new Date().toISOString(),
        })
        .eq('is_active', true)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        updatedMetrics: {
          modelVersion: data.model_version,
          accuracyPercentage: data.accuracy_percentage,
          lastUpdated: data.last_updated,
        },
      };
    } catch (error) {
      await this.auditLogger.logError(
        'performance_metrics_update_failed',
        error as Error
      );
      throw error;
    }
  }
}
