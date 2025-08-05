import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createPrescriptionSchema = z.object({
  patient_id: z.string().uuid(),
  clinic_id: z.string().uuid(),
  appointment_id: z.string().uuid().optional(),
  prescriber_id: z.string().uuid(),
  medication_name: z.string().min(2).max(255),
  dosage: z.string().min(1).max(100),
  frequency: z.string().min(1).max(100),
  duration: z.string().min(1).max(100),
  quantity: z.string().min(1).max(100),
  instructions: z.string().optional(),
  warnings: z.string().optional(),
  contraindications: z.string().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  anvisa_code: z.string().optional(),
  controlled_substance: z.boolean().default(false),
  cfm_registration: z.string().optional(),
});

/**
 * Get prescriptions with filtering for ANVISA compliance
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

    // Parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const skip = (page - 1) * limit;

    const clinic_id = searchParams.get("clinic_id");
    const patient_id = searchParams.get("patient_id");
    const prescriber_id = searchParams.get("prescriber_id");
    const status = searchParams.get("status");
    const controlled_only = searchParams.get("controlled_only") === "true";

    // Build where clause
    const whereClause: any = {};
    if (clinic_id) whereClause.clinic_id = clinic_id;
    if (patient_id) whereClause.patient_id = patient_id;
    if (prescriber_id) whereClause.prescriber_id = prescriber_id;
    if (status) whereClause.status = status;
    if (controlled_only) whereClause.controlled_substance = true;

    const [prescriptions, totalCount] = await Promise.all([
      prisma.prescription.findMany({
        where: whereClause,
        include: {
          patient: {
            select: {
              id: true,
              full_name: true,
              medical_record_number: true,
              birth_date: true,
            },
          },
          prescriber: {
            select: {
              id: true,
              full_name: true,
              professional_title: true,
              medical_license: true,
            },
          },
          clinic: {
            select: { id: true, name: true, cnpj: true },
          },
          appointment: {
            select: {
              id: true,
              scheduled_at: true,
              appointment_type: true,
              diagnosis: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { prescribed_date: "desc" },
      }),
      prisma.prescription.count({ where: whereClause }),
    ]);

    // Log access for ANVISA audit
    await prisma.auditLog.create({
      data: {
        user_id: session.user.id,
        clinic_id: clinic_id || "system",
        action: "READ",
        resource_type: "prescription",
        ip_address: request.headers.get("x-forwarded-for") || "unknown",
        user_agent: request.headers.get("user-agent") || "unknown",
        endpoint: "/api/prisma/prescriptions",
        method: "GET",
        lgpd_lawful_basis: "legitimate_interest",
        anvisa_category: "prescription_access",
        cfm_regulation: "ANVISA_RDC_357_2020",
      },
    });

    return NextResponse.json({
      prescriptions,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} /**
 * Create new prescription with ANVISA compliance
 * Implements controlled substance validation and CFM requirements
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();

    const validatedData = createPrescriptionSchema.parse(body);

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate prescriber is a licensed medical professional
    const prescriber = await prisma.profile.findUnique({
      where: { id: validatedData.prescriber_id },
      select: {
        id: true,
        role: true,
        medical_license: true,
        professional_title: true,
      },
    });

    if (!prescriber || !["doctor"].includes(prescriber.role || "")) {
      return NextResponse.json(
        {
          error: "Only licensed doctors can prescribe medications",
        },
        { status: 403 },
      );
    }

    if (!prescriber.medical_license) {
      return NextResponse.json(
        {
          error: "Prescriber must have valid medical license",
        },
        { status: 403 },
      );
    }

    // Verify patient and clinic exist
    const [patient, clinic] = await Promise.all([
      prisma.patient.findUnique({ where: { id: validatedData.patient_id } }),
      prisma.clinic.findUnique({ where: { id: validatedData.clinic_id } }),
    ]);

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }
    if (!clinic) {
      return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
    }

    // Additional validation for controlled substances (ANVISA)
    if (validatedData.controlled_substance) {
      if (!validatedData.anvisa_code) {
        return NextResponse.json(
          {
            error: "ANVISA code required for controlled substances",
          },
          { status: 400 },
        );
      }

      if (!validatedData.cfm_registration) {
        return NextResponse.json(
          {
            error: "CFM registration required for controlled substances",
          },
          { status: 400 },
        );
      }
    }

    // Generate digital signature for prescription (CFM compliance)
    const digitalSignature = `${prescriber.medical_license}_${Date.now()}_${Math.random().toString(36)}`;

    // Create prescription
    const prescription = await prisma.prescription.create({
      data: {
        ...validatedData,
        digital_signature: digitalSignature,
        cfm_registration: validatedData.cfm_registration || prescriber.medical_license,
        created_by: session.user.id,
      },
      include: {
        patient: {
          select: { id: true, full_name: true, medical_record_number: true },
        },
        prescriber: {
          select: { id: true, full_name: true, professional_title: true, medical_license: true },
        },
        clinic: {
          select: { id: true, name: true, cnpj: true },
        },
        appointment: {
          select: { id: true, scheduled_at: true, diagnosis: true },
        },
      },
    });

    // Log creation for ANVISA audit trail
    await prisma.auditLog.create({
      data: {
        user_id: session.user.id,
        clinic_id: validatedData.clinic_id,
        action: "CREATE",
        resource_type: "prescription",
        resource_id: prescription.id,
        ip_address: request.headers.get("x-forwarded-for") || "unknown",
        user_agent: request.headers.get("user-agent") || "unknown",
        endpoint: "/api/prisma/prescriptions",
        method: "POST",
        new_values: prescription,
        lgpd_lawful_basis: "legitimate_interest",
        anvisa_category: validatedData.controlled_substance
          ? "controlled_substance_prescription"
          : "medication_prescription",
        cfm_regulation: "CFM_2217_2018_ANVISA_RDC_357_2020",
      },
    });

    return NextResponse.json(
      {
        prescription,
        message: "Prescription created successfully",
        compliance_note: validatedData.controlled_substance
          ? "Controlled substance prescription logged for ANVISA compliance"
          : "Standard prescription created",
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

    console.error("Error creating prescription:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
