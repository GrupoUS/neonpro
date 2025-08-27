/**
 * CFM (Conselho Federal de Medicina) Compliance Module
 * Handles medical professional licensing, digital signatures, and telemedicine compliance
 */

import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";

export interface MedicalProfessional {
  id: string;
  cfm_license: string;
  crm_state: string;
  full_name: string;
  specializations: string[];
  license_status: "active" | "suspended" | "revoked" | "expired";
  license_expiry: Date;
  digital_signature_cert?: string;
  telemedicine_certified: boolean;
  continuing_education_hours: number;
  created_at: Date;
  updated_at: Date;
}

export interface DigitalSignature {
  id: string;
  professional_id: string;
  document_hash: string;
  signature_hash: string;
  certificate_thumbprint: string;
  timestamp: Date;
  document_type:
    | "prescription"
    | "medical_certificate"
    | "treatment_plan"
    | "consultation_report";
  document_reference: string;
  is_valid: boolean;
  validation_timestamp?: Date;
}

export interface TelemedicineSession {
  id: string;
  professional_id: string;
  patient_id: string;
  session_type: "consultation" | "follow_up" | "second_opinion" | "emergency";
  start_time: Date;
  end_time?: Date;
  platform_used: string;
  recording_consent: boolean;
  recording_stored: boolean;
  consultation_notes: string;
  cfm_compliance_validated: boolean;
  created_at: Date;
}

export interface ContinuingEducation {
  id: string;
  professional_id: string;
  course_name: string;
  provider: string;
  hours: number;
  completion_date: Date;
  certificate_number: string;
  cfm_recognized: boolean;
  category: "ethics" | "clinical" | "research" | "technology" | "management";
}

export class CFMCompliance {
  private readonly supabase: unknown;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    );
  }

  // Medical Professional Management
  async registerProfessional(
    professional: Omit<MedicalProfessional, "id" | "created_at" | "updated_at">,
  ): Promise<MedicalProfessional | null> {
    try {
      // Validate CFM license format
      if (!this.validateCFMLicense(professional.cfm_license)) {
        throw new Error("Invalid CFM license format");
      }

      const { data, error } = await this.supabase
        .from("medical_professionals")
        .insert(professional)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Log compliance action
      await this.logComplianceAction(
        "professional_registration",
        `CFM: ${professional.cfm_license}`,
        data.id,
      );

      return data;
    } catch {
      return;
    }
  }

  async validateProfessionalLicense(cfmLicense: string): Promise<boolean> {
    try {
      const { data: professional, error } = await this.supabase
        .from("medical_professionals")
        .select("*")
        .eq("cfm_license", cfmLicense)
        .single();

      if (error || !professional) {
        return false;
      }

      // Check license status and expiry
      const isActive = professional.license_status === "active";
      const notExpired = new Date(professional.license_expiry) > new Date();
      const hasValidFormat = this.validateCFMLicense(cfmLicense);

      return isActive && notExpired && hasValidFormat;
    } catch {
      return false;
    }
  }

  private validateCFMLicense(license: string): boolean {
    // CFM licenses follow the pattern: CRM/STATE + 5-6 digits
    const cfmPattern = /^CRM\/[A-Z]{2}\s?\d{4,6}$/;
    return cfmPattern.test(license);
  }

  async getExpiringLicenses(days = 60): Promise<MedicalProfessional[]> {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      const { data, error } = await this.supabase
        .from("medical_professionals")
        .select("*")
        .lte("license_expiry", futureDate.toISOString())
        .gte("license_expiry", new Date().toISOString())
        .eq("license_status", "active");

      return data || [];
    } catch {
      return [];
    }
  }

  // Digital Signature Management
  async createDigitalSignature(
    professionalId: string,
    documentHash: string,
    documentType: DigitalSignature["document_type"],
    documentReference: string,
  ): Promise<DigitalSignature | null> {
    try {
      // Validate professional can sign documents
      const professional = await this.supabase
        .from("medical_professionals")
        .select("*")
        .eq("id", professionalId)
        .single();

      if (!professional.data?.digital_signature_cert) {
        throw new Error("Professional not certified for digital signatures");
      }

      // Generate signature hash (simplified - real implementation would use proper PKI)
      const signatureData = `${documentHash}:${professionalId}:${new Date().toISOString()}`;
      const signatureHash = crypto
        .createHash("sha256")
        .update(signatureData)
        .digest("hex");

      const signature: Omit<DigitalSignature, "id"> = {
        professional_id: professionalId,
        document_hash: documentHash,
        signature_hash: signatureHash,
        certificate_thumbprint: professional.data.digital_signature_cert,
        timestamp: new Date(),
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
        throw error;
      }

      // Log compliance action
      await this.logComplianceAction(
        "digital_signature_created",
        `Document: ${documentReference}`,
        data.id,
      );

      return data;
    } catch {
      return;
    }
  }

  async validateDigitalSignature(signatureId: string): Promise<boolean> {
    try {
      const { data: signature, error } = await this.supabase
        .from("digital_signatures")
        .select("*")
        .eq("id", signatureId)
        .single();

      if (error || !signature) {
        return false;
      }

      // Validate signature integrity (simplified validation)
      const expectedSignatureData =
        `${signature.document_hash}:${signature.professional_id}:${signature.timestamp}`;
      const expectedHash = crypto
        .createHash("sha256")
        .update(expectedSignatureData)
        .digest("hex");

      const isValid = signature.signature_hash === expectedHash && signature.is_valid;

      if (isValid !== signature.is_valid) {
        // Update validation status
        await this.supabase
          .from("digital_signatures")
          .update({
            is_valid: isValid,
            validation_timestamp: new Date(),
          })
          .eq("id", signatureId);
      }

      return isValid;
    } catch {
      return false;
    }
  }

  // Telemedicine Compliance
  async startTelemedicineSession(
    session: Omit<TelemedicineSession, "id" | "created_at">,
  ): Promise<TelemedicineSession | null> {
    try {
      // Validate professional is certified for telemedicine
      const { data: professional, error: profError } = await this.supabase
        .from("medical_professionals")
        .select("telemedicine_certified, license_status")
        .eq("id", session.professional_id)
        .single();

      if (
        profError
        || !professional.telemedicine_certified
        || professional.license_status !== "active"
      ) {
        throw new Error("Professional not certified for telemedicine");
      }

      // Validate CFM compliance requirements
      const cfmCompliance = await this.validateTelemedicineCompliance(session);

      const sessionData = {
        ...session,
        cfm_compliance_validated: cfmCompliance,
      };

      const { data, error } = await this.supabase
        .from("telemedicine_sessions")
        .insert(sessionData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Log compliance action
      await this.logComplianceAction(
        "telemedicine_session_started",
        `Session type: ${session.session_type}`,
        data.id,
      );

      return data;
    } catch {
      return;
    }
  }

  private async validateTelemedicineCompliance(
    session: Partial<TelemedicineSession>,
  ): Promise<boolean> {
    try {
      // CFM Resolution 2314/2022 requirements
      const requirements = {
        // Patient must have provided informed consent
        hasInformedConsent: session.recording_consent !== undefined,
        // Platform must be secure and compliant
        usesCertifiedPlatform: this.isCertifiedTelemedicinePlatform(
          session.platform_used || "",
        ),
        // Professional must have appropriate qualifications
        professionalQualified: true, // Already validated above
        // Session must be properly documented
        hasProperDocumentation: session.consultation_notes && session.consultation_notes.length > 0,
      };

      return Object.values(requirements).every((req) => req === true);
    } catch {
      return false;
    }
  }

  private isCertifiedTelemedicinePlatform(platform: string): boolean {
    // List of CFM-approved telemedicine platforms
    const approvedPlatforms = [
      "telemedicina-cfm",
      "medcloud",
      "conexa-saude",
      "teleconsulta-brasil",
    ];

    return approvedPlatforms.includes(platform.toLowerCase());
  }

  async endTelemedicineSession(
    sessionId: string,
    consultationNotes: string,
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("telemedicine_sessions")
        .update({
          end_time: new Date(),
          consultation_notes: consultationNotes,
        })
        .eq("id", sessionId);

      if (error) {
        throw error;
      }

      // Log compliance action
      await this.logComplianceAction(
        "telemedicine_session_ended",
        "Session completed",
        sessionId,
      );

      return true;
    } catch {
      return false;
    }
  }

  // Continuing Education Management
  async recordContinuingEducation(
    education: Omit<ContinuingEducation, "id">,
  ): Promise<ContinuingEducation | null> {
    try {
      const { data, error } = await this.supabase
        .from("continuing_education")
        .insert(education)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update professional's total hours
      await this.updateProfessionalEducationHours(
        education.professional_id,
        education.hours,
      );

      // Log compliance action
      await this.logComplianceAction(
        "continuing_education_recorded",
        `Course: ${education.course_name}`,
        data.id,
      );

      return data;
    } catch {
      return;
    }
  }

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

      if (fetchError) {
        throw fetchError;
      }

      const updatedHours = professional.continuing_education_hours + additionalHours;

      const { error: updateError } = await this.supabase
        .from("medical_professionals")
        .update({ continuing_education_hours: updatedHours })
        .eq("id", professionalId);

      if (updateError) {
        throw updateError;
      }
    } catch {}
  }

  async validateContinuingEducationRequirements(
    professionalId: string,
  ): Promise<boolean> {
    try {
      const { data: professional, error } = await this.supabase
        .from("medical_professionals")
        .select("continuing_education_hours, created_at")
        .eq("id", professionalId)
        .single();

      if (error || !professional) {
        return false;
      }

      // CFM requires minimum continuing education hours per period
      const minimumHoursPerYear = 100;
      const yearsActive = Math.ceil(
        (Date.now() - new Date(professional.created_at).getTime())
          / (1000 * 60 * 60 * 24 * 365),
      );
      const requiredHours = minimumHoursPerYear * yearsActive;

      return professional.continuing_education_hours >= requiredHours;
    } catch {
      return false;
    }
  }

  // Compliance Reporting
  async generateCFMComplianceReport(
    startDate: Date,
    endDate: Date,
  ): Promise<unknown> {
    try {
      const [professionals, signatures, sessions, education] = await Promise.all([
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

      const expiringLicenses = await this.getExpiringLicenses();

      return {
        period: {
          start: startDate,
          end: endDate,
        },
        professionals: {
          total: professionals.data?.length || 0,
          active: professionals.data?.filter(
            (p: unknown) => p.license_status === "active",
          ).length || 0,
          telemedicine_certified: professionals.data?.filter((p: unknown) =>
            p.telemedicine_certified
          )
            .length || 0,
          digital_signature_enabled: professionals.data?.filter((p: unknown) =>
            p.digital_signature_cert
          )
            .length || 0,
          licenses_expiring: expiringLicenses.length,
        },
        digital_signatures: {
          total: signatures.data?.length || 0,
          valid: signatures.data?.filter((s: unknown) => s.is_valid).length || 0,
          by_document_type: {
            prescription: signatures.data?.filter(
              (s: unknown) => s.document_type === "prescription",
            ).length || 0,
            medical_certificate: signatures.data?.filter(
              (s: unknown) => s.document_type === "medical_certificate",
            ).length || 0,
            treatment_plan: signatures.data?.filter(
              (s: unknown) => s.document_type === "treatment_plan",
            ).length || 0,
            consultation_report: signatures.data?.filter(
              (s: unknown) => s.document_type === "consultation_report",
            ).length || 0,
          },
        },
        telemedicine: {
          total_sessions: sessions.data?.length || 0,
          compliant_sessions: sessions.data?.filter((s: unknown) => s.cfm_compliance_validated)
            .length || 0,
          by_session_type: {
            consultation: sessions.data?.filter(
              (s: unknown) => s.session_type === "consultation",
            ).length || 0,
            follow_up: sessions.data?.filter((s: unknown) => s.session_type === "follow_up")
              .length || 0,
            second_opinion: sessions.data?.filter(
              (s: unknown) => s.session_type === "second_opinion",
            ).length || 0,
            emergency: sessions.data?.filter((s: unknown) => s.session_type === "emergency")
              .length || 0,
          },
        },
        continuing_education: {
          total_courses: education.data?.length || 0,
          total_hours: education.data?.reduce(
            (sum: number, course: unknown) => sum + course.hours,
            0,
          ) || 0,
          cfm_recognized: education.data?.filter((e: unknown) => e.cfm_recognized).length || 0,
        },
        compliance_score: this.calculateCFMComplianceScore(
          professionals.data,
          signatures.data,
          sessions.data,
          expiringLicenses,
        ),
      };
    } catch {
      return;
    }
  }

  private calculateCFMComplianceScore(
    professionals: unknown[],
    signatures: unknown[],
    sessions: unknown[],
    expiringLicenses: unknown[],
  ): number {
    let score = 100;

    // Deduct points for compliance issues
    const inactiveProfessionals = professionals?.filter((p) => p.license_status !== "active").length
      || 0;
    const invalidSignatures = signatures?.filter((s) => !s.is_valid).length || 0;
    const nonCompliantSessions = sessions?.filter((s) => !s.cfm_compliance_validated).length || 0;

    score -= inactiveProfessionals * 10;
    score -= invalidSignatures * 5;
    score -= nonCompliantSessions * 8;
    score -= expiringLicenses.length * 3;

    return Math.max(0, Math.min(100, score));
  }

  private async logComplianceAction(
    action: string,
    description: string,
    referenceId: string,
  ): Promise<void> {
    try {
      await this.supabase.from("compliance_logs").insert({
        action,
        description,
        reference_id: referenceId,
        module: "cfm",
        timestamp: new Date().toISOString(),
      });
    } catch {}
  }
}
