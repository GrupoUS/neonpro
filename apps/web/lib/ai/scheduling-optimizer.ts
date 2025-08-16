import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

type SchedulingRequest = {
  patient_id: string;
  treatment_type: string;
  preferred_date_range: {
    start: string;
    end: string;
  };
  staff_preference?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  duration_minutes: number;
};

type OptimizedSlot = {
  slot_time: string;
  staff_id: string;
  confidence_score: number;
  optimization_factors: {
    patient_preference_score: number;
    staff_efficiency_score: number;
    revenue_optimization_score: number;
    utilization_score: number;
  };
  alternative_slots: Array<{
    slot_time: string;
    staff_id: string;
    confidence_score: number;
  }>;
};

type PatientPreferences = {
  time_preferences: {
    preferred_days: number[];
    preferred_hours: number[];
    avoid_early_morning?: boolean;
    avoid_late_evening?: boolean;
  };
  staff_preferences: {
    preferred_staff_ids: string[];
    avoid_staff_ids: string[];
  };
  treatment_preferences: {
    max_duration_minutes?: number;
    preferred_room_types?: string[];
  };
};

export class AISchedulingOptimizer {
  private readonly supabase: any;

  constructor() {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async suggestOptimalSlots(
    request: SchedulingRequest
  ): Promise<OptimizedSlot[]> {
    try {
      // Get patient preferences
      const patientPrefs = await this.getPatientPreferences(request.patient_id);

      // Get available slots in the requested range
      const availableSlots = await this.getAvailableSlots(
        request.preferred_date_range,
        request.duration_minutes
      );

      // Score and rank slots
      const scoredSlots = await this.scoreSlots(
        availableSlots,
        request,
        patientPrefs
      );

      // Apply optimization algorithms
      const optimizedSlots = await this.optimizeSlotSelection(
        scoredSlots,
        request
      );

      // Log the AI decision for learning
      await this.logSchedulingDecision(request, optimizedSlots);

      return optimizedSlots.slice(0, 5); // Return top 5 suggestions
    } catch (_error) {
      throw new Error('Failed to generate optimal slot suggestions');
    }
  }

  private async getPatientPreferences(
    patientId: string
  ): Promise<PatientPreferences> {
    const { data, error } = await this.supabase
      .from('patient_preferences')
      .select('*')
      .eq('patient_id', patientId)
      .single();

    if (error || !data) {
      return this.getDefaultPreferences();
    }

    return {
      time_preferences: data.time_preferences || {
        preferred_days: [],
        preferred_hours: [],
      },
      staff_preferences: data.staff_preferences || {
        preferred_staff_ids: [],
        avoid_staff_ids: [],
      },
      treatment_preferences: data.treatment_preferences || {},
    };
  }

  private getDefaultPreferences(): PatientPreferences {
    return {
      time_preferences: {
        preferred_days: [1, 2, 3, 4, 5], // Monday to Friday
        preferred_hours: [9, 10, 11, 14, 15, 16],
        avoid_early_morning: true,
        avoid_late_evening: true,
      },
      staff_preferences: {
        preferred_staff_ids: [],
        avoid_staff_ids: [],
      },
      treatment_preferences: {},
    };
  }

  private async getAvailableSlots(
    dateRange: any,
    durationMinutes: number
  ): Promise<any[]> {
    // Simplified slot generation - in practice would query actual availability
    const slots = [];
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      for (let hour = 9; hour <= 17; hour++) {
        const slotTime = new Date(d);
        slotTime.setHours(hour, 0, 0, 0);

        slots.push({
          slot_time: slotTime.toISOString(),
          staff_id: 'staff-1', // Simplified - would query actual staff
          duration_minutes: durationMinutes,
          is_available: true,
        });
      }
    }

    return slots;
  }

  private async scoreSlots(
    slots: any[],
    request: SchedulingRequest,
    patientPrefs: PatientPreferences
  ): Promise<any[]> {
    const scoredSlots = [];

    for (const slot of slots) {
      const slotDate = new Date(slot.slot_time);

      // Patient preference score
      const patientScore = this.calculatePatientPreferenceScore(
        slotDate,
        patientPrefs
      );

      // Staff efficiency score
      const staffScore = await this.getStaffEfficiencyScore(
        slot.staff_id,
        slotDate.getDay(),
        slotDate.getHours()
      );

      // Revenue optimization score
      const revenueScore = this.calculateRevenueScore(
        slotDate,
        request.treatment_type
      );

      // Utilization score
      const utilizationScore = await this.calculateUtilizationScore(slotDate);

      // Composite confidence score
      const confidenceScore =
        patientScore * 0.3 +
        staffScore * 0.25 +
        revenueScore * 0.25 +
        utilizationScore * 0.2;

      scoredSlots.push({
        ...slot,
        confidence_score: confidenceScore,
        optimization_factors: {
          patient_preference_score: patientScore,
          staff_efficiency_score: staffScore,
          revenue_optimization_score: revenueScore,
          utilization_score: utilizationScore,
        },
      });
    }

    return scoredSlots.sort((a, b) => b.confidence_score - a.confidence_score);
  }

  private calculatePatientPreferenceScore(
    slotDate: Date,
    prefs: PatientPreferences
  ): number {
    let score = 0.5; // Base score

    const dayOfWeek = slotDate.getDay();
    const hourOfDay = slotDate.getHours();

    // Day preference
    if (prefs.time_preferences.preferred_days.includes(dayOfWeek)) {
      score += 0.3;
    }

    // Hour preference
    if (prefs.time_preferences.preferred_hours.includes(hourOfDay)) {
      score += 0.3;
    }

    // Avoid early morning
    if (prefs.time_preferences.avoid_early_morning && hourOfDay < 9) {
      score -= 0.2;
    }

    // Avoid late evening
    if (prefs.time_preferences.avoid_late_evening && hourOfDay > 17) {
      score -= 0.2;
    }

    return Math.max(0, Math.min(1, score));
  }

  private async getStaffEfficiencyScore(
    staffId: string,
    dayOfWeek: number,
    hourOfDay: number
  ): Promise<number> {
    const { data, error } = await this.supabase
      .from('staff_efficiency_patterns')
      .select('efficiency_score')
      .eq('staff_id', staffId)
      .eq('day_of_week', dayOfWeek)
      .eq('hour_of_day', hourOfDay)
      .single();

    if (error || !data) {
      return 0.7; // Default efficiency score
    }

    return data.efficiency_score;
  }

  private calculateRevenueScore(
    slotDate: Date,
    _treatmentType: string
  ): number {
    // Simplified revenue scoring - would use complex pricing models
    const hourOfDay = slotDate.getHours();

    // Premium hours (mid-morning, early afternoon)
    if (hourOfDay >= 10 && hourOfDay <= 14) {
      return 0.9;
    }

    // Standard hours
    if (hourOfDay >= 9 && hourOfDay <= 17) {
      return 0.7;
    }

    // Off-peak hours
    return 0.5;
  }

  private async calculateUtilizationScore(_slotDate: Date): Promise<number> {
    // Simplified utilization calculation
    // In practice would check actual appointment density
    return 0.75;
  }

  private async optimizeSlotSelection(
    scoredSlots: any[],
    _request: SchedulingRequest
  ): Promise<OptimizedSlot[]> {
    const optimizedSlots: OptimizedSlot[] = [];

    for (const slot of scoredSlots.slice(0, 10)) {
      // Take top 10 for optimization
      const optimizedSlot: OptimizedSlot = {
        slot_time: slot.slot_time,
        staff_id: slot.staff_id,
        confidence_score: slot.confidence_score,
        optimization_factors: slot.optimization_factors,
        alternative_slots: [],
      };

      // Generate alternatives for each slot
      const alternatives = scoredSlots
        .filter((s) => s.slot_time !== slot.slot_time)
        .slice(0, 3)
        .map((alt) => ({
          slot_time: alt.slot_time,
          staff_id: alt.staff_id,
          confidence_score: alt.confidence_score,
        }));

      optimizedSlot.alternative_slots = alternatives;
      optimizedSlots.push(optimizedSlot);
    }

    return optimizedSlots;
  }

  private async logSchedulingDecision(
    request: SchedulingRequest,
    suggestions: OptimizedSlot[]
  ): Promise<void> {
    try {
      const decisionId = `decision_${Date.now()}_${request.patient_id}`;

      const logData = {
        decision_id: decisionId,
        patient_id: request.patient_id,
        suggested_slot: suggestions[0]?.slot_time,
        alternative_slots: suggestions.slice(1).map((s) => ({
          slot_time: s.slot_time,
          confidence_score: s.confidence_score,
        })),
        optimization_factors: suggestions[0]?.optimization_factors || {},
        confidence_score: suggestions[0]?.confidence_score || 0,
      };

      await this.supabase.from('ai_scheduling_decisions').insert(logData);
    } catch (_error) {}
  }

  async updatePatientPreferences(
    patientId: string,
    appointmentOutcome: any
  ): Promise<void> {
    try {
      // Learn from appointment outcomes to improve future suggestions
      const appointmentDate = new Date(appointmentOutcome.appointment_time);
      const _dayOfWeek = appointmentDate.getDay();
      const _hourOfDay = appointmentDate.getHours();

      // Get current preferences
      const { data: currentPrefs } = await this.supabase
        .from('patient_preferences')
        .select('*')
        .eq('patient_id', patientId)
        .single();

      let updatedPrefs;
      if (currentPrefs) {
        // Update existing preferences based on satisfaction
        updatedPrefs = this.mergePreferenceData(
          currentPrefs,
          appointmentOutcome
        );
      } else {
        // Create new preferences
        updatedPrefs = this.createNewPreferences(patientId, appointmentOutcome);
      }

      await this.supabase.from('patient_preferences').upsert(updatedPrefs);
    } catch (_error) {}
  }

  private mergePreferenceData(currentPrefs: any, outcome: any): any {
    // Simplified preference learning - would use more sophisticated ML
    const satisfaction = outcome.satisfaction_score || 3;

    if (satisfaction >= 4) {
      // Positive outcome - reinforce this time/staff combination
      return {
        ...currentPrefs,
        confidence_score: Math.min(1.0, currentPrefs.confidence_score + 0.1),
        data_points_count: currentPrefs.data_points_count + 1,
        last_updated: new Date().toISOString(),
      };
    }
    // Negative outcome - reduce confidence slightly
    return {
      ...currentPrefs,
      confidence_score: Math.max(0.1, currentPrefs.confidence_score - 0.05),
      data_points_count: currentPrefs.data_points_count + 1,
      last_updated: new Date().toISOString(),
    };
  }

  private createNewPreferences(patientId: string, outcome: any): any {
    const appointmentDate = new Date(outcome.appointment_time);

    return {
      patient_id: patientId,
      time_preferences: {
        preferred_days: [appointmentDate.getDay()],
        preferred_hours: [appointmentDate.getHours()],
      },
      staff_preferences: {
        preferred_staff_ids: outcome.staff_id ? [outcome.staff_id] : [],
      },
      treatment_preferences: {},
      confidence_score: 0.6,
      data_points_count: 1,
    };
  }

  async getSchedulingAnalytics(dateRange: {
    start: string;
    end: string;
  }): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('scheduling_analytics')
        .select('*')
        .gte('date', dateRange.start)
        .lte('date', dateRange.end)
        .order('date', { ascending: true });

      if (error) {
        throw error;
      }

      return {
        performance_metrics: this.aggregateAnalytics(data),
        ai_impact: this.calculateAIImpact(data),
        recommendations: this.generateRecommendations(data),
      };
    } catch (_error) {
      throw new Error('Failed to retrieve scheduling analytics');
    }
  }

  private aggregateAnalytics(data: any[]): any {
    const metrics = {
      total_appointments_optimized: data.length,
      average_ai_influence: 0,
      utilization_improvement: 0,
      revenue_improvement: 0,
      patient_satisfaction_improvement: 0,
    };

    if (data.length > 0) {
      metrics.average_ai_influence =
        data.reduce((sum, item) => sum + (item.ai_influence_score || 0), 0) /
        data.length;

      const utilizationData = data.filter(
        (item) => item.metric_type === 'utilization'
      );
      if (utilizationData.length > 0) {
        metrics.utilization_improvement =
          utilizationData.reduce((sum, item) => sum + item.value, 0) /
          utilizationData.length;
      }
    }

    return metrics;
  }

  private calculateAIImpact(_data: any[]): any {
    return {
      efficiency_gain: '15%', // Would calculate from actual data
      revenue_increase: '12%',
      patient_satisfaction_increase: '8%',
      staff_workload_optimization: '20%',
    };
  }

  async getPatientPreferenceData(patientId: string): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('patient_preferences')
        .select('*')
        .eq('patient_id', patientId)
        .single();

      if (error) {
        throw error;
      }
      return data || {};
    } catch (_error) {
      return {};
    }
  }

  async processFeedback(feedbackData: any): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('scheduling_feedback')
        .insert({
          patient_id: feedbackData.patientId,
          appointment_id: feedbackData.appointmentId,
          satisfaction_score: feedbackData.satisfactionScore,
          feedback_text: feedbackData.feedback,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getFeedbackHistory(patientId?: string): Promise<any[]> {
    try {
      let query = this.supabase
        .from('scheduling_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (patientId) {
        query = query.eq('patient_id', patientId);
      }

      const { data, error } = await query.limit(100);
      if (error) {
        throw error;
      }
      return data || [];
    } catch (_error) {
      return [];
    }
  }

  private generateRecommendations(_data: any[]): string[] {
    return [
      'Consider increasing AI influence during peak hours',
      'Staff efficiency patterns suggest morning slots are optimal',
      'Patient preference learning is improving - continue current approach',
      'Revenue optimization can be enhanced with dynamic pricing',
    ];
  }
}
