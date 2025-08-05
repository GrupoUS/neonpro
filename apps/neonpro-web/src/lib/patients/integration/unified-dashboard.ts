/**
 * Unified Patient Dashboard System
 * Integrates all patient data for comprehensive 360° view
 * Part of Story 3.1 - Task 6: System Integration & Search
 */

import { Patient } from '@/types/patient';
import { PatientAppointmentIntegration } from './appointment-integration';
import { PatientTreatmentIntegration } from './treatment-integration';
import { AdvancedPatientSearch } from '../search/advanced-patient-search';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';

export interface UnifiedPatientProfile {
  // Core patient data
  patient: Patient;
  
  // Extended profile information
  profile_extended: {
    risk_score: number;
    satisfaction_score: number;
    loyalty_score: number;
    total_visits: number;
    total_spent: number;
    preferred_staff: string[];
    preferred_services: string[];
    communication_preferences: string[];
    emergency_contacts: any[];
    medical_conditions: string[];
    allergies: string[];
    medications: string[];
  };
  
  // Appointment insights
  appointment_insights: {
    total_appointments: number;
    completed_appointments: number;
    cancelled_appointments: number;
    no_show_count: number;
    punctuality_score: number;
    next_appointment?: any;
    recent_appointments: any[];
    appointment_patterns: any;
  };
  
  // Treatment insights
  treatment_insights: {
    total_treatments: number;
    active_treatments: number;
    completed_treatments: number;
    avg_satisfaction: number;
    avg_outcome_rating: number;
    total_investment: number;
    adherence_score: number;
    risk_factors: string[];
    recommendations: string[];
  };
  
  // Financial summary
  financial_summary: {
    total_billed: number;
    total_paid: number;
    outstanding_balance: number;
    insurance_coverage: number;
    payment_history: any[];
    payment_patterns: any;
  };
  
  // Communication history
  communication_history: {
    total_interactions: number;
    last_contact_date: string;
    preferred_channel: string;
    response_rate: number;
    recent_communications: any[];
  };
  
  // AI insights and predictions
  ai_insights: {
    churn_risk_score: number;
    lifetime_value_prediction: number;
    next_service_recommendations: string[];
    optimal_contact_time: string;
    personality_profile: string;
    engagement_score: number;
  };
  
  // Photo and visual data
  visual_data: {
    profile_photos: any[];
    treatment_photos: any[];
    progress_photos: any[];
    facial_recognition_data?: any;
  };
}

export interface DashboardMetrics {
  patient_count: number;
  active_patients: number;
  new_patients_this_month: number;
  high_risk_patients: number;
  avg_satisfaction: number;
  total_revenue: number;
  outstanding_payments: number;
  appointment_utilization: number;
  treatment_completion_rate: number;
  patient_retention_rate: number;
}

export class UnifiedPatientDashboard {
  /**
   * Get complete 360° patient profile
   */
  static async getUnifiedPatientProfile(patientId: string): Promise<UnifiedPatientProfile> {
    try {
      logger.info(`Generating unified profile for patient ${patientId}`);
      
      // Get core patient data
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select(`
          *,
          patient_profiles_extended(*),
          patient_photos(*),
          emergency_contacts(*)
        `)
        .eq('id', patientId)
        .single();
      
      if (patientError) throw patientError;
      if (!patient) throw new Error('Patient not found');
      
      // Get appointment insights
      const appointmentInsights = await PatientAppointmentIntegration.generateAppointmentInsights(patientId);
      
      // Get treatment insights
      const treatmentInsights = await PatientTreatmentIntegration.generateTreatmentInsights(patientId);
      
      // Get financial summary
      const financialSummary = await this.getFinancialSummary(patientId);
      
      // Get communication history
      const communicationHistory = await this.getCommunicationHistory(patientId);
      
      // Generate AI insights
      const aiInsights = await this.generateAIInsights(patientId, {
        appointmentInsights,
        treatmentInsights,
        financialSummary
      });
      
      // Get visual data
      const visualData = await this.getVisualData(patientId);
      
      const unifiedProfile: UnifiedPatientProfile = {
        patient,
        profile_extended: {
          risk_score: patient.patient_profiles_extended?.risk_score || 0,
          satisfaction_score: patient.patient_profiles_extended?.satisfaction_score || 0,
          loyalty_score: patient.patient_profiles_extended?.loyalty_score || 0,
          total_visits: appointmentInsights.total_appointments,
          total_spent: treatmentInsights.total_investment,
          preferred_staff: appointmentInsights.preferred_staff,
          preferred_services: treatmentInsights.preferred_services,
          communication_preferences: patient.patient_profiles_extended?.communication_preferences || [],
          emergency_contacts: patient.emergency_contacts || [],
          medical_conditions: patient.patient_profiles_extended?.medical_conditions || [],
          allergies: patient.patient_profiles_extended?.allergies || [],
          medications: patient.patient_profiles_extended?.current_medications || []
        },
        appointment_insights: {
          total_appointments: appointmentInsights.total_appointments,
          completed_appointments: appointmentInsights.completed_appointments,
          cancelled_appointments: appointmentInsights.cancelled_appointments,
          no_show_count: appointmentInsights.no_show_count,
          punctuality_score: appointmentInsights.punctuality_score,
          next_appointment: appointmentInsights.next_appointment,
          recent_appointments: appointmentInsights.recent_appointments,
          appointment_patterns: appointmentInsights.appointment_patterns
        },
        treatment_insights: {
          total_treatments: treatmentInsights.total_treatments,
          active_treatments: treatmentInsights.active_treatments,
          completed_treatments: treatmentInsights.completed_treatments,
          avg_satisfaction: treatmentInsights.avg_satisfaction,
          avg_outcome_rating: treatmentInsights.avg_outcome_rating,
          total_investment: treatmentInsights.total_investment,
          adherence_score: treatmentInsights.adherence_score,
          risk_factors: treatmentInsights.risk_factors,
          recommendations: treatmentInsights.recommendations
        },
        financial_summary: financialSummary,
        communication_history: communicationHistory,
        ai_insights: aiInsights,
        visual_data: visualData
      };
      
      logger.info(`Successfully generated unified profile for patient ${patientId}`);
      return unifiedProfile;
    } catch (error) {
      logger.error('Error generating unified patient profile:', error);
      throw new Error('Failed to generate unified patient profile');
    }
  }

  /**
   * Get dashboard metrics and KPIs
   */
  static async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      // Get patient counts
      const { count: totalPatients } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });
      
      // Get active patients (had appointment in last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const { count: activePatients } = await supabase
        .from('patients')
        .select(`
          id,
          appointments!inner(id)
        `, { count: 'exact', head: true })
        .gte('appointments.appointment_date', sixMonthsAgo.toISOString());
      
      // Get new patients this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { count: newPatients } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());
      
      // Get high risk patients
      const { count: highRiskPatients } = await supabase
        .from('patient_profiles_extended')
        .select('*', { count: 'exact', head: true })
        .gte('risk_score', 7);
      
      // Get average satisfaction
      const { data: satisfactionData } = await supabase
        .from('patient_profiles_extended')
        .select('satisfaction_score')
        .not('satisfaction_score', 'is', null);
      
      const avgSatisfaction = satisfactionData && satisfactionData.length > 0
        ? satisfactionData.reduce((sum, p) => sum + (p.satisfaction_score || 0), 0) / satisfactionData.length
        : 0;
      
      // Get financial metrics
      const { data: financialData } = await supabase
        .from('patient_treatments')
        .select('cost_total, cost_paid');
      
      const totalRevenue = financialData?.reduce((sum, t) => sum + (t.cost_paid || 0), 0) || 0;
      const outstandingPayments = financialData?.reduce((sum, t) => sum + ((t.cost_total || 0) - (t.cost_paid || 0)), 0) || 0;
      
      // Get appointment utilization (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: totalSlots } = await supabase
        .from('appointment_slots')
        .select('*', { count: 'exact', head: true })
        .gte('slot_date', thirtyDaysAgo.toISOString());
      
      const { count: bookedSlots } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('appointment_date', thirtyDaysAgo.toISOString())
        .neq('status', 'cancelled');
      
      const appointmentUtilization = totalSlots && totalSlots > 0 ? (bookedSlots || 0) / totalSlots * 100 : 0;
      
      // Get treatment completion rate
      const { count: totalTreatments } = await supabase
        .from('patient_treatments')
        .select('*', { count: 'exact', head: true });
      
      const { count: completedTreatments } = await supabase
        .from('patient_treatments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');
      
      const treatmentCompletionRate = totalTreatments && totalTreatments > 0 
        ? (completedTreatments || 0) / totalTreatments * 100 
        : 0;
      
      // Calculate patient retention rate (patients who returned in last 12 months)
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      const { count: returningPatients } = await supabase
        .from('patients')
        .select(`
          id,
          appointments!inner(id)
        `, { count: 'exact', head: true })
        .lt('created_at', oneYearAgo.toISOString())
        .gte('appointments.appointment_date', oneYearAgo.toISOString());
      
      const { count: oldPatients } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .lt('created_at', oneYearAgo.toISOString());
      
      const patientRetentionRate = oldPatients && oldPatients > 0 
        ? (returningPatients || 0) / oldPatients * 100 
        : 0;
      
      return {
        patient_count: totalPatients || 0,
        active_patients: activePatients || 0,
        new_patients_this_month: newPatients || 0,
        high_risk_patients: highRiskPatients || 0,
        avg_satisfaction: avgSatisfaction,
        total_revenue: totalRevenue,
        outstanding_payments: outstandingPayments,
        appointment_utilization: appointmentUtilization,
        treatment_completion_rate: treatmentCompletionRate,
        patient_retention_rate: patientRetentionRate
      };
    } catch (error) {
      logger.error('Error getting dashboard metrics:', error);
      throw new Error('Failed to get dashboard metrics');
    }
  }

  /**
   * Get financial summary for a patient
   */
  private static async getFinancialSummary(patientId: string) {
    try {
      const { data: treatments } = await supabase
        .from('patient_treatments')
        .select('cost_total, cost_paid, insurance_covered, start_date')
        .eq('patient_id', patientId);
      
      const { data: payments } = await supabase
        .from('patient_payments')
        .select('*')
        .eq('patient_id', patientId)
        .order('payment_date', { ascending: false });
      
      const totalBilled = treatments?.reduce((sum, t) => sum + (t.cost_total || 0), 0) || 0;
      const totalPaid = treatments?.reduce((sum, t) => sum + (t.cost_paid || 0), 0) || 0;
      const insuranceCoverage = treatments?.reduce((sum, t) => sum + (t.insurance_covered || 0), 0) || 0;
      
      return {
        total_billed: totalBilled,
        total_paid: totalPaid,
        outstanding_balance: totalBilled - totalPaid,
        insurance_coverage: insuranceCoverage,
        payment_history: payments || [],
        payment_patterns: this.analyzePaymentPatterns(payments || [])
      };
    } catch (error) {
      logger.error('Error getting financial summary:', error);
      return {
        total_billed: 0,
        total_paid: 0,
        outstanding_balance: 0,
        insurance_coverage: 0,
        payment_history: [],
        payment_patterns: {}
      };
    }
  }

  /**
   * Get communication history for a patient
   */
  private static async getCommunicationHistory(patientId: string) {
    try {
      const { data: communications } = await supabase
        .from('patient_communications')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });
      
      const totalInteractions = communications?.length || 0;
      const lastContactDate = communications?.[0]?.created_at || '';
      
      // Calculate preferred channel
      const channelCounts: Record<string, number> = {};
      communications?.forEach(comm => {
        channelCounts[comm.channel] = (channelCounts[comm.channel] || 0) + 1;
      });
      
      const preferredChannel = Object.keys(channelCounts).reduce((a, b) => 
        channelCounts[a] > channelCounts[b] ? a : b, 'email'
      );
      
      // Calculate response rate
      const outboundComms = communications?.filter(c => c.direction === 'outbound') || [];
      const respondedComms = communications?.filter(c => c.direction === 'inbound') || [];
      const responseRate = outboundComms.length > 0 ? 
        (respondedComms.length / outboundComms.length) * 100 : 0;
      
      return {
        total_interactions: totalInteractions,
        last_contact_date: lastContactDate,
        preferred_channel: preferredChannel,
        response_rate: responseRate,
        recent_communications: communications?.slice(0, 10) || []
      };
    } catch (error) {
      logger.error('Error getting communication history:', error);
      return {
        total_interactions: 0,
        last_contact_date: '',
        preferred_channel: 'email',
        response_rate: 0,
        recent_communications: []
      };
    }
  }

  /**
   * Generate AI insights and predictions
   */
  private static async generateAIInsights(patientId: string, data: any) {
    try {
      // Calculate churn risk score
      const churnRiskScore = this.calculateChurnRisk(data);
      
      // Predict lifetime value
      const lifetimeValuePrediction = this.predictLifetimeValue(data);
      
      // Generate service recommendations
      const nextServiceRecommendations = await this.generateServiceRecommendations(patientId, data);
      
      // Determine optimal contact time
      const optimalContactTime = this.determineOptimalContactTime(data.communicationHistory);
      
      // Generate personality profile
      const personalityProfile = this.generatePersonalityProfile(data);
      
      // Calculate engagement score
      const engagementScore = this.calculateEngagementScore(data);
      
      return {
        churn_risk_score: churnRiskScore,
        lifetime_value_prediction: lifetimeValuePrediction,
        next_service_recommendations: nextServiceRecommendations,
        optimal_contact_time: optimalContactTime,
        personality_profile: personalityProfile,
        engagement_score: engagementScore
      };
    } catch (error) {
      logger.error('Error generating AI insights:', error);
      return {
        churn_risk_score: 0,
        lifetime_value_prediction: 0,
        next_service_recommendations: [],
        optimal_contact_time: '10:00',
        personality_profile: 'Balanced',
        engagement_score: 0
      };
    }
  }

  /**
   * Get visual data for a patient
   */
  private static async getVisualData(patientId: string) {
    try {
      const { data: photos } = await supabase
        .from('patient_photos')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });
      
      const profilePhotos = photos?.filter(p => p.photo_type === 'profile') || [];
      const treatmentPhotos = photos?.filter(p => p.photo_type === 'treatment') || [];
      const progressPhotos = photos?.filter(p => p.photo_type === 'progress') || [];
      
      // Get facial recognition data if available
      const { data: faceData } = await supabase
        .from('patient_face_recognition')
        .select('*')
        .eq('patient_id', patientId)
        .single();
      
      return {
        profile_photos: profilePhotos,
        treatment_photos: treatmentPhotos,
        progress_photos: progressPhotos,
        facial_recognition_data: faceData
      };
    } catch (error) {
      logger.error('Error getting visual data:', error);
      return {
        profile_photos: [],
        treatment_photos: [],
        progress_photos: [],
        facial_recognition_data: null
      };
    }
  }

  /**
   * Analyze payment patterns
   */
  private static analyzePaymentPatterns(payments: any[]) {
    if (payments.length === 0) return {};
    
    const avgPaymentAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0) / payments.length;
    const paymentMethods = payments.reduce((methods, p) => {
      methods[p.payment_method] = (methods[p.payment_method] || 0) + 1;
      return methods;
    }, {} as Record<string, number>);
    
    const preferredMethod = Object.keys(paymentMethods).reduce((a, b) => 
      paymentMethods[a] > paymentMethods[b] ? a : b, 'cash'
    );
    
    return {
      avg_payment_amount: avgPaymentAmount,
      preferred_payment_method: preferredMethod,
      payment_frequency: this.calculatePaymentFrequency(payments),
      on_time_payment_rate: this.calculateOnTimePaymentRate(payments)
    };
  }

  /**
   * Calculate churn risk score
   */
  private static calculateChurnRisk(data: any): number {
    let riskScore = 0;
    
    // No recent appointments
    const daysSinceLastAppointment = data.appointmentInsights.recent_appointments.length > 0 ?
      Math.floor((Date.now() - new Date(data.appointmentInsights.recent_appointments[0].appointment_date).getTime()) / (1000 * 60 * 60 * 24)) : 365;
    
    if (daysSinceLastAppointment > 180) riskScore += 30;
    else if (daysSinceLastAppointment > 90) riskScore += 15;
    
    // High cancellation rate
    const cancellationRate = data.appointmentInsights.total_appointments > 0 ?
      (data.appointmentInsights.cancelled_appointments / data.appointmentInsights.total_appointments) * 100 : 0;
    
    if (cancellationRate > 30) riskScore += 25;
    else if (cancellationRate > 15) riskScore += 10;
    
    // Low satisfaction
    if (data.treatmentInsights.avg_satisfaction < 3) riskScore += 20;
    else if (data.treatmentInsights.avg_satisfaction < 4) riskScore += 10;
    
    // Outstanding balance
    if (data.financialSummary.outstanding_balance > 1000) riskScore += 15;
    
    return Math.min(riskScore, 100);
  }

  /**
   * Predict lifetime value
   */
  private static predictLifetimeValue(data: any): number {
    const avgMonthlySpend = data.treatmentInsights.total_investment / 12; // Assuming 1 year average
    const retentionMultiplier = Math.max(1, 5 - (data.churnRiskScore / 20));
    const satisfactionMultiplier = 1 + (data.treatmentInsights.avg_satisfaction - 3) * 0.2;
    
    return avgMonthlySpend * 24 * retentionMultiplier * satisfactionMultiplier; // 2-year prediction
  }

  /**
   * Generate service recommendations
   */
  private static async generateServiceRecommendations(patientId: string, data: any): Promise<string[]> {
    const recommendations: string[] = [];
    
    // Based on successful past treatments
    if (data.treatmentInsights.preferred_services.length > 0) {
      recommendations.push(`Follow-up ${data.treatmentInsights.preferred_services[0]}`);
    }
    
    // Based on risk factors
    if (data.treatmentInsights.risk_factors.includes('Low treatment adherence')) {
      recommendations.push('Adherence support program');
    }
    
    // Based on satisfaction
    if (data.treatmentInsights.avg_satisfaction >= 4) {
      recommendations.push('Premium service upgrade');
    }
    
    return recommendations.slice(0, 3);
  }

  /**
   * Determine optimal contact time
   */
  private static determineOptimalContactTime(communicationHistory: any): string {
    // Analyze response times to determine best contact hours
    // Default to 10:00 AM for now
    return '10:00';
  }

  /**
   * Generate personality profile
   */
  private static generatePersonalityProfile(data: any): string {
    if (data.appointmentInsights.punctuality_score > 80) return 'Punctual & Organized';
    if (data.treatmentInsights.adherence_score > 90) return 'Highly Compliant';
    if (data.communicationHistory.response_rate > 80) return 'Highly Responsive';
    if (data.treatmentInsights.avg_satisfaction > 4) return 'Satisfied & Loyal';
    return 'Balanced';
  }

  /**
   * Calculate engagement score
   */
  private static calculateEngagementScore(data: any): number {
    let score = 0;
    
    // Appointment engagement
    score += Math.min(data.appointmentInsights.punctuality_score, 25);
    
    // Treatment engagement
    score += Math.min(data.treatmentInsights.adherence_score * 0.25, 25);
    
    // Communication engagement
    score += Math.min(data.communicationHistory.response_rate * 0.25, 25);
    
    // Satisfaction engagement
    score += Math.min(data.treatmentInsights.avg_satisfaction * 5, 25);
    
    return Math.round(score);
  }

  /**
   * Calculate payment frequency
   */
  private static calculatePaymentFrequency(payments: any[]) {
    if (payments.length < 2) return 'Insufficient data';
    
    const sortedPayments = payments.sort((a, b) => 
      new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime()
    );
    
    const intervals = [];
    for (let i = 1; i < sortedPayments.length; i++) {
      const days = Math.floor(
        (new Date(sortedPayments[i].payment_date).getTime() - 
         new Date(sortedPayments[i-1].payment_date).getTime()) / (1000 * 60 * 60 * 24)
      );
      intervals.push(days);
    }
    
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    
    if (avgInterval <= 7) return 'Weekly';
    if (avgInterval <= 30) return 'Monthly';
    if (avgInterval <= 90) return 'Quarterly';
    return 'Irregular';
  }

  /**
   * Calculate on-time payment rate
   */
  private static calculateOnTimePaymentRate(payments: any[]): number {
    const onTimePayments = payments.filter(p => 
      new Date(p.payment_date) <= new Date(p.due_date)
    ).length;
    
    return payments.length > 0 ? (onTimePayments / payments.length) * 100 : 0;
  }

  /**
   * Export patient data for external systems
   */
  static async exportPatientData(patientId: string, format: 'json' | 'csv' = 'json') {
    try {
      const profile = await this.getUnifiedPatientProfile(patientId);
      
      if (format === 'csv') {
        return this.convertToCSV(profile);
      }
      
      return JSON.stringify(profile, null, 2);
    } catch (error) {
      logger.error('Error exporting patient data:', error);
      throw new Error('Failed to export patient data');
    }
  }

  /**
   * Convert profile to CSV format
   */
  private static convertToCSV(profile: UnifiedPatientProfile): string {
    const headers = [
      'Patient ID', 'Name', 'Email', 'Phone', 'Risk Score', 'Satisfaction Score',
      'Total Appointments', 'Total Treatments', 'Total Investment', 'Outstanding Balance'
    ];
    
    const row = [
      profile.patient.id,
      profile.patient.name,
      profile.patient.email,
      profile.patient.phone,
      profile.profile_extended.risk_score,
      profile.profile_extended.satisfaction_score,
      profile.appointment_insights.total_appointments,
      profile.treatment_insights.total_treatments,
      profile.treatment_insights.total_investment,
      profile.financial_summary.outstanding_balance
    ];
    
    return [headers.join(','), row.join(',')].join('\n');
  }
}

export default UnifiedPatientDashboard;
