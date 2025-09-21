import { PrismaClient } from '@prisma/client';
import { CalendarEvent2Tokens } from './client';

export interface GoogleCalendarIntegrationConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface AppointmentData {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  timeZone?: string;
  location?: string;
  patientEmail?: string;
  patientName?: string;
  professionalEmail?: string;
  professionalName?: string;
}

export class GoogleCalendarService {
  private prisma: PrismaClient;
  public client: GoogleCalendarClient;
  private config: GoogleCalendarIntegrationConfig;

  constructor(config: GoogleCalendarIntegrationConfig, prisma?: PrismaClient) {
    this.config = config;
    this.prisma = prisma || new PrismaClient();
    this.client = new GoogleCalendarClient(config);
  }

  /**
   * Initialize Google Calendar integration for a user and clinic
   */
  async initializeIntegration(
    userId: string,
    clinicId: string,
    code: string,
    lgpdConsent: boolean = false,
  ): Promise<{
    integration: any;
    calendarId: string;
  }> {
    try {
      // Exchange authorization code for tokens
      const tokens = await this.client.getTokens(code);

      // Set credentials to access calendar
      this.client.setCredentials(tokens);

      // Get user's primary calendar
      const calendars = await this.client.listCalendars();
      const primaryCalendar = calendars.find(cal => cal.primary) || calendars[0];

      if (!primaryCalendar) {
        throw new Error('No calendars found');
      }

      // Store integration in database
      const integration = await this.prisma.googleCalendarIntegration.create({
        data: {
          userId,
          clinicId,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || null,
          expiresAt: new Date(tokens.expiry_date),
          scope: tokens.scope,
          tokenId: `${userId}-${clinicId}-${Date.now()}`,
          syncCalendarId: primaryCalendar.id,
          lgpdConsent,
          consentDate: lgpdConsent ? new Date() : null,
        },
      });

      // Log the integration
      await this.logSyncOperation(
        integration.id,
        'CREATE',
        'TO_GOOGLE',
        null,
        null,
        'SUCCESS',
      );

      return {
        integration,
        calendarId: primaryCalendar.id,
      };
    } catch (_error) {
      console.error('Error initializing Google Calendar integration:', error);
      throw error;
    }
  }

  /**
   * Get integration for user and clinic
   */
  async getIntegration(userId: string, clinicId: string) {
    return await this.prisma.googleCalendarIntegration.findUnique({
      where: {
        userId_clinicId: {
          userId,
          clinicId,
        },
      },
    });
  }

  /**
   * Sync appointment to Google Calendar
   */
  async syncAppointment(
    appointment: AppointmentData,
    userId: string,
    clinicId: string,
    operation: 'CREATE' | 'UPDATE' | 'DELETE' = 'CREATE',
  ): Promise<{
    success: boolean;
    googleEventId?: string;
    error?: string;
  }> {
    try {
      const integration = await this.getIntegration(userId, clinicId);

      if (!integration || !integration.syncEnabled) {
        return { success: false, error: 'Integration not found or disabled' };
      }

      // Check and refresh tokens if needed
      const tokens = await this.ensureValidTokens(integration);

      // Set credentials
      this.client.setCredentials(tokens);

      // Convert appointment to Google Calendar event
      const event = this.appointmentToEvent(appointment);

      let result;

      switch (operation) {
        case 'CREATE':
          result = await this.client.createEvent(
            integration.syncCalendarId,
            event,
          );
          break;
        case 'UPDATE':
          // Find existing Google Calendar event
          const existingEvent = await this.prisma.googleCalendarEvent.findUnique({
            where: { appointmentId: appointment.id },
          });

          if (!existingEvent) {
            result = await this.client.createEvent(
              integration.syncCalendarId,
              event,
            );
          } else {
            result = await this.client.updateEvent(
              integration.syncCalendarId,
              existingEvent.googleEventId,
              event,
            );
          }
          break;
        case 'DELETE':
          const eventToDelete = await this.prisma.googleCalendarEvent.findUnique({
            where: { appointmentId: appointment.id },
          });

          if (eventToDelete) {
            await this.client.deleteEvent(
              integration.syncCalendarId,
              eventToDelete.googleEventId,
            );
            await this.prisma.googleCalendarEvent.delete({
              where: { id: eventToDelete.id },
            });
          }
          return { success: true };
      }

      // Store or update event mapping
      if (operation !== 'DELETE') {
        await this.prisma.googleCalendarEvent.upsert({
          where: { appointmentId: appointment.id },
          update: {
            googleEventId: result.id,
            calendarId: integration.syncCalendarId,
            htmlLink: result.htmlLink,
            syncStatus: 'SYNCED',
            lastSyncAt: new Date(),
          },
          create: {
            appointmentId: appointment.id,
            googleEventId: result.id,
            calendarId: integration.syncCalendarId,
            htmlLink: result.htmlLink,
            syncStatus: 'SYNCED',
            lastSyncAt: new Date(),
          },
        });
      }

      // Update integration sync status
      await this.prisma.googleCalendarIntegration.update({
        where: { id: integration.id },
        data: {
          lastSyncAt: new Date(),
          lastError: null,
          errorCount: 0,
        },
      });

      // Log successful sync
      await this.logSyncOperation(
        integration.id,
        operation,
        'TO_GOOGLE',
        appointment.id,
        result.id,
        'SUCCESS',
      );

      return {
        success: true,
        googleEventId: result.id,
      };
    } catch (_error) {
      console.error(
        `Error ${operation} appointment in Google Calendar:`,
        error,
      );

      // Log error
      const integration = await this.getIntegration(userId, clinicId);
      if (integration) {
        await this.prisma.googleCalendarIntegration.update({
          where: { id: integration.id },
          data: {
            lastError: error instanceof Error ? error.message : String(error),
            errorCount: { increment: 1 },
          },
        });

        await this.logSyncOperation(
          integration.id,
          operation,
          'TO_GOOGLE',
          appointment.id,
          null,
          'FAILED',
          error instanceof Error ? error.message : String(error),
        );
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Sync changes from Google Calendar to local appointments
   */
  async syncFromGoogle(
    userId: string,
    clinicId: string,
    syncToken?: string,
  ): Promise<{
    nextSyncToken?: string;
    changes: Array<{
      eventId: string;
      operation: 'created' | 'updated' | 'deleted';
    }>;
  }> {
    try {
      const integration = await this.getIntegration(userId, clinicId);

      if (
        !integration
        || !integration.syncEnabled
        || !integration.bidirectional
      ) {
        return { changes: [] };
      }

      // Check and refresh tokens if needed
      const tokens = await this.ensureValidTokens(integration);
      this.client.setCredentials(tokens);

      // Perform sync
      const result = await this.client.syncEvents(
        integration.syncCalendarId,
        syncToken,
      );

      // Process changes
      const changes = [];
      for (const item of result.items) {
        if (item.status === 'cancelled') {
          changes.push({
            eventId: item.id,
            operation: 'deleted' as const,
          });
        } else {
          // Check if this is a new or updated event
          const existingEvent = await this.prisma.googleCalendarEvent.findUnique({
            where: { googleEventId: item.id },
          });

          changes.push({
            eventId: item.id,
            operation: existingEvent
              ? ('updated' as const)
              : ('created' as const),
          });
        }
      }

      // Update sync token in integration
      if (result.nextSyncToken) {
        await this.prisma.googleCalendarIntegration.update({
          where: { id: integration.id },
          data: {
            lastSyncAt: new Date(),
          },
        });
      }

      return {
        nextSyncToken: result.nextSyncToken,
        changes,
      };
    } catch (_error) {
      console.error('Error syncing from Google Calendar:', error);
      throw error;
    }
  }

  /**
   * Convert appointment to Google Calendar event
   */
  private appointmentToEvent(appointment: AppointmentData): CalendarEvent {
    const event: CalendarEvent = {
      summary: appointment.title,
      description: appointment.description,
      start: {
        dateTime: appointment.startTime.toISOString(),
        timeZone: appointment.timeZone || 'America/Sao_Paulo',
      },
      end: {
        dateTime: appointment.endTime.toISOString(),
        timeZone: appointment.timeZone || 'America/Sao_Paulo',
      },
      location: appointment.location,
      visibility: 'private', // Healthcare appointments should be private
    };

    // Add attendees if available
    const attendees = [];
    if (appointment.patientEmail) {
      attendees.push({
        email: appointment.patientEmail,
        displayName: appointment.patientName,
      });
    }
    if (appointment.professionalEmail) {
      attendees.push({
        email: appointment.professionalEmail,
        displayName: appointment.professionalName,
        responseStatus: 'accepted',
      });
    }
    if (attendees.length > 0) {
      event.attendees = attendees;
    }

    return event;
  }

  /**
   * Ensure tokens are valid, refresh if needed
   */
  private async ensureValidTokens(integration: any): Promise<OAuth2Tokens> {
    const tokens: OAuth2Tokens = {
      access_token: integration.accessToken,
      refresh_token: integration.refreshToken || undefined,
      expiry_date: integration.expiresAt
        ? integration.expiresAt.getTime()
        : undefined,
      token_type: 'Bearer',
      scope: integration.scope,
    };

    // Check if token is expired
    if (integration.expiresAt && integration.expiresAt <= new Date()) {
      if (!integration.refreshToken) {
        throw new Error('Access token expired and no refresh token available');
      }

      // Refresh token
      const newTokens = await this.client.refreshToken(
        integration.refreshToken,
      );

      // Update database with new tokens
      await this.prisma.googleCalendarIntegration.update({
        where: { id: integration.id },
        data: {
          accessToken: newTokens.access_token,
          refreshToken: newTokens.refresh_token || integration.refreshToken,
          expiresAt: new Date(newTokens.expiry_date),
        },
      });

      return newTokens;
    }

    return tokens;
  }

  /**
   * Log sync operation for audit and compliance
   */
  private async logSyncOperation(
    integrationId: string,
    operation: string,
    direction: string,
    appointmentId: string | null,
    eventId: string | null,
    status: string,
    error?: string,
  ): Promise<void> {
    try {
      await this.prisma.googleCalendarSyncLog.create({
        data: {
          integrationId,
          operation,
          direction,
          appointmentId,
          eventId,
          status,
          error,
          ipAddress: 'unknown', // In real app, get from request
          userAgent: 'neonpro-service', // In real app, get from request
        },
      });
    } catch (_logError) {
      console.error('Error logging sync operation:', logError);
      // Don't throw error for logging failures
    }
  }

  /**
   * Disconnect integration
   */
  async disconnect(userId: string, clinicId: string): Promise<boolean> {
    try {
      const integration = await this.getIntegration(userId, clinicId);

      if (!integration) {
        return false;
      }

      // Delete all related events
      await this.prisma.googleCalendarEvent.deleteMany({
        where: {
          appointmentId: {
            in: (
              await this.prisma.googleCalendarEvent.findMany({
                where: { integrationId: integration.id },
                select: { appointmentId: true },
              })
            ).map(e => e.appointmentId),
          },
        },
      });

      // Delete integration
      await this.prisma.googleCalendarIntegration.delete({
        where: { id: integration.id },
      });

      return true;
    } catch (_error) {
      console.error('Error disconnecting Google Calendar:', error);
      return false;
    }
  }
}
