/**
 * Complication Detection Types
 * Epic 10 - Story 10.3: Automated Complication Detection + Alerts (≥90% Accuracy)
 * 
 * Comprehensive TypeScript type definitions for the complication detection system
 * Supports ≥90% accuracy requirements with immediate alerts and emergency protocols
 * 
 * BMAD METHOD + VOIDBEAST V6.0 ENHANCED - Quality ≥9.8/10
 */

import { z } from 'zod';
import type { TreatmentType } from '../types';

// Core Types
export type ComplicationCategory = 
  | 'infection'
  | 'adverse_reaction' 
  | 'healing_issue'
  | 'procedural_complication'
  | 'allergic_reaction'
  | 'medication_reaction'
  | 'device_malfunction'
  | 'other';

export type ComplicationSeverity = 'low' | 'moderate' | 'high' | 'critical';

export type AlertLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';

export type DetectionConfidence = number; // 0.0 to 1.0

export type EmergencyProtocolLevel = 'routine' | 'urgent' | 'emergency';

// Request/Response Interfaces
export interface ComplicationDetectionRequest {
  imageId: string;
  patientId: string;
  treatmentType: TreatmentType;
  previousAnalysisId?: string;
  clinicianId: string;
  urgencyLevel?: 'routine' | 'urgent' | 'emergency';
  metadata?: {
    captureDate: string;
    deviceInfo?: string;
    lighting?: 'natural' | 'artificial' | 'mixed';
    angle?: string;
    distance?: string;
  };
}

export interface ComplicationDetectionResult {
  id: string;
  imageId: string;
  patientId: string;
  treatmentType: TreatmentType;
  detectionTimestamp: string;
  processingTimeMs: number;
  overallRiskScore: number; // 0.0 to 1.0
  detectedComplications: DetectedComplication[];
  confidence: DetectionConfidence;
  alertLevel: AlertLevel;
  emergencyProtocol: EmergencyProtocol | null;
  recommendations: string[];
  requiresManualReview: boolean;
  metadata: DetectionMetadata;
}

export interface DetectedComplication {
  type: ComplicationCategory;
  severity: ComplicationSeverity;
  confidence: DetectionConfidence;
  description: string;
  affectedArea?: BoundingBox;
  modelSource: string;
  detected_at: string;
  clinicalSignificance?: 'high' | 'medium' | 'low';
  recommendedAction?: string;
  timeToResolution?: string;
  followUpRequired?: boolean;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

export interface EmergencyProtocol {
  level: EmergencyProtocolLevel;
  immediateActions: string[];
  notificationTargets: NotificationTarget[];
  timeframe: string; // e.g., 'immediate', '1_hour', '24_hours'
  escalationPath: string;
  documentation: string;
  contactInformation?: EmergencyContact[];
}

export type NotificationTarget = 
  | 'attending_physician'
  | 'supervising_physician'
  | 'clinic_manager'
  | 'emergency_contact'
  | 'patient'
  | 'emergency_services'
  | 'specialist_consultant';

export interface EmergencyContact {
  role: string;
  name: string;
  phone: string;
  email?: string;
  availability: string;
}

export interface DetectionMetadata {
  modelVersions: ModelVersion[];
  qualityMetrics: QualityMetrics;
  processingMetadata: ProcessingMetadata;
  validationResults?: ValidationResult[];
}

export interface ModelVersion {
  type: string;
  version: string;
  accuracy: number;
  confidenceThreshold: number;
  lastTrained?: string;
}

export interface QualityMetrics {
  accuracy: number;
  confidence: number;
  processing_quality: number;
  detection_reliability: number;
  false_positive_rate?: number;
  false_negative_rate?: number;
  sensitivity?: number;
  specificity?: number;
}

export interface ProcessingMetadata {
  processingTime: number;
  imageQuality: number;
  detectionAccuracy: number;
  memoryUsage?: number;
  cpuUsage?: number;
  gpuUsage?: number;
  cacheHits?: number;
}

export interface ValidationResult {
  validator: string;
  validated_at: string;
  result: 'confirmed' | 'rejected' | 'uncertain';
  confidence: number;
  notes?: string;
}

// Alert System Types
export interface ComplicationAlert {
  id: string;
  detectionResultId: string;
  patientId: string;
  alertLevel: AlertLevel;
  complicationType: ComplicationCategory;
  severity: ComplicationSeverity;
  triggeredAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  escalated?: boolean;
  escalatedTo?: string;
  notificationsSent: AlertNotification[];
  status: AlertStatus;
}

export type AlertStatus = 
  | 'pending'
  | 'acknowledged'
  | 'in_progress'
  | 'resolved'
  | 'escalated'
  | 'dismissed';

export interface AlertNotification {
  id: string;
  target: NotificationTarget;
  method: 'email' | 'sms' | 'push' | 'call' | 'pager';
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  retryCount: number;
}

// Validation and False Positive Management
export interface ValidationRequest {
  detectionResultId: string;
  validatorId: string;
  validationType: 'expert_review' | 'automated_check' | 'peer_review';
  validationData: {
    actualDiagnosis?: string;
    clinicalNotes?: string;
    imageQualityAssessment?: number;
    treatmentOutcome?: string;
    followUpResults?: string;
  };
}

export interface ValidationResponse {
  validationId: string;
  detectionResultId: string;
  validator: {
    id: string;
    name: string;
    role: string;
    credentials: string[];
  };
  validatedAt: string;
  result: ValidationResult;
  feedback: string;
  improvementSuggestions?: string[];
  falsPositiveFlag?: boolean;
  falseNegativeFlag?: boolean;
  qualityScore: number;
}

// Quality Assurance Types
export interface QualityAssuranceMetrics {
  period: string; // e.g., 'daily', 'weekly', 'monthly'
  totalDetections: number;
  complicationsDetected: number;
  falsePositives: number;
  falseNegatives: number;
  averageAccuracy: number;
  averageConfidence: number;
  averageProcessingTime: number;
  alertLevelDistribution: Record<AlertLevel, number>;
  modelPerformance: ModelPerformanceMetrics[];
  qualityTrends: QualityTrend[];
}

export interface ModelPerformanceMetrics {
  modelType: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc: number;
  totalPredictions: number;
  correctPredictions: number;
  lastEvaluated: string;
}

export interface QualityTrend {
  date: string;
  accuracy: number;
  falsePositiveRate: number;
  falseNegativeRate: number;
  averageConfidence: number;
  totalDetections: number;
}

// Configuration Types
export interface ComplicationDetectionConfig {
  models: {
    [key: string]: ModelConfig;
  };
  thresholds: {
    confidenceThreshold: number;
    riskScoreThreshold: number;
    alertThresholds: Record<AlertLevel, number>;
    qualityThreshold: number;
  };
  alerts: {
    enableImmediateAlerts: boolean;
    enableEscalation: boolean;
    escalationTimeouts: Record<AlertLevel, number>;
    notificationMethods: string[];
    emergencyContacts: EmergencyContact[];
  };
  processing: {
    maxProcessingTime: number;
    parallelProcessing: boolean;
    gpuAcceleration: boolean;
    cacheResults: boolean;
    batchSize: number;
  };
  validation: {
    enableAutomaticValidation: boolean;
    requireExpertValidation: boolean;
    expertValidationThreshold: number;
    validationTimeout: number;
  };
}

export interface ModelConfig {
  name: string;
  version: string;
  url: string;
  weightsUrl: string;
  inputShape: number[];
  outputClasses: string[];
  confidenceThreshold: number;
  accuracy: number;
  lastTrained: string;
  trainingDataSize: number;
  validationAccuracy: number;
  enabled: boolean;
}

// Analytics and Reporting Types
export interface ComplicationStatistics {
  timeframe: string;
  totalDetections: number;
  complicationsDetected: number;
  complicationsByType: Record<ComplicationCategory, number>;
  complicationsBySeverity: Record<ComplicationSeverity, number>;
  averageProcessingTime: number;
  averageAccuracy: number;
  averageConfidence: number;
  alertLevelDistribution: Record<AlertLevel, number>;
  treatmentTypeDistribution: Record<TreatmentType, number>;
  falsePositiveRate: number;
  falseNegativeRate: number;
  modelPerformanceComparison: ModelPerformanceComparison[];
}

export interface ModelPerformanceComparison {
  modelType: string;
  detections: number;
  accuracy: number;
  averageConfidence: number;
  processingTime: number;
  falsePositives: number;
  falseNegatives: number;
}

// Patient-Specific Types
export interface PatientComplicationHistory {
  patientId: string;
  totalDetections: number;
  complicationsDetected: DetectedComplication[];
  riskFactors: string[];
  treatmentHistory: TreatmentRecord[];
  allergies: string[];
  medications: string[];
  lastAssessment: string;
  riskProfile: 'low' | 'medium' | 'high';
}

export interface TreatmentRecord {
  treatmentId: string;
  treatmentType: TreatmentType;
  date: string;
  complications: DetectedComplication[];
  outcome: 'successful' | 'complications' | 'adverse_reaction';
  notes: string;
}

// Real-time Monitoring Types
export interface RealtimeDetectionEvent {
  type: 'detection_started' | 'detection_completed' | 'alert_triggered' | 'validation_completed';
  timestamp: string;
  patientId: string;
  detectionId?: string;
  alertId?: string;
  data: any;
}

export interface SystemHealthMetrics {
  timestamp: string;
  systemStatus: 'healthy' | 'degraded' | 'critical';
  modelStatus: Record<string, 'online' | 'offline' | 'degraded'>;
  processingQueue: {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };
  performance: {
    averageProcessingTime: number;
    throughput: number;
    errorRate: number;
    accuracy: number;
  };
  resources: {
    cpuUsage: number;
    memoryUsage: number;
    gpuUsage: number;
    diskUsage: number;
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    requestId: string;
    timestamp: string;
    processingTime: number;
    version: string;
  };
}

export type ComplicationDetectionResponse = ApiResponse<ComplicationDetectionResult>;
export type ValidationResponse_API = ApiResponse<ValidationResponse>;
export type StatisticsResponse = ApiResponse<ComplicationStatistics>;
export type HealthResponse = ApiResponse<SystemHealthMetrics>;

// Zod Schemas for Runtime Validation
export const ComplicationDetectionRequestSchema = z.object({
  imageId: z.string().uuid('Invalid image ID format'),
  patientId: z.string().uuid('Invalid patient ID format'),
  treatmentType: z.string().min(1, 'Treatment type is required'),
  previousAnalysisId: z.string().uuid().optional(),
  clinicianId: z.string().uuid('Invalid clinician ID format'),
  urgencyLevel: z.enum(['routine', 'urgent', 'emergency']).default('routine'),
  metadata: z.object({
    captureDate: z.string().datetime('Invalid capture date format'),
    deviceInfo: z.string().optional(),
    lighting: z.enum(['natural', 'artificial', 'mixed']).optional(),
    angle: z.string().optional(),
    distance: z.string().optional()
  }).optional()
});

export const ValidationRequestSchema = z.object({
  detectionResultId: z.string().uuid('Invalid detection result ID'),
  validatorId: z.string().uuid('Invalid validator ID'),
  validationType: z.enum(['expert_review', 'automated_check', 'peer_review']),
  validationData: z.object({
    actualDiagnosis: z.string().optional(),
    clinicalNotes: z.string().optional(),
    imageQualityAssessment: z.number().min(0).max(10).optional(),
    treatmentOutcome: z.string().optional(),
    followUpResults: z.string().optional()
  })
});

export const AlertAcknowledgmentSchema = z.object({
  alertId: z.string().uuid('Invalid alert ID'),
  acknowledgedBy: z.string().uuid('Invalid user ID'),
  notes: z.string().optional(),
  escalate: z.boolean().default(false),
  escalateTo: z.string().optional()
});

// Error Types
export interface ComplicationDetectionError extends Error {
  code: 'INVALID_IMAGE' | 'PROCESSING_TIMEOUT' | 'MODEL_ERROR' | 'STORAGE_ERROR' | 'VALIDATION_ERROR';
  patientId?: string;
  imageId?: string;
  timestamp: string;
  retryable: boolean;
}

// Export all types
export type {
  // ... (all types are already exported above)
};

// Constants
export const COMPLICATION_DETECTION_CONSTANTS = {
  MIN_ACCURACY_THRESHOLD: 0.90, // Story requirement: ≥90% accuracy
  MIN_CONFIDENCE_THRESHOLD: 0.85,
  MAX_PROCESSING_TIME_MS: 30000, // 30 seconds max
  QUALITY_THRESHOLD: 9.8, // VOIDBEAST V6.0 standard
  
  ALERT_TIMEFRAMES: {
    critical: 'immediate', // < 5 minutes
    high: '1_hour',
    medium: '4_hours', 
    low: '24_hours',
    none: 'routine'
  },
  
  DEFAULT_MODEL_TYPES: [
    'infection_detector',
    'adverse_reaction_detector',
    'healing_issue_detector', 
    'procedural_complication_detector'
  ]
} as const;
