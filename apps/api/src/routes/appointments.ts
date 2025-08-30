/**
 * Appointment Management API Routes for NeonPro Healthcare
 * Implements scheduling with conflict detection and clinic-level isolation
 * Healthcare compliance: LGPD + ANVISA + CFM + Multi-tenant security
 */

import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { getDatabase } from "../lib/database";
import type {
  AppointmentListParams,
  AuthenticatedUser,
  CreateAppointmentRequest,
} from "../types/api";
import { createErrorResponse, createPaginatedResponse, createSuccessResponse } from "../types/api";
import { HTTPException } from "hono/http-exception";
import { createClient } from "@supabase/supabase-js";
import { HTTP_STATUS, RESPONSE_MESSAGES } from "../lib/constants";

const appointments = new Hono();

// Validation schemas
const createAppointmentSchema = z.object({
  patient_id: z.string().uuid("ID do paciente deve ser um UUID válido"),
  professional_id: z.string().uuid("ID do profissional deve ser um UUID válido"),
  scheduled_at: z.string().datetime("Data deve estar no formato ISO 8601"),
  duration_minutes: z.number().min(15, "Duração mínima é 15 minutos").max(
    480,
    "Duração máxima é 8 horas",
  ),
  appointment_type: z.string().min(1, "Tipo de consulta é obrigatório"),
  notes: z.string().optional(),
  priority: z.enum(["low", "normal", "high", "urgent"], {
    errorMap: () => ({ message: "Prioridade deve ser low, normal, high ou urgent" }),
  }),
});

const appointmentListSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  patient_id: z.string().uuid().optional(),
  professional_id: z.string().uuid().optional(),
  status: z.string().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  appointment_type: z.string().optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
});

// Helper functions
function isValidAppointmentTime(scheduledAt: string): boolean {
  const appointmentDate = new Date(scheduledAt);
  const now = new Date();

  // Cannot schedule appointments in the past
  if (appointmentDate <= now) {
    return false;
  }

  // Check business hours (8 AM to 6 PM, Monday to Friday)
  const hour = appointmentDate.getHours();
  const dayOfWeek = appointmentDate.getDay();

  if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
    return false;
  }

  if (hour < 8 || hour >= 18) {
    return false;
  }

  return true;
}

async function checkSchedulingConflicts(
  db: ReturnType<typeof getDatabase>,
  professionalId: string,
  scheduledAt: string,
  durationMinutes: number,
  excludeAppointmentId?: string,
): Promise<boolean> {
  const appointmentStart = new Date(scheduledAt);
  const appointmentEnd = new Date(appointmentStart.getTime() + durationMinutes * 60_000);

  let query = db
    .from("appointments")
    .select("id, scheduled_at, duration_minutes")
    .eq("professional_id", professionalId)
    .in("status", ["scheduled", "confirmed", "in_progress"])
    .gte("scheduled_at", appointmentStart.toISOString())
    .lt("scheduled_at", appointmentEnd.toISOString());

  if (excludeAppointmentId) {
    query = query.neq("id", excludeAppointmentId);
  }

  const { data: conflicts } = await query;

  if (!conflicts || conflicts.length === 0) {
    return false; // No conflicts
  }

  // Check for time overlaps
  for (const conflict of conflicts) {
    const conflictStart = new Date(conflict.scheduled_at);
    const conflictEnd = new Date(conflictStart.getTime() + conflict.duration_minutes * 60_000);

    // Check if appointments overlap
    if (
      (appointmentStart >= conflictStart && appointmentStart < conflictEnd)
      || (appointmentEnd > conflictStart && appointmentEnd <= conflictEnd)
      || (appointmentStart <= conflictStart && appointmentEnd >= conflictEnd)
    ) {
      return true; // Conflict found
    }
  }

  return false; // No conflicts
}

// Routes

/**
 * GET /appointments - List appointments with filtering and pagination
 */
appointments.get("/", zValidator("query", appointmentListSchema), async (c) => {
  try {
    const user = c.get("user") as AuthenticatedUser;
    const params = c.req.valid("query") as AppointmentListParams;

    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;

    const db = getDatabase();

    // Build query with filters
    let query = db
      .from("appointments")
      .select(
        `
        *,
        patient:patients(id, name, cpf, email, phone),
        professional:professionals(id, name, specialty, license_number)
      `,
        { count: "exact" },
      )
      .eq("clinic_id", user.clinic_id)
      .range(offset, offset + limit - 1)
      .order("scheduled_at", { ascending: true });

    // Apply filters
    if (params.patient_id) {
      query = query.eq("patient_id", params.patient_id);
    }

    if (params.professional_id) {
      query = query.eq("professional_id", params.professional_id);
    }

    if (params.status) {
      query = query.eq("status", params.status);
    }

    if (params.start_date) {
      query = query.gte("scheduled_at", `${params.start_date}T00:00:00Z`);
    }

    if (params.end_date) {
      query = query.lte("scheduled_at", `${params.end_date}T23:59:59Z`);
    }

    if (params.appointment_type) {
      query = query.eq("appointment_type", params.appointment_type);
    }

    if (params.priority) {
      query = query.eq("priority", params.priority);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching appointments:", error);
      return c.json(createErrorResponse("Erro ao buscar consultas"), 500);
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    const response = createPaginatedResponse(data || [], {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    });

    return c.json(response);
  } catch (error) {
    console.error("Unexpected error in GET /appointments:", error);
    return c.json(createErrorResponse("Erro interno do servidor"), 500);
  }
});

/**
 * POST /appointments - Create new appointment
 */
appointments.post("/", zValidator("json", createAppointmentSchema), async (c) => {
  try {
    const user = c.get("user") as AuthenticatedUser;
    const appointmentData = c.req.valid("json") as CreateAppointmentRequest;

    // Validate appointment time
    if (!isValidAppointmentTime(appointmentData.scheduled_at)) {
      return c.json(
        createErrorResponse(
          "Horário inválido. Consultas devem ser agendadas em horário comercial (8h-18h, segunda a sexta)",
        ),
        400,
      );
    }

    const db = getDatabase();

    // Verify patient belongs to clinic
    const { data: patient, error: patientError } = await db
      .from("patients")
      .select("id")
      .eq("id", appointmentData.patient_id)
      .eq("clinic_id", user.clinic_id)
      .single();

    if (patientError || !patient) {
      return c.json(createErrorResponse("Paciente não encontrado na clínica"), 404);
    }

    // Verify professional belongs to clinic
    const { data: professional, error: professionalError } = await db
      .from("professionals")
      .select("id")
      .eq("id", appointmentData.professional_id)
      .eq("clinic_id", user.clinic_id)
      .single();

    if (professionalError || !professional) {
      return c.json(createErrorResponse("Profissional não encontrado na clínica"), 404);
    }

    // Check for scheduling conflicts
    const hasConflict = await checkSchedulingConflicts(
      db,
      appointmentData.professional_id,
      appointmentData.scheduled_at,
      appointmentData.duration_minutes,
    );

    if (hasConflict) {
      return c.json(createErrorResponse("Conflito de horário detectado"), 409);
    }

    // Create appointment
    const { data, error } = await db
      .from("appointments")
      .insert({
        ...appointmentData,
        clinic_id: user.clinic_id,
        status: "scheduled",
        created_by: user.id,
      })
      .select(`
        *,
        patient:patients(id, name, cpf, email, phone),
        professional:professionals(id, name, specialty, license_number)

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Valid appointment statuses
const VALID_STATUSES = [
  'scheduled', 'confirmed', 'in_progress', 'completed', 
  'cancelled', 'no_show', 'rescheduled'
];

// Authentication middleware for all appointment routes
appointmentRoutes.use("*", async (c, next) => {
  const auth = c.req.header("Authorization");
  if (!auth?.startsWith("Bearer ")) {
    return c.json(
      { error: RESPONSE_MESSAGES.AUTH_REQUIRED },
      HTTP_STATUS.UNAUTHORIZED,
    );
  }
  await next();
});

// GET /appointments - List appointments with filtering and pagination
appointmentRoutes.get("/", async (c) => {
  try {
    const clinicId = c.req.query("clinic_id");
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "20");
    const status = c.req.query("status");
    const professionalId = c.req.query("professional_id");
    const patientId = c.req.query("patient_id");
    const startDate = c.req.query("start_date");
    const endDate = c.req.query("end_date");
    const roomId = c.req.query("room_id");

    if (!clinicId) {
      return c.json(
        { error: "clinic_id is required" },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    let query = supabase
      .from("appointments")
      .select(`
        id,
        clinic_id,
        patient_id,
        professional_id,
        service_type_id,
        status,
        start_time,
        end_time,
        notes,
        internal_notes,
        room_id,
        priority,
        reminder_sent_at,
        confirmation_sent_at,
        whatsapp_reminder_sent,
        sms_reminder_sent,
        created_at,
        updated_at,
        patients!inner(
          id,
          full_name,
          phone_primary,
          email
        ),
        professionals!inner(
          id,
          full_name,
          specialty
        )
      `)
      .eq("clinic_id", clinicId)
      .range((page - 1) * limit, page * limit - 1)
      .order("start_time", { ascending: true });

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }
    if (professionalId) {
      query = query.eq("professional_id", professionalId);
    }
    if (patientId) {
      query = query.eq("patient_id", patientId);
    }
    if (roomId) {
      query = query.eq("room_id", roomId);
    }
    if (startDate) {
      query = query.gte("start_time", startDate);
    }
    if (endDate) {
      query = query.lte("end_time", endDate);
    }

    const { data: appointments, error, count } = await query;

    if (error) {
      console.error("Database error:", error);
      return c.json(
        { error: "Failed to fetch appointments" },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    return c.json({
      appointments: appointments || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Appointments listing error:", error);
    return c.json(
      { error: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
});

// GET /appointments/:id - Get appointment by ID
appointmentRoutes.get("/:id", async (c) => {
  try {
    const appointmentId = c.req.param("id");
    const clinicId = c.req.query("clinic_id");

    if (!clinicId) {
      return c.json(
        { error: "clinic_id is required" },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const { data: appointment, error } = await supabase
      .from("appointments")
      .select(`
        *,
        patients!inner(
          id,
          full_name,
          phone_primary,
          email,
          birth_date,
          gender
        ),
        professionals!inner(
          id,
          full_name,
          specialty,
          phone,
          email
        ),
        service_types!inner(
          id,
          name,
          duration_minutes,
          price
        ),
        rooms(
          id,
          name,
          type
        )
      `)
      .eq("id", appointmentId)
      .eq("clinic_id", clinicId)
      .single();

    if (error || !appointment) {
      return c.json(
        { error: "Appointment not found" },
        HTTP_STATUS.NOT_FOUND,
      );
    }

    return c.json({ appointment });
  } catch (error) {
    console.error("Appointment fetch error:", error);
    return c.json(
      { error: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
});

// POST /appointments - Create new appointment
appointmentRoutes.post("/", async (c) => {
  try {
    const body = await c.req.json().catch(() => null);

    if (!body) {
      return c.json(
        { error: "Invalid JSON payload" },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate required fields
    const { 
      clinic_id,
      patient_id,
      professional_id,
      service_type_id,
      start_time,
      end_time
    } = body;

    if (!clinic_id || !patient_id || !professional_id || !service_type_id || !start_time || !end_time) {
      return c.json(
        { error: "Missing required fields: clinic_id, patient_id, professional_id, service_type_id, start_time, end_time" },
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
      );
    }

    // Validate dates
    const startDateTime = new Date(start_time);
    const endDateTime = new Date(end_time);
    const now = new Date();

    if (startDateTime <= now) {
      return c.json(
        { error: "Appointment start time must be in the future" },
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
      );
    }

    if (endDateTime <= startDateTime) {
      return c.json(
        { error: "End time must be after start time" },
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
      );
    }

    // Check for conflicts with existing appointments
    const { data: conflicts, error: conflictError } = await supabase
      .from("appointments")
      .select("id, start_time, end_time")
      .eq("clinic_id", clinic_id)
      .eq("professional_id", professional_id)
      .neq("status", "cancelled")
      .or(`and(start_time.lte.${start_time},end_time.gt.${start_time}),and(start_time.lt.${end_time},end_time.gte.${end_time}),and(start_time.gte.${start_time},end_time.lte.${end_time})`);

    if (conflictError) {
      console.error("Conflict check error:", conflictError);
      return c.json(
        { error: "Failed to check appointment conflicts" },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    if (conflicts && conflicts.length > 0) {
      return c.json(
        { 
          error: "Time slot conflict detected", 
          conflicts: conflicts.map(c => ({
            id: c.id,
            start_time: c.start_time,
            end_time: c.end_time
          }))
        },
        HTTP_STATUS.CONFLICT,
      );
    }

    // Validate that patient exists and is active
    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("id, is_active")
      .eq("id", patient_id)
      .eq("clinic_id", clinic_id)
      .single();

    if (patientError || !patient || !patient.is_active) {
      return c.json(
        { error: "Patient not found or inactive" },
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
      );
    }

    // Validate that professional exists and is active
    const { data: professional, error: professionalError } = await supabase
      .from("professionals")
      .select("id, is_active")
      .eq("id", professional_id)
      .eq("clinic_id", clinic_id)
      .single();

    if (professionalError || !professional || !professional.is_active) {
      return c.json(
        { error: "Professional not found or inactive" },
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
      );
    }

    const appointmentData = {
      clinic_id,
      patient_id,
      professional_id,
      service_type_id,
      status: body.status || "scheduled",
      start_time,
      end_time,
      notes: body.notes || null,
      internal_notes: body.internal_notes || null,
      room_id: body.room_id || null,
      priority: body.priority || 1,
      created_by: body.created_by || null
    };

    const { data: appointment, error } = await supabase
      .from("appointments")
      .insert([appointmentData])
      .select(`
        *,
        patients!inner(full_name, phone_primary, email),
        professionals!inner(full_name, specialty)
      `)
      .single();

    if (error) {
      console.error("Database error:", error);
      return c.json(
        { error: "Failed to create appointment" },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    return c.json({ 
      message: "Appointment created successfully", 
      appointment 
    }, HTTP_STATUS.CREATED);

  } catch (error) {
    console.error("Appointment creation error:", error);
    return c.json(
      { error: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
});

// PUT /appointments/:id - Update appointment
appointmentRoutes.put("/:id", async (c) => {
  try {
    const appointmentId = c.req.param("id");
    const body = await c.req.json().catch(() => null);

    if (!body) {
      return c.json(
        { error: "Invalid JSON payload" },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const { clinic_id } = body;

    if (!clinic_id) {
      return c.json(
        { error: "clinic_id is required" },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Check if appointment exists
    const { data: existingAppointment, error: fetchError } = await supabase
      .from("appointments")
      .select("*")
      .eq("id", appointmentId)
      .eq("clinic_id", clinic_id)
      .single();

    if (fetchError || !existingAppointment) {
      return c.json(
        { error: "Appointment not found" },
        HTTP_STATUS.NOT_FOUND,
      );
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
      updated_by: body.updated_by || null
    };

    // Allow updating specific fields
    const allowedFields = [
      'status', 'start_time', 'end_time', 'notes', 'internal_notes',
      'room_id', 'priority', 'professional_id', 'service_type_id'
    ];

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    // Validate status
    if (body.status && !VALID_STATUSES.includes(body.status)) {
      return c.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
      );
    }

    // If updating time, validate dates and conflicts
    if (body.start_time || body.end_time) {
      const newStartTime = body.start_time || existingAppointment.start_time;
      const newEndTime = body.end_time || existingAppointment.end_time;
      
      const startDateTime = new Date(newStartTime);
      const endDateTime = new Date(newEndTime);

      if (endDateTime <= startDateTime) {
        return c.json(
          { error: "End time must be after start time" },
          HTTP_STATUS.UNPROCESSABLE_ENTITY,
        );
      }

      // Check for conflicts (excluding current appointment)
      const professionalId = body.professional_id || existingAppointment.professional_id;
      
      const { data: conflicts, error: conflictError } = await supabase
        .from("appointments")
        .select("id, start_time, end_time")
        .eq("clinic_id", clinic_id)
        .eq("professional_id", professionalId)
        .neq("id", appointmentId)
        .neq("status", "cancelled")
        .or(`and(start_time.lte.${newStartTime},end_time.gt.${newStartTime}),and(start_time.lt.${newEndTime},end_time.gte.${newEndTime}),and(start_time.gte.${newStartTime},end_time.lte.${newEndTime})`);

      if (conflictError) {
        console.error("Conflict check error:", conflictError);
        return c.json(
          { error: "Failed to check appointment conflicts" },
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
        );
      }

      if (conflicts && conflicts.length > 0) {
        return c.json(
          { 
            error: "Time slot conflict detected", 
            conflicts: conflicts.map(c => ({
              id: c.id,
              start_time: c.start_time,
              end_time: c.end_time
            }))
          },
          HTTP_STATUS.CONFLICT,
        );
      }
    }

    const { data: appointment, error } = await supabase
      .from("appointments")
      .update(updateData)
      .eq("id", appointmentId)
      .eq("clinic_id", clinic_id)
      .select(`
        *,
        patients!inner(full_name, phone_primary, email),
        professionals!inner(full_name, specialty)

      `)
      .single();

    if (error) {
      console.error("Error creating appointment:", error);
      return c.json(createErrorResponse("Erro ao criar consulta"), 500);
    }

    return c.json(createSuccessResponse(data, "Consulta agendada com sucesso"), 201);
  } catch (error) {
    console.error("Unexpected error in POST /appointments:", error);
    return c.json(createErrorResponse("Erro interno do servidor"), 500);
  }
});

export default appointments;
=======
      console.error("Database error:", error);
      return c.json(
        { error: "Failed to update appointment" },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    return c.json({ 
      message: "Appointment updated successfully", 
      appointment 
    });

  } catch (error) {
    console.error("Appointment update error:", error);
    return c.json(
      { error: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
});

// DELETE /appointments/:id - Cancel appointment (soft delete)
appointmentRoutes.delete("/:id", async (c) => {
  try {
    const appointmentId = c.req.param("id");
    const clinicId = c.req.query("clinic_id");

    if (!clinicId) {
      return c.json(
        { error: "clinic_id is required" },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Check if appointment exists
    const { data: existingAppointment, error: fetchError } = await supabase
      .from("appointments")
      .select("id, status, start_time, patients!inner(full_name)")
      .eq("id", appointmentId)
      .eq("clinic_id", clinicId)
      .single();

    if (fetchError || !existingAppointment) {
      return c.json(
        { error: "Appointment not found" },
        HTTP_STATUS.NOT_FOUND,
      );
    }

    if (existingAppointment.status === "cancelled") {
      return c.json(
        { error: "Appointment is already cancelled" },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Cancel appointment instead of hard delete
    const { error } = await supabase
      .from("appointments")
      .update({ 
        status: "cancelled",
        updated_at: new Date().toISOString()
      })
      .eq("id", appointmentId)
      .eq("clinic_id", clinicId);

    if (error) {
      console.error("Database error:", error);
      return c.json(
        { error: "Failed to cancel appointment" },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    return c.json({ 
      message: "Appointment cancelled successfully",
      appointment_id: appointmentId,
      patient_name: existingAppointment.patients.full_name,
      start_time: existingAppointment.start_time
    });

  } catch (error) {
    console.error("Appointment deletion error:", error);
    return c.json(
      { error: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
});

// GET /appointments/availability - Check professional availability
appointmentRoutes.get("/availability", async (c) => {
  try {
    const clinicId = c.req.query("clinic_id");
    const professionalId = c.req.query("professional_id");
    const date = c.req.query("date");

    if (!clinicId || !professionalId || !date) {
      return c.json(
        { error: "clinic_id, professional_id, and date are required" },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const startOfDay = new Date(date + 'T00:00:00');
    const endOfDay = new Date(date + 'T23:59:59');

    const { data: appointments, error } = await supabase
      .from("appointments")
      .select("start_time, end_time")
      .eq("clinic_id", clinicId)
      .eq("professional_id", professionalId)
      .neq("status", "cancelled")
      .gte("start_time", startOfDay.toISOString())
      .lte("end_time", endOfDay.toISOString())
      .order("start_time");

    if (error) {
      console.error("Database error:", error);
      return c.json(
        { error: "Failed to fetch availability" },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    // Generate available slots (basic implementation - can be enhanced with business hours)
    const businessStart = 8; // 8 AM
    const businessEnd = 18; // 6 PM
    const slotDuration = 30; // 30 minutes
    
    const availableSlots = [];
    const bookedSlots = appointments || [];

    for (let hour = businessStart; hour < businessEnd; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const slotStart = new Date(date + `T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`);
        const slotEnd = new Date(slotStart.getTime() + slotDuration * 60000);

        // Check if slot conflicts with existing appointments
        const hasConflict = bookedSlots.some(appointment => {
          const appointmentStart = new Date(appointment.start_time);
          const appointmentEnd = new Date(appointment.end_time);
          
          return (slotStart < appointmentEnd && slotEnd > appointmentStart);
        });

        if (!hasConflict && slotStart > new Date()) {
          availableSlots.push({
            start_time: slotStart.toISOString(),
            end_time: slotEnd.toISOString()
          });
        }
      }
    }

    return c.json({
      date,
      professional_id: professionalId,
      available_slots: availableSlots,
      booked_slots: bookedSlots
    });

  } catch (error) {
    console.error("Availability check error:", error);
    return c.json(
      { error: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
});

// POST /appointments/:id/status - Update appointment status
appointmentRoutes.post("/:id/status", async (c) => {
  try {
    const appointmentId = c.req.param("id");
    const body = await c.req.json().catch(() => null);

    if (!body || !body.status) {
      return c.json(
        { error: "Status is required" },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const { status, clinic_id, updated_by } = body;

    if (!clinic_id) {
      return c.json(
        { error: "clinic_id is required" },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (!VALID_STATUSES.includes(status)) {
      return c.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
      );
    }

    const { data: appointment, error } = await supabase
      .from("appointments")
      .update({ 
        status,
        updated_at: new Date().toISOString(),
        updated_by
      })
      .eq("id", appointmentId)
      .eq("clinic_id", clinic_id)
      .select("id, status, start_time, patients!inner(full_name)")
      .single();

    if (error) {
      console.error("Database error:", error);
      return c.json(
        { error: "Failed to update appointment status" },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    return c.json({ 
      message: "Appointment status updated successfully", 
      appointment: {
        id: appointment.id,
        status: appointment.status,
        start_time: appointment.start_time,
        patient_name: appointment.patients.full_name
      }
    });

  } catch (error) {
    console.error("Appointment status update error:", error);
    return c.json(
      { error: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
});