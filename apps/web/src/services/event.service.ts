/**
 * Event Service - Event Management System with Healthcare Integration
 * Provides CRUD operations for calendar events using the appointments database table
 * with comprehensive validation, filtering, and search capabilities
 */

import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/lib/supabase/types/database';
import {
  addHours,
  addMinutes,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isSameWeek,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

// Type definitions
type AppointmentInsert = Database['public']['Tables']['appointments']['Insert'];
type AppointmentUpdate = Database['public']['Tables']['appointments']['Update'];
type AppointmentRow = Database['public']['Tables']['appointments']['Row'];

// Event interface that extends CalendarEvent with additional metadata
export interface CalendarEventExtended {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: string;
  label?: string;
  location?: string;
  // Additional fields from appointments
  status?: string;
  priority?: number;
  patientId?: string;
  professionalId?: string;
  serviceTypeId?: string;
  clinicId?: string;
  notes?: string;
  internalNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Event filter options
export interface EventFilterOptions {
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: string[];
  priority?: number[];
  patientId?: string[];
  professionalId?: string[];
  clinicId?: string[];
  searchTerm?: string;
  color?: string[];
}

// Event search options
export interface EventSearchOptions {
  _query: string;
  searchIn?: ['title' | 'description' | 'notes' | 'patient' | 'professional'];
  dateRange?: {
    start: Date;
    end: Date;
  };
  limit?: number;
  offset?: number;
}

// Event creation data
export interface CreateEventData {
  title: string;
  start: Date;
  end: Date;
  description?: string;
  allDay?: boolean;
  color?: string;
  location?: string;
  patientId?: string;
  professionalId?: string;
  serviceTypeId?: string;
  clinicId: string;
  notes?: string;
  priority?: number;
  status?: string;
}

// Event update data
export interface UpdateEventData {
  id: string;
  title?: string;
  start?: Date;
  end?: Date;
  description?: string;
  allDay?: boolean;
  color?: string;
  location?: string;
  patientId?: string;
  professionalId?: string;
  serviceTypeId?: string;
  clinicId?: string;
  notes?: string;
  priority?: number;
  status?: string;
}

// Event validation result
export interface EventValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Event Service - Main service class for event management
 */
export class EventService {
  /**
   * Convert appointment database row to CalendarEvent format
   */
  private static appointmentToEvent(appointment: AppointmentRow): CalendarEventExtended {
    // Generate title from related data (this would need to be fetched separately)
    const title = `Appointment #${appointment.id.slice(0, 8)}`;

    return {
      id: appointment.id,
      title,
      start: parseISO(appointment.start_time),
      end: parseISO(appointment.end_time),
      color: this.getStatusColor(appointment.status),
      status: appointment.status,
      priority: appointment.priority,
      patientId: appointment.patient_id,
      professionalId: appointment.professional_id,
      serviceTypeId: appointment.service_type_id,
      clinicId: appointment.clinic_id,
      notes: appointment.notes,
      internalNotes: appointment.internal_notes,
      createdAt: appointment.created_at ? parseISO(appointment.created_at) : undefined,
      updatedAt: appointment.updated_at ? parseISO(appointment.updated_at) : undefined,
    };
  }

  /**
   * Get color based on appointment status
   */
  private static getStatusColor(status?: string): string {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'emerald';
      case 'pending':
        return 'orange';
      case 'cancelled':
        return 'rose';
      case 'completed':
        return 'blue';
      case 'no_show':
        return 'violet';
      default:
        return 'sky';
    }
  }

  /**
   * Convert CalendarEvent to appointment insert format
   */
  private static eventToAppointmentInsert(event: CreateEventData): AppointmentInsert {
    return {
      clinic_id: event.clinicId,
      patient_id: event.patientId || '',
      professional_id: event.professionalId || '',
      service_type_id: event.serviceTypeId || '',
      start_time: event.start.toISOString(),
      end_time: event.end.toISOString(),
      status: event.status || 'pending',
      priority: event.priority,
      notes: event.notes,
      created_by: 'system', // This should be the current user ID
    };
  }

  /**
   * Convert CalendarEvent to appointment update format
   */
  private static eventToAppointmentUpdate(event: UpdateEventData): AppointmentUpdate {
    const update: AppointmentUpdate = {
      id: event.id,
    };

    if (event.start) update.start_time = event.start.toISOString();
    if (event.end) update.end_time = event.end.toISOString();
    if (event.status) update.status = event.status;
    if (event.priority !== undefined) update.priority = event.priority;
    if (event.notes !== undefined) update.notes = event.notes;
    if (event.patientId) update.patient_id = event.patientId;
    if (event.professionalId) update.professional_id = event.professionalId;
    if (event.serviceTypeId) update.service_type_id = event.serviceTypeId;
    if (event.clinicId) update.clinic_id = event.clinicId;

    return update;
  }

  /**
   * Validate event data
   */
  static validateEvent(event: CreateEventData | UpdateEventData): EventValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields validation
    if ('title' in event && !event.title?.trim()) {
      errors.push('Event title is required');
    }

    if (event.start && event.end) {
      if (isAfter(event.start, event.end)) {
        errors.push('Event start time must be before end time');
      }

      // Check for reasonable event duration
      const duration = event.end.getTime() - event.start.getTime();
      const durationMinutes = duration / (1000 * 60);

      if (durationMinutes < 5) {
        warnings.push('Event duration is less than 5 minutes');
      }

      if (durationMinutes > 480) { // 8 hours
        warnings.push('Event duration exceeds 8 hours');
      }
    }

    // Business hours validation (optional)
    if (event.start) {
      const hour = event.start.getHours();
      if (hour < 6 || hour > 22) {
        warnings.push('Event is scheduled outside normal business hours');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Create a new event
   */
  static async createEvent(eventData: CreateEventData): Promise<CalendarEventExtended> {
    const validation = this.validateEvent(eventData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const appointmentData = this.eventToAppointmentInsert(eventData);

    const { data, error } = await supabase
      .from('appointments')
      .insert(appointmentData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create event: ${error.message}`);
    }

    return this.appointmentToEvent(data);
  }

  /**
   * Get event by ID
   */
  static async getEventById(id: string): Promise<CalendarEventExtended | null> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to get event: ${error.message}`);
    }

    return this.appointmentToEvent(data);
  }

  /**
   * Update an existing event
   */
  static async updateEvent(eventData: UpdateEventData): Promise<CalendarEventExtended> {
    const validation = this.validateEvent(eventData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const appointmentData = this.eventToAppointmentUpdate(eventData);

    const { data, error } = await supabase
      .from('appointments')
      .update(appointmentData)
      .eq('id', eventData.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update event: ${error.message}`);
    }

    return this.appointmentToEvent(data);
  }

  /**
   * Delete an event
   */
  static async deleteEvent(id: string): Promise<void> {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete event: ${error.message}`);
    }
  }

  /**
   * Get events with filtering
   */
  static async getEvents(filters?: EventFilterOptions): Promise<CalendarEventExtended[]> {
    let query = supabase
      .from('appointments')
      .select('*');

    // Apply date range filter
    if (filters?.dateRange) {
      query = query
        .gte('start_time', filters.dateRange.start.toISOString())
        .lte('end_time', filters.dateRange.end.toISOString());
    }

    // Apply status filter
    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }

    // Apply priority filter
    if (filters?.priority && filters.priority.length > 0) {
      query = query.in('priority', filters.priority);
    }

    // Apply patient filter
    if (filters?.patientId && filters.patientId.length > 0) {
      query = query.in('patient_id', filters.patientId);
    }

    // Apply professional filter
    if (filters?.professionalId && filters.professionalId.length > 0) {
      query = query.in('professional_id', filters.professionalId);
    }

    // Apply clinic filter
    if (filters?.clinicId && filters.clinicId.length > 0) {
      query = query.in('clinic_id', filters.clinicId);
    }

    // Apply search term filter (basic text search)
    if (filters?.searchTerm) {
      query = query.or(
        `notes.ilike.%${filters.searchTerm}%,internal_notes.ilike.%${filters.searchTerm}%`,
      );
    }

    // Order by start time
    query = query.order('start_time', { ascending: true });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get events: ${error.message}`);
    }

    return data.map(appointment => this.appointmentToEvent(appointment));
  }

  /**
   * Search events with advanced search capabilities
   */
  static async searchEvents(searchOptions: EventSearchOptions): Promise<{
    events: CalendarEventExtended[];
    totalCount: number;
    hasMore: boolean;
  }> {
    const {
      query,
      searchIn = ['title', 'description', 'notes'],
      dateRange,
      limit = 20,
      offset = 0,
    } = searchOptions;

    let dbQuery = supabase
      .from('appointments')
      .select('*', { count: 'exact' });

    // Apply date range if provided
    if (dateRange) {
      dbQuery = dbQuery
        .gte('start_time', dateRange.start.toISOString())
        .lte('end_time', dateRange.end.toISOString());
    }

    // Apply search conditions
    const searchConditions: string[] = [];

    if (searchIn.includes('title') || searchIn.includes('description')) {
      // Since we don't have a direct title field, we'll search in notes
      searchConditions.push(`notes.ilike.%${query}%`);
    }

    if (searchIn.includes('notes')) {
      searchConditions.push(`notes.ilike.%${query}%`);
    }

    if (searchConditions.length > 0) {
      dbQuery = dbQuery.or(searchConditions.join(','));
    }

    // Apply pagination
    dbQuery = dbQuery
      .order('start_time', { ascending: true })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await dbQuery;

    if (error) {
      throw new Error(`Failed to search events: ${error.message}`);
    }

    return {
      events: data.map(appointment => this.appointmentToEvent(appointment)),
      totalCount: count || 0,
      hasMore: (count || 0) > offset + limit,
    };
  }

  /**
   * Get events for a specific date range
   */
  static async getEventsForDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<CalendarEventExtended[]> {
    return this.getEvents({
      dateRange: { start: startDate, end: endDate },
    });
  }

  /**
   * Get events for today
   */
  static async getTodayEvents(): Promise<CalendarEventExtended[]> {
    const today = new Date();
    return this.getEventsForDateRange(startOfDay(today), endOfDay(today));
  }

  /**
   * Get events for this week
   */
  static async getThisWeekEvents(): Promise<CalendarEventExtended[]> {
    const today = new Date();
    return this.getEventsForDateRange(
      startOfWeek(today, { weekStartsOn: 0 }),
      endOfWeek(today, { weekStartsOn: 0 }),
    );
  }

  /**
   * Get events for this month
   */
  static async getThisMonthEvents(): Promise<CalendarEventExtended[]> {
    const today = new Date();
    return this.getEventsForDateRange(startOfMonth(today), endOfMonth(today));
  }

  /**
   * Get upcoming events (from now onwards)
   */
  static async getUpcomingEvents(limit: number = 10): Promise<CalendarEventExtended[]> {
    const _now = new Date();
    const events = await this.getEvents({
      dateRange: { start: now, end: addMonths(now, 3) },
    });

    return events.slice(0, limit);
  }

  /**
   * Check for conflicting events
   */
  static async checkConflicts(
    start: Date,
    end: Date,
    excludeEventId?: string,
  ): Promise<CalendarEventExtended[]> {
    const events = await this.getEvents({
      dateRange: {
        start: addMinutes(start, -30), // Check 30 minutes before
        end: addMinutes(end, 30), // Check 30 minutes after
      },
    });

    return events.filter(event => {
      if (excludeEventId && event.id === excludeEventId) {
        return false;
      }

      // Check for overlap
      return (
        (isAfter(event.start, start) && isBefore(event.start, end))
        || (isAfter(event.end, start) && isBefore(event.end, end))
        || (isBefore(event.start, start) && isAfter(event.end, end))
      );
    });
  }

  /**
   * Get event statistics
   */
  static async getEventStatistics(dateRange?: { start: Date; end: Date }): Promise<{
    totalEvents: number;
    eventsByStatus: Record<string, number>;
    eventsByPriority: Record<number, number>;
    averageDuration: number;
  }> {
    const events = dateRange
      ? await this.getEvents({ dateRange })
      : await this.getEvents();

    const eventsByStatus: Record<string, number> = {};
    const eventsByPriority: Record<number, number> = {};
    let totalDuration = 0;

    events.forEach(_event => {
      // Count by status
      const status = event.status || 'unknown';
      eventsByStatus[status] = (eventsByStatus[status] || 0) + 1;

      // Count by priority
      const priority = event.priority || 0;
      eventsByPriority[priority] = (eventsByPriority[priority] || 0) + 1;

      // Calculate total duration
      totalDuration += event.end.getTime() - event.start.getTime();
    });

    return {
      totalEvents: events.length,
      eventsByStatus,
      eventsByPriority,
      averageDuration: events.length > 0 ? totalDuration / events.length : 0,
    };
  }
}
