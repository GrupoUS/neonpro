import { Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";
import {
  AppointmentListResponseSchema,
  type AppointmentQuery,
  AppointmentQuerySchema,
  AppointmentResponseSchema,
  type CancelAppointment,
  CancelAppointmentSchema,
  type ConfirmAppointment,
  ConfirmAppointmentSchema,
  type CreateAppointment,
  CreateAppointmentSchema,
  ProviderAvailabilitySchema,
  RescheduleAppointment,
  RescheduleAppointmentSchema,
  ScheduleAppointment,
  ScheduleAppointmentSchema,
  UpdateAppointment,
  UpdateAppointmentSchema,
} from "../schemas/appointment";

const appointmentsRoutes: FastifyPluginAsync = async (fastify) => {
  // List appointments with filtering and pagination
  fastify.get(
    "/",
    {
      preHandler: [
        fastify.authenticate,
        fastify.requireRole(["doctor", "nurse", "admin", "receptionist"]),
      ],
      schema: {
        description: "List appointments with filtering, pagination, and summary",
        tags: ["appointments"],
        security: [{ bearerAuth: [] }],
        headers: Type.Object({
          "x-tenant-id": Type.String({ format: "uuid" }),
          authorization: Type.String(),
        }),
        querystring: AppointmentQuerySchema,
        response: {
          200: AppointmentListResponseSchema,
          401: Type.Object({ error: Type.String() }),
          403: Type.Object({ error: Type.String() }),
        },
      },
    },
    async (request, reply) => {
      const query = request.query as AppointmentQuery;
      const {
        page = 1,
        limit = 20,
        patientId,
        providerId,
        status,
        appointmentType,
        priority,
        startDate,
        endDate,
        isTelemedicine,
        sortBy = "appointmentDate",
        sortOrder = "asc",
      } = query;

      try {
        // Build Supabase query with RLS automatic tenant filtering
        let supabaseQuery = request.supabaseClient
          .from("appointments")
          .select(
            `
          *,
          patients!inner(id, name, email, phone, medical_record_number),
          providers!inner(id, name, specialization, license_number)
        `,
            { count: "exact" },
          )
          .eq("tenant_id", request.tenantId);

        // Apply filters
        if (patientId) {
          supabaseQuery = supabaseQuery.eq("patient_id", patientId);
        }

        if (providerId) {
          supabaseQuery = supabaseQuery.eq("provider_id", providerId);
        }

        if (status) {
          supabaseQuery = supabaseQuery.eq("status", status);
        }

        if (appointmentType) {
          supabaseQuery = supabaseQuery.eq("appointment_type", appointmentType);
        }

        if (priority) {
          supabaseQuery = supabaseQuery.eq("priority", priority);
        }

        if (startDate) {
          supabaseQuery = supabaseQuery.gte("appointment_date", `${startDate}T00:00:00`);
        }

        if (endDate) {
          supabaseQuery = supabaseQuery.lte("appointment_date", `${endDate}T23:59:59`);
        }

        if (typeof isTelemedicine === "boolean") {
          supabaseQuery = supabaseQuery.eq("is_telemedicine", isTelemedicine);
        }

        // Apply sorting
        supabaseQuery = supabaseQuery.order(sortBy, { ascending: sortOrder === "asc" });

        // Apply pagination
        const offset = (page - 1) * limit;
        supabaseQuery = supabaseQuery.range(offset, offset + limit - 1);

        const { data: appointments, error, count } = await supabaseQuery;

        if (error) {
          fastify.log.error({ error, tenantId: request.tenantId }, "Failed to fetch appointments");
          throw new Error("Failed to fetch appointments");
        }

        // Get summary statistics
        const { data: summaryData } = await request.supabaseClient
          .from("appointments")
          .select("status, appointment_date, created_at")
          .eq("tenant_id", request.tenantId)
          .gte("appointment_date", new Date().toISOString().split("T")[0]);

        const summary = calculateAppointmentSummary(summaryData || []);

        // Calculate pagination metadata
        const total = count || 0;
        const totalPages = Math.ceil(total / limit);

        const response = {
          appointments:
            appointments?.map((apt) => ({
              ...apt,
              patient: apt.patients,
              provider: apt.providers,
            })) || [],
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
          summary,
        };

        // Audit log for healthcare compliance
        request.auditLog("appointments_listed", {
          count: appointments?.length || 0,
          filters: { patientId, providerId, status, startDate, endDate },
          pagination: { page, limit },
        });

        return response;
      } catch (error) {
        fastify.log.error({ error, tenantId: request.tenantId }, "Error listing appointments");
        throw new Error(error instanceof Error ? error.message : "Failed to list appointments");
      }
    },
  ); // Get single appointment by ID
  fastify.get(
    "/:id",
    {
      preHandler: [
        fastify.authenticate,
        fastify.requireRole(["doctor", "nurse", "admin", "receptionist", "patient"]),
      ],
      schema: {
        description: "Get appointment by ID with related data",
        tags: ["appointments"],
        security: [{ bearerAuth: [] }],
        headers: Type.Object({
          "x-tenant-id": Type.String({ format: "uuid" }),
          authorization: Type.String(),
        }),
        params: Type.Object({
          id: Type.String({ format: "uuid" }),
        }),
        response: {
          200: AppointmentResponseSchema,
          404: Type.Object({ error: Type.String() }),
          401: Type.Object({ error: Type.String() }),
          403: Type.Object({ error: Type.String() }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      try {
        const { data: appointment, error } = await request.supabaseClient
          .from("appointments")
          .select(`
          *,
          patients!inner(id, name, email, phone, medical_record_number),
          providers!inner(id, name, specialization, license_number)
        `)
          .eq("id", id)
          .eq("tenant_id", request.tenantId)
          .single();

        if (error || !appointment) {
          reply.code(404);
          return { error: "Appointment not found" };
        }

        // For patient role, ensure they can only view their own appointments
        if (request.user.role === "patient" && appointment.patient_id !== request.user.id) {
          reply.code(403);
          return { error: "Access denied - can only view own appointments" };
        }

        // Format response with related data
        const formattedAppointment = {
          ...appointment,
          patient: appointment.patients,
          provider: appointment.providers,
        };

        // Audit log for healthcare compliance
        request.auditLog("appointment_viewed", {
          appointmentId: id,
          patientId: appointment.patient_id,
          providerId: appointment.provider_id,
          appointmentDate: appointment.appointment_date,
        });

        return formattedAppointment;
      } catch (error) {
        fastify.log.error(
          { error, appointmentId: id, tenantId: request.tenantId },
          "Error fetching appointment",
        );
        throw new Error("Failed to fetch appointment");
      }
    },
  ); // Create new appointment with scheduling validation
  fastify.post(
    "/",
    {
      preHandler: [
        fastify.authenticate,
        fastify.requireRole(["doctor", "nurse", "admin", "receptionist"]),
      ],
      schema: {
        description: "Create new appointment with conflict detection",
        tags: ["appointments"],
        security: [{ bearerAuth: [] }],
        headers: Type.Object({
          "x-tenant-id": Type.String({ format: "uuid" }),
          authorization: Type.String(),
        }),
        body: CreateAppointmentSchema,
        response: {
          201: AppointmentResponseSchema,
          400: Type.Object({
            error: Type.String(),
            details: Type.Optional(Type.Array(Type.String())),
            conflicts: Type.Optional(
              Type.Array(
                Type.Object({
                  appointmentId: Type.String({ format: "uuid" }),
                  appointmentDate: Type.String({ format: "date-time" }),
                  patientName: Type.String(),
                  type: Type.String(),
                }),
              ),
            ),
          }),
          401: Type.Object({ error: Type.String() }),
          403: Type.Object({ error: Type.String() }),
        },
      },
    },
    async (request, reply) => {
      const appointmentData = request.body as CreateAppointment;

      try {
        // Validate appointment date is in the future
        const appointmentDateTime = new Date(appointmentData.appointmentDate);
        if (appointmentDateTime <= new Date()) {
          reply.code(400);
          return { error: "Appointment must be scheduled for a future date and time" };
        }

        // Check for scheduling conflicts
        const conflicts = await checkSchedulingConflicts(
          request.supabaseClient,
          request.tenantId,
          appointmentData.providerId,
          appointmentData.patientId,
          appointmentData.appointmentDate,
          appointmentData.duration,
        );

        if (conflicts.length > 0) {
          reply.code(400);
          return {
            error: "Scheduling conflicts detected",
            conflicts,
          };
        }

        // Validate provider availability
        const isProviderAvailable = await checkProviderAvailability(
          request.supabaseClient,
          request.tenantId,
          appointmentData.providerId,
          appointmentData.appointmentDate,
          appointmentData.duration,
        );

        if (!isProviderAvailable) {
          reply.code(400);
          return { error: "Provider is not available at the requested time" };
        }

        // Prepare appointment data with system fields
        const newAppointment = {
          ...appointmentData,
          tenant_id: request.tenantId,
          status: "scheduled",
          created_by: request.user.id,
          appointment_date: appointmentData.appointmentDate,
          patient_id: appointmentData.patientId,
          provider_id: appointmentData.providerId,
          appointment_type: appointmentData.appointmentType,
          is_telemedicine: appointmentData.isTelemedicine || false,
          reminder_config: appointmentData.reminderConfig || {
            enabled: true,
            methods: ["email"],
            time_before_appointment: [1440, 60], // 24h and 1h before
          },
        };

        const { data: appointment, error } = await request.supabaseClient
          .from("appointments")
          .insert(newAppointment)
          .select(`
          *,
          patients!inner(id, name, email, phone, medical_record_number),
          providers!inner(id, name, specialization, license_number)
        `)
          .single();

        if (error) {
          fastify.log.error({ error, tenantId: request.tenantId }, "Failed to create appointment");
          throw new Error(`Failed to create appointment: ${error.message}`);
        }

        // Format response
        const formattedAppointment = {
          ...appointment,
          patient: appointment.patients,
          provider: appointment.providers,
        };

        // Audit log for healthcare compliance
        request.auditLog("appointment_created", {
          appointmentId: appointment.id,
          patientId: appointment.patient_id,
          providerId: appointment.provider_id,
          appointmentDate: appointment.appointment_date,
          appointmentType: appointment.appointment_type,
        });

        // TODO: Schedule appointment reminders (integrate with notification service)

        reply.code(201);
        return formattedAppointment;
      } catch (error) {
        fastify.log.error({ error, tenantId: request.tenantId }, "Error creating appointment");
        throw new Error(error instanceof Error ? error.message : "Failed to create appointment");
      }
    },
  ); // Confirm appointment
  fastify.post(
    "/:id/confirm",
    {
      preHandler: [
        fastify.authenticate,
        fastify.requireRole(["doctor", "nurse", "admin", "receptionist"]),
      ],
      schema: {
        description: "Confirm a scheduled appointment",
        tags: ["appointments"],
        security: [{ bearerAuth: [] }],
        headers: Type.Object({
          "x-tenant-id": Type.String({ format: "uuid" }),
          authorization: Type.String(),
        }),
        params: Type.Object({
          id: Type.String({ format: "uuid" }),
        }),
        body: ConfirmAppointmentSchema,
        response: {
          200: AppointmentResponseSchema,
          404: Type.Object({ error: Type.String() }),
          400: Type.Object({ error: Type.String() }),
          401: Type.Object({ error: Type.String() }),
          403: Type.Object({ error: Type.String() }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const confirmationData = request.body as ConfirmAppointment;

      try {
        // First, verify appointment exists and is in schedulable state
        const { data: existingAppointment, error: fetchError } = await request.supabaseClient
          .from("appointments")
          .select("id, status, patient_id, provider_id, appointment_date")
          .eq("id", id)
          .eq("tenant_id", request.tenantId)
          .single();

        if (fetchError || !existingAppointment) {
          reply.code(404);
          return { error: "Appointment not found" };
        }

        if (existingAppointment.status !== "scheduled") {
          reply.code(400);
          return { error: `Cannot confirm appointment with status: ${existingAppointment.status}` };
        }

        // Update appointment status to confirmed
        const confirmationUpdate = {
          status: "confirmed",
          confirmed_at: new Date().toISOString(),
          confirmed_by: request.user.id,
          confirmation_method: confirmationData.confirmationMethod,
          confirmation_notes: confirmationData.confirmationNotes,
          reminder_config: confirmationData.reminderPreferences || {
            enabled: true,
            methods: ["email", "sms"],
            time_before_appointment: [1440, 60], // 24h and 1h before
          },
          updated_at: new Date().toISOString(),
        };

        const { data: confirmedAppointment, error } = await request.supabaseClient
          .from("appointments")
          .update(confirmationUpdate)
          .eq("id", id)
          .eq("tenant_id", request.tenantId)
          .select(`
          *,
          patients!inner(id, name, email, phone, medical_record_number),
          providers!inner(id, name, specialization, license_number)
        `)
          .single();

        if (error) {
          fastify.log.error(
            { error, appointmentId: id, tenantId: request.tenantId },
            "Failed to confirm appointment",
          );
          throw new Error(`Failed to confirm appointment: ${error.message}`);
        }

        // Format response
        const formattedAppointment = {
          ...confirmedAppointment,
          patient: confirmedAppointment.patients,
          provider: confirmedAppointment.providers,
        };

        // Audit log for healthcare compliance
        request.auditLog("appointment_confirmed", {
          appointmentId: id,
          patientId: existingAppointment.patient_id,
          providerId: existingAppointment.provider_id,
          confirmationMethod: confirmationData.confirmationMethod,
          confirmedBy: request.user.id,
        });

        // TODO: Send confirmation notification to patient

        return formattedAppointment;
      } catch (error) {
        fastify.log.error(
          { error, appointmentId: id, tenantId: request.tenantId },
          "Error confirming appointment",
        );
        throw new Error(error instanceof Error ? error.message : "Failed to confirm appointment");
      }
    },
  ); // Cancel appointment
  fastify.post(
    "/:id/cancel",
    {
      preHandler: [
        fastify.authenticate,
        fastify.requireRole(["doctor", "nurse", "admin", "receptionist", "patient"]),
      ],
      schema: {
        description: "Cancel an appointment with reason and optional reschedule",
        tags: ["appointments"],
        security: [{ bearerAuth: [] }],
        headers: Type.Object({
          "x-tenant-id": Type.String({ format: "uuid" }),
          authorization: Type.String(),
        }),
        params: Type.Object({
          id: Type.String({ format: "uuid" }),
        }),
        body: CancelAppointmentSchema,
        response: {
          200: Type.Object({
            message: Type.String(),
            appointmentId: Type.String({ format: "uuid" }),
            cancelledAt: Type.String({ format: "date-time" }),
            refundEligible: Type.Boolean(),
            rescheduleOptions: Type.Optional(
              Type.Array(
                Type.Object({
                  date: Type.String({ format: "date" }),
                  startTime: Type.String({ format: "time" }),
                  providerId: Type.String({ format: "uuid" }),
                  providerName: Type.String(),
                }),
              ),
            ),
          }),
          404: Type.Object({ error: Type.String() }),
          400: Type.Object({ error: Type.String() }),
          401: Type.Object({ error: Type.String() }),
          403: Type.Object({ error: Type.String() }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const cancellationData = request.body as CancelAppointment;

      try {
        // First, verify appointment exists and can be cancelled
        const { data: existingAppointment, error: fetchError } = await request.supabaseClient
          .from("appointments")
          .select(`
          id, status, patient_id, provider_id, appointment_date, appointment_type,
          patients!inner(name),
          providers!inner(name)
        `)
          .eq("id", id)
          .eq("tenant_id", request.tenantId)
          .single();

        if (fetchError || !existingAppointment) {
          reply.code(404);
          return { error: "Appointment not found" };
        }

        // For patient role, ensure they can only cancel their own appointments
        if (request.user.role === "patient" && existingAppointment.patient_id !== request.user.id) {
          reply.code(403);
          return { error: "Access denied - can only cancel own appointments" };
        }

        if (["cancelled", "completed", "no_show"].includes(existingAppointment.status)) {
          reply.code(400);
          return { error: `Cannot cancel appointment with status: ${existingAppointment.status}` };
        }

        // Calculate refund eligibility (24+ hours before appointment)
        const appointmentTime = new Date(existingAppointment.appointment_date);
        const now = new Date();
        const hoursUntilAppointment =
          (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        const refundEligible = hoursUntilAppointment >= 24;

        // Update appointment status to cancelled
        const cancellationUpdate = {
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          cancelled_by: request.user.id,
          cancellation_reason: cancellationData.reason,
          cancellation_notes: cancellationData.notes,
          refund_requested: cancellationData.refundRequested && refundEligible,
          reschedule_requested: cancellationData.rescheduleRequested,
          updated_at: new Date().toISOString(),
        };

        const { error } = await request.supabaseClient
          .from("appointments")
          .update(cancellationUpdate)
          .eq("id", id)
          .eq("tenant_id", request.tenantId);

        if (error) {
          fastify.log.error(
            { error, appointmentId: id, tenantId: request.tenantId },
            "Failed to cancel appointment",
          );
          throw new Error(`Failed to cancel appointment: ${error.message}`);
        }

        // Get reschedule options if requested
        let rescheduleOptions;
        if (cancellationData.rescheduleRequested) {
          rescheduleOptions = await findAlternativeAppointmentSlots(
            request.supabaseClient,
            request.tenantId,
            existingAppointment.provider_id,
            new Date(),
            3, // Get 3 alternative options
          );
        }

        const response = {
          message: "Appointment cancelled successfully",
          appointmentId: id,
          cancelledAt: cancellationUpdate.cancelled_at,
          refundEligible,
          rescheduleOptions,
        };

        // Audit log for healthcare compliance
        request.auditLog("appointment_cancelled", {
          appointmentId: id,
          patientId: existingAppointment.patient_id,
          providerId: existingAppointment.provider_id,
          patientName: existingAppointment.patients?.name,
          providerName: existingAppointment.providers?.name,
          reason: cancellationData.reason,
          refundEligible,
          cancelledBy: request.user.id,
        });

        // TODO: Send cancellation notification to relevant parties
        // TODO: Process refund if eligible and requested

        return response;
      } catch (error) {
        fastify.log.error(
          { error, appointmentId: id, tenantId: request.tenantId },
          "Error cancelling appointment",
        );
        throw new Error(error instanceof Error ? error.message : "Failed to cancel appointment");
      }
    },
  );
}; // Utility functions for appointment scheduling

/**
 * Calculate appointment summary statistics
 */
function calculateAppointmentSummary(appointments: any[]): any {
  const today = new Date().toISOString().split("T")[0];
  const now = new Date();

  return {
    totalScheduled: appointments.filter((apt) => apt.status === "scheduled").length,
    totalConfirmed: appointments.filter((apt) => apt.status === "confirmed").length,
    totalCompleted: appointments.filter((apt) => apt.status === "completed").length,
    totalCancelled: appointments.filter((apt) => apt.status === "cancelled").length,
    upcomingToday: appointments.filter(
      (apt) =>
        apt.appointment_date.startsWith(today) &&
        new Date(apt.appointment_date) > now &&
        ["scheduled", "confirmed"].includes(apt.status),
    ).length,
    overdue: appointments.filter(
      (apt) =>
        new Date(apt.appointment_date) < now && ["scheduled", "confirmed"].includes(apt.status),
    ).length,
  };
}

/**
 * Check for scheduling conflicts
 */
async function checkSchedulingConflicts(
  supabaseClient: any,
  tenantId: string,
  providerId: string,
  patientId: string,
  appointmentDate: string,
  duration: number,
): Promise<any[]> {
  const startTime = new Date(appointmentDate);
  const endTime = new Date(startTime.getTime() + duration * 60000); // duration in minutes

  // Check provider conflicts
  const { data: providerConflicts } = await supabaseClient
    .from("appointments")
    .select("id, appointment_date, duration, patients!inner(name)")
    .eq("tenant_id", tenantId)
    .eq("provider_id", providerId)
    .in("status", ["scheduled", "confirmed", "in_progress"])
    .gte("appointment_date", startTime.toISOString())
    .lt("appointment_date", endTime.toISOString());

  // Check patient conflicts (same patient cannot have overlapping appointments)
  const { data: patientConflicts } = await supabaseClient
    .from("appointments")
    .select("id, appointment_date, duration, appointment_type")
    .eq("tenant_id", tenantId)
    .eq("patient_id", patientId)
    .in("status", ["scheduled", "confirmed", "in_progress"])
    .gte("appointment_date", startTime.toISOString())
    .lt("appointment_date", endTime.toISOString());

  const conflicts = [];

  // Process provider conflicts
  if (providerConflicts) {
    for (const conflict of providerConflicts) {
      const conflictStart = new Date(conflict.appointment_date);
      const conflictEnd = new Date(conflictStart.getTime() + conflict.duration * 60000);

      // Check if appointments overlap
      if (startTime < conflictEnd && endTime > conflictStart) {
        conflicts.push({
          appointmentId: conflict.id,
          appointmentDate: conflict.appointment_date,
          patientName: conflict.patients?.name || "Unknown",
          type: "provider_conflict",
        });
      }
    }
  }

  // Process patient conflicts
  if (patientConflicts) {
    for (const conflict of patientConflicts) {
      const conflictStart = new Date(conflict.appointment_date);
      const conflictEnd = new Date(conflictStart.getTime() + conflict.duration * 60000);

      // Check if appointments overlap
      if (startTime < conflictEnd && endTime > conflictStart) {
        conflicts.push({
          appointmentId: conflict.id,
          appointmentDate: conflict.appointment_date,
          patientName: "Same Patient",
          type: "patient_conflict",
        });
      }
    }
  }

  return conflicts;
}

/**
 * Check provider availability
 */
async function checkProviderAvailability(
  supabaseClient: any,
  tenantId: string,
  providerId: string,
  appointmentDate: string,
  duration: number,
): Promise<boolean> {
  const appointmentDateTime = new Date(appointmentDate);
  const dayOfWeek = appointmentDateTime.getDay(); // 0 = Sunday, 6 = Saturday
  const appointmentTime = appointmentDateTime.toTimeString().slice(0, 5); // HH:MM format

  // Check provider's working schedule
  const { data: schedule } = await supabaseClient
    .from("provider_schedules")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("provider_id", providerId)
    .eq("day_of_week", dayOfWeek)
    .eq("is_working_day", true)
    .single();

  if (!schedule) {
    return false; // Provider doesn't work on this day
  }

  // Check if appointment time is within working hours
  const workStart = schedule.start_time;
  const workEnd = schedule.end_time;
  const breakStart = schedule.break_start_time;
  const breakEnd = schedule.break_end_time;

  if (appointmentTime < workStart || appointmentTime > workEnd) {
    return false; // Outside working hours
  }

  // Check if appointment overlaps with break time
  if (breakStart && breakEnd) {
    const appointmentEndTime = new Date(appointmentDateTime.getTime() + duration * 60000)
      .toTimeString()
      .slice(0, 5);

    if (!(appointmentTime >= breakEnd || appointmentEndTime <= breakStart)) {
      return false; // Overlaps with break time
    }
  }

  return true;
}

/**
 * Find alternative appointment slots
 */
async function findAlternativeAppointmentSlots(
  supabaseClient: any,
  tenantId: string,
  providerId: string,
  fromDate: Date,
  maxOptions: number = 3,
): Promise<any[]> {
  const alternatives = [];
  const searchDate = new Date(fromDate);

  // Search for the next 14 days
  for (let i = 0; i < 14 && alternatives.length < maxOptions; i++) {
    const currentDate = new Date(searchDate.getTime() + i * 24 * 60 * 60 * 1000);
    const dayOfWeek = currentDate.getDay();

    // Get provider's schedule for this day
    const { data: schedule } = await supabaseClient
      .from("provider_schedules")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("provider_id", providerId)
      .eq("day_of_week", dayOfWeek)
      .eq("is_working_day", true)
      .single();

    if (schedule) {
      // Get existing appointments for this day
      const startOfDay = new Date(currentDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(currentDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: existingAppointments } = await supabaseClient
        .from("appointments")
        .select("appointment_date, duration")
        .eq("tenant_id", tenantId)
        .eq("provider_id", providerId)
        .in("status", ["scheduled", "confirmed"])
        .gte("appointment_date", startOfDay.toISOString())
        .lte("appointment_date", endOfDay.toISOString());

      // Find available slots (simplified logic)
      const workStart = parseTime(schedule.start_time);
      const workEnd = parseTime(schedule.end_time);

      // Check for a 30-minute slot at the start of the day
      if (workStart && !hasConflictAtTime(existingAppointments, workStart, 30)) {
        alternatives.push({
          date: currentDate.toISOString().split("T")[0],
          startTime: schedule.start_time,
          providerId,
          providerName: "Provider", // This would be fetched from provider data
        });
      }
    }
  }

  return alternatives;
}

/**
 * Helper function to parse time string to Date object
 */
function parseTime(timeString: string): Date | null {
  if (!timeString) return null;
  const [hours, minutes] = timeString.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

/**
 * Helper function to check for appointment conflicts at a specific time
 */
function hasConflictAtTime(appointments: any[], slotStart: Date, duration: number): boolean {
  const slotEnd = new Date(slotStart.getTime() + duration * 60000);

  return appointments.some((apt) => {
    const aptStart = new Date(apt.appointment_date);
    const aptEnd = new Date(aptStart.getTime() + apt.duration * 60000);

    return slotStart < aptEnd && slotEnd > aptStart;
  });
}

export default appointmentsRoutes;
