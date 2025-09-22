/**
 * Automated Reminder Scheduler Service
 *
 * Handles automated scheduling and sending of appointment reminders
 * based on configurable time intervals with Brazilian healthcare compliance.
 */

import { createClient } from '@supabase/supabase-js';
import { type AppointmentReminder, whatsappReminderService } from './whatsapp-reminder-service';

export interface ReminderSchedule {
  id: string;
  clinicId: string;
  reminderType: 'confirmation' | 'reminder_24h' | 'reminder_2h' | 'follow_up';
  hoursBeforeAppointment: number;
  isActive: boolean;
  channels: ('whatsapp' | 'sms' | 'email')[];
  language: 'pt-BR' | 'en-US';
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledReminder {
  id: string;
  appointmentId: string;
  scheduleId: string;
  reminderType: string;
  scheduledFor: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  attempts: number;
  lastAttempt?: string;
  nextAttempt?: string;
  createdAt: string;
}

export class ReminderScheduler {
  private supabase: any;
  private isRunning = false;
  private schedulerInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  /**
   * Start the automated reminder scheduler
   */
  async startScheduler(intervalMinutes = 5): Promise<void> {
    if (this.isRunning) {
      console.log('Reminder scheduler already running');
      return;
    }

    console.log(
      `Starting automated reminder scheduler (${intervalMinutes}min intervals)`,
    );
    this.isRunning = true;

    // Run initial check
    await this.processScheduledReminders();

    // Set up recurring interval
    this.schedulerInterval = setInterval(async () => {
        if (this.isRunning) {
          await this.processScheduledReminders();
        }
      },
      intervalMinutes * 60 * 1000,
    );
  }

  /**
   * Stop the automated reminder scheduler
   */
  stopScheduler(): void {
    console.log('Stopping automated reminder scheduler');
    this.isRunning = false;

    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }
  }

  /**
   * Process all pending scheduled reminders
   */
  async processScheduledReminders(): Promise<{
    processed: number;
    sent: number;
    failed: number;
    skipped: number;
  }> {
    const startTime = Date.now();
    let processed = 0;
    let sent = 0;
    let failed = 0;
    let skipped = 0;

    try {
      console.log('Processing scheduled reminders...');

      // Get pending reminders that are due
      const { data: scheduledReminders, error } = await this.supabase
        .from('scheduled_reminders')
        .select(
          `
          *,
          appointments!inner(
            id,
            appointment_date,
            appointment_time,
            status,
            patients!inner(
              id,
              name,
              phone,
              email,
              preferred_contact_method
            ),
            clinics!inner(
              id,
              name,
              address,
              phone
            ),
            doctors!inner(
              name
            )
          ),
          reminder_schedules!inner(
            reminder_type,
            channels,
            language,
            is_active
          )
        `,
        )
        .eq('status', 'pending')
        .lte('scheduled_for', new Date().toISOString())
        .order('scheduled_for', { ascending: true })
        .limit(100); // Process in batches

      if (error) {
        console.error('Error fetching scheduled reminders:', error);
        return { processed: 0, sent: 0, failed: 0, skipped: 0 };
      }

      // Process each reminder
      for (const scheduledReminder of scheduledReminders || []) {
        processed++;

        try {
          // Check if appointment is still valid for reminders
          const appointment = scheduledReminder.appointments;

          if (
            !appointment
            || appointment.status === 'cancelled'
            || appointment.status === 'completed'
          ) {
            // Cancel the reminder
            await this.updateScheduledReminder(scheduledReminder.id, {
              status: 'cancelled',
              updated_at: new Date().toISOString(),
            });
            skipped++;
            continue;
          }

          // Check if reminder schedule is still active
          if (!scheduledReminder.reminder_schedules.is_active) {
            await this.updateScheduledReminder(scheduledReminder.id, {
              status: 'cancelled',
              updated_at: new Date().toISOString(),
            });
            skipped++;
            continue;
          }

          // Build reminder object
          const reminder: AppointmentReminder = {
            appointmentId: appointment.id,
            patientId: appointment.patients.id,
            clinicId: appointment.clinics.id,
            doctorName: appointment.doctors.name,
            appointmentDate: appointment.appointment_date,
            appointmentTime: appointment.appointment_time,
            clinicName: appointment.clinics.name,
            clinicAddress: appointment.clinics.address,
            patientName: appointment.patients.name,
            patientPhone: appointment.patients.phone,
            reminderType: scheduledReminder.reminder_schedules.reminder_type,
            language: scheduledReminder.reminder_schedules.language,
            consentGiven: true,
            preferredChannel: appointment.patients.preferred_contact_method || 'whatsapp',
          };

          // Send reminder
          const result = await whatsappReminderService.sendAppointmentReminder(reminder);

          if (result.success) {
            // Update scheduled reminder as sent
            await this.updateScheduledReminder(scheduledReminder.id, {
              status: 'sent',
              last_attempt: new Date().toISOString(),
              attempts: scheduledReminder.attempts + 1,
              message_id: result.messageId,
              channel_used: result.deliveryStatus.channel,
              fallback_used: result.fallbackUsed,
              updated_at: new Date().toISOString(),
            });
            sent++;
          } else {
            // Handle failure - retry logic
            const newAttempts = scheduledReminder.attempts + 1;
            const maxAttempts = 3;

            if (newAttempts < maxAttempts) {
              // Schedule retry in 1 hour
              const nextAttempt = new Date(
                Date.now() + 60 * 60 * 1000,
              ).toISOString();

              await this.updateScheduledReminder(scheduledReminder.id, {
                status: 'pending',
                last_attempt: new Date().toISOString(),
                next_attempt: nextAttempt,
                attempts: newAttempts,
                error_message: result.deliveryStatus.errorMessage,
                updated_at: new Date().toISOString(),
              });
            } else {
              // Max attempts reached, mark as failed
              await this.updateScheduledReminder(scheduledReminder.id, {
                status: 'failed',
                last_attempt: new Date().toISOString(),
                attempts: newAttempts,
                error_message: result.deliveryStatus.errorMessage,
                updated_at: new Date().toISOString(),
              });
              failed++;
            }
          }
        } catch (reminderError) {
          console.error(
            `Error processing reminder ${scheduledReminder.id}:`,
            reminderError,
          );

          // Update with error
          await this.updateScheduledReminder(scheduledReminder.id, {
            status: 'failed',
            last_attempt: new Date().toISOString(),
            attempts: scheduledReminder.attempts + 1,
            error_message: reminderError instanceof Error
              ? reminderError.message
              : 'Unknown error',
            updated_at: new Date().toISOString(),
          });
          failed++;
        }

        // Small delay between reminders to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      const processingTime = Date.now() - startTime;
      console.log(
        `Reminder processing completed: ${processed} processed, ${sent} sent, ${failed} failed, ${skipped} skipped (${processingTime}ms)`,
      );

      return { processed, sent, failed, skipped };
    } catch (error) {
      console.error('Error in processScheduledReminders:', error);
      return { processed, sent, failed, skipped };
    }
  }

  /**
   * Schedule reminders for new appointment
   */
  async scheduleRemindersForAppointment(appointmentId: string): Promise<{
    scheduled: number;
    reminders: ScheduledReminder[];
  }> {
    try {
      // Get appointment details
      const { data: appointment, error: appointmentError } = await this.supabase
        .from('appointments')
        .select(
          `
          id,
          clinic_id,
          appointment_date,
          appointment_time,
          status
        `,
        )
        .eq('id', appointmentId)
        .single();

      if (appointmentError || !appointment) {
        throw new Error(`Appointment not found: ${appointmentId}`);
      }

      // Skip if appointment is not suitable for reminders
      if (
        appointment.status === 'cancelled'
        || appointment.status === 'completed'
      ) {
        return { scheduled: 0, reminders: [] };
      }

      // Get active reminder schedules for the clinic
      const { data: schedules, error: schedulesError } = await this.supabase
        .from('reminder_schedules')
        .select('*')
        .eq('clinic_id', appointment.clinic_id)
        .eq('is_active', true);

      if (schedulesError || !schedules || schedules.length === 0) {
        console.log(
          `No active reminder schedules found for clinic ${appointment.clinic_id}`,
        );
        return { scheduled: 0, reminders: [] };
      }

      const appointmentDateTime = new Date(
        `${appointment.appointment_date} ${appointment.appointment_time}`,
      );
      const scheduledReminders: ScheduledReminder[] = [];

      // Create scheduled reminders for each active schedule
      for (const schedule of schedules) {
        const reminderTime = new Date(
          appointmentDateTime.getTime()
            - schedule.hours_before_appointment * 60 * 60 * 1000,
        );

        // Only schedule if reminder time is in the future
        if (reminderTime > new Date()) {
          const scheduledReminder = {
            appointment_id: appointmentId,
            schedule_id: schedule.id,
            reminder_type: schedule.reminder_type,
            scheduled_for: reminderTime.toISOString(),
            status: 'pending',
            attempts: 0,
            created_at: new Date().toISOString(),
          };

          const { data: inserted, error: insertError } = await this.supabase
            .from('scheduled_reminders')
            .insert(scheduledReminder)
            .select()
            .single();

          if (insertError) {
            console.error('Error inserting scheduled reminder:', insertError);
          } else {
            scheduledReminders.push(inserted);
          }
        }
      }

      console.log(
        `Scheduled ${scheduledReminders.length} reminders for appointment ${appointmentId}`,
      );

      return {
        scheduled: scheduledReminders.length,
        reminders: scheduledReminders,
      };
    } catch (error) {
      console.error('Error scheduling reminders for appointment:', error);
      throw error;
    }
  }

  /**
   * Cancel scheduled reminders for appointment
   */
  async cancelScheduledReminders(appointmentId: string): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('scheduled_reminders')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('appointment_id', appointmentId)
        .eq('status', 'pending')
        .select();

      if (error) {
        throw error;
      }

      const cancelledCount = data?.length || 0;
      console.log(
        `Cancelled ${cancelledCount} scheduled reminders for appointment ${appointmentId}`,
      );

      return cancelledCount;
    } catch (error) {
      console.error('Error cancelling scheduled reminders:', error);
      throw error;
    }
  }

  /**
   * Get reminder schedules for clinic
   */
  async getReminderSchedules(clinicId: string): Promise<ReminderSchedule[]> {
    try {
      const { data, error } = await this.supabase
        .from('reminder_schedules')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('hours_before_appointment', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error getting reminder schedules:', error);
      throw error;
    }
  }

  /**
   * Create or update reminder schedule
   */
  async upsertReminderSchedule(
    schedule: Partial<ReminderSchedule> & {
      clinicId: string;
      reminderType: string;
      hoursBeforeAppointment: number;
    },
  ): Promise<ReminderSchedule> {
    try {
      const scheduleData = {
        clinic_id: schedule.clinicId,
        reminder_type: schedule.reminderType,
        hours_before_appointment: schedule.hoursBeforeAppointment,
        is_active: schedule.isActive ?? true,
        channels: schedule.channels || ['whatsapp'],
        language: schedule.language || 'pt-BR',
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await this.supabase
        .from('reminder_schedules')
        .upsert(scheduleData, {
          onConflict: 'clinic_id,reminder_type',
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error upserting reminder schedule:', error);
      throw error;
    }
  }

  /**
   * Update scheduled reminder status
   */
  private async updateScheduledReminder(
    id: string,
    updates: Record<string, any>,
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('scheduled_reminders')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating scheduled reminder:', error);
      }
    } catch (error) {
      console.error('Error updating scheduled reminder:', error);
    }
  }

  /**
   * Get scheduler statistics
   */
  async getSchedulerStatistics(
    clinicId?: string,
    days = 7,
  ): Promise<{
    totalScheduled: number;
    sent: number;
    failed: number;
    pending: number;
    cancelled: number;
    successRate: number;
    averageProcessingTime: number;
  }> {
    try {
      const since = new Date(
        Date.now() - days * 24 * 60 * 60 * 1000,
      ).toISOString();

      let query = this.supabase
        .from('scheduled_reminders')
        .select('status, processing_time_ms')
        .gte('created_at', since);

      if (clinicId) {
        query = query.eq('clinic_id', clinicId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const stats = data.reduce((acc,_reminder) => {
          acc.total++;
          acc[reminder.status] = (acc[reminder.status] || 0) + 1;
          if (reminder.processing_time_ms) {
            acc.totalProcessingTime += reminder.processing_time_ms;
            acc.processedCount++;
          }
          return acc;
        },
        {
          total: 0,
          sent: 0,
          failed: 0,
          pending: 0,
          cancelled: 0,
          totalProcessingTime: 0,
          processedCount: 0,
        },
      );

      const successRate = stats.total > 0 ? (stats.sent / stats.total) * 100 : 0;
      const averageProcessingTime = stats.processedCount > 0
        ? stats.totalProcessingTime / stats.processedCount
        : 0;

      return {
        totalScheduled: stats.total,
        sent: stats.sent,
        failed: stats.failed,
        pending: stats.pending,
        cancelled: stats.cancelled,
        successRate: Math.round(successRate * 100) / 100,
        averageProcessingTime: Math.round(averageProcessingTime),
      };
    } catch (error) {
      console.error('Error getting scheduler statistics:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const reminderScheduler = new ReminderScheduler();

// Auto-start scheduler in production
if (
  process.env.NODE_ENV === 'production'
  && process.env.AUTO_START_SCHEDULER === 'true'
) {
  reminderScheduler.startScheduler(5); // Check every 5 minutes
}
