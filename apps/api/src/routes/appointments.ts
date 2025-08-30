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
  const appointmentEnd = new Date(appointmentStart.getTime() + durationMinutes * 60000);

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
    const conflictEnd = new Date(conflictStart.getTime() + conflict.duration_minutes * 60000);

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
