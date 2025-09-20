export { GoogleCalendarClient } from './client';
export { GoogleCalendarService } from './service';
export type {
  GoogleCalendarConfig,
  OAuth2Tokens,
  CalendarEvent,
} from './client';
export type {
  GoogleCalendarIntegrationConfig,
  AppointmentData,
} from './service';

// Re-export database types for convenience
export type {
  GoogleCalendarIntegration,
  GoogleCalendarEvent,
  GoogleCalendarSyncLog,
} from '@prisma/client';