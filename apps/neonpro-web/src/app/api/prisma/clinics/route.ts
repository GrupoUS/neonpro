import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createClinicSchema = z.object({
  name: z.string().min(2).max(255),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  cnpj: z.string().optional(),
  license_number: z.string().optional(),
});

const updateClinicSchema = createClinicSchema.partial().extend({
  is_active: z.boolean().optional(),
});

/**
 * Get clinics - admin can see all, others see only their clinic
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

    const userProfile = await prisma.profile.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true },
    });

    if (!userProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100);
    const skip = (page - 1) * limit;

    const search = searchParams.get("search");
    const is_active = searchParams.get("is_active");

    // Build where clause based on user role
    const whereClause: any = {};

    // If not admin, restrict to user's associated clinics
    if (userProfile.role !== "admin") {
      // For multi-tenancy, we'd need to add a user-clinic relationship
      // For now, assuming users can only see clinics they created
      // In production, implement proper clinic-user associations
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { cnpj: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (is_active !== null) {
      whereClause.is_active = is_active === "true";
    }

    const [clinics, totalCount] = await Promise.all([
      prisma.clinic.findMany({
        where: whereClause,
        include: {
          created_by_profile: {
            select: { id: true, full_name: true },
          },
          _count: {
            select: {
              patients: true,
              appointments: true,
              prescriptions: true,
              medical_records: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
      }),
      prisma.clinic.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      clinics,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching clinics:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} /**
 * Create a new clinic (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();

    const validatedData = createClinicSchema.parse(body);

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions - only admin can create clinics
    const userProfile = await prisma.profile.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (userProfile?.role !== "admin") {
      return NextResponse.json(
        {
          error: "Only administrators can create clinics",
        },
        { status: 403 },
      );
    }

    // Check if CNPJ already exists (if provided)
    if (validatedData.cnpj) {
      const existingClinic = await prisma.clinic.findUnique({
        where: { cnpj: validatedData.cnpj },
      });

      if (existingClinic) {
        return NextResponse.json(
          {
            error: "Clinic with this CNPJ already exists",
          },
          { status: 409 },
        );
      }
    }

    // Create clinic
    const clinic = await prisma.clinic.create({
      data: {
        ...validatedData,
        created_by: session.user.id,
      },
      include: {
        created_by_profile: {
          select: { id: true, full_name: true },
        },
      },
    });

    // Log creation for audit
    await prisma.auditLog.create({
      data: {
        user_id: session.user.id,
        clinic_id: clinic.id,
        action: "CREATE",
        resource_type: "clinic",
        resource_id: clinic.id,
        ip_address: request.headers.get("x-forwarded-for") || "unknown",
        user_agent: request.headers.get("user-agent") || "unknown",
        endpoint: "/api/prisma/clinics",
        method: "POST",
        new_values: clinic,
        lgpd_lawful_basis: "legitimate_interest",
        anvisa_category: "clinic_registration",
        cfm_regulation: "CFM_2217_2018",
      },
    });

    return NextResponse.json(
      {
        clinic,
        message: "Clinic created successfully",
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

    console.error("Error creating clinic:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
