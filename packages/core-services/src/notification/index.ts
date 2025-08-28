// Notification module exports

export type { ExternalNotificationProvider, NotificationRepository } from "./service";
export * from "./service";
export { NotificationService } from "./service";
// Re-export commonly used types
export type {
  ABTestConfig,
  AppointmentInfo,
  AudienceFilter,
  AudienceFilterData,
  CreateNotificationCampaignData,
  CreateNotificationData,
  CreateNotificationTemplateData,
  Notification,
  NotificationCampaign,
  NotificationLog,
  NotificationPreference,
  NotificationPreferenceData,
  NotificationStats,
  NotificationTemplate,
  PatientInfo,
  RecurringConfig,
  TemplateFilters,
  TemplateVariable,
  TimePreference,
  TreatmentPlanInfo,
} from "./types";
export * from "./types";
export {
  CampaignStatus,
  CampaignType,
  NotificationChannel,
  NotificationEvent,
  NotificationPriority,
  NotificationStatus,
  RecurringFrequency,
  VariableType,
} from "./types";
