/**
 * Multi-Tenant Security Middleware for NeonPro Healthcare SaaS
 *
 * This middleware enforces multi-tenant data isolation at the application level,
 * working in conjunction with Supabase RLS policies to ensure healthcare data
 * security and LGPD compliance.
 *
 * Features:
 * - Clinic-based tenant isolation
 * - Role-based access control (RBAC)
 * - LGPD audit logging
 * - ANVISA compliance checks
 * - Session validation and context injection
 */

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Types for tenant context
export interface TenantContext {
  userId: string;
  clinicIds: string[];
  role: "admin" | "doctor" | "nurse" | "staff";
  permissions: string[];
  isAdmin: boolean;
  medicalLicense?: string;
  professionalTitle?: string;
}

export interface SecurityValidationResult {
  success: boolean;
  tenantContext?: TenantContext;
  error?: string;
  statusCode?: number;
}

// Healthcare-specific permissions
const HEALTHCARE_PERMISSIONS = {
  // Patient management
  "patients:read": ["admin", "doctor", "nurse", "staff"],
  "patients:create": ["admin", "doctor", "nurse"],
  "patients:update": ["admin", "doctor", "nurse"],
  "patients:delete": ["admin"], // LGPD Right to be Forgotten

  // Appointment management
  "appointments:read": ["admin", "doctor", "nurse", "staff"],
  "appointments:create": ["admin", "doctor", "nurse", "staff"],
  "appointments:update": ["admin", "doctor", "nurse"],
  "appointments:cancel": ["admin", "doctor", "nurse"],

  // Medical records (sensitive data)
  "medical_records:read": ["admin", "doctor"],
  "medical_records:create": ["admin", "doctor"],
  "medical_records:update": ["admin", "doctor"],
  "medical_records:delete": ["admin"],

  // Prescriptions (ANVISA controlled)
  "prescriptions:read": ["admin", "doctor", "nurse"],
  "prescriptions:create": ["doctor"], // Only licensed doctors
  "prescriptions:update": ["doctor"],
  "prescriptions:cancel": ["doctor"],

  // Administrative functions
  "clinics:manage": ["admin"],
  "users:manage": ["admin"],
  "audit:read": ["admin", "doctor"],
  "reports:generate": ["admin", "doctor"],

  // LGPD compliance
  "data:export": ["admin", "doctor"], // Data portability
  "data:delete": ["admin"], // Right to be forgotten
  "consent:manage": ["admin", "doctor", "nurse"],

  // ANVISA compliance
  "controlled_substances:prescribe": ["doctor"],
  "anvisa:report": ["admin", "doctor"],
};

/**
 * Validates user authentication and builds tenant context
 */
export async function validateTenantSecurity(
  request: NextRequest,
): Promise<SecurityValidationResult> {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      return {
        success: false,
        error: "Session validation failed",
        statusCode: 401,
      };
    }

    if (!session?.user) {
      return {
        success: false,
        error: "No authenticated user",
        statusCode: 401,
      };
    }

    // Get user profile with clinic associations
    const userProfile = await prisma.profile.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        role: true,
        medical_license: true,
        professional_title: true,
        // In a full implementation, you'd have a user_clinics relation
        // For now, we'll simulate clinic associations
      },
    });

    if (!userProfile) {
      return {
        success: false,
        error: "User profile not found",
        statusCode: 404,
      };
    }

    // Determine clinic access
    let clinicIds: string[] = [];

    if (userProfile.role === "admin") {
      // Admins have access to all clinics
      const allClinics = await prisma.clinic.findMany({
        select: { id: true },
      });
      clinicIds = allClinics.map((c) => c.id);
    } else {
      // For other roles, get associated clinics
      // In a real implementation, this would come from a user_clinics table
      // For now, we'll use a simple approach
      clinicIds = ["default-clinic-id"]; // Placeholder
    }

    // Build permissions based on role
    const permissions = Object.entries(HEALTHCARE_PERMISSIONS)
      .filter(([_, roles]) => roles.includes(userProfile.role as string))
      .map(([permission]) => permission);

    const tenantContext: TenantContext = {
      userId: session.user.id,
      clinicIds,
      role: userProfile.role as TenantContext["role"],
      permissions,
      isAdmin: userProfile.role === "admin",
      medicalLicense: userProfile.medical_license || undefined,
      professionalTitle: userProfile.professional_title || undefined,
    };

    // Log access for LGPD compliance
    await logSecurityEvent({
      userId: session.user.id,
      action: "ACCESS_VALIDATION",
      resource: "system",
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
      success: true,
      metadata: {
        clinicIds,
        role: userProfile.role,
        permissions: permissions.length,
      },
    });

    return {
      success: true,
      tenantContext,
    };
  } catch (error) {
    console.error("Tenant security validation error:", error);

    return {
      success: false,
      error: "Internal security validation error",
      statusCode: 500,
    };
  }
}

/**
 * Checks if the user has a specific permission
 */
export function hasPermission(context: TenantContext, permission: string): boolean {
  return context.permissions.includes(permission) || context.isAdmin;
}

/**
 * Validates access to a specific clinic
 */
export function canAccessClinic(context: TenantContext, clinicId: string): boolean {
  return context.isAdmin || context.clinicIds.includes(clinicId);
}

/**
 * Validates access to patient data (LGPD compliance)
 */
export async function canAccessPatient(
  context: TenantContext,
  patientId: string,
): Promise<boolean> {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { clinic_id: true, data_consent_given: true },
    });

    if (!patient) {
      return false;
    }

    // Check clinic access
    if (!canAccessClinic(context, patient.clinic_id)) {
      return false;
    }

    // LGPD compliance: Check data consent
    if (!patient.data_consent_given && !context.isAdmin) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Patient access validation error:", error);
    return false;
  }
}

/**
 * Validates prescription access (ANVISA compliance)
 */
export async function canAccessPrescription(
  context: TenantContext,
  prescriptionId: string,
  action: "read" | "create" | "update" | "cancel" = "read",
): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      select: {
        clinic_id: true,
        prescriber_id: true,
        controlled_substance: true,
        pharmacy_dispensed: true,
        patient: {
          select: { data_consent_given: true },
        },
      },
    });

    if (!prescription) {
      return { allowed: false, reason: "Prescription not found" };
    }

    // Check clinic access
    if (!canAccessClinic(context, prescription.clinic_id)) {
      return { allowed: false, reason: "No access to clinic" };
    }

    // LGPD compliance
    if (!prescription.patient.data_consent_given && !context.isAdmin) {
      return { allowed: false, reason: "Patient consent required" };
    }

    // Action-specific validations
    switch (action) {
      case "create":
        if (!hasPermission(context, "prescriptions:create")) {
          return { allowed: false, reason: "No permission to create prescriptions" };
        }
        if (context.role !== "doctor") {
          return { allowed: false, reason: "Only doctors can create prescriptions" };
        }
        break;

      case "update":
        if (!hasPermission(context, "prescriptions:update")) {
          return { allowed: false, reason: "No permission to update prescriptions" };
        }
        if (prescription.prescriber_id !== context.userId && !context.isAdmin) {
          return { allowed: false, reason: "Can only update own prescriptions" };
        }
        if (prescription.pharmacy_dispensed) {
          return { allowed: false, reason: "Cannot update dispensed prescriptions" };
        }
        break;

      case "cancel":
        if (!hasPermission(context, "prescriptions:cancel")) {
          return { allowed: false, reason: "No permission to cancel prescriptions" };
        }
        if (prescription.prescriber_id !== context.userId && !context.isAdmin) {
          return { allowed: false, reason: "Can only cancel own prescriptions" };
        }
        break;

      default: // read
        if (!hasPermission(context, "prescriptions:read")) {
          return { allowed: false, reason: "No permission to read prescriptions" };
        }
    }

    // ANVISA compliance for controlled substances
    if (prescription.controlled_substance && action !== "read") {
      if (!context.medicalLicense) {
        return {
          allowed: false,
          reason: "Medical license required for controlled substances",
        };
      }

      // Log controlled substance access
      await logSecurityEvent({
        userId: context.userId,
        action: `CONTROLLED_SUBSTANCE_${action.toUpperCase()}`,
        resource: "prescription",
        resourceId: prescriptionId,
        metadata: {
          medicalLicense: context.medicalLicense,
          action,
        },
      });
    }

    return { allowed: true };
  } catch (error) {
    console.error("Prescription access validation error:", error);
    return { allowed: false, reason: "Validation error" };
  }
}

/**
 * Logs security events for audit compliance
 */
export async function logSecurityEvent(event: {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  success?: boolean;
  metadata?: Record<string, any>;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        user_id: event.userId,
        clinic_id: "system", // System-level security events
        action: event.action,
        resource_type: event.resource,
        resource_id: event.resourceId,
        ip_address: event.ipAddress,
        user_agent: event.userAgent,
        new_values: event.metadata ? JSON.parse(JSON.stringify(event.metadata)) : null,
        lgpd_lawful_basis: "legitimate_interest",
        anvisa_category:
          event.resource === "prescription" ? "prescription_access" : "security_event",
      },
    });
  } catch (error) {
    console.error("Failed to log security event:", error);
    // Don't throw here to avoid breaking the main flow
  }
}

/**
 * Middleware wrapper for API routes
 */
export function withTenantSecurity<T extends any[]>(
  handler: (request: NextRequest, context: TenantContext, ...args: T) => Promise<NextResponse>,
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const validation = await validateTenantSecurity(request);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.statusCode || 401 },
      );
    }

    try {
      return await handler(request, validation.tenantContext!, ...args);
    } catch (error) {
      console.error("Handler error:", error);

      // Log the error for audit
      await logSecurityEvent({
        userId: validation.tenantContext!.userId,
        action: "API_ERROR",
        resource: "system",
        success: false,
        metadata: {
          error: error instanceof Error ? error.message : "Unknown error",
          path: request.nextUrl.pathname,
          method: request.method,
        },
      });

      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  };
}

/**
 * Permission validation decorator
 */
export function requirePermission(permission: string) {
  return <T extends any[]>(
    handler: (request: NextRequest, context: TenantContext, ...args: T) => Promise<NextResponse>,
  ) =>
    withTenantSecurity(async (request, context, ...args) => {
      if (!hasPermission(context, permission)) {
        return NextResponse.json({ error: `Permission required: ${permission}` }, { status: 403 });
      }

      return handler(request, context, ...args);
    });
}

/**
 * Clinic access validation decorator
 */
export function requireClinicAccess() {
  return <T extends any[]>(
    handler: (request: NextRequest, context: TenantContext, ...args: T) => Promise<NextResponse>,
  ) =>
    withTenantSecurity(async (request, context, ...args) => {
      const url = new URL(request.url);
      const clinicId = url.searchParams.get("clinic_id");

      if (clinicId && !canAccessClinic(context, clinicId)) {
        return NextResponse.json({ error: "Access denied to clinic" }, { status: 403 });
      }

      return handler(request, context, ...args);
    });
}
