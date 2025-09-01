/**
 * Professional Validation Middleware
 * Simple validation for aesthetic clinic professionals
 * Appropriate for SaaS platform serving advanced aesthetic clinics
 * 
 * For aesthetic clinic professional verification without regulatory overreach
 */

import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ProfessionalValidationRequest {
  professionalId: string;
  clinicId?: string;
  role?: string;
}

interface AestheticProfessional {
  id: string;
  name: string;
  email: string;
  role: "owner" | "manager" | "aesthetician" | "assistant";
  specializations: string[];
  clinic_id: string;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

interface ProfessionalValidationResponse {
  valid: boolean;
  professional?: AestheticProfessional;
  reason?: string;
}

/**
 * Validates aesthetic professional for clinic operations
 * Simple business validation without regulatory overreach
 */
async function validateAestheticProfessional(
  professionalId: string,
  clinicId?: string
): Promise<ProfessionalValidationResponse> {
  try {
    // Query professional from database
    let query = supabase
      .from('professionals')
      .select('*')
      .eq('id', professionalId)
      .eq('status', 'active')
      .single();

    // Add clinic filter if provided
    if (clinicId) {
      query = query.eq('clinic_id', clinicId);
    }

    const { data: professional, error } = await query;

    if (error || !professional) {
      return {
        valid: false,
        reason: "Professional not found or inactive"
      };
    }

    // Check if professional is active
    if (professional.status !== 'active') {
      return {
        valid: false,
        reason: "Professional account is inactive"
      };
    }

    return {
      valid: true,
      professional: professional as AestheticProfessional
    };
  } catch (error) {
    console.error("Professional validation error:", error);
    return {
      valid: false,
      reason: "Validation service error"
    };
  }
}

/**
 * Checks if professional can perform specific aesthetic procedures
 * Based on role and specializations, not medical licensing
 */
export async function validateProcedureAuthorization(
  professionalId: string,
  procedureType: string,
  clinicId?: string
): Promise<{ authorized: boolean; reason?: string }> {
  const validation = await validateAestheticProfessional(professionalId, clinicId);
  
  if (!validation.valid) {
    return { 
      authorized: false, 
      reason: validation.reason 
    };
  }

  const professional = validation.professional!;

  // Role-based authorization for aesthetic procedures
  const rolePermissions: Record<string, string[]> = {
    "owner": ["all"], // Clinic owners can authorize all procedures
    "manager": ["consultation", "basic_facial", "advanced_facial", "body_treatment"],
    "aesthetician": ["consultation", "basic_facial", "advanced_facial", "body_treatment"],
    "assistant": ["consultation", "basic_facial"]
  };

  const allowedProcedures = rolePermissions[professional.role] || [];
  
  // Check if procedure is allowed for this role
  if (!allowedProcedures.includes("all") && !allowedProcedures.includes(procedureType)) {
    return {
      authorized: false,
      reason: `Role '${professional.role}' not authorized for procedure '${procedureType}'`
    };
  }

  // Check specializations if procedure requires specific training
  const specializationRequirements: Record<string, string[]> = {
    "advanced_facial": ["Advanced Facial Treatments", "Dermatology Aesthetics"],
    "chemical_peel": ["Chemical Peels", "Advanced Facial Treatments"],
    "microneedling": ["Microneedling", "Advanced Treatments"],
    "laser_treatment": ["Laser Treatments", "Advanced Equipment"]
  };

  const requiredSpecializations = specializationRequirements[procedureType];
  if (requiredSpecializations) {
    const hasRequiredSpecialization = requiredSpecializations.some(spec =>
      professional.specializations.includes(spec)
    );

    if (!hasRequiredSpecialization) {
      return {
        authorized: false,
        reason: `Specialization required: ${requiredSpecializations.join(" or ")}`
      };
    }
  }

  return { authorized: true };
}

/**
 * Professional validation middleware for API routes
 * Simple validation appropriate for aesthetic clinic SaaS
 */
export function withProfessionalValidation(handler: Function) {
  return async (request: NextRequest) => {
    try {
      const body = await request.json();
      const { professionalId, clinicId } = body as ProfessionalValidationRequest;

      if (!professionalId) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Professional ID required" 
          },
          { status: 400 }
        );
      }

      // Validate professional
      const validation = await validateAestheticProfessional(professionalId, clinicId);
      
      if (!validation.valid) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Professional validation failed",
            details: validation.reason
          },
          { status: 403 }
        );
      }

      // Add professional context to request
      (request as any).professional = validation.professional;
      
      return handler(request);
    } catch (error) {
      console.error("Professional validation middleware error:", error);
      return NextResponse.json(
        { 
          success: false, 
          error: "Professional validation service error"
        },
        { status: 503 }
      );
    }
  };
}

/**
 * Simple clinic access validation
 * Ensures professional belongs to the clinic they're trying to access
 */
export async function validateClinicAccess(
  professionalId: string,
  clinicId: string
): Promise<{ hasAccess: boolean; reason?: string }> {
  try {
    const { data: access, error } = await supabase
      .from('clinic_professionals')
      .select('*')
      .eq('professional_id', professionalId)
      .eq('clinic_id', clinicId)
      .eq('status', 'active')
      .single();

    if (error || !access) {
      return {
        hasAccess: false,
        reason: "Professional does not have access to this clinic"
      };
    }

    return { hasAccess: true };
  } catch (error) {
    console.error("Clinic access validation error:", error);
    return {
      hasAccess: false,
      reason: "Access validation service error"
    };
  }
}

/**
 * Get professional's authorized procedures
 * Returns list of procedures the professional can perform
 */
export async function getProfessionalAuthorizations(
  professionalId: string
): Promise<string[]> {
  const validation = await validateAestheticProfessional(professionalId);
  
  if (!validation.valid || !validation.professional) {
    return [];
  }

  const professional = validation.professional;
  
  // Base procedures by role
  const rolePermissions: Record<string, string[]> = {
    "owner": ["consultation", "basic_facial", "advanced_facial", "body_treatment", "chemical_peel", "microneedling"],
    "manager": ["consultation", "basic_facial", "advanced_facial", "body_treatment"],
    "aesthetician": ["consultation", "basic_facial", "advanced_facial", "body_treatment"],
    "assistant": ["consultation", "basic_facial"]
  };

  let authorizedProcedures = rolePermissions[professional.role] || [];

  // Add specialized procedures based on training
  if (professional.specializations.includes("Chemical Peels")) {
    authorizedProcedures.push("chemical_peel");
  }
  if (professional.specializations.includes("Microneedling")) {
    authorizedProcedures.push("microneedling");
  }
  if (professional.specializations.includes("Laser Treatments")) {
    authorizedProcedures.push("laser_treatment");
  }

  return [...new Set(authorizedProcedures)]; // Remove duplicates
}

export type { 
  ProfessionalValidationRequest, 
  ProfessionalValidationResponse, 
  AestheticProfessional 
};
