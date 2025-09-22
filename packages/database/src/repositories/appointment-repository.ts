import { SupabaseClient } from "@supabase/supabase-js";
import { 
  AppointmentRepository as IAppointmentRepository,
  Appointment,
  AppointmentStatus,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  AppointmentFilter,
  AppointmentSearchResult,
  AppointmentQueryOptions
} from "@neonpro/domain";

/**
 * Supabase implementation of AppointmentRepository
 * Handles all appointment data access operations
 */
export class AppointmentRepository implements IAppointmentRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<Appointment | null> {
    try {
      const { data, error } = await this.supabase
        .from("appointments")
        .select(`
          *,
          patient:patients(id, full_name, cpf),
          professional:professionals(id, full_name, specialty),
          service_type:service_types(id, name, duration)
        `)
        .eq("id", id)
        .single();

      if (error) {
        console.error("AppointmentRepository.findById error:", error);
        return null;
      }

      if (!data) return null;

      return this.mapDatabaseAppointmentToDomain(data);
    } catch (error) {
      console.error("AppointmentRepository.findById error:", error);
      return null;
    }
  }

  async findByPatientId(patientId: string, options?: AppointmentQueryOptions): Promise<AppointmentSearchResult> {
    try {
      let query = this.supabase
        .from("appointments")
        .select("*", { count: "exact" })
        .eq("patient_id", patientId);

      // Apply filters
      if (options?.status) {
        query = query.eq("status", options.status);
      }

      // Apply date range filter
      if (options?.startDate) {
        query = query.gte("start_time", options.startDate.toISOString());
      }

      if (options?.endDate) {
        query = query.lte("end_time", options.endDate.toISOString());
      }

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      // Apply sorting
      if (options?.sortBy) {
        const sortOrder = options.sortOrder === "desc" ? false : true;
        query = query.order(options.sortBy, { ascending: sortOrder });
      } else {
        query = query.order("start_time", { ascending: false });
      }

      const { data, error, count } = await query;

      if (error) {
        console.error("AppointmentRepository.findByPatientId error:", error);
        return { appointments: [], total: 0 };
      }

      const appointments = data ? data.map(this.mapDatabaseAppointmentToDomain) : [];

      return {
        appointments,
        total: count || 0,
        limit: options?.limit || 10,
        offset: options?.offset || 0
      };
    } catch (error) {
      console.error("AppointmentRepository.findByPatientId error:", error);
      return { appointments: [], total: 0 };
    }
  }

  async findByProfessionalId(professionalId: string, options?: AppointmentQueryOptions): Promise<AppointmentSearchResult> {
    try {
      let query = this.supabase
        .from("appointments")
        .select("*", { count: "exact" })
        .eq("professional_id", professionalId);

      // Apply filters
      if (options?.status) {
        query = query.eq("status", options.status);
      }

      // Apply date range filter
      if (options?.startDate) {
        query = query.gte("start_time", options.startDate.toISOString());
      }

      if (options?.endDate) {
        query = query.lte("end_time", options.endDate.toISOString());
      }

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      // Apply sorting
      if (options?.sortBy) {
        const sortOrder = options.sortOrder === "desc" ? false : true;
        query = query.order(options.sortBy, { ascending: sortOrder });
      } else {
        query = query.order("start_time", { ascending: false });
      }

      const { data, error, count } = await query;

      if (error) {
        console.error("AppointmentRepository.findByProfessionalId error:", error);
        return { appointments: [], total: 0 };
      }

      const appointments = data ? data.map(this.mapDatabaseAppointmentToDomain) : [];

      return {
        appointments,
        total: count || 0,
        limit: options?.limit || 10,
        offset: options?.offset || 0
      };
    } catch (error) {
      console.error("AppointmentRepository.findByProfessionalId error:", error);
      return { appointments: [], total: 0 };
    }
  }

  async findByClinicId(clinicId: string, options?: AppointmentQueryOptions): Promise<AppointmentSearchResult> {
    try {
      let query = this.supabase
        .from("appointments")
        .select("*", { count: "exact" })
        .eq("clinic_id", clinicId);

      // Apply filters
      if (options?.status) {
        query = query.eq("status", options.status);
      }

      // Apply date range filter
      if (options?.startDate) {
        query = query.gte("start_time", options.startDate.toISOString());
      }

      if (options?.endDate) {
        query = query.lte("end_time", options.endDate.toISOString());
      }

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      // Apply sorting
      if (options?.sortBy) {
        const sortOrder = options.sortOrder === "desc" ? false : true;
        query = query.order(options.sortBy, { ascending: sortOrder });
      } else {
        query = query.order("start_time", { ascending: false });
      }

      const { data, error, count } = await query;

      if (error) {
        console.error("AppointmentRepository.findByClinicId error:", error);
        return { appointments: [], total: 0 };
      }

      const appointments = data ? data.map(this.mapDatabaseAppointmentToDomain) : [];

      return {
        appointments,
        total: count || 0,
        limit: options?.limit || 10,
        offset: options?.offset || 0
      };
    } catch (error) {
      console.error("AppointmentRepository.findByClinicId error:", error);
      return { appointments: [], total: 0 };
    }
  }

  async findWithFilter(filter: AppointmentFilter, options?: AppointmentQueryOptions): Promise<AppointmentSearchResult> {
    try {
      let query = this.supabase
        .from("appointments")
        .select("*", { count: "exact" });

      // Apply filters
      if (filter.clinicId) {
        query = query.eq("clinic_id", filter.clinicId);
      }

      if (filter.patientId) {
        query = query.eq("patient_id", filter.patientId);
      }

      if (filter.professionalId) {
        query = query.eq("professional_id", filter.professionalId);
      }

      if (filter.status) {
        query = query.eq("status", filter.status);
      }

      if (filter.serviceTypeId) {
        query = query.eq("service_type_id", filter.serviceTypeId);
      }

      // Apply date range filter
      if (filter.dateRange) {
        query = query
          .gte("start_time", filter.dateRange.start.toISOString())
          .lte("end_time", filter.dateRange.end.toISOString());
      }

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      // Apply sorting
      if (options?.sortBy) {
        const sortOrder = options.sortOrder === "desc" ? false : true;
        query = query.order(options.sortBy, { ascending: sortOrder });
      } else {
        query = query.order("start_time", { ascending: false });
      }

      const { data, error, count } = await query;

      if (error) {
        console.error("AppointmentRepository.findWithFilter error:", error);
        return { appointments: [], total: 0 };
      }

      const appointments = data ? data.map(this.mapDatabaseAppointmentToDomain) : [];

      return {
        appointments,
        total: count || 0,
        limit: options?.limit || 10,
        offset: options?.offset || 0
      };
    } catch (error) {
      console.error("AppointmentRepository.findWithFilter error:", error);
      return { appointments: [], total: 0 };
    }
  }

  async create(appointmentData: CreateAppointmentRequest): Promise<Appointment> {
    try {
      const dbAppointment = this.mapCreateRequestToDatabase(appointmentData);

      const { data, error } = await this.supabase
        .from("appointments")
        .insert(dbAppointment)
        .select()
        .single();

      if (error) {
        console.error("AppointmentRepository.create error:", error);
        throw new Error(`Failed to create appointment: ${error.message}`);
      }

      return this.mapDatabaseAppointmentToDomain(data);
    } catch (error) {
      console.error("AppointmentRepository.create error:", error);
      throw error;
    }
  }

  async update(id: string, appointmentData: UpdateAppointmentRequest): Promise<Appointment> {
    try {
      const updateData = this.mapUpdateRequestToDatabase(appointmentData);

      const { data, error } = await this.supabase
        .from("appointments")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("AppointmentRepository.update error:", error);
        throw new Error(`Failed to update appointment: ${error.message}`);
      }

      return this.mapDatabaseAppointmentToDomain(data);
    } catch (error) {
      console.error("AppointmentRepository.update error:", error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("appointments")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("AppointmentRepository.delete error:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("AppointmentRepository.delete error:", error);
      return false;
    }
  }

  async findByDateRange(startDate: Date, endDate: Date, clinicId?: string): Promise<Appointment[]> {
    try {
      let query = this.supabase
        .from("appointments")
        .select("*")
        .gte("start_time", startDate.toISOString())
        .lte("end_time", endDate.toISOString());

      if (clinicId) {
        query = query.eq("clinic_id", clinicId);
      }

      query = query.order("start_time", { ascending: true });

      const { data, error } = await query;

      if (error) {
        console.error("AppointmentRepository.findByDateRange error:", error);
        return [];
      }

      if (!data) return [];

      return data.map(this.mapDatabaseAppointmentToDomain);
    } catch (error) {
      console.error("AppointmentRepository.findByDateRange error:", error);
      return [];
    }
  }

  async count(filter: AppointmentFilter): Promise<number> {
    try {
      let query = this.supabase
        .from("appointments")
        .select("*", { count: "exact", head: true });

      if (filter.clinicId) {
        query = query.eq("clinic_id", filter.clinicId);
      }

      if (filter.patientId) {
        query = query.eq("patient_id", filter.patientId);
      }

      if (filter.professionalId) {
        query = query.eq("professional_id", filter.professionalId);
      }

      if (filter.status) {
        query = query.eq("status", filter.status);
      }

      if (filter.serviceTypeId) {
        query = query.eq("service_type_id", filter.serviceTypeId);
      }

      if (filter.dateRange) {
        query = query
          .gte("start_time", filter.dateRange.start.toISOString())
          .lte("end_time", filter.dateRange.end.toISOString());
      }

      const { count, error } = await query;

      if (error) {
        console.error("AppointmentRepository.count error:", error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error("AppointmentRepository.count error:", error);
      return 0;
    }
  }

  /**
   * Maps database appointment to domain appointment
   */
  private mapDatabaseAppointmentToDomain(dbAppointment: any): Appointment {
    return {
      id: dbAppointment.id,
      clinicId: dbAppointment.clinic_id,
      patientId: dbAppointment.patient_id,
      professionalId: dbAppointment.professional_id,
      serviceTypeId: dbAppointment.service_type_id,
      status: dbAppointment.status as AppointmentStatus,
      startTime: dbAppointment.start_time,
      endTime: dbAppointment.end_time,
      notes: dbAppointment.notes,
      internalNotes: dbAppointment.internal_notes,
      reminderSentAt: dbAppointment.reminder_sent_at,
      confirmationSentAt: dbAppointment.confirmation_sent_at,
      whatsappReminderSent: dbAppointment.whatsapp_reminder_sent,
      smsReminderSent: dbAppointment.sms_reminder_sent,
      roomId: dbAppointment.room_id,
      priority: dbAppointment.priority,
      createdAt: dbAppointment.created_at,
      updatedAt: dbAppointment.updated_at,
      createdBy: dbAppointment.created_by,
      updatedBy: dbAppointment.updated_by,
      cancelledAt: dbAppointment.cancelled_at,
      cancelledBy: dbAppointment.cancelled_by,
      cancellationReason: dbAppointment.cancellation_reason,
      title: dbAppointment.title,
      start: dbAppointment.start_time,
      end: dbAppointment.end_time,
      color: dbAppointment.color,
      description: dbAppointment.notes
    };
  }

  /**
   * Maps create request to database format
   */
  private mapCreateRequestToDatabase(_request: CreateAppointmentRequest): any {
    return {
      clinic_id: request.clinicId,
      patient_id: request.patientId,
      professional_id: request.professionalId,
      service_type_id: request.serviceTypeId,
      status: request.status || AppointmentStatus.SCHEDULED,
      start_time: request.startTime,
      end_time: request.endTime,
      notes: request.notes,
      internal_notes: request.internalNotes,
      room_id: request.roomId,
      priority: request.priority,
      created_by: request.createdBy,
      title: request.title,
      color: request.color
    };
  }

  /**
   * Maps update request to database format
   */
  private mapUpdateRequestToDatabase(_request: UpdateAppointmentRequest): any {
    const updateData: any = {};

    if (request.status !== undefined) updateData.status = request.status;
    if (request.startTime !== undefined) updateData.start_time = request.startTime;
    if (request.endTime !== undefined) updateData.end_time = request.endTime;
    if (request.notes !== undefined) updateData.notes = request.notes;
    if (request.internalNotes !== undefined) updateData.internal_notes = request.internalNotes;
    if (request.reminderSentAt !== undefined) updateData.reminder_sent_at = request.reminderSentAt;
    if (request.confirmationSentAt !== undefined) updateData.confirmation_sent_at = request.confirmationSentAt;
    if (request.whatsappReminderSent !== undefined) updateData.whatsapp_reminder_sent = request.whatsappReminderSent;
    if (request.smsReminderSent !== undefined) updateData.sms_reminder_sent = request.smsReminderSent;
    if (request.roomId !== undefined) updateData.room_id = request.roomId;
    if (request.priority !== undefined) updateData.priority = request.priority;
    if (request.cancelledAt !== undefined) updateData.cancelled_at = request.cancelledAt;
    if (request.cancelledBy !== undefined) updateData.cancelled_by = request.cancelledBy;
    if (request.cancellationReason !== undefined) updateData.cancellation_reason = request.cancellationReason;
    if (request.title !== undefined) updateData.title = request.title;
    if (request.color !== undefined) updateData.color = request.color;

    return updateData;
  }
}