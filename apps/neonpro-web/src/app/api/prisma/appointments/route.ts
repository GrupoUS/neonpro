import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createAppointmentSchema = z.object({
  clinic_id: z.string().uuid(),
  patient_id: z.string().uuid(),
  provider_id: z.string().uuid(),
  scheduled_at: z.string().datetime(),
  duration_minutes: z.number().min(15).max(480).default(30),
  appointment_type: z.string().min(2).max(100),
  chief_complaint: z.string().optional(),
  notes: z.string().optional(),
});

const updateAppointmentSchema = z.object({
  scheduled_at: z.string().datetime().optional(),
  duration_minutes: z.number().min(15).max(480).optional(),
  appointment_type: z.string().min(2).max(100).optional(),
  status: z.enum(["scheduled", "confirmed", "cancelled", "completed", "no_show"]).optional(),
  chief_complaint: z.string().optional(),
  notes: z.string().optional(),
  diagnosis: z.string().optional(),
  treatment_plan: z.string().optional(),
  cancellation_reason: z.string().optional(),
});

/**
 * Get appointments with filtering and pagination
 * Supports clinic-based multi-tenancy
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Pagination and filtering
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const skip = (page - 1) * limit;

    const clinic_id = searchParams.get("clinic_id");
    const provider_id = searchParams.get("provider_id");
    const patient_id = searchParams.get("patient_id");
    const status = searchParams.get("status");
    const date_from = searchParams.get("date_from");
    const date_to = searchParams.get("date_to");

    // Build where clause
    const whereClause: any = {};

    if (clinic_id) whereClause.clinic_id = clinic_id;
    if (provider_id) whereClause.provider_id = provider_id;
    if (patient_id) whereClause.patient_id = patient_id;
    if (status) whereClause.status = status;

    if (date_from || date_to) {
      whereClause.scheduled_at = {};
      if (date_from) whereClause.scheduled_at.gte = new Date(date_from);
      if (date_to) whereClause.scheduled_at.lte = new Date(date_to);
    }

    // Get appointments with related data
    const [appointments, totalCount] = await Promise.all([
      prisma.appointment.findMany({
        where: whereClause,
        include: {
          patient: {
            select: {
              id: true,
              full_name: true,
              email: true,
              phone: true,
              medical_record_number: true,
            },
          },
          provider: {
            select: {
              id: true,
              full_name: true,
              professional_title: true,
              medical_license: true,
            },
          },
          clinic: {
            select: { id: true, name: true, address: true },
          },
          medical_records: {
            select: { id: true, title: true, record_type: true },
          },
          prescriptions: {
            select: { id: true, medication_name: true, status: true },
          },
        },
        skip,
        take: limit,
        orderBy: { scheduled_at: "asc" },
      }),
      prisma.appointment.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      appointments,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} /**
 * Create a new appointment
 * Implements conflict checking and healthcare compliance
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();

    const validatedData = createAppointmentSchema.parse(body);

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if provider, patient, and clinic exist
    const [provider, patient, clinic] = await Promise.all([
      prisma.profile.findUnique({ where: { id: validatedData.provider_id } }),
      prisma.patient.findUnique({ where: { id: validatedData.patient_id } }),
      prisma.clinic.findUnique({ where: { id: validatedData.clinic_id } }),
    ]);

    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }
    if (!clinic) {
      return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
    }

    // Check for scheduling conflicts
    const scheduledAt = new Date(validatedData.scheduled_at);
    const endTime = new Date(scheduledAt.getTime() + validatedData.duration_minutes * 60000);

    const conflictingAppointments = await prisma.appointment.findMany({
      where: {
        provider_id: validatedData.provider_id,
        status: { in: ["scheduled", "confirmed"] },
        OR: [
          {
            AND: [
              { scheduled_at: { lte: scheduledAt } },
              {
                scheduled_at: {
                  gte: new Date(scheduledAt.getTime() - 30 * 60000), // 30 min buffer
                },
              },
            ],
          },
          {
            AND: [{ scheduled_at: { gte: scheduledAt } }, { scheduled_at: { lt: endTime } }],
          },
        ],
      },
    });

    if (conflictingAppointments.length > 0) {
      return NextResponse.json(
        {
          error: "Scheduling conflict detected",
          conflicts: conflictingAppointments,
        },
        { status: 409 },
      );
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        ...validatedData,
        created_by: session.user.id,
      },
      include: {
        patient: {
          select: { id: true, full_name: true, email: true, phone: true },
        },
        provider: {
          select: { id: true, full_name: true, professional_title: true },
        },
        clinic: {
          select: { id: true, name: true },
        },
      },
    });

    // Log creation for audit
    await prisma.auditLog.create({
      data: {
        user_id: session.user.id,
        clinic_id: validatedData.clinic_id,
        action: "CREATE",
        resource_type: "appointment",
        resource_id: appointment.id,
        ip_address: request.headers.get("x-forwarded-for") || "unknown",
        user_agent: request.headers.get("user-agent") || "unknown",
        endpoint: "/api/prisma/appointments",
        method: "POST",
        new_values: appointment,
        lgpd_lawful_basis: "legitimate_interest",
        anvisa_category: "appointment_scheduling",
        cfm_regulation: "CFM_2217_2018",
      },
    });

    return NextResponse.json(
      {
        appointment,
        message: "Appointment created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    console.error("Error creating appointment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
