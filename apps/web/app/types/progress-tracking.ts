// Story 10.2: Progress Tracking through Computer Vision Types
// TypeScript type definitions for progress tracking system

export interface ProgressTracking {
  id: string;
  patient_id: string;
  session_id?: string;
  tracking_type: 'healing' | 'aesthetic' | 'treatment_response' | 'maintenance';
  progress_score: number; // 0-100
  measurement_data: Record<string, any>; // Vision analysis measurements
  comparison_baseline?: string; // Reference to baseline measurement
  tracking_date: string;
  treatment_area: string;
  treatment_type: string;
  visual_annotations?: Record<string, any>; // Visual markings from CV
  confidence_score: number; // 0-100
  validated_by?: string;
  validation_status: 'pending' | 'validated' | 'rejected' | 'manual_review';
  validation_notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface ProgressMilestone {
  id: string;
  patient_id: string;
  tracking_id?: string;
  milestone_type:
    | 'significant_improvement'
    | 'target_achieved'
    | 'concern_detected'
    | 'treatment_complete';
  milestone_name: string;
  achievement_date: string;
  progress_data: Record<string, any>; // Milestone-specific data
  threshold_criteria: Record<string, any>; // Criteria that triggered milestone
  achievement_score: number; // 0-100
  validation_status:
    | 'detected'
    | 'confirmed'
    | 'false_positive'
    | 'manually_added';
  validated_by?: string;
  validation_notes?: string;
  alert_sent: boolean;
  alert_sent_at?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface ProgressPrediction {
  id: string;
  patient_id: string;
  tracking_id?: string;
  prediction_type:
    | 'outcome_forecast'
    | 'timeline_prediction'
    | 'risk_assessment';
  predicted_outcome: Record<string, any>; // Predicted results and timeline
  confidence_level: number; // 0-100
  prediction_date: string;
  target_date?: string; // When prediction expected to be verified
  model_version: string;
  input_features: Record<string, any>; // Features used for prediction
  actual_outcome?: Record<string, any>; // Actual results when available
  accuracy_score?: number; // 0-100
  verified_at?: string;
  verified_by?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface TrackingMetric {
  id: string;
  treatment_type: string;
  metric_name: string;
  metric_category: 'measurement' | 'scoring' | 'threshold' | 'visualization';
  measurement_method: 'cv_analysis' | 'manual_measurement' | 'hybrid';
  normal_ranges: Record<string, any>; // Normal value ranges
  improvement_thresholds: Record<string, any>; // Improvement thresholds
  calculation_formula?: string;
  unit_of_measurement?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface MultiSessionAnalysis {
  id: string;
  patient_id: string;
  analysis_name: string;
  session_ids: string[]; // Array of session IDs being compared
  tracking_ids: string[]; // Array of progress tracking IDs
  comparison_type:
    | 'timeline_progression'
    | 'treatment_effectiveness'
    | 'side_by_side';
  analysis_period: string; // PostgreSQL interval as string
  progression_score: number; // 0-100
  trend_direction: 'improving' | 'stable' | 'declining' | 'mixed';
  statistical_significance?: number; // 0-100
  analysis_data: Record<string, any>; // Detailed analysis results
  visualization_config?: Record<string, any>; // Chart configuration
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface ProgressAlert {
  id: string;
  patient_id: string;
  tracking_id?: string;
  milestone_id?: string;
  alert_type:
    | 'milestone_achieved'
    | 'concern_detected'
    | 'threshold_exceeded'
    | 'prediction_update';
  alert_priority: 'low' | 'medium' | 'high' | 'urgent';
  alert_title: string;
  alert_message: string;
  alert_data?: Record<string, any>; // Additional alert-specific data
  recipient_type: 'patient' | 'provider' | 'both';
  is_read: boolean;
  read_at?: string;
  read_by?: string;
  action_required: boolean;
  action_taken: boolean;
  action_notes?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

// Analytics and dashboard types
export interface ProgressTrackingAnalytics {
  id: string;
  patient_id: string;
  tracking_type: string;
  treatment_type: string;
  treatment_area: string;
  progress_score: number;
  confidence_score: number;
  tracking_date: string;
  validation_status: string;
  previous_score?: number;
  score_change?: number;
  time_since_last?: string;
  total_milestones: number;
  latest_prediction?: Record<string, any>;
}

export interface ProgressDashboardStats {
  total_trackings: number;
  active_treatments: number;
  average_progress: number;
  milestone_achievements: number;
  pending_validations: number;
  urgent_alerts: number;
  predictions_accuracy: number;
  treatment_completion_rate: number;
}

export interface ProgressTrendData {
  treatment_type: string;
  treatment_area: string;
  progress_points: {
    date: string;
    score: number;
    confidence: number;
  }[];
  trend_direction: 'improving' | 'stable' | 'declining' | 'mixed';
  prediction?: {
    expected_score: number;
    target_date: string;
    confidence: number;
  };
}

export interface MilestoneAchievement {
  milestone: ProgressMilestone;
  tracking: ProgressTracking;
  alert?: ProgressAlert;
  validation_required: boolean;
}

// API request/response types
export interface CreateProgressTrackingRequest {
  patient_id: string;
  session_id?: string;
  tracking_type: ProgressTracking['tracking_type'];
  progress_score: number;
  measurement_data: Record<string, any>;
  comparison_baseline?: string;
  treatment_area: string;
  treatment_type: string;
  visual_annotations?: Record<string, any>;
  confidence_score: number;
}

export interface UpdateProgressTrackingRequest {
  progress_score?: number;
  measurement_data?: Record<string, any>;
  visual_annotations?: Record<string, any>;
  confidence_score?: number;
  validation_status?: ProgressTracking['validation_status'];
  validation_notes?: string;
}

export interface CreateProgressMilestoneRequest {
  patient_id: string;
  tracking_id?: string;
  milestone_type: ProgressMilestone['milestone_type'];
  milestone_name: string;
  progress_data: Record<string, any>;
  threshold_criteria: Record<string, any>;
  achievement_score: number;
}

export interface CreateProgressPredictionRequest {
  patient_id: string;
  tracking_id?: string;
  prediction_type: ProgressPrediction['prediction_type'];
  predicted_outcome: Record<string, any>;
  confidence_level: number;
  target_date?: string;
  model_version: string;
  input_features: Record<string, any>;
}

export interface CreateMultiSessionAnalysisRequest {
  patient_id: string;
  analysis_name: string;
  session_ids: string[];
  tracking_ids: string[];
  comparison_type: MultiSessionAnalysis['comparison_type'];
  analysis_period: string;
}

export interface CreateProgressAlertRequest {
  patient_id: string;
  tracking_id?: string;
  milestone_id?: string;
  alert_type: ProgressAlert['alert_type'];
  alert_priority: ProgressAlert['alert_priority'];
  alert_title: string;
  alert_message: string;
  alert_data?: Record<string, any>;
  recipient_type: ProgressAlert['recipient_type'];
  action_required?: boolean;
  expires_at?: string;
}

export interface TrackingMetricRequest {
  treatment_type: string;
  metric_name: string;
  metric_category: TrackingMetric['metric_category'];
  measurement_method: TrackingMetric['measurement_method'];
  normal_ranges: Record<string, any>;
  improvement_thresholds: Record<string, any>;
  calculation_formula?: string;
  unit_of_measurement?: string;
  display_order?: number;
}

// Progress tracking filter and query types
export interface ProgressTrackingFilters {
  patient_id?: string;
  tracking_type?: ProgressTracking['tracking_type'];
  treatment_type?: string;
  treatment_area?: string;
  validation_status?: ProgressTracking['validation_status'];
  date_from?: string;
  date_to?: string;
  min_progress_score?: number;
  max_progress_score?: number;
  min_confidence?: number;
  has_milestones?: boolean;
  has_predictions?: boolean;
  page?: number;
  limit?: number;
}

export interface ProgressMilestoneFilters {
  patient_id?: string;
  milestone_type?: ProgressMilestone['milestone_type'];
  validation_status?: ProgressMilestone['validation_status'];
  date_from?: string;
  date_to?: string;
  alert_sent?: boolean;
  min_achievement_score?: number;
  page?: number;
  limit?: number;
}

export interface ProgressAlertFilters {
  patient_id?: string;
  alert_type?: ProgressAlert['alert_type'];
  alert_priority?: ProgressAlert['alert_priority'];
  recipient_type?: ProgressAlert['recipient_type'];
  is_read?: boolean;
  action_required?: boolean;
  action_taken?: boolean;
  expires_before?: string;
  expires_after?: string;
  page?: number;
  limit?: number;
}

// Computer vision analysis types
export interface CVProgressAnalysis {
  measurement_id: string;
  analysis_type: 'healing' | 'aesthetic' | 'treatment_response' | 'maintenance';
  regions_of_interest: {
    id: string;
    coordinates: { x: number; y: number; width: number; height: number };
    confidence: number;
    measurements: Record<string, number>;
  }[];
  overall_score: number;
  confidence_score: number;
  comparison_data?: {
    baseline_id: string;
    improvement_percentage: number;
    change_areas: string[];
  };
  quality_indicators: {
    image_quality: number;
    lighting_conditions: number;
    angle_consistency: number;
    focus_score: number;
  };
  annotations: {
    type: 'measurement' | 'highlight' | 'annotation';
    coordinates: { x: number; y: number };
    data: Record<string, any>;
  }[];
}

export interface ProgressVisualizationConfig {
  chart_type: 'line' | 'bar' | 'area' | 'scatter' | 'heatmap';
  time_range: 'week' | 'month' | 'quarter' | 'year' | 'all';
  metrics: string[];
  show_predictions: boolean;
  show_milestones: boolean;
  show_confidence_intervals: boolean;
  group_by?: 'treatment_type' | 'treatment_area' | 'tracking_type';
  colors?: Record<string, string>;
}

// API response types
export interface ProgressTrackingResponse {
  data: ProgressTracking[];
  total: number;
  page: number;
  limit: number;
  analytics?: ProgressTrackingAnalytics[];
}

export interface ProgressDashboardResponse {
  stats: ProgressDashboardStats;
  recent_trackings: ProgressTracking[];
  active_alerts: ProgressAlert[];
  milestone_achievements: MilestoneAchievement[];
  trend_data: ProgressTrendData[];
  predictions: ProgressPrediction[];
}

export interface MultiSessionAnalysisResponse {
  analysis: MultiSessionAnalysis;
  tracking_data: ProgressTracking[];
  trend_analysis: {
    overall_trend: 'improving' | 'stable' | 'declining' | 'mixed';
    progress_velocity: number; // Progress per time unit
    milestone_density: number; // Milestones per time unit
    prediction_accuracy: number;
  };
  visualization_data: Record<string, any>;
}

// Error types
export interface ProgressTrackingError {
  code:
    | 'INVALID_PROGRESS_SCORE'
    | 'INVALID_CONFIDENCE'
    | 'INVALID_MEASUREMENT_DATA'
    | 'BASELINE_NOT_FOUND'
    | 'INSUFFICIENT_DATA'
    | 'VALIDATION_FAILED';
  message: string;
  field?: string;
  details?: Record<string, any>;
}
