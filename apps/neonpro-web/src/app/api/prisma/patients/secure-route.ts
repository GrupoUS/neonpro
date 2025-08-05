/**
 * Secure Patients API Route - Enhanced with Multi-Tenant Security
 *
 * This is an enhanced version of the patients API route that demonstrates
 * the integration of our multi-tenant security middleware with comprehensive
 * LGPD compliance and healthcare-specific access controls.
 */

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  canAccessPatient,
  hasPermission,
  logSecurityEvent,
  requireClinicAccess,
  requirePermission,
  type TenantContext,
  withTenantSecurity,
} from "@/lib/security/multi-tenant-middleware";

// Enhanced validation schema with security considerations
const createPatientSchema = z
  .object({
    clinic_id: z.string().uuid(),
    full_name: z.string().min(2).max(255),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    birth_date: z.string().datetime().optional(),
    medical_record_number: z.string().optional(),
    emergency_contact: z.string().optional(),
    insurance_provider: z.string().optional(),
    data_consent_given: z.boolean(),
  })
  .refine(
    (data) => {
      // LGPD compliance: consent is required
      return data.data_consent_given === true;
    },
    {
      message: "LGPD data consent is required to create patient records",
      path: ["data_consent_given"],
    },
  );

/**
 * GET /api/prisma/patients/secure
 * Secure endpoint with multi-tenant filtering and LGPD compliance
 */
export const GET = requirePermission("patients:read")(
  requireClinicAccess()(async (request: NextRequest, context: TenantContext) => {
    try {
      const { searchParams } = new URL(request.url);

      // Pagination parameters
      const page = parseInt(searchParams.get("page") || "1");
      const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100);
      const skip = (page - 1) * limit;

      // Search and filter parameters
      const search = searchParams.get("search");
      const clinic_id = searchParams.get("clinic_id");
      const consent_status = searchParams.get("consent_status");

      // Build where clause with tenant security
      const whereClause: any = {
        // Multi-tenant filtering: only show patients from accessible clinics
        clinic_id: {
          in: context.isAdmin ? undefined : context.clinicIds,
        },
      };

      // Apply additional filters
      if (clinic_id && context.clinicIds.includes(clinic_id)) {
        whereClause.clinic_id = clinic_id;
      }

      if (search) {
        whereClause.OR = [
          { full_name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { medical_record_number: { contains: search, mode: "insensitive" } },
        ];
      }

      // LGPD compliance: filter by consent status if specified
      if (consent_status !== null) {
        const hasConsent = consent_status === "true";
        whereClause.data_consent_given = hasConsent;

        // Non-admins can only see patients with consent
        if (!context.isAdmin && !hasConsent) {
          return NextResponse.json({
            patients: [],
            pagination: { page, limit, total: 0, pages: 0 },
            message: "LGPD compliance: Cannot access patients without data consent",
          });
        }
      } else if (!context.isAdmin) {
        // Default: non-admins only see consented patients
        whereClause.data_consent_given = true;
      }

      // Get patients with security context
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
              where: {
                status: "scheduled",
                scheduled_at: { gte: new Date() },
              },
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

      // Log access for LGPD audit trail
      await logSecurityEvent({
        userId: context.userId,
        action: "PATIENTS_LIST_ACCESS",
        resource: "patient",
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
        success: true,
        metadata: {
          patientsCount: patients.length,
          totalCount,
          hasSearch: !!search,
          consentFilter: consent_status,
          clinicIds: context.clinicIds.length,
          page,
          limit,
        },
      });

      // Filter sensitive data based on role and permissions
      const sanitizedPatients = patients.map((patient) => {
        const basePatient = {
          id: patient.id,
          full_name: patient.full_name,
          clinic: patient.clinic,
          created_at: patient.created_at,
          data_consent_given: patient.data_consent_given,
          _count: patient._count,
          appointments: patient.appointments,
        };

        // Add sensitive fields only if user has appropriate permissions
        if (hasPermission(context, "patients:read") && patient.data_consent_given) {
          return {
            ...basePatient,
            email: patient.email,
            phone: patient.phone,
            birth_date: patient.birth_date,
            medical_record_number: patient.medical_record_number,
            emergency_contact: patient.emergency_contact,
            insurance_provider: patient.insurance_provider,
            created_by_profile: patient.created_by_profile,
          };
        }

        return basePatient;
      });

      return NextResponse.json({
        patients: sanitizedPatients,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
        security: {
          tenantId: context.clinicIds.length === 1 ? context.clinicIds[0] : "multi-tenant",
          role: context.role,
          lgpdCompliant: true,
          dataConsentRequired: !context.isAdmin,
        },
      });
    } catch (error) {
      console.error("Error fetching patients:", error);

      // Log the error for security audit
      await logSecurityEvent({
        userId: context.userId,
        action: "PATIENTS_LIST_ERROR",
        resource: "patient",
        success: false,
        metadata: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });

      return NextResponse.json(
        {
          error: "Internal server error",
          code: "FETCH_PATIENTS_ERROR",
        },
        { status: 500 },
      );
    }
  }),
);

/**
 * POST /api/prisma/patients/secure
 * Secure patient creation with enhanced validation and audit logging
 */
export const POST = requirePermission("patients:create")(
  async (request: NextRequest, context: TenantContext) => {
    try {
      const body = await request.json();

      // Validate request body with security schema
      const validatedData = createPatientSchema.parse(body);

      // Verify user can create patients in the specified clinic
      if (!context.clinicIds.includes(validatedData.clinic_id) && !context.isAdmin) {
        await logSecurityEvent({
          userId: context.userId,
          action: "UNAUTHORIZED_CLINIC_ACCESS",
          resource: "patient",
          success: false,
          metadata: {
            attemptedClinicId: validatedData.clinic_id,
            userClinicIds: context.clinicIds,
          },
        });

        return NextResponse.json(
          {
            error: "Access denied to specified clinic",
            code: "CLINIC_ACCESS_DENIED",
          },
          { status: 403 },
        );
      }

      // Verify clinic exists and is active
      const clinic = await prisma.clinic.findUnique({
        where: { id: validatedData.clinic_id },
        select: { id: true, name: true, is_active: true },
      });

      if (!clinic || !clinic.is_active) {
        return NextResponse.json(
          {
            error: "Clinic not found or inactive",
            code: "CLINIC_NOT_FOUND",
          },
          { status: 404 },
        );
      }

      // Generate medical record number if not provided
      if (!validatedData.medical_record_number) {
        const year = new Date().getFullYear();
        const clinicPrefix = clinic.name.substring(0, 2).toUpperCase();
        const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
        validatedData.medical_record_number = `${clinicPrefix}-${year}-${randomSuffix}`;
      }

      // Create patient with audit trail
      const patient = await prisma.patient.create({
        data: {
          ...validatedData,
          created_by: context.userId,
          data_consent_date: new Date(), // LGPD compliance
        },
        include: {
          clinic: {
            select: { id: true, name: true },
          },
          created_by_profile: {
            select: { id: true, full_name: true, professional_title: true },
          },
        },
      });

      // Log creation for comprehensive audit trail
      await logSecurityEvent({
        userId: context.userId,
        action: "PATIENT_CREATED",
        resource: "patient",
        resourceId: patient.id,
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
        success: true,
        metadata: {
          patientName: patient.full_name,
          clinicId: patient.clinic_id,
          clinicName: clinic.name,
          medicalRecordNumber: patient.medical_record_number,
          dataConsentGiven: patient.data_consent_given,
          createdBy: context.userId,
          userRole: context.role,
        },
      });

      // LGPD compliance: Log data consent
      if (patient.data_consent_given) {
        await logSecurityEvent({
          userId: context.userId,
          action: "LGPD_CONSENT_GRANTED",
          resource: "patient",
          resourceId: patient.id,
          metadata: {
            consentDate: patient.data_consent_date,
            consentContext: "patient_registration",
          },
        });
      }

      return NextResponse.json(
        {
          patient,
          message: "Patient created successfully",
          compliance: {
            lgpd: {
              consentGiven: patient.data_consent_given,
              consentDate: patient.data_consent_date,
              auditLogged: true,
            },
            security: {
              tenantId: patient.clinic_id,
              createdBy: context.userId,
              role: context.role,
            },
          },
        },
        { status: 201 },
      );
    } catch (error) {
      // Enhanced error handling with security logging
      let errorResponse = {
        error: "Internal server error",
        code: "PATIENT_CREATION_ERROR",
      };
      let statusCode = 500;

      if (error instanceof z.ZodError) {
        errorResponse = {
          error: "Validation error",
          code: "VALIDATION_ERROR",
          details: error.errors,
        } as any;
        statusCode = 400;
      }

      // Log the error for security audit
      await logSecurityEvent({
        userId: context.userId,
        action: "PATIENT_CREATION_ERROR",
        resource: "patient",
        success: false,
        metadata: {
          error: error instanceof Error ? error.message : "Unknown error",
          errorType: error.constructor.name,
          requestBody: error instanceof z.ZodError ? "validation_failed" : "processing_failed",
        },
      });

      console.error("Error creating patient:", error);
      return NextResponse.json(errorResponse, { status: statusCode });
    }
  },
);

/**
 * PUT /api/prisma/patients/secure/[id]
 * Secure patient update with LGPD compliance checks
 */
export const PUT = requirePermission("patients:update")(
  async (request: NextRequest, context: TenantContext, { params }: { params: { id: string } }) => {
    try {
      const patientId = params.id;

      // Validate patient access
      const hasAccess = await canAccessPatient(context, patientId);
      if (!hasAccess) {
        await logSecurityEvent({
          userId: context.userId,
          action: "UNAUTHORIZED_PATIENT_ACCESS",
          resource: "patient",
          resourceId: patientId,
          success: false,
        });

        return NextResponse.json(
          {
            error: "Access denied to patient data",
            code: "PATIENT_ACCESS_DENIED",
          },
          { status: 403 },
        );
      }

      const body = await request.json();

      // Get existing patient data for audit trail
      const existingPatient = await prisma.patient.findUnique({
        where: { id: patientId },
        include: {
          clinic: { select: { name: true } },
        },
      });

      if (!existingPatient) {
        return NextResponse.json(
          {
            error: "Patient not found",
            code: "PATIENT_NOT_FOUND",
          },
          { status: 404 },
        );
      }

      // Validate update data
      const updateSchema = createPatientSchema.partial().omit({ clinic_id: true });
      const validatedData = updateSchema.parse(body);

      // Update patient with audit trail
      const updatedPatient = await prisma.patient.update({
        where: { id: patientId },
        data: {
          ...validatedData,
          updated_by: context.userId,
          // Update consent date if consent status changed
          data_consent_date:
            validatedData.data_consent_given !== undefined
              ? validatedData.data_consent_given
                ? new Date()
                : null
              : undefined,
        },
        include: {
          clinic: { select: { id: true, name: true } },
          created_by_profile: { select: { id: true, full_name: true } },
        },
      });

      // Comprehensive audit logging for LGPD compliance
      await logSecurityEvent({
        userId: context.userId,
        action: "PATIENT_UPDATED",
        resource: "patient",
        resourceId: patientId,
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
        success: true,
        metadata: {
          patientName: updatedPatient.full_name,
          clinicName: existingPatient.clinic?.name,
          updatedFields: Object.keys(validatedData),
          oldConsentStatus: existingPatient.data_consent_given,
          newConsentStatus: updatedPatient.data_consent_given,
          updatedBy: context.userId,
          userRole: context.role,
        },
      });

      // Log consent changes for LGPD compliance
      if (
        validatedData.data_consent_given !== undefined &&
        validatedData.data_consent_given !== existingPatient.data_consent_given
      ) {
        await logSecurityEvent({
          userId: context.userId,
          action: validatedData.data_consent_given
            ? "LGPD_CONSENT_GRANTED"
            : "LGPD_CONSENT_REVOKED",
          resource: "patient",
          resourceId: patientId,
          metadata: {
            previousConsent: existingPatient.data_consent_given,
            newConsent: validatedData.data_consent_given,
            consentDate: updatedPatient.data_consent_date,
          },
        });
      }

      return NextResponse.json({
        patient: updatedPatient,
        message: "Patient updated successfully",
        compliance: {
          lgpd: {
            consentStatus: updatedPatient.data_consent_given,
            consentChanged: validatedData.data_consent_given !== existingPatient.data_consent_given,
            auditLogged: true,
          },
        },
      });
    } catch (error) {
      console.error("Error updating patient:", error);

      await logSecurityEvent({
        userId: context.userId,
        action: "PATIENT_UPDATE_ERROR",
        resource: "patient",
        resourceId: params.id,
        success: false,
        metadata: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });

      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: "Validation error",
            code: "VALIDATION_ERROR",
            details: error.errors,
          },
          { status: 400 },
        );
      }

      return NextResponse.json(
        {
          error: "Internal server error",
          code: "PATIENT_UPDATE_ERROR",
        },
        { status: 500 },
      );
    }
  },
);
