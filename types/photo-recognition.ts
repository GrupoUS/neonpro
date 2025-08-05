/**
 * Photo Recognition System Types
 * TypeScript definitions for the patient photo recognition and management system
 *
 * @author APEX Master Developer
 */

// Core Photo Types
export interface PatientPhoto {
  id: string;
  patientId: string;
  fileName: string;
  originalFileName: string;
  photoType: PhotoType;
  fileSize: number;
  mimeType: string;
  dimensions: {
    width: number;
    height: number;
  };
  storageUrl: string;
  thumbnailUrl?: string;
  uploadedAt: string;
  uploadedBy: string;
  metadata: PhotoMetadata;
  tags?: string[];
  isActive: boolean;
}

export type PhotoType = "profile" | "before" | "after" | "progress" | "document" | "other";

export interface PhotoMetadata {
  quality: PhotoQuality;
  facialFeatures?: FacialFeatures;
  exifData?: ExifData;
  processingInfo: ProcessingInfo;
  privacyInfo: PhotoPrivacyInfo;
}

export interface PhotoQuality {
  score: number; // 0-1
  issues: QualityIssue[];
  recommendations: string[];
  isAcceptable: boolean;
}

export type QualityIssue =
  | "low_resolution"
  | "poor_lighting"
  | "blurry"
  | "face_not_detected"
  | "multiple_faces"
  | "partial_face"
  | "poor_angle"
  | "oversized_file";

export interface FacialFeatures {
  detected: boolean;
  confidence: number; // 0-1
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  landmarks?: FacialLandmarks;
  encodings?: number[]; // Facial encoding vector
  similarity?: number; // Similarity to other photos
}

export interface FacialLandmarks {
  leftEye: Point;
  rightEye: Point;
  nose: Point;
  leftMouth: Point;
  rightMouth: Point;
  chin: Point;
}

export interface Point {
  x: number;
  y: number;
}

export interface ExifData {
  camera?: string;
  timestamp?: string;
  gpsLocation?: {
    latitude: number;
    longitude: number;
  };
  orientation?: number;
  flash?: boolean;
}

export interface ProcessingInfo {
  processedAt: string;
  processingTime: number; // milliseconds
  version: string;
  algorithms: string[];
  errors?: string[];
}

export interface PhotoPrivacyInfo {
  consentGiven: boolean;
  allowFacialRecognition: boolean;
  allowSharing: boolean;
  accessLevel: AccessLevel;
  retentionPeriod: number; // days
}

// Privacy and Consent Types
export interface PrivacyControls {
  patientId: string;
  allowFacialRecognition: boolean;
  allowPhotoSharing: boolean;
  dataRetentionPeriod: number;
  accessLevel: AccessLevel;
  consentGiven: boolean;
  consentDate: string;
  consentVersion: string;
  allowDataProcessing: boolean;
  allowThirdPartyAccess: boolean;
  notificationPreferences: NotificationPreferences;
  dataExportRequests: DataExportRequest[];
  deletionRequests: DeletionRequest[];
  updatedAt: string;
  updatedBy: string;
}

export type AccessLevel = "public" | "restricted" | "private";

export interface NotificationPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  dataProcessingAlerts: boolean;
  privacyUpdates: boolean;
}

export interface DataExportRequest {
  id: string;
  patientId: string;
  requestDate: string;
  requestedBy: string;
  status: ExportStatus;
  downloadUrl?: string;
  expiresAt?: string;
  completedAt?: string;
  fileSize?: number;
  format: "json" | "pdf" | "zip";
}

export type ExportStatus = "pending" | "processing" | "completed" | "failed" | "expired";

export interface DeletionRequest {
  id: string;
  patientId: string;
  requestDate: string;
  requestedBy: string;
  reason: string;
  status: DeletionStatus;
  scheduledDate?: string;
  completedDate?: string;
  approvedBy?: string;
  rejectionReason?: string;
}

export type DeletionStatus = "pending" | "approved" | "completed" | "rejected";

export interface ConsentHistory {
  id: string;
  patientId: string;
  version: string;
  givenAt: string;
  revokedAt?: string;
  changes: string[];
  givenBy: string;
  ipAddress?: string;
  userAgent?: string;
}

// Verification Types
export interface VerificationAttempt {
  id: string;
  patientId: string;
  photoId?: string;
  verificationMethod: VerificationMethod;
  result: VerificationResult;
  confidence: number;
  timestamp: string;
  performedBy: string;
  metadata: VerificationMetadata;
}

export type VerificationMethod = "facial_recognition" | "manual_review" | "document_check";

export interface VerificationResult {
  success: boolean;
  matchedPhotoId?: string;
  similarity: number;
  threshold: number;
  reasons: string[];
  flags: VerificationFlag[];
}

export type VerificationFlag =
  | "low_confidence"
  | "multiple_matches"
  | "no_matches"
  | "quality_issues"
  | "privacy_restricted"
  | "manual_review_required";

export interface VerificationMetadata {
  processingTime: number;
  algorithm: string;
  version: string;
  deviceInfo?: DeviceInfo;
  location?: Location;
}

export interface DeviceInfo {
  userAgent: string;
  platform: string;
  camera?: CameraInfo;
}

export interface CameraInfo {
  deviceId: string;
  label: string;
  resolution: {
    width: number;
    height: number;
  };
}

export interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
}

// Statistics Types
export interface PhotoRecognitionStats {
  patientId?: string;
  timeframe?: {
    start: string;
    end: string;
  };
  totalPhotos: number;
  photosByType: Record<PhotoType, number>;
  verificationAttempts: number;
  successfulVerifications: number;
  averageConfidence: number;
  privacyCompliance: PrivacyComplianceStats;
  storageUsage: StorageUsageStats;
  recentActivity: RecentActivityStats;
  qualityMetrics: QualityMetrics;
}

export interface PrivacyComplianceStats {
  consentGiven: boolean;
  lgpdCompliant: boolean;
  dataRetentionDays: number;
  pendingRequests: {
    exports: number;
    deletions: number;
  };
}

export interface StorageUsageStats {
  totalSize: number;
  averageFileSize: number;
  photoCount: number;
  thumbnailSize: number;
}

export interface RecentActivityStats {
  lastUpload?: string;
  lastVerification?: string;
  lastPrivacyUpdate?: string;
  recentUploads: number;
  recentVerifications: number;
}

export interface QualityMetrics {
  averageQualityScore: number;
  acceptablePhotos: number;
  rejectedPhotos: number;
  commonIssues: Record<QualityIssue, number>;
}

// Configuration Types
export interface PhotoRecognitionConfig {
  maxFileSize: number;
  allowedMimeTypes: string[];
  requiredDimensions: {
    minWidth: number;
    minHeight: number;
    maxWidth: number;
    maxHeight: number;
  };
  qualityThresholds: {
    minimum: number;
    recommended: number;
  };
  facialRecognition: {
    enabled: boolean;
    confidenceThreshold: number;
    maxFaces: number;
    requireFaceDetection: boolean;
  };
  privacy: {
    defaultRetentionPeriod: number;
    requireConsent: boolean;
    allowAnonymousUpload: boolean;
  };
  storage: {
    generateThumbnails: boolean;
    thumbnailSize: number;
    compressionQuality: number;
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
    timestamp: string;
    requestId: string;
    version: string;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Upload Types
export interface PhotoUploadRequest {
  patientId: string;
  photoType: PhotoType;
  file: File;
  tags?: string[];
  metadata?: Partial<PhotoMetadata>;
  privacySettings?: Partial<PhotoPrivacyInfo>;
}

export interface PhotoUploadResponse {
  photo: PatientPhoto;
  processingResults: {
    quality: PhotoQuality;
    facialFeatures?: FacialFeatures;
    warnings: string[];
  };
}

// Component Props Types
export interface PhotoRecognitionSystemProps {
  patientId: string;
  patientName: string;
  patientEmail?: string;
  onSystemUpdate?: (data: any) => void;
  defaultTab?: string;
  permissions?: SystemPermissions;
  config?: Partial<PhotoRecognitionConfig>;
}

export interface SystemPermissions {
  canUpload: boolean;
  canVerify: boolean;
  canManagePrivacy: boolean;
  canViewStats: boolean;
  canDelete: boolean;
  canExport: boolean;
  canManageConsent: boolean;
}

export interface PhotoUploadProps {
  patientId: string;
  patientName: string;
  onPhotoUploaded?: (photo: PatientPhoto) => void;
  maxFileSize?: number;
  allowedTypes?: string[];
  enableFacialRecognition?: boolean;
  config?: Partial<PhotoRecognitionConfig>;
}

export interface IdentityVerificationProps {
  patientId: string;
  patientName: string;
  onVerificationCompleted?: (result: VerificationAttempt) => void;
  enableCamera?: boolean;
  confidenceThreshold?: number;
  config?: Partial<PhotoRecognitionConfig>;
}

export interface PhotoGalleryProps {
  patientId: string;
  patientName: string;
  onPhotoDeleted?: (photoId: string) => void;
  allowDelete?: boolean;
  allowDownload?: boolean;
  filterByType?: PhotoType;
  config?: Partial<PhotoRecognitionConfig>;
}

export interface PrivacyControlsProps {
  patientId: string;
  patientName: string;
  onPrivacyUpdated?: (controls: PrivacyControls) => void;
  readOnly?: boolean;
  config?: Partial<PhotoRecognitionConfig>;
}

// Error Types
export class PhotoRecognitionError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any,
  ) {
    super(message);
    this.name = "PhotoRecognitionError";
  }
}

export class PrivacyViolationError extends PhotoRecognitionError {
  constructor(message: string, details?: any) {
    super(message, "PRIVACY_VIOLATION", details);
    this.name = "PrivacyViolationError";
  }
}

export class QualityError extends PhotoRecognitionError {
  constructor(message: string, issues: QualityIssue[], details?: any) {
    super(message, "QUALITY_ERROR", { issues, ...details });
    this.name = "QualityError";
  }
}

export class VerificationError extends PhotoRecognitionError {
  constructor(message: string, details?: any) {
    super(message, "VERIFICATION_ERROR", details);
    this.name = "VerificationError";
  }
}

// Utility Types
export type PhotoRecognitionEvent =
  | { type: "photo_uploaded"; data: PatientPhoto }
  | { type: "photo_deleted"; data: { photoId: string } }
  | { type: "verification_completed"; data: VerificationAttempt }
  | { type: "privacy_updated"; data: PrivacyControls }
  | { type: "consent_given"; data: ConsentHistory }
  | { type: "consent_revoked"; data: ConsentHistory }
  | { type: "export_requested"; data: DataExportRequest }
  | { type: "deletion_requested"; data: DeletionRequest };

export type PhotoRecognitionEventHandler = (event: PhotoRecognitionEvent) => void;

// Database Schema Types (for reference)
export interface PatientPhotoTable {
  id: string;
  patient_id: string;
  file_name: string;
  original_file_name: string;
  photo_type: PhotoType;
  file_size: number;
  mime_type: string;
  dimensions: string; // JSON
  storage_url: string;
  thumbnail_url?: string;
  uploaded_at: string;
  uploaded_by: string;
  metadata: string; // JSON
  tags?: string; // JSON array
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PrivacyControlsTable {
  id: string;
  patient_id: string;
  allow_facial_recognition: boolean;
  allow_photo_sharing: boolean;
  data_retention_period: number;
  access_level: AccessLevel;
  consent_given: boolean;
  consent_date: string;
  consent_version: string;
  allow_data_processing: boolean;
  allow_third_party_access: boolean;
  notification_preferences: string; // JSON
  created_at: string;
  updated_at: string;
  updated_by: string;
}

export interface VerificationAttemptsTable {
  id: string;
  patient_id: string;
  photo_id?: string;
  verification_method: VerificationMethod;
  result: string; // JSON
  confidence: number;
  timestamp: string;
  performed_by: string;
  metadata: string; // JSON
  created_at: string;
}

// Export all types as a namespace for easier imports
export namespace PhotoRecognition {
  export type Photo = PatientPhoto;
  export type Privacy = PrivacyControls;
  export type Verification = VerificationAttempt;
  export type Stats = PhotoRecognitionStats;
  export type Config = PhotoRecognitionConfig;
  export type Event = PhotoRecognitionEvent;
  export type EventHandler = PhotoRecognitionEventHandler;
  export type Permissions = SystemPermissions;
}
