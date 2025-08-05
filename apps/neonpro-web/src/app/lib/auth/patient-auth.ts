// Patient Authentication Utils
// Story 1.3, Task 1: Patient Authentication System with LGPD Compliance
// Created: Healthcare-grade authentication utilities for patient portal

import type { createServerClient } from "@/lib/supabase/server";
import type { createClient } from "@/lib/supabase/client";

export interface PatientProfile {
  id: string;
  user_id: string;
  full_name: string;
  cpf?: string;
  birth_date?: string;
  gender?: string;
  phone?: string;
  phone_verified: boolean;
  address?: any;
  emergency_contact?: any;
  privacy_consent: boolean;
  privacy_consent_date?: string;
  privacy_consent_version: string;
  marketing_consent: boolean;
  data_sharing_consent: boolean;
  medical_history_consent: boolean;
  treatment_photos_consent: boolean;
  insurance_info?: any;
  created_at: string;
  updated_at: string;
  last_login?: string;
  account_status: "active" | "inactive" | "suspended" | "pending_verification";
  profile_visibility: "private" | "staff_only";
  data_retention_until?: string;
}

export interface PatientRegistrationData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  birth_date?: string;
  gender?: string;
  cpf?: string;
  privacy_consent: boolean;
  marketing_consent?: boolean;
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface AuthResult {
  success: boolean;
  data?: any;
  error?: string;
  code?: string;
}

// Server-side patient authentication utilities
export class PatientAuthServer {
  static async getCurrentPatient(): Promise<PatientProfile | null> {
    try {
      const supabase = await createServerClient();

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) return null;

      // Get patient profile
      const { data: profile, error: profileError } = await supabase
        .from("patient_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileError || !profile) return null;

      // Record access for LGPD compliance
      await PatientAuthServer.recordDataAccess(profile.id, "profile_access", {
        accessed_fields: ["basic_info"],
      });

      return profile as PatientProfile;
    } catch (error) {
      console.error("Error getting current patient:", error);
      return null;
    }
  }
  static async recordDataAccess(patientId: string, action: string, details?: any): Promise<void> {
    try {
      const supabase = await createServerClient();

      const { error } = await supabase.rpc("record_patient_data_access", {
        p_patient_id: patientId,
        p_action: action,
        p_details: details || {},
      });

      if (error) {
        console.error("Error recording data access:", error);
      }
    } catch (error) {
      console.error("Error in recordDataAccess:", error);
    }
  }

  static async checkPatientConsent(
    patientId: string,
    consentType: "privacy" | "marketing" | "data_sharing" | "medical_history" | "treatment_photos",
  ): Promise<boolean> {
    try {
      const supabase = await createServerClient();

      const { data, error } = await supabase.rpc("check_patient_consent", {
        p_patient_id: patientId,
        p_consent_type: consentType,
      });

      if (error) {
        console.error("Error checking consent:", error);
        return false;
      }

      return data as boolean;
    } catch (error) {
      console.error("Error in checkPatientConsent:", error);
      return false;
    }
  }

  static async isPatientRoute(path: string): Promise<boolean> {
    // Define patient portal routes
    const patientRoutes = [
      "/portal",
      "/portal/dashboard",
      "/portal/appointments",
      "/portal/profile",
      "/portal/history",
      "/portal/payments",
    ];

    return patientRoutes.some((route) => path.startsWith(route));
  }
  static async validatePatientAccess(): Promise<{
    isValid: boolean;
    patient?: PatientProfile;
    redirect?: string;
  }> {
    const patient = await PatientAuthServer.getCurrentPatient();

    if (!patient) {
      return {
        isValid: false,
        redirect: "/portal/login",
      };
    }

    // Check account status
    if (patient.account_status === "suspended") {
      return {
        isValid: false,
        redirect: "/portal/suspended",
      };
    }

    if (patient.account_status === "pending_verification") {
      return {
        isValid: false,
        redirect: "/portal/verify",
      };
    }

    // Check privacy consent (required for LGPD)
    if (!patient.privacy_consent) {
      return {
        isValid: false,
        redirect: "/portal/consent",
      };
    }

    return {
      isValid: true,
      patient,
    };
  }
} // Client-side patient authentication utilities
export class PatientAuthClient {
  static async registerPatient(data: PatientRegistrationData): Promise<AuthResult> {
    try {
      const supabase = await createClient();

      // Register user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            user_type: "patient", // This triggers our database trigger
          },
        },
      });

      if (authError) {
        return {
          success: false,
          error: authError.message,
          code: authError.name,
        };
      }

      if (!authData.user) {
        return {
          success: false,
          error: "Registration failed - no user created",
        };
      }

      return {
        success: true,
        data: {
          user: authData.user,
          session: authData.session,
          needsVerification: !authData.session,
        },
      };
    } catch (error: any) {
      console.error("Registration error:", error);
      return {
        success: false,
        error: error.message || "Registration failed",
      };
    }
  }
  static async loginPatient(email: string, password: string): Promise<AuthResult> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          error: error.message,
          code: error.name,
        };
      }

      if (!data.user || !data.session) {
        return {
          success: false,
          error: "Login failed - invalid credentials",
        };
      }

      // Update last login
      const { error: updateError } = await supabase
        .from("patient_profiles")
        .update({
          last_login: new Date().toISOString(),
        })
        .eq("user_id", data.user.id);

      if (updateError) {
        console.error("Error updating last login:", updateError);
      }

      return {
        success: true,
        data: {
          user: data.user,
          session: data.session,
        },
      };
    } catch (error: any) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.message || "Login failed",
      };
    }
  }
}
