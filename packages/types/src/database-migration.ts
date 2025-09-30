/**
 * TypeScript interfaces for Database Migration System
 * Replaces all 'any[]' types with specific, type-safe interfaces
 */

// Base Migration Types
export interface MigrationData {
  clinics: ClinicData[];
  users: UserData[];
  userClinics: UserClinicData[];
  appointments: AppointmentData[];
}

export interface ClinicData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: AddressData;
  taxId: string;
  businessLicense?: string;
  specialties: string[];
  settings: ClinicSettings;
  subscription: SubscriptionData;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserData {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  clinicId: string;
  profile: UserProfile;
  permissions: Permission[];
  preferences: UserPreferences;
  status: 'active' | 'inactive' | 'suspended';
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserClinicData {
  userId: string;
  clinicId: string;
  role: UserRole;
  permissions: Permission[];
  joinedAt: Date;
  invitedBy: string;
  status: 'active' | 'pending' | 'revoked';
}

export interface AppointmentData {
  id: string;
  clinicId: string;
  patientId: string;
  professionalId: string;
  serviceId: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  actualStart?: Date;
  actualEnd?: Date;
  status: AppointmentStatus;
  notes?: string;
  price: MoneyAmount;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Detailed Component Types
export interface AddressData {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface ClinicSettings {
  timezone: string;
  language: string;
  currency: string;
  workingHours: WorkingHours;
  bookingSettings: BookingSettings;
  notificationSettings: NotificationSettings;
  complianceSettings: ComplianceSettings;
}

export interface WorkingHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  enabled: boolean;
  openTime: string; // HH:mm format
  closeTime: string; // HH:mm format
  breakStart?: string; // HH:mm format
  breakEnd?: string; // HH:mm format
}

export interface BookingSettings {
  advanceBookingDays: number;
  minimumCancellationHours: number;
  allowOnlineBooking: boolean;
  requirePaymentForBooking: boolean;
  autoConfirmEnabled: boolean;
  doubleBookingPrevention: boolean;
  maxAppointmentsPerSlot: number;
  appointmentDuration: number; // in minutes
}

export interface NotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  whatsappEnabled: boolean;
  reminderHours: number[];
  confirmationsEnabled: boolean;
  cancellationsEnabled: boolean;
  promotionsEnabled: boolean;
}

export interface ComplianceSettings {
  lgpdEnabled: boolean;
  dataRetentionDays: number;
  anonymizationEnabled: boolean;
  auditLoggingEnabled: boolean;
  consentRequired: boolean;
  encryptionEnabled: boolean;
}

export interface SubscriptionData {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: Date;
  endDate?: Date;
  trialEndDate?: Date;
  billingCycle: 'monthly' | 'yearly';
  price: MoneyAmount;
  features: SubscriptionFeature[];
}

export type SubscriptionPlan = 
  | 'basic'
  | 'professional'
  | 'enterprise'
  | 'trial';

export type SubscriptionStatus = 
  | 'active'
  | 'trial'
  | 'past_due'
  | 'cancelled'
  | 'unpaid';

export interface SubscriptionFeature {
  name: string;
  enabled: boolean;
  limits?: FeatureLimits;
}

export interface FeatureLimits {
  patients?: number;
  professionals?: number;
  appointments?: number;
  storage?: number; // in MB
  apiCalls?: number;
}

export interface MoneyAmount {
  amount: number;
  currency: string;
}

export type UserRole = 
  | 'owner'
  | 'admin'
  | 'professional'
  | 'receptionist'
  | 'assistant'
  | 'readonly';

export interface UserProfile {
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  specialty?: string;
  licenseNumber?: string;
  licenseExpiry?: Date;
  bio?: string;
  socialSecurity?: string;
  taxId?: string;
}

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete' | 'admin')[];
  conditions?: PermissionCondition[];
}

export interface PermissionCondition {
  field: string;
  operator: 'eq' | 'ne' | 'in' | 'nin' | 'gt' | 'gte' | 'lt' | 'lte';
  value: string | number | boolean | string[] | number[];
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  defaultCalendarView: 'day' | 'week' | 'month';
  autoAcceptAppointments: boolean;
}

export type AppointmentStatus = 
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'rescheduled';

export type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'partially_paid'
  | 'refunded'
  | 'cancelled'
  | 'overdue';

// Migration Result Types
export interface MigrationResult {
  success: boolean;
  results: MigrationResults;
  errors?: MigrationError[];
  warnings?: MigrationWarning[];
  startTime: Date;
  endTime: Date;
  duration: number; // in milliseconds
}

export interface MigrationResults {
  clinics: ResourceMigrationResult;
  users: ResourceMigrationResult;
  userClinics: ResourceMigrationResult;
  appointments: ResourceMigrationResult;
}

export interface ResourceMigrationResult {
  success: boolean;
  processed: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
  duration: number; // in milliseconds
  errorDetails?: string[];
}

export interface MigrationError {
  resource: string;
  resourceId: string;
  error: string;
  timestamp: Date;
  context?: Record<string, unknown>;
}

export interface MigrationWarning {
  resource: string;
  resourceId: string;
  warning: string;
  timestamp: Date;
  context?: Record<string, unknown>;
}

// Migration Progress Types
export interface MigrationProgress {
  stage: MigrationStage;
  progress: number; // 0-100
  currentResource: string;
  totalRecords: number;
  processedRecords: number;
  errors: number;
  warnings: number;
  estimatedTimeRemaining?: number; // in seconds
  startedAt: Date;
  lastUpdate: Date;
}

export type MigrationStage = 
  | 'validation'
  | 'preparation'
  | 'clinics'
  | 'users'
  | 'user_clinics'
  | 'appointments'
  | 'verification'
  | 'completion';

// Migration Validation Types
export interface MigrationValidation {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  recommendations: string[];
  estimatedTime: number; // in minutes
  estimatedComplexity: 'low' | 'medium' | 'high';
}

export interface ValidationError {
  type: 'schema' | 'data' | 'dependency' | 'business_rule';
  resource: string;
  resourceId?: string;
  field?: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  type: 'performance' | 'data_quality' | 'compatibility';
  resource: string;
  resourceId?: string;
  field?: string;
  message: string;
  impact: 'low' | 'medium' | 'high';
}

// Migration Configuration Types
export interface MigrationConfig {
  dryRun: boolean;
  batchSize: number;
  skipValidation: boolean;
  skipDependencies: boolean;
  preserveIds: boolean;
  updateExisting: boolean;
  conflictResolution: ConflictResolution;
  logging: LoggingConfig;
  performance: PerformanceConfig;
}

export type ConflictResolution = 
  | 'skip'
  | 'update'
  | 'error'
  | 'merge';

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  destination: 'console' | 'file' | 'database' | 'external';
  format: 'json' | 'text';
  includeSensitive: boolean;
}

export interface PerformanceConfig {
  parallelWorkers: number;
  memoryLimit: number; // in MB
  timeoutMs: number;
  retryAttempts: number;
  retryDelayMs: number;
}

// Migration History Types
export interface MigrationHistory {
  id: string;
  version: string;
  status: MigrationStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  records: MigrationRecord[];
  errors: MigrationError[];
  config: MigrationConfig;
  triggeredBy: string;
  environment: string;
}

export type MigrationStatus = 
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'rollback';

export interface MigrationRecord {
  id: string;
  migrationHistoryId: string;
  resource: string;
  action: 'insert' | 'update' | 'skip' | 'error';
  resourceId?: string;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  timestamp: Date;
  duration?: number;
}

// Rollback Types
export interface RollbackPlan {
  id: string;
  migrationHistoryId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  steps: RollbackStep[];
  estimatedDuration: number; // in minutes
  impactAssessment: ImpactAssessment;
  createdAt: Date;
  executedAt?: Date;
}

export interface RollbackStep {
  order: number;
  resource: string;
  action: 'delete' | 'restore' | 'revert';
  recordIds: string[];
  dependencies: string[];
  estimatedDuration: number; // in seconds
  status: 'pending' | 'completed' | 'failed';
  error?: string;
}

export interface ImpactAssessment {
  affectedRecords: number;
  affectedUsers: number;
  affectedClinics: number;
  affectedAppointments: number;
  dataLoss: boolean;
  serviceInterruption: boolean;
  estimatedDowntime: number; // in minutes
}

// Data Quality Types
export interface DataQualityReport {
  overallScore: number; // 0-100
  categories: QualityCategory[];
  issues: QualityIssue[];
  recommendations: QualityRecommendation[];
  generatedAt: Date;
}

export interface QualityCategory {
  name: string;
  score: number; // 0-100
  weight: number; // 0-1
  description: string;
}

export interface QualityIssue {
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  affectedRecords: number;
  examples: string[];
  suggestedFix: string;
}

export interface QualityRecommendation {
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  action: string;
  expectedImprovement: number; // percentage points
  estimatedEffort: 'low' | 'medium' | 'high';
  dependencies: string[];
}

// Backup and Recovery Types
export interface MigrationBackup {
  id: string;
  migrationHistoryId: string;
  type: BackupType;
  status: BackupStatus;
  location: string;
  size: number; // in bytes
  checksum: string;
  encryption: EncryptionInfo;
  createdAt: Date;
  expiresAt?: Date;
  restoredAt?: Date;
}

export type BackupType = 
  | 'full'
  | 'incremental'
  | 'differential';

export type BackupStatus = 
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'expired';

export interface EncryptionInfo {
  algorithm: string;
  keyId: string;
  iv?: string;
  salt?: string;
}

// Monitoring and Metrics Types
export interface MigrationMetrics {
  id: string;
  migrationHistoryId: string;
  performance: PerformanceMetrics;
  resourceUsage: ResourceUsageMetrics;
  errors: ErrorMetrics;
  businessMetrics: BusinessMetrics;
  timestamp: Date;
}

export interface PerformanceMetrics {
  totalDuration: number; // in milliseconds
  averageRecordTime: number; // in milliseconds
  throughput: number; // records per second
  bottleneckStage?: string;
  memoryPeak: number; // in MB
  cpuAverage: number; // percentage
}

export interface ResourceUsageMetrics {
  databaseConnections: number;
  networkRequests: number;
  diskRead: number; // in MB
  diskWrite: number; // in MB
  apiCalls: number;
  externalServices: ExternalServiceUsage[];
}

export interface ExternalServiceUsage {
  name: string;
  requests: number;
  errors: number;
  averageResponseTime: number; // in milliseconds
}

export interface ErrorMetrics {
  totalErrors: number;
  errorRate: number; // percentage
  errorsByType: Record<string, number>;
  errorsByStage: Record<string, number>;
  criticalErrors: number;
  warnings: number;
}

export interface BusinessMetrics {
  recordsMigrated: number;
  dataIntegrityScore: number; // 0-100
  userImpact: UserImpactMetrics;
  serviceAvailability: ServiceAvailabilityMetrics;
}

export interface UserImpactMetrics {
  affectedUsers: number;
  loginIssues: number;
  dataAccessIssues: number;
  reportedComplaints: number;
  satisfactionScore?: number;
}

export interface ServiceAvailabilityMetrics {
  downtime: number; // in minutes
  availability: number; // percentage 0-100
  responseTimeP95: number; // in milliseconds
  errorRate: number; // percentage
}