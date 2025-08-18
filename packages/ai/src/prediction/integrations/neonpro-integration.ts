import type { PatientProfile, TreatmentRequest, PredictionResponse } from '../types';
import { aestheticInferenceAPI } from '../api/inference-api';
import { predictionPerformanceMonitor } from '../analytics/performance-monitor';

/**
 * NeonPro Core Services Integration Layer
 * Connects AI prediction engine with existing NeonPro patient and treatment systems
 */
export class NeonProAIIntegration {
  private isInitialized = false;

  /**
   * Initialize integration with NeonPro services
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialize the inference API
      await aestheticInferenceAPI.initialize();
      
      this.isInitialized = true;
      console.log('✅ NeonPro AI Integration initialized');
    } catch (error) {
      console.error('❌ Failed to initialize NeonPro AI Integration:', error);
      throw new Error(`NeonPro AI Integration initialization failed: ${error}`);
    }
  }

  /**
   * Get AI-powered treatment recommendation for a patient
   */
  async getTreatmentRecommendation(
    patientId: string,
    treatmentType: string,
    targetAreas: string[],
    additionalParams?: Record<string, any>
  ): Promise<{
    success: boolean;
    recommendation?: any;
    error?: string;
    metadata: {
      processingTime: number;
      confidence: number;
      accuracyScore: number;
    };
  }> {
    const startTime = performance.now();

    try {
      // Fetch patient data from NeonPro core services
      const patient = await this.getPatientProfile(patientId);
      
      // Create treatment request
      const treatmentRequest: TreatmentRequest = {
        patientId,
        treatmentType: treatmentType as any,
        targetAreas: targetAreas.map(area => ({
          region: area as any,
          concern: 'wrinkles' as any, // Default, would be specified
          severity: 5, // Default, would be assessed
          priority: 1 // Default
        })),
        goals: {
          primary: 'Aesthetic improvement',
          secondary: [],
          expectations: 'moderate' as any,
          maintenance: false,
          naturalLook: true
        },
        urgency: 'moderate' as any,
        budgetRange: {
          min: 1000,
          max: 5000,
          currency: 'BRL',
          flexibility: 'moderate'
        },
        timeframe: {
          earliestStart: new Date(),
          latestCompletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          flexibility: 'moderate',
          preferredDays: [1, 2, 3, 4, 5],
          preferredTimes: [{ start: '09:00', end: '17:00' }]
        }
      };

      // Get comprehensive AI prediction
      const prediction = await aestheticInferenceAPI.getComprehensivePrediction(
        patientId,
        patient,
        treatmentRequest
      );

      if (!prediction.success) {
        throw new Error(prediction.error || 'Prediction failed');
      }

      // Log prediction for monitoring
      predictionPerformanceMonitor.logPrediction(
        'treatment-outcome',
        prediction.metadata.processingTime,
        prediction.metadata.accuracyScore,
        true
      );

      // Format recommendation for NeonPro services
      const recommendation = this.formatTreatmentRecommendation(prediction.data, treatmentRequest);

      return {
        success: true,
        recommendation,
        metadata: {
          processingTime: performance.now() - startTime,
          confidence: this.calculateOverallConfidence(prediction.data),
          accuracyScore: prediction.metadata.accuracyScore
        }
      };

    } catch (error) {
      console.error('❌ Treatment recommendation failed:', error);
      
      // Log error for monitoring
      predictionPerformanceMonitor.logPrediction(
        'treatment-outcome',
        performance.now() - startTime,
        0,
        false,
        error instanceof Error ? error.message : 'Unknown error'
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          processingTime: performance.now() - startTime,
          confidence: 0,
          accuracyScore: 0
        }
      };
    }
  }  /**
   * Get optimized Botox treatment plan
   */
  async getBotoxOptimization(
    patientId: string,
    targetAreas: string[],
    desiredIntensity: number = 5
  ) {
    try {
      const patient = await this.getPatientProfile(patientId);
      
      const result = await aestheticInferenceAPI.optimizeBotoxTreatment(
        patientId,
        patient,
        targetAreas,
        desiredIntensity
      );

      if (result.success && result.data) {
        return {
          success: true,
          optimization: {
            totalUnits: result.data.outputs.optimalUnits,
            injectionPlan: result.data.outputs.injectionPattern,
            expectedDuration: result.data.outputs.expectedDuration,
            onsetTime: result.data.outputs.onsetTime,
            confidence: result.data.outputs.confidence,
            recommendations: result.data.metadata.recommendations
          },
          metadata: result.metadata
        };
      }

      throw new Error(result.error || 'Botox optimization failed');
    } catch (error) {
      console.error('❌ Botox optimization failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get AI system health and performance metrics
   */
  async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    accuracy: Record<string, number>;
    performance: Record<string, number>;
    recommendations: string[];
  }> {
    try {
      const healthCheck = await aestheticInferenceAPI.healthCheck();
      const dashboard = predictionPerformanceMonitor.getDashboardData();

      // Check accuracy targets for all models
      const accuracyChecks = [
        'treatment-outcome', 'risk-assessment', 'botox-optimization',
        'filler-volume', 'laser-settings', 'duration-estimation', 'success-probability'
      ].map(modelType => {
        const check = predictionPerformanceMonitor.checkAccuracyTarget(modelType as any);
        return { [modelType]: check };
      });

      const accuracy = Object.assign({}, ...accuracyChecks.map(check => {
        const [key, value] = Object.entries(check)[0];
        return { [key]: (value as any).currentAccuracy };
      }));

      const recommendations: string[] = [];
      
      // Generate recommendations based on health status
      if (healthCheck.status !== 'healthy') {
        recommendations.push('AI system health degraded - check model performance');
      }

      if (dashboard.successRate < 0.95) {
        recommendations.push('High error rate detected - review system stability');
      }

      if (dashboard.averageResponseTime > 2000) {
        recommendations.push('Response time above 2s target - optimize inference pipeline');
      }

      return {
        status: healthCheck.status,
        accuracy,
        performance: {
          responseTime: dashboard.averageResponseTime,
          successRate: dashboard.successRate,
          cacheHitRate: dashboard.averageResponseTime < 500 ? 0.8 : 0.3 // Estimated
        },
        recommendations
      };
    } catch (error) {
      console.error('❌ System health check failed:', error);
      return {
        status: 'unhealthy',
        accuracy: {},
        performance: {},
        recommendations: ['System health check failed - investigate immediately']
      };
    }
  }

  // ==================== PRIVATE HELPER METHODS ====================

  /**
   * Fetch patient profile from NeonPro core services
   * In production, this would call the actual patient service API
   */
  private async getPatientProfile(patientId: string): Promise<PatientProfile> {
    // This is a mock implementation
    // In production, integrate with @neonpro/core-services patient API
    
    return {
      id: patientId,
      age: 35,
      gender: 'female',
      skinType: 'fitzpatrick-3',
      medicalHistory: {
        allergies: [],
        medications: [],
        conditions: [],
        autoimmuneDiseases: [],
        bloodThinnersUse: false,
        keloidProneness: false
      },
      lifestyle: {
        smoking: false,
        alcohol: false,
        sunExposure: 'moderate',
        exerciseLevel: 'moderate',
        stressLevel: 5,
        sleepQuality: 7,
        skincare: {
          cleansing: true,
          moisturizing: true,
          sunscreenUse: true,
          retinoidUse: false,
          exfoliation: true,
          professionalTreatments: []
        }
      },
      previousTreatments: [],
      goals: {
        primary: 'Wrinkle reduction',
        secondary: ['Preventive care'],
        expectations: 'moderate',
        maintenance: true,
        naturalLook: true
      },
      consentStatus: {
        dataProcessingConsent: true,
        aiPredictionConsent: true,
        consentDate: new Date(),
        consentVersion: '1.0',
        dataRetentionPeriod: 365,
        anonymizationRequested: false
      }
    };
  }

  /**
   * Format AI prediction into NeonPro treatment recommendation
   */
  private formatTreatmentRecommendation(prediction: any, request: TreatmentRequest) {
    return {
      treatmentPlan: {
        type: request.treatmentType,
        areas: request.targetAreas.map(area => area.region),
        expectedOutcome: prediction.outcome.outputs.outcomeScore,
        confidence: prediction.outcome.outputs.confidence,
        timeline: prediction.outcome.outputs.expectedTimeline,
        durability: prediction.outcome.outputs.durability
      },
      riskProfile: {
        overallRisk: prediction.risk.outputs.overallRisk,
        specificRisks: prediction.risk.outputs.specificRisks.slice(0, 3), // Top 3 risks
        contraindications: prediction.risk.outputs.contraindications
      },
      scheduling: {
        estimatedDuration: prediction.duration.outputs.sessionDuration,
        recoveryTime: prediction.duration.outputs.recoveryTime,
        factors: prediction.duration.outputs.factors
      },
      successProbability: {
        probability: prediction.success.outputs.successProbability,
        confidence: prediction.success.outputs.confidence,
        optimizationTips: prediction.success.outputs.recommendations
      },
      clinicalRecommendations: [
        ...prediction.outcome.metadata.recommendations,
        ...prediction.risk.outputs.recommendations
      ].slice(0, 5) // Top 5 recommendations
    };
  }

  /**
   * Calculate overall confidence from multiple predictions
   */
  private calculateOverallConfidence(predictions: any): number {
    const confidences = [
      predictions.outcome.outputs.confidence,
      predictions.risk.outputs.confidence,
      predictions.duration.outputs.confidence,
      predictions.success.outputs.confidence
    ];

    return confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
  }
}

// Export singleton instance
export const neonproAIIntegration = new NeonProAIIntegration();