/**
 * Patient Portal Module
 *
 * A comprehensive patient portal system for NeonPro that provides:
 * - Secure patient authentication and session management
 * - Dashboard with patient information and statistics
 * - Appointment booking and management
 * - Document upload and management
 * - Patient-staff communication system
 * - LGPD compliance and audit logging
 *
 * @author NeonPro Development Team
 * @version 1.0.0
 */

// Appointment management
export {
  AppointmentConfig,
  AppointmentManager,
  BookingRequest,
  BookingResult,
  CancellationRequest,
  RescheduleRequest,
  TimeSlot,
} from './appointments/appointment-manager';

// Authentication and session management
export {
  DeviceFingerprint,
  SessionActivity,
  SessionConfig,
  SessionData,
  SessionManager,
  SessionValidationResult,
} from './auth/session-manager';
// Communication system
export {
  CommunicationConfig,
  CommunicationManager,
  CommunicationStats,
  Conversation,
  Message,
  MessageActivity,
  MessageAttachment,
  NotificationPreferences,
  SendMessageRequest,
  SendMessageResult,
} from './communication/communication-manager';
// Dashboard functionality
export {
  AppointmentSummary,
  DashboardConfig,
  DashboardStats,
  DashboardWidget,
  NotificationSummary,
  PatientDashboardData,
  PatientPreferences,
  PortalDashboard,
  TaskSummary,
  TreatmentProgressSummary,
  UploadSummary,
} from './dashboard/portal-dashboard';
// Main portal class
export {
  PatientPortal,
  PatientPortalConfig,
  PortalHealthCheck,
  PortalInitResult,
} from './patient-portal';
// Upload management
export {
  ProcessingStatus,
  UploadActivity,
  UploadConfig,
  UploadError,
  UploadedFile,
  UploadManager,
  UploadRequest,
  UploadResult,
  UploadStats,
} from './uploads/upload-manager';

/**
 * Default configuration factory
 */
export function createDefaultPortalConfig(): PatientPortalConfig {
  return {
    session: {
      secretKey: process.env.SESSION_SECRET_KEY || 'your-secret-key-here',
      tokenExpiration: 24 * 60 * 60 * 1000, // 24 hours
      refreshTokenExpiration: 7 * 24 * 60 * 60 * 1000, // 7 days
      maxConcurrentSessions: 3,
      sessionCleanupInterval: 60 * 60 * 1000, // 1 hour
      deviceTrackingEnabled: true,
      geoLocationTracking: false,
      activityLoggingEnabled: true,
    },
    dashboard: {
      cacheEnabled: true,
      cacheTTL: 5 * 60 * 1000, // 5 minutes
      maxRecentItems: 10,
      enableRealTimeUpdates: true,
      showStatistics: true,
      customWidgetsEnabled: true,
    },
    appointments: {
      maxAdvanceBookingDays: 90,
      minAdvanceBookingHours: 2,
      allowRescheduling: true,
      allowCancellation: true,
      autoConfirmationEnabled: false,
      reminderEnabled: true,
      waitlistEnabled: true,
    },
    uploads: {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedFileTypes: [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
      maxFilesPerUpload: 5,
      virusScanEnabled: true,
      autoProcessingEnabled: true,
      retentionDays: 2555, // 7 years
      encryptionEnabled: true,
      compressionEnabled: true,
      thumbnailGeneration: true,
    },
    communication: {
      maxMessageLength: 5000,
      allowAttachments: true,
      maxAttachmentSize: 5 * 1024 * 1024, // 5MB
      autoResponseEnabled: true,
      moderationEnabled: true,
      encryptMessages: true,
      retentionDays: 2555, // 7 years
      allowedFileTypes: [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
    },
    features: {
      appointmentBooking: true,
      documentUpload: true,
      messaging: true,
      treatmentTracking: true,
      billingAccess: true,
      telehealth: false,
    },
    security: {
      twoFactorRequired: false,
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      maxLoginAttempts: 5,
      passwordComplexity: true,
    },
    ui: {
      theme: 'light',
      language: 'pt-BR',
      accessibility: true,
      mobileOptimized: true,
    },
  };
}

/**
 * Portal feature flags
 */
export const PORTAL_FEATURES = {
  APPOINTMENT_BOOKING: 'appointment_booking',
  DOCUMENT_UPLOAD: 'document_upload',
  MESSAGING: 'messaging',
  TREATMENT_TRACKING: 'treatment_tracking',
  BILLING_ACCESS: 'billing_access',
  TELEHEALTH: 'telehealth',
} as const;

/**
 * Portal status constants
 */
export const PORTAL_STATUS = {
  HEALTHY: 'healthy',
  DEGRADED: 'degraded',
  UNHEALTHY: 'unhealthy',
} as const;

/**
 * Session status constants
 */
export const SESSION_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  TERMINATED: 'terminated',
  SUSPENDED: 'suspended',
} as const;
