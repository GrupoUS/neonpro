// Notification module exports
export * from './types';
export * from './service';

// Re-export commonly used types
export type {
  Notification,
  NotificationTemplate,
  NotificationCampaign,
  NotificationPreference,
  NotificationLog,
  TemplateVariable,
  AudienceFilter,
  RecurringConfig,
  ABTestConfig,
  TimePreference,
  CreateNotificationData,
  CreateNotificationTemplateData,
  CreateNotificationCampaignData,
  NotificationPreferenceData,
  AudienceFilterData,
  PatientInfo,
  AppointmentInfo,
  TreatmentPlanInfo,
  NotificationStats,
  TemplateFilters
} from './types';

export { NotificationService } from './service';
export { 
  NotificationChannel,
  NotificationStatus,
  NotificationPriority,
  CampaignType,
  CampaignStatus,
  RecurringFrequency,
  VariableType,
  NotificationEvent
} from './types';

export type { 
  NotificationRepository,
  ExternalNotificationProvider
} from './service';