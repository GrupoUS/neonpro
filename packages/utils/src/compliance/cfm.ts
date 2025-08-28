/**
 * CFM (Conselho Federal de Medicina) Compliance Module
 * Modern TypeScript implementation for medical professional licensing,
 * digital signatures, and telemedicine compliance
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import type {
  Database,
  MedicalProfessional,
  DigitalSignature,
  TelemedicineSession,
  ContinuingEducation,
  CFMComplianceReport,
  CFMValidationResult,
  CFMOperationResult,
  DatabaseResponse,
  DatabaseArrayResponse,
  CFMLicenseValidation,
  TelemedicineRequirements,
  CFMComplianceLog,
  BrazilianState,
  CFMLicenseStatus,
  CFMDocumentType,
  TelemedicineSessionType,
  CFMEducationCategory,
} from "@neonpro/types";

/**
 * Enhanced CFM Compliance Service
 * Provides comprehensive medical compliance management for Brazilian healthcare
 */
export class CFMComplianceService {
  private readonly supabase: SupabaseClient<Database>;
  private readonly CFM_LICENSE_PATTERN = /^CRM\/[A-Z]{2}\s?\d{4,6}$/;
  private readonly APPROVED_TELEMEDICINE_PLATFORMS = [
    "telemedicina-cfm",
    "medcloud",
    "conexa-saude",
    "teleconsulta-brasil",
  ] as const;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing required Supabase environment variables");
    }

    this.supabase = createClient<Database>(supabaseUrl, serviceRoleKey);
  }

  /**
   * Register a new medical professional with CFM validation
   */
  async registerProfessional(
    professionalData: Omit<
      MedicalProfessional,
      "id" | "created_at" | "updated_at"
    >,
  ): Promise<CFMOperationResult<MedicalProfessional>> {
    try {
      // Validate CFM license format
      const licenseValidation = this.validateCFMLicense(
        professionalData.cfm_license,
      );
      if (!licenseValidation.isValid) {
        return {
          success: false,
          error: `Invalid CFM license: ${licenseValidation.errors.join(", ")}`,
        };
      }

      const { data, error } = await this.supabase
        .from("medical_professionals")
        .insert({
          ...professionalData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data) {
        return { success: false, error: "No data returned from registration" };
      }

      // Log compliance action
      await this.logComplianceAction(
        "professional_registration",
        `CFM: ${professionalData.cfm_license}`,
        data.id,
      );

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error during registration",
      };
    }
  }

  /**
   * Validate a professional's license status and credentials
   */
  async validateProfessionalLicense(
    cfmLicense: string,
  ): Promise<CFMValidationResult> {
    try {
      // First validate license format
      const licenseValidation = this.validateCFMLicense(cfmLicense);
      if (!licenseValidation.isValid) {
        return {
          success: false,
          error: `Invalid license format: ${licenseValidation.errors.join(", ")}`,
        };
      }

      const { data: professional, error } = await this.supabase
        .from("medical_professionals")
        .select("*")
        .eq("cfm_license", cfmLicense)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      if (!professional) {
        return { success: false, error: "Professional not found" };
      }

      // Validate license status and expiry
      const isActive = professional.license_status === "active";
      const notExpired = new Date(professional.license_expiry) > new Date();

      if (!isActive || !notExpired) {
        return {
          success: false,
          error: `License ${!isActive ? "inactive" : "expired"}`,
        };
      }

      return { success: true, data: professional };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown validation error",
      };
    }
  }

  /**
   * Validate CFM license format and extract state information
   */
  private validateCFMLicense(license: string): CFMLicenseValidation {
    const errors: string[] = [];

    if (!license || typeof license !== "string") {
      errors.push("License must be a non-empty string");
    }

    if (!this.CFM_LICENSE_PATTERN.test(license)) {
      errors.push("License must follow CRM/STATE format (e.g., CRM/SP 12345)");
    }

    let state: BrazilianState | null = null;
    if (license.includes("/")) {
      const stateCode = license.split("/")[1]?.split(" ")[0];
      if (stateCode && this.isValidBrazilianState(stateCode)) {
        state = stateCode as BrazilianState;
      } else {
        errors.push("Invalid Brazilian state code");
      }
    }

    return {
      license,
      state: state || "SP", // Default fallback
      isValid: errors.length === 0,
      errors,
    };
  }

  private isValidBrazilianState(stateCode: string): boolean {
    const validStates = [
      "AC",
      "AL",
      "AP",
      "AM",
      "BA",
      "CE",
      "DF",
      "ES",
      "GO",
      "MA",
      "MT",
      "MS",
      "MG",
      "PA",
      "PB",
      "PR",
      "PE",
      "PI",
      "RJ",
      "RN",
      "RS",
      "RO",
      "RR",
      "SC",
      "SP",
      "SE",
      "TO",
    ];
    return validStates.includes(stateCode);
  }

  /**
   * Get professionals with expiring licenses
   */
  async getExpiringLicenses(
    days = 60,
  ): Promise<CFMOperationResult<MedicalProfessional[]>> {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      const { data, error } = await this.supabase
        .from("medical_professionals")
        .select("*")
        .lte("license_expiry", futureDate.toISOString())
        .gte("license_expiry", new Date().toISOString())
        .eq("license_status", "active");

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error fetching expiring licenses",
      };
    }
  }

  /**
   * Create a digital signature for medical documents
   */
  async createDigitalSignature(
    professionalId: string,
    documentHash: string,
    documentType: CFMDocumentType,
    documentReference: string,
  ): Promise<CFMOperationResult<DigitalSignature>> {
    try {
      // Validate professional can sign documents
      const { data: professional, error: profError } = await this.supabase
        .from("medical_professionals")
        .select("digital_signature_cert, license_status")
        .eq("id", professionalId)
        .single();

      if (profError) {
        return { success: false, error: profError.message };
      }

      if (!professional?.digital_signature_cert) {
        return {
          success: false,
          error: "Professional not certified for digital signatures",
        };
      }

      if (professional.license_status !== "active") {
        return {
          success: false,
          error: "Professional license is not active",
        };
      }

      // Generate signature hash (simplified - real implementation would use proper PKI)
      const timestamp = new Date().toISOString();
      const signatureData = `${documentHash}:${professionalId}:${timestamp}`;
      const signatureHash = createHash("sha256")
        .update(signatureData)
        .digest("hex");

      const signature: Omit<DigitalSignature, "id"> = {
        professional_id: professionalId,
        document_hash: documentHash,
        signature_hash: signatureHash,
        certificate_thumbprint: professional.digital_signature_cert,
        timestamp,
        document_type: documentType,
        document_reference: documentReference,
        is_valid: true,
      };

      const { data, error } = await this.supabase
        .from("digital_signatures")
        .insert(signature)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Log compliance action
      await this.logComplianceAction(
        "digital_signature_created",
        `Document: ${documentReference}`,
        data.id,
      );

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error creating signature",
      };
    }
  }

  /**
   * Validate a digital signature's integrity
   */
  async validateDigitalSignature(
    signatureId: string,
  ): Promise<CFMOperationResult<boolean>> {
    try {
      const { data: signature, error } = await this.supabase
        .from("digital_signatures")
        .select("*")
        .eq("id", signatureId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      if (!signature) {
        return { success: false, error: "Signature not found" };
      }

      // Validate signature integrity (simplified validation)
      const expectedSignatureData = `${signature.document_hash}:${signature.professional_id}:${signature.timestamp}`;
      const expectedHash = createHash("sha256")
        .update(expectedSignatureData)
        .digest("hex");

      const isValid =
        signature.signature_hash === expectedHash && signature.is_valid;

      // Update validation status if changed
      if (isValid !== signature.is_valid) {
        await this.supabase
          .from("digital_signatures")
          .update({
            is_valid: isValid,
            validation_timestamp: new Date().toISOString(),
          })
          .eq("id", signatureId);
      }

      return { success: true, data: isValid };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error validating signature",
      };
    }
  }

  /**
   * Start a new telemedicine session with CFM compliance validation
   */
  async startTelemedicineSession(
    sessionData: Omit<
      TelemedicineSession,
      "id" | "created_at" | "cfm_compliance_validated"
    >,
  ): Promise<CFMOperationResult<TelemedicineSession>> {
    try {
      // Validate professional is certified for telemedicine
      const { data: professional, error: profError } = await this.supabase
        .from("medical_professionals")
        .select("telemedicine_certified, license_status")
        .eq("id", sessionData.professional_id)
        .single();

      if (profError) {
        return { success: false, error: profError.message };
      }

      if (
        !professional?.telemedicine_certified ||
        professional.license_status !== "active"
      ) {
        return {
          success: false,
          error:
            "Professional not certified for telemedicine or license inactive",
        };
      }

      // Validate CFM compliance requirements
      const cfmCompliance = this.validateTelemedicineCompliance(sessionData);
      if (!cfmCompliance) {
        return {
          success: false,
          error: "Session does not meet CFM telemedicine requirements",
        };
      }

      const completeSessionData = {
        ...sessionData,
        cfm_compliance_validated: cfmCompliance,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await this.supabase
        .from("telemedicine_sessions")
        .insert(completeSessionData)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Log compliance action
      await this.logComplianceAction(
        "telemedicine_session_started",
        `Session type: ${sessionData.session_type}`,
        data.id,
      );

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error starting telemedicine session",
      };
    }
  }

  /**
   * Validate telemedicine session compliance with CFM requirements
   */
  private validateTelemedicineCompliance(
    session: Partial<TelemedicineSession>,
  ): boolean {
    const requirements: TelemedicineRequirements = {
      // Patient must have provided informed consent
      hasInformedConsent: session.recording_consent !== undefined,
      // Platform must be secure and compliant
      usesCertifiedPlatform: this.isCertifiedTelemedicinePlatform(
        session.platform_used || "",
      ),
      // Professional must have appropriate qualifications (validated above)
      professionalQualified: true,
      // Session must be properly documented
      hasProperDocumentation: Boolean(session.consultation_notes?.length),
    };

    return Object.values(requirements).every((req) => req === true);
  }

  /**
   * Check if platform is CFM-approved for telemedicine
   */
  private isCertifiedTelemedicinePlatform(platform: string): boolean {
    return this.APPROVED_TELEMEDICINE_PLATFORMS.includes(
      platform.toLowerCase() as (typeof this.APPROVED_TELEMEDICINE_PLATFORMS)[number],
    );
  }

  /**
   * End a telemedicine session
   */
  async endTelemedicineSession(
    sessionId: string,
    consultationNotes: string,
  ): Promise<CFMOperationResult<boolean>> {
    try {
      const { error } = await this.supabase
        .from("telemedicine_sessions")
        .update({
          end_time: new Date().toISOString(),
          consultation_notes: consultationNotes,
        })
        .eq("id", sessionId);

      if (error) {
        return { success: false, error: error.message };
      }

      // Log compliance action
      await this.logComplianceAction(
        "telemedicine_session_ended",
        "Session completed",
        sessionId,
      );

      return { success: true, data: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error ending session",
      };
    }
  }

  /**
   * Record continuing education for compliance tracking
   */
  async recordContinuingEducation(
    educationData: Omit<ContinuingEducation, "id">,
  ): Promise<CFMOperationResult<ContinuingEducation>> {
    try {
      const { data, error } = await this.supabase
        .from("continuing_education")
        .insert(educationData)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Update professional's total hours
      await this.updateProfessionalEducationHours(
        educationData.professional_id,
        educationData.hours,
      );

      // Log compliance action
      await this.logComplianceAction(
        "continuing_education_recorded",
        `Course: ${educationData.course_name}`,
        data.id,
      );

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error recording education",
      };
    }
  }

  /**
   * Update professional's continuing education hours
   */
  private async updateProfessionalEducationHours(
    professionalId: string,
    additionalHours: number,
  ): Promise<void> {
    try {
      const { data: professional, error: fetchError } = await this.supabase
        .from("medical_professionals")
        .select("continuing_education_hours")
        .eq("id", professionalId)
        .single();

      if (fetchError || !professional) {
        return;
      }

      const updatedHours =
        professional.continuing_education_hours + additionalHours;

      await this.supabase
        .from("medical_professionals")
        .update({
          continuing_education_hours: updatedHours,
          updated_at: new Date().toISOString(),
        })
        .eq("id", professionalId);
    } catch {
      // Silent fail for education hours update
    }
  }

  /**
   * Validate continuing education requirements
   */
  async validateContinuingEducationRequirements(
    professionalId: string,
  ): Promise<CFMOperationResult<boolean>> {
    try {
      const { data: professional, error } = await this.supabase
        .from("medical_professionals")
        .select("continuing_education_hours, created_at")
        .eq("id", professionalId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      if (!professional) {
        return { success: false, error: "Professional not found" };
      }

      // CFM requires minimum continuing education hours per period
      const minimumHoursPerYear = 100;
      const yearsActive = Math.ceil(
        (Date.now() - new Date(professional.created_at).getTime()) /
          (1000 * 60 * 60 * 24 * 365),
      );
      const requiredHours = minimumHoursPerYear * Math.max(1, yearsActive);

      const meetsRequirements =
        professional.continuing_education_hours >= requiredHours;

      return { success: true, data: meetsRequirements };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error validating requirements",
      };
    }
  }

  /**
   * Generate comprehensive CFM compliance report
   */
  async generateCFMComplianceReport(
    startDate: Date,
    endDate: Date,
  ): Promise<CFMOperationResult<CFMComplianceReport>> {
    try {
      const [
        professionalsResult,
        signaturesResult,
        sessionsResult,
        educationResult,
      ] = await Promise.all([
        this.supabase
          .from("medical_professionals")
          .select("*")
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString()),

        this.supabase
          .from("digital_signatures")
          .select("*")
          .gte("timestamp", startDate.toISOString())
          .lte("timestamp", endDate.toISOString()),

        this.supabase
          .from("telemedicine_sessions")
          .select("*")
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString()),

        this.supabase
          .from("continuing_education")
          .select("*")
          .gte("completion_date", startDate.toISOString())
          .lte("completion_date", endDate.toISOString()),
      ]);

      if (
        professionalsResult.error ||
        signaturesResult.error ||
        sessionsResult.error ||
        educationResult.error
      ) {
        return {
          success: false,
          error: "Error fetching compliance report data",
        };
      }

      const professionals = professionalsResult.data || [];
      const signatures = signaturesResult.data || [];
      const sessions = sessionsResult.data || [];
      const education = educationResult.data || [];

      const expiringLicensesResult = await this.getExpiringLicenses();
      const expiringLicenses = expiringLicensesResult.data || [];

      const report: CFMComplianceReport = {
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
        professionals: {
          total: professionals.length,
          active: professionals.filter((p) => p.license_status === "active")
            .length,
          telemedicine_certified: professionals.filter(
            (p) => p.telemedicine_certified,
          ).length,
          digital_signature_enabled: professionals.filter(
            (p) => p.digital_signature_cert,
          ).length,
          licenses_expiring: expiringLicenses.length,
        },
        digital_signatures: {
          total: signatures.length,
          valid: signatures.filter((s) => s.is_valid).length,
          by_document_type: signatures.reduce(
            (acc, sig) => {
              acc[sig.document_type] = (acc[sig.document_type] || 0) + 1;
              return acc;
            },
            {} as Record<CFMDocumentType, number>,
          ),
        },
        telemedicine: {
          total_sessions: sessions.length,
          compliant_sessions: sessions.filter((s) => s.cfm_compliance_validated)
            .length,
          by_session_type: sessions.reduce(
            (acc, session) => {
              acc[session.session_type] = (acc[session.session_type] || 0) + 1;
              return acc;
            },
            {} as Record<TelemedicineSessionType, number>,
          ),
        },
        continuing_education: {
          total_courses: education.length,
          total_hours: education.reduce((sum, course) => sum + course.hours, 0),
          cfm_recognized: education.filter((e) => e.cfm_recognized).length,
        },
        compliance_score: this.calculateCFMComplianceScore(
          professionals,
          signatures,
          sessions,
          expiringLicenses,
        ),
      };

      return { success: true, data: report };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error generating report",
      };
    }
  }

  /**
   * Calculate overall CFM compliance score
   */
  private calculateCFMComplianceScore(
    professionals: MedicalProfessional[],
    signatures: DigitalSignature[],
    sessions: TelemedicineSession[],
    expiringLicenses: MedicalProfessional[],
  ): number {
    let score = 100;

    // Deduct points for compliance issues
    const inactiveProfessionals = professionals.filter(
      (p) => p.license_status !== "active",
    ).length;
    const invalidSignatures = signatures.filter((s) => !s.is_valid).length;
    const nonCompliantSessions = sessions.filter(
      (s) => !s.cfm_compliance_validated,
    ).length;

    score -= inactiveProfessionals * 10; // -10 points per inactive professional
    score -= invalidSignatures * 5; // -5 points per invalid signature
    score -= nonCompliantSessions * 8; // -8 points per non-compliant session
    score -= expiringLicenses.length * 3; // -3 points per expiring license

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Log compliance actions for audit trail
   */
  private async logComplianceAction(
    action: string,
    description: string,
    referenceId: string,
    userId?: string,
  ): Promise<void> {
    try {
      const logEntry: Omit<CFMComplianceLog, "id"> = {
        action,
        description,
        reference_id: referenceId,
        module: "cfm",
        timestamp: new Date().toISOString(),
        user_id: userId,
        metadata: {
          version: "2.0",
          source: "CFMComplianceService",
        },
      };

      await this.supabase.from("compliance_logs").insert(logEntry);
    } catch {
      // Silent fail for logging - don't break main operations
    }
  }
}

// Export singleton instance
export const cfmCompliance = new CFMComplianceService();

// Export class for testing and custom instantiation
export { CFMComplianceService };
