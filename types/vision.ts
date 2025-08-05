// Vision Analysis Types
// Epic 10.1: Automated Before/After Analysis
// Target: ≥95% accuracy, <30s processing time

export type AnalysisStatus = "pending" | "processing" | "completed" | "failed" | "cancelled";
export type AnnotationType = "measurement" | "highlight" | "comparison" | "annotation";
export type TreatmentType =
  | "skin-aesthetic"
  | "medical-healing"
  | "body-contouring"
  | "facial-rejuvenation"
  | "scar-treatment"
  | "pigmentation";

// Core Analysis Interface
export interface ImageAnalysis {
  id: string;
  patient_id: string;
  before_image_id: string;
  after_image_id: string;

  // Analysis metadata
  analysis_date: string;
  treatment_type: TreatmentType;
  status: AnalysisStatus;

  // Performance metrics (Epic 10.1 requirements)
  accuracy_score: number; // Must be ≥0.95
  processing_time: number; // Must be ≤30000ms
  confidence: number;

  // Analysis results
  improvement_percentage: number;
  change_metrics: ChangeMetrics;
  annotations: AnalysisAnnotation[];

  // Quality control flags
  meets_accuracy_requirement: boolean;
  meets_time_requirement: boolean;

  // Audit fields
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// Change Metrics Interface
export interface ChangeMetrics {
  overallImprovement: number;
  skinTexture?: {
    before: number;
    after: number;
    improvement: number;
    confidence: number;
  };
  wrinkleReduction?: {
    before: number;
    after: number;
    improvement: number;
    confidence: number;
  };
  pigmentationChange?: {
    before: number;
    after: number;
    improvement: number;
    confidence: number;
  };
  scarHealing?: {
    before: number;
    after: number;
    improvement: number;
    confidence: number;
  };
  volumeChange?: {
    before: number;
    after: number;
    improvement: number;
    confidence: number;
  };
  symmetryImprovement?: {
    before: number;
    after: number;
    improvement: number;
    confidence: number;
  };
  colorUniformity?: {
    before: number;
    after: number;
    improvement: number;
    confidence: number;
  };
  edgeDefinition?: {
    before: number;
    after: number;
    improvement: number;
    confidence: number;
  };
}

// Analysis Annotation Interface
export interface AnalysisAnnotation {
  id: string;
  analysis_id: string;
  annotation_type: AnnotationType;
  description: string;
  coordinates: AnnotationCoordinate[];
  measurement_value?: number;
  measurement_unit?: string;
  confidence_score: number;
  created_at: string;
}

// Coordinate Interface for Annotations
export interface AnnotationCoordinate {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

// Performance Tracking Interface
export interface AnalysisPerformance {
  id: string;
  analysis_id: string;

  // Performance metrics
  preprocessing_time: number;
  model_inference_time: number;
  postprocessing_time: number;
  total_processing_time: number;

  // Resource usage
  memory_usage_mb?: number;
  cpu_usage_percent?: number;
  gpu_usage_percent?: number;

  // Model information
  model_version?: string;
  model_accuracy?: number;

  recorded_at: string;
}

// Quality Control Interface
export interface AnalysisQualityControl {
  id: string;
  analysis_id: string;

  // Quality metrics
  image_quality_score: number;
  alignment_score: number;
  lighting_consistency: number;
  resolution_adequacy: boolean;

  // Validation flags
  manual_review_required: boolean;
  automated_validation_passed: boolean;

  // Review information
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;

  created_at: string;
}

// Analysis Comparison Interface
export interface AnalysisComparison {
  id: string;
  patient_id: string;
  baseline_analysis_id: string;
  current_analysis_id: string;

  // Comparison metrics
  improvement_trend: number;
  consistency_score: number;

  // Timeline information
  time_between_analyses: string; // PostgreSQL interval
  comparison_date: string;
}

// Analysis Summary View Interface
export interface AnalysisSummary {
  id: string;
  patient_id: string;
  patient_name: string;
  analysis_date: string;
  treatment_type: TreatmentType;
  accuracy_score: number;
  processing_time: number;
  improvement_percentage: number;
  meets_accuracy_requirement: boolean;
  meets_time_requirement: boolean;
  manual_review_required: boolean;
  automated_validation_passed: boolean;
  annotation_count: number;
}

// Performance Summary View Interface
export interface AnalysisPerformanceSummary {
  analysis_date: string;
  treatment_type: TreatmentType;
  total_analyses: number;
  avg_accuracy: number;
  avg_processing_time: number;
  avg_improvement: number;
  accuracy_compliant_count: number;
  time_compliant_count: number;
  fully_compliant_count: number;
}

// Analysis Request Interface
export interface AnalysisRequest {
  patient_id: string;
  before_image_id: string;
  after_image_id: string;
  treatment_type: TreatmentType;
  analysis_options?: AnalysisOptions;
}

// Analysis Options Interface
export interface AnalysisOptions {
  enable_detailed_metrics?: boolean;
  enable_annotations?: boolean;
  quality_threshold?: number;
  processing_priority?: "low" | "normal" | "high";
  custom_parameters?: Record<string, unknown>;
}

// Analysis Result Interface (for API responses)
export interface AnalysisResult {
  analysis: ImageAnalysis;
  performance: AnalysisPerformance;
  quality_control: AnalysisQualityControl;
  annotations: AnalysisAnnotation[];
  meets_requirements: {
    accuracy: boolean;
    processing_time: boolean;
    overall: boolean;
  };
}

// Analysis Progress Interface
export interface AnalysisProgress {
  analysis_id: string;
  status: AnalysisStatus;
  progress_percentage: number;
  current_step: string;
  estimated_completion: string;
  error_message?: string;
}

// Analysis Statistics Interface
export interface AnalysisStatistics {
  total_analyses: number;
  successful_analyses: number;
  failed_analyses: number;
  average_accuracy: number;
  average_processing_time: number;
  accuracy_compliance_rate: number;
  time_compliance_rate: number;
  overall_compliance_rate: number;
  improvement_trends: {
    treatment_type: TreatmentType;
    average_improvement: number;
    analysis_count: number;
  }[];
}

// Analysis Filter Interface
export interface AnalysisFilter {
  patient_id?: string;
  treatment_type?: TreatmentType;
  status?: AnalysisStatus;
  date_from?: string;
  date_to?: string;
  min_accuracy?: number;
  max_processing_time?: number;
  meets_requirements?: boolean;
  manual_review_required?: boolean;
  limit?: number;
  offset?: number;
  sort_by?: "analysis_date" | "accuracy_score" | "processing_time" | "improvement_percentage";
  sort_order?: "asc" | "desc";
}

// Analysis Export Interface
export interface AnalysisExport {
  format: "json" | "csv" | "pdf";
  include_images?: boolean;
  include_annotations?: boolean;
  include_performance_data?: boolean;
  date_range?: {
    from: string;
    to: string;
  };
  filters?: AnalysisFilter;
}

// Analysis Validation Interface
export interface AnalysisValidation {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  requirements_met: {
    accuracy: boolean;
    processing_time: boolean;
    image_quality: boolean;
    data_completeness: boolean;
  };
}

// Analysis Configuration Interface
export interface AnalysisConfiguration {
  accuracy_threshold: number; // Default: 0.95
  processing_time_limit: number; // Default: 30000ms
  quality_score_threshold: number; // Default: 0.85
  enable_auto_annotations: boolean;
  enable_performance_tracking: boolean;
  enable_quality_control: boolean;
  model_settings: {
    model_version: string;
    confidence_threshold: number;
    batch_size: number;
  };
}

// Error Interfaces
export interface AnalysisError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface AnalysisValidationError extends AnalysisError {
  field: string;
  expected: unknown;
  received: unknown;
}

export interface AnalysisProcessingError extends AnalysisError {
  step: string;
  retry_count: number;
  max_retries: number;
}

// Utility Types
export type AnalysisMetricKey = keyof ChangeMetrics;
export type AnalysisRequirement = "accuracy" | "processing_time" | "quality" | "completeness";
export type AnalysisCompliance = "compliant" | "non_compliant" | "partial";

// Constants
export const ANALYSIS_REQUIREMENTS = {
  MIN_ACCURACY: 0.95,
  MAX_PROCESSING_TIME: 30000, // 30 seconds in milliseconds
  MIN_CONFIDENCE: 0.8,
  MIN_QUALITY_SCORE: 0.85,
} as const;

export const TREATMENT_TYPE_LABELS: Record<TreatmentType, string> = {
  "skin-aesthetic": "Estética da Pele",
  "medical-healing": "Cicatrização Médica",
  "body-contouring": "Contorno Corporal",
  "facial-rejuvenation": "Rejuvenescimento Facial",
  "scar-treatment": "Tratamento de Cicatrizes",
  pigmentation: "Pigmentação",
};

export const ANNOTATION_TYPE_LABELS: Record<AnnotationType, string> = {
  measurement: "Medição",
  highlight: "Destaque",
  comparison: "Comparação",
  annotation: "Anotação",
};

export const ANALYSIS_STATUS_LABELS: Record<AnalysisStatus, string> = {
  pending: "Pendente",
  processing: "Processando",
  completed: "Concluído",
  failed: "Falhou",
  cancelled: "Cancelado",
};
