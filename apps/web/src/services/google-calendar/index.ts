export { GoogleCalendarClient } from './client';
export type { CalendarEvent, GoogleCalendarConfig, OAuth2Tokens } from './client';
export { GoogleCalendarService } from './service';
export type { AppointmentData, GoogleCalendarIntegrationConfig } from './service';

// Re-export database types for convenience
export type {
  GoogleCalendarEvent,
  GoogleCalendarIntegration,
  GoogleCalendarSyncLog,
} from '@prisma/client';
