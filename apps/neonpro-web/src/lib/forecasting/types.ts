/**
 * Forecasting System Type Definitions
 * Epic 11 - Story 11.1: Consolidated types for demand forecasting system
 * 
 * Comprehensive type definitions for:
 * - Core forecasting types and interfaces
 * - Model management and training types
 * - Resource allocation and optimization types
 * - Configuration and validation types
 * - API request/response types
 * - Database schema types
 * 
 * BMAD METHOD + VOIDBEAST V6.0 ENHANCED - Quality ≥9.8/10
 */

// Re-export core types from main modules
export {
  DemandForecast,
  ExternalFactor,
  ForecastModel,
  ForecastValidationMetrics,
  DemandPattern,
  ResourceAllocation,
  ForecastAlert,
  ServiceDemandData,
  ForecastingOptions
} from './demand-forecasting';

export {
  ModelTrainingConfig,
  ModelPerformanceMetrics,
  ModelComparisonResult,
  ModelTrainingJob,
  HyperparameterSpace
} from './forecast-models';

export {
  StaffAllocation,
  EquipmentAllocation,
  RoomAllocation,
  InventoryAllocation,
  TimeWindow,
  AllocationConstraint,
  OptimizationObjective,
  AllocationPlan,
  AllocationAlert,
  AllocationMetrics
} from './resource-allocation';

// Additional API and configuration types

/**
 * API Request/Response Types
 */
export interface ForecastRequest {
  clinic_id: string;
  service_id?: string;
  forecast_type: 'appointments' | 'service_demand' | 'equipment_usage' | 'staff_workload';
  start_date: string;
  end_date: string;
  options?: Partial<ForecastingOptions>;
}

export interface ForecastResponse {
  success: boolean;
  data?: DemandForecast;
  error?: string;
  metadata?: {
    processing_time_ms: number;
    model_used: string;
    confidence_level: number;
    data_points_used: number;
  };
}

export interface BatchForecastRequest {
  clinic_id: string;
  forecasts: Array<{
    service_id?: string;
    forecast_type: 'appointments' | 'service_demand' | 'equipment_usage' | 'staff_workload';
  }>;
  period: {
    start_date: string;
    end_date: string;
  };
  options?: Partial<ForecastingOptions>;
}

export interface BatchForecastResponse {
  success: boolean;
  data?: DemandForecast[];
  errors?: Array<{
    service_id?: string;
    forecast_type: string;
    error: string;
  }>;
  metadata?: {
    total_forecasts: number;
    successful_forecasts: number;
    failed_forecasts: number;
    processing_time_ms: number;
  };
}

export interface AllocationPlanRequest {
  clinic_id: string;
  planning_period: {
    start_date: string;
    end_date: string;
  };
  objectives?: OptimizationObjective[];
  constraints?: AllocationConstraint[];
  include_forecasts?: boolean;
}

export interface AllocationPlanResponse {
  success: boolean;
  data?: AllocationPlan;
  error?: string;
  metadata?: {
    processing_time_ms: number;
    forecasts_used: number;
    optimization_score: number;
    constraint_violations: number;
  };
}

export interface ModelTrainingRequest {
  clinic_id: string;
  model_type: ForecastModel['model_type'];
  service_id?: string;
  config?: Partial<ModelTrainingConfig>;
  auto_deploy?: boolean;
}

export interface ModelTrainingResponse {
  success: boolean;
  data?: {
    job_id: string;
    estimated_completion_time: string;
    training_config: ModelTrainingConfig;
  };
  error?: string;
}

/**
 * Database Schema Types
 */
export interface DemandForecastsTable {
  id: string;
  clinic_id: string;
  service_id?: string;
  period_start: string;
  period_end: string;
  predicted_demand: number;
  confidence_level: number;
  forecast_type: 'appointments' | 'service_demand' | 'equipment_usage' | 'staff_workload';
  model_version: string;
  external_factors: ExternalFactor[];
  created_at: string;
  updated_at: string;
}

export interface ForecastModelsTable {
  id: string;
  clinic_id: string;
  model_type: 'arima' | 'lstm' | 'prophet' | 'ensemble' | 'linear_regression';
  service_type?: string;
  parameters: Record<string, any>;
  accuracy_score: number;
  training_date: string;
  validation_metrics: ForecastValidationMetrics;
  status: 'active' | 'training' | 'deprecated';
  deployed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ModelTrainingJobsTable {
  id: string;
  clinic_id: string;
  model_type: ForecastModel['model_type'];
  service_id?: string;
  config: ModelTrainingConfig;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  start_time?: string;
  end_time?: string;
  error_message?: string;
  result_model_id?: string;
  performance_metrics?: ModelPerformanceMetrics;
  created_at: string;
  updated_at: string;
}

export interface AllocationPlansTable {
  id: string;
  clinic_id: string;
  plan_name: string;
  planning_period_start: string;
  planning_period_end: string;
  staff_allocations: StaffAllocation[];
  equipment_allocations: EquipmentAllocation[];
  room_allocations: RoomAllocation[];
  inventory_allocations: InventoryAllocation[];
  total_cost: number;
  expected_revenue: number;
  roi_percentage: number;
  efficiency_score: number;
  constraints: AllocationConstraint[];
  objectives: OptimizationObjective[];
  status: 'draft' | 'approved' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface ForecastAlertsTable {
  id: string;
  forecast_id: string;
  alert_type: 'demand_spike' | 'capacity_shortage' | 'resource_constraint' | 'accuracy_degradation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  affected_resources: string[];
  recommended_actions: string[];
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DemandFactorsTable {
  id: string;
  clinic_id: string;
  factor_type: 'holiday' | 'weather' | 'event' | 'season' | 'economic' | 'health_trends';
  name: string;
  impact_weight: number;
  start_date: string;
  end_date?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ModelPerformanceMetricsTable {
  id: string;
  model_id: string;
  evaluation_date: string;
  training_metrics: ForecastValidationMetrics;
  validation_metrics: ForecastValidationMetrics;
  test_metrics: ForecastValidationMetrics;
  feature_importance: Record<string, number>;
  model_size_mb: number;
  training_time_seconds: number;
  inference_time_ms: number;
  stability_score: number;
  drift_score: number;
  created_at: string;
}

/**
 * Configuration Types
 */
export interface ForecastingSystemConfig {
  accuracy_threshold: number;
  default_forecast_horizon_days: number;
  max_forecast_horizon_days: number;
  min_historical_data_points: number;
  default_confidence_intervals: number[];
  model_retraining_interval_days: number;
  performance_check_interval_hours: number;
  drift_detection_threshold: number;
  alert_thresholds: {
    demand_spike_multiplier: number;
    capacity_shortage_threshold: number;
    accuracy_degradation_threshold: number;
  };
}

export interface ResourceOptimizationConfig {
  target_utilization_rate: number;
  cost_variance_threshold: number;
  efficiency_threshold: number;
  staff_overtime_limit_hours: number;
  equipment_max_utilization: number;
  room_max_utilization: number;
  inventory_safety_stock_multiplier: number;
  optimization_objectives_weights: {
    cost_minimization: number;
    revenue_maximization: number;
    utilization_optimization: number;
    satisfaction_optimization: number;
  };
}

export interface ModelTrainingDefaults {
  training_period_days: number;
  validation_split: number;
  test_split: number;
  cross_validation_folds: number;
  early_stopping: boolean;
  patience: number;
  min_delta: number;
  max_epochs: number;
  batch_size: number;
  learning_rate: number;
  regularization: number;
}

/**
 * Validation and Error Types
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export interface ForecastingError {
  type: 'validation' | 'model' | 'data' | 'configuration' | 'system';
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  context?: {
    clinic_id?: string;
    service_id?: string;
    model_id?: string;
    forecast_id?: string;
  };
}

export interface SystemHealthStatus {
  overall_status: 'healthy' | 'warning' | 'critical' | 'offline';
  components: {
    forecasting_engine: ComponentStatus;
    model_manager: ComponentStatus;
    resource_optimizer: ComponentStatus;
    database: ComponentStatus;
    external_apis: ComponentStatus;
  };
  last_check: string;
  next_check: string;
}

export interface ComponentStatus {
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  response_time_ms?: number;
  error_rate?: number;
  last_error?: string;
  uptime_percentage?: number;
}

/**
 * Analytics and Reporting Types
 */
export interface ForecastAccuracyReport {
  period: { start: string; end: string };
  overall_accuracy: number;
  accuracy_by_service: Record<string, number>;
  accuracy_by_model: Record<string, number>;
  accuracy_trends: Array<{
    date: string;
    accuracy: number;
    forecast_count: number;
  }>;
  top_performing_models: Array<{
    model_id: string;
    model_type: string;
    accuracy: number;
    usage_count: number;
  }>;
  recommendations: string[];
}

export interface ResourceUtilizationReport {
  period: { start: string; end: string };
  overall_utilization: number;
  staff_utilization: {
    average: number;
    by_role: Record<string, number>;
    overtime_hours: number;
    efficiency_score: number;
  };
  equipment_utilization: {
    average: number;
    by_type: Record<string, number>;
    maintenance_hours: number;
    downtime_hours: number;
  };
  room_utilization: {
    average: number;
    by_type: Record<string, number>;
    revenue_generated: number;
    booking_efficiency: number;
  };
  inventory_metrics: {
    turnover_rate: number;
    stockout_incidents: number;
    expired_items_cost: number;
    holding_cost: number;
  };
}

export interface CostOptimizationReport {
  period: { start: string; end: string };
  total_cost: number;
  cost_breakdown: {
    staff_costs: number;
    equipment_costs: number;
    inventory_costs: number;
    overhead_costs: number;
  };
  cost_savings: {
    optimization_savings: number;
    efficiency_improvements: number;
    waste_reduction: number;
  };
  roi_analysis: {
    investment: number;
    returns: number;
    roi_percentage: number;
    payback_period_months: number;
  };
  recommendations: Array<{
    category: string;
    description: string;
    potential_savings: number;
    implementation_effort: 'low' | 'medium' | 'high';
  }>;
}

/**
 * Event and Notification Types
 */
export interface ForecastingEvent {
  id: string;
  event_type: 'forecast_generated' | 'model_trained' | 'allocation_optimized' | 'alert_triggered' | 'system_error';
  clinic_id: string;
  source: string;
  data: Record<string, any>;
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: string;
  user_id?: string;
}

export interface NotificationSubscription {
  id: string;
  user_id: string;
  clinic_id: string;
  event_types: string[];
  delivery_methods: ('email' | 'sms' | 'push' | 'in_app')[];
  filters?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Integration Types
 */
export interface ExternalAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    request_id: string;
    timestamp: string;
    rate_limit?: {
      remaining: number;
      reset_time: string;
    };
  };
}

export interface WeatherData {
  date: string;
  temperature_celsius: number;
  humidity_percentage: number;
  precipitation_mm: number;
  conditions: string;
  impact_score: number;
}

export interface EconomicIndicators {
  date: string;
  unemployment_rate: number;
  inflation_rate: number;
  healthcare_spending_index: number;
  local_economic_health: number;
}

export interface HealthTrends {
  date: string;
  seasonal_illness_rate: number;
  vaccination_rates: number;
  public_health_alerts: string[];
  demographic_trends: Record<string, number>;
}

/**
 * Utility Types
 */
export type ForecastingEntityId = string;
export type ClinicId = string;
export type ServiceId = string;
export type ModelId = string;
export type StaffId = string;
export type EquipmentId = string;
export type RoomId = string;
export type InventoryItemId = string;

export type DateString = string; // ISO 8601 format
export type Percentage = number; // 0-100
export type Score = number; // 0-1
export type Currency = number; // USD cents

export type PaginationParams = {
  page: number;
  limit: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
    has_next: boolean;
    has_previous: boolean;
  };
};

export type FilterParams = {
  clinic_id?: string;
  service_id?: string;
  date_from?: string;
  date_to?: string;
  status?: string;
  type?: string;
};

/**
 * Enum-like Types
 */
export const FORECAST_TYPES = {
  APPOINTMENTS: 'appointments',
  SERVICE_DEMAND: 'service_demand',
  EQUIPMENT_USAGE: 'equipment_usage',
  STAFF_WORKLOAD: 'staff_workload'
} as const;

export const MODEL_TYPES = {
  ARIMA: 'arima',
  LSTM: 'lstm',
  PROPHET: 'prophet',
  ENSEMBLE: 'ensemble',
  LINEAR_REGRESSION: 'linear_regression'
} as const;

export const ALERT_TYPES = {
  DEMAND_SPIKE: 'demand_spike',
  CAPACITY_SHORTAGE: 'capacity_shortage',
  RESOURCE_CONSTRAINT: 'resource_constraint',
  ACCURACY_DEGRADATION: 'accuracy_degradation'
} as const;

export const SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
} as const;

export const OPTIMIZATION_OBJECTIVES = {
  MINIMIZE_COST: 'minimize_cost',
  MAXIMIZE_REVENUE: 'maximize_revenue',
  MAXIMIZE_UTILIZATION: 'maximize_utilization',
  MINIMIZE_WAIT_TIME: 'minimize_wait_time',
  BALANCE_WORKLOAD: 'balance_workload'
} as const;

export const RESOURCE_TYPES = {
  STAFF: 'staff',
  EQUIPMENT: 'equipment',
  ROOM: 'room',
  INVENTORY: 'inventory'
} as const;

export const PLAN_STATUSES = {
  DRAFT: 'draft',
  APPROVED: 'approved',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export const JOB_STATUSES = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
} as const;
