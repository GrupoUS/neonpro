/**
 * AI-Powered Automatic Scheduling Core
 * Story 2.3: AI-Powered Automatic Scheduling Implementation
 *
 * This module implements the core AI scheduling algorithm that optimizes
 * appointment scheduling based on multiple criteria including staff efficiency,
 * patient preferences, revenue optimization, and treatment sequencing.
 */

import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';

type Tables = Database['public']['Tables'];
type Appointment = Tables['appointments']['Row'];
type Patient = Tables['patients']['Row'];
type Staff = Tables['staff']['Row'];
type Treatment = Tables['treatments']['Row'];

// AI Scheduling Configuration
interface AISchedulingConfig {
  maxLookAheadDays: number;
  staffEfficiencyWeight: number;
  patientPreferenceWeight: number;
  revenueOptimizationWeight: number;
  treatmentSequencingWeight: number;
  workloadBalanceWeight: number;
}

// Scheduling Optimization Criteria
interface SchedulingCriteria {
  patientId: string;
  treatmentId: string;
  preferredTimeSlots: TimeSlot[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'urgent';
  isFollowUp: boolean;
  packageId?: string;
  maxWaitDays: number;
}

// Time Slot Definition
interface TimeSlot {
  startTime: Date;
  endTime: Date;
  dayOfWeek: number;
  isPreferred: boolean;
  availabilityScore: number;
}

// Staff Efficiency Pattern
interface StaffEfficiencyPattern {
  staffId: string;
  dayOfWeek: number;
  hourOfDay: number;
  efficiencyScore: number;
  fatigueLevel: number;
  productivityTrend: 'increasing' | 'stable' | 'decreasing';
  lastUpdated: Date;
}

// Patient Preference Learning
interface PatientPreference {
  patientId: string;
  preferredDaysOfWeek: number[];
  preferredTimeRanges: { start: string; end: string }[];
  bookingLeadTime: number;
  cancellationPattern: number;
  satisfactionScore: number;
  lastLearningUpdate: Date;
}

// Scheduling Recommendation
interface SchedulingRecommendation {
  timeSlot: TimeSlot;
  staffId: string;
  optimizationScore: number;
  confidence: number;
  reasoning: string[];
  alternativeSlots: TimeSlot[];
  estimatedRevenue: number;
  patientSatisfactionPrediction: number;
}

class AISchedulingCore {
  private readonly supabase = createClient();
  private readonly config: AISchedulingConfig;
  private readonly patientPreferenceCache = new Map<
    string,
    PatientPreference
  >();

  constructor(config: Partial<AISchedulingConfig> = {}) {
    this.config = {
      maxLookAheadDays: 30,
      staffEfficiencyWeight: 0.25,
      patientPreferenceWeight: 0.2,
      revenueOptimizationWeight: 0.2,
      treatmentSequencingWeight: 0.15,
      workloadBalanceWeight: 0.2,
      ...config,
    };
  }

  /**
   * Main AI scheduling algorithm
   * Analyzes multiple factors to recommend optimal appointment slots
   */
  async generateSchedulingRecommendations(
    criteria: SchedulingCriteria
  ): Promise<SchedulingRecommendation[]> {
    try {
      // 1. Load patient preferences and history
      const patientPreferences = await this.loadPatientPreferences(
        criteria.patientId
      );

      // 2. Get available time slots
      const availableSlots = await this.getAvailableTimeSlots(
        criteria.treatmentId,
        criteria.maxWaitDays
      );

      // 3. Load staff efficiency patterns
      const staffEfficiencyData = await this.loadStaffEfficiencyPatterns();

      // 4. Calculate optimization scores for each slot
      const scoredSlots = await Promise.all(
        availableSlots.map((slot) =>
          this.calculateOptimizationScore(
            slot,
            criteria,
            patientPreferences,
            staffEfficiencyData
          )
        )
      );

      // 5. Sort by optimization score and return top recommendations
      const recommendations = scoredSlots
        .sort((a, b) => b.optimizationScore - a.optimizationScore)
        .slice(0, 5); // Top 5 recommendations

      // 6. Log recommendation for learning
      await this.logRecommendation(criteria, recommendations);

      return recommendations;
    } catch (error) {
      console.error('Error generating scheduling recommendations:', error);
      throw new Error('Failed to generate AI scheduling recommendations');
    }
  }

  /**
   * Calculate comprehensive optimization score for a time slot
   */
  private async calculateOptimizationScore(
    slot: TimeSlot,
    criteria: SchedulingCriteria,
    patientPreferences: PatientPreference,
    staffEfficiency: Map<string, StaffEfficiencyPattern[]>
  ): Promise<SchedulingRecommendation> {
    const scores = {
      staffEfficiency: 0,
      patientPreference: 0,
      revenueOptimization: 0,
      treatmentSequencing: 0,
      workloadBalance: 0,
    };

    const reasoning: string[] = [];

    // 1. Staff Efficiency Score
    const staffId = await this.findOptimalStaff(slot, criteria.treatmentId);
    const staffPattern = staffEfficiency.get(staffId)?.[0];
    if (staffPattern) {
      scores.staffEfficiency = this.calculateStaffEfficiencyScore(
        slot,
        staffPattern
      );
      reasoning.push(
        `Staff efficiency: ${(scores.staffEfficiency * 100).toFixed(1)}%`
      );
    }

    // 2. Patient Preference Score
    scores.patientPreference = this.calculatePatientPreferenceScore(
      slot,
      patientPreferences
    );
    reasoning.push(
      `Patient preference match: ${(scores.patientPreference * 100).toFixed(1)}%`
    );

    // 3. Revenue Optimization Score
    scores.revenueOptimization = await this.calculateRevenueScore(
      slot,
      criteria
    );
    reasoning.push(
      `Revenue optimization: ${(scores.revenueOptimization * 100).toFixed(1)}%`
    );

    // 4. Treatment Sequencing Score
    if (criteria.isFollowUp || criteria.packageId) {
      scores.treatmentSequencing = await this.calculateSequencingScore(
        slot,
        criteria
      );
      reasoning.push(
        `Treatment sequencing: ${(scores.treatmentSequencing * 100).toFixed(1)}%`
      );
    }

    // 5. Workload Balance Score
    scores.workloadBalance = await this.calculateWorkloadBalanceScore(
      slot,
      staffId
    );
    reasoning.push(
      `Workload balance: ${(scores.workloadBalance * 100).toFixed(1)}%`
    );

    // Calculate weighted final score
    const optimizationScore =
      scores.staffEfficiency * this.config.staffEfficiencyWeight +
      scores.patientPreference * this.config.patientPreferenceWeight +
      scores.revenueOptimization * this.config.revenueOptimizationWeight +
      scores.treatmentSequencing * this.config.treatmentSequencingWeight +
      scores.workloadBalance * this.config.workloadBalanceWeight;

    // Calculate confidence based on data quality
    const confidence = this.calculateConfidence(
      scores,
      patientPreferences,
      staffPattern
    );

    // Estimate revenue and satisfaction
    const estimatedRevenue = await this.estimateSlotRevenue(slot, criteria);
    const patientSatisfactionPrediction = this.predictPatientSatisfaction(
      slot,
      patientPreferences,
      scores
    );

    return {
      timeSlot: slot,
      staffId,
      optimizationScore,
      confidence,
      reasoning,
      alternativeSlots: [], // Will be populated separately
      estimatedRevenue,
      patientSatisfactionPrediction,
    };
  }

  /**
   * Load patient preferences from historical data and learning algorithms
   */
  private async loadPatientPreferences(
    patientId: string
  ): Promise<PatientPreference> {
    // Check cache first
    if (this.patientPreferenceCache.has(patientId)) {
      return this.patientPreferenceCache.get(patientId)!;
    }

    try {
      // Load from database
      const { data: preferences } = await this.supabase
        .from('patient_preferences')
        .select('*')
        .eq('patient_id', patientId)
        .single();

      if (preferences) {
        this.patientPreferenceCache.set(patientId, preferences);
        return preferences;
      }

      // If no preferences exist, learn from historical appointments
      const learnedPreferences = await this.learnPatientPreferences(patientId);
      this.patientPreferenceCache.set(patientId, learnedPreferences);

      return learnedPreferences;
    } catch (error) {
      console.error('Error loading patient preferences:', error);
      // Return default preferences
      return this.getDefaultPatientPreferences(patientId);
    }
  }

  /**
   * Learn patient preferences from historical appointment data
   */
  private async learnPatientPreferences(
    patientId: string
  ): Promise<PatientPreference> {
    try {
      const { data: appointments } = await this.supabase
        .from('appointments')
        .select(
          `
          *,
          appointment_feedback(*)
        `
        )
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!appointments || appointments.length === 0) {
        return this.getDefaultPatientPreferences(patientId);
      }

      // Analyze patterns
      const dayPreferences = this.analyzeDayPreferences(appointments);
      const timePreferences = this.analyzeTimePreferences(appointments);
      const leadTimePattern = this.analyzeBookingLeadTime(appointments);
      const cancellationPattern = this.analyzeCancellationPattern(appointments);
      const satisfactionScore = this.calculateAverageSatisfaction(appointments);

      const preferences: PatientPreference = {
        patientId,
        preferredDaysOfWeek: dayPreferences,
        preferredTimeRanges: timePreferences,
        bookingLeadTime: leadTimePattern,
        cancellationPattern,
        satisfactionScore,
        lastLearningUpdate: new Date(),
      };

      // Save learned preferences
      await this.supabase.from('patient_preferences').upsert(preferences);

      return preferences;
    } catch (error) {
      console.error('Error learning patient preferences:', error);
      return this.getDefaultPatientPreferences(patientId);
    }
  }

  /**
   * Get available time slots for a treatment within the specified timeframe
   */
  private async getAvailableTimeSlots(
    treatmentId: string,
    maxWaitDays: number
  ): Promise<TimeSlot[]> {
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + maxWaitDays);

      // Get treatment duration and requirements
      const { data: treatment } = await this.supabase
        .from('treatments')
        .select('*')
        .eq('id', treatmentId)
        .single();

      if (!treatment) {
        throw new Error('Treatment not found');
      }

      // Get clinic operating hours
      const { data: clinicHours } = await this.supabase
        .from('clinic_operating_hours')
        .select('*');

      // Get existing appointments to find conflicts
      const { data: existingAppointments } = await this.supabase
        .from('appointments')
        .select('start_time, end_time, staff_id')
        .gte('start_time', new Date().toISOString())
        .lte('start_time', endDate.toISOString())
        .neq('status', 'cancelled');

      // Generate available slots
      const availableSlots: TimeSlot[] = [];
      const currentDate = new Date();

      for (let day = 0; day < maxWaitDays; day++) {
        const checkDate = new Date(currentDate);
        checkDate.setDate(currentDate.getDate() + day);

        const dayOfWeek = checkDate.getDay();
        const dayHours = clinicHours?.find((h) => h.day_of_week === dayOfWeek);

        if (dayHours?.is_open) {
          const slots = this.generateDaySlots(
            checkDate,
            dayHours,
            treatment.duration_minutes,
            existingAppointments || []
          );
          availableSlots.push(...slots);
        }
      }

      return availableSlots;
    } catch (error) {
      console.error('Error getting available time slots:', error);
      return [];
    }
  }

  /**
   * Generate time slots for a specific day
   */
  private generateDaySlots(
    date: Date,
    dayHours: any,
    durationMinutes: number,
    existingAppointments: any[]
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const slotInterval = 30; // 30-minute intervals

    const startTime = new Date(date);
    const [startHour, startMinute] = dayHours.start_time.split(':').map(Number);
    startTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date(date);
    const [endHour, endMinute] = dayHours.end_time.split(':').map(Number);
    endTime.setHours(endHour, endMinute, 0, 0);

    const currentSlot = new Date(startTime);

    while (currentSlot < endTime) {
      const slotEnd = new Date(currentSlot);
      slotEnd.setMinutes(currentSlot.getMinutes() + durationMinutes);

      // Check if slot conflicts with existing appointments
      const hasConflict = existingAppointments.some((apt) => {
        const aptStart = new Date(apt.start_time);
        const aptEnd = new Date(apt.end_time);
        return (
          (currentSlot >= aptStart && currentSlot < aptEnd) ||
          (slotEnd > aptStart && slotEnd <= aptEnd) ||
          (currentSlot <= aptStart && slotEnd >= aptEnd)
        );
      });

      if (!hasConflict && slotEnd <= endTime) {
        slots.push({
          startTime: new Date(currentSlot),
          endTime: slotEnd,
          dayOfWeek: date.getDay(),
          isPreferred: false, // Will be calculated later
          availabilityScore: 1.0, // Base availability score
        });
      }

      currentSlot.setMinutes(currentSlot.getMinutes() + slotInterval);
    }

    return slots;
  }

  // Helper methods for scoring calculations
  private calculateStaffEfficiencyScore(
    _slot: TimeSlot,
    pattern: StaffEfficiencyPattern
  ): number {
    // Implementation for staff efficiency scoring
    const hourScore = pattern.efficiencyScore;
    const fatigueAdjustment = 1 - pattern.fatigueLevel * 0.2;
    return Math.max(0, Math.min(1, hourScore * fatigueAdjustment));
  }

  private calculatePatientPreferenceScore(
    slot: TimeSlot,
    preferences: PatientPreference
  ): number {
    let score = 0;

    // Day preference score
    if (preferences.preferredDaysOfWeek.includes(slot.dayOfWeek)) {
      score += 0.5;
    }

    // Time preference score
    const slotHour = slot.startTime.getHours();
    const slotMinute = slot.startTime.getMinutes();
    const slotTime = `${slotHour.toString().padStart(2, '0')}:${slotMinute.toString().padStart(2, '0')}`;

    for (const range of preferences.preferredTimeRanges) {
      if (slotTime >= range.start && slotTime <= range.end) {
        score += 0.5;
        break;
      }
    }

    return Math.min(1, score);
  }

  private async calculateRevenueScore(
    _slot: TimeSlot,
    _criteria: SchedulingCriteria
  ): Promise<number> {
    // Implementation for revenue optimization scoring
    // Consider peak hours, treatment pricing, package deals, etc.
    return 0.7; // Placeholder
  }

  private async calculateSequencingScore(
    _slot: TimeSlot,
    _criteria: SchedulingCriteria
  ): Promise<number> {
    // Implementation for treatment sequencing optimization
    return 0.8; // Placeholder
  }

  private async calculateWorkloadBalanceScore(
    _slot: TimeSlot,
    _staffId: string
  ): Promise<number> {
    // Implementation for workload balance scoring
    return 0.6; // Placeholder
  }

  private calculateConfidence(
    _scores: any,
    patientPreferences: PatientPreference,
    staffPattern?: StaffEfficiencyPattern
  ): number {
    // Calculate confidence based on data quality and score consistency
    let confidence = 0.5; // Base confidence

    // Increase confidence if we have good patient data
    if (patientPreferences.lastLearningUpdate) {
      const daysSinceUpdate =
        (Date.now() - patientPreferences.lastLearningUpdate.getTime()) /
        (1000 * 60 * 60 * 24);
      confidence += Math.max(0, 0.3 * (1 - daysSinceUpdate / 30));
    }

    // Increase confidence if we have staff efficiency data
    if (staffPattern) {
      confidence += 0.2;
    }

    return Math.min(1, confidence);
  }

  private async estimateSlotRevenue(
    _slot: TimeSlot,
    _criteria: SchedulingCriteria
  ): Promise<number> {
    // Implementation for revenue estimation
    return 150; // Placeholder
  }

  private predictPatientSatisfaction(
    _slot: TimeSlot,
    _preferences: PatientPreference,
    scores: any
  ): number {
    // Implementation for satisfaction prediction
    return scores.patientPreference * 0.6 + scores.staffEfficiency * 0.4;
  }

  // Additional helper methods
  private async findOptimalStaff(
    _slot: TimeSlot,
    _treatmentId: string
  ): Promise<string> {
    // Implementation to find the best staff member for the slot
    return 'staff-id-placeholder';
  }

  private analyzeDayPreferences(appointments: any[]): number[] {
    // Analyze which days of the week the patient prefers
    const dayCount = new Array(7).fill(0);
    appointments.forEach((apt) => {
      const day = new Date(apt.start_time).getDay();
      dayCount[day]++;
    });

    const maxCount = Math.max(...dayCount);
    return dayCount
      .map((count, day) => ({ day, count }))
      .filter((item) => item.count >= maxCount * 0.3)
      .map((item) => item.day);
  }

  private analyzeTimePreferences(
    appointments: any[]
  ): { start: string; end: string }[] {
    // Analyze preferred time ranges
    const hours = appointments.map((apt) =>
      new Date(apt.start_time).getHours()
    );
    const avgHour = hours.reduce((sum, hour) => sum + hour, 0) / hours.length;

    return [
      {
        start: `${Math.max(8, Math.floor(avgHour - 1))
          .toString()
          .padStart(2, '0')}:00`,
        end: `${Math.min(18, Math.ceil(avgHour + 1))
          .toString()
          .padStart(2, '0')}:00`,
      },
    ];
  }

  private analyzeBookingLeadTime(appointments: any[]): number {
    // Analyze how far in advance the patient typically books
    const leadTimes = appointments
      .filter((apt) => apt.created_at && apt.start_time)
      .map((apt) => {
        const created = new Date(apt.created_at);
        const scheduled = new Date(apt.start_time);
        return (
          (scheduled.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
        );
      });

    return leadTimes.length > 0
      ? leadTimes.reduce((sum, days) => sum + days, 0) / leadTimes.length
      : 7; // Default to 7 days
  }

  private analyzeCancellationPattern(appointments: any[]): number {
    // Analyze cancellation rate
    const cancelled = appointments.filter(
      (apt) => apt.status === 'cancelled'
    ).length;
    return appointments.length > 0 ? cancelled / appointments.length : 0;
  }

  private calculateAverageSatisfaction(appointments: any[]): number {
    // Calculate average satisfaction from feedback
    const feedbackScores = appointments
      .filter((apt) => apt.appointment_feedback?.length > 0)
      .map((apt) => apt.appointment_feedback[0].satisfaction_score)
      .filter((score) => score !== null);

    return feedbackScores.length > 0
      ? feedbackScores.reduce((sum, score) => sum + score, 0) /
          feedbackScores.length
      : 4.0; // Default satisfaction
  }

  private getDefaultPatientPreferences(patientId: string): PatientPreference {
    return {
      patientId,
      preferredDaysOfWeek: [1, 2, 3, 4, 5], // Weekdays
      preferredTimeRanges: [{ start: '09:00', end: '17:00' }],
      bookingLeadTime: 7,
      cancellationPattern: 0.1,
      satisfactionScore: 4.0,
      lastLearningUpdate: new Date(),
    };
  }

  private async loadStaffEfficiencyPatterns(): Promise<
    Map<string, StaffEfficiencyPattern[]>
  > {
    // Implementation to load staff efficiency patterns
    return new Map();
  }

  private async logRecommendation(
    criteria: SchedulingCriteria,
    recommendations: SchedulingRecommendation[]
  ): Promise<void> {
    // Log recommendations for learning and improvement
    try {
      await this.supabase.from('ai_scheduling_logs').insert({
        patient_id: criteria.patientId,
        treatment_id: criteria.treatmentId,
        recommendations: JSON.stringify(recommendations),
        criteria: JSON.stringify(criteria),
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error logging recommendation:', error);
    }
  }
}

export {
  AISchedulingCore,
  type SchedulingCriteria,
  type SchedulingRecommendation,
  type AISchedulingConfig,
};
