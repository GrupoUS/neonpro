/**
 * Waitlist Manager - Automated waitlist notifications and management
 * Story 2.3: Automated Communication System
 */

import { supabase } from '../supabase';
import { WaitlistEntry, TemplateVariables } from './types';
import { CommunicationService } from './communication-service';

export interface WaitlistNotificationResult {
  entry_id: string;
  patient_id: string;
  notification_sent: boolean;
  error?: string;
  appointment_offered?: {
    id: string;
    scheduled_at: Date;
    professional_id: string;
  };
}

export class WaitlistManager {
  private communicationService: CommunicationService;

  constructor() {
    // Avoid circular dependency by lazy loading
    this.communicationService = null as any;
  }

  /**
   * Add patient to waitlist
   */
  async addToWaitlist({
    patientId,
    clinicId,
    professionalId,
    serviceId,
    preferredDateStart,
    preferredDateEnd,
    preferredTimes
  }: {
    patientId: string;
    clinicId: string;
    professionalId?: string;
    serviceId: string;
    preferredDateStart: Date;
    preferredDateEnd: Date;
    preferredTimes: string[];
  }): Promise<WaitlistEntry> {
    try {
      // Calculate priority score based on various factors
      const priorityScore = await this.calculatePriorityScore({
        patientId,
        clinicId,
        serviceId,
        preferredDateStart
      });

      // Set expiration date (default 30 days)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const waitlistEntry: Partial<WaitlistEntry> = {
        patient_id: patientId,
        clinic_id: clinicId,
        professional_id: professionalId,
        service_id: serviceId,
        preferred_date_start: preferredDateStart,
        preferred_date_end: preferredDateEnd,
        preferred_times: preferredTimes,
        priority_score: priorityScore,
        notification_sent: false,
        expires_at: expiresAt,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      };

      const { data, error } = await supabase
        .from('waitlist_entries')
        .insert(waitlistEntry)
        .select()
        .single();

      if (error) throw error;

      // Send confirmation that patient was added to waitlist
      await this.sendWaitlistConfirmation(data);

      return data;
    } catch (error) {
      console.error('Error adding to waitlist:', error);
      throw error;
    }
  }

  /**
   * Process waitlist notifications for available slots
   */
  async processNotifications(): Promise<WaitlistNotificationResult[]> {
    try {
      const results: WaitlistNotificationResult[] = [];

      // Find available appointment slots in the next 30 days
      const availableSlots = await this.findAvailableSlots();

      for (const slot of availableSlots) {
        // Find matching waitlist entries
        const matchingEntries = await this.findMatchingWaitlistEntries(slot);

        // Process notifications for matching entries (highest priority first)
        for (const entry of matchingEntries.slice(0, 3)) { // Limit to top 3
          const result = await this.notifyWaitlistEntry(entry, slot);
          results.push(result);

          // If notification was sent successfully, mark slot as pending
          if (result.notification_sent) {
            await this.markSlotAsPending(slot, entry.id);
            break; // Only notify one person per slot
          }
        }
      }

      // Clean up expired entries
      await this.cleanupExpiredEntries();

      return results;
    } catch (error) {
      console.error('Error processing waitlist notifications:', error);
      throw error;
    }
  }

  /**
   * Remove patient from waitlist
   */
  async removeFromWaitlist(
    entryId: string,
    reason: 'booked' | 'cancelled' | 'expired' = 'cancelled'
  ): Promise<void> {
    try {
      const status = reason === 'booked' ? 'booked' : 
                    reason === 'expired' ? 'expired' : 'cancelled';

      const { error } = await supabase
        .from('waitlist_entries')
        .update({
          status,
          updated_at: new Date()
        })
        .eq('id', entryId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing from waitlist:', error);
      throw error;
    }
  }

  /**
   * Get waitlist statistics for a clinic
   */
  async getWaitlistStats(clinicId: string): Promise<{
    total_active: number;
    total_notified: number;
    average_wait_time_days: number;
    conversion_rate: number;
    by_service: Array<{
      service_id: string;
      service_name: string;
      count: number;
      average_priority: number;
    }>;
  }> {
    try {
      // Get active waitlist entries
      const { data: activeEntries } = await supabase
        .from('waitlist_entries')
        .select(`
          *,
          services(name)
        `)
        .eq('clinic_id', clinicId)
        .eq('status', 'active');

      // Get notified entries from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: notifiedEntries } = await supabase
        .from('waitlist_entries')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('notification_sent', true)
        .gte('last_notification_at', thirtyDaysAgo.toISOString());

      // Get booked entries from last 30 days
      const { data: bookedEntries } = await supabase
        .from('waitlist_entries')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('status', 'booked')
        .gte('updated_at', thirtyDaysAgo.toISOString());

      // Calculate statistics
      const totalActive = activeEntries?.length || 0;
      const totalNotified = notifiedEntries?.length || 0;
      const totalBooked = bookedEntries?.length || 0;
      
      const conversionRate = totalNotified > 0 ? totalBooked / totalNotified : 0;

      // Calculate average wait time
      const now = new Date();
      const averageWaitTime = activeEntries?.reduce((sum, entry) => {
        const waitDays = Math.floor(
          (now.getTime() - new Date(entry.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        return sum + waitDays;
      }, 0) || 0;
      
      const avgWaitTimeDays = totalActive > 0 ? averageWaitTime / totalActive : 0;

      // Group by service
      const byService = activeEntries?.reduce((acc, entry) => {
        const serviceId = entry.service_id;
        const serviceName = entry.services?.name || 'Unknown';
        
        const existing = acc.find(s => s.service_id === serviceId);
        if (existing) {
          existing.count++;
          existing.average_priority = (existing.average_priority + entry.priority_score) / 2;
        } else {
          acc.push({
            service_id: serviceId,
            service_name: serviceName,
            count: 1,
            average_priority: entry.priority_score
          });
        }
        
        return acc;
      }, [] as any[]) || [];

      return {
        total_active: totalActive,
        total_notified: totalNotified,
        average_wait_time_days: avgWaitTimeDays,
        conversion_rate: conversionRate,
        by_service: byService
      };
    } catch (error) {
      console.error('Error getting waitlist stats:', error);
      throw error;
    }
  }

  /**
   * Update waitlist entry priority
   */
  async updatePriority(entryId: string, newPriority: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('waitlist_entries')
        .update({
          priority_score: newPriority,
          updated_at: new Date()
        })
        .eq('id', entryId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating waitlist priority:', error);
      throw error;
    }
  }

  // Private helper methods
  private async calculatePriorityScore({
    patientId,
    clinicId,
    serviceId,
    preferredDateStart
  }: {
    patientId: string;
    clinicId: string;
    serviceId: string;
    preferredDateStart: Date;
  }): Promise<number> {
    let score = 50; // Base score

    try {
      // Check patient history
      const { data: patientHistory } = await supabase
        .from('appointments')
        .select('status, actual_no_show')
        .eq('patient_id', patientId)
        .eq('clinic_id', clinicId);

      if (patientHistory) {
        // Loyal patients get higher priority
        const totalAppointments = patientHistory.length;
        const noShows = patientHistory.filter(a => a.actual_no_show).length;
        const noShowRate = totalAppointments > 0 ? noShows / totalAppointments : 0;

        score += Math.min(totalAppointments * 2, 20); // Up to +20 for loyalty
        score -= noShowRate * 30; // Penalty for no-shows
      }

      // Urgency based on preferred date
      const daysUntilPreferred = Math.floor(
        (preferredDateStart.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysUntilPreferred <= 7) score += 15; // Urgent requests
      else if (daysUntilPreferred <= 14) score += 10;
      else if (daysUntilPreferred > 30) score -= 5; // Far future requests

      // Service-specific priority (some services might be more urgent)
      const { data: service } = await supabase
        .from('services')
        .select('priority_level')
        .eq('id', serviceId)
        .single();

      if (service?.priority_level) {
        score += service.priority_level * 5;
      }

      return Math.max(0, Math.min(100, score)); // Clamp between 0-100
    } catch (error) {
      console.error('Error calculating priority score:', error);
      return 50; // Default score on error
    }
  }

  private async findAvailableSlots(): Promise<Array<{
    professional_id: string;
    clinic_id: string;
    service_id: string;
    available_at: Date;
    duration_minutes: number;
  }>> {
    try {
      // This is a simplified implementation
      // In a real system, this would check professional schedules,
      // existing appointments, and availability rules
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      // Find cancelled or no-show appointments that create availability
      const { data: cancelledAppointments } = await supabase
        .from('appointments')
        .select(`
          professional_id,
          clinic_id,
          service_id,
          scheduled_at,
          duration_minutes
        `)
        .in('status', ['cancelled', 'no_show'])
        .gte('scheduled_at', tomorrow.toISOString())
        .lte('scheduled_at', thirtyDaysFromNow.toISOString())
        .order('scheduled_at');

      return (cancelledAppointments || []).map(apt => ({
        professional_id: apt.professional_id,
        clinic_id: apt.clinic_id,
        service_id: apt.service_id,
        available_at: new Date(apt.scheduled_at),
        duration_minutes: apt.duration_minutes || 60
      }));
    } catch (error) {
      console.error('Error finding available slots:', error);
      return [];
    }
  }

  private async findMatchingWaitlistEntries(slot: any): Promise<WaitlistEntry[]> {
    try {
      const { data: entries } = await supabase
        .from('waitlist_entries')
        .select(`
          *,
          patients(*),
          services(*)
        `)
        .eq('clinic_id', slot.clinic_id)
        .eq('service_id', slot.service_id)
        .eq('status', 'active')
        .lte('preferred_date_start', slot.available_at.toISOString())
        .gte('preferred_date_end', slot.available_at.toISOString())
        .order('priority_score', { ascending: false })
        .order('created_at', { ascending: true }); // FIFO for same priority

      return entries || [];
    } catch (error) {
      console.error('Error finding matching waitlist entries:', error);
      return [];
    }
  }

  private async notifyWaitlistEntry(
    entry: WaitlistEntry,
    slot: any
  ): Promise<WaitlistNotificationResult> {
    try {
      // Lazy load communication service to avoid circular dependency
      if (!this.communicationService) {
        const { CommunicationService } = await import('./communication-service');
        this.communicationService = new CommunicationService();
      }

      const variables: TemplateVariables = {
        patient_name: entry.patients?.name || 'Paciente',
        patient_first_name: entry.patients?.name?.split(' ')[0] || 'Paciente',
        clinic_name: 'NeonPro', // Would come from clinic data
        appointment_date: slot.available_at.toLocaleDateString(),
        appointment_time: slot.available_at.toLocaleTimeString(),
        professional_name: 'Profissional', // Would come from professional data
        service_name: entry.services?.name || 'Serviço',
        clinic_phone: '(11) 99999-9999',
        clinic_address: 'Endereço da Clínica',
        confirmation_link: `${process.env.NEXT_PUBLIC_APP_URL}/waitlist/accept/${entry.id}?slot=${slot.available_at.getTime()}`
      };

      // Get waitlist notification template
      const { data: template } = await supabase
        .from('message_templates')
        .select('*')
        .eq('clinic_id', entry.clinic_id)
        .eq('type', 'waitlist')
        .eq('active', true)
        .limit(1)
        .single();

      if (!template) {
        throw new Error('Waitlist notification template not found');
      }

      await this.communicationService.sendMessage({
        patientId: entry.patient_id,
        clinicId: entry.clinic_id,
        messageType: 'waitlist',
        templateId: template.id,
        variables
      });

      // Update entry as notified
      await supabase
        .from('waitlist_entries')
        .update({
          notification_sent: true,
          last_notification_at: new Date(),
          updated_at: new Date()
        })
        .eq('id', entry.id);

      return {
        entry_id: entry.id,
        patient_id: entry.patient_id,
        notification_sent: true,
        appointment_offered: {
          id: `temp_${Date.now()}`,
          scheduled_at: slot.available_at,
          professional_id: slot.professional_id
        }
      };
    } catch (error) {
      console.error('Error notifying waitlist entry:', error);
      return {
        entry_id: entry.id,
        patient_id: entry.patient_id,
        notification_sent: false,
        error: error.message
      };
    }
  }

  private async sendWaitlistConfirmation(entry: WaitlistEntry): Promise<void> {
    try {
      // Implementation for sending confirmation that patient was added to waitlist
      // This would use the communication service to send a confirmation message
    } catch (error) {
      console.error('Error sending waitlist confirmation:', error);
    }
  }

  private async markSlotAsPending(slot: any, entryId: string): Promise<void> {
    try {
      // Mark the slot as pending for a specific waitlist entry
      // This prevents multiple notifications for the same slot
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 2); // 2-hour response window

      await supabase
        .from('pending_waitlist_slots')
        .insert({
          waitlist_entry_id: entryId,
          professional_id: slot.professional_id,
          clinic_id: slot.clinic_id,
          slot_time: slot.available_at,
          expires_at: expiresAt,
          created_at: new Date()
        });
    } catch (error) {
      console.error('Error marking slot as pending:', error);
    }
  }

  private async cleanupExpiredEntries(): Promise<void> {
    try {
      const now = new Date();
      
      // Mark expired waitlist entries
      await supabase
        .from('waitlist_entries')
        .update({ status: 'expired' })
        .eq('status', 'active')
        .lt('expires_at', now.toISOString());

      // Clean up expired pending slots
      await supabase
        .from('pending_waitlist_slots')
        .delete()
        .lt('expires_at', now.toISOString());
    } catch (error) {
      console.error('Error cleaning up expired entries:', error);
    }
  }
}
