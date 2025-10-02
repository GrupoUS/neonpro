export interface LegacyPatient {
  id: string
  name: string
  email: string
  phone: string
  medicalHistory: string
  consentGiven: boolean
  createdAt: Date
}

export interface LegacyAppointment {
  id: string
  patientId: string
  professionalId: string
  date: Date
  type: 'consultation' | 'treatment' | 'follow-up'
  status: 'scheduled' | 'completed' | 'cancelled'
  notes: string
}

export interface Professional {
  id: string
  name: string
  specialty: string
  licenseNumber: string
  availability: Date[]
}

export interface Treatment {
  id: string
  name: string
  description: string
  duration: number // in minutes
  price: number
  category: 'aesthetic' | 'medical' | 'wellness'
}

export type HealthcareUser = LegacyPatient | Professional

export type Database = {
  public: {
    Tables: {
      patients: {
        Row: LegacyPatient;
        Insert: Omit<LegacyPatient, 'id' | 'createdAt'>;
        Update: Partial<LegacyPatient>;
      };
      appointments: {
        Row: LegacyAppointment;
        Insert: Omit<LegacyAppointment, 'id'>;
        Update: Partial<LegacyAppointment>;
      };
      audit_logs: {
        Row: {
          id: string;
          clinic_id: string;
          user_id: string | null;
          action: string;
          resource_type: string;
          resource_id: string | null;
          details: Record<string, unknown> | null;
          created_at: Date;
        };
        Insert: {
          id?: string;
          clinic_id: string;
          user_id?: string | null;
          action: string;
          resource_type: string;
          resource_id?: string | null;
          details?: Record<string, unknown> | null;
          created_at?: Date;
        };
        Update: Partial<{
          clinic_id: string;
          user_id: string | null;
          action: string;
          resource_type: string;
          resource_id: string | null;
          details: Record<string, unknown> | null;
          created_at: Date;
        }>;
      };
      // Add other tables as needed based on schema
    };
    Views: Record<string, unknown>;
    Functions: Record<string, unknown>;
    Enums: Record<string, unknown>;
  };
};

// Export specific schemas to avoid conflicts
export {
  AppointmentSchema,
  CreateAppointmentSchema,
  UpdateAppointmentSchema
} from './schemas/appointments.js';

export {
  UserSchema,
  CreateUserSchema,
  UpdateUserSchema,
  UserClinicSchema
} from './schemas/users.js';

export * from './schemas/leads.js';
export * from './schemas/messages.js';
export * from './schemas/clinics.js';

// Export other modules
export * from './common.js'
export * from './database.js'
export * from './healthcare.js'
export * from './api.js'
export * from './guards.js'
export * from './validation.js'
export * from './auth.js'

// Export database migration types (with explicit exports to avoid conflicts)
export type {
  MigrationOptions,
  MigrationData,
  MigrationResult,
  MigrationResults,
  ResourceMigrationResult,
  MigrationError,
  MigrationWarning,
  MigrationProgress,
  MigrationStage,
  MigrationValidation,
  MigrationConfig,
  ConflictResolution,
  LoggingConfig,
  PerformanceConfig,
  MigrationHistory,
  MigrationStatus,
  MigrationRecord,
  RollbackPlan,
  RollbackStep,
  ImpactAssessment,
  DataQualityReport,
  QualityCategory,
  QualityIssue,
  QualityRecommendation,
  MigrationBackup,
  BackupType,
  BackupStatus,
  EncryptionInfo,
  MigrationMetrics,
  PerformanceMetrics,
  ResourceUsageMetrics,
  ExternalServiceUsage,
  ErrorMetrics,
  BusinessMetrics,
  UserImpactMetrics,
  ServiceAvailabilityMetrics,
  ClinicData,
  UserData,
  UserClinicData,
  AppointmentData,
  AddressData,
  ClinicSettings,
  WorkingHours,
  DayHours,
  BookingSettings,
  NotificationSettings,
  ComplianceSettings,
  SubscriptionData,
  SubscriptionPlan,
  SubscriptionStatus,
  SubscriptionFeature,
  FeatureLimits,
  MoneyAmount,
  UserProfile,
  Permission,
  PermissionCondition,
  PaymentStatus
} from './database-migration.js'