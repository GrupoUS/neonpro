// Backend service for Patient Retention Analytics + Predictions
// Story 7.4: Advanced patient retention analytics with predictive modeling

import type {
  ChurnRiskLevel,
  InterventionChannel,
  InterventionStatus,
  PatientChurnPrediction,
  PatientRetentionAnalytics,
  RetentionIntervention,
  RetentionMetrics,
} from '@/app/types/retention';
import { createClient } from '@/app/utils/supabase/client';

export class RetentionService {
  private static getClient() {
    return createClient();
  }

  // Patient Retention Analytics Operations

  /**
   * Get patient retention analytics with filtering and pagination
   */
  static async getPatientRetentionAnalytics(params: {
    page?: number;
    limit?: number;
    patient_id?: string;
    risk_level?: ChurnRiskLevel;
    segment?: string;
    date_range?: { start_date: string; end_date: string };
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }) {
    const supabase = RetentionService.getClient();
    const {
      page = 1,
      limit = 20,
      patient_id,
      risk_level,
      segment,
      date_range,
      search,
      sort_by = 'created_at',
      sort_order = 'desc',
    } = params;

    let query = supabase.from('patient_retention_analytics').select(`
        *,
        patients!inner(
          first_name,
          last_name,
          email,
          phone
        )
      `);

    // Apply filters
    if (patient_id) {
      query = query.eq('patient_id', patient_id);
    }

    if (risk_level) {
      query = query.eq('churn_risk_level', risk_level);
    }

    if (segment) {
      query = query.eq('retention_segment', segment);
    }

    if (date_range) {
      query = query
        .gte('calculation_date', date_range.start_date)
        .lte('calculation_date', date_range.end_date);
    }

    // Search functionality
    if (search) {
      query = query.or(`
        patients.first_name.ilike.%${search}%,
        patients.last_name.ilike.%${search}%,
        patients.email.ilike.%${search}%,
        retention_segment.ilike.%${search}%
      `);
    }

    // Apply sorting
    query = query.order(sort_by, { ascending: sort_order === 'asc' });

    // Apply pagination
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    query = query.range(start, end);

    const { data, error } = await query;

    if (error) {
      throw new Error('Failed to fetch patient retention analytics');
    }

    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total: data?.length || 0,
      },
    };
  }

  /**
   * Create patient retention analytics record
   */
  static async createPatientRetentionAnalytics(
    analyticsData: Omit<
      PatientRetentionAnalytics,
      'id' | 'created_at' | 'updated_at'
    >
  ) {
    const supabase = RetentionService.getClient();

    const { data, error } = await supabase
      .from('patient_retention_analytics')
      .insert([analyticsData])
      .select()
      .single();

    if (error) {
      throw new Error('Failed to create patient retention analytics');
    }

    return data;
  }

  /**
   * Update patient retention analytics record
   */
  static async updatePatientRetentionAnalytics(
    id: string,
    updates: Partial<PatientRetentionAnalytics>
  ) {
    const supabase = RetentionService.getClient();

    const { data, error } = await supabase
      .from('patient_retention_analytics')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to update patient retention analytics');
    }

    return data;
  }

  // Churn Prediction Operations

  /**
   * Get churn predictions with filtering and pagination
   */
  static async getChurnPredictions(params: {
    page?: number;
    limit?: number;
    patient_id?: string;
    risk_level?: ChurnRiskLevel;
    date_range?: { start_date: string; end_date: string };
    model_version?: string;
    validation_status?: 'pending' | 'validated' | 'disputed';
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }) {
    const supabase = RetentionService.getClient();
    const {
      page = 1,
      limit = 20,
      patient_id,
      risk_level,
      date_range,
      model_version,
      validation_status,
      sort_by = 'prediction_date',
      sort_order = 'desc',
    } = params;

    let query = supabase.from('patient_churn_predictions').select(`
        *,
        patients!inner(
          first_name,
          last_name,
          email
        )
      `);

    // Apply filters
    if (patient_id) {
      query = query.eq('patient_id', patient_id);
    }

    if (risk_level) {
      query = query.eq('risk_level', risk_level);
    }

    if (date_range) {
      query = query
        .gte('prediction_date', date_range.start_date)
        .lte('prediction_date', date_range.end_date);
    }

    if (model_version) {
      query = query.eq('model_version', model_version);
    }

    if (validation_status) {
      query = query.eq('validation_status', validation_status);
    }

    // Only active predictions
    query = query.eq('is_active', true);

    // Apply sorting and pagination
    query = query
      .order(sort_by, { ascending: sort_order === 'asc' })
      .range((page - 1) * limit, page * limit - 1);

    const { data, error } = await query;

    if (error) {
      throw new Error('Failed to fetch churn predictions');
    }

    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total: data?.length || 0,
      },
    };
  }

  /**
   * Create churn prediction
   */
  static async createChurnPrediction(
    predictionData: Omit<
      PatientChurnPrediction,
      'id' | 'created_at' | 'updated_at'
    >
  ) {
    const supabase = RetentionService.getClient();

    // Deactivate previous predictions for the same patient
    await supabase
      .from('patient_churn_predictions')
      .update({ is_active: false })
      .eq('patient_id', predictionData.patient_id);

    const { data, error } = await supabase
      .from('patient_churn_predictions')
      .insert([predictionData])
      .select()
      .single();

    if (error) {
      throw new Error('Failed to create churn prediction');
    }

    return data;
  }

  /**
   * Update churn prediction validation
   */
  static async updateChurnPredictionValidation(
    id: string,
    validation_status: 'pending' | 'validated' | 'disputed',
    actual_outcome?: 'retained' | 'churned' | 'unknown',
    outcome_date?: string
  ) {
    const supabase = RetentionService.getClient();

    const updates: any = { validation_status };

    if (actual_outcome) {
      updates.actual_outcome = actual_outcome;
    }

    if (outcome_date) {
      updates.outcome_date = outcome_date;
    }

    const { data, error } = await supabase
      .from('patient_churn_predictions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to update churn prediction validation');
    }

    return data;
  }

  // Retention Intervention Operations

  /**
   * Get retention interventions with filtering and pagination
   */
  static async getRetentionInterventions(params: {
    page?: number;
    limit?: number;
    patient_id?: string;
    channel?: InterventionChannel;
    status?: InterventionStatus;
    campaign_id?: string;
    date_range?: { start_date: string; end_date: string };
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }) {
    const supabase = RetentionService.getClient();
    const {
      page = 1,
      limit = 20,
      patient_id,
      channel,
      status,
      campaign_id,
      date_range,
      sort_by = 'created_at',
      sort_order = 'desc',
    } = params;

    let query = supabase.from('retention_interventions').select(`
        *,
        patients!inner(
          first_name,
          last_name,
          email
        )
      `);

    // Apply filters
    if (patient_id) {
      query = query.eq('patient_id', patient_id);
    }

    if (channel) {
      query = query.eq('channel', channel);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (campaign_id) {
      query = query.eq('campaign_id', campaign_id);
    }

    if (date_range) {
      query = query
        .gte('created_at', date_range.start_date)
        .lte('created_at', date_range.end_date);
    }

    // Apply sorting and pagination
    query = query
      .order(sort_by, { ascending: sort_order === 'asc' })
      .range((page - 1) * limit, page * limit - 1);

    const { data, error } = await query;

    if (error) {
      throw new Error('Failed to fetch retention interventions');
    }

    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total: data?.length || 0,
      },
    };
  }

  /**
   * Create retention intervention
   */
  static async createRetentionIntervention(
    interventionData: Omit<
      RetentionIntervention,
      'id' | 'created_at' | 'updated_at'
    >
  ) {
    const supabase = RetentionService.getClient();

    const { data, error } = await supabase
      .from('retention_interventions')
      .insert([interventionData])
      .select()
      .single();

    if (error) {
      throw new Error('Failed to create retention intervention');
    }

    return data;
  }

  /**
   * Update retention intervention status
   */
  static async updateRetentionInterventionStatus(
    id: string,
    status: InterventionStatus,
    response_data?: Record<string, any>,
    effectiveness_score?: number,
    roi?: number
  ) {
    const supabase = RetentionService.getClient();

    const updates: any = { status };

    if (response_data) {
      updates.response_data = response_data;
    }

    if (effectiveness_score !== undefined) {
      updates.effectiveness_score = effectiveness_score;
    }

    if (roi !== undefined) {
      updates.roi = roi;
    }

    if (
      status === 'delivered' ||
      status === 'opened' ||
      status === 'clicked' ||
      status === 'responded'
    ) {
      updates.executed_date = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('retention_interventions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to update retention intervention status');
    }

    return data;
  }

  // Analytics and Metrics Operations

  /**
   * Get retention metrics summary
   */
  static async getRetentionMetrics(params: {
    date_range?: { start_date: string; end_date: string };
    segment?: string;
    risk_level?: ChurnRiskLevel;
  }): Promise<RetentionMetrics> {
    const supabase = RetentionService.getClient();

    try {
      // Calculate high-risk and critical-risk patient counts
      const { count: highRiskPatients } = await supabase
        .from('patient_retention_analytics')
        .select('*', { count: 'exact' })
        .eq('churn_risk_level', 'high');

      const { count: criticalRiskPatients } = await supabase
        .from('patient_retention_analytics')
        .select('*', { count: 'exact' })
        .eq('churn_risk_level', 'critical');

      // Get churn rate and other analytics from aggregated view
      const { data: churnSummary } = await supabase.from(
        'patient_retention_analytics'
      ).select(`
          churn_probability,
          lifetime_value,
          predicted_ltv,
          retention_score,
          visit_frequency_score,
          engagement_score,
          satisfaction_score,
          financial_score
        `);

      // Calculate averages and metrics
      const totalPatients = churnSummary?.length || 0;
      const avgChurnProbability =
        churnSummary?.reduce(
          (sum, item) => sum + (item.churn_probability || 0),
          0
        ) / totalPatients || 0;
      const avgLifetimeValue =
        churnSummary?.reduce(
          (sum, item) => sum + (item.lifetime_value || 0),
          0
        ) / totalPatients || 0;
      const avgPredictedLTV =
        churnSummary?.reduce(
          (sum, item) => sum + (item.predicted_ltv || 0),
          0
        ) / totalPatients || 0;
      const avgRetentionScore =
        churnSummary?.reduce(
          (sum, item) => sum + (item.retention_score || 0),
          0
        ) / totalPatients || 0;

      return {
        total_patients: totalPatients,
        high_risk_patients: highRiskPatients || 0,
        critical_risk_patients: criticalRiskPatients || 0,
        churn_rate: avgChurnProbability * 100,
        retention_rate: (1 - avgChurnProbability) * 100,
        average_ltv: avgLifetimeValue,
        predicted_ltv: avgPredictedLTV,
        average_retention_score: avgRetentionScore,
        period_start:
          params.date_range?.start_date ||
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        period_end: params.date_range?.end_date || new Date().toISOString(),
      } as RetentionMetrics;
    } catch (_error) {
      throw new Error('Failed to calculate retention metrics');
    }
  }

  /**
   * Get dashboard summary data
   */
  static async getDashboardSummary(_date_range?: {
    start_date: string;
    end_date: string;
  }) {
    const supabase = RetentionService.getClient();

    const { data, error } = await supabase.from('patient_retention_analytics')
      .select(`
        churn_risk_level,
        retention_segment,
        churn_probability,
        lifetime_value,
        retention_score
      `);

    if (error) {
      throw new Error('Failed to fetch dashboard summary');
    }

    const summary = data || [];

    return {
      total_patients: summary.length,
      risk_distribution: {
        low: summary.filter((p) => p.churn_risk_level === 'low').length,
        medium: summary.filter((p) => p.churn_risk_level === 'medium').length,
        high: summary.filter((p) => p.churn_risk_level === 'high').length,
        critical: summary.filter((p) => p.churn_risk_level === 'critical')
          .length,
      },
      average_retention_score:
        summary.reduce((sum, p) => sum + (p.retention_score || 0), 0) /
          summary.length || 0,
      average_churn_probability:
        summary.reduce((sum, p) => sum + (p.churn_probability || 0), 0) /
          summary.length || 0,
      average_lifetime_value:
        summary.reduce((sum, p) => sum + (p.lifetime_value || 0), 0) /
          summary.length || 0,
      segments: [...new Set(summary.map((p) => p.retention_segment))].map(
        (segment) => ({
          name: segment,
          count: summary.filter((p) => p.retention_segment === segment).length,
        })
      ),
    };
  }
}
