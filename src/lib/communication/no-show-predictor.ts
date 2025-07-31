/**
 * No-Show Predictor - ML-based prediction for appointment no-shows
 * Story 2.3: Automated Communication System
 */

import { supabase } from '../supabase';
import { NoShowPrediction } from './types';

export interface PredictionFactors {
  historical_no_shows: number;
  appointment_time: string;
  advance_booking_days: number;
  previous_cancellations: number;
  communication_response_rate: number;
  appointment_type: string;
  weather_factor?: number;
  day_of_week: string;
  time_of_day: 'morning' | 'afternoon' | 'evening';
  patient_age?: number;
  distance_from_clinic?: number;
  insurance_type?: string;
}

export class NoShowPredictor {
  private weights = {
    historical_no_shows: 0.25,
    advance_booking_days: 0.15,
    previous_cancellations: 0.20,
    communication_response_rate: -0.15, // Negative because higher response = lower risk
    appointment_time: 0.10,
    day_of_week: 0.08,
    weather_factor: 0.05,
    patient_age: 0.07,
    distance_from_clinic: 0.05
  };

  /**
   * Predict no-show probability for an appointment
   */
  async predict(appointmentId: string): Promise<NoShowPrediction> {
    try {
      // Get appointment details with related data
      const { data: appointment } = await supabase
        .from('appointments')
        .select(`
          *,
          patients(*),
          professionals(*),
          services(*),
          clinics(*)
        `)
        .eq('id', appointmentId)
        .single();

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      // Calculate prediction factors
      const factors = await this.calculateFactors(appointment);
      
      // Calculate risk score using weighted factors
      const riskScore = this.calculateRiskScore(factors);
      
      // Determine confidence based on data availability
      const confidence = this.calculateConfidence(factors);
      
      // Generate recommended actions
      const recommendedActions = this.generateRecommendations(riskScore, factors);
      
      const prediction: NoShowPrediction = {
        id: `pred_${appointmentId}_${Date.now()}`,
        appointment_id: appointmentId,
        patient_id: appointment.patient_id,
        risk_score: Math.min(Math.max(riskScore, 0), 1), // Clamp between 0 and 1
        factors,
        prediction_confidence: confidence,
        recommended_actions: recommendedActions,
        created_at: new Date()
      };
      
      // Store prediction in database
      await this.storePrediction(prediction);
      
      return prediction;
    } catch (error) {
      console.error('Error predicting no-show:', error);
      throw error;
    }
  }

  /**
   * Batch predict for multiple appointments
   */
  async batchPredict(appointmentIds: string[]): Promise<NoShowPrediction[]> {
    const predictions: NoShowPrediction[] = [];
    
    // Process in batches to avoid overwhelming the database
    const batchSize = 10;
    
    for (let i = 0; i < appointmentIds.length; i += batchSize) {
      const batch = appointmentIds.slice(i, i + batchSize);
      
      const batchPromises = batch.map(id => this.predict(id));
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          predictions.push(result.value);
        } else {
          console.error('Batch prediction error:', result.reason);
        }
      });
    }
    
    return predictions;
  }

  /**
   * Update model weights based on actual outcomes
   */
  async updateModel(actualOutcomes: Array<{
    appointmentId: string;
    actualNoShow: boolean;
    predictedRisk: number;
  }>): Promise<void> {
    try {
      // Simple learning algorithm - adjust weights based on prediction accuracy
      const learningRate = 0.01;
      
      for (const outcome of actualOutcomes) {
        const error = (outcome.actualNoShow ? 1 : 0) - outcome.predictedRisk;
        
        // Get the factors that were used for this prediction
        const { data: prediction } = await supabase
          .from('no_show_predictions')
          .select('factors')
          .eq('appointment_id', outcome.appointmentId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (prediction && prediction.factors) {
          // Adjust weights based on error
          Object.keys(this.weights).forEach(factor => {
            if (prediction.factors[factor] !== undefined) {
              const factorValue = this.normalizeFactorValue(factor, prediction.factors[factor]);
              this.weights[factor] += learningRate * error * factorValue;
            }
          });
        }
      }
      
      // Store updated weights
      await this.storeModelWeights();
    } catch (error) {
      console.error('Error updating model:', error);
      throw error;
    }
  }

  /**
   * Get model performance metrics
   */
  async getModelPerformance(startDate: Date, endDate: Date): Promise<{
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    total_predictions: number;
  }> {
    try {
      // Get predictions and actual outcomes for the period
      const { data: predictions } = await supabase
        .from('no_show_predictions')
        .select(`
          *,
          appointments(
            status,
            actual_no_show
          )
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
      
      if (!predictions || predictions.length === 0) {
        return {
          accuracy: 0,
          precision: 0,
          recall: 0,
          f1_score: 0,
          total_predictions: 0
        };
      }
      
      let truePositives = 0;
      let falsePositives = 0;
      let trueNegatives = 0;
      let falseNegatives = 0;
      
      predictions.forEach(pred => {
        const predictedNoShow = pred.risk_score > 0.5;
        const actualNoShow = pred.appointments?.actual_no_show || false;
        
        if (predictedNoShow && actualNoShow) truePositives++;
        else if (predictedNoShow && !actualNoShow) falsePositives++;
        else if (!predictedNoShow && !actualNoShow) trueNegatives++;
        else if (!predictedNoShow && actualNoShow) falseNegatives++;
      });
      
      const accuracy = (truePositives + trueNegatives) / predictions.length;
      const precision = truePositives / (truePositives + falsePositives) || 0;
      const recall = truePositives / (truePositives + falseNegatives) || 0;
      const f1Score = 2 * (precision * recall) / (precision + recall) || 0;
      
      return {
        accuracy,
        precision,
        recall,
        f1_score: f1Score,
        total_predictions: predictions.length
      };
    } catch (error) {
      console.error('Error calculating model performance:', error);
      throw error;
    }
  }

  // Private helper methods
  private async calculateFactors(appointment: any): Promise<PredictionFactors> {
    const appointmentDate = new Date(appointment.scheduled_at);
    const now = new Date();
    
    // Calculate advance booking days
    const advanceBookingDays = Math.floor(
      (appointmentDate.getTime() - new Date(appointment.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Get historical no-shows for this patient
    const { data: historicalAppointments } = await supabase
      .from('appointments')
      .select('status, actual_no_show')
      .eq('patient_id', appointment.patient_id)
      .neq('id', appointment.id);
    
    const totalHistorical = historicalAppointments?.length || 0;
    const historicalNoShows = historicalAppointments?.filter(a => a.actual_no_show).length || 0;
    const previousCancellations = historicalAppointments?.filter(a => a.status === 'cancelled').length || 0;
    
    // Get communication response rate
    const { data: communications } = await supabase
      .from('communication_logs')
      .select('status')
      .eq('patient_id', appointment.patient_id);
    
    const totalCommunications = communications?.length || 0;
    const responses = communications?.filter(c => c.status === 'responded').length || 0;
    const communicationResponseRate = totalCommunications > 0 ? responses / totalCommunications : 0.5;
    
    // Determine time of day
    const hour = appointmentDate.getHours();
    let timeOfDay: 'morning' | 'afternoon' | 'evening';
    if (hour < 12) timeOfDay = 'morning';
    else if (hour < 18) timeOfDay = 'afternoon';
    else timeOfDay = 'evening';
    
    return {
      historical_no_shows: totalHistorical > 0 ? historicalNoShows / totalHistorical : 0,
      appointment_time: appointmentDate.toTimeString().slice(0, 5),
      advance_booking_days: Math.max(0, advanceBookingDays),
      previous_cancellations: totalHistorical > 0 ? previousCancellations / totalHistorical : 0,
      communication_response_rate: communicationResponseRate,
      appointment_type: appointment.services?.name || 'unknown',
      day_of_week: appointmentDate.toLocaleDateString('en-US', { weekday: 'long' }),
      time_of_day: timeOfDay,
      patient_age: appointment.patients?.birth_date 
        ? Math.floor((now.getTime() - new Date(appointment.patients.birth_date).getTime()) / (1000 * 60 * 60 * 24 * 365))
        : undefined
    };
  }

  private calculateRiskScore(factors: PredictionFactors): number {
    let score = 0;
    
    // Historical no-shows (0-1)
    score += factors.historical_no_shows * this.weights.historical_no_shows;
    
    // Advance booking days (normalized)
    const normalizedAdvanceDays = Math.min(factors.advance_booking_days / 30, 1);
    score += normalizedAdvanceDays * this.weights.advance_booking_days;
    
    // Previous cancellations (0-1)
    score += factors.previous_cancellations * this.weights.previous_cancellations;
    
    // Communication response rate (inverted - higher response = lower risk)
    score += (1 - factors.communication_response_rate) * Math.abs(this.weights.communication_response_rate);
    
    // Time-based factors
    const timeRisk = this.getTimeRisk(factors.time_of_day, factors.day_of_week);
    score += timeRisk * this.weights.appointment_time;
    
    // Day of week risk
    const dayRisk = this.getDayOfWeekRisk(factors.day_of_week);
    score += dayRisk * this.weights.day_of_week;
    
    // Age factor (if available)
    if (factors.patient_age) {
      const ageRisk = this.getAgeRisk(factors.patient_age);
      score += ageRisk * this.weights.patient_age;
    }
    
    return score;
  }

  private getTimeRisk(timeOfDay: string, dayOfWeek: string): number {
    // Higher risk for early morning and late afternoon appointments
    // Higher risk on Mondays and Fridays
    let risk = 0;
    
    if (timeOfDay === 'morning') risk += 0.2;
    if (timeOfDay === 'evening') risk += 0.3;
    
    if (dayOfWeek === 'Monday' || dayOfWeek === 'Friday') risk += 0.2;
    
    return Math.min(risk, 1);
  }

  private getDayOfWeekRisk(dayOfWeek: string): number {
    const riskMap: Record<string, number> = {
      'Monday': 0.3,
      'Tuesday': 0.1,
      'Wednesday': 0.1,
      'Thursday': 0.1,
      'Friday': 0.4,
      'Saturday': 0.2,
      'Sunday': 0.1
    };
    
    return riskMap[dayOfWeek] || 0.1;
  }

  private getAgeRisk(age: number): number {
    // Higher risk for very young (18-25) and older (65+) patients
    if (age < 25) return 0.3;
    if (age > 65) return 0.2;
    return 0.1;
  }

  private calculateConfidence(factors: PredictionFactors): number {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence based on available data
    if (factors.historical_no_shows > 0) confidence += 0.2;
    if (factors.communication_response_rate > 0) confidence += 0.1;
    if (factors.patient_age) confidence += 0.1;
    if (factors.previous_cancellations >= 0) confidence += 0.1;
    
    return Math.min(confidence, 1);
  }

  private generateRecommendations(riskScore: number, factors: PredictionFactors): string[] {
    const recommendations: string[] = [];
    
    if (riskScore > 0.7) {
      recommendations.push('Send additional reminder 2 hours before appointment');
      recommendations.push('Call patient to confirm attendance');
      recommendations.push('Offer alternative appointment times if needed');
    } else if (riskScore > 0.5) {
      recommendations.push('Send standard reminder 24 hours before');
      recommendations.push('Enable SMS confirmation');
    } else if (riskScore > 0.3) {
      recommendations.push('Send standard reminder');
    }
    
    if (factors.communication_response_rate < 0.3) {
      recommendations.push('Try alternative communication channel');
    }
    
    if (factors.advance_booking_days > 14) {
      recommendations.push('Send intermediate reminder 1 week before');
    }
    
    return recommendations;
  }

  private normalizeFactorValue(factor: string, value: any): number {
    // Normalize different factor types to 0-1 range
    switch (factor) {
      case 'advance_booking_days':
        return Math.min(value / 30, 1);
      case 'patient_age':
        return value / 100;
      default:
        return typeof value === 'number' ? Math.min(Math.max(value, 0), 1) : 0;
    }
  }

  private async storePrediction(prediction: NoShowPrediction): Promise<void> {
    const { error } = await supabase
      .from('no_show_predictions')
      .insert(prediction);
    
    if (error) {
      console.error('Error storing prediction:', error);
    }
  }

  private async storeModelWeights(): Promise<void> {
    const { error } = await supabase
      .from('ml_model_weights')
      .upsert({
        model_name: 'no_show_predictor',
        weights: this.weights,
        updated_at: new Date()
      });
    
    if (error) {
      console.error('Error storing model weights:', error);
    }
  }
}
