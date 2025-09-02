/**
 * 👩‍⚕️ Professionals Routes - NeonPro API
 * ==========================================
 *
 * Rotas para gerenciamento de profissionais da clínica
 * com validação Zod e type-safety completo.
 */

import { zValidator } from "@hono/zod-validator";
import type { ApiResponse } from "@neonpro/shared/types";
import { Hono } from "hono";
import { z } from "zod";
import { HTTP_STATUS } from "../lib/constants.js";

// Zod schemas for professionals
const CreateProfessionalSchema = z.object({
  fullName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  profession: z.enum([
    "dermatologist",
    "esthetician",
    "therapist",
    "coordinator",
  ]),
  specialization: z.string().optional(),
  registrationNumber: z.string().optional(),
  isActive: z.boolean().default(true),
  workingHours: z
    .object({
      monday: z.array(z.string()).optional(),
      tuesday: z.array(z.string()).optional(),
      wednesday: z.array(z.string()).optional(),
      thursday: z.array(z.string()).optional(),
      friday: z.array(z.string()).optional(),
      saturday: z.array(z.string()).optional(),
      sunday: z.array(z.string()).optional(),
    })
    .optional(),
  permissions: z.array(z.string()).default([]),
});

const UpdateProfessionalSchema = CreateProfessionalSchema.partial();

const ProfessionalQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  profession: z
    .enum(["dermatologist", "esthetician", "therapist", "coordinator"])
    .optional(),
  isActive: z.coerce.boolean().optional(),
});

// Create professionals router
export const professionalsRoutes = new Hono()
  // Authentication middleware
  .use("*", async (c, next) => {
    const auth = c.req.header("Authorization");
    if (!auth?.startsWith("Bearer ")) {
      return c.json(
        { error: "UNAUTHORIZED", message: "Token de acesso obrigatório" },
        401,
      );
    }
    await next();
  })
  // 📋 List professionals
  .get("/", zValidator("query", ProfessionalQuerySchema), async (c) => {
    const { page, limit, search, profession, isActive } = c.req.valid("query");

    try {
      let query = supabase
        .from("professionals")
        .select(`
          id,
          full_name,
          email,
          phone,
          profession,
          specialization,
          registration_number,
          is_active,
          working_hours,
          permissions,
          created_at
        `);

      // Apply filters
      if (search) {
        query = query.ilike("full_name", `%${search}%`);
      }
      if (profession) {
        query = query.eq("profession", profession);
      }
      if (isActive !== undefined) {
        query = query.eq("is_active", isActive);
      }

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data: professionals, error, count } = await query;

      if (error) {
        return c.json<ApiResponse<null>>(
          {
            success: false,
            error: {
              code: "DATABASE_ERROR",
              message: "Erro ao buscar profissionais",
            },
          },
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
        );
      }

      // Transform data to match expected format
      const transformedProfessionals = professionals?.map(prof => ({
        id: prof.id,
        fullName: prof.full_name,
        email: prof.email,
        phone: prof.phone,
        profession: prof.profession,
        specialization: prof.specialization,
        registrationNumber: prof.registration_number,
        isActive: prof.is_active,
        workingHours: prof.working_hours,
        permissions: prof.permissions,
        createdAt: prof.created_at,
      })) || [];

      // Get total count for pagination
      const { count: totalCount } = await supabase
        .from("professionals")
        .select("*", { count: "exact", head: true })
        .eq("is_active", isActive ?? true);

      const total = totalCount || 0;

      return c.json<
        ApiResponse<{
          professionals: typeof transformedProfessionals;
          pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
          };
        }>
      >({
        success: true,
        data: {
          professionals: transformedProfessionals,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
        message: "Profissionais listados com sucesso",
      });
    } catch {
      return c.json(
        {
          success: false,
          error: "INTERNAL_ERROR",
          message: "Erro ao listar profissionais",
        },
        500,
      );
    }
  })
  // 👤 Get professional by ID
  .get("/:id", async (c) => {
    const id = c.req.param("id");

    try {
      const { data: professional, error } = await supabase
        .from("professionals")
        .select(`
          id,
          full_name,
          email,
          phone,
          profession,
          specialization,
          registration_number,
          is_active,
          working_hours,
          permissions,
          created_at,
          updated_at
        `)
        .eq("id", id)
        .eq("is_active", true)
        .single();

      if (error || !professional) {
        return c.json<ApiResponse<null>>({
          success: false,
          error: "NOT_FOUND",
          message: "Profissional não encontrado",
        }, HTTP_STATUS.NOT_FOUND);
      }

      // Transform database fields to API format
      const transformedProfessional = {
        id: professional.id,
        fullName: professional.full_name,
        email: professional.email,
        phone: professional.phone,
        profession: professional.profession,
        specialization: professional.specialization,
        registrationNumber: professional.registration_number,
        isActive: professional.is_active,
        workingHours: professional.working_hours,
        permissions: professional.permissions || [],
        createdAt: professional.created_at,
        updatedAt: professional.updated_at,
      };

      return c.json<ApiResponse<typeof transformedProfessional>>({
        success: true,
        data: transformedProfessional,
        message: "Profissional encontrado",
      }, HTTP_STATUS.OK);
    } catch {
      return c.json(
        {
          success: false,
          error: "NOT_FOUND",
          message: "Profissional não encontrado",
        },
        404,
      );
    }
  })
  // ✨ Create professional
  .post("/", zValidator("json", CreateProfessionalSchema), async (c) => {
    const professionalData = c.req.valid("json");

    try {
      const { data: professional, error } = await supabase
        .from("professionals")
        .insert({
          full_name: professionalData.fullName,
          email: professionalData.email,
          phone: professionalData.phone,
          profession: professionalData.profession,
          specialization: professionalData.specialization,
          registration_number: professionalData.registrationNumber,
          is_active: professionalData.isActive,
          working_hours: professionalData.workingHours,
          permissions: professionalData.permissions,
        })
        .select(`
          id,
          full_name,
          email,
          phone,
          profession,
          specialization,
          registration_number,
          is_active,
          working_hours,
          permissions,
          created_at,
          updated_at
        `)
        .single();

      if (error || !professional) {
        return c.json<ApiResponse<null>>({
          success: false,
          error: "CREATION_ERROR",
          message: "Erro ao criar profissional",
        }, HTTP_STATUS.BAD_REQUEST);
      }

      // Transform database fields to API format
      const transformedProfessional = {
        id: professional.id,
        fullName: professional.full_name,
        email: professional.email,
        phone: professional.phone,
        profession: professional.profession,
        specialization: professional.specialization,
        registrationNumber: professional.registration_number,
        isActive: professional.is_active,
        workingHours: professional.working_hours,
        permissions: professional.permissions || [],
        createdAt: professional.created_at,
        updatedAt: professional.updated_at,
      };

      return c.json<ApiResponse<typeof transformedProfessional>>({
        success: true,
        data: transformedProfessional,
        message: "Profissional criado com sucesso",
      }, HTTP_STATUS.CREATED);
    } catch {
      return c.json(
        {
          success: false,
          error: "VALIDATION_ERROR",
          message: "Erro ao criar profissional",
        },
        400,
      );
    }
  })
  // ✏️ Update professional
  .put("/:id", zValidator("json", UpdateProfessionalSchema), async (c) => {
    const id = c.req.param("id");
    const updateData = c.req.valid("json");

    try {
      // Build update object dynamically
      const updateFields: Record<string, unknown> = {};

      if (updateData.fullName !== undefined) updateFields.full_name = updateData.fullName;
      if (updateData.email !== undefined) updateFields.email = updateData.email;
      if (updateData.phone !== undefined) updateFields.phone = updateData.phone;
      if (updateData.profession !== undefined) updateFields.profession = updateData.profession;
      if (updateData.specialization !== undefined) {
        updateFields.specialization = updateData.specialization;
      }
      if (updateData.registrationNumber !== undefined) {
        updateFields.registration_number = updateData.registrationNumber;
      }
      if (updateData.isActive !== undefined) updateFields.is_active = updateData.isActive;
      if (updateData.workingHours !== undefined) {
        updateFields.working_hours = updateData.workingHours;
      }
      if (updateData.permissions !== undefined) updateFields.permissions = updateData.permissions;

      const { data: professional, error } = await supabase
        .from("professionals")
        .update(updateFields)
        .eq("id", id)
        .eq("is_active", true)
        .select(`
          id,
          full_name,
          email,
          phone,
          profession,
          specialization,
          registration_number,
          is_active,
          working_hours,
          permissions,
          created_at,
          updated_at
        `)
        .single();

      if (error || !professional) {
        return c.json<ApiResponse<null>>({
          success: false,
          error: "NOT_FOUND",
          message: "Profissional não encontrado",
        }, HTTP_STATUS.NOT_FOUND);
      }

      // Transform database fields to API format
      const transformedProfessional = {
        id: professional.id,
        fullName: professional.full_name,
        email: professional.email,
        phone: professional.phone,
        profession: professional.profession,
        specialization: professional.specialization,
        registrationNumber: professional.registration_number,
        isActive: professional.is_active,
        workingHours: professional.working_hours,
        permissions: professional.permissions || [],
        createdAt: professional.created_at,
        updatedAt: professional.updated_at,
      };

      return c.json<ApiResponse<typeof transformedProfessional>>({
        success: true,
        data: transformedProfessional,
        message: "Profissional atualizado com sucesso",
      }, HTTP_STATUS.OK);
    } catch {
      return c.json(
        {
          success: false,
          error: "NOT_FOUND",
          message: "Profissional não encontrado",
        },
        404,
      );
    }
  })
  // 🗑️ Delete professional (soft delete)
  .delete("/:id", async (c) => {
    const id = c.req.param("id");

    try {
      const { data: professional, error } = await supabase
        .from("professionals")
        .update({
          is_active: false,
          deleted_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("is_active", true)
        .select("id")
        .single();

      if (error || !professional) {
        return c.json<ApiResponse<null>>({
          success: false,
          error: "NOT_FOUND",
          message: "Profissional não encontrado",
        }, HTTP_STATUS.NOT_FOUND);
      }

      return c.json<ApiResponse<{ id: string; }>>({
        success: true,
        data: { id: professional.id },
        message: "Profissional removido com sucesso",
      }, HTTP_STATUS.OK);
    } catch {
      return c.json(
        {
          success: false,
          error: "NOT_FOUND",
          message: "Profissional não encontrado",
        },
        404,
      );
    }
  })
  // 📊 Get professional stats
  .get("/:id/stats", async (c) => {
    try {
      const id = c.req.param("id");

      // Verify professional exists and is active
      const { data: professional, error: professionalError } = await supabase
        .from("professionals")
        .select("id")
        .eq("id", id)
        .eq("is_active", true)
        .single();

      if (professionalError || !professional) {
        return c.json<ApiResponse<null>>({
          success: false,
          error: "NOT_FOUND",
          message: "Profissional não encontrado",
        }, HTTP_STATUS.NOT_FOUND);
      }

      // Get appointment statistics
      const { data: appointmentStats, error: statsError } = await supabase
        .from("appointments")
        .select("status, total_amount")
        .eq("professional_id", id);

      if (statsError) {
        throw new Error("Erro ao buscar estatísticas");
      }

      // Calculate statistics
      const totalAppointments = appointmentStats?.length || 0;
      const completedAppointments = appointmentStats?.filter(a => a.status === "completed").length
        || 0;
      const cancelledAppointments = appointmentStats?.filter(a => a.status === "cancelled").length
        || 0;
      const upcomingAppointments = appointmentStats?.filter(a => a.status === "scheduled").length
        || 0;

      // Calculate monthly revenue (completed appointments only)
      const monthlyRevenue = appointmentStats
        ?.filter(a => a.status === "completed")
        ?.reduce((sum, a) => sum + (a.total_amount || 0), 0) || 0;

      // Get unique patients count
      const { data: patientsData, error: patientsError } = await supabase
        .from("appointments")
        .select("patient_id")
        .eq("professional_id", id)
        .not("patient_id", "is", null);

      const totalPatients = patientsData
        ? new Set(patientsData.map(p => p.patient_id)).size
        : 0;

      // Get average rating (mock for now as ratings table structure is not defined)
      const averageRating = 4.8;

      const stats = {
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        totalPatients,
        averageRating,
        monthlyRevenue,
        upcomingAppointments,
      };

      return c.json<ApiResponse<typeof stats>>({
        success: true,
        data: stats,
        message: "Estatísticas do profissional",
      }, HTTP_STATUS.OK);
    } catch {
      return c.json(
        {
          success: false,
          error: "NOT_FOUND",
          message: "Estatísticas não encontradas",
        },
        404,
      );
    }
  })
  // 📅 Get professional availability
  .get("/:id/availability", async (c) => {
    const date = c.req.query("date"); // YYYY-MM-DD format

    try {
      // Get professional's working hours and existing appointments
      const targetDate = date || new Date().toISOString().split("T")[0];

      // First, verify professional exists and get working hours
      const { data: professional, error: professionalError } = await supabase
        .from("professionals")
        .select("id, working_hours")
        .eq("id", id)
        .eq("is_active", true)
        .single();

      if (professionalError || !professional) {
        return c.json(
          {
            success: false,
            error: "NOT_FOUND",
            message: "Profissional não encontrado",
          },
          404,
        );
      }

      // Get existing appointments for the date
      const { data: appointments, error: appointmentsError } = await supabase
        .from("appointments")
        .select("appointment_time, status")
        .eq("professional_id", id)
        .gte("appointment_time", `${targetDate}T00:00:00`)
        .lt("appointment_time", `${targetDate}T23:59:59`)
        .in("status", ["scheduled", "confirmed"]);

      if (appointmentsError) {
        console.error("Error fetching appointments:", appointmentsError);
        return c.json(
          {
            success: false,
            error: "INTERNAL_ERROR",
            message: "Erro ao buscar agendamentos",
          },
          500,
        );
      }

      // Generate time slots based on working hours (default 9-17 if not set)
      const workingHours = professional.working_hours || {
        monday: ["09:00", "17:00"],
        tuesday: ["09:00", "17:00"],
        wednesday: ["09:00", "17:00"],
        thursday: ["09:00", "17:00"],
        friday: ["09:00", "17:00"],
        saturday: ["09:00", "13:00"],
        sunday: [],
      };

      const dayOfWeek = new Date(targetDate).toLocaleDateString("en-US", { weekday: "lowercase" });
      const dayHours = workingHours[dayOfWeek as keyof typeof workingHours] || [];

      // Generate 30-minute slots
      const availableSlots: string[] = [];
      if (dayHours.length >= 2) {
        const startTime = dayHours[0];
        const endTime = dayHours[1];

        const start = new Date(`${targetDate}T${startTime}:00`);
        const end = new Date(`${targetDate}T${endTime}:00`);

        while (start < end) {
          availableSlots.push(start.toTimeString().slice(0, 5));
          start.setMinutes(start.getMinutes() + 30);
        }
      }

      // Get booked slots from appointments
      const bookedSlots = appointments?.map(apt => {
        const time = new Date(apt.appointment_time);
        return time.toTimeString().slice(0, 5);
      }) || [];

      // Filter out booked slots from available slots
      const finalAvailableSlots = availableSlots.filter(slot => !bookedSlots.includes(slot));

      const mockAvailability = {
        date: targetDate,
        availableSlots: finalAvailableSlots,
        bookedSlots,
      };

      const response: ApiResponse<typeof mockAvailability> = {
        success: true,
        data: mockAvailability,
        message: "Disponibilidade do profissional",
      };

      return c.json(response, HTTP_STATUS.OK);
    } catch {
      return c.json(
        {
          success: false,
          error: "NOT_FOUND",
          message: "Disponibilidade não encontrada",
        },
        404,
      );
    }
  });
