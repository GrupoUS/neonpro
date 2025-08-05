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

// Main portal class
export {
  PatientPortal,
  PatientPortalConfig,
  PortalInitResult,
  PortalHealthCheck,
} from "./patient-portal";

// Authentication and session management
export {
  SessionManager,
  SessionConfig,
  SessionData,
  SessionValidationResult,
  DeviceFingerprint,
  SessionActivity,
} from "./auth/session-manager";

// Dashboard functionality
export {
  PortalDashboard,
  DashboardConfig,
  PatientDashboardData,
  AppointmentSummary,
  TreatmentProgressSummary,
  UploadSummary,
  TaskSummary,
  NotificationSummary,
  DashboardStats,
  PatientPreferences,
  DashboardWidget,
} from "./dashboard/portal-dashboard";

// Appointment management
export {
  AppointmentManager,
  AppointmentConfig,
  TimeSlot,
  BookingRequest,
  BookingResult,
  RescheduleRequest,
  CancellationRequest,
} from "./appointments/appointment-manager";

// Upload management
export {
  UploadManager,
  UploadConfig,
  UploadRequest,
  UploadResult,
  UploadedFile,
  UploadError,
  ProcessingStatus,
  UploadStats,
  UploadActivity,
} from "./uploads/upload-manager";

// Communication system
export {
  CommunicationManager,
  CommunicationConfig,
  Message,
  MessageAttachment,
  Conversation,
  SendMessageRequest,
  SendMessageResult,
  NotificationPreferences,
  CommunicationStats,
  MessageActivity,
} from "./communication/communication-manager";

/**
 * Default configuration factory
 */
export function createDefaultPortalConfig(): PatientPortalConfig {
  return {
    session: {
      secretKey: process.env.SESSION_SECRET_KEY || "your-secret-key-here",
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
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/gif",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
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
        "application/pdf",
        "image/jpeg",
        "image/png",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
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
      theme: "light",
      language: "pt-BR",
      accessibility: true,
      mobileOptimized: true,
    },
  };
}

/**
 * Portal feature flags
 */
export const PORTAL_FEATURES = {
  APPOINTMENT_BOOKING: "appointment_booking",
  DOCUMENT_UPLOAD: "document_upload",
  MESSAGING: "messaging",
  TREATMENT_TRACKING: "treatment_tracking",
  BILLING_ACCESS: "billing_access",
  TELEHEALTH: "telehealth",
} as const;

/**
 * Portal status constants
 */
export const PORTAL_STATUS = {
  HEALTHY: "healthy",
  DEGRADED: "degraded",
  UNHEALTHY: "unhealthy",
} as const;

/**
 * Session status constants
 */
export const SESSION_STATUS = {
  ACTIVE: "active",
  EXPIRED: "expired",
  TERMINATED: "terminated",
  SUSPENDED: "suspended",
} as const;
