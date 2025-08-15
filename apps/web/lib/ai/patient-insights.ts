import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import type { PatientProfile } from '../patients/profile-manager';

// Types for AI analysis
export interface RiskAssessment {
  overall_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_factors: RiskFactor[];
  recommendations: string[];
  confidence: number;
  last_updated: string;
}

export interface RiskFactor {
  factor: string;
  severity: 'low' | 'medium' | 'high';
  impact_score: number;
  description: string;
  mitigation_strategies: string[];
}

export interface PatientInsights {
  health_trends: HealthTrend[];
  behavioral_patterns: BehavioralPattern[];
  treatment_predictions: TreatmentPrediction[];
  optimization_suggestions: OptimizationSuggestion[];
  risk_assessment: RiskAssessment;
}

export interface HealthTrend {
  metric: string;
  trend: 'improving' | 'stable' | 'declining';
  change_rate: number;
  period_months: number;
  confidence: number;
  data_points: { date: string; value: number }[];
}

export interface BehavioralPattern {
  pattern_type:
    | 'appointment_adherence'
    | 'treatment_compliance'
    | 'communication_preference'
    | 'scheduling_preference';
  description: string;
  frequency: number;
  strength: number;
  actionable_insights: string[];
}

export interface TreatmentPrediction {
  treatment_type: string;
  success_probability: number;
  expected_duration: string;
  optimal_frequency: string;
  contraindications: string[];
  supporting_factors: string[];
}

export interface OptimizationSuggestion {
  category: 'scheduling' | 'treatment' | 'communication' | 'preventive';
  suggestion: string;
  impact_score: number;
  implementation_effort: 'low' | 'medium' | 'high';
  expected_outcome: string;
}

/**
 * AI Patient Insights Engine
 * Provides AI-powered analysis and recommendations for patient care
 */
export class PatientInsightsEngine {
  private supabase;

  constructor() {
    this.supabase = createClientComponentClient<Database>();
  }

  /**
   * Generate comprehensive patient insights
   */
  async generatePatientInsights(
    patientId: string
  ): Promise<PatientInsights | null> {
    try {
      // Get patient profile and history
      const profile = await this.getPatientProfile(patientId);
      const timeline = await this.getMedicalTimeline(patientId);

      if (!profile) return null;

      // Generate different types of insights
      const [
        riskAssessment,
        healthTrends,
        behavioralPatterns,
        treatmentPredictions,
        optimizationSuggestions,
      ] = await Promise.all([
        this.assessPatientRisk(profile, timeline),
        this.analyzeHealthTrends(timeline),
        this.identifyBehavioralPatterns(patientId, timeline),
        this.predictTreatmentOutcomes(profile, timeline),
        this.generateOptimizationSuggestions(profile, timeline),
      ]);

      const insights: PatientInsights = {
        risk_assessment: riskAssessment,
        health_trends: healthTrends,
        behavioral_patterns: behavioralPatterns,
        treatment_predictions: treatmentPredictions,
        optimization_suggestions: optimizationSuggestions,
      };

      // Update patient profile with AI insights
      await this.updatePatientAIInsights(patientId, insights);

      return insights;
    } catch (error) {
      console.error('Error generating patient insights:', error);
      return null;
    }
  }

  /**
   * Assess patient risk based on profile and history
   */
  async assessPatientRisk(
    profile: PatientProfile,
    timeline: any[]
  ): Promise<RiskAssessment> {
    try {
      const riskFactors: RiskFactor[] = [];
      let overallScore = 0;

      // Analyze chronic conditions
      if (profile.chronic_conditions.length > 0) {
        const severityMap: Record<string, number> = {
          diabetes: 0.8,
          hypertension: 0.6,
          heart_disease: 0.9,
          cancer: 0.95,
          kidney_disease: 0.85,
        };

        profile.chronic_conditions.forEach((condition) => {
          const severity = severityMap[condition.toLowerCase()] || 0.5;
          overallScore += severity * 0.3;

          riskFactors.push({
            factor: condition,
            severity:
              severity > 0.7 ? 'high' : severity > 0.4 ? 'medium' : 'low',
            impact_score: severity,
            description: `Chronic condition: ${condition}`,
            mitigation_strategies:
              this.getConditionMitigationStrategies(condition),
          });
        });
      }

      // Analyze medication complexity
      if (profile.medications.length > 5) {
        overallScore += 0.3;
        riskFactors.push({
          factor: 'medication_complexity',
          severity: 'medium',
          impact_score: 0.3,
          description: `High medication count: ${profile.medications.length} medications`,
          mitigation_strategies: [
            'Medication review',
            'Drug interaction monitoring',
            'Simplified dosing schedule',
          ],
        });
      }

      // Analyze BMI if available
      if (profile.bmi && (profile.bmi > 30 || profile.bmi < 18.5)) {
        const severity = profile.bmi > 35 ? 'high' : 'medium';
        overallScore += profile.bmi > 35 ? 0.4 : 0.2;

        riskFactors.push({
          factor: 'bmi_risk',
          severity,
          impact_score: profile.bmi > 35 ? 0.4 : 0.2,
          description: `BMI outside normal range: ${profile.bmi}`,
          mitigation_strategies: [
            'Nutritional counseling',
            'Exercise program',
            'Weight monitoring',
          ],
        });
      }

      // Calculate risk level
      const riskLevel: RiskAssessment['risk_level'] =
        overallScore > 0.8
          ? 'critical'
          : overallScore > 0.6
            ? 'high'
            : overallScore > 0.3
              ? 'medium'
              : 'low';

      return {
        overall_score: Math.min(overallScore, 1.0),
        risk_level: riskLevel,
        risk_factors: riskFactors,
        recommendations: this.generateRiskRecommendations(
          riskLevel,
          riskFactors
        ),
        confidence: this.calculateConfidence(profile, timeline),
        last_updated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error assessing patient risk:', error);
      return this.getDefaultRiskAssessment();
    }
  }

  /**
   * Analyze health trends from timeline data
   */
  async analyzeHealthTrends(timeline: any[]): Promise<HealthTrend[]> {
    const trends: HealthTrend[] = [];

    // Group events by type and analyze trends
    const eventTypes = ['treatment', 'procedure', 'test_result'];

    eventTypes.forEach((eventType) => {
      const events = timeline.filter((e) => e.event_type === eventType);
      if (events.length >= 3) {
        const outcomeScores = events
          .filter((e) => e.outcome_score !== null)
          .map((e) => ({
            date: e.event_date,
            value: e.outcome_score,
          }))
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );

        if (outcomeScores.length >= 3) {
          const trend = this.calculateTrend(outcomeScores);
          trends.push({
            metric: `${eventType}_outcomes`,
            trend: trend.direction,
            change_rate: trend.rate,
            period_months: trend.period,
            confidence: trend.confidence,
            data_points: outcomeScores.slice(-12),
          });
        }
      }
    });

    return trends;
  }

  /**
   * Identify behavioral patterns
   */
  async identifyBehavioralPatterns(
    _patientId: string,
    timeline: any[]
  ): Promise<BehavioralPattern[]> {
    const patterns: BehavioralPattern[] = [];

    // Analyze appointment patterns
    const appointments = timeline.filter((e) => e.event_type === 'appointment');
    if (appointments.length > 0) {
      const adherenceRate =
        appointments.filter((a) => a.outcome_score && a.outcome_score > 0.7)
          .length / appointments.length;

      patterns.push({
        pattern_type: 'appointment_adherence',
        description: `${Math.round(adherenceRate * 100)}% appointment adherence rate`,
        frequency: appointments.length,
        strength: adherenceRate,
        actionable_insights: this.getAdherenceInsights(adherenceRate),
      });
    }

    return patterns;
  }

  /**
   * Predict treatment outcomes
   */
  async predictTreatmentOutcomes(
    profile: PatientProfile,
    _timeline: any[]
  ): Promise<TreatmentPrediction[]> {
    const predictions: TreatmentPrediction[] = [];

    // Mock treatment predictions based on profile data
    if (profile.chronic_conditions.includes('diabetes')) {
      predictions.push({
        treatment_type: 'Diabetes Management',
        success_probability: 0.85,
        expected_duration: '6-12 months',
        optimal_frequency: 'Monthly monitoring',
        contraindications: [],
        supporting_factors: ['Good adherence history', 'Stable condition'],
      });
    }

    return predictions;
  }

  /**
   * Generate optimization suggestions
   */
  async generateOptimizationSuggestions(
    profile: PatientProfile,
    _timeline: any[]
  ): Promise<OptimizationSuggestion[]> {
    const suggestions: OptimizationSuggestion[] = [];

    // Profile completeness suggestion
    if (profile.profile_completeness_score < 0.8) {
      suggestions.push({
        category: 'treatment',
        suggestion: 'Complete patient profile for better care personalization',
        impact_score: 0.7,
        implementation_effort: 'low',
        expected_outcome:
          'Improved treatment accuracy and patient satisfaction',
      });
    }

    return suggestions;
  }

  // Helper methods
  private async getPatientProfile(
    patientId: string
  ): Promise<PatientProfile | null> {
    const { data, error } = await this.supabase
      .from('patient_profiles_extended')
      .select('*')
      .eq('patient_id', patientId)
      .single();

    return error ? null : (data as PatientProfile);
  }

  private async getMedicalTimeline(patientId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('medical_timeline')
      .select('*')
      .eq('patient_id', patientId)
      .order('event_date', { ascending: false });

    return error ? [] : data;
  }

  private async updatePatientAIInsights(
    patientId: string,
    insights: PatientInsights
  ): Promise<void> {
    await this.supabase
      .from('patient_profiles_extended')
      .update({
        ai_insights: insights,
        risk_score: insights.risk_assessment.overall_score,
        risk_level: insights.risk_assessment.risk_level,
        last_assessment_date: new Date().toISOString(),
      })
      .eq('patient_id', patientId);
  }

  private getConditionMitigationStrategies(condition: string): string[] {
    const strategies: Record<string, string[]> = {
      diabetes: [
        'Blood glucose monitoring',
        'Dietary management',
        'Exercise program',
        'Medication adherence',
      ],
      hypertension: [
        'Blood pressure monitoring',
        'Sodium restriction',
        'Weight management',
        'Stress reduction',
      ],
      heart_disease: [
        'Cardiac rehabilitation',
        'Lifestyle modification',
        'Medication compliance',
        'Regular monitoring',
      ],
    };

    return (
      strategies[condition.toLowerCase()] || [
        'Regular monitoring',
        'Lifestyle modification',
        'Medical follow-up',
      ]
    );
  }

  private generateRiskRecommendations(
    riskLevel: string,
    _riskFactors: RiskFactor[]
  ): string[] {
    const recommendations: string[] = [];

    if (riskLevel === 'critical') {
      recommendations.push('Immediate medical attention required');
      recommendations.push('Increase monitoring frequency');
    } else if (riskLevel === 'high') {
      recommendations.push('Frequent monitoring recommended');
      recommendations.push('Consider specialist referral');
    } else if (riskLevel === 'medium') {
      recommendations.push('Regular monitoring advised');
      recommendations.push('Implement preventive measures');
    } else {
      recommendations.push('Continue current care plan');
      recommendations.push('Maintain preventive care schedule');
    }

    return recommendations;
  }

  private calculateConfidence(
    profile: PatientProfile,
    timeline: any[]
  ): number {
    let confidence = 0.5;
    confidence += Math.min(timeline.length * 0.05, 0.3);
    confidence += profile.profile_completeness_score * 0.2;
    return Math.min(confidence, 1.0);
  }

  private getDefaultRiskAssessment(): RiskAssessment {
    return {
      overall_score: 0.3,
      risk_level: 'low',
      risk_factors: [],
      recommendations: ['Continue current care plan'],
      confidence: 0.5,
      last_updated: new Date().toISOString(),
    };
  }

  private calculateTrend(dataPoints: { date: string; value: number }[]): {
    direction: 'improving' | 'stable' | 'declining';
    rate: number;
    period: number;
    confidence: number;
  } {
    if (dataPoints.length < 2) {
      return { direction: 'stable', rate: 0, period: 0, confidence: 0 };
    }

    // Simple linear regression
    const n = dataPoints.length;
    const dates = dataPoints.map((p) => new Date(p.date).getTime());
    const values = dataPoints.map((p) => p.value);

    const sumX = dates.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = dates.reduce((sum, x, i) => sum + x * values[i], 0);
    const sumXX = dates.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    const direction: 'improving' | 'stable' | 'declining' =
      slope > 0.001 ? 'improving' : slope < -0.001 ? 'declining' : 'stable';

    const periodMonths =
      (dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24 * 30);

    return {
      direction,
      rate: Math.abs(slope),
      period: Math.round(periodMonths),
      confidence: Math.min(n / 10, 1.0),
    };
  }

  private getAdherenceInsights(rate: number): string[] {
    if (rate > 0.8) {
      return [
        'Excellent adherence - maintain current approach',
        'Consider rewards program',
      ];
    }
    if (rate > 0.6) {
      return [
        'Good adherence with room for improvement',
        'Implement reminder system',
      ];
    }
    return [
      'Poor adherence requires intervention',
      'Identify root causes',
      'Implement support system',
    ];
  }
}

export default PatientInsightsEngine;
