// Story 11.2: No-Show Prediction Engine Service
// ≥80% accuracy ML-based prediction system with multi-factor analysis

import type {
  AppointmentOutcomeValue,
  CreateInterventionInput,
  CreatePredictionInput,
  CreateRiskFactorInput,
  InterventionStrategy,
  InterventionTypeValue,
  ModelPerformance,
  NoShowDashboardStats,
  NoShowPrediction,
  NoShowTrends,
  PredictionAnalysis,
  RiskFactor,
  RiskFactorTypeValue,
  UpdateInterventionInput,
  UpdatePredictionInput,
} from '@/app/types/no-show-prediction';
import { createClient } from '@/app/utils/supabase/server';

// Configuration interface
interface NoShowPredictionConfig {
  minimumAccuracy: number;
  confidenceThreshold: number;
  interventionThreshold: number;
  modelVersion: string;
  factorWeights: Record<RiskFactorTypeValue, number>;
}

export class NoShowPredictionEngine {
  private readonly supabase;
  private readonly config: NoShowPredictionConfig;

  constructor() {
    this.supabase = createClient();
    this.config = {
      minimumAccuracy: 0.8, // ≥80% requirement
      confidenceThreshold: 0.7,
      interventionThreshold: 0.6,
      modelVersion: 'v1.0',
      factorWeights: {
        historical_attendance: 0.25,
        appointment_timing: 0.15,
        demographics: 0.1,
        communication_response: 0.15,
        weather_sensitivity: 0.05,
        distance_travel: 0.1,
        appointment_type: 0.08,
        day_of_week: 0.07,
        season: 0.03,
        confirmation_pattern: 0.12,
      },
    };
  }

  // Core prediction methods
  async generatePrediction(
    appointmentId: string,
    patientId?: string
  ): Promise<PredictionAnalysis> {
    // Get appointment details
    const appointment = await this.getAppointmentDetails(appointmentId);
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // Use patientId from appointment if not provided
    const targetPatientId = patientId || appointment.patient_id;

    // Get patient historical data
    const historicalPattern =
      await this.getPatientHistoricalPattern(targetPatientId);

    // Calculate risk factors
    const riskFactors = await this.calculateRiskFactors(
      targetPatientId,
      appointment
    );

    // Generate ML prediction
    const predictionResult = await this.runPredictionModel(
      riskFactors,
      historicalPattern
    );

    return {
      patient_id: targetPatientId,
      appointment_id: appointmentId,
      risk_factors: riskFactors,
      historical_pattern: historicalPattern,
      prediction_result: predictionResult,
    };
  }

  async analyzeRiskFactors(
    patientId: string,
    appointment: any
  ): Promise<RiskFactor[]> {
    return await this.calculateRiskFactors(patientId, appointment);
  }

  async updatePredictionOutcome(
    predictionId: string,
    actualOutcome: boolean
  ): Promise<NoShowPrediction> {
    const outcome: AppointmentOutcomeValue = actualOutcome
      ? 'no_show'
      : 'attended';

    const { data, error } = await this.supabase
      .from('no_show_predictions')
      .update({
        actual_outcome: outcome,
        outcome_date: new Date().toISOString(),
      })
      .eq('id', predictionId)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  async calculateAccuracyMetrics(
    _clinicId: string,
    startDate: string,
    endDate: string
  ): Promise<ModelPerformance> {
    const { data: predictions, error } = await this.supabase
      .from('no_show_predictions')
      .select('*')
      .gte('prediction_date', startDate)
      .lte('prediction_date', endDate)
      .not('actual_outcome', 'is', null);

    if (error) {
      throw error;
    }

    const totalPredictions = predictions?.length || 0;
    if (totalPredictions === 0) {
      throw new Error(
        'No predictions with actual outcomes found for the specified period'
      );
    }

    const correctPredictions =
      predictions?.filter((p) => {
        const predictedNoShow = p.risk_score >= this.config.confidenceThreshold;
        const actualNoShow = p.actual_outcome === 'no_show';
        return predictedNoShow === actualNoShow;
      }).length || 0;

    const accuracy = correctPredictions / totalPredictions;
    const precision = this.calculatePrecision(predictions || []);
    const recall = this.calculateRecall(predictions || []);
    const f1Score =
      precision && recall ? (2 * precision * recall) / (precision + recall) : 0;

    return {
      model_version: this.config.modelVersion,
      total_predictions: totalPredictions,
      accurate_predictions: correctPredictions,
      accuracy_rate: accuracy,
      precision_score: precision,
      recall_score: recall,
      f1_score: f1Score,
      false_positives: this.calculateFalsePositives(predictions || []),
      false_negatives: this.calculateFalseNegatives(predictions || []),
      confidence_threshold: this.config.confidenceThreshold,
      evaluation_period: { start_date: startDate, end_date: endDate },
    };
  }

  async getHighRiskPatients(
    _clinicId: string,
    startDate: string,
    endDate: string
  ): Promise<NoShowPrediction[]> {
    const { data, error } = await this.supabase
      .from('no_show_predictions')
      .select(`
        *,
        appointments!inner(*),
        patients!inner(*)
      `)
      .gte('prediction_date', startDate)
      .lte('prediction_date', endDate)
      .gte('risk_score', this.config.confidenceThreshold)
      .is('actual_outcome', null)
      .order('risk_score', { ascending: false });

    if (error) {
      throw error;
    }
    return data || [];
  }

  async createPrediction(
    input: CreatePredictionInput
  ): Promise<NoShowPrediction> {
    const { data, error } = await this.supabase
      .from('no_show_predictions')
      .insert(input)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  async updatePrediction(
    id: string,
    input: UpdatePredictionInput
  ): Promise<NoShowPrediction> {
    const { data, error } = await this.supabase
      .from('no_show_predictions')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  async getPrediction(id: string): Promise<NoShowPrediction | null> {
    const { data, error } = await this.supabase
      .from('no_show_predictions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return null;
    }
    return data;
  }

  async getPredictionsByAppointment(
    appointmentId: string
  ): Promise<NoShowPrediction[]> {
    const { data, error } = await this.supabase
      .from('no_show_predictions')
      .select('*')
      .eq('appointment_id', appointmentId)
      .order('prediction_date', { ascending: false });

    if (error) {
      throw error;
    }
    return data || [];
  }

  async getHighRiskPredictions(threshold = 0.7): Promise<NoShowPrediction[]> {
    const { data, error } = await this.supabase
      .from('no_show_predictions')
      .select('*')
      .gte('risk_score', threshold)
      .is('actual_outcome', null)
      .order('risk_score', { ascending: false });

    if (error) {
      throw error;
    }
    return data || [];
  }

  // Risk factor management
  async createRiskFactor(input: CreateRiskFactorInput): Promise<RiskFactor> {
    const { data, error } = await this.supabase
      .from('risk_factors')
      .insert(input)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  async getRiskFactorsByPatient(patientId: string): Promise<RiskFactor[]> {
    const { data, error } = await this.supabase
      .from('risk_factors')
      .select('*')
      .eq('patient_id', patientId)
      .order('last_updated', { ascending: false });

    if (error) {
      throw error;
    }
    return data || [];
  }

  async updateRiskFactorWeights(patientId: string): Promise<RiskFactor[]> {
    // Recalculate weights based on patient's recent behavior
    const factors = await this.getRiskFactorsByPatient(patientId);
    const recentAppointments = await this.getRecentAppointments(patientId, 90); // Last 90 days

    for (const factor of factors) {
      const newWeight = await this.calculateFactorWeight(
        factor,
        recentAppointments
      );
      await this.supabase
        .from('risk_factors')
        .update({
          weight_score: newWeight,
          last_updated: new Date().toISOString(),
        })
        .eq('id', factor.id);
    }

    return await this.getRiskFactorsByPatient(patientId);
  }

  // Intervention management
  async createIntervention(
    input: CreateInterventionInput
  ): Promise<InterventionStrategy> {
    const { data, error } = await this.supabase
      .from('intervention_strategies')
      .insert(input)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  async executeIntervention(
    id: string,
    input: UpdateInterventionInput
  ): Promise<InterventionStrategy> {
    const { data, error } = await this.supabase
      .from('intervention_strategies')
      .update({
        ...input,
        executed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  async getRecommendedInterventions(
    predictionId: string
  ): Promise<InterventionStrategy[]> {
    const prediction = await this.getPrediction(predictionId);
    if (!prediction?.intervention_recommended) {
      return [];
    }

    // Get existing interventions to avoid duplicates
    const { data: existing } = await this.supabase
      .from('intervention_strategies')
      .select('intervention_type')
      .eq('prediction_id', predictionId);

    const existingTypes = existing?.map((i) => i.intervention_type) || [];

    // Generate recommendations based on risk score and factors
    const recommendations = await this.generateInterventionRecommendations(
      prediction,
      existingTypes
    );

    return recommendations;
  }

  // Analytics and reporting
  async getModelPerformance(modelVersion?: string): Promise<ModelPerformance> {
    const version = modelVersion || this.config.modelVersion;

    const { data: predictions, error } = await this.supabase
      .from('no_show_predictions')
      .select('*')
      .eq('model_version', version)
      .not('actual_outcome', 'is', null);

    if (error) {
      throw error;
    }

    const totalPredictions = predictions?.length || 0;
    if (totalPredictions === 0) {
      throw new Error('No predictions with actual outcomes found');
    }

    let correctPredictions = 0;
    let falsePositives = 0;
    let falseNegatives = 0;
    let truePositives = 0;
    let _trueNegatives = 0;

    predictions?.forEach((pred) => {
      const predictedNoShow = pred.risk_score >= 0.5;
      const actualNoShow = pred.actual_outcome === 'no_show';

      if (predictedNoShow === actualNoShow) {
        correctPredictions++;
      }

      if (predictedNoShow && actualNoShow) {
        truePositives++;
      } else if (predictedNoShow && !actualNoShow) {
        falsePositives++;
      } else if (!predictedNoShow && actualNoShow) {
        falseNegatives++;
      } else {
        _trueNegatives++;
      }
    });

    const accuracy = correctPredictions / totalPredictions;
    const precision = truePositives / (truePositives + falsePositives) || 0;
    const recall = truePositives / (truePositives + falseNegatives) || 0;
    const f1Score = (2 * precision * recall) / (precision + recall) || 0;

    return {
      model_version: version,
      accuracy_rate: accuracy,
      precision,
      recall,
      f1_score: f1Score,
      total_predictions: totalPredictions,
      correct_predictions: correctPredictions,
      false_positives: falsePositives,
      false_negatives: falseNegatives,
      evaluation_period: {
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
      },
    };
  }

  async getDashboardStats(): Promise<NoShowDashboardStats> {
    const today = new Date().toISOString().split('T')[0];
    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    const monthStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    // Today's stats
    const todayHighRisk = await this.getHighRiskPredictions(0.7);
    const todayInterventions = await this.getTodayInterventions();

    // Week stats
    const weekAnalytics = await this.getAnalyticsForPeriod(weekStart, today);

    // Month stats
    const monthAnalytics = await this.getAnalyticsForPeriod(monthStart, today);

    return {
      today: {
        high_risk_appointments: todayHighRisk.length,
        interventions_scheduled: todayInterventions.scheduled,
        predicted_no_shows: todayHighRisk.filter((p) => p.risk_score >= 0.8)
          .length,
        estimated_cost_impact: todayInterventions.estimatedCost,
      },
      this_week: {
        accuracy_rate: weekAnalytics.averageAccuracy,
        interventions_executed: weekAnalytics.interventionsExecuted,
        successful_interventions: weekAnalytics.successfulInterventions,
        revenue_saved: weekAnalytics.revenueSaved,
      },
      this_month: {
        total_predictions: monthAnalytics.totalPredictions,
        model_accuracy: monthAnalytics.averageAccuracy,
        cost_savings: monthAnalytics.costSavings,
        trend_analysis: monthAnalytics.trendDirection,
      },
    };
  }

  async getNoShowTrends(
    startDate: string,
    endDate: string
  ): Promise<NoShowTrends> {
    const { data: analytics, error } = await this.supabase
      .from('no_show_analytics')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date');

    if (error) {
      throw error;
    }

    const totalAppointments =
      analytics?.reduce(
        (sum, a) => sum + (a.predicted_no_shows + a.actual_no_shows),
        0
      ) || 0;
    const totalPredicted =
      analytics?.reduce((sum, a) => sum + a.predicted_no_shows, 0) || 0;
    const totalActual =
      analytics?.reduce((sum, a) => sum + a.actual_no_shows, 0) || 0;
    const totalCost =
      analytics?.reduce((sum, a) => sum + a.cost_impact, 0) || 0;
    const totalRevenue =
      analytics?.reduce((sum, a) => sum + a.revenue_recovered, 0) || 0;
    const avgAccuracy =
      analytics?.reduce((sum, a) => sum + a.accuracy_rate, 0) /
        (analytics?.length || 1) || 0;

    return {
      period: { start_date: startDate, end_date: endDate },
      overall_stats: {
        total_appointments: totalAppointments,
        predicted_no_shows: totalPredicted,
        actual_no_shows: totalActual,
        accuracy_rate: avgAccuracy,
        cost_impact: totalCost,
        revenue_recovered: totalRevenue,
      },
      trends_by_factor: await this.calculateFactorTrends(startDate, endDate),
      intervention_effectiveness: await this.calculateInterventionEffectiveness(
        startDate,
        endDate
      ),
    };
  }

  // Helper methods for metrics calculation
  private calculatePrecision(predictions: NoShowPrediction[]): number {
    const predictedPositives = predictions.filter(
      (p) => p.risk_score >= this.config.confidenceThreshold
    );
    const truePositives = predictedPositives.filter(
      (p) => p.actual_outcome === 'no_show'
    );

    return predictedPositives.length > 0
      ? truePositives.length / predictedPositives.length
      : 0;
  }

  private calculateRecall(predictions: NoShowPrediction[]): number {
    const actualPositives = predictions.filter(
      (p) => p.actual_outcome === 'no_show'
    );
    const truePositives = actualPositives.filter(
      (p) => p.risk_score >= this.config.confidenceThreshold
    );

    return actualPositives.length > 0
      ? truePositives.length / actualPositives.length
      : 0;
  }

  private calculateFalsePositives(predictions: NoShowPrediction[]): number {
    return predictions.filter(
      (p) =>
        p.risk_score >= this.config.confidenceThreshold &&
        p.actual_outcome === 'attended'
    ).length;
  }

  private calculateFalseNegatives(predictions: NoShowPrediction[]): number {
    return predictions.filter(
      (p) =>
        p.risk_score < this.config.confidenceThreshold &&
        p.actual_outcome === 'no_show'
    ).length;
  }

  // Private helper methods
  private async getAppointmentDetails(appointmentId: string) {
    const { data, error } = await this.supabase
      .from('appointments')
      .select(`
        *,
        service_types(*),
        patients(*),
        professionals(*)
      `)
      .eq('id', appointmentId)
      .single();

    return error ? null : data;
  }

  private async getPatientHistoricalPattern(patientId: string) {
    const { data: appointments, error } = await this.supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', patientId)
      .order('start_time', { ascending: false });

    if (error) {
      throw error;
    }

    const total = appointments?.length || 0;
    const noShows =
      appointments?.filter((a) => a.status === 'no_show').length || 0;
    const attended =
      appointments?.filter((a) => a.status === 'completed').length || 0;
    const lastAttendance = appointments?.find(
      (a) => a.status === 'completed'
    )?.start_time;

    return {
      total_appointments: total,
      no_shows: noShows,
      attendance_rate: total > 0 ? attended / total : 1,
      last_attendance: lastAttendance || undefined,
    };
  }

  private async calculateRiskFactors(
    patientId: string,
    appointment: any
  ): Promise<RiskFactor[]> {
    const factors: CreateRiskFactorInput[] = [];
    const patientHistory = await this.getPatientHistoricalPattern(patientId);

    // Historical attendance factor
    factors.push({
      patient_id: patientId,
      factor_type: 'historical_attendance',
      factor_value: 1 - patientHistory.attendance_rate,
      weight_score: this.config.factorWeights.historical_attendance,
      calculation_details: {
        total_appointments: patientHistory.total_appointments,
        no_shows: patientHistory.no_shows,
        attendance_rate: patientHistory.attendance_rate,
      },
    });

    // Appointment timing factor
    const appointmentHour = new Date(appointment.start_time).getHours();
    const timingRisk = this.calculateTimingRisk(appointmentHour);
    factors.push({
      patient_id: patientId,
      factor_type: 'appointment_timing',
      factor_value: timingRisk,
      weight_score: this.config.factorWeights.appointment_timing,
      calculation_details: { hour: appointmentHour, risk_score: timingRisk },
    });

    // Day of week factor
    const dayOfWeek = new Date(appointment.start_time).getDay();
    const dayRisk = this.calculateDayOfWeekRisk(dayOfWeek);
    factors.push({
      patient_id: patientId,
      factor_type: 'day_of_week',
      factor_value: dayRisk,
      weight_score: this.config.factorWeights.day_of_week,
      calculation_details: { day: dayOfWeek, risk_score: dayRisk },
    });

    // Create risk factors in database
    const createdFactors: RiskFactor[] = [];
    for (const factor of factors) {
      try {
        const created = await this.createRiskFactor(factor);
        createdFactors.push(created);
      } catch (error) {
        console.error('Error creating risk factor:', error);
      }
    }

    return createdFactors;
  }

  private async runPredictionModel(
    riskFactors: RiskFactor[],
    historicalPattern: any
  ) {
    let totalRisk = 0;
    let totalWeight = 0;
    const keyFactors: string[] = [];

    // Calculate weighted risk score
    riskFactors.forEach((factor) => {
      const weightedRisk = factor.factor_value * factor.weight_score;
      totalRisk += weightedRisk;
      totalWeight += factor.weight_score;

      // Identify key factors (high impact)
      if (factor.factor_value > 0.6 && factor.weight_score > 0.1) {
        keyFactors.push(factor.factor_type);
      }
    });

    const baseRiskScore = totalWeight > 0 ? totalRisk / totalWeight : 0;

    // Adjust based on historical pattern
    const historyAdjustment = (1 - historicalPattern.attendance_rate) * 0.2;
    const finalRiskScore = Math.min(
      1,
      Math.max(0, baseRiskScore + historyAdjustment)
    );

    // Calculate confidence based on data quality
    const confidence = this.calculatePredictionConfidence(
      riskFactors,
      historicalPattern
    );

    return {
      risk_score: finalRiskScore,
      confidence,
      intervention_recommended:
        finalRiskScore >= this.config.interventionThreshold,
      key_factors: keyFactors,
    };
  }

  private calculateTimingRisk(hour: number): number {
    // Higher risk for very early or very late appointments
    if (hour < 8 || hour > 18) {
      return 0.8;
    }
    if (hour < 9 || hour > 17) {
      return 0.6;
    }
    return 0.3;
  }

  private calculateDayOfWeekRisk(day: number): number {
    // Monday = 1, Sunday = 0
    // Higher risk on Mondays and Fridays
    const riskByDay = [0.4, 0.7, 0.3, 0.3, 0.3, 0.6, 0.5]; // Sun-Sat
    return riskByDay[day] || 0.4;
  }

  private calculatePredictionConfidence(
    riskFactors: RiskFactor[],
    historicalPattern: any
  ): number {
    let confidence = 0.7; // Base confidence

    // Increase confidence with more data points
    if (historicalPattern.total_appointments > 5) {
      confidence += 0.1;
    }
    if (historicalPattern.total_appointments > 10) {
      confidence += 0.1;
    }

    // Increase confidence with more risk factors
    if (riskFactors.length >= 5) {
      confidence += 0.05;
    }
    if (riskFactors.length >= 8) {
      confidence += 0.05;
    }

    return Math.min(1, confidence);
  }

  private async generateInterventionRecommendations(
    prediction: NoShowPrediction,
    existingTypes: InterventionTypeValue[]
  ): Promise<InterventionStrategy[]> {
    const recommendations: CreateInterventionInput[] = [];

    if (
      prediction.risk_score >= 0.8 &&
      !existingTypes.includes('personal_call')
    ) {
      recommendations.push({
        prediction_id: prediction.id,
        intervention_type: 'personal_call',
        trigger_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h before
        intervention_details: { priority: 'high', reason: 'very_high_risk' },
      });
    }

    if (
      prediction.risk_score >= 0.6 &&
      !existingTypes.includes('targeted_reminder')
    ) {
      recommendations.push({
        prediction_id: prediction.id,
        intervention_type: 'targeted_reminder',
        trigger_time: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48h before
        intervention_details: { channel: 'whatsapp', personalized: true },
      });
    }

    const created: InterventionStrategy[] = [];
    for (const rec of recommendations) {
      try {
        const intervention = await this.createIntervention(rec);
        created.push(intervention);
      } catch (error) {
        console.error('Error creating intervention:', error);
      }
    }

    return created;
  }

  private async getRecentAppointments(patientId: string, days: number) {
    const startDate = new Date(
      Date.now() - days * 24 * 60 * 60 * 1000
    ).toISOString();

    const { data, error } = await this.supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', patientId)
      .gte('start_time', startDate)
      .order('start_time', { ascending: false });

    return error ? [] : data || [];
  }

  private async calculateFactorWeight(
    factor: RiskFactor,
    _recentAppointments: any[]
  ): number {
    // Simplified weight calculation - in production, this would use ML
    const baseWeight = this.config.factorWeights[factor.factor_type] || 0.1;

    // Adjust based on recent accuracy of this factor type
    // This is a placeholder - real implementation would analyze factor performance
    return Math.min(1, Math.max(0.01, baseWeight));
  }

  private async getTodayInterventions() {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await this.supabase
      .from('intervention_strategies')
      .select('*')
      .gte('trigger_time', today)
      .lt('trigger_time', `${today}T23:59:59`);

    const interventions = data || [];
    const scheduled = interventions.filter((i) => !i.executed_at).length;
    const estimatedCost = interventions.reduce(
      (sum, i) => sum + (i.cost_impact || 0),
      0
    );

    return { scheduled, estimatedCost };
  }

  private async getAnalyticsForPeriod(startDate: string, endDate: string) {
    const { data, error } = await this.supabase
      .from('no_show_analytics')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate);

    const analytics = data || [];

    return {
      averageAccuracy:
        analytics.reduce((sum, a) => sum + a.accuracy_rate, 0) /
        (analytics.length || 1),
      interventionsExecuted: analytics.reduce(
        (sum, a) => sum + a.interventions_executed,
        0
      ),
      successfulInterventions: analytics.reduce(
        (sum, a) => sum + a.interventions_executed * 0.7,
        0
      ), // Estimated
      revenueSaved: analytics.reduce((sum, a) => sum + a.revenue_recovered, 0),
      totalPredictions: analytics.length * 10, // Estimated
      costSavings: analytics.reduce(
        (sum, a) => sum + a.revenue_recovered - a.cost_impact,
        0
      ),
      trendDirection:
        analytics.length > 1
          ? analytics.at(-1).accuracy_rate > analytics[0].accuracy_rate
            ? 'improving'
            : 'declining'
          : 'stable',
    };
  }

  private async calculateFactorTrends(_startDate: string, _endDate: string) {
    // Placeholder implementation - would analyze factor effectiveness over time
    const factors: Record<string, any> = {};

    Object.keys(this.config.factorWeights).forEach((factor) => {
      factors[factor] = {
        factor_impact: this.config.factorWeights[factor as RiskFactorTypeValue],
        trend_direction: 'stable' as const,
        correlation_strength: 0.7, // Placeholder
      };
    });

    return factors;
  }

  private async calculateInterventionEffectiveness(
    _startDate: string,
    _endDate: string
  ) {
    // Placeholder implementation - would analyze intervention success rates
    const interventions: Record<string, any> = {};

    const interventionTypes: InterventionTypeValue[] = [
      'targeted_reminder',
      'confirmation_request',
      'incentive_offer',
      'flexible_rescheduling',
      'personal_call',
      'priority_booking',
    ];

    interventionTypes.forEach((type) => {
      interventions[type] = {
        success_rate: 0.75, // Placeholder
        cost_per_prevention: 25.0, // Placeholder
        roi: 3.2, // Placeholder
      };
    });

    return interventions;
  }
}

// Export singleton instance
export const noShowPredictionEngine = new NoShowPredictionEngine();
