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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SESSION_STATUS =
  exports.PORTAL_STATUS =
  exports.PORTAL_FEATURES =
  exports.CommunicationManager =
  exports.UploadManager =
  exports.AppointmentManager =
  exports.PortalDashboard =
  exports.SessionManager =
  exports.PatientPortal =
    void 0;
exports.createDefaultPortalConfig = createDefaultPortalConfig;
// Main portal class
var patient_portal_1 = require("./patient-portal");
Object.defineProperty(exports, "PatientPortal", {
  enumerable: true,
  get: () => patient_portal_1.PatientPortal,
});
// Authentication and session management
var session_manager_1 = require("./auth/session-manager");
Object.defineProperty(exports, "SessionManager", {
  enumerable: true,
  get: () => session_manager_1.SessionManager,
});
// Dashboard functionality
var portal_dashboard_1 = require("./dashboard/portal-dashboard");
Object.defineProperty(exports, "PortalDashboard", {
  enumerable: true,
  get: () => portal_dashboard_1.PortalDashboard,
});
// Appointment management
var appointment_manager_1 = require("./appointments/appointment-manager");
Object.defineProperty(exports, "AppointmentManager", {
  enumerable: true,
  get: () => appointment_manager_1.AppointmentManager,
});
// Upload management
var upload_manager_1 = require("./uploads/upload-manager");
Object.defineProperty(exports, "UploadManager", {
  enumerable: true,
  get: () => upload_manager_1.UploadManager,
});
// Communication system
var communication_manager_1 = require("./communication/communication-manager");
Object.defineProperty(exports, "CommunicationManager", {
  enumerable: true,
  get: () => communication_manager_1.CommunicationManager,
});
/**
 * Default configuration factory
 */
function createDefaultPortalConfig() {
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
exports.PORTAL_FEATURES = {
  APPOINTMENT_BOOKING: "appointment_booking",
  DOCUMENT_UPLOAD: "document_upload",
  MESSAGING: "messaging",
  TREATMENT_TRACKING: "treatment_tracking",
  BILLING_ACCESS: "billing_access",
  TELEHEALTH: "telehealth",
};
/**
 * Portal status constants
 */
exports.PORTAL_STATUS = {
  HEALTHY: "healthy",
  DEGRADED: "degraded",
  UNHEALTHY: "unhealthy",
};
/**
 * Session status constants
 */
exports.SESSION_STATUS = {
  ACTIVE: "active",
  EXPIRED: "expired",
  TERMINATED: "terminated",
  SUSPENDED: "suspended",
};
