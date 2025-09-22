/**
 * Aesthetic Analysis Service for Advanced Beauty Clinics (T101)
 * AI-powered skin analysis and aesthetic procedure recommendation system
 *
 * Features:
 * - Facial and skin condition analysis with AI
 * - Aesthetic procedure recommendations (botox, fillers, lasers, etc.)
 * - Contraindication assessment and risk analysis
 * - Treatment protocols and patient education
 * - LGPD-compliant data handling with audit trails
 * - Integration with Brazilian aesthetic clinic standards (ANVISA)
 *
 * @author AI IDE Agent
 * @version 3.0.0
 * @created 2025-09-16
 * @updated 2025-09-16 - Refactored for aesthetic procedures
 */

import { SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { logger } from '../lib/logger';
import { AuditService } from './audit-service';

// Aesthetic Analysis Types
export interface PatientAge {
  value: number;
  unit: 'year' | 'month';
}

export interface SkinAnalysisData {
  id: string;
  condition_id:
    | 'aging'
    | 'wrinkles'
    | 'pigmentation'
    | 'acne_scars'
    | 'volume_loss'
    | 'skin_texture'
    | 'hydration';
  severity: 'mild' | 'moderate' | 'severe';
  facial_area:
    | 'forehead'
    | 'periorbital'
    | 'nasolabial'
    | 'marionette'
    | 'lips'
    | 'cheeks'
    | 'jaw'
    | 'neck';
  confidence: 'high' | 'medium' | 'low';
}

export interface AestheticPatient {
  sex: 'male' | 'female';
  age: PatientAge;
  skin_type: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI'; // Fitzpatrick skin type
  analysis_data: SkinAnalysisData[];
  lifestyle_factors?: {
    sun_exposure: 'minimal' | 'moderate' | 'high';
    smoking: boolean;
    skincare_routine: 'basic' | 'moderate' | 'advanced';
    previous_procedures: string[];
  };
}

export interface AestheticAssessmentRequest extends AestheticPatient {
  assessment_type?: 'comprehensive' | 'targeted' | 'follow_up';
  max_recommendations?: number;
  include_contraindications?: boolean;
  focus_areas?: string[];
  budget_range?: 'basic' | 'moderate' | 'premium';
}

export interface AestheticProcedure {
  id: string;
  name: string;
  common_name: string;
  category:
    | 'neurotoxin'
    | 'filler'
    | 'laser'
    | 'peeling'
    | 'radiofrequency'
    | 'microneedling'
    | 'threads';
  effectiveness_score: number;
  safety_profile: 'minimal' | 'low' | 'moderate' | 'high';
  downtime: {
    duration: string;
    severity: 'none' | 'minimal' | 'moderate' | 'significant';
  };
  contraindications: string[];
  anvisa_approved: boolean;
  typical_results: {
    onset: string;
    duration: string;
    satisfaction_rate: number;
  };
}

export interface AestheticAssessmentResult {
  recommended_procedures: Array<{
    procedure: AestheticProcedure;
    priority: 'high' | 'medium' | 'low';
    rationale: string;
    estimated_cost_brl: {
      min: number;
      max: number;
    };
    sessions_required: number;
    expected_results: string;
  }>;
  contraindications: Array<{
    procedure_id: string;
    contraindication: string;
    severity: 'absolute' | 'relative';
    explanation: string;
  }>;
  educational_content: {
    pre_treatment: string[];
    post_treatment: string[];
    maintenance: string[];
  };
  follow_up_recommendations: {
    initial_follow_up: string;
    maintenance_schedule: string;
    red_flags: string[];
  };
}

export interface TreatmentProtocol {
  id: string;
  procedure_id: string;
  patient_profile: string;
  protocol_steps: Array<{
    step: number;
    action: string;
    product_details?: string;
    technique: string;
    precautions: string[];
  }>;
  recovery_timeline: Array<{
    timeframe: string;
    expected_symptoms: string[];
    care_instructions: string[];
    warning_signs: string[];
  }>;
}

// Audit interfaces for LGPD compliance
export interface AestheticAuditRecord {
  session_id: string;
  patient_id: string;
  professional_id: string;
  clinic_id: string;
  assessment_type: string;
  timestamp: Date;
  input_data: Partial<AestheticAssessmentRequest>;
  output_data: Partial<AestheticAssessmentResult>;
  ai_confidence_scores: Record<string, number>;
  data_processing_consent: boolean;
  purpose_limitation: string[];
  retention_period: string;
}

export interface PatientConsentRecord {
  patient_id: string;
  consent_version: string;
  granted_permissions: string[];
  data_categories: string[];
  processing_purposes: string[];
  consent_timestamp: Date;
  withdrawal_right_explained: boolean;
  retention_policy_accepted: boolean;
}

/**
 * Aesthetic Analysis Service
 * Provides AI-powered skin analysis and aesthetic procedure recommendations
 */
export class AestheticAnalysisService {
  private supabase: SupabaseClient;
  private auditService: AuditService;

  // Brazilian aesthetic clinic API endpoints (mock endpoints for this example)
  private readonly SKIN_ANALYSIS_API = 'https://api.aesthetic-ai.com.br/v1/skin-analysis';
  private readonly PROCEDURE_DATABASE_API = 'https://api.aesthetic-ai.com.br/v1/procedures';
  private readonly CONTRAINDICATION_API = 'https://api.aesthetic-ai.com.br/v1/contraindications';

  constructor(supabase: SupabaseClient, auditService: AuditService) {
    this.supabase = supabase;
    this.auditService = auditService;
  }

  /**
   * Perform comprehensive aesthetic assessment
   * Analyzes patient skin condition and recommends appropriate procedures
   */
  async performAestheticAssessment(
    _request: AestheticAssessmentRequest,
    patientId: string,
    professionalId: string,
    clinicId: string,
  ): Promise<AestheticAssessmentResult> {
    const sessionId = this.generateSessionId();

    try {
      // Validate LGPD consent
      await this.validatePatientConsent(patientId, [
        'skin_analysis',
        'procedure_recommendation',
      ]);

      // Log assessment start
      logger.info('Starting aesthetic assessment', {
        sessionId,
        patientId,
        assessmentType: request.assessment_type,
      });

      // Perform skin analysis using AI
      const skinAnalysis = await this.analyzeSkinConditions(request);

      // Get procedure recommendations based on analysis
      const procedureRecommendations = await this.generateProcedureRecommendations(
        request,
        skinAnalysis,
      );

      // Check contraindications
      const contraindications = await this.assessContraindications(
        request,
        procedureRecommendations,
      );

      // Generate educational content
      const educationalContent = await this.generateEducationalContent(
        procedureRecommendations,
        request.skin_type,
      );

      // Create follow-up recommendations
      const followUpRecommendations = this.generateFollowUpRecommendations(
        procedureRecommendations,
        request.age,
      );

      const result: AestheticAssessmentResult = {
        recommended_procedures: procedureRecommendations,
        contraindications,
        educational_content: educationalContent,
        follow_up_recommendations: followUpRecommendations,
      };

      // Create audit record for LGPD compliance
      await this.createAuditRecord({
        session_id: sessionId,
        patient_id: patientId,
        professional_id: professionalId,
        clinic_id: clinicId,
        assessment_type: request.assessment_type || 'comprehensive',
        timestamp: new Date(),
        input_data: this.sanitizeInputForAudit(request),
        output_data: this.sanitizeOutputForAudit(result),
        ai_confidence_scores: this.extractConfidenceScores(result),
        data_processing_consent: true,
        purpose_limitation: [
          'aesthetic_assessment',
          'procedure_recommendation',
        ],
        retention_period: '5_years',
      });

      logger.info('Aesthetic assessment completed successfully', {
        sessionId,
        recommendationCount: result.recommended_procedures.length,
      });

      return result;
    } catch (error) {
      logger.error('Aesthetic assessment failed', {
        sessionId,
        error: error.message,
      });

      // Log error for audit
      await this.auditService.logError({
        session_id: sessionId,
        patient_id: patientId,
        error_type: 'assessment_failure',
        error_message: error.message,
        timestamp: new Date(),
      });

      throw error;
    }
  }

  /**
   * Analyze skin conditions using AI algorithms
   */
  private async analyzeSkinConditions(
    _request: AestheticAssessmentRequest,
  ): Promise<SkinAnalysisData[]> {
    // Mock AI skin analysis - in production, would integrate with actual AI service
    const mockAnalysis: SkinAnalysisData[] = [
      {
        id: 'wrinkles_001',
        condition_id: 'wrinkles',
        severity: 'moderate',
        facial_area: 'periorbital',
        confidence: 'high',
      },
      {
        id: 'volume_loss_001',
        condition_id: 'volume_loss',
        severity: 'mild',
        facial_area: 'cheeks',
        confidence: 'medium',
      },
    ];

    // Add age-related adjustments
    if (request.age.value > 40) {
      mockAnalysis.push({
        id: 'aging_001',
        condition_id: 'aging',
        severity: request.age.value > 50 ? 'moderate' : 'mild',
        facial_area: 'forehead',
        confidence: 'high',
      });
    }

    return mockAnalysis;
  }

  /**
   * Generate procedure recommendations based on skin analysis
   */
  private async generateProcedureRecommendations(
    _request: AestheticAssessmentRequest,
    skinAnalysis: SkinAnalysisData[],
  ): Promise<AestheticAssessmentResult['recommended_procedures']> {
    const recommendations: AestheticAssessmentResult['recommended_procedures'] = [];

    // Process each identified condition
    for (const condition of skinAnalysis) {
      const procedures = await this.getProceduresForCondition(condition);

      for (const procedure of procedures) {
        recommendations.push({
          procedure,
          priority: this.calculatePriority(condition, _request),
          rationale: this.generateRationale(condition, procedure),
          estimated_cost_brl: this.estimateCostBRL(
            procedure,
            condition.severity,
          ),
          sessions_required: this.calculateSessionsRequired(
            procedure,
            condition.severity,
          ),
          expected_results: this.generateExpectedResults(procedure, condition),
        });
      }
    }

    // Sort by priority and limit results
    return recommendations
      .sort((a,_b) => this.priorityToNumber(a.priority) - this.priorityToNumber(b.priority),
      )
      .slice(0, request.max_recommendations || 5);
  }

  /**
   * Assess contraindications for recommended procedures
   */
  private async assessContraindications(
    _request: AestheticAssessmentRequest,
    procedures: AestheticAssessmentResult['recommended_procedures'],
  ): Promise<AestheticAssessmentResult['contraindications']> {
    const contraindications: AestheticAssessmentResult['contraindications'] = [];

    for (const recommendation of procedures) {
      // Check age-related contraindications
      if (request.age.value < 18) {
        contraindications.push({
          procedure_id: recommendation.procedure.id,
          contraindication: 'patient_under_18',
          severity: 'absolute',
          explanation:
            'Procedimentos estéticos não são recomendados para menores de 18 anos conforme regulamentação ANVISA',
        });
      }

      // Check pregnancy/breastfeeding (would be in patient history)
      if (
        request.lifestyle_factors?.smoking
        && recommendation.procedure.category === 'laser'
      ) {
        contraindications.push({
          procedure_id: recommendation.procedure.id,
          contraindication: 'smoking_laser_therapy',
          severity: 'relative',
          explanation:
            'Tabagismo pode afetar cicatrização e resultados de tratamentos a laser. Recomenda-se cessação antes do procedimento.',
        });
      }

      // Check skin type contraindications
      if (
        this.isSkinTypeContraindicated(
          request.skin_type,
          recommendation.procedure,
        )
      ) {
        contraindications.push({
          procedure_id: recommendation.procedure.id,
          contraindication: 'skin_type_incompatible',
          severity: 'relative',
          explanation:
            `Fototipo ${request.skin_type} requer cuidados especiais para este procedimento. Avaliação detalhada necessária.`,
        });
      }
    }

    return contraindications;
  }

  /**
   * Generate educational content for patient
   */
  private async generateEducationalContent(
    procedures: AestheticAssessmentResult['recommended_procedures'],
    skinType: string,
  ): Promise<AestheticAssessmentResult['educational_content']> {
    // Generate educational content based on procedures and skin type
    const content = procedures.map(procedure => ({
      title: `Understanding ${procedure.name}`,
      description:
        `Educational content for ${procedure.name} treatment suitable for ${skinType} skin type`,
      risks: procedure.contraindications || [],
      benefits: [`Improves ${procedure.target_area}`, 'Professional treatment'],
      aftercare: [
        'Follow post-treatment instructions',
        'Avoid sun exposure',
        'Use recommended skincare',
      ],
    }));

    return content;
    return {
      pre_treatment: [
        'Evitar exposição solar direta 2 semanas antes do procedimento',
        'Suspender medicamentos fotossensibilizantes se prescritos',
        'Manter pele hidratada e limpa',
        'Não realizar esfoliação 1 semana antes',
      ],
      post_treatment: [
        'Aplicar protetor solar FPS 50+ diariamente',
        'Evitar exercícios intensos nas primeiras 24-48h',
        'Não massagear área tratada por 2 semanas',
        'Hidratar pele conforme orientação profissional',
      ],
      maintenance: [
        'Retornos conforme cronograma estabelecido',
        'Cuidados domiciliares personalizados',
        'Proteção solar contínua',
        'Avaliação anual para manutenção de resultados',
      ],
    };
  }

  /**
   * Generate follow-up recommendations
   */
  private generateFollowUpRecommendations(
    procedures: AestheticAssessmentResult['recommended_procedures'],
    age: PatientAge,
  ): AestheticAssessmentResult['follow_up_recommendations'] {
    return {
      initial_follow_up: '7-14 dias após procedimento inicial',
      maintenance_schedule: age.value > 40 ? 'Avaliação trimestral' : 'Avaliação semestral',
      red_flags: [
        'Dor intensa ou persistente',
        'Sinais de infecção (vermelhidão, calor, secreção)',
        'Assimetria significativa',
        'Reações alérgicas (urticária, inchaço excessivo)',
      ],
    };
  }

  // Helper methods for business logic
  private getProceduresForCondition(
    condition: SkinAnalysisData,
  ): Promise<AestheticProcedure[]> {
    // Mock procedure database - in production would query actual database
    const mockProcedures: AestheticProcedure[] = [
      {
        id: 'botox_001',
        name: 'Toxina Botulínica Tipo A',
        common_name: 'Botox',
        category: 'neurotoxin',
        effectiveness_score: 0.92,
        safety_profile: 'minimal',
        downtime: { duration: '0-2 dias', severity: 'minimal' },
        contraindications: [
          'pregnancy',
          'breastfeeding',
          'neuromuscular_disorders',
        ],
        anvisa_approved: true,
        typical_results: {
          onset: '3-7 dias',
          duration: '4-6 meses',
          satisfaction_rate: 0.89,
        },
      },
    ];

    return Promise.resolve(
      mockProcedures.filter(
        p =>
          (condition.condition_id === 'wrinkles'
            && p.category === 'neurotoxin')
          || (condition.condition_id === 'volume_loss' && p.category === 'filler'),
      ),
    );
  }

  private calculatePriority(
    condition: SkinAnalysisData,
    _request: AestheticAssessmentRequest,
  ): 'high' | 'medium' | 'low' {
    // Calculate severity based on condition and patient request context
    const patientAge = request.patient_data?.age || 25;
    const hasAllergies = request.patient_data?.allergies?.length > 0;

    if (condition.severity_score > 0.8 || hasAllergies || patientAge > 65) {
      return 'high';
    } else if (condition.severity_score > 0.5 || patientAge > 45) {
      return 'medium';
    }
    return 'low';
    if (condition.severity === 'severe' || condition.confidence === 'high') {
      return 'high';
    }
    if (condition.severity === 'moderate') {
      return 'medium';
    }
    return 'low';
  }

  private generateRationale(
    condition: SkinAnalysisData,
    procedure: AestheticProcedure,
  ): string {
    return `Baseado na análise de ${condition.condition_id} com severidade ${condition.severity} na área ${condition.facial_area}, ${procedure.common_name} apresenta alta efetividade (${
      procedure.effectiveness_score * 100
    }%) para este caso específico.`;
  }

  private estimateCostBRL(
    procedure: AestheticProcedure,
    severity: string,
  ): { min: number; max: number } {
    // Mock pricing - in production would integrate with clinic pricing system
    const basePrices = {
      neurotoxin: { min: 800, max: 1500 },
      filler: { min: 1200, max: 2500 },
      laser: { min: 400, max: 800 },
      peeling: { min: 300, max: 600 },
    };

    const basePrice = basePrices[procedure.category] || { min: 500, max: 1000 };
    const multiplier = severity === 'severe' ? 1.5 : severity === 'moderate' ? 1.2 : 1.0;

    return {
      min: Math.round(basePrice.min * multiplier),
      max: Math.round(basePrice.max * multiplier),
    };
  }

  private calculateSessionsRequired(
    procedure: AestheticProcedure,
    severity: string,
  ): number {
    const baseSessions = {
      neurotoxin: 1,
      filler: 1,
      laser: 3,
      peeling: 4,
    };

    const base = baseSessions[procedure.category] || 1;
    return severity === 'severe' ? base + 1 : base;
  }

  private generateExpectedResults(
    procedure: AestheticProcedure,
    condition: SkinAnalysisData,
  ): string {
    return `Melhora significativa em ${condition.condition_id} esperada em ${procedure.typical_results.onset}. Resultados mantidos por ${procedure.typical_results.duration}. Taxa de satisfação: ${
      procedure.typical_results.satisfaction_rate * 100
    }%.`;
  }

  private priorityToNumber(priority: 'high' | 'medium' | 'low'): number {
    return { high: 1, medium: 2, low: 3 }[priority];
  }

  private isSkinTypeContraindicated(
    skinType: string,
    procedure: AestheticProcedure,
  ): boolean {
    // Darker skin types (V, VI) have higher risks with certain laser procedures
    return (
      (skinType === 'V' || skinType === 'VI') && procedure.category === 'laser'
    );
  }

  // LGPD Compliance Methods
  private async validatePatientConsent(
    patientId: string,
    requiredPermissions: string[],
  ): Promise<void> {
    const { data: consent } = await this.supabase
      .from('patient_consents')
      .select('granted_permissions')
      .eq('patient_id', patientId)
      .eq('is_active', true)
      .single();

    if (!consent) {
      throw new Error('LGPD_CONSENT_REQUIRED');
    }

    const granted = Array.isArray(consent.granted_permissions)
      ? consent.granted_permissions
      : [];
    const hasAllPermissions = requiredPermissions.every(permission => granted.includes(permission));

    if (!hasAllPermissions) {
      throw new Error('LGPD_INSUFFICIENT_CONSENT');
    }
  }

  private async createAuditRecord(record: AestheticAuditRecord): Promise<void> {
    await this.supabase.from('aesthetic_audit_logs').insert({
      session_id: record.session_id,
      patient_id: record.patient_id,
      professional_id: record.professional_id,
      clinic_id: record.clinic_id,
      assessment_type: record.assessment_type,
      timestamp: record.timestamp.toISOString(),
      input_data_hash: this.hashSensitiveData(record.input_data),
      output_data_hash: this.hashSensitiveData(record.output_data),
      ai_confidence_scores: record.ai_confidence_scores,
      data_processing_consent: record.data_processing_consent,
      purpose_limitation: record.purpose_limitation,
      retention_period: record.retention_period,
    });
  }

  private sanitizeInputForAudit(
    _request: AestheticAssessmentRequest,
  ): Partial<AestheticAssessmentRequest> {
    // Remove sensitive data, keep only relevant metadata for audit
    return {
      assessment_type: request.assessment_type,
      skin_type: request.skin_type,
      max_recommendations: request.max_recommendations,
      focus_areas: request.focus_areas,
    };
  }

  private sanitizeOutputForAudit(
    result: AestheticAssessmentResult,
  ): Partial<AestheticAssessmentResult> {
    // Keep only procedure IDs and recommendation counts for audit
    return {
      recommended_procedures: result.recommended_procedures.map(r => ({
        procedure: { id: r.procedure.id, category: r.procedure.category },
        priority: r.priority,
      })) as any,
      contraindications: result.contraindications.map(c => ({
        procedure_id: c.procedure_id,
        severity: c.severity,
      })) as any,
    };
  }

  private extractConfidenceScores(
    result: AestheticAssessmentResult,
  ): Record<string, number> {
    return result.recommended_procedures.reduce((acc,_recommendation) => {
        acc[recommendation.procedure.id] = recommendation.procedure.effectiveness_score;
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  private hashSensitiveData(data: any): string {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }

  private generateSessionId(): string {
    return crypto.randomUUID();
  }

  /**
   * Get treatment protocols for specific procedures
   */
  async getTreatmentProtocol(
    procedureId: string,
    patientProfile: string,
  ): Promise<TreatmentProtocol | null> {
    // Mock protocol - in production would query protocol database
    const mockProtocol: TreatmentProtocol = {
      id: `protocol_${procedureId}_${patientProfile}`,
      procedure_id: procedureId,
      patient_profile: patientProfile,
      protocol_steps: [
        {
          step: 1,
          action: 'Limpeza e assepsia da área',
          technique: 'Solução antisséptica + gaze estéril',
          precautions: ['Verificar alergias', 'Técnica asséptica rigorosa'],
        },
        {
          step: 2,
          action: 'Marcação dos pontos de aplicação',
          technique: 'Lápis dermográfico + análise anatômica',
          precautions: ['Respeitar anatomia facial', 'Pontos de segurança'],
        },
      ],
      recovery_timeline: [
        {
          timeframe: '0-24h',
          expected_symptoms: ['Leve vermelhidão', 'Edema mínimo'],
          care_instructions: ['Aplicar gelo 10min 3x/dia', 'Evitar maquiagem'],
          warning_signs: ['Dor intensa', 'Edema excessivo'],
        },
      ],
    };

    return mockProtocol;
  }

  /**
   * Enable patient access to their aesthetic assessment data (LGPD Right of Access)
   */
  async getPatientAestheticData(patientId: string): Promise<{
    assessments: any[];
    consent_history: any[];
    data_usage: any[];
  }> {
    const { data: assessments } = await this.supabase
      .from('aesthetic_audit_logs')
      .select('*')
      .eq('patient_id', patientId)
      .order('timestamp', { ascending: false });

    const { data: consents } = await this.supabase
      .from('patient_consents')
      .select('*')
      .eq('patient_id', patientId)
      .order('consent_timestamp', { ascending: false });

    return {
      assessments: assessments || [],
      consent_history: consents || [],
      data_usage: [], // Would include data usage logs
    };
  }
}
