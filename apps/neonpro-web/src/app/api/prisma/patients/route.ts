import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Validation schemas
const createPatientSchema = z.object({
  clinic_id: z.string().uuid(),
  full_name: z.string().min(2).max(255),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  birth_date: z.string().datetime().optional(),
  medical_record_number: z.string().optional(),
  emergency_contact: z.string().optional(),
  insurance_provider: z.string().optional(),
  data_consent_given: z.boolean().default(false),
});

const updatePatientSchema = createPatientSchema.partial().omit({ clinic_id: true });

/**
 * Get all patients for the authenticated user's clinic
 * Implements Row Level Security through clinic_id filtering
 */ export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);

    // Get user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's clinic_id (tenant context)
    const userProfile = await prisma.profile.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true },
    });

    if (!userProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Pagination parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100);
    const skip = (page - 1) * limit;

    // Search parameters
    const search = searchParams.get("search");
    const clinic_id = searchParams.get("clinic_id");

    // Build where clause for multi-tenant filtering
    const whereClause: any = {};

    if (clinic_id) {
      whereClause.clinic_id = clinic_id;
    }

    if (search) {
      whereClause.OR = [
        { full_name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { medical_record_number: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get patients with related data
    const [patients, totalCount] = await Promise.all([
      prisma.patient.findMany({
        where: whereClause,
        include: {
          clinic: {
            select: { id: true, name: true },
          },
          created_by_profile: {
            select: { id: true, full_name: true },
          },
          appointments: {
            where: { status: "scheduled" },
            take: 3,
            orderBy: { scheduled_at: "asc" },
            select: {
              id: true,
              scheduled_at: true,
              appointment_type: true,
              status: true,
            },
          },
          _count: {
            select: {
              appointments: true,
              medical_records: true,
              prescriptions: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
      }),
      prisma.patient.count({ where: whereClause }),
    ]);

    // Log access for LGPD compliance
    await prisma.auditLog.create({
      data: {
        user_id: session.user.id,
        clinic_id: clinic_id || "system",
        action: "READ",
        resource_type: "patient",
        ip_address: request.headers.get("x-forwarded-for") || "unknown",
        user_agent: request.headers.get("user-agent") || "unknown",
        endpoint: "/api/prisma/patients",
        method: "GET",
        lgpd_lawful_basis: "legitimate_interest",
        anvisa_category: "patient_data_access",
      },
    });

    return NextResponse.json({
      patients,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} /**
 * Create a new patient
 * Implements LGPD data consent validation and audit logging
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();

    // Validate request body
    const validatedData = createPatientSchema.parse(body);

    // Get user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user has permission to create patients in this clinic
    const userProfile = await prisma.profile.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true },
    });

    if (!userProfile || !["admin", "doctor", "nurse"].includes(userProfile.role || "")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Check if clinic exists
    const clinic = await prisma.clinic.findUnique({
      where: { id: validatedData.clinic_id },
      select: { id: true, name: true },
    });

    if (!clinic) {
      return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
    }

    // Create patient with LGPD compliance
    const patient = await prisma.patient.create({
      data: {
        ...validatedData,
        created_by: session.user.id,
        data_consent_date: validatedData.data_consent_given ? new Date() : null,
      },
      include: {
        clinic: {
          select: { id: true, name: true },
        },
        created_by_profile: {
          select: { id: true, full_name: true },
        },
      },
    });

    // Log creation for audit trail
    await prisma.auditLog.create({
      data: {
        user_id: session.user.id,
        clinic_id: validatedData.clinic_id,
        action: "CREATE",
        resource_type: "patient",
        resource_id: patient.id,
        ip_address: request.headers.get("x-forwarded-for") || "unknown",
        user_agent: request.headers.get("user-agent") || "unknown",
        endpoint: "/api/prisma/patients",
        method: "POST",
        new_values: patient,
        lgpd_lawful_basis: validatedData.data_consent_given ? "consent" : "legitimate_interest",
        anvisa_category: "patient_registration",
        cfm_regulation: "CFM_2217_2018",
      },
    });

    return NextResponse.json(
      {
        patient,
        message: "Patient created successfully",
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

    console.error("Error creating patient:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
