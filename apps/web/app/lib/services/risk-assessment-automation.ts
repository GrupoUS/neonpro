/**
 * Risk Assessment Automation Service
 * Story 9.4: Comprehensive automated risk assessment with medical validation
 *
 * This service provides comprehensive risk assessment automation with medical validation,
 * including automated risk scoring, human-in-the-loop medical oversight, risk mitigation
 * strategies, and real-time alert management.
 */

import type {
  AssessmentContext,
  CreateAlertRequest,
  CreateMitigationRequest,
  CreateRiskAssessmentRequest,
  CreateValidationRequest,
  RiskAlert,
  RiskAssessment,
  RiskCategories,
  RiskDashboardData,
  RiskFactors,
  RiskLevel,
  RiskMitigation,
  RiskThreshold,
  RiskValidation,
  UpdateRiskAssessmentRequest,
} from '@/app/types/risk-assessment-automation';
import { createClient } from '@/app/utils/supabase/server';

export class RiskAssessmentService {
  private async getSupabase() {
    return await createClient();
  }

  /**
   * Risk Assessment Engine
   */

  // Calculate comprehensive risk score
  calculateRiskScore(
    factors: Partial<RiskFactors>,
    context: Partial<AssessmentContext>
  ): number {
    let totalScore = 0;
    let _factorCount = 0;

    // Medical risk scoring (weight: 0.4)
    if (factors.medical) {
      let medicalScore = 0;
      if (factors.medical.chronic_conditions?.length) {
        medicalScore += Math.min(
          factors.medical.chronic_conditions.length * 10,
          40
        );
      }
      if (factors.medical.allergies?.length) {
        medicalScore += Math.min(factors.medical.allergies.length * 5, 20);
      }
      if (factors.medical.contraindications?.length) {
        medicalScore += Math.min(
          factors.medical.contraindications.length * 15,
          50
        );
      }
      if (factors.medical.previous_complications?.length) {
        medicalScore += Math.min(
          factors.medical.previous_complications.length * 8,
          30
        );
      }
      totalScore += Math.min(medicalScore, 100) * 0.4;
      _factorCount++;
    }

    // Procedural risk scoring (weight: 0.3)
    if (factors.procedural) {
      let proceduralScore = 0;
      if (factors.procedural.procedure_complexity) {
        proceduralScore += factors.procedural.procedure_complexity * 8;
      }
      if (factors.procedural.anesthesia_risk) {
        proceduralScore += factors.procedural.anesthesia_risk * 10;
      }
      if (factors.procedural.equipment_factors?.length) {
        proceduralScore += Math.min(
          factors.procedural.equipment_factors.length * 5,
          25
        );
      }
      if (factors.procedural.technique_risks?.length) {
        proceduralScore += Math.min(
          factors.procedural.technique_risks.length * 7,
          35
        );
      }
      totalScore += Math.min(proceduralScore, 100) * 0.3;
      _factorCount++;
    }

    // Patient-specific risk scoring (weight: 0.2)
    if (factors.patient_specific) {
      let patientScore = 0;
      if (factors.patient_specific.age_factor) {
        patientScore += factors.patient_specific.age_factor * 6;
      }
      if (factors.patient_specific.bmi_factor) {
        patientScore += factors.patient_specific.bmi_factor * 5;
      }
      if (factors.patient_specific.smoking_status) {
        patientScore += 15;
      }
      if (factors.patient_specific.pregnancy_status) {
        patientScore += 20;
      }
      if (factors.patient_specific.mobility_limitations?.length) {
        patientScore += Math.min(
          factors.patient_specific.mobility_limitations.length * 8,
          25
        );
      }
      totalScore += Math.min(patientScore, 100) * 0.2;
      _factorCount++;
    }

    // Environmental risk scoring (weight: 0.1)
    if (factors.environmental) {
      let environmentalScore = 0;
      if (factors.environmental.staff_experience) {
        environmentalScore += (10 - factors.environmental.staff_experience) * 8;
      }
      if (factors.environmental.emergency_preparedness) {
        environmentalScore +=
          (10 - factors.environmental.emergency_preparedness) * 10;
      }
      if (factors.environmental.equipment_status?.length) {
        environmentalScore += Math.min(
          factors.environmental.equipment_status.length * 10,
          30
        );
      }
      totalScore += Math.min(environmentalScore, 100) * 0.1;
      _factorCount++;
    }

    // Context adjustments
    if (context.emergency_type) {
      totalScore *= 1.3; // Emergency situations increase risk
    }
    if (context.procedure_id && context.treatment_type) {
      totalScore *= 1.1; // Active procedures increase risk
    }

    return Math.min(Math.round(totalScore), 100);
  }

  // Determine risk level from score
  determineRiskLevel(score: number): RiskLevel {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 30) return 'moderate';
    return 'low';
  }

  // Generate risk categories breakdown
  generateRiskCategories(factors: Partial<RiskFactors>): RiskCategories {
    const categories: RiskCategories = {
      medical: { score: 0, factors: [], severity: 'low' },
      procedural: { score: 0, factors: [], severity: 'low' },
      patient_specific: { score: 0, factors: [], severity: 'low' },
      environmental: { score: 0, factors: [], severity: 'low' },
    };

    // Medical category
    if (factors.medical) {
      let score = 0;
      const medicalFactors: string[] = [];

      if (factors.medical.chronic_conditions?.length) {
        score += factors.medical.chronic_conditions.length * 10;
        medicalFactors.push(
          `${factors.medical.chronic_conditions.length} chronic conditions`
        );
      }
      if (factors.medical.allergies?.length) {
        score += factors.medical.allergies.length * 5;
        medicalFactors.push(`${factors.medical.allergies.length} allergies`);
      }
      if (factors.medical.contraindications?.length) {
        score += factors.medical.contraindications.length * 15;
        medicalFactors.push(
          `${factors.medical.contraindications.length} contraindications`
        );
      }

      categories.medical = {
        score: Math.min(score, 100),
        factors: medicalFactors,
        severity: this.determineRiskLevel(score),
      };
    }

    return categories;
  }

  // Check if validation is required
  requiresValidation(assessment: Partial<RiskAssessment>): boolean {
    return (
      assessment.risk_level === 'critical' ||
      assessment.risk_level === 'high' ||
      (assessment.risk_score && assessment.risk_score > 70) ||
      assessment.assessment_type === 'emergency'
    );
  }

  /**
   * CRUD Operations for Risk Assessments
   */

  async createRiskAssessment(
    data: CreateRiskAssessmentRequest
  ): Promise<RiskAssessment> {
    const supabase = await this.getSupabase();
    const riskScore = this.calculateRiskScore(
      data.risk_factors || {},
      data.assessment_context || {}
    );
    const riskLevel = this.determineRiskLevel(riskScore);
    const riskCategories = this.generateRiskCategories(data.risk_factors || {});

    const assessmentData = {
      patient_id: data.patient_id,
      risk_factors: data.risk_factors || {},
      risk_score: riskScore,
      risk_level: riskLevel,
      risk_categories: riskCategories,
      assessment_type: data.assessment_type,
      assessment_method: data.assessment_method || 'automated',
      assessment_context: data.assessment_context || {},
      medical_history_factors: data.medical_history_factors || {},
      current_conditions: data.current_conditions || {},
      contraindications: {},
      risk_multipliers: {},
      assessment_date: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      validation_status: 'pending' as const,
      validation_required: this.requiresValidation({
        risk_level: riskLevel,
        risk_score: riskScore,
        assessment_type: data.assessment_type,
      }),
    };

    const { data: assessment, error } = await supabase
      .from('risk_assessments')
      .insert(assessmentData)
      .select()
      .single();

    if (error)
      throw new Error(`Failed to create risk assessment: ${error.message}`);

    // Generate automatic alerts if high risk
    if (riskLevel === 'critical' || riskLevel === 'high') {
      await this.createAlert({
        patient_id: data.patient_id,
        assessment_id: assessment.id,
        alert_type: riskLevel === 'critical' ? 'immediate' : 'warning',
        risk_category: 'medical',
        severity_level: riskLevel === 'critical' ? 'critical' : 'high',
        alert_title: `${riskLevel.toUpperCase()} Risk Assessment Alert`,
        alert_message: `Patient has been assessed with ${riskLevel} risk (score: ${riskScore}). Medical validation required.`,
        alert_details: {
          risk_score: riskScore,
          risk_categories: riskCategories,
        },
        recommended_actions: {
          immediate:
            riskLevel === 'critical'
              ? ['Immediate medical review', 'Emergency protocols']
              : ['Medical review', 'Risk mitigation planning'],
        },
      });
    }

    return assessment;
  }

  async getRiskAssessment(id: string): Promise<RiskAssessment | null> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('risk_assessments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  async getAllRiskAssessments(
    filters: Record<string, any> = {},
    limit = 50,
    offset = 0
  ): Promise<RiskAssessment[]> {
    const supabase = await this.getSupabase();
    let query = supabase
      .from('risk_assessments')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        query = query.eq(key, value);
      }
    });

    const { data, error } = await query;

    if (error)
      throw new Error(`Failed to fetch risk assessments: ${error.message}`);
    return data || [];
  }

  async createAlert(data: CreateAlertRequest): Promise<RiskAlert> {
    const supabase = await this.getSupabase();
    const alertData = {
      ...data,
      alert_details: data.alert_details || {},
      recommended_actions: data.recommended_actions || {},
      alert_status: 'active' as const,
      escalation_level: 0,
      escalation_path: {},
      emergency_protocol_triggered: false,
    };

    const { data: alert, error } = await supabase
      .from('risk_alerts')
      .insert(alertData)
      .select()
      .single();

    if (error) throw new Error(`Failed to create alert: ${error.message}`);
    return alert;
  }

  async getAllValidations(
    filters: Record<string, any> = {},
    limit = 50,
    offset = 0
  ): Promise<RiskValidation[]> {
    const supabase = await this.getSupabase();
    let query = supabase
      .from('risk_validations')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        query = query.eq(key, value);
      }
    });

    const { data, error } = await query;

    if (error) throw new Error(`Failed to fetch validations: ${error.message}`);
    return data || [];
  }

  async getAllAlerts(
    filters: Record<string, any> = {},
    limit = 50,
    offset = 0
  ): Promise<RiskAlert[]> {
    const supabase = await this.getSupabase();
    let query = supabase
      .from('risk_alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        query = query.eq(key, value);
      }
    });

    const { data, error } = await query;

    if (error) throw new Error(`Failed to fetch alerts: ${error.message}`);
    return data || [];
  }

  async updateRiskAssessment(
    id: string,
    updates: UpdateRiskAssessmentRequest
  ): Promise<RiskAssessment> {
    const supabase = await this.getSupabase();
    const updateData: any = { ...updates };

    // Recalculate risk if factors changed
    if (updates.risk_factors) {
      const currentAssessment = await this.getRiskAssessment(id);
      if (currentAssessment) {
        const newScore = this.calculateRiskScore(
          updates.risk_factors,
          currentAssessment.assessment_context
        );
        const newLevel = this.determineRiskLevel(newScore);
        updateData.risk_score = newScore;
        updateData.risk_level = newLevel;
        updateData.risk_categories = this.generateRiskCategories(
          updates.risk_factors
        );
        updateData.validation_required = this.requiresValidation({
          ...currentAssessment,
          risk_level: newLevel,
          risk_score: newScore,
        });
      }
    }

    updateData.last_updated = new Date().toISOString();

    const { data, error } = await supabase
      .from('risk_assessments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error)
      throw new Error(`Failed to update risk assessment: ${error.message}`);
    return data;
  }

  async deleteRiskAssessment(id: string): Promise<void> {
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from('risk_assessments')
      .delete()
      .eq('id', id);

    if (error)
      throw new Error(`Failed to delete risk assessment: ${error.message}`);
  }

  async getPatientRiskAssessments(
    patientId: string,
    limit = 10
  ): Promise<RiskAssessment[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('risk_assessments')
      .select('*')
      .eq('patient_id', patientId)
      .order('assessment_date', { ascending: false })
      .limit(limit);

    if (error)
      throw new Error(
        `Failed to get patient risk assessments: ${error.message}`
      );
    return data || [];
  }

  /**
   * Medical Validation Operations
   */

  async createValidation(
    data: CreateValidationRequest
  ): Promise<RiskValidation> {
    const supabase = await this.getSupabase();
    const validationData = {
      ...data,
      validation_date: new Date().toISOString(),
      validator_credentials: data.validator_credentials || {},
      requires_second_opinion: data.requires_second_opinion,
    };

    const { data: validation, error } = await supabase
      .from('risk_validations')
      .insert(validationData)
      .select()
      .single();

    if (error) throw new Error(`Failed to create validation: ${error.message}`);

    // Update assessment validation status
    await this.updateRiskAssessment(data.assessment_id, {
      validation_status:
        data.validation_decision === 'approved'
          ? 'validated'
          : data.validation_decision === 'rejected'
            ? 'rejected'
            : 'requires_review',
    });

    return validation;
  }

  async getValidationsForAssessment(
    assessmentId: string
  ): Promise<RiskValidation[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('risk_validations')
      .select('*')
      .eq('assessment_id', assessmentId)
      .order('validation_date', { ascending: false });

    if (error) throw new Error(`Failed to get validations: ${error.message}`);
    return data || [];
  }

  /**
   * Risk Mitigation Operations
   */

  async createMitigation(
    data: CreateMitigationRequest
  ): Promise<RiskMitigation> {
    const supabase = await this.getSupabase();
    const mitigationData = {
      ...data,
      mitigation_details: data.mitigation_details || {},
      implementation_status: 'planned' as const,
    };

    const { data: mitigation, error } = await supabase
      .from('risk_mitigations')
      .insert(mitigationData)
      .select()
      .single();

    if (error) throw new Error(`Failed to create mitigation: ${error.message}`);
    return mitigation;
  }

  async updateMitigationStatus(
    id: string,
    status: 'planned' | 'active' | 'completed' | 'cancelled'
  ): Promise<void> {
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from('risk_mitigations')
      .update({
        implementation_status: status,
        implementation_date:
          status === 'active' ? new Date().toISOString() : undefined,
      })
      .eq('id', id);

    if (error)
      throw new Error(`Failed to update mitigation status: ${error.message}`);
  }

  /**
   * Alert Management Operations
   */

  async acknowledgeAlert(id: string, userId: string): Promise<void> {
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from('risk_alerts')
      .update({
        alert_status: 'acknowledged',
        acknowledged_by: userId,
        acknowledged_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw new Error(`Failed to acknowledge alert: ${error.message}`);
  }

  async resolveAlert(
    id: string,
    userId: string,
    notes?: string
  ): Promise<void> {
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from('risk_alerts')
      .update({
        alert_status: 'resolved',
        resolved_by: userId,
        resolved_at: new Date().toISOString(),
        resolution_notes: notes,
      })
      .eq('id', id);

    if (error) throw new Error(`Failed to resolve alert: ${error.message}`);
  }

  async escalateAlert(id: string): Promise<void> {
    const supabase = await this.getSupabase();
    const { data: alert, error: fetchError } = await supabase
      .from('risk_alerts')
      .select('escalation_level')
      .eq('id', id)
      .single();

    if (fetchError)
      throw new Error(`Failed to fetch alert: ${fetchError.message}`);

    const newEscalationLevel = Math.min((alert.escalation_level || 0) + 1, 5);

    const { error } = await supabase
      .from('risk_alerts')
      .update({
        alert_status: 'escalated',
        escalation_level: newEscalationLevel,
      })
      .eq('id', id);

    if (error) throw new Error(`Failed to escalate alert: ${error.message}`);
  }

  async getActiveAlerts(limit = 50): Promise<RiskAlert[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('risk_alerts')
      .select('*')
      .eq('alert_status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to get active alerts: ${error.message}`);
    return data || [];
  }

  /**
   * Dashboard and Analytics
   */

  async getDashboardData(): Promise<RiskDashboardData> {
    const supabase = await this.getSupabase();

    // Get total assessments
    const { count: totalAssessments } = await supabase
      .from('risk_assessments')
      .select('*', { count: 'exact', head: true });

    // Get high risk patients
    const { count: highRiskPatients } = await supabase
      .from('risk_assessments')
      .select('*', { count: 'exact', head: true })
      .in('risk_level', ['high', 'critical']);

    // Get pending validations
    const { count: pendingValidations } = await supabase
      .from('risk_assessments')
      .select('*', { count: 'exact', head: true })
      .eq('validation_status', 'pending');

    // Get active alerts
    const { count: activeAlerts } = await supabase
      .from('risk_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('alert_status', 'active');

    // Get recent assessments
    const { data: recentAssessments } = await supabase
      .from('risk_assessments')
      .select('*')
      .order('assessment_date', { ascending: false })
      .limit(10);

    return {
      totalAssessments: totalAssessments || 0,
      highRiskPatients: highRiskPatients || 0,
      pendingValidations: pendingValidations || 0,
      activeAlerts: activeAlerts || 0,
      recentAssessments: recentAssessments || [],
      alertsByCategory: {
        medical: 0,
        procedural: 0,
        patient_specific: 0,
        environmental: 0,
      },
      riskTrends: [],
      validationMetrics: {
        totalValidations: 0,
        averageValidationTime: 0,
        validationAccuracy: 0,
      },
    };
  }

  /**
   * Risk Threshold Management
   */

  async getRiskThresholds(clinicId?: string): Promise<RiskThreshold[]> {
    const supabase = await this.getSupabase();
    let query = supabase
      .from('risk_thresholds')
      .select('*')
      .eq('is_active', true);

    if (clinicId) {
      query = query.or(`clinic_id.eq.${clinicId},clinic_id.is.null`);
    } else {
      query = query.is('clinic_id', null);
    }

    const { data, error } = await query.order('risk_category');

    if (error)
      throw new Error(`Failed to get risk thresholds: ${error.message}`);
    return data || [];
  }

  async updateRiskThreshold(
    id: string,
    updates: Partial<RiskThreshold>
  ): Promise<RiskThreshold> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('risk_thresholds')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error)
      throw new Error(`Failed to update risk threshold: ${error.message}`);
    return data;
  }
}
