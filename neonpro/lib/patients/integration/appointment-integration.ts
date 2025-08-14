/**
 * Patient-Appointment Integration System
 * Integrates patient profiles with appointment scheduling
 * Part of Story 3.1 - Task 6: System Integration & Search
 */

import { Patient } from '@/types/patient';
import { Appointment } from '@/types/appointment';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';

export interface PatientAppointmentHistory {
  patient_id: string;
  appointments: Appointment[];
  total_appointments: number;
  completed_appointments: number;
  cancelled_appointments: number;
  no_show_count: number;
  average_rating: number;
  last_appointment_date: string | null;
  next_appointment_date: string | null;
  preferred_times: string[];
  preferred_services: string[];
}

export interface AppointmentInsights {
  attendance_rate: number;
  punctuality_score: number;
  satisfaction_score: number;
  loyalty_index: number;
  risk_factors: string[];
  recommendations: string[];
}

export class PatientAppointmentIntegration {
  /**
   * Get comprehensive appointment history for a patient
   */
  static async getPatientAppointmentHistory(
    patientId: string
  ): Promise<PatientAppointmentHistory> {
    try {
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          *,
          services(*),
          staff(*)
        `)
        .eq('patient_id', patientId)
        .order('appointment_date', { ascending: false });

      if (error) throw error;

      const completed = appointments?.filter(apt => apt.status === 'completed') || [];
      const cancelled = appointments?.filter(apt => apt.status === 'cancelled') || [];
      const noShows = appointments?.filter(apt => apt.status === 'no_show') || [];

      // Calculate preferred times and services
      const timePreferences = this.calculateTimePreferences(completed);
      const servicePreferences = this.calculateServicePreferences(completed);

      // Calculate average rating
      const ratingsSum = completed
        .filter(apt => apt.rating)
        .reduce((sum, apt) => sum + (apt.rating || 0), 0);
      const averageRating = completed.length > 0 ? ratingsSum / completed.length : 0;

      // Get next appointment
      const { data: nextAppointment } = await supabase
        .from('appointments')
        .select('appointment_date')
        .eq('patient_id', patientId)
        .eq('status', 'scheduled')
        .gte('appointment_date', new Date().toISOString())
        .order('appointment_date', { ascending: true })
        .limit(1)
        .single();

      return {
        patient_id: patientId,
        appointments: appointments || [],
        total_appointments: appointments?.length || 0,
        completed_appointments: completed.length,
        cancelled_appointments: cancelled.length,
        no_show_count: noShows.length,
        average_rating: averageRating,
        last_appointment_date: completed[0]?.appointment_date || null,
        next_appointment_date: nextAppointment?.appointment_date || null,
        preferred_times: timePreferences,
        preferred_services: servicePreferences
      };
    } catch (error) {
      logger.error('Error fetching patient appointment history:', error);
      throw new Error('Failed to fetch appointment history');
    }
  }

  /**
   * Generate appointment insights for a patient
   */
  static async generateAppointmentInsights(
    patientId: string
  ): Promise<AppointmentInsights> {
    try {
      const history = await this.getPatientAppointmentHistory(patientId);
      
      const attendanceRate = history.total_appointments > 0 
        ? (history.completed_appointments / history.total_appointments) * 100
        : 0;

      // Calculate punctuality score based on check-in times
      const punctualityScore = await this.calculatePunctualityScore(patientId);
      
      // Calculate satisfaction score from ratings
      const satisfactionScore = history.average_rating * 20; // Convert to percentage
      
      // Calculate loyalty index
      const loyaltyIndex = this.calculateLoyaltyIndex(history);
      
      // Identify risk factors
      const riskFactors = this.identifyRiskFactors(history, attendanceRate);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(history, attendanceRate, satisfactionScore);

      return {
        attendance_rate: attendanceRate,
        punctuality_score: punctualityScore,
        satisfaction_score: satisfactionScore,
        loyalty_index: loyaltyIndex,
        risk_factors: riskFactors,
        recommendations: recommendations
      };
    } catch (error) {
      logger.error('Error generating appointment insights:', error);
      throw new Error('Failed to generate appointment insights');
    }
  }

  /**
   * Link patient profile with appointment booking
   */
  static async linkPatientToAppointment(
    patientId: string,
    appointmentData: Partial<Appointment>
  ): Promise<Appointment> {
    try {
      // Get patient preferences to suggest optimal appointment
      const history = await this.getPatientAppointmentHistory(patientId);
      
      // Apply patient preferences if not specified
      const optimizedAppointment = {
        ...appointmentData,
        patient_id: patientId,
        preferred_time: appointmentData.appointment_time || history.preferred_times[0],
        notes: `${appointmentData.notes || ''} | Patient preferences: ${history.preferred_services.join(', ')}`
      };

      const { data: appointment, error } = await supabase
        .from('appointments')
        .insert(optimizedAppointment)
        .select()
        .single();

      if (error) throw error;

      // Update patient's last interaction
      await supabase
        .from('patients')
        .update({ 
          last_appointment_date: appointment.appointment_date,
          updated_at: new Date().toISOString()
        })
        .eq('id', patientId);

      logger.info(`Patient ${patientId} linked to appointment ${appointment.id}`);
      return appointment;
    } catch (error) {
      logger.error('Error linking patient to appointment:', error);
      throw new Error('Failed to link patient to appointment');
    }
  }

  /**
   * Calculate time preferences based on appointment history
   */
  private static calculateTimePreferences(appointments: Appointment[]): string[] {
    const timeSlots: { [key: string]: number } = {};
    
    appointments.forEach(apt => {
      const hour = new Date(apt.appointment_date).getHours();
      const timeSlot = this.getTimeSlot(hour);
      timeSlots[timeSlot] = (timeSlots[timeSlot] || 0) + 1;
    });

    return Object.entries(timeSlots)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([slot]) => slot);
  }

  /**
   * Calculate service preferences based on appointment history
   */
  private static calculateServicePreferences(appointments: Appointment[]): string[] {
    const services: { [key: string]: number } = {};
    
    appointments.forEach(apt => {
      if (apt.service_type) {
        services[apt.service_type] = (services[apt.service_type] || 0) + 1;
      }
    });

    return Object.entries(services)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([service]) => service);
  }

  /**
   * Calculate punctuality score based on check-in times
   */
  private static async calculatePunctualityScore(patientId: string): Promise<number> {
    try {
      const { data: checkIns, error } = await supabase
        .from('appointment_check_ins')
        .select('check_in_time, scheduled_time')
        .eq('patient_id', patientId)
        .limit(20); // Last 20 appointments

      if (error || !checkIns?.length) return 75; // Default score

      const punctualAppointments = checkIns.filter(checkIn => {
        const scheduledTime = new Date(checkIn.scheduled_time);
        const checkInTime = new Date(checkIn.check_in_time);
        const diffMinutes = (checkInTime.getTime() - scheduledTime.getTime()) / (1000 * 60);
        return diffMinutes <= 15; // On time or up to 15 minutes late
      });

      return (punctualAppointments.length / checkIns.length) * 100;
    } catch (error) {
      logger.error('Error calculating punctuality score:', error);
      return 75; // Default score
    }
  }

  /**
   * Calculate loyalty index based on appointment patterns
   */
  private static calculateLoyaltyIndex(history: PatientAppointmentHistory): number {
    const factors = {
      totalAppointments: Math.min(history.total_appointments / 10, 1) * 30,
      attendanceRate: (history.completed_appointments / Math.max(history.total_appointments, 1)) * 40,
      averageRating: (history.average_rating / 5) * 20,
      consistency: this.calculateConsistency(history) * 10
    };

    return Math.round(Object.values(factors).reduce((sum, factor) => sum + factor, 0));
  }

  /**
   * Calculate appointment consistency
   */
  private static calculateConsistency(history: PatientAppointmentHistory): number {
    if (history.appointments.length < 2) return 0;
    
    // Calculate average time between appointments
    const intervals: number[] = [];
    for (let i = 1; i < history.appointments.length; i++) {
      const current = new Date(history.appointments[i-1].appointment_date);
      const previous = new Date(history.appointments[i].appointment_date);
      const daysDiff = (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24);
      intervals.push(daysDiff);
    }

    // Calculate consistency (lower variance = higher consistency)
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
    
    return Math.max(0, 1 - (variance / (avgInterval * avgInterval)));
  }

  /**
   * Identify risk factors based on appointment history
   */
  private static identifyRiskFactors(
    history: PatientAppointmentHistory,
    attendanceRate: number
  ): string[] {
    const risks: string[] = [];

    if (attendanceRate < 70) {
      risks.push('Low attendance rate');
    }

    if (history.no_show_count > 2) {
      risks.push('Multiple no-shows');
    }

    if (history.average_rating < 3) {
      risks.push('Low satisfaction scores');
    }

    if (history.cancelled_appointments > history.completed_appointments) {
      risks.push('High cancellation rate');
    }

    const daysSinceLastAppointment = history.last_appointment_date 
      ? (Date.now() - new Date(history.last_appointment_date).getTime()) / (1000 * 60 * 60 * 24)
      : 0;

    if (daysSinceLastAppointment > 180) {
      risks.push('Long absence from clinic');
    }

    return risks;
  }

  /**
   * Generate recommendations based on patient data
   */
  private static generateRecommendations(
    history: PatientAppointmentHistory,
    attendanceRate: number,
    satisfactionScore: number
  ): string[] {
    const recommendations: string[] = [];

    if (attendanceRate < 80) {
      recommendations.push('Send appointment reminders 24h and 2h before');
    }

    if (history.preferred_times.length > 0) {
      recommendations.push(`Schedule during preferred times: ${history.preferred_times.join(', ')}`);
    }

    if (satisfactionScore < 70) {
      recommendations.push('Follow up after appointments to improve satisfaction');
    }

    if (history.no_show_count > 1) {
      recommendations.push('Require confirmation calls for future appointments');
    }

    if (history.preferred_services.length > 0) {
      recommendations.push(`Focus on preferred services: ${history.preferred_services.slice(0, 2).join(', ')}`);
    }

    return recommendations;
  }

  /**
   * Get time slot category from hour
   */
  private static getTimeSlot(hour: number): string {
    if (hour >= 8 && hour < 12) return 'Morning (8-12)';
    if (hour >= 12 && hour < 17) return 'Afternoon (12-17)';
    if (hour >= 17 && hour < 20) return 'Evening (17-20)';
    return 'Other';
  }
}

export default PatientAppointmentIntegration;