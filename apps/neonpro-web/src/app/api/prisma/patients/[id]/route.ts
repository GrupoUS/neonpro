import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const updatePatientSchema = z.object({
  full_name: z.string().min(2).max(255).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  birth_date: z.string().datetime().optional(),
  medical_record_number: z.string().optional(),
  emergency_contact: z.string().optional(),
  insurance_provider: z.string().optional(),
  data_consent_given: z.boolean().optional(),
});

/**
 * Get specific patient with comprehensive medical data
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { id: patientId } = await params;

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get patient with all related data
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        clinic: {
          select: { id: true, name: true, address: true, phone: true },
        },
        created_by_profile: {
          select: { id: true, full_name: true, professional_title: true },
        },
        appointments: {
          include: {
            provider: {
              select: { id: true, full_name: true, professional_title: true },
            },
            prescriptions: {
              select: { id: true, medication_name: true, status: true },
            },
          },
          orderBy: { scheduled_at: "desc" },
          take: 10,
        },
        medical_records: {
          include: {
            provider: {
              select: { id: true, full_name: true, professional_title: true },
            },
            appointment: {
              select: { id: true, scheduled_at: true, appointment_type: true },
            },
          },
          orderBy: { record_date: "desc" },
          take: 20,
        },
        prescriptions: {
          include: {
            prescriber: {
              select: { id: true, full_name: true, professional_title: true },
            },
            appointment: {
              select: { id: true, scheduled_at: true },
            },
          },
          orderBy: { prescribed_date: "desc" },
          take: 15,
        },
        _count: {
          select: {
            appointments: true,
            medical_records: true,
            prescriptions: true,
          },
        },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Log access for LGPD compliance
    await prisma.auditLog.create({
      data: {
        user_id: session.user.id,
        clinic_id: patient.clinic_id,
        action: "READ",
        resource_type: "patient",
        resource_id: patient.id,
        ip_address: request.headers.get("x-forwarded-for") || "unknown",
        user_agent: request.headers.get("user-agent") || "unknown",
        endpoint: `/api/prisma/patients/${patientId}`,
        method: "GET",
        lgpd_lawful_basis: "legitimate_interest",
        anvisa_category: "patient_data_access",
      },
    });

    return NextResponse.json({ patient });
  } catch (error) {
    console.error("Error fetching patient:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} /**
 * Update patient information
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { id: patientId } = await params;
    const body = await request.json();

    const validatedData = updatePatientSchema.parse(body);

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get existing patient to log changes
    const existingPatient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!existingPatient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Update patient
    const updatedPatient = await prisma.patient.update({
      where: { id: patientId },
      data: {
        ...validatedData,
        updated_by: session.user.id,
        data_consent_date:
          validatedData.data_consent_given === true
            ? new Date()
            : validatedData.data_consent_given === false
              ? null
              : undefined,
      },
      include: {
        clinic: { select: { id: true, name: true } },
        created_by_profile: { select: { id: true, full_name: true } },
      },
    });

    // Log update for audit trail
    await prisma.auditLog.create({
      data: {
        user_id: session.user.id,
        clinic_id: existingPatient.clinic_id,
        action: "UPDATE",
        resource_type: "patient",
        resource_id: patientId,
        ip_address: request.headers.get("x-forwarded-for") || "unknown",
        user_agent: request.headers.get("user-agent") || "unknown",
        endpoint: `/api/prisma/patients/${patientId}`,
        method: "PUT",
        old_values: existingPatient,
        new_values: updatedPatient,
        lgpd_lawful_basis: validatedData.data_consent_given ? "consent" : "legitimate_interest",
        anvisa_category: "patient_data_modification",
      },
    });

    return NextResponse.json({
      patient: updatedPatient,
      message: "Patient updated successfully",
    });
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

    console.error("Error updating patient:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} /**
 * Delete patient (LGPD Right to be Forgotten)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { id: patientId } = await params;

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions - only admin can delete patients
    const userProfile = await prisma.profile.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (userProfile?.role !== "admin") {
      return NextResponse.json(
        { error: "Only administrators can delete patients" },
        { status: 403 },
      );
    }

    // Get patient data before deletion for audit
    const patientToDelete = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        appointments: { select: { id: true } },
        medical_records: { select: { id: true } },
        prescriptions: { select: { id: true } },
      },
    });

    if (!patientToDelete) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // LGPD compliant deletion - cascade delete related records
    await prisma.$transaction(async (tx) => {
      // Delete related records first
      await tx.prescription.deleteMany({ where: { patient_id: patientId } });
      await tx.medicalRecord.deleteMany({ where: { patient_id: patientId } });
      await tx.appointment.deleteMany({ where: { patient_id: patientId } });

      // Delete patient
      await tx.patient.delete({ where: { id: patientId } });
    });

    // Log deletion for audit trail
    await prisma.auditLog.create({
      data: {
        user_id: session.user.id,
        clinic_id: patientToDelete.clinic_id,
        action: "DELETE",
        resource_type: "patient",
        resource_id: patientId,
        ip_address: request.headers.get("x-forwarded-for") || "unknown",
        user_agent: request.headers.get("user-agent") || "unknown",
        endpoint: `/api/prisma/patients/${patientId}`,
        method: "DELETE",
        old_values: patientToDelete,
        lgpd_lawful_basis: "right_to_erasure",
        anvisa_category: "patient_data_deletion",
        cfm_regulation: "LGPD_Art_18",
      },
    });

    return NextResponse.json({
      message: "Patient and all related data deleted successfully (LGPD compliance)",
    });
  } catch (error) {
    console.error("Error deleting patient:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
