/**
 * Automated Regulatory Reporting Service
 * Generates ANVISA, CFM, and LGPD compliance reports automatically
 */

import { supabase } from "@/lib/supabase/client";

export interface RegulatoryReport {
  id?: string;
  tenant_id: string;
  report_type:
    | "anvisa_quarterly"
    | "cfm_annual"
    | "lgpd_compliance"
    | "data_breach_notification";
  period_start: string;
  period_end: string;
  report_data: Record<string, unknown>;
  status: "generated" | "submitted" | "acknowledged" | "rejected";
  submitted_at?: string;
  acknowledgment_receipt?: string;
  created_at?: string;
}

export interface ANVISAReport {
  equipment_registrations: number;
  adverse_events: number;
  quality_incidents: number;
  professional_certifications: number;
  product_registrations: {
    product_name: string;
    registration_number: string;
    expiry_date: string;
    status: "active" | "expired" | "suspended";
  }[];
  compliance_score: number;
}

export interface CFMReport {
  medical_procedures: number;
  telemedicine_sessions: number;
  professional_licenses: {
    professional_name: string;
    crm_number: string;
    specialty: string;
    license_expiry: string;
    status: "active" | "suspended" | "expired";
  }[];
  ethical_violations: number;
  continuing_education_hours: number;
  compliance_score: number;
}

export interface LGPDReport {
  data_processing_activities: number;
  consent_requests: number;
  consent_granted: number;
  consent_withdrawn: number;
  data_subject_requests: number;
  data_retention_policies: number;
  security_incidents: number;
  breach_notifications: number;
  compliance_score: number;
}

export class RegulatoryReportingService {
  /**
   * Generate ANVISA Quarterly Report
   */
  async generateANVISAReport(
    tenantId: string,
    periodStart: string,
    periodEnd: string,
  ): Promise<{ report?: RegulatoryReport; error?: string; }> {
    try {
      // Collect ANVISA compliance data
      const [equipmentData, adverseEvents, qualityData, professionalsData] = await Promise.all([
        this.getEquipmentRegistrations(tenantId, periodStart, periodEnd),
        this.getAdverseEvents(tenantId, periodStart, periodEnd),
        this.getQualityIncidents(tenantId, periodStart, periodEnd),
        this.getProfessionalCertifications(tenantId),
      ]);

      const reportData: ANVISAReport = {
        equipment_registrations: equipmentData.length,
        adverse_events: adverseEvents.length,
        quality_incidents: qualityData.length,
        professional_certifications: professionalsData.length,
        product_registrations: equipmentData.map((eq) => ({
          product_name: eq.equipment_name,
          registration_number: eq.anvisa_registration,
          expiry_date: eq.certification_expiry,
          status: new Date(eq.certification_expiry) > new Date()
            ? "active"
            : "expired",
        })),
        compliance_score: this.calculateANVISAScore(
          equipmentData,
          adverseEvents,
          qualityData,
        ),
      };

      // Store report
      const { data, error } = await supabase
        .from("regulatory_reports")
        .insert({
          tenant_id: tenantId,
          report_type: "anvisa_quarterly",
          period_start: periodStart,
          period_end: periodEnd,
          report_data: reportData,
          status: "generated",
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      // Auto-submit if compliance score is high
      if (reportData.compliance_score >= 95) {
        await this.submitReport(data.id, "anvisa");
      }

      return { report: data };
    } catch (error) {
      return {
        error: error instanceof Error
          ? error.message
          : "Failed to generate ANVISA report",
      };
    }
  }

  /**
   * Generate CFM Annual Compliance Report
   */
  async generateCFMReport(
    tenantId: string,
    periodStart: string,
    periodEnd: string,
  ): Promise<{ report?: RegulatoryReport; error?: string; }> {
    try {
      const [
        proceduresData,
        telemedicineData,
        licensesData,
        ethicsData,
        educationData,
      ] = await Promise.all([
        this.getMedicalProcedures(tenantId, periodStart, periodEnd),
        this.getTelemedicineSessions(tenantId, periodStart, periodEnd),
        this.getProfessionalLicenses(tenantId),
        this.getEthicalViolations(tenantId, periodStart, periodEnd),
        this.getContinuingEducation(tenantId, periodStart, periodEnd),
      ]);

      const reportData: CFMReport = {
        medical_procedures: proceduresData.length,
        telemedicine_sessions: telemedicineData.length,
        professional_licenses: licensesData.map((lic) => ({
          professional_name: lic.professional_name,
          crm_number: lic.crm_number,
          specialty: lic.specialty,
          license_expiry: lic.expires_at,
          status: new Date(lic.expires_at) > new Date() ? "active" : "expired",
        })),
        ethical_violations: ethicsData.length,
        continuing_education_hours: educationData.reduce(
          (sum: number, edu: unknown) => sum + edu.hours,
          0,
        ),
        compliance_score: this.calculateCFMScore(
          proceduresData,
          ethicsData,
          educationData,
          licensesData,
        ),
      };

      const { data, error } = await supabase
        .from("regulatory_reports")
        .insert({
          tenant_id: tenantId,
          report_type: "cfm_annual",
          period_start: periodStart,
          period_end: periodEnd,
          report_data: reportData,
          status: "generated",
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      if (reportData.compliance_score >= 95) {
        await this.submitReport(data.id, "cfm");
      }

      return { report: data };
    } catch (error) {
      return {
        error: error instanceof Error
          ? error.message
          : "Failed to generate CFM report",
      };
    }
  }

  /**
   * Generate LGPD Compliance Report
   */
  async generateLGPDReport(
    tenantId: string,
    periodStart: string,
    periodEnd: string,
  ): Promise<{ report?: RegulatoryReport; error?: string; }> {
    try {
      const [
        consentData,
        subjectRequests,
        retentionPolicies,
        securityIncidents,
      ] = await Promise.all([
        this.getConsentData(tenantId, periodStart, periodEnd),
        this.getDataSubjectRequests(tenantId, periodStart, periodEnd),
        this.getDataRetentionPolicies(tenantId),
        this.getSecurityIncidents(tenantId, periodStart, periodEnd),
      ]);

      const reportData: LGPDReport = {
        data_processing_activities: consentData.total_activities,
        consent_requests: consentData.requests,
        consent_granted: consentData.granted,
        consent_withdrawn: consentData.withdrawn,
        data_subject_requests: subjectRequests.length,
        data_retention_policies: retentionPolicies.length,
        security_incidents: securityIncidents.length,
        breach_notifications: securityIncidents.filter(
          (i: unknown) => i.severity === "high" || i.severity === "critical",
        ).length,
        compliance_score: this.calculateLGPDScore(
          consentData,
          subjectRequests,
          securityIncidents,
        ),
      };

      const { data, error } = await supabase
        .from("regulatory_reports")
        .insert({
          tenant_id: tenantId,
          report_type: "lgpd_compliance",
          period_start: periodStart,
          period_end: periodEnd,
          report_data: reportData,
          status: "generated",
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { report: data };
    } catch (error) {
      return {
        error: error instanceof Error
          ? error.message
          : "Failed to generate LGPD report",
      };
    }
  }

  /**
   * Automated Report Scheduling
   */
  async scheduleAutomaticReports(
    tenantId: string,
  ): Promise<{ success?: boolean; error?: string; }> {
    try {
      const currentDate = new Date();
      const quarterStart = new Date(
        currentDate.getFullYear(),
        Math.floor(currentDate.getMonth() / 3) * 3,
        1,
      );
      const quarterEnd = new Date(
        quarterStart.getFullYear(),
        quarterStart.getMonth() + 3,
        0,
      );

      const yearStart = new Date(currentDate.getFullYear(), 0, 1);
      const yearEnd = new Date(currentDate.getFullYear(), 11, 31);

      // Schedule quarterly ANVISA report
      await this.generateANVISAReport(
        tenantId,
        quarterStart.toISOString(),
        quarterEnd.toISOString(),
      );

      // Schedule annual CFM report (if end of year)
      if (currentDate.getMonth() === 11) {
        await this.generateCFMReport(
          tenantId,
          yearStart.toISOString(),
          yearEnd.toISOString(),
        );
      }

      // Schedule monthly LGPD report
      const monthStart = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1,
      );
      const monthEnd = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
      );
      await this.generateLGPDReport(
        tenantId,
        monthStart.toISOString(),
        monthEnd.toISOString(),
      );

      return { success: true };
    } catch (error) {
      return {
        error: error instanceof Error
          ? error.message
          : "Failed to schedule automatic reports",
      };
    }
  }

  // Private helper methods for data collection
  private async getEquipmentRegistrations(
    tenantId: string,
    start: string,
    end: string,
  ) {
    const { data } = await supabase
      .from("medical_equipment")
      .select("*")
      .eq("tenant_id", tenantId)
      .gte("created_at", start)
      .lte("created_at", end);
    return data || [];
  }

  private async getAdverseEvents(tenantId: string, start: string, end: string) {
    const { data } = await supabase
      .from("adverse_events")
      .select("*")
      .eq("tenant_id", tenantId)
      .gte("occurred_at", start)
      .lte("occurred_at", end);
    return data || [];
  }

  private async getQualityIncidents(
    tenantId: string,
    start: string,
    end: string,
  ) {
    const { data } = await supabase
      .from("quality_incidents")
      .select("*")
      .eq("tenant_id", tenantId)
      .gte("occurred_at", start)
      .lte("occurred_at", end);
    return data || [];
  }

  private async getProfessionalCertifications(tenantId: string) {
    const { data } = await supabase
      .from("professional_certifications")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("status", "active");
    return data || [];
  }

  private async getMedicalProcedures(
    tenantId: string,
    start: string,
    end: string,
  ) {
    const { data } = await supabase
      .from("appointments")
      .select("*")
      .eq("user_id", tenantId)
      .gte("date_time", start)
      .lte("date_time", end)
      .eq("status", "completed");
    return data || [];
  }

  private async getTelemedicineSessions(
    tenantId: string,
    start: string,
    end: string,
  ) {
    const { data } = await supabase
      .from("telemedicine_sessions")
      .select("*")
      .eq("tenant_id", tenantId)
      .gte("session_date", start)
      .lte("session_date", end);
    return data || [];
  }

  private async getProfessionalLicenses(tenantId: string) {
    const { data } = await supabase
      .from("medical_licenses")
      .select("*")
      .eq("tenant_id", tenantId);
    return data || [];
  }

  private async getEthicalViolations(
    tenantId: string,
    start: string,
    end: string,
  ) {
    const { data } = await supabase
      .from("ethical_violations")
      .select("*")
      .eq("tenant_id", tenantId)
      .gte("reported_at", start)
      .lte("reported_at", end);
    return data || [];
  }

  private async getContinuingEducation(
    tenantId: string,
    start: string,
    end: string,
  ) {
    const { data } = await supabase
      .from("continuing_education")
      .select("*")
      .eq("tenant_id", tenantId)
      .gte("completed_at", start)
      .lte("completed_at", end);
    return data || [];
  }

  private async getConsentData(tenantId: string, start: string, end: string) {
    const { data } = await supabase
      .from("patient_consents")
      .select("*")
      .eq("tenant_id", tenantId)
      .gte("created_at", start)
      .lte("created_at", end);

    const consents = data || [];
    return {
      total_activities: consents.length,
      requests: consents.length,
      granted: consents.filter((c) => c.status === "active").length,
      withdrawn: consents.filter((c) => c.status === "withdrawn").length,
    };
  }

  private async getDataSubjectRequests(
    tenantId: string,
    start: string,
    end: string,
  ) {
    const { data } = await supabase
      .from("data_subject_requests")
      .select("*")
      .eq("tenant_id", tenantId)
      .gte("requested_at", start)
      .lte("requested_at", end);
    return data || [];
  }

  private async getDataRetentionPolicies(tenantId: string) {
    const { data } = await supabase
      .from("data_retention_policies")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("status", "active");
    return data || [];
  }

  private async getSecurityIncidents(
    tenantId: string,
    start: string,
    end: string,
  ) {
    const { data } = await supabase
      .from("security_events")
      .select("*")
      .eq("tenant_id", tenantId)
      .gte("timestamp", start)
      .lte("timestamp", end);
    return data || [];
  }

  // Compliance scoring algorithms
  private calculateANVISAScore(
    equipment: unknown[],
    adverse: unknown[],
    quality: unknown[],
  ): number {
    let score = 100;

    // Deduct for expired equipment registrations
    const expired = equipment.filter(
      (eq) => new Date(eq.certification_expiry) <= new Date(),
    ).length;
    score -= expired * 10;

    // Deduct for adverse events
    score -= adverse.length * 5;

    // Deduct for quality incidents
    score -= quality.length * 8;

    return Math.max(0, score);
  }

  private calculateCFMScore(
    _procedures: unknown[],
    ethics: unknown[],
    education: unknown[],
    licenses: unknown[],
  ): number {
    let score = 100;

    // Deduct for ethical violations
    score -= ethics.length * 15;

    // Deduct for expired licenses
    const expired = licenses.filter(
      (lic) => new Date(lic.expires_at) <= new Date(),
    ).length;
    score -= expired * 20;

    // Deduct for insufficient continuing education
    const totalHours = education.reduce(
      (sum: number, edu: unknown) => sum + edu.hours,
      0,
    );
    if (totalHours < 40) {
      // CFM requires 40 hours annually
      score -= (40 - totalHours) * 2;
    }

    return Math.max(0, score);
  }

  private calculateLGPDScore(
    consent: unknown,
    _requests: unknown[],
    incidents: unknown[],
  ): number {
    let score = 100;

    // Deduct for security incidents
    score -= incidents.length * 10;

    // Deduct for high-severity incidents
    const highSeverity = incidents.filter(
      (i: unknown) => i.severity === "high" || i.severity === "critical",
    ).length;
    score -= highSeverity * 20;

    // Deduct for poor consent management
    const consentRate = consent.total_activities > 0
      ? consent.granted / consent.total_activities
      : 1;
    if (consentRate < 0.8) {
      score -= (0.8 - consentRate) * 100;
    }

    return Math.max(0, score);
  }

  private async submitReport(
    reportId: string,
    authority: "anvisa" | "cfm" | "lgpd",
  ): Promise<void> {
    await supabase
      .from("regulatory_reports")
      .update({
        status: "submitted",
        submitted_at: new Date().toISOString(),
      })
      .eq("id", reportId);

    // In a real implementation, this would integrate with the regulatory authority's API
    // For now, we'll log the submission
    // console.log(`Report ${reportId} submitted to ${authority.toUpperCase()}`);
  }
}

export const regulatoryReportingService = new RegulatoryReportingService();
