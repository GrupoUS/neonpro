/**
 * AI Duration Prediction Engine - Core ML Service
 * Story 2.1: AI Duration Prediction Engine
 * 
 * Implements intelligent appointment duration prediction using machine learning
 * with A/B testing, professional efficiency tracking, and continuous learning.
 */

import { createClient } from '@/utils/supabase/client';
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
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  dayOfWeek: number; // 0-6
  historicalDuration?: number;
  specialRequirements?: string[];
}

export interface DurationPrediction {
  predictedDuration: number; // in minutes
  confidenceScore: number; // 0-1
  modelVersion: string;
  predictionFactors: Record<string, any>;
  uncertaintyRange: {
    min: number;
    max: number;
  };
}

export interface ModelPerformance {
  version: string;
  accuracy: number;
  mae: number; // Mean Absolute Error
  rmse: number; // Root Mean Square Error
  confidenceThreshold: number;
  isActive: boolean;
}

export interface ComplexityFactor {
  treatmentType: string;
  factor: string;
  multiplier: number;
  confidence: number;
}

export interface EfficiencyMetrics {
  professionalId: string;
  treatmentType: string;
  avgDuration: number;
  efficiencyRating: number; // 1.0 = baseline, >1.0 = faster
  totalAppointments: number;
}

// ===============================================
// Main AI Duration Prediction Service
// ===============================================

export class AIDurationPredictionService {
  private supabase = createClient();
  private auditLogger = new AuditLogger();
  
  private readonly BASELINE_DURATIONS: Record<string, number> = {
    'consultation': 30,
    'cleaning': 45,
    'treatment': 60,
    'surgery': 120,
    'checkup': 20,
    'emergency': 90,
    'follow_up': 25
  };

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
      const complexityMultiplier = await this.calculateComplexityMultiplier(features);

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

      // Calculate uncertainty range
      const uncertaintyRange = this.calculateUncertaintyRange(
        predictedDuration,
        confidenceScore
      );

      const prediction: DurationPrediction = {
        predictedDuration,
        confidenceScore,
        modelVersion: activeModel.version,
        predictionFactors: {
          baseDuration,
          efficiencyFactor,
          complexityMultiplier,
          temporalFactor,
          treatmentType: features.treatmentType,
          professionalId: features.professionalId
        },
        uncertaintyRange
      };

      // Store prediction in database
      await this.storePrediction(appointmentId, prediction);

      // Audit log
      await this.auditLogger.logEvent({
        eventType: 'ai_duration_prediction',
        eventDescription: `AI predicted appointment duration: ${predictedDuration} minutes`,
        metadata: {
          appointmentId,
          prediction,
          features
        }
      });

      return prediction;
    } catch (error) {
      await this.auditLogger.logError('ai_duration_prediction_failed', error as Error, {
        appointmentId,
        features
      });
      throw error;
    }
  }

  /**
   * Get active ML model
   */
  private async getActiveModel(): Promise<ModelPerformance | null> {
    const { data, error } = await this.supabase
      .from('ml_model_performance')
      .select('*')
      .eq('is_active', true)
      .order('deployed_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      throw new Error(`Failed to get active model: ${error.message}`);
    }

    return data ? {
      version: data.model_version,
      accuracy: data.accuracy_percentage,
      mae: data.mae_minutes,
      rmse: data.rmse_minutes,
      confidenceThreshold: data.confidence_threshold,
      isActive: data.is_active
    } : null;
  }

  /**
   * Get base duration for treatment type
   */
  private getBaseDuration(treatmentType: string): number {
    return this.BASELINE_DURATIONS[treatmentType] || this.BASELINE_DURATIONS['consultation'];
  }

  /**
   * Get professional efficiency factor
   */
  private async getProfessionalEfficiencyFactor(
    professionalId: string,
    treatmentType: string
  ): Promise<number> {
    const { data } = await this.supabase
      .from('professional_efficiency_metrics')
      .select('efficiency_rating')
      .eq('professional_id', professionalId)
      .eq('treatment_type', treatmentType)
      .order('last_updated', { ascending: false })
      .limit(1)
      .single();

    // Return efficiency rating or default to 1.0 (baseline)
    return data?.efficiency_rating || 1.0;
  }

  /**
   * Calculate complexity multiplier based on various factors
   */
  private async calculateComplexityMultiplier(features: PredictionFeatures): Promise<number> {
    let multiplier = 1.0;

    // Get complexity factors from database
    const { data: complexityFactors } = await this.supabase
      .from('treatment_complexity_factors')
      .select('*')
      .eq('treatment_type', features.treatmentType)
      .eq('is_active', true);

    if (!complexityFactors) return multiplier;

    // Apply each relevant complexity factor
    for (const factor of complexityFactors) {
      switch (factor.complexity_factor) {
        case 'first_visit':
          if (features.isFirstVisit) {
            multiplier *= factor.duration_multiplier;
          }
          break;
        
        case 'patient_age_senior':
          if (features.patientAge && features.patientAge >= 65) {
            multiplier *= factor.duration_multiplier;
          }
          break;
        
        case 'patient_age_child':
          if (features.patientAge && features.patientAge < 18) {
            multiplier *= factor.duration_multiplier;
          }
          break;
        
        case 'anxiety_level_high':
          if (features.patientAnxietyLevel === 'high') {
            multiplier *= factor.duration_multiplier;
          }
          break;
        
        case 'complex_procedure':
          if (features.treatmentComplexity === 'complex') {
            multiplier *= factor.duration_multiplier;
          }
          break;
        
        case 'extensive_buildup':
          if (features.specialRequirements?.includes('extensive_buildup')) {
            multiplier *= factor.duration_multiplier;
          }
          break;
      }
    }

    return Math.min(multiplier, 2.0); // Cap at 2x baseline
  }

  /**
   * Calculate temporal factor (time of day, day of week effects)
   */
  private calculateTemporalFactor(features: PredictionFeatures): number {
    let factor = 1.0;

    // Time of day effects
    switch (features.timeOfDay) {
      case 'morning':
        factor *= 0.95; // Typically faster in morning
        break;
      case 'afternoon':
        factor *= 1.0; // Baseline
        break;
      case 'evening':
        factor *= 1.05; // Slightly slower in evening
        break;
    }

    // Day of week effects
    if (features.dayOfWeek === 1) { // Monday
      factor *= 1.1; // Slower on Mondays
    } else if (features.dayOfWeek === 5) { // Friday
      factor *= 0.95; // Faster on Fridays
    }

    return factor;
  }

  /**
   * Calculate confidence score based on feature quality and model performance
   */
  private calculateConfidenceScore(
    features: PredictionFeatures,
    modelThreshold: number
  ): number {
    let confidence = modelThreshold;

    // Adjust confidence based on feature completeness
    const featureCompleteness = this.calculateFeatureCompleteness(features);
    confidence *= featureCompleteness;

    // Adjust confidence based on historical data availability
    if (features.historicalDuration) {
      confidence *= 1.1; // Boost confidence if we have historical data
    }

    // Ensure confidence is within valid range
    return Math.min(Math.max(confidence, 0.1), 1.0);
  }

  /**
   * Calculate feature completeness score
   */
  private calculateFeatureCompleteness(features: PredictionFeatures): number {
    const totalFeatures = 8;
    let availableFeatures = 2; // treatmentType and professionalId are always available

    if (features.patientAge) availableFeatures++;
    if (features.patientAnxietyLevel) availableFeatures++;
    if (features.treatmentComplexity) availableFeatures++;
    if (features.historicalDuration) availableFeatures++;
    if (features.specialRequirements?.length) availableFeatures++;
    
    availableFeatures++; // isFirstVisit is always available

    return availableFeatures / totalFeatures;
  }

  /**
   * Calculate uncertainty range based on confidence
   */
  private calculateUncertaintyRange(
    predictedDuration: number,
    confidenceScore: number
  ): { min: number; max: number } {
    // Lower confidence = wider uncertainty range
    const uncertaintyFactor = (1 - confidenceScore) * 0.5; // Max 50% uncertainty
    const uncertainty = predictedDuration * uncertaintyFactor;

    return {
      min: Math.max(Math.round(predictedDuration - uncertainty), 5), // Min 5 minutes
      max: Math.round(predictedDuration + uncertainty)
    };
  }

  /**
   * Store prediction in database
   */
  private async storePrediction(
    appointmentId: string,
    prediction: DurationPrediction
  ): Promise<void> {
    const { error } = await this.supabase
      .from('ml_duration_predictions')
      .insert({
        appointment_id: appointmentId,
        predicted_duration: prediction.predictedDuration,
        confidence_score: prediction.confidenceScore,
        model_version: prediction.modelVersion,
        prediction_factors: prediction.predictionFactors
      });

    if (error) {
      throw new Error(`Failed to store prediction: ${error.message}`);
    }
  }

  /**
   * Update prediction with actual duration (for learning)
   */
  async updatePredictionWithActual(
    appointmentId: string,
    actualDuration: number,
    feedbackNotes?: string
  ): Promise<void> {
    try {
      // Get the prediction
      const { data: prediction, error: predictionError } = await this.supabase
        .from('ml_duration_predictions')
        .select('*')
        .eq('appointment_id', appointmentId)
        .single();

      if (predictionError) {
        throw new Error(`Failed to get prediction: ${predictionError.message}`);
      }

      // Calculate accuracy
      const accuracyScore = 1.0 - Math.min(
        Math.abs(prediction.predicted_duration - actualDuration) / 
        Math.max(prediction.predicted_duration, actualDuration),
        1.0
      );

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
          completion_status: 'completed'
        });

      if (feedbackError) {
        throw new Error(`Failed to update feedback: ${feedbackError.message}`);
      }

      // Audit log
      await this.auditLogger.logEvent({
        eventType: 'ai_prediction_feedback',
        eventDescription: `Updated prediction with actual duration: ${actualDuration} minutes`,
        metadata: {
          appointmentId,
          predictedDuration: prediction.predicted_duration,
          actualDuration,
          accuracyScore,
          predictionError: prediction.predicted_duration - actualDuration
        }
      });

    } catch (error) {
      await this.auditLogger.logError('ai_prediction_feedback_failed', error as Error, {
        appointmentId,
        actualDuration
      });
      throw error;
    }
  }

  /**
   * Get prediction for appointment
   */
  async getPredictionForAppointment(appointmentId: string): Promise<DurationPrediction | null> {
    const { data, error } = await this.supabase
      .from('ml_duration_predictions')
      .select('*')
      .eq('appointment_id', appointmentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      predictedDuration: data.predicted_duration,
      confidenceScore: data.confidence_score,
      modelVersion: data.model_version,
      predictionFactors: data.prediction_factors,
      uncertaintyRange: {
        min: Math.round(data.predicted_duration * (1 - (1 - data.confidence_score) * 0.5)),
        max: Math.round(data.predicted_duration * (1 + (1 - data.confidence_score) * 0.5))
      }
    };
  }
}

// ===============================================
// A/B Testing Service
// ===============================================

export class AIABTestingService {
  private supabase = createClient();
  private auditLogger = new AuditLogger();

  /**
   * Assign user to A/B test group
   */
  async assignToTestGroup(
    userId: string,
    testName: string = 'ai_duration_prediction'
  ): Promise<'control' | 'ai_prediction'> {
    try {
      // Check if user already has assignment
      const { data: existingAssignment } = await this.supabase
        .from('ab_test_assignments')
        .select('test_group')
        .eq('user_id', userId)
        .eq('test_name', testName)
        .eq('is_active', true)
        .single();

      if (existingAssignment) {
        return existingAssignment.test_group as 'control' | 'ai_prediction';
      }

      // Assign new user (50/50 split)
      const testGroup = Math.random() < 0.5 ? 'control' : 'ai_prediction';
      
      const { error } = await this.supabase
        .from('ab_test_assignments')
        .insert({
          user_id: userId,
          test_name: testName,
          test_group: testGroup,
          assignment_percentage: 50,
          test_start_date: new Date().toISOString(),
          is_active: true
        });

      if (error) {
        throw new Error(`Failed to assign A/B test group: ${error.message}`);
      }

      // Audit log
      await this.auditLogger.logEvent({
        eventType: 'ab_test_assignment',
        eventDescription: `User assigned to A/B test group: ${testGroup}`,
        metadata: { userId, testName, testGroup }
      });

      return testGroup;
    } catch (error) {
      await this.auditLogger.logError('ab_test_assignment_failed', error as Error, {
        userId,
        testName
      });
      throw error;
    }
  }

  /**
   * Check if user should use AI predictions
   */
  async shouldUseAIPredictions(userId: string): Promise<boolean> {
    const testGroup = await this.assignToTestGroup(userId);
    return testGroup === 'ai_prediction';
  }

  /**
   * Get A/B test statistics
   */
  async getABTestStats(testName: string = 'ai_duration_prediction') {
    const { data, error } = await this.supabase
      .from('ab_test_assignments')
      .select('test_group')
      .eq('test_name', testName)
      .eq('is_active', true);

    if (error) {
      throw new Error(`Failed to get A/B test stats: ${error.message}`);
    }

    const stats = data.reduce((acc: Record<string, number>, row) => {
      acc[row.test_group] = (acc[row.test_group] || 0) + 1;
      return acc;
    }, {});

    return {
      total: data.length,
      control: stats.control || 0,
      ai_prediction: stats.ai_prediction || 0,
      split_percentage: {
        control: Math.round(((stats.control || 0) / data.length) * 100),
        ai_prediction: Math.round(((stats.ai_prediction || 0) / data.length) * 100)
      }
    };
  }
}

// ===============================================
// Model Performance Tracking Service
// ===============================================

export class ModelPerformanceService {
  private supabase = createClient();
  private auditLogger = new AuditLogger();

  /**
   * Calculate and update model performance metrics
   */
  async updateModelPerformance(modelVersion: string): Promise<ModelPerformance> {
    try {
      // Get all feedback for this model version
      const { data: feedback, error } = await this.supabase
        .from('prediction_feedback')
        .select(`
          accuracy_score,
          prediction_error,
          ml_duration_predictions!inner(model_version)
        `)
        .eq('ml_duration_predictions.model_version', modelVersion)
        .eq('completion_status', 'completed')
        .not('accuracy_score', 'is', null);

      if (error) {
        throw new Error(`Failed to get model feedback: ${error.message}`);
      }

      if (!feedback || feedback.length === 0) {
        throw new Error('No feedback data available for model performance calculation');
      }

      // Calculate performance metrics
      const accuracyScores = feedback.map(f => f.accuracy_score);
      const predictionErrors = feedback.map(f => Math.abs(f.prediction_error));

      const accuracy = accuracyScores.reduce((sum, acc) => sum + acc, 0) / accuracyScores.length;
      const mae = predictionErrors.reduce((sum, err) => sum + err, 0) / predictionErrors.length;
      const rmse = Math.sqrt(
        predictionErrors.reduce((sum, err) => sum + err * err, 0) / predictionErrors.length
      );

      // Update model performance record
      const { data: updatedModel, error: updateError } = await this.supabase
        .from('ml_model_performance')
        .update({
          accuracy_percentage: Math.round(accuracy * 100 * 100) / 100, // Round to 2 decimal places
          mae_minutes: Math.round(mae * 100) / 100,
          rmse_minutes: Math.round(rmse * 100) / 100,
          validation_data_count: feedback.length
        })
        .eq('model_version', modelVersion)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to update model performance: ${updateError.message}`);
      }

      const performance: ModelPerformance = {
        version: updatedModel.model_version,
        accuracy: updatedModel.accuracy_percentage,
        mae: updatedModel.mae_minutes,
        rmse: updatedModel.rmse_minutes,
        confidenceThreshold: updatedModel.confidence_threshold,
        isActive: updatedModel.is_active
      };

      // Audit log
      await this.auditLogger.logEvent({
        eventType: 'model_performance_updated',
        eventDescription: `Model performance updated: ${accuracy * 100}% accuracy`,
        metadata: { modelVersion, performance }
      });

      return performance;
    } catch (error) {
      await this.auditLogger.logError('model_performance_update_failed', error as Error, {
        modelVersion
      });
      throw error;
    }
  }

  /**
   * Get current model performance
   */
  async getModelPerformance(modelVersion?: string): Promise<ModelPerformance[]> {
    const query = this.supabase
      .from('ml_model_performance')
      .select('*')
      .order('deployed_at', { ascending: false });

    if (modelVersion) {
      query.eq('model_version', modelVersion);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get model performance: ${error.message}`);
    }

    return data.map(model => ({
      version: model.model_version,
      accuracy: model.accuracy_percentage,
      mae: model.mae_minutes,
      rmse: model.rmse_minutes,
      confidenceThreshold: model.confidence_threshold,
      isActive: model.is_active
    }));
  }

  /**
   * Deploy new model version
   */
  async deployNewModel(
    modelVersion: string,
    hyperparameters: Record<string, any>,
    featureImportance: Record<string, number>,
    trainingDataCount: number
  ): Promise<void> {
    try {
      // Deactivate all current models
      await this.supabase
        .from('ml_model_performance')
        .update({ is_active: false })
        .eq('is_active', true);

      // Insert new model
      const { error } = await this.supabase
        .from('ml_model_performance')
        .insert({
          model_version: modelVersion,
          accuracy_percentage: 0, // Will be updated after validation
          confidence_threshold: 0.70,
          training_data_count: trainingDataCount,
          validation_data_count: 0,
          feature_importance: featureImportance,
          hyperparameters: hyperparameters,
          is_active: true,
          deployed_at: new Date().toISOString()
        });

      if (error) {
        throw new Error(`Failed to deploy new model: ${error.message}`);
      }

      // Audit log
      await this.auditLogger.logEvent({
        eventType: 'model_deployed',
        eventDescription: `New ML model deployed: ${modelVersion}`,
        metadata: { modelVersion, hyperparameters, featureImportance }
      });

    } catch (error) {
      await this.auditLogger.logError('model_deployment_failed', error as Error, {
        modelVersion
      });
      throw error;
    }
  }
}

// Export all services
export { AIDurationPredictionService as default };