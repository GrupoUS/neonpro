import { SupabaseClient } from '@neonpro/database';
import {
  TreatmentAssessment,
  TreatmentAssessmentTemplate,
  TreatmentDocument,
  TreatmentOutcome,
  TreatmentPlan,
  TreatmentProcedure,
  TreatmentProgressTracking,
  TreatmentRecommendation,
  TreatmentSession,
  // Comentando imports que não existem
  // TreatmentDocumentationTemplate,
  // CreateTreatmentPlanInput,
  // UpdateTreatmentPlanInput,
  // CreateTreatmentSessionInput,
  // UpdateTreatmentSessionInput,
  // CreateTreatmentProcedureInput,
  // CreateTreatmentAssessmentInput,
  // CreateTreatmentProgressInput,
  // CreateTreatmentRecommendationInput,
  // CreateTreatmentDocumentInput,
  // CreateTreatmentOutcomeInput,
  // TreatmentPlanStats,
  // TreatmentSessionStats,
  // TreatmentProgressSummary
} from '@neonpro/types';

// Input interfaces for treatment planning operations
export interface CreateTreatmentPlanInput {
  clinic_id: string;
  patient_id: string;
  professional_id: string;
  plan_name: string;
  description?: string;
  treatment_goals?: string[];
  priority_level?: 'low' | 'medium' | 'high' | 'urgent';
  estimated_duration_interval?: string;
  estimated_sessions?: number;
  total_estimated_cost?: number;
  start_date?: string;
  target_completion_date?: string;
  contraindications?: string[];
  precautions?: string[];
  patient_preferences?: Record<string, any>;
  professional_notes?: string;
  metadata?: Record<string, any>;
}

export interface UpdateTreatmentPlanInput {
  plan_name?: string;
  description?: string;
  treatment_goals?: string[];
  priority_level?: 'low' | 'medium' | 'high' | 'urgent';
  estimated_duration_interval?: string;
  estimated_sessions?: number;
  total_estimated_cost?: number;
  start_date?: string;
  target_completion_date?: string;
  contraindications?: string[];
  precautions?: string[];
  patient_preferences?: Record<string, any>;
  professional_notes?: string;
  status?: 'draft' | 'active' | 'completed' | 'paused' | 'cancelled';
  progress_percentage?: number;
  actual_completion_date?: string;
  metadata?: Record<string, any>;
}

export interface CreateTreatmentSessionInput {
  treatment_plan_id: string;
  session_number: number;
  session_name: string;
  description?: string;
  scheduled_date: string;
  duration_minutes: number;
  professional_id: string;
  room_id?: string;
  products_used?: string[];
  procedures_performed?: string[];
  before_photos?: string[];
  after_photos?: string[];
  measurements_before?: Record<string, any>;
  measurements_after?: Record<string, any>;
  follow_up_required?: boolean;
  follow_up_date?: string;
}

export interface UpdateTreatmentSessionInput {
  session_name?: string;
  description?: string;
  scheduled_date?: string;
  duration_minutes?: number;
  professional_id?: string;
  room_id?: string;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
  products_used?: string[];
  procedures_performed?: string[];
  before_photos?: string[];
  after_photos?: string[];
  measurements_before?: Record<string, any>;
  measurements_after?: Record<string, any>;
  follow_up_required?: boolean;
  follow_up_date?: string;
  notes?: string;
}

export interface CreateTreatmentProcedureInput {
  treatment_plan_id: string;
  procedure_name: string;
  procedure_type: string;
  description?: string;
  target_areas?: string[];
  products_required?: string[];
  estimated_duration_minutes?: number;
  sessions_needed?: number;
  interval_between_sessions?: string;
  cost_per_session?: number;
  total_cost?: number;
  order_in_plan?: number;
}

export interface CreateTreatmentAssessmentInput {
  treatment_plan_id: string;
  session_id?: string;
  template_id?: string;
  assessor_id: string;
  assessment_data: Record<string, any>;
  notes?: string;
  recommendations?: string[];
}

export interface CreateTreatmentProgressInput {
  treatment_plan_id: string;
  session_id?: string;
  tracked_by: string;
  progress_type: string;
  progress_data: Record<string, any>;
  photos?: string[];
  measurements?: Record<string, any>;
  patient_reported_outcomes?: Record<string, any>;
  professional_observations?: string;
  satisfaction_rating?: number;
}

export interface CreateTreatmentRecommendationInput {
  treatment_plan_id: string;
  patient_id: string;
  recommendation_type: string;
  title: string;
  description: string;
  recommendation_data?: Record<string, any>;
  confidence_score?: number;
  source_type?: 'ai' | 'professional' | 'system';
}

export interface CreateTreatmentDocumentInput {
  treatment_plan_id: string;
  session_id?: string;
  template_id?: string;
  document_type: string;
  document_data: Record<string, any>;
  patient_signature_required?: boolean;
  version?: string;
  created_by: string;
}

export interface CreateTreatmentOutcomeInput {
  treatment_plan_id: string;
  session_id?: string;
  outcome_type: string;
  outcome_data: Record<string, any>;
  satisfaction_metrics?: Record<string, any>;
  before_after_comparison?: Record<string, any>;
  duration_of_effect?: string;
  complications_reported?: string[];
  patient_testimonials?: string;
  professional_evaluation?: string;
  follow_up_recommendations?: string[];
  created_by: string;
}

// Additional types for statistics and summaries
export interface TreatmentPlanStats {
  total: number;
  draft: number;
  active: number;
  completed: number;
  paused: number;
  cancelled: number;
}

export interface TreatmentSessionStats {
  total: number;
  scheduled: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  no_show: number;
  rescheduled: number;
}

export interface TreatmentProgressSummary {
  total_sessions: number;
  completed_sessions: number;
  upcoming_sessions: number;
  progress_records: number;
  assessments_completed: number;
  average_satisfaction_rating: number;
  next_session_date: string | null;
  last_progress_date: string | null;
}

export interface TreatmentDocumentationTemplate {
  id: string;
  name: string;
  description?: string;
  procedure_type: string;
  template_type: string;
  is_required: boolean;
  version: string;
  created_at: string;
  updated_at: string;
}

export class TreatmentPlanningService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  // Treatment Plan Management
  async createTreatmentPlan(input: CreateTreatmentPlanInput): Promise<TreatmentPlan> {
    const { data, error } = await this.supabase
      .from('treatment_plans')
      .insert({
        clinic_id: input.clinic_id,
        patient_id: input.patient_id,
        professional_id: input.professional_id,
        plan_name: input.plan_name,
        description: input.description,
        treatment_goals: input.treatment_goals || [],
        priority_level: input.priority_level || 'medium',
        estimated_duration_interval: input.estimated_duration_interval,
        estimated_sessions: input.estimated_sessions || 1,
        total_estimated_cost: input.total_estimated_cost,
        start_date: input.start_date,
        target_completion_date: input.target_completion_date,
        contraindications: input.contraindications || [],
        precautions: input.precautions || [],
        patient_preferences: input.patient_preferences || {},
        professional_notes: input.professional_notes,
        metadata: input.metadata || {},
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar plano de tratamento: ${error.message}`);
    }

    return data;
  }

  async getTreatmentPlanById(id: string): Promise<TreatmentPlan | null> {
    const { data, error } = await this.supabase
      .from('treatment_plans')
      .select(`
        *,
        patient:patients(name, email, phone),
        professional:professionals(name, professional_license, council_type),
        clinic:clinics(name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Erro ao buscar plano de tratamento: ${error.message}`);
    }

    return data;
  }

  async getTreatmentPlansByClinic(clinicId: string, filters?: {
    patientId?: string;
    professionalId?: string;
    status?: string;
    priorityLevel?: string;
    dateRange?: { start: Date; end: Date };
  }): Promise<TreatmentPlan[]> {
    let query = this.supabase
      .from('treatment_plans')
      .select(`
        *,
        patient:patients(name, email, phone),
        professional:professionals(name, professional_license, council_type)
      `)
      .eq('clinic_id', clinicId);

    if (filters?.patientId) {
      query = query.eq('patient_id', filters.patientId);
    }
    if (filters?.professionalId) {
      query = query.eq('professional_id', filters.professionalId);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.priorityLevel) {
      query = query.eq('priority_level', filters.priorityLevel);
    }
    if (filters?.dateRange) {
      query = query
        .gte('start_date', filters.dateRange.start.toISOString())
        .lte('start_date', filters.dateRange.end.toISOString());
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar planos de tratamento: ${error.message}`);
    }

    return data || [];
  }

  async updateTreatmentPlan(id: string, input: UpdateTreatmentPlanInput): Promise<TreatmentPlan> {
    const { data, error } = await this.supabase
      .from('treatment_plans')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar plano de tratamento: ${error.message}`);
    }

    return data;
  }

  async updateTreatmentPlanProgress(id: string, progressPercentage: number): Promise<void> {
    const status = progressPercentage >= 100
      ? 'completed'
      : progressPercentage > 0
      ? 'active'
      : 'draft';
    const actualCompletionDate = progressPercentage >= 100 ? new Date().toISOString() : null;

    await this.updateTreatmentPlan(id, {
      progress_percentage: progressPercentage,
      status,
      actual_completion_date: actualCompletionDate || undefined,
    });
  }

  // Treatment Session Management
  async createTreatmentSession(input: CreateTreatmentSessionInput): Promise<TreatmentSession> {
    const { data, error } = await this.supabase
      .from('treatment_sessions')
      .insert({
        treatment_plan_id: input.treatment_plan_id,
        session_number: input.session_number,
        session_name: input.session_name,
        description: input.description,
        scheduled_date: input.scheduled_date,
        duration_minutes: input.duration_minutes,
        professional_id: input.professional_id,
        room_id: input.room_id,
        products_used: input.products_used || [],
        procedures_performed: input.procedures_performed || [],
        before_photos: input.before_photos || [],
        after_photos: input.after_photos || [],
        measurements_before: input.measurements_before || {},
        measurements_after: input.measurements_after || {},
        follow_up_required: input.follow_up_required || false,
        follow_up_date: input.follow_up_date,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar sessão de tratamento: ${error.message}`);
    }

    // Update treatment plan progress
    await this.updateTreatmentPlanProgressFromSessions(input.treatment_plan_id);

    return data;
  }

  async getTreatmentSessionsByPlan(treatmentPlanId: string): Promise<TreatmentSession[]> {
    const { data, error } = await this.supabase
      .from('treatment_sessions')
      .select(`
        *,
        professional:professionals(name, professional_license, council_type),
        room:rooms(name, room_type)
      `)
      .eq('treatment_plan_id', treatmentPlanId)
      .order('session_number', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar sessões de tratamento: ${error.message}`);
    }

    return data || [];
  }

  async updateTreatmentSession(
    id: string,
    input: UpdateTreatmentSessionInput,
  ): Promise<TreatmentSession> {
    const { data, error } = await this.supabase
      .from('treatment_sessions')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar sessão de tratamento: ${error.message}`);
    }

    // Update treatment plan progress
    await this.updateTreatmentPlanProgressFromSessions(data.treatment_plan_id);

    return data;
  }

  private async updateTreatmentPlanProgressFromSessions(treatmentPlanId: string): Promise<void> {
    const { data: sessions } = await this.supabase
      .from('treatment_sessions')
      .select('status')
      .eq('treatment_plan_id', treatmentPlanId);

    if (!sessions) return;

    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === 'completed').length;
    const progressPercentage = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    await this.updateTreatmentPlanProgress(treatmentPlanId, progressPercentage);
  }

  // Treatment Procedure Management
  async createTreatmentProcedure(
    input: CreateTreatmentProcedureInput,
  ): Promise<TreatmentProcedure> {
    const { data, error } = await this.supabase
      .from('treatment_procedures')
      .insert({
        treatment_plan_id: input.treatment_plan_id,
        procedure_name: input.procedure_name,
        procedure_type: input.procedure_type,
        description: input.description,
        target_areas: input.target_areas || [],
        products_required: input.products_required || [],
        estimated_duration_minutes: input.estimated_duration_minutes,
        sessions_needed: input.sessions_needed || 1,
        interval_between_sessions: input.interval_between_sessions || '4 weeks',
        cost_per_session: input.cost_per_session,
        total_cost: input.total_cost,
        order_in_plan: input.order_in_plan || 0,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar procedimento de tratamento: ${error.message}`);
    }

    return data;
  }

  async getTreatmentProceduresByPlan(treatmentPlanId: string): Promise<TreatmentProcedure[]> {
    const { data, error } = await this.supabase
      .from('treatment_procedures')
      .select('*')
      .eq('treatment_plan_id', treatmentPlanId)
      .order('order_in_plan', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar procedimentos de tratamento: ${error.message}`);
    }

    return data || [];
  }

  // Assessment Management
  async createTreatmentAssessment(
    input: CreateTreatmentAssessmentInput,
  ): Promise<TreatmentAssessment> {
    const { data, error } = await this.supabase
      .from('treatment_assessments')
      .insert({
        treatment_plan_id: input.treatment_plan_id,
        session_id: input.session_id,
        template_id: input.template_id,
        assessor_id: input.assessor_id,
        assessment_data: input.assessment_data,
        notes: input.notes,
        recommendations: input.recommendations || [],
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar avaliação de tratamento: ${error.message}`);
    }

    return data;
  }

  async getTreatmentAssessmentsByPlan(treatmentPlanId: string): Promise<TreatmentAssessment[]> {
    const { data, error } = await this.supabase
      .from('treatment_assessments')
      .select(`
        *,
        assessor:professionals(name, professional_license, council_type),
        template:treatment_assessment_templates(name, description)
      `)
      .eq('treatment_plan_id', treatmentPlanId)
      .order('assessment_date', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar avaliações de tratamento: ${error.message}`);
    }

    return data || [];
  }

  // Progress Tracking
  async createTreatmentProgress(
    input: CreateTreatmentProgressInput,
  ): Promise<TreatmentProgressTracking> {
    const { data, error } = await this.supabase
      .from('treatment_progress_tracking')
      .insert({
        treatment_plan_id: input.treatment_plan_id,
        session_id: input.session_id,
        tracked_by: input.tracked_by,
        progress_type: input.progress_type,
        progress_data: input.progress_data,
        photos: input.photos || [],
        measurements: input.measurements || {},
        patient_reported_outcomes: input.patient_reported_outcomes || {},
        professional_observations: input.professional_observations,
        satisfaction_rating: input.satisfaction_rating,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar registro de progresso: ${error.message}`);
    }

    return data;
  }

  async getTreatmentProgressByPlan(treatmentPlanId: string): Promise<TreatmentProgressTracking[]> {
    const { data, error } = await this.supabase
      .from('treatment_progress_tracking')
      .select(`
        *,
        tracked_by:professionals(name, professional_license, council_type)
      `)
      .eq('treatment_plan_id', treatmentPlanId)
      .order('tracking_date', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar registros de progresso: ${error.message}`);
    }

    return data || [];
  }

  // AI Recommendations
  async createTreatmentRecommendation(
    input: CreateTreatmentRecommendationInput,
  ): Promise<TreatmentRecommendation> {
    const { data, error } = await this.supabase
      .from('treatment_recommendations')
      .insert({
        treatment_plan_id: input.treatment_plan_id,
        patient_id: input.patient_id,
        recommendation_type: input.recommendation_type,
        title: input.title,
        description: input.description,
        recommendation_data: input.recommendation_data || {},
        confidence_score: input.confidence_score,
        source_type: input.source_type || 'ai',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar recomendação de tratamento: ${error.message}`);
    }

    return data;
  }

  async getTreatmentRecommendationsByPlan(
    treatmentPlanId: string,
  ): Promise<TreatmentRecommendation[]> {
    const { data, error } = await this.supabase
      .from('treatment_recommendations')
      .select('*')
      .eq('treatment_plan_id', treatmentPlanId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar recomendações de tratamento: ${error.message}`);
    }

    return data || [];
  }

  async acceptTreatmentRecommendation(id: string, acceptedBy: string): Promise<void> {
    const { error } = await this.supabase
      .from('treatment_recommendations')
      .update({
        is_accepted: true,
        accepted_by: acceptedBy,
        accepted_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao aceitar recomendação: ${error.message}`);
    }
  }

  async rejectTreatmentRecommendation(id: string, reason: string): Promise<void> {
    const { error } = await this.supabase
      .from('treatment_recommendations')
      .update({
        is_accepted: false,
        rejection_reason: reason,
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao rejeitar recomendação: ${error.message}`);
    }
  }

  // Document Management
  async createTreatmentDocument(input: CreateTreatmentDocumentInput): Promise<TreatmentDocument> {
    const { data, error } = await this.supabase
      .from('treatment_documents')
      .insert({
        treatment_plan_id: input.treatment_plan_id,
        session_id: input.session_id,
        template_id: input.template_id,
        document_type: input.document_type,
        document_data: input.document_data,
        patient_signature_required: input.patient_signature_required || false,
        version: input.version || '1.0',
        created_by: input.created_by,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar documento de tratamento: ${error.message}`);
    }

    return data;
  }

  async getTreatmentDocumentsByPlan(treatmentPlanId: string): Promise<TreatmentDocument[]> {
    const { data, error } = await this.supabase
      .from('treatment_documents')
      .select(`
        *,
        template:treatment_documentation_templates(name, description, template_type),
        signed_by:professionals(name, professional_license, council_type),
        created_by:professionals(name, professional_license, council_type)
      `)
      .eq('treatment_plan_id', treatmentPlanId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar documentos de tratamento: ${error.message}`);
    }

    return data || [];
  }

  // Treatment Outcomes
  async createTreatmentOutcome(input: CreateTreatmentOutcomeInput): Promise<TreatmentOutcome> {
    const { data, error } = await this.supabase
      .from('treatment_outcomes')
      .insert({
        treatment_plan_id: input.treatment_plan_id,
        session_id: input.session_id,
        outcome_type: input.outcome_type,
        outcome_data: input.outcome_data,
        satisfaction_metrics: input.satisfaction_metrics || {},
        before_after_comparison: input.before_after_comparison || {},
        duration_of_effect: input.duration_of_effect,
        complications_reported: input.complications_reported || [],
        patient_testimonials: input.patient_testimonials,
        professional_evaluation: input.professional_evaluation,
        follow_up_recommendations: input.follow_up_recommendations || [],
        created_by: input.created_by,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar registro de resultado: ${error.message}`);
    }

    return data;
  }

  // Assessment Templates
  async getAssessmentTemplates(
    filters?: { procedureType?: string; isActive?: boolean },
  ): Promise<TreatmentAssessmentTemplate[]> {
    let query = this.supabase
      .from('treatment_assessment_templates')
      .select('*');

    if (filters?.procedureType) {
      query = query.eq('procedure_type', filters.procedureType);
    }
    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    const { data, error } = await query.order('name', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar templates de avaliação: ${error.message}`);
    }

    return data || [];
  }

  // Documentation Templates
  async getDocumentationTemplates(
    filters?: { procedureType?: string; templateType?: string; isRequired?: boolean },
  ): Promise<TreatmentDocumentationTemplate[]> {
    let query = this.supabase
      .from('treatment_documentation_templates')
      .select('*');

    if (filters?.procedureType) {
      query = query.eq('procedure_type', filters.procedureType);
    }
    if (filters?.templateType) {
      query = query.eq('template_type', filters.templateType);
    }
    if (filters?.isRequired !== undefined) {
      query = query.eq('is_required', filters.isRequired);
    }

    const { data, error } = await query.order('name', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar templates de documentação: ${error.message}`);
    }

    return data || [];
  }

  // Statistics and Analytics
  async getTreatmentPlanStats(
    clinicId: string,
    dateRange?: { start: Date; end: Date },
  ): Promise<TreatmentPlanStats> {
    let query = this.supabase
      .from('treatment_plans')
      .select('status, count', { count: 'exact' })
      .eq('clinic_id', clinicId);

    if (dateRange) {
      query = query
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar estatísticas de planos: ${error.message}`);
    }

    const stats: TreatmentPlanStats = {
      total: 0,
      draft: 0,
      active: 0,
      completed: 0,
      paused: 0,
      cancelled: 0,
    };

    data?.forEach(item => {
      stats.total += item.count || 0;
      if (item.status === 'draft') stats.draft = item.count || 0;
      if (item.status === 'active') stats.active = item.count || 0;
      if (item.status === 'completed') stats.completed = item.count || 0;
      if (item.status === 'paused') stats.paused = item.count || 0;
      if (item.status === 'cancelled') stats.cancelled = item.count || 0;
    });

    return stats;
  }

  async getTreatmentSessionStats(
    clinicId: string,
    dateRange?: { start: Date; end: Date },
  ): Promise<TreatmentSessionStats> {
    let query = this.supabase
      .from('treatment_sessions')
      .select('status, count', { count: 'exact' })
      .eq('clinic_id', clinicId);

    if (dateRange) {
      query = query
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar estatísticas de sessões: ${error.message}`);
    }

    const stats: TreatmentSessionStats = {
      total: 0,
      scheduled: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      no_show: 0,
      rescheduled: 0,
    };

    data?.forEach(item => {
      stats.total += item.count || 0;
      if (item.status === 'scheduled') stats.scheduled = item.count || 0;
      if (item.status === 'in_progress') stats.in_progress = item.count || 0;
      if (item.status === 'completed') stats.completed = item.count || 0;
      if (item.status === 'cancelled') stats.cancelled = item.count || 0;
      if (item.status === 'no_show') stats.no_show = item.count || 0;
      if (item.status === 'rescheduled') stats.rescheduled = item.count || 0;
    });

    return stats;
  }

  async getTreatmentProgressSummary(treatmentPlanId: string): Promise<TreatmentProgressSummary> {
    const [sessions, progress, assessments] = await Promise.all([
      this.getTreatmentSessionsByPlan(treatmentPlanId),
      this.getTreatmentProgressByPlan(treatmentPlanId),
      this.getTreatmentAssessmentsByPlan(treatmentPlanId),
    ]);

    const summary: TreatmentProgressSummary = {
      total_sessions: sessions.length,
      completed_sessions: sessions.filter(s => s.date < new Date()).length,
      upcoming_sessions:
        sessions.filter(s => s.date >= new Date()).length,
      progress_records: progress.length,
      assessments_completed: assessments.length,
      average_satisfaction_rating: progress.length > 0
        ? progress.reduce((sum, p) => sum + (p.achieved ? 1 : 0), 0) / progress.length
        : 0,
      next_session_date: sessions.find(s => s.date >= new Date())?.date?.toISOString() || null,
      last_progress_date: progress.length > 0 ? progress[0]?.date?.toISOString() || null : null,
    };

    return summary;
  }

  // Advanced Features
  async generateTreatmentPlanSummary(treatmentPlanId: string): Promise<string> {
    const plan = await this.getTreatmentPlanById(treatmentPlanId);
    if (!plan) {
      throw new Error('Plano de tratamento não encontrado');
    }

    const [sessions, procedures] = await Promise.all([
      this.getTreatmentSessionsByPlan(treatmentPlanId),
      this.getTreatmentProceduresByPlan(treatmentPlanId),
    ]);

    const completedSessions = sessions.filter(s => s.date < new Date()).length;
    const progressPercentage = sessions.length > 0
      ? (completedSessions / sessions.length) * 100
      : 0;

    const summary = `
Plano de Tratamento: ${plan.id}
Paciente ID: ${plan.patientId}
Status: ${plan.status}
Progresso: ${progressPercentage.toFixed(1)}%

Objetivos:
Objetivos do tratamento não especificados

Procedimentos:
${procedures.map(proc => `- ${proc.name} (${proc.duration} minutos)`).join('\n')}

Sessões Realizadas: ${completedSessions} de ${sessions.length}
Próxima Sessão: ${
      sessions.find(s => s.date >= new Date())?.date
        ? new Date(sessions.find(s => s.date >= new Date())!.date).toLocaleDateString(
          'pt-BR',
        )
        : 'Nenhuma agendada'
    }
    `.trim();

    return summary;
  }

  async checkTreatmentPlanCompliance(treatmentPlanId: string): Promise<{
    compliant: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const plan = await this.getTreatmentPlanById(treatmentPlanId);
    if (!plan) {
      throw new Error('Plano de tratamento não encontrado');
    }

    const [sessions, documents, assessments] = await Promise.all([
      this.getTreatmentSessionsByPlan(treatmentPlanId),
      this.getTreatmentDocumentsByPlan(treatmentPlanId),
      this.getTreatmentAssessmentsByPlan(treatmentPlanId),
    ]);

    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check for missing documentation
    const requiredDocs = documents.filter(d => d.type === 'consent');
    const missingRequiredDocs = requiredDocs;
    if (missingRequiredDocs.length > 0) {
      issues.push(`Documentos obrigatórios não assinados: ${missingRequiredDocs.length}`);
      recommendations.push('Assine todos os documentos obrigatórios o mais rápido possível');
    }

    // Check for overdue sessions
    const overdueSessions = sessions.filter(s =>
      s.date < new Date()
    );
    if (overdueSessions.length > 0) {
      issues.push(`Sessões atrasadas: ${overdueSessions.length}`);
      recommendations.push('Reagende as sessões atrasadas ou atualize o status');
    }

    // Check for missing assessments
    const completedSessions = sessions.filter(s => s.date < new Date());
    const sessionsWithoutAssessment = completedSessions.filter(session =>
      !assessments.some(a => a.sessionId === session.id)
    );
    if (sessionsWithoutAssessment.length > 0) {
      issues.push(`Sessões sem avaliação: ${sessionsWithoutAssessment.length}`);
      recommendations.push('Realize avaliações para todas as sessões concluídas');
    }

    return {
      compliant: issues.length === 0,
      issues,
      recommendations,
    };
  }
}
