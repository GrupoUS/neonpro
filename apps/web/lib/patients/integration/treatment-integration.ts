/**
 * Treatment Integration System
 * Integrates patient profiles with treatment and medical history
 * Part of Story 3.1 - Task 6: System Integration & Search
 */

import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase/client';

export interface TreatmentHistory {
  id: string;
  patient_id: string;
  treatment_type: string;
  service_name: string;
  provider_name: string;
  start_date: string;
  end_date?: string;
  status: 'active' | 'completed' | 'cancelled' | 'paused';
  progress_percentage: number;
  total_sessions: number;
  completed_sessions: number;
  next_session_date?: string;
  notes: string;
  cost_total: number;
  cost_paid: number;
  insurance_covered: number;
  satisfaction_score?: number;
  outcome_rating?: number;
  side_effects?: string[];
  medications?: string[];
}

export interface TreatmentInsights {
  patient_id: string;
  total_treatments: number;
  active_treatments: number;
  completed_treatments: number;
  avg_satisfaction: number;
  avg_outcome_rating: number;
  total_investment: number;
  preferred_providers: string[];
  preferred_services: string[];
  treatment_frequency: {
    weekly: number;
    monthly: number;
    quarterly: number;
  };
  adherence_score: number;
  risk_factors: string[];
  recommendations: string[];
  next_recommended_treatments: string[];
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  record_type:
    | 'diagnosis'
    | 'prescription'
    | 'lab_result'
    | 'imaging'
    | 'procedure';
  title: string;
  description: string;
  provider_name: string;
  date_recorded: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'chronic' | 'monitoring';
  attachments?: string[];
  related_treatments?: string[];
  follow_up_required: boolean;
  follow_up_date?: string;
  tags: string[];
}

export class PatientTreatmentIntegration {
  /**
   * Get comprehensive treatment history for a patient
   */
  static async getPatientTreatmentHistory(
    patientId: string
  ): Promise<TreatmentHistory[]> {
    try {
      const { data: treatments, error } = await supabase
        .from('patient_treatments')
        .select(`
          *,
          services(name),
          staff(name),
          treatment_sessions(count)
        `)
        .eq('patient_id', patientId)
        .order('start_date', { ascending: false });

      if (error) throw error;

      return (
        treatments?.map((treatment) => ({
          id: treatment.id,
          patient_id: treatment.patient_id,
          treatment_type: treatment.treatment_type,
          service_name: treatment.services?.name || 'Unknown Service',
          provider_name: treatment.staff?.name || 'Unknown Provider',
          start_date: treatment.start_date,
          end_date: treatment.end_date,
          status: treatment.status,
          progress_percentage: treatment.progress_percentage || 0,
          total_sessions: treatment.total_sessions || 0,
          completed_sessions: treatment.completed_sessions || 0,
          next_session_date: treatment.next_session_date,
          notes: treatment.notes || '',
          cost_total: treatment.cost_total || 0,
          cost_paid: treatment.cost_paid || 0,
          insurance_covered: treatment.insurance_covered || 0,
          satisfaction_score: treatment.satisfaction_score,
          outcome_rating: treatment.outcome_rating,
          side_effects: treatment.side_effects || [],
          medications: treatment.medications || [],
        })) || []
      );
    } catch (error) {
      logger.error('Error fetching patient treatment history:', error);
      return [];
    }
  }

  /**
   * Generate comprehensive treatment insights
   */
  static async generateTreatmentInsights(
    patientId: string
  ): Promise<TreatmentInsights> {
    try {
      const treatments =
        await PatientTreatmentIntegration.getPatientTreatmentHistory(patientId);

      const activeTreatments = treatments.filter((t) => t.status === 'active');
      const completedTreatments = treatments.filter(
        (t) => t.status === 'completed'
      );

      // Calculate averages
      const avgSatisfaction = PatientTreatmentIntegration.calculateAverage(
        treatments
          .filter((t) => t.satisfaction_score)
          .map((t) => t.satisfaction_score!)
      );

      const avgOutcome = PatientTreatmentIntegration.calculateAverage(
        treatments.filter((t) => t.outcome_rating).map((t) => t.outcome_rating!)
      );

      // Calculate total investment
      const totalInvestment = treatments.reduce(
        (sum, t) => sum + t.cost_total,
        0
      );

      // Find preferred providers and services
      const providerCounts = PatientTreatmentIntegration.countOccurrences(
        treatments.map((t) => t.provider_name)
      );
      const serviceCounts = PatientTreatmentIntegration.countOccurrences(
        treatments.map((t) => t.service_name)
      );

      // Calculate adherence score
      const adherenceScore =
        PatientTreatmentIntegration.calculateAdherenceScore(treatments);

      // Generate risk factors and recommendations
      const riskFactors =
        PatientTreatmentIntegration.identifyRiskFactors(treatments);
      const recommendations =
        PatientTreatmentIntegration.generateRecommendations(
          treatments,
          riskFactors
        );

      return {
        patient_id: patientId,
        total_treatments: treatments.length,
        active_treatments: activeTreatments.length,
        completed_treatments: completedTreatments.length,
        avg_satisfaction: avgSatisfaction,
        avg_outcome_rating: avgOutcome,
        total_investment: totalInvestment,
        preferred_providers: Object.keys(providerCounts).slice(0, 3),
        preferred_services: Object.keys(serviceCounts).slice(0, 3),
        treatment_frequency:
          PatientTreatmentIntegration.calculateTreatmentFrequency(treatments),
        adherence_score: adherenceScore,
        risk_factors: riskFactors,
        recommendations,
        next_recommended_treatments:
          await PatientTreatmentIntegration.getRecommendedTreatments(
            patientId,
            treatments
          ),
      };
    } catch (error) {
      logger.error('Error generating treatment insights:', error);
      throw new Error('Failed to generate treatment insights');
    }
  }

  /**
   * Get patient medical records
   */
  static async getPatientMedicalRecords(
    patientId: string
  ): Promise<MedicalRecord[]> {
    try {
      const { data: records, error } = await supabase
        .from('patient_medical_records')
        .select('*')
        .eq('patient_id', patientId)
        .order('date_recorded', { ascending: false });

      if (error) throw error;

      return records || [];
    } catch (error) {
      logger.error('Error fetching medical records:', error);
      return [];
    }
  }

  /**
   * Link patient to treatment plan
   */
  static async linkPatientToTreatment(
    patientId: string,
    treatmentData: Partial<TreatmentHistory>
  ): Promise<string> {
    try {
      const { data: treatment, error } = await supabase
        .from('patient_treatments')
        .insert({
          patient_id: patientId,
          ...treatmentData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) throw error;

      logger.info(`Linked patient ${patientId} to treatment ${treatment.id}`);
      return treatment.id;
    } catch (error) {
      logger.error('Error linking patient to treatment:', error);
      throw new Error('Failed to link patient to treatment');
    }
  }

  /**
   * Update treatment progress
   */
  static async updateTreatmentProgress(
    treatmentId: string,
    progressData: {
      completed_sessions?: number;
      progress_percentage?: number;
      notes?: string;
      satisfaction_score?: number;
      outcome_rating?: number;
    }
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('patient_treatments')
        .update({
          ...progressData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', treatmentId);

      if (error) throw error;

      logger.info(`Updated treatment progress for ${treatmentId}`);
    } catch (error) {
      logger.error('Error updating treatment progress:', error);
      throw new Error('Failed to update treatment progress');
    }
  }

  /**
   * Calculate average from array of numbers
   */
  private static calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }

  /**
   * Count occurrences of items in array
   */
  private static countOccurrences(items: string[]): Record<string, number> {
    return items.reduce(
      (counts, item) => {
        counts[item] = (counts[item] || 0) + 1;
        return counts;
      },
      {} as Record<string, number>
    );
  }

  /**
   * Calculate treatment adherence score
   */
  private static calculateAdherenceScore(
    treatments: TreatmentHistory[]
  ): number {
    if (treatments.length === 0) return 0;

    const adherenceScores = treatments.map((treatment) => {
      if (treatment.total_sessions === 0) return 1;
      return treatment.completed_sessions / treatment.total_sessions;
    });

    return PatientTreatmentIntegration.calculateAverage(adherenceScores) * 100;
  }

  /**
   * Calculate treatment frequency patterns
   */
  private static calculateTreatmentFrequency(treatments: TreatmentHistory[]) {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    return {
      weekly: treatments.filter((t) => new Date(t.start_date) >= oneWeekAgo)
        .length,
      monthly: treatments.filter((t) => new Date(t.start_date) >= oneMonthAgo)
        .length,
      quarterly: treatments.filter(
        (t) => new Date(t.start_date) >= threeMonthsAgo
      ).length,
    };
  }

  /**
   * Identify risk factors based on treatment history
   */
  private static identifyRiskFactors(treatments: TreatmentHistory[]): string[] {
    const riskFactors: string[] = [];

    // Low adherence
    const adherenceScore =
      PatientTreatmentIntegration.calculateAdherenceScore(treatments);
    if (adherenceScore < 70) {
      riskFactors.push('Low treatment adherence');
    }

    // Multiple cancelled treatments
    const cancelledCount = treatments.filter(
      (t) => t.status === 'cancelled'
    ).length;
    if (cancelledCount > 2) {
      riskFactors.push('High treatment cancellation rate');
    }

    // Low satisfaction scores
    const satisfactionScores = treatments
      .filter((t) => t.satisfaction_score)
      .map((t) => t.satisfaction_score!);
    const avgSatisfaction =
      PatientTreatmentIntegration.calculateAverage(satisfactionScores);
    if (avgSatisfaction < 3) {
      riskFactors.push('Low treatment satisfaction');
    }

    // Side effects reported
    const hasSideEffects = treatments.some(
      (t) => t.side_effects && t.side_effects.length > 0
    );
    if (hasSideEffects) {
      riskFactors.push('Reported side effects');
    }

    // High cost burden
    const totalCost = treatments.reduce((sum, t) => sum + t.cost_total, 0);
    const totalPaid = treatments.reduce((sum, t) => sum + t.cost_paid, 0);
    if (totalCost > 0 && totalPaid / totalCost < 0.5) {
      riskFactors.push('High unpaid treatment costs');
    }

    return riskFactors;
  }

  /**
   * Generate personalized recommendations
   */
  private static generateRecommendations(
    treatments: TreatmentHistory[],
    riskFactors: string[]
  ): string[] {
    const recommendations: string[] = [];

    // Adherence recommendations
    if (riskFactors.includes('Low treatment adherence')) {
      recommendations.push('Schedule regular follow-up appointments');
      recommendations.push('Consider reminder system for appointments');
      recommendations.push('Discuss treatment barriers with patient');
    }

    // Satisfaction recommendations
    if (riskFactors.includes('Low treatment satisfaction')) {
      recommendations.push('Review treatment approach with patient');
      recommendations.push('Consider alternative treatment options');
      recommendations.push('Gather detailed feedback on treatment experience');
    }

    // Cost recommendations
    if (riskFactors.includes('High unpaid treatment costs')) {
      recommendations.push('Discuss payment plan options');
      recommendations.push('Review insurance coverage options');
      recommendations.push('Consider cost-effective treatment alternatives');
    }

    // Side effects recommendations
    if (riskFactors.includes('Reported side effects')) {
      recommendations.push('Monitor side effects closely');
      recommendations.push('Consider dosage adjustments');
      recommendations.push('Evaluate alternative treatment methods');
    }

    // General recommendations
    const completedTreatments = treatments.filter(
      (t) => t.status === 'completed'
    );
    if (completedTreatments.length > 0) {
      recommendations.push('Schedule preventive care appointments');
      recommendations.push('Consider maintenance treatments');
    }

    return recommendations;
  }

  /**
   * Get AI-recommended treatments based on history
   */
  private static async getRecommendedTreatments(
    patientId: string,
    treatments: TreatmentHistory[]
  ): Promise<string[]> {
    try {
      // Get patient profile for personalized recommendations
      const { data: patient } = await supabase
        .from('patients')
        .select(`
          *,
          patient_profiles_extended(*)
        `)
        .eq('id', patientId)
        .single();

      if (!patient) return [];

      const recommendations: string[] = [];

      // Based on successful past treatments
      const successfulTreatments = treatments.filter(
        (t) => t.status === 'completed' && (t.satisfaction_score || 0) >= 4
      );

      if (successfulTreatments.length > 0) {
        const preferredServices = PatientTreatmentIntegration.countOccurrences(
          successfulTreatments.map((t) => t.service_name)
        );

        Object.keys(preferredServices)
          .slice(0, 2)
          .forEach((service) => {
            recommendations.push(`Follow-up ${service} treatment`);
          });
      }

      // Based on risk profile
      const riskScore = patient.patient_profiles_extended?.risk_score || 0;
      if (riskScore > 7) {
        recommendations.push('Preventive health screening');
        recommendations.push('Stress management therapy');
      }

      // Based on age and demographics
      const age = PatientTreatmentIntegration.calculateAge(
        patient.date_of_birth
      );
      if (age > 50) {
        recommendations.push('Annual health check-up');
        recommendations.push('Cardiovascular screening');
      }

      return recommendations.slice(0, 5); // Limit to top 5 recommendations
    } catch (error) {
      logger.error('Error getting recommended treatments:', error);
      return [];
    }
  }

  /**
   * Calculate age from date of birth
   */
  private static calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  /**
   * Get treatment analytics for dashboard
   */
  static async getTreatmentAnalytics(patientId: string) {
    try {
      const treatments =
        await PatientTreatmentIntegration.getPatientTreatmentHistory(patientId);
      const insights =
        await PatientTreatmentIntegration.generateTreatmentInsights(patientId);

      return {
        summary: {
          total_treatments: treatments.length,
          active_treatments: insights.active_treatments,
          completion_rate:
            treatments.length > 0
              ? (insights.completed_treatments / treatments.length) * 100
              : 0,
          avg_satisfaction: insights.avg_satisfaction,
          total_investment: insights.total_investment,
        },
        trends: {
          monthly_treatments:
            PatientTreatmentIntegration.getMonthlyTreatmentTrend(treatments),
          satisfaction_trend:
            PatientTreatmentIntegration.getSatisfactionTrend(treatments),
          cost_trend: PatientTreatmentIntegration.getCostTrend(treatments),
        },
        insights,
        recent_treatments: treatments.slice(0, 5),
      };
    } catch (error) {
      logger.error('Error getting treatment analytics:', error);
      throw new Error('Failed to get treatment analytics');
    }
  }

  /**
   * Get monthly treatment trend
   */
  private static getMonthlyTreatmentTrend(treatments: TreatmentHistory[]) {
    const monthlyData: Record<string, number> = {};

    treatments.forEach((treatment) => {
      const month = new Date(treatment.start_date).toISOString().slice(0, 7);
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12); // Last 12 months
  }

  /**
   * Get satisfaction trend
   */
  private static getSatisfactionTrend(treatments: TreatmentHistory[]) {
    return treatments
      .filter((t) => t.satisfaction_score)
      .map((t) => ({
        date: t.start_date,
        score: t.satisfaction_score!,
        treatment: t.service_name,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-10); // Last 10 treatments with scores
  }

  /**
   * Get cost trend
   */
  private static getCostTrend(treatments: TreatmentHistory[]) {
    const monthlyData: Record<string, { total: number; paid: number }> = {};

    treatments.forEach((treatment) => {
      const month = new Date(treatment.start_date).toISOString().slice(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { total: 0, paid: 0 };
      }
      monthlyData[month].total += treatment.cost_total;
      monthlyData[month].paid += treatment.cost_paid;
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12) // Last 12 months
      .map(([month, data]) => ({
        month,
        total_cost: data.total,
        paid_amount: data.paid,
        outstanding: data.total - data.paid,
      }));
  }
}

export default PatientTreatmentIntegration;
