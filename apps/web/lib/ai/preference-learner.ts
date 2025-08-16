import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

type AppointmentData = {
  id: string;
  patient_id: string;
  staff_id: string;
  appointment_time: string;
  treatment_type: string;
  duration_minutes: number;
  satisfaction_score?: number;
  no_show: boolean;
  rescheduled_count: number;
  wait_time_minutes?: number;
};

type LearningPattern = {
  pattern_type: string;
  confidence: number;
  data_points: number;
  last_updated: string;
};

type PreferenceLearningResult = {
  updated_preferences: any;
  confidence_improvement: number;
  new_patterns_discovered: LearningPattern[];
  recommendations: string[];
};

export class PatientPreferenceLearner {
  private readonly supabase: any;

  constructor() {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async learnFromAppointmentHistory(
    patientId: string
  ): Promise<PreferenceLearningResult> {
    try {
      // Get patient's appointment history
      const appointmentHistory = await this.getAppointmentHistory(patientId);

      if (appointmentHistory.length < 3) {
        throw new Error('Insufficient appointment history for learning');
      }

      // Analyze patterns in the data
      const timePatterns = this.analyzeTimePatterns(appointmentHistory);
      const staffPatterns = this.analyzeStaffPatterns(appointmentHistory);
      const treatmentPatterns =
        this.analyzeTreatmentPatterns(appointmentHistory);
      const satisfactionPatterns =
        this.analyzeSatisfactionPatterns(appointmentHistory);

      // Generate updated preferences
      const updatedPreferences = this.generateUpdatedPreferences(
        patientId,
        timePatterns,
        staffPatterns,
        treatmentPatterns,
        satisfactionPatterns
      );

      // Calculate confidence improvements
      const confidenceImprovement =
        this.calculateConfidenceImprovement(appointmentHistory);

      // Detect new patterns
      const newPatterns = this.detectNewPatterns(appointmentHistory);

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        timePatterns,
        staffPatterns,
        satisfactionPatterns
      );

      // Save updated preferences
      await this.saveUpdatedPreferences(updatedPreferences);

      return {
        updated_preferences: updatedPreferences,
        confidence_improvement: confidenceImprovement,
        new_patterns_discovered: newPatterns,
        recommendations,
      };
    } catch (_error) {
      throw new Error('Failed to learn from appointment history');
    }
  }

  private async getAppointmentHistory(
    patientId: string
  ): Promise<AppointmentData[]> {
    const { data, error } = await this.supabase
      .from('appointments')
      .select(
        `
        id,
        patient_id,
        staff_id,
        appointment_time,
        treatment_type,
        duration_minutes,
        satisfaction_score,
        no_show,
        rescheduled_count,
        wait_time_minutes
      `
      )
      .eq('patient_id', patientId)
      .order('appointment_time', { ascending: false })
      .limit(50); // Last 50 appointments

    if (error) {
      throw error;
    }
    return data || [];
  }

  private analyzeTimePatterns(appointments: AppointmentData[]): any {
    const dayOfWeekCounts = new Array(7).fill(0);
    const hourOfDayCounts = new Array(24).fill(0);
    const satisfactionByDay = new Array(7).fill(0);
    const satisfactionByHour = new Array(24).fill(0);
    const dayCounters = new Array(7).fill(0);
    const hourCounters = new Array(24).fill(0);

    appointments.forEach((apt) => {
      const date = new Date(apt.appointment_time);
      const dayOfWeek = date.getDay();
      const hourOfDay = date.getHours();

      dayOfWeekCounts[dayOfWeek]++;
      hourOfDayCounts[hourOfDay]++;

      if (apt.satisfaction_score) {
        satisfactionByDay[dayOfWeek] += apt.satisfaction_score;
        satisfactionByHour[hourOfDay] += apt.satisfaction_score;
        dayCounters[dayOfWeek]++;
        hourCounters[hourOfDay]++;
      }
    });

    // Calculate average satisfaction by time periods
    const avgSatisfactionByDay = satisfactionByDay.map((sum, i) =>
      dayCounters[i] > 0 ? sum / dayCounters[i] : 0
    );
    const avgSatisfactionByHour = satisfactionByHour.map((sum, i) =>
      hourCounters[i] > 0 ? sum / hourCounters[i] : 0
    );

    // Identify preferred time patterns
    const preferredDays = dayOfWeekCounts
      .map((count, index) => ({
        day: index,
        count,
        satisfaction: avgSatisfactionByDay[index],
      }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count * b.satisfaction - a.count * a.satisfaction)
      .slice(0, 3)
      .map((item) => item.day);

    const preferredHours = hourOfDayCounts
      .map((count, index) => ({
        hour: index,
        count,
        satisfaction: avgSatisfactionByHour[index],
      }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count * b.satisfaction - a.count * a.satisfaction)
      .slice(0, 4)
      .map((item) => item.hour);

    return {
      preferred_days: preferredDays,
      preferred_hours: preferredHours,
      avoid_early_morning: avgSatisfactionByHour
        .slice(6, 9)
        .every((score) => score < 3.5),
      avoid_late_evening: avgSatisfactionByHour
        .slice(18, 21)
        .every((score) => score < 3.5),
      weekend_preference:
        preferredDays.includes(0) || preferredDays.includes(6),
      confidence: Math.min(1.0, appointments.length / 10), // Higher confidence with more data
    };
  }

  private analyzeStaffPatterns(appointments: AppointmentData[]): any {
    const staffPerformance = new Map();

    appointments.forEach((apt) => {
      if (!staffPerformance.has(apt.staff_id)) {
        staffPerformance.set(apt.staff_id, {
          appointment_count: 0,
          total_satisfaction: 0,
          no_show_count: 0,
          reschedule_count: 0,
          total_wait_time: 0,
          wait_time_count: 0,
        });
      }

      const staff = staffPerformance.get(apt.staff_id);
      staff.appointment_count++;

      if (apt.satisfaction_score) {
        staff.total_satisfaction += apt.satisfaction_score;
      }
      if (apt.no_show) {
        staff.no_show_count++;
      }
      staff.reschedule_count += apt.rescheduled_count || 0;

      if (apt.wait_time_minutes) {
        staff.total_wait_time += apt.wait_time_minutes;
        staff.wait_time_count++;
      }
    });

    // Calculate staff scores
    const staffScores = Array.from(staffPerformance.entries()).map(
      ([staffId, data]) => {
        const avgSatisfaction =
          data.total_satisfaction / data.appointment_count || 0;
        const noShowRate = data.no_show_count / data.appointment_count;
        const avgWaitTime =
          data.wait_time_count > 0
            ? data.total_wait_time / data.wait_time_count
            : 0;

        // Composite score (higher is better)
        const score = avgSatisfaction - noShowRate * 2 - avgWaitTime / 30;

        return {
          staff_id: staffId,
          score,
          appointment_count: data.appointment_count,
          avg_satisfaction: avgSatisfaction,
        };
      }
    );

    const preferredStaff = staffScores
      .filter((item) => item.appointment_count >= 2)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => item.staff_id);

    const avoidStaff = staffScores
      .filter(
        (item) => item.appointment_count >= 2 && item.avg_satisfaction < 3.0
      )
      .map((item) => item.staff_id);

    return {
      preferred_staff_ids: preferredStaff,
      avoid_staff_ids: avoidStaff,
      staff_loyalty_score: preferredStaff.length > 0 ? 0.8 : 0.3,
      confidence: Math.min(
        1.0,
        staffScores.reduce((sum, item) => sum + item.appointment_count, 0) / 15
      ),
    };
  }

  private analyzeTreatmentPatterns(appointments: AppointmentData[]): any {
    const treatmentData = new Map();

    appointments.forEach((apt) => {
      if (!treatmentData.has(apt.treatment_type)) {
        treatmentData.set(apt.treatment_type, {
          count: 0,
          total_satisfaction: 0,
          total_duration: 0,
          no_show_count: 0,
        });
      }

      const treatment = treatmentData.get(apt.treatment_type);
      treatment.count++;
      treatment.total_duration += apt.duration_minutes;

      if (apt.satisfaction_score) {
        treatment.total_satisfaction += apt.satisfaction_score;
      }
      if (apt.no_show) {
        treatment.no_show_count++;
      }
    });

    // Analyze patterns
    const treatmentAnalysis = Array.from(treatmentData.entries()).map(
      ([type, data]) => ({
        treatment_type: type,
        frequency: data.count,
        avg_satisfaction: data.total_satisfaction / data.count || 0,
        avg_duration: data.total_duration / data.count,
        no_show_rate: data.no_show_count / data.count,
      })
    );

    const preferredTreatments = treatmentAnalysis
      .filter((item) => item.avg_satisfaction >= 4.0)
      .sort((a, b) => b.frequency - a.frequency)
      .map((item) => item.treatment_type);

    const optimalDurations = treatmentAnalysis.reduce(
      (acc, item) => {
        acc[item.treatment_type] = Math.round(item.avg_duration);
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      preferred_treatments: preferredTreatments,
      optimal_durations: optimalDurations,
      treatment_variety_score: treatmentData.size,
      confidence: Math.min(1.0, appointments.length / 20),
    };
  }

  private analyzeSatisfactionPatterns(appointments: AppointmentData[]): any {
    const satisfactionData = appointments
      .filter((apt) => apt.satisfaction_score)
      .map((apt) => ({
        satisfaction: apt.satisfaction_score!,
        day_of_week: new Date(apt.appointment_time).getDay(),
        hour_of_day: new Date(apt.appointment_time).getHours(),
        wait_time: apt.wait_time_minutes || 0,
        staff_id: apt.staff_id,
        treatment_type: apt.treatment_type,
      }));

    if (satisfactionData.length === 0) {
      return { overall_satisfaction: 0, patterns: [], confidence: 0 };
    }

    const overallSatisfaction =
      satisfactionData.reduce((sum, item) => sum + item.satisfaction, 0) /
      satisfactionData.length;

    // Identify satisfaction patterns
    const patterns = [];

    // Time-based satisfaction patterns
    const morningApts = satisfactionData.filter(
      (item) => item.hour_of_day < 12
    );
    const afternoonApts = satisfactionData.filter(
      (item) => item.hour_of_day >= 12
    );

    if (morningApts.length > 0 && afternoonApts.length > 0) {
      const morningAvg =
        morningApts.reduce((sum, item) => sum + item.satisfaction, 0) /
        morningApts.length;
      const afternoonAvg =
        afternoonApts.reduce((sum, item) => sum + item.satisfaction, 0) /
        afternoonApts.length;

      if (Math.abs(morningAvg - afternoonAvg) > 0.5) {
        patterns.push({
          type: 'time_preference',
          description:
            morningAvg > afternoonAvg
              ? 'Prefers morning appointments'
              : 'Prefers afternoon appointments',
          confidence: Math.min(1.0, Math.abs(morningAvg - afternoonAvg)),
        });
      }
    }

    // Wait time sensitivity
    const lowWaitApts = satisfactionData.filter((item) => item.wait_time < 15);
    const highWaitApts = satisfactionData.filter(
      (item) => item.wait_time >= 15
    );

    if (lowWaitApts.length > 0 && highWaitApts.length > 0) {
      const lowWaitAvg =
        lowWaitApts.reduce((sum, item) => sum + item.satisfaction, 0) /
        lowWaitApts.length;
      const highWaitAvg =
        highWaitApts.reduce((sum, item) => sum + item.satisfaction, 0) /
        highWaitApts.length;

      if (lowWaitAvg - highWaitAvg > 0.5) {
        patterns.push({
          type: 'wait_sensitivity',
          description: 'Highly sensitive to wait times',
          confidence: Math.min(1.0, lowWaitAvg - highWaitAvg),
        });
      }
    }

    return {
      overall_satisfaction: overallSatisfaction,
      patterns,
      confidence: Math.min(1.0, satisfactionData.length / 10),
    };
  }

  private generateUpdatedPreferences(
    patientId: string,
    timePatterns: any,
    staffPatterns: any,
    treatmentPatterns: any,
    satisfactionPatterns: any
  ): any {
    const combinedConfidence =
      timePatterns.confidence * 0.3 +
      staffPatterns.confidence * 0.3 +
      treatmentPatterns.confidence * 0.2 +
      satisfactionPatterns.confidence * 0.2;

    return {
      patient_id: patientId,
      time_preferences: {
        preferred_days: timePatterns.preferred_days,
        preferred_hours: timePatterns.preferred_hours,
        avoid_early_morning: timePatterns.avoid_early_morning,
        avoid_late_evening: timePatterns.avoid_late_evening,
        weekend_preference: timePatterns.weekend_preference,
      },
      staff_preferences: {
        preferred_staff_ids: staffPatterns.preferred_staff_ids,
        avoid_staff_ids: staffPatterns.avoid_staff_ids,
        staff_loyalty_score: staffPatterns.staff_loyalty_score,
      },
      treatment_preferences: {
        preferred_treatments: treatmentPatterns.preferred_treatments,
        optimal_durations: treatmentPatterns.optimal_durations,
        treatment_variety_score: treatmentPatterns.treatment_variety_score,
      },
      communication_preferences: {
        wait_sensitivity: satisfactionPatterns.patterns.some(
          (p) => p.type === 'wait_sensitivity'
        ),
        satisfaction_threshold: satisfactionPatterns.overall_satisfaction,
      },
      confidence_score: combinedConfidence,
      data_points_count: timePatterns.confidence * 50, // Estimate data points used
      last_updated: new Date().toISOString(),
    };
  }

  private calculateConfidenceImprovement(
    appointments: AppointmentData[]
  ): number {
    // Base improvement on data quantity and quality
    const dataQuality =
      appointments.filter((apt) => apt.satisfaction_score).length /
      appointments.length;
    const dataQuantity = Math.min(1.0, appointments.length / 20);

    return (dataQuality * 0.6 + dataQuantity * 0.4) * 0.3; // Max 30% improvement
  }

  private detectNewPatterns(
    appointments: AppointmentData[]
  ): LearningPattern[] {
    const patterns: LearningPattern[] = [];

    // Check for consistency patterns
    const recentAppointments = appointments.slice(0, 10);
    if (recentAppointments.length >= 5) {
      const dayConsistency = this.checkDayConsistency(recentAppointments);
      if (dayConsistency.confidence > 0.7) {
        patterns.push({
          pattern_type: 'day_consistency',
          confidence: dayConsistency.confidence,
          data_points: recentAppointments.length,
          last_updated: new Date().toISOString(),
        });
      }

      const timeConsistency = this.checkTimeConsistency(recentAppointments);
      if (timeConsistency.confidence > 0.7) {
        patterns.push({
          pattern_type: 'time_consistency',
          confidence: timeConsistency.confidence,
          data_points: recentAppointments.length,
          last_updated: new Date().toISOString(),
        });
      }
    }

    return patterns;
  }

  private checkDayConsistency(appointments: AppointmentData[]): {
    confidence: number;
  } {
    const days = appointments.map((apt) =>
      new Date(apt.appointment_time).getDay()
    );
    const uniqueDays = new Set(days);

    // High consistency if patient books same days repeatedly
    const consistency = 1 - uniqueDays.size / 7;
    return { confidence: Math.max(0, consistency) };
  }

  private checkTimeConsistency(appointments: AppointmentData[]): {
    confidence: number;
  } {
    const hours = appointments.map((apt) =>
      new Date(apt.appointment_time).getHours()
    );
    const hourRange = Math.max(...hours) - Math.min(...hours);

    // High consistency if appointments are in similar time ranges
    const consistency = Math.max(0, 1 - hourRange / 12);
    return { confidence: consistency };
  }

  private generateRecommendations(
    timePatterns: any,
    staffPatterns: any,
    satisfactionPatterns: any
  ): string[] {
    const recommendations: string[] = [];

    if (timePatterns.confidence > 0.7) {
      if (timePatterns.preferred_hours.length > 0) {
        const hourRanges = this.formatHourRanges(timePatterns.preferred_hours);
        recommendations.push(
          `Schedule appointments between ${hourRanges} for optimal satisfaction`
        );
      }

      if (timePatterns.weekend_preference) {
        recommendations.push(
          'Consider offering weekend appointments for this patient'
        );
      }
    }

    if (
      staffPatterns.confidence > 0.6 &&
      staffPatterns.preferred_staff_ids.length > 0
    ) {
      recommendations.push(
        'Prioritize booking with preferred staff members when possible'
      );
    }

    if (
      satisfactionPatterns.patterns.some((p) => p.type === 'wait_sensitivity')
    ) {
      recommendations.push(
        'Minimize wait times - patient is highly sensitive to delays'
      );
    }

    if (satisfactionPatterns.overall_satisfaction < 3.5) {
      recommendations.push(
        'Review appointment experience - satisfaction scores indicate issues'
      );
    }

    return recommendations;
  }

  private formatHourRanges(hours: number[]): string {
    if (hours.length === 0) {
      return '';
    }

    const sortedHours = [...hours].sort((a, b) => a - b);
    const ranges: string[] = [];
    let start = sortedHours[0];
    let end = sortedHours[0];

    for (let i = 1; i < sortedHours.length; i++) {
      if (sortedHours[i] === end + 1) {
        end = sortedHours[i];
      } else {
        ranges.push(start === end ? `${start}:00` : `${start}:00-${end}:00`);
        start = end = sortedHours[i];
      }
    }
    ranges.push(start === end ? `${start}:00` : `${start}:00-${end}:00`);

    return ranges.join(', ');
  }

  private async saveUpdatedPreferences(preferences: any): Promise<void> {
    await this.supabase.from('patient_preferences').upsert(preferences);
  }

  async analyzeAllPatients(): Promise<any> {
    try {
      // Get all patients with sufficient appointment history
      const { data: patients, error } = await this.supabase
        .from('appointments')
        .select('patient_id')
        .group('patient_id')
        .having('count(*) >= 3');

      if (error) {
        throw error;
      }

      const results = {
        total_patients_analyzed: 0,
        successful_learning: 0,
        failed_learning: 0,
        average_confidence_improvement: 0,
      };

      for (const patient of patients || []) {
        try {
          await this.learnFromAppointmentHistory(patient.patient_id);
          results.successful_learning++;
        } catch (_error) {
          results.failed_learning++;
        }
        results.total_patients_analyzed++;
      }

      return results;
    } catch (_error) {
      throw new Error('Failed to analyze all patients');
    }
  }

  async updatePreferences(patientId: string, preferences: any): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('patient_preferences')
        .upsert({
          patient_id: patientId,
          preferences,
          updated_at: new Date().toISOString(),
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

  async getPatientPreferences(patientId: string): Promise<any> {
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

  async analyzeSchedulingPatterns(patientId?: string): Promise<any> {
    try {
      let query = this.supabase
        .from('appointments')
        .select('*')
        .order('appointment_time', { ascending: false });

      if (patientId) {
        query = query.eq('patient_id', patientId);
      }

      const { data, error } = await query.limit(100);
      if (error) {
        throw error;
      }

      // Analyze patterns from the data
      const patterns = {
        preferred_times: this.analyzeTimePreferences(data || []),
        booking_frequency: this.analyzeBookingFrequency(data || []),
        cancellation_patterns: this.analyzeCancellationPatterns(data || []),
      };

      return patterns;
    } catch (_error) {
      return {};
    }
  }

  private analyzeTimePreferences(appointments: any[]): any {
    const timeSlots = {};
    appointments.forEach((apt) => {
      const hour = new Date(apt.appointment_time).getHours();
      timeSlots[hour] = (timeSlots[hour] || 0) + 1;
    });
    return timeSlots;
  }

  private analyzeBookingFrequency(appointments: any[]): any {
    return {
      total_appointments: appointments.length,
      average_per_month: appointments.length / 12, // Simplified calculation
    };
  }

  private analyzeCancellationPatterns(appointments: any[]): any {
    const cancelled = appointments.filter((apt) => apt.status === 'cancelled');
    return {
      cancellation_rate: cancelled.length / appointments.length,
      common_reasons: ['scheduling conflict', 'illness', 'other'],
    };
  }
}
