/**
 * Vision Analysis System Types
 * Comprehensive TypeScript type definitions for NeonPro Computer Vision System
 * Epic 10 - Story 10.1: Automated Before/After Analysis
 *
 * VOIDBEAST V4.0 APEX ENHANCED - Quality ≥9.5/10
 */

import type { TREATMENT_TYPES, ANALYSIS_STATUS, ERROR_CODES } from "./config";

// Base Types
export type TreatmentType = (typeof TREATMENT_TYPES)[keyof typeof TREATMENT_TYPES];
export type AnalysisStatus = (typeof ANALYSIS_STATUS)[keyof typeof ANALYSIS_STATUS];
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

// Image Processing Types
export interface ImageData {
  id: string;
  url: string;
  filename: string;
  size: number;
  width: number;
  height: number;
  format: string;
  uploadedAt: string;
  metadata?: ImageMetadata;
}

export interface ImageMetadata {
  exif?: Record<string, any>;
  colorProfile?: string;
  dpi?: number;
  compression?: string;
  quality?: number;
}

export interface ImageProcessingOptions {
  resize?: {
    width: number;
    height: number;
    maintainAspectRatio?: boolean;
  };
  normalize?: boolean;
  enhance?: {
    contrast?: boolean;
    brightness?: boolean;
    saturation?: boolean;
    sharpness?: boolean;
    noiseReduction?: boolean;
  };
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  rotation?: number;
  flip?: "horizontal" | "vertical" | "both";
}

// Analysis Result Types
export interface AnalysisResult {
  id: string;
  patientId: string;
  userId: string;
  treatmentType: TreatmentType;
  status: AnalysisStatus;
  beforeImage: ImageData;
  afterImage: ImageData;
  analysisData: VisionAnalysisData;
  measurementData: MeasurementData;
  qualityMetrics: QualityMetrics;
  processingMetrics: ProcessingMetrics;
  annotations: AnnotationData[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  notes?: string;
}

export interface VisionAnalysisData {
  improvementPercentage: number;
  accuracyScore: number;
  confidence: number;
  changeMetrics: ChangeMetrics;
  overallAssessment: OverallAssessment;
  treatmentSpecificMetrics: TreatmentSpecificMetrics;
}

export interface ChangeMetrics {
  skinTexture?: number;
  wrinkleReduction?: number;
  pigmentationImprovement?: number;
  lesionHealing?: number;
  scarReduction?: number;
  volumeChange?: number;
  symmetryImprovement?: number;
  colorUniformity?: number;
  surfaceRoughness?: number;
  poreSize?: number;
}

export interface OverallAssessment {
  improvementScore: number; // 0-10 scale
  confidenceLevel: number; // 0-1 scale
  clinicalSignificance: "none" | "minimal" | "moderate" | "significant" | "dramatic";
  recommendedFollowUp?: string;
  concerns?: string[];
}

export interface TreatmentSpecificMetrics {
  [key: string]: {
    beforeValue: number;
    afterValue: number;
    changePercentage: number;
    unit: string;
    confidence: number;
    clinicalRelevance: number;
  };
}

// Measurement Types
export interface MeasurementData {
  measurements: ObjectiveMeasurement[];
  calibration: CalibrationData;
  standardizedMetrics: StandardizedMetrics;
  qualityAssurance: MeasurementQualityAssurance;
}

export interface ObjectiveMeasurement {
  id: string;
  type: MeasurementType;
  beforeValue: number;
  afterValue: number;
  changeValue: number;
  changePercentage: number;
  unit: string;
  confidence: number;
  coordinates?: Coordinates;
  roi?: RegionOfInterest;
  clinicalSignificance: ClinicalSignificance;
  methodology: string;
  timestamp: string;
}

export type MeasurementType =
  | "area"
  | "perimeter"
  | "volume"
  | "distance"
  | "angle"
  | "intensity"
  | "texture"
  | "color"
  | "symmetry"
  | "roughness"
  | "depth"
  | "curvature";

export interface CalibrationData {
  pixelToMmRatio: number;
  referenceObject?: string;
  calibrationAccuracy: number;
  calibrationMethod: "automatic" | "manual" | "reference_object";
  calibrationTimestamp: string;
}

export interface StandardizedMetrics {
  beforeMetrics: MetricSet;
  afterMetrics: MetricSet;
  changeMetrics: MetricSet;
  normalizedScores: NormalizedScores;
}

export interface MetricSet {
  area: number;
  perimeter: number;
  volume?: number;
  averageIntensity: number;
  textureContrast: number;
  colorUniformity: number;
  symmetryScore: number;
  roughnessIndex: number;
}

export interface NormalizedScores {
  improvementScore: number; // 0-100
  severityScore: number; // 0-100
  qualityScore: number; // 0-100
  confidenceScore: number; // 0-100
}

export interface MeasurementQualityAssurance {
  accuracy: number;
  precision: number;
  repeatability: number;
  reproducibility: number;
  uncertainty: number;
  validationStatus: "passed" | "failed" | "warning";
  qualityFlags: string[];
}

export type ClinicalSignificance =
  | "not_significant"
  | "minimal"
  | "moderate"
  | "significant"
  | "highly_significant";

// Annotation Types
export interface AnnotationData {
  id: string;
  type: AnnotationType;
  description: string;
  coordinates: Coordinates;
  value?: number;
  unit?: string;
  confidence: number;
  color?: string;
  visible: boolean;
  createdBy: "system" | "user";
  timestamp: string;
  metadata?: Record<string, any>;
}

export type AnnotationType =
  | "measurement"
  | "highlight"
  | "comparison"
  | "improvement"
  | "concern"
  | "note"
  | "roi"
  | "landmark";

export interface Coordinates {
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
}

export interface RegionOfInterest {
  id: string;
  name: string;
  coordinates: Coordinates[];
  type: "polygon" | "rectangle" | "circle" | "freeform";
  area: number;
  confidence: number;
}

// Performance and Quality Types
export interface ProcessingMetrics {
  processingTimeMs: number;
  memoryUsageMB: number;
  cpuUsagePercent: number;
  gpuUsagePercent?: number;
  modelLoadTimeMs: number;
  imagePreprocessingTimeMs: number;
  analysisTimeMs: number;
  postprocessingTimeMs: number;
  totalOperations: number;
  cacheHitRate: number;
  errorCount: number;
  warningCount: number;
}

export interface QualityMetrics {
  overallQuality: number; // 0-10 scale (VOIDBEAST standard)
  imageQuality: ImageQualityMetrics;
  analysisQuality: AnalysisQualityMetrics;
  measurementQuality: MeasurementQualityMetrics;
  voidbeastCompliance: VoidBeastCompliance;
}

export interface ImageQualityMetrics {
  sharpness: number;
  contrast: number;
  brightness: number;
  noiseLevel: number;
  colorAccuracy: number;
  resolution: number;
  compression: number;
  overallScore: number;
}

export interface AnalysisQualityMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confidence: number;
  consistency: number;
  robustness: number;
  overallScore: number;
}

export interface MeasurementQualityMetrics {
  accuracy: number;
  precision: number;
  repeatability: number;
  calibrationQuality: number;
  uncertaintyLevel: number;
  validationScore: number;
  overallScore: number;
}

export interface VoidBeastCompliance {
  compliant: boolean;
  score: number;
  violations: string[];
  recommendations: string[];
  qualityGate: "passed" | "failed" | "warning";
}

// Model and AI Types
export interface ModelConfiguration {
  name: string;
  version: string;
  type: "primary" | "fallback" | "specialized";
  inputShape: number[];
  outputClasses: number;
  confidenceThreshold: number;
  modelUrl: string;
  weightsUrl: string;
  metadata: ModelMetadata;
}

export interface ModelMetadata {
  trainedOn: string[];
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  trainingDate: string;
  validationDate: string;
  supportedTreatments: TreatmentType[];
  modelSize: number;
  inferenceTime: number;
}

export interface ModelPrediction {
  class: string;
  confidence: number;
  probability: number;
  boundingBox?: BoundingBox;
  features: number[];
  activations?: number[];
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

// Export and Import Types
export interface ExportOptions {
  format: ExportFormat;
  includeImages: boolean;
  includeAnnotations: boolean;
  includeMetrics: boolean;
  includeMeasurements: boolean;
  includeTimeline: boolean;
  customFields?: string[];
  reportTitle?: string;
  reportNotes?: string;
  watermark?: boolean;
  compression?: CompressionLevel;
}

export type ExportFormat = "pdf" | "excel" | "json" | "csv" | "png" | "jpeg";
export type CompressionLevel = "none" | "low" | "medium" | "high";

export interface ExportResult {
  success: boolean;
  data?: Buffer | string;
  filename: string;
  contentType: string;
  size: number;
  processingTime: number;
  error?: string;
}

export interface ExportMetadata {
  exportId: string;
  userId: string;
  analysisIds: string[];
  format: ExportFormat;
  options: ExportOptions;
  fileSize: number;
  processingTime: number;
  createdAt: string;
  downloadCount: number;
  expiresAt?: string;
}

// API Request/Response Types
export interface AnalysisRequest {
  patientId: string;
  treatmentType: TreatmentType;
  beforeImageFile: File;
  afterImageFile: File;
  processingOptions?: ImageProcessingOptions;
  analysisOptions?: AnalysisOptions;
  notes?: string;
}

export interface AnalysisOptions {
  enabledMetrics: string[];
  customThresholds?: Record<string, number>;
  roiSelection?: RegionOfInterest[];
  calibrationMethod?: "auto" | "manual" | "reference";
  qualityLevel: "fast" | "standard" | "high" | "maximum";
  includeAnnotations: boolean;
  generateReport: boolean;
}

export interface AnalysisResponse {
  success: boolean;
  analysisId: string;
  status: AnalysisStatus;
  result?: AnalysisResult;
  progress?: AnalysisProgress;
  error?: AnalysisError;
  estimatedCompletionTime?: number;
}

export interface AnalysisProgress {
  stage: AnalysisStage;
  percentage: number;
  currentOperation: string;
  estimatedTimeRemaining: number;
  processingMetrics: Partial<ProcessingMetrics>;
}

export type AnalysisStage =
  | "initializing"
  | "loading_images"
  | "preprocessing"
  | "model_loading"
  | "analyzing"
  | "measuring"
  | "annotating"
  | "quality_check"
  | "finalizing"
  | "completed";

export interface AnalysisError {
  code: ErrorCode;
  message: string;
  details?: string;
  timestamp: string;
  recoverable: boolean;
  suggestions?: string[];
}

// Database Schema Types
export interface VisionAnalysisTable {
  id: string;
  user_id: string;
  patient_id: string;
  treatment_type: TreatmentType;
  status: AnalysisStatus;
  before_image_url: string;
  after_image_url: string;
  before_image_metadata: ImageMetadata;
  after_image_metadata: ImageMetadata;
  analysis_result: VisionAnalysisData;
  measurement_result: MeasurementData;
  quality_metrics: QualityMetrics;
  processing_metrics: ProcessingMetrics;
  annotations: AnnotationData[];
  notes?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface VisionExportLogsTable {
  id: string;
  user_id: string;
  analysis_id: string;
  export_format: ExportFormat;
  export_options: ExportOptions;
  file_size_bytes: number;
  processing_time_ms: number;
  success: boolean;
  error_message?: string;
  download_count: number;
  created_at: string;
  expires_at?: string;
}

export interface VisionPerformanceLogsTable {
  id: string;
  analysis_id: string;
  user_id: string;
  processing_time_ms: number;
  memory_usage_mb: number;
  cpu_usage_percent: number;
  gpu_usage_percent?: number;
  accuracy_score: number;
  confidence_score: number;
  quality_score: number;
  voidbeast_compliant: boolean;
  error_count: number;
  warning_count: number;
  created_at: string;
}

// Utility Types
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface FilterOptions {
  treatmentType?: TreatmentType[];
  status?: AnalysisStatus[];
  dateRange?: {
    start: string;
    end: string;
  };
  qualityThreshold?: number;
  accuracyThreshold?: number;
  patientId?: string;
}

export interface SortOptions {
  field: string;
  direction: "asc" | "desc";
}

// Event Types for Real-time Updates
export interface AnalysisEvent {
  type: AnalysisEventType;
  analysisId: string;
  userId: string;
  data: any;
  timestamp: string;
}

export type AnalysisEventType =
  | "analysis_started"
  | "analysis_progress"
  | "analysis_completed"
  | "analysis_failed"
  | "analysis_cancelled"
  | "export_started"
  | "export_completed"
  | "export_failed";

// Validation Types
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
  value?: any;
}

export interface ValidationWarning {
  field: string;
  code: string;
  message: string;
  value?: any;
}

// Configuration Types
export interface SystemConfiguration {
  performance: PerformanceConfig;
  imageProcessing: ImageProcessingConfig;
  models: ModelConfig;
  storage: StorageConfig;
  security: SecurityConfig;
  monitoring: MonitoringConfig;
}

export interface PerformanceConfig {
  maxProcessingTimeMs: number;
  targetProcessingTimeMs: number;
  minAccuracyThreshold: number;
  targetAccuracy: number;
  minConfidenceThreshold: number;
  qualityThreshold: number;
  maxMemoryUsageMB: number;
  gpuAccelerationEnabled: boolean;
  parallelProcessingEnabled: boolean;
  cacheEnabled: boolean;
  cacheTtlMs: number;
}

export interface ImageProcessingConfig {
  maxImageSizeMB: number;
  supportedFormats: string[];
  targetResolution: { width: number; height: number };
  minResolution: { width: number; height: number };
  maxResolution: { width: number; height: number };
  compressionQuality: number;
  normalization: { mean: number[]; std: number[] };
  enhancement: Record<string, boolean>;
}

export interface ModelConfig {
  primaryModel: ModelConfiguration;
  fallbackModel: ModelConfiguration;
  preloadModels: boolean;
  modelCacheSize: number;
  autoModelSelection: boolean;
}

export interface StorageConfig {
  imageBucket: string;
  resultsBucket: string;
  tempBucket: string;
  maxStoragePerUserGB: number;
  autoCleanupTempFiles: boolean;
  tempFileTtlHours: number;
  backupEnabled: boolean;
  compressionEnabled: boolean;
}

export interface SecurityConfig {
  encryptionEnabled: boolean;
  anonymizationEnabled: boolean;
  auditLogging: boolean;
  accessControl: string;
  dataRetentionDays: number;
  gdprCompliance: boolean;
  hipaaCompliance: boolean;
}

export interface MonitoringConfig {
  performanceTracking: boolean;
  errorTracking: boolean;
  usageAnalytics: boolean;
  qualityMetrics: boolean;
  realTimeMonitoring: boolean;
  alertThresholds: Record<string, number>;
}

// Type Guards
export function isAnalysisResult(obj: any): obj is AnalysisResult {
  return obj && typeof obj.id === "string" && typeof obj.analysisData === "object";
}

export function isValidTreatmentType(type: string): type is TreatmentType {
  return Object.values(TREATMENT_TYPES).includes(type as TreatmentType);
}

export function isValidAnalysisStatus(status: string): status is AnalysisStatus {
  return Object.values(ANALYSIS_STATUS).includes(status as AnalysisStatus);
}

export function isValidErrorCode(code: string): code is ErrorCode {
  return Object.values(ERROR_CODES).includes(code as ErrorCode);
}

// Helper Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Re-export commonly used types
export type {
  TreatmentType,
  AnalysisStatus,
  ErrorCode,
  ExportFormat,
  CompressionLevel,
  AnnotationType,
  MeasurementType,
  ClinicalSignificance,
  AnalysisStage,
  AnalysisEventType,
};
