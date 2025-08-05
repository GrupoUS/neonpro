// Cloudflare Environment types for file processing service
export interface Env {
  // R2 Buckets
  MEDICAL_DOCUMENTS: R2Bucket;
  PROCESSED_FILES: R2Bucket;

  // KV Namespaces
  FILE_PROCESSING_CACHE: KVNamespace;
  FILE_METADATA: KVNamespace;

  // D1 Database
  NEONPRO_DB: D1Database;

  // Durable Objects
  FILE_PROCESSOR: DurableObjectNamespace;

  // Secrets
  JWT_SECRET: string;
  ENCRYPTION_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_KEY: string;

  // External APIs
  OCR_API_KEY?: string;
  AI_ANALYSIS_API_KEY?: string;
  VIRUS_SCAN_API_KEY?: string;
}

// File upload and processing types
export interface FileUploadRequest {
  file: File | ArrayBuffer;
  documentType: DocumentType;
  patientId?: string;
  appointmentId?: string;
  requiresOCR?: boolean;
  requiresAIAnalysis?: boolean;
  metadata?: FileMetadata;
}

export interface FileMetadata {
  originalName: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  tenantId: string;
  tags?: string[];
  description?: string;
  isConfidential?: boolean;
}

export type DocumentType =
  | "medical_report"
  | "lab_result"
  | "prescription"
  | "xray_image"
  | "ct_scan"
  | "mri_scan"
  | "ultrasound"
  | "ecg"
  | "consent_form"
  | "insurance_card"
  | "identification"
  | "vaccination_record"
  | "treatment_plan"
  | "invoice"
  | "other";

export interface ProcessingStatus {
  fileId: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
  results?: ProcessingResults;
}

export interface ProcessingResults {
  ocrText?: string;
  aiAnalysis?: AIAnalysisResult;
  virusScan?: VirusScanResult;
  thumbnails?: ThumbnailResult[];
  extractedData?: ExtractedMedicalData;
}

export interface AIAnalysisResult {
  confidence: number;
  findings: string[];
  recommendations: string[];
  riskLevel: "low" | "medium" | "high";
  medicalEntities?: MedicalEntity[];
  structuredData?: StructuredMedicalData;
}

export interface MedicalEntity {
  type: "medication" | "condition" | "procedure" | "measurement" | "date" | "person";
  text: string;
  confidence: number;
  startOffset: number;
  endOffset: number;
  normalizedValue?: string;
}

export interface StructuredMedicalData {
  patientName?: string;
  patientId?: string;
  dateOfBirth?: string;
  medications?: Medication[];
  vitalSigns?: VitalSigns;
  diagnoses?: Diagnosis[];
  procedures?: Procedure[];
}

export interface Medication {
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  route?: string;
}

export interface VitalSigns {
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
}

export interface Diagnosis {
  code?: string; // ICD-10 code
  description: string;
  type: "primary" | "secondary";
  confidence?: number;
}

export interface Procedure {
  code?: string; // CPT code
  description: string;
  date?: string;
  provider?: string;
}

export interface VirusScanResult {
  clean: boolean;
  scanEngine: string;
  scanDate: string;
  threats?: Threat[];
}

export interface Threat {
  name: string;
  type: "virus" | "malware" | "suspicious";
  severity: "low" | "medium" | "high" | "critical";
  description?: string;
}

export interface ThumbnailResult {
  size: "small" | "medium" | "large";
  url: string;
  width: number;
  height: number;
}

export interface ExtractedMedicalData {
  documentId: string;
  extractedFields: Record<string, any>;
  confidence: number;
  validationResults?: ValidationResult[];
}

export interface ValidationResult {
  field: string;
  isValid: boolean;
  errorMessage?: string;
  suggestedValue?: string;
}

// API Response types
export interface FileUploadResponse {
  success: boolean;
  fileId: string;
  processingId?: string;
  message: string;
  uploadUrl?: string;
}

export interface FileListResponse {
  files: FileInfo[];
  totalCount: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface FileInfo {
  fileId: string;
  originalName: string;
  documentType: DocumentType;
  size: number;
  mimeType: string;
  uploadedAt: string;
  uploadedBy: string;
  processingStatus: "queued" | "processing" | "completed" | "failed";
  isConfidential: boolean;
  tags: string[];
  thumbnailUrl?: string;
  downloadUrl?: string;
}

// Error types
export interface FileProcessingError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Healthcare compliance types for Brazilian regulations
export interface LGPDCompliance {
  dataProcessingBasis:
    | "consent"
    | "contract"
    | "legal_obligation"
    | "vital_interests"
    | "public_task"
    | "legitimate_interests";
  consentId?: string;
  dataRetentionPeriod: number; // in days
  isPersonalData: boolean;
  isSensitiveData: boolean;
  processingPurpose: string[];
  dataSubjectRights: {
    canAccess: boolean;
    canRectify: boolean;
    canErase: boolean;
    canPortability: boolean;
    canObject: boolean;
  };
}

export interface ANVISACompliance {
  regulatoryCategory: "medical_device" | "pharmaceutical" | "cosmetic" | "food" | "other";
  registrationNumber?: string;
  complianceLevel: "basic" | "enhanced" | "critical";
  auditTrailRequired: boolean;
  dataIntegrityLevel: "ALCOA" | "ALCOA+";
}

// Authentication and authorization types
export interface JWTPayload {
  sub: string; // user ID
  email: string;
  role: "admin" | "doctor" | "nurse" | "receptionist" | "patient";
  tenantId: string;
  permissions: Permission[];
  iat: number;
  exp: number;
}

export interface Permission {
  resource: string;
  actions: ("create" | "read" | "update" | "delete")[];
  conditions?: Record<string, any>;
}

// Rate limiting types
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator: (request: Request) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// Audit trail types
export interface AuditEvent {
  eventId: string;
  timestamp: string;
  userId: string;
  tenantId: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, any>;
  result: "success" | "failure";
  errorMessage?: string;
}
