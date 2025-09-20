import { PrismaClient } from '@prisma/client';
import { GoogleCalendarService } from './service';

export interface SyncOptions {
  bidirectional?: boolean;
  conflictResolution?: 'google_wins' | 'local_wins' | 'manual';
  batchSize?: number;
  dryRun?: boolean;
}

export interface SyncResult {
  success: boolean;
  created: number;
  updated: number;
  deleted: number;
  conflicts: Array<{
    appointmentId: string;
    googleEventId: string;
    type: string;
    resolution?: string;
  }>;
  errors: Array<{
    appointmentId?: string;
    error: string;
  }>;
}

export class GoogleCalendarSyncService {
  private prisma: PrismaClient;
  private calendarService: GoogleCalendarService;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient();
    this.calendarService = new GoogleCalendarService(
      {
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID!,
        clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET!,
        redirectUri: `${window.location.origin}/google-calendar/auth`,
      },
      this.prisma,
    );
  }

  /**
   * Sync appointments for a specific user and clinic
   */
  async syncUserAppointments(
    userId: string,
    clinicId: string,
    options: SyncOptions = {},
  ): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      created: 0,
      updated: 0,
      deleted: 0,
      conflicts: [],
      errors: [],
    };

    try {
      // Get user's Google Calendar integration
      const integration = await this.prisma.googleCalendarIntegration.findUnique({
        where: {
          userId_clinicId: { userId, clinicId },
        },
      });

      if (!integration || !integration.syncEnabled) {
        return {
          ...result,
          success: false,
          errors: [
            { error: 'Google Calendar integration not found or disabled' },
          ],
        };
      }

      // Get appointments that need syncing
      const appointments = await this.getAppointmentsToSync(
        userId,
        clinicId,
        integration,
      );

      // Sync each appointment
      for (const appointment of appointments) {
        try {
          const syncResult = await this.syncAppointment(
            appointment,
            integration,
            options,
          );

          if (syncResult.success) {
            if (syncResult.operation === 'created') result.created++;
            else if (syncResult.operation === 'updated') result.updated++;
            else if (syncResult.operation === 'deleted') result.deleted++;
          } else {
            result.errors.push({
              appointmentId: appointment.id,
              error: syncResult.error || 'Unknown error',
            });
          }
        } catch (error) {
          result.errors.push({
            appointmentId: appointment.id,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      // Sync from Google if bidirectional
      if (options.bidirectional && integration.bidirectional) {
        await this.syncFromGoogle(integration, result);
      }

      // Update integration last sync time
      await this.prisma.googleCalendarIntegration.update({
        where: { id: integration.id },
        data: {
          lastSyncAt: new Date(),
          errorCount: result.errors.length > 0 ? result.errors.length : 0,
          lastError: result.errors.length > 0 ? result.errors[0].error : null,
        },
      });
    } catch (error) {
      console.error('Error syncing appointments:', error);
      result.success = false;
      result.errors.push({
        error: error instanceof Error ? error.message : String(error),
      });
    }

    return result;
  }

  /**
   * Get appointments that need to be synced
   */
  private async getAppointmentsToSync(
    userId: string,
    clinicId: string,
    integration: any,
  ) {
    // Get appointments modified since last sync or new appointments
    const lastSyncAt = integration.lastSyncAt || new Date(0);

    return await this.prisma.appointment.findMany({
      where: {
        clinicId,
        // Include appointments modified after last sync OR appointments without Google Calendar mapping
        OR: [
          {
            updatedAt: { gt: lastSyncAt },
          },
          {
            googleCalendarEvent: null,
          },
        ],
        // Exclude cancelled appointments unless they have a Google Calendar event
        AND: [
          {
            OR: [
              { status: { not: 'cancelled' } },
              {
                status: 'cancelled',
                googleCalendarEvent: { some: {} },
              },
            ],
          },
        ],
      },
      include: {
        patient: true,
        professional: true,
        googleCalendarEvent: true,
      },
      orderBy: {
        updatedAt: 'asc',
      },
    });
  }

  /**
   * Sync a single appointment
   */
  private async syncAppointment(
    appointment: any,
    integration: any,
    options: SyncOptions,
  ): Promise<{ success: boolean; operation?: string; error?: string }> {
    // Don't sync if this is a dry run
    if (options.dryRun) {
      return { success: true, operation: 'dry_run' };
    }

    // Handle cancelled appointments
    if (appointment.status === 'cancelled') {
      if (appointment.googleCalendarEvent) {
        await this.calendarService.syncAppointment(
          {
            id: appointment.id,
            title: appointment.patient?.name
              ? `Consulta: ${appointment.patient.name}`
              : 'Consulta Agendada',
            startTime: appointment.startTime,
            endTime: appointment.endTime,
            timeZone: appointment.timeZone || 'America/Sao_Paulo',
            location: appointment.appointmentLocation,
            patientEmail: appointment.patient?.email,
            patientName: appointment.patient?.name,
            professionalEmail: appointment.professional?.email,
            professionalName: appointment.professional?.name,
          },
          integration.userId,
          integration.clinicId,
          'DELETE',
        );
        return { success: true, operation: 'deleted' };
      }
      return { success: true, operation: 'ignored' };
    }

    // Determine operation type
    let operation: 'CREATE' | 'UPDATE' = 'CREATE';
    if (appointment.googleCalendarEvent) {
      // Check if appointment has been modified since last sync
      const lastSync = appointment.googleCalendarEvent.lastSyncAt;
      if (appointment.updatedAt > lastSync) {
        operation = 'UPDATE';
      } else {
        // No changes needed
        return { success: true, operation: 'ignored' };
      }
    }

    // Sync appointment
    const result = await this.calendarService.syncAppointment(
      {
        id: appointment.id,
        title: appointment.patient?.name
          ? `Consulta: ${appointment.patient.name}`
          : 'Consulta Agendada',
        description: appointment.chiefComplaint || appointment.notes,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        timeZone: appointment.timeZone || 'America/Sao_Paulo',
        location: appointment.appointmentLocation,
        patientEmail: appointment.patient?.email,
        patientName: appointment.patient?.name,
        professionalEmail: appointment.professional?.email,
        professionalName: appointment.professional?.name,
      },
      integration.userId,
      integration.clinicId,
      operation,
    );

    return {
      success: result.success,
      operation: operation.toLowerCase(),
      error: result.error,
    };
  }

  /**
   * Sync changes from Google Calendar to local appointments
   */
  private async syncFromGoogle(
    integration: any,
    result: SyncResult,
  ): Promise<void> {
    try {
      const syncResult = await this.calendarService.syncFromGoogle(
        integration.userId,
        integration.clinicId,
      );

      // Process changes from Google
      for (const change of syncResult.changes) {
        const googleEvent = await this.calendarService.client.getEvent(
          integration.syncCalendarId,
          change.eventId,
        );

        if (change.operation === 'deleted') {
          // Mark corresponding appointment as cancelled
          const existingMapping = await this.prisma.googleCalendarEvent.findUnique({
            where: { googleEventId: change.eventId },
          });

          if (existingMapping) {
            await this.prisma.appointment.update({
              where: { id: existingMapping.appointmentId },
              data: { status: 'cancelled' },
            });
          }
        } else if (
          change.operation === 'created'
          || change.operation === 'updated'
        ) {
          // Find or create appointment from Google event
          const existingMapping = await this.prisma.googleCalendarEvent.findUnique({
            where: { googleEventId: change.eventId },
          });

          if (existingMapping) {
            // Update existing appointment
            await this.updateAppointmentFromGoogleEvent(
              existingMapping.appointmentId,
              googleEvent,
            );
          } else {
            // This is a new event created in Google Calendar
            // In a healthcare context, we might want to ignore these or create them
            // based on business rules
          }
        }
      }
    } catch (error) {
      console.error('Error syncing from Google:', error);
      result.errors.push({
        error: `Sync from Google failed: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }

  /**
   * Update appointment based on Google Calendar event
   */
  private async updateAppointmentFromGoogleEvent(
    appointmentId: string,
    googleEvent: any,
  ): Promise<void> {
    // Extract appointment details from Google event
    const startTime = new Date(
      googleEvent.start.dateTime || googleEvent.start.date,
    );
    const endTime = new Date(googleEvent.end.dateTime || googleEvent.end.date);

    // Update appointment
    await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        startTime,
        endTime,
        // Only update location if it exists
        ...(googleEvent.location && {
          appointmentLocation: googleEvent.location,
        }),
        // Note: We don't update patient/professional info from Google
        // as this could compromise data integrity in healthcare context
      },
    });
  }

  /**
   * Batch sync for multiple users/clinics
   */
  async batchSync(
    userClinicPairs: Array<{ userId: string; clinicId: string }>,
    options: SyncOptions = {},
  ): Promise<Map<string, SyncResult>> {
    const results = new Map<string, SyncResult>();

    for (const pair of userClinicPairs) {
      const key = `${pair.userId}_${pair.clinicId}`;
      const result = await this.syncUserAppointments(
        pair.userId,
        pair.clinicId,
        options,
      );
      results.set(key, result);
    }

    return results;
  }

  /**
   * Schedule automatic sync
   */
  async scheduleAutoSync(
    userId: string,
    clinicId: string,
    intervalMinutes: number = 30,
  ): Promise<string> {
    // In a real implementation, this would set up a cron job or similar
    // For now, return a mock schedule ID
    return `sync_${userId}_${clinicId}_${intervalMinutes}m`;
  }

  /**
   * Cancel scheduled sync
   */
  async cancelAutoSync(scheduleId: string): Promise<boolean> {
    // In a real implementation, this would remove the scheduled job
    return true;
  }
}
