// Story 10.2: Progress Tracking through Computer Vision Service
// Backend service for progress tracking system

import type {
    CreateMultiSessionAnalysisRequest,
    CreateProgressAlertRequest,
    CreateProgressMilestoneRequest,
    CreateProgressPredictionRequest,
    CreateProgressTrackingRequest,
    CVProgressAnalysis,
    MultiSessionAnalysis,
    ProgressAlert,
    ProgressAlertFilters,
    ProgressDashboardStats,
    ProgressMilestone,
    ProgressMilestoneFilters,
    ProgressPrediction,
    ProgressTracking,
    ProgressTrackingFilters,
    ProgressTrendData,
    TrackingMetric,
    TrackingMetricRequest,
    UpdateProgressTrackingRequest
} from '@/app/types/progress-tracking';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

class ProgressTrackingService {
  private supabase = createClientComponentClient();

  // Progress Tracking Management
  async createProgressTracking(data: CreateProgressTrackingRequest): Promise<ProgressTracking> {
    const user = await this.getCurrentUser();
    
    const trackingData = {
      ...data,
      created_by: user.id,
      updated_by: user.id
    };

    const { data: tracking, error } = await supabase
      .from('progress_tracking')
      .insert(trackingData)
      .select()
      .single();

    if (error) throw error;
    return tracking;
  }

  async getProgressTrackings(filters: ProgressTrackingFilters = {}): Promise<{
    data: ProgressTracking[];
    total: number;
  }> {
    let query = supabase
      .from('progress_tracking')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.patient_id) {
      query = query.eq('patient_id', filters.patient_id);
    }
    if (filters.tracking_type) {
      query = query.eq('tracking_type', filters.tracking_type);
    }
    if (filters.treatment_type) {
      query = query.eq('treatment_type', filters.treatment_type);
    }
    if (filters.treatment_area) {
      query = query.eq('treatment_area', filters.treatment_area);
    }
    if (filters.validation_status) {
      query = query.eq('validation_status', filters.validation_status);
    }
    if (filters.date_from) {
      query = query.gte('tracking_date', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('tracking_date', filters.date_to);
    }
    if (filters.min_progress_score !== undefined) {
      query = query.gte('progress_score', filters.min_progress_score);
    }
    if (filters.max_progress_score !== undefined) {
      query = query.lte('progress_score', filters.max_progress_score);
    }
    if (filters.min_confidence !== undefined) {
      query = query.gte('confidence_score', filters.min_confidence);
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    query = query
      .order('tracking_date', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: data || [],
      total: count || 0
    };
  }

  async getProgressTrackingById(id: string): Promise<ProgressTracking | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('progress_tracking')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async updateProgressTracking(id: string, data: UpdateProgressTrackingRequest): Promise<ProgressTracking> {
    const user = await this.getCurrentUser();
    const supabase = await createClient();

    const { data: tracking, error } = await supabase
      .from('progress_tracking')
      .update({
        ...data,
        updated_by: user.id
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return tracking;
  }

  async deleteProgressTracking(id: string): Promise<void> {
    const { error } = await supabase
      .from('progress_tracking')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Progress Milestones Management
  async createProgressMilestone(data: CreateProgressMilestoneRequest): Promise<ProgressMilestone> {
    const user = await this.getCurrentUser();

    const milestoneData = {
      ...data,
      created_by: user.id,
      updated_by: user.id
    };

    const { data: milestone, error } = await supabase
      .from('progress_milestones')
      .insert(milestoneData)
      .select()
      .single();

    if (error) throw error;
    return milestone;
  }

  async getProgressMilestones(filters: ProgressMilestoneFilters = {}): Promise<{
    data: ProgressMilestone[];
    total: number;
  }> {
    let query = supabase
      .from('progress_milestones')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.patient_id) {
      query = query.eq('patient_id', filters.patient_id);
    }
    if (filters.milestone_type) {
      query = query.eq('milestone_type', filters.milestone_type);
    }
    if (filters.validation_status) {
      query = query.eq('validation_status', filters.validation_status);
    }
    if (filters.date_from) {
      query = query.gte('achievement_date', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('achievement_date', filters.date_to);
    }
    if (filters.alert_sent !== undefined) {
      query = query.eq('alert_sent', filters.alert_sent);
    }
    if (filters.min_achievement_score !== undefined) {
      query = query.gte('achievement_score', filters.min_achievement_score);
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    query = query
      .order('achievement_date', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: data || [],
      total: count || 0
    };
  }

  async validateMilestone(id: string, validationStatus: 'confirmed' | 'false_positive', notes?: string): Promise<ProgressMilestone> {
    const user = await this.getCurrentUser();
    const supabase = await createClient();

    const { data: milestone, error } = await supabase
      .from('progress_milestones')
      .update({
        validation_status: validationStatus,
        validated_by: user.id,
        validation_notes: notes,
        updated_by: user.id
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return milestone;
  }

  // Progress Predictions Management
  async createProgressPrediction(data: CreateProgressPredictionRequest): Promise<ProgressPrediction> {
    const user = await this.getCurrentUser();

    const predictionData = {
      ...data,
      created_by: user.id,
      updated_by: user.id
    };

    const { data: prediction, error } = await supabase
      .from('progress_predictions')
      .insert(predictionData)
      .select()
      .single();

    if (error) throw error;
    return prediction;
  }

  async getProgressPredictions(patientId?: string): Promise<ProgressPrediction[]> {
    let query = supabase
      .from('progress_predictions')
      .select('*')
      .order('prediction_date', { ascending: false });

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async verifyPrediction(id: string, actualOutcome: Record<string, any>, accuracyScore: number): Promise<ProgressPrediction> {
    const user = await this.getCurrentUser();
    const supabase = await createClient();

    const { data: prediction, error } = await supabase
      .from('progress_predictions')
      .update({
        actual_outcome: actualOutcome,
        accuracy_score: accuracyScore,
        verified_at: new Date().toISOString(),
        verified_by: user.id,
        updated_by: user.id
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return prediction;
  }

  // Multi-Session Analysis
  async createMultiSessionAnalysis(data: CreateMultiSessionAnalysisRequest): Promise<MultiSessionAnalysis> {
    const user = await this.getCurrentUser();

    // Calculate progression score and trend direction
    const trackingData = await this.getTrackingDataForSessions(data.session_ids);
    const analysis = this.calculateProgressionAnalysis(trackingData);

    const analysisData = {
      ...data,
      progression_score: analysis.progressionScore,
      trend_direction: analysis.trendDirection,
      statistical_significance: analysis.statisticalSignificance,
      analysis_data: analysis.detailedData,
      created_by: user.id,
      updated_by: user.id
    };

    const { data: result, error } = await supabase
      .from('multi_session_analysis')
      .insert(analysisData)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async getMultiSessionAnalyses(patientId?: string): Promise<MultiSessionAnalysis[]> {
    let query = supabase
      .from('multi_session_analysis')
      .select('*')
      .order('created_at', { ascending: false });

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // Progress Alerts Management
  async createProgressAlert(data: CreateProgressAlertRequest): Promise<ProgressAlert> {
    const user = await this.getCurrentUser();

    const alertData = {
      ...data,
      created_by: user.id,
      updated_by: user.id
    };

    const { data: alert, error } = await supabase
      .from('progress_alerts')
      .insert(alertData)
      .select()
      .single();

    if (error) throw error;
    return alert;
  }

  async getProgressAlerts(filters: ProgressAlertFilters = {}): Promise<{
    data: ProgressAlert[];
    total: number;
  }> {
    let query = supabase
      .from('progress_alerts')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.patient_id) {
      query = query.eq('patient_id', filters.patient_id);
    }
    if (filters.alert_type) {
      query = query.eq('alert_type', filters.alert_type);
    }
    if (filters.alert_priority) {
      query = query.eq('alert_priority', filters.alert_priority);
    }
    if (filters.recipient_type) {
      query = query.eq('recipient_type', filters.recipient_type);
    }
    if (filters.is_read !== undefined) {
      query = query.eq('is_read', filters.is_read);
    }
    if (filters.action_required !== undefined) {
      query = query.eq('action_required', filters.action_required);
    }
    if (filters.action_taken !== undefined) {
      query = query.eq('action_taken', filters.action_taken);
    }
    if (filters.expires_before) {
      query = query.lte('expires_at', filters.expires_before);
    }
    if (filters.expires_after) {
      query = query.gte('expires_at', filters.expires_after);
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: data || [],
      total: count || 0
    };
  }

  async markAlertRead(id: string): Promise<ProgressAlert> {
    const user = await this.getCurrentUser();
    const supabase = await createClient();

    const { data: alert, error } = await supabase
      .from('progress_alerts')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
        read_by: user.id,
        updated_by: user.id
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return alert;
  }

  async markAlertActionTaken(id: string, actionNotes?: string): Promise<ProgressAlert> {
    const user = await this.getCurrentUser();
    const supabase = await createClient();

    const { data: alert, error } = await supabase
      .from('progress_alerts')
      .update({
        action_taken: true,
        action_notes: actionNotes,
        updated_by: user.id
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return alert;
  }

  // Tracking Metrics Management
  async createTrackingMetric(data: TrackingMetricRequest): Promise<TrackingMetric> {
    const user = await this.getCurrentUser();

    const metricData = {
      ...data,
      created_by: user.id,
      updated_by: user.id
    };

    const { data: metric, error } = await supabase
      .from('tracking_metrics')
      .insert(metricData)
      .select()
      .single();

    if (error) throw error;
    return metric;
  }

  async getTrackingMetrics(treatmentType?: string): Promise<TrackingMetric[]> {
    let query = supabase
      .from('tracking_metrics')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (treatmentType) {
      query = query.eq('treatment_type', treatmentType);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // Analytics and Dashboard
  async getProgressDashboardStats(patientId?: string): Promise<ProgressDashboardStats> {
    const baseQuery = patientId 
      ? supabase.from('progress_tracking').select('*').eq('patient_id', patientId)
      : supabase.from('progress_tracking').select('*');

    const [
      { count: totalTrackings },
      { data: activeData },
      { data: milestoneData },
      { data: alertData },
      { data: predictionData }
    ] = await Promise.all([
      baseQuery,
      supabase.from('progress_tracking')
        .select('treatment_type')
        .eq(patientId ? 'patient_id' : 'validation_status', patientId || 'validated')
        .not('progress_score', 'eq', 100),
      supabase.from('progress_milestones')
        .select('*')
        .eq(patientId ? 'patient_id' : 'validation_status', patientId || 'confirmed'),
      supabase.from('progress_alerts')
        .select('alert_priority')
        .eq('is_read', false)
        .eq('alert_priority', 'urgent'),
      supabase.from('progress_predictions')
        .select('accuracy_score')
        .not('accuracy_score', 'is', null)
    ]);

    const averageProgress = activeData && activeData.length > 0
      ? activeData.reduce((sum, item) => sum + (item as any).progress_score, 0) / activeData.length
      : 0;

    const predictionsAccuracy = predictionData && predictionData.length > 0
      ? predictionData.reduce((sum, item) => sum + (item as any).accuracy_score, 0) / predictionData.length
      : 0;

    return {
      total_trackings: totalTrackings || 0,
      active_treatments: new Set(activeData?.map((item: any) => item.treatment_type)).size,
      average_progress: Math.round(averageProgress * 10) / 10,
      milestone_achievements: milestoneData?.length || 0,
      pending_validations: 0, // Would need separate query
      urgent_alerts: alertData?.length || 0,
      predictions_accuracy: Math.round(predictionsAccuracy * 10) / 10,
      treatment_completion_rate: 0 // Would need separate calculation
    };
  }

  async getProgressTrendData(patientId: string, treatmentType?: string): Promise<ProgressTrendData[]> {
    let query = supabase
      .from('progress_tracking')
      .select('*')
      .eq('patient_id', patientId)
      .eq('validation_status', 'validated')
      .order('tracking_date', { ascending: true });

    if (treatmentType) {
      query = query.eq('treatment_type', treatmentType);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Group data by treatment type and area
    const groupedData = (data || []).reduce((acc, tracking) => {
      const key = `${tracking.treatment_type}-${tracking.treatment_area}`;
      if (!acc[key]) {
        acc[key] = {
          treatment_type: tracking.treatment_type,
          treatment_area: tracking.treatment_area,
          progress_points: [],
          trend_direction: 'stable' as any
        };
      }
      
      acc[key].progress_points.push({
        date: tracking.tracking_date,
        score: tracking.progress_score,
        confidence: tracking.confidence_score
      });

      return acc;
    }, {} as Record<string, ProgressTrendData>);

    // Calculate trend direction for each group
    Object.values(groupedData).forEach((trendData) => {
      const data = trendData as ProgressTrendData;
      const points = data.progress_points;
      if (points.length < 2) {
        data.trend_direction = 'stable';
        return;
      }

      const firstScore = points[0].score;
      const lastScore = points[points.length - 1].score;
      const difference = lastScore - firstScore;

      if (difference > 10) {
        data.trend_direction = 'improving';
      } else if (difference < -10) {
        data.trend_direction = 'declining';
      } else {
        data.trend_direction = 'stable';
      }
    });

    return Object.values(groupedData);
  }

  // Computer Vision Analysis
  async processProgressAnalysis(
    imageData: string,
    analysisType: 'healing' | 'aesthetic' | 'treatment_response' | 'maintenance',
    baselineId?: string
  ): Promise<CVProgressAnalysis> {
    // This would integrate with actual computer vision service
    // For now, return simulated data
    const simulatedAnalysis: CVProgressAnalysis = {
      measurement_id: crypto.randomUUID(),
      analysis_type: analysisType,
      regions_of_interest: [
        {
          id: 'roi_1',
          coordinates: { x: 100, y: 150, width: 200, height: 180 },
          confidence: 92.5,
          measurements: {
            area: 150.2,
            perimeter: 45.8,
            improvement: baselineId ? 23.5 : 0
          }
        }
      ],
      overall_score: 85.2,
      confidence_score: 89.1,
      comparison_data: baselineId ? {
        baseline_id: baselineId,
        improvement_percentage: 23.5,
        change_areas: ['primary_treatment_zone', 'surrounding_tissue']
      } : undefined,
      quality_indicators: {
        image_quality: 88.5,
        lighting_conditions: 91.2,
        angle_consistency: 87.8,
        focus_score: 93.1
      },
      annotations: [
        {
          type: 'measurement',
          coordinates: { x: 200, y: 240 },
          data: { measurement_type: 'area', value: 150.2, unit: 'mm²' }
        }
      ]
    };

    return simulatedAnalysis;
  }

  // Private helper methods
  private async getCurrentUser() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error('User not authenticated');
    return user;
  }

  private async getTrackingDataForSessions(sessionIds: string[]): Promise<ProgressTracking[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('progress_tracking')
      .select('*')
      .in('session_id', sessionIds)
      .order('tracking_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  private calculateProgressionAnalysis(trackingData: ProgressTracking[]) {
    if (trackingData.length < 2) {
      return {
        progressionScore: 0,
        trendDirection: 'stable' as any,
        statisticalSignificance: 0,
        detailedData: {}
      };
    }

    const scores = trackingData.map(t => t.progress_score);
    const firstScore = scores[0];
    const lastScore = scores[scores.length - 1];
    const progressionScore = lastScore - firstScore;

    let trendDirection: 'improving' | 'stable' | 'declining' | 'mixed';
    if (progressionScore > 10) {
      trendDirection = 'improving';
    } else if (progressionScore < -10) {
      trendDirection = 'declining';
    } else {
      trendDirection = 'stable';
    }

    // Calculate statistical significance (simplified)
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - (firstScore + lastScore) / 2, 2), 0) / scores.length;
    const statisticalSignificance = Math.min(100, Math.abs(progressionScore) * 10 / Math.sqrt(variance));

    return {
      progressionScore: Math.abs(progressionScore),
      trendDirection,
      statisticalSignificance,
      detailedData: {
        score_progression: scores,
        variance,
        improvement_rate: progressionScore / trackingData.length
      }
    };
  }
}

export const progressTrackingService = new ProgressTrackingService();


