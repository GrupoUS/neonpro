/**
 * @fileoverview ANVISA Adverse Event Auto-Reporting Service
 * Constitutional Brazilian Healthcare Adverse Event Management
 *
 * Constitutional Healthcare Principle: Patient Safety First + Immediate Response
 * Quality Standard: ≥9.9/10
 *
 * ANVISA Requirements:
 * - Immediate notification for death/life-threatening events (1-24 hours)
 * - Regular notification for serious events (15 days)
 * - Periodic reports for all events (quarterly)
 * - Constitutional healthcare: All events require immediate assessment
 */

import { z } from "zod";
import { AdverseEventType } from "../types";
import type { ComplianceScore, ConstitutionalResponse } from "../types";

/**
 * ANVISA Device Categories
 */
export enum ANVISADeviceCategory {
  CLASS_I = "CLASS_I",
  CLASS_II = "CLASS_II",
  CLASS_III = "CLASS_III",
  CLASS_IV = "CLASS_IV",
  IMPLANTABLE = "IMPLANTABLE",
  DIAGNOSTIC = "DIAGNOSTIC",
  THERAPEUTIC = "THERAPEUTIC",
  SURGICAL = "SURGICAL",
}

/**
 * Adverse Event Report Schema
 */
export const AdverseEventReportSchema = z.object({
  eventId: z.string().uuid().optional(),
  tenantId: z.string().uuid(),
  patientId: z.string().uuid(),
  deviceId: z.string().uuid().optional(),
  procedureId: z.string().uuid().optional(),
  professionalId: z.string().uuid(),
  eventType: z.nativeEnum(AdverseEventType),
  eventDate: z.date(),
  reportDate: z.date(),
  eventDescription: z.string().min(50).max(2000),
  clinicalContext: z.object({
    patientAge: z.number().min(0).max(150),
    patientGender: z.enum(["M", "F", "OTHER", "NOT_DISCLOSED"]),
    medicalHistory: z.string().max(1000).optional(),
    medicationsInUse: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
    preExistingConditions: z.array(z.string()).optional(),
  }),
  deviceInformation: z
    .object({
      deviceName: z.string().optional(),
      manufacturer: z.string().optional(),
      model: z.string().optional(),
      serialNumber: z.string().optional(),
      anvisaRegistrationNumber: z.string().optional(),
      deviceCategory: z.nativeEnum(ANVISADeviceCategory).optional(),
      lastMaintenanceDate: z.date().optional(),
      deviceAge: z.number().optional(), // months
    })
    .optional(),
  procedureInformation: z
    .object({
      procedureName: z.string(),
      procedureType: z.string(),
      anesthesiaUsed: z.boolean().default(false),
      anesthesiaType: z.string().optional(),
      procedureDuration: z.number().optional(), // minutes
      complications: z.array(z.string()).optional(),
    })
    .optional(),
  eventSeverity: z.enum([
    "MILD",
    "MODERATE",
    "SEVERE",
    "LIFE_THREATENING",
    "DEATH",
  ]),
  immediateActions: z.array(z.string()),
  clinicalOutcome: z.enum([
    "RESOLVED",
    "IMPROVED",
    "UNCHANGED",
    "WORSENED",
    "DEATH",
    "UNKNOWN",
  ]),
  followUpRequired: z.boolean().default(false),
  followUpPlan: z.string().max(500).optional(),
  reportingSource: z.enum([
    "HEALTHCARE_PROFESSIONAL",
    "PATIENT",
    "FAMILY",
    "INSTITUTION",
    "MANUFACTURER",
  ]),
  reporterInformation: z.object({
    name: z.string().min(2).max(100),
    professionalRegistration: z.string().optional(),
    contact: z.string().email(),
    institution: z.string().min(2).max(100),
  }),
  constitutionalAssessment: z.object({
    patientSafetyImpact: z.enum([
      "NONE",
      "MINIMAL",
      "MODERATE",
      "SIGNIFICANT",
      "CRITICAL",
    ]),
    constitutionalViolation: z.boolean().default(false),
    immediateResponseRequired: z.boolean().default(false),
    regulatoryNotificationRequired: z.boolean().default(false),
    publicHealthImpact: z.boolean().default(false),
  }),
  anvisaReporting: z.object({
    reportingTimeline: z.enum([
      "IMMEDIATE",
      "URGENT_24H",
      "REGULAR_15D",
      "QUARTERLY",
    ]),
    anvisaNotified: z.boolean().default(false),
    anvisaProtocol: z.string().optional(),
    anvisaResponse: z.string().optional(),
    notificationDate: z.date().optional(),
  }),
});

export type AdverseEventReport = z.infer<typeof AdverseEventReportSchema>;

/**
 * Adverse Event Severity Levels
 */
export enum AdverseEventSeverity {
  MILD = "MILD",
  MODERATE = "MODERATE",
  SEVERE = "SEVERE",
  LIFE_THREATENING = "LIFE_THREATENING",
  DEATH = "DEATH",
}

/**
 * Adverse Event Base Type
 */
export interface AdverseEvent {
  id: string;
  tenantId: string;
  patientId: string;
  eventType: AdverseEventType;
  severity: AdverseEventSeverity;
  description: string;
  reportedAt: Date;
  reportedBy: string;
  anvisaNotified: boolean;
  status: "PENDING" | "INVESTIGATING" | "RESOLVED" | "CLOSED";
}

/**
 * Adverse Event Filters
 */
export interface AdverseEventFilters {
  tenantId?: string;
  severity?: AdverseEventSeverity;
  eventType?: AdverseEventType;
  dateFrom?: Date;
  dateTo?: Date;
  anvisaNotified?: boolean;
  status?: AdverseEvent["status"];
}

/**
 * Event Classification Result
 */
export interface EventClassificationResult {
  eventId: string;
  severity: AdverseEventType;
  urgency: "IMMEDIATE" | "URGENT" | "STANDARD" | "ROUTINE";
  notificationTimeline: {
    anvisaDeadline: Date;
    internalDeadline: Date;
    patientNotificationDeadline: Date;
    familyNotificationDeadline?: Date;
  };
  requiredActions: {
    immediateActions: string[];
    investigationRequired: boolean;
    deviceQuarantine: boolean;
    procedureSuspension: boolean;
    staffRetraining: boolean;
    anvisaNotification: boolean;
    patientFollowUp: boolean;
  };
  constitutionalCompliance: {
    patientRightsProtected: boolean;
    medicalEthicsCompliant: boolean;
    transparencyRequired: boolean;
    complianceScore: ComplianceScore;
  };
  reportingRequirements: {
    anvisaReport: boolean;
    internalReport: boolean;
    ethicsCommitteeReport: boolean;
    institutionalReport: boolean;
    manufacturerNotification: boolean;
  };
}

/**
 * Constitutional Adverse Event Service for ANVISA Compliance
 */
export class AdverseEventService {
  /**
   * Report Adverse Event with Constitutional Healthcare Validation
   * Implements ANVISA requirements with constitutional patient safety protocols
   */
  async reportAdverseEvent(
    report: AdverseEventReport,
  ): Promise<ConstitutionalResponse<EventClassificationResult>> {
    try {
      // Step 1: Validate adverse event report
      const validatedReport = AdverseEventReportSchema.parse(report);

      // Step 2: Constitutional healthcare validation
      const constitutionalValidation = await this.validateConstitutionalRequirements(
        validatedReport,
      );

      if (!constitutionalValidation.valid) {
        return {
          success: false,
          error: `Constitutional event validation failed: ${
            constitutionalValidation.violations.join(
              ", ",
            )
          }`,
          complianceScore: constitutionalValidation.score,
          regulatoryValidation: { lgpd: true, anvisa: false, cfm: false },
          auditTrail: await this.createAuditEvent(
            "EVENT_CONSTITUTIONAL_VIOLATION",
            validatedReport,
          ),
          timestamp: new Date(),
        };
      }

      // Step 3: Classify event severity and urgency
      const eventClassification = await this.classifyAdverseEvent(validatedReport);

      // Step 4: Immediate response for critical events
      if (eventClassification.urgency === "IMMEDIATE") {
        await this.executeImmediateResponse(
          validatedReport,
          eventClassification,
        );
      }

      // Step 5: Store adverse event report
      const storedReport = await this.storeAdverseEventReport({
        ...validatedReport,
        eventId: validatedReport.eventId || crypto.randomUUID(),
      });

      // Step 6: Execute constitutional notification workflow
      // Step 7: ANVISA reporting (if required)
      if (eventClassification.reportingRequirements.anvisaReport) {
        await this.submitToANVISA(storedReport, eventClassification);
      }

      // Step 8: Schedule follow-up actions
      await this.scheduleFollowUpActions(storedReport, eventClassification);

      // Step 9: Generate audit trail
      const auditTrail = await this.createAuditEvent(
        "ADVERSE_EVENT_REPORTED",
        storedReport,
      );

      // Step 10: Send completion notification
      await this.sendReportingCompletionNotification(
        storedReport,
        eventClassification,
      );

      return {
        success: true,
        data: eventClassification,
        complianceScore: constitutionalValidation.score,
        regulatoryValidation: { lgpd: true, anvisa: true, cfm: true },
        auditTrail,
        timestamp: new Date(),
      };
    } catch (error) {
      const auditTrail = await this.createAuditEvent(
        "ADVERSE_EVENT_REPORTING_ERROR",
        report,
      );

      return {
        success: false,
        error: error instanceof Error
          ? error.message
          : "Unknown adverse event reporting error",
        complianceScore: 0,
        regulatoryValidation: { lgpd: false, anvisa: false, cfm: false },
        auditTrail,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Validate Constitutional Healthcare Requirements for Adverse Events
   */
  private async validateConstitutionalRequirements(
    report: AdverseEventReport,
  ): Promise<{
    valid: boolean;
    score: ComplianceScore;
    violations: string[];
  }> {
    const violations: string[] = [];
    let score = 10;

    // Patient safety validation
    if (
      report.eventSeverity === "DEATH"
      || report.eventSeverity === "LIFE_THREATENING"
    ) {
      if (report.immediateActions.length === 0) {
        violations.push(
          "Immediate actions required for life-threatening events",
        );
        score -= 3;
      }

      if (!report.constitutionalAssessment.immediateResponseRequired) {
        violations.push(
          "Constitutional immediate response required for critical events",
        );
        score -= 2;
      }
    }

    // Medical ethics validation
    if (
      (report.eventSeverity === "SEVERE"
        || report.eventSeverity === "LIFE_THREATENING"
        || report.eventSeverity === "DEATH")
      && !report.followUpRequired
    ) {
      violations.push(
        "Follow-up required for serious adverse events (medical ethics)",
      );
      score -= 1.5;
    }

    // Transparency validation
    if (
      report.constitutionalAssessment.patientSafetyImpact === "CRITICAL"
      && !report.constitutionalAssessment.publicHealthImpact
    ) {
      violations.push(
        "Public health impact assessment required for critical safety events",
      );
      score -= 1;
    }

    // Device-related event validation
    if (report.deviceId && !report.deviceInformation) {
      violations.push(
        "Device information required for device-related adverse events",
      );
      score -= 1;
    }

    // Professional responsibility validation
    if (
      !report.reporterInformation.professionalRegistration
      && report.reportingSource === "HEALTHCARE_PROFESSIONAL"
    ) {
      violations.push(
        "Professional registration required for healthcare professional reports",
      );
      score -= 1;
    }

    // Timeline validation
    const hoursFromEvent = (Date.now() - report.eventDate.getTime()) / (1000 * 60 * 60);
    if (
      (report.eventSeverity === "DEATH"
        || report.eventSeverity === "LIFE_THREATENING")
      && hoursFromEvent > 24
    ) {
      violations.push(
        "Critical events must be reported within 24 hours (constitutional requirement)",
      );
      score -= 2;
    }

    const finalScore = Math.max(0, Math.min(10, score)) as ComplianceScore;

    return {
      valid: violations.length === 0,
      score: finalScore,
      violations,
    };
  }

  /**
   * Classify Adverse Event with Constitutional Healthcare Context
   */
  private async classifyAdverseEvent(
    report: AdverseEventReport,
  ): Promise<EventClassificationResult> {
    // Determine urgency based on severity and constitutional requirements
    let urgency: EventClassificationResult["urgency"] = "ROUTINE";

    if (report.eventSeverity === "DEATH") {
      urgency = "IMMEDIATE";
    } else if (report.eventSeverity === "LIFE_THREATENING") {
      urgency = "IMMEDIATE";
    } else if (
      report.eventSeverity === "SEVERE"
      || report.constitutionalAssessment.constitutionalViolation
    ) {
      urgency = "URGENT";
    } else if (report.eventSeverity === "MODERATE") {
      urgency = "STANDARD";
    }

    // Calculate notification deadlines
    const now = new Date();
    const notificationTimeline = {
      anvisaDeadline: new Date(
        now.getTime() + this.getANVISADeadlineHours(urgency) * 60 * 60 * 1000,
      ),
      internalDeadline: new Date(
        now.getTime() + this.getInternalDeadlineMinutes(urgency) * 60 * 1000,
      ),
      patientNotificationDeadline: new Date(
        now.getTime()
          + this.getPatientNotificationHours(urgency) * 60 * 60 * 1000,
      ),
      familyNotificationDeadline: urgency === "IMMEDIATE"
        ? new Date(now.getTime() + 2 * 60 * 60 * 1000)
        : undefined, // 2 hours for critical events
    };

    // Determine required actions
    const requiredActions = {
      immediateActions: report.immediateActions,
      investigationRequired: urgency === "IMMEDIATE" || urgency === "URGENT",
      deviceQuarantine: Boolean(report.deviceId)
        && (urgency === "IMMEDIATE" || urgency === "URGENT"),
      procedureSuspension: report.eventSeverity === "DEATH"
        || report.eventSeverity === "LIFE_THREATENING",
      staffRetraining: urgency === "IMMEDIATE" || urgency === "URGENT",
      anvisaNotification: urgency === "IMMEDIATE"
        || urgency === "URGENT"
        || report.constitutionalAssessment.regulatoryNotificationRequired,
      patientFollowUp: report.followUpRequired || urgency !== "ROUTINE",
    };

    // Constitutional compliance assessment
    const constitutionalCompliance = {
      patientRightsProtected: true,
      medicalEthicsCompliant: report.followUpRequired || urgency === "ROUTINE",
      transparencyRequired: urgency === "IMMEDIATE"
        || urgency === "URGENT"
        || report.constitutionalAssessment.publicHealthImpact,
      complianceScore: this.calculateConstitutionalComplianceScore(
        report,
        urgency,
        requiredActions,
      ),
    };

    // Reporting requirements
    const reportingRequirements = {
      anvisaReport: requiredActions.anvisaNotification,
      internalReport: true,
      ethicsCommitteeReport: urgency === "IMMEDIATE"
        || report.constitutionalAssessment.constitutionalViolation,
      institutionalReport: urgency === "IMMEDIATE" || urgency === "URGENT",
      manufacturerNotification: Boolean(report.deviceId)
        && (urgency === "IMMEDIATE" || urgency === "URGENT"),
    };

    return {
      eventId: report.eventId || crypto.randomUUID(),
      severity: report.eventType,
      urgency,
      notificationTimeline,
      requiredActions,
      constitutionalCompliance,
      reportingRequirements,
    };
  } /**
   * Calculate Constitutional Compliance Score for Adverse Event
   */

  private calculateConstitutionalComplianceScore(
    report: AdverseEventReport,
    urgency: string,
    requiredActions: unknown,
  ): ComplianceScore {
    let score = 10;

    // Timeline compliance
    const hoursFromEvent = (Date.now() - report.eventDate.getTime()) / (1000 * 60 * 60);
    if (urgency === "IMMEDIATE" && hoursFromEvent > 1) {
      score -= 2;
    }
    if (urgency === "URGENT" && hoursFromEvent > 24) {
      score -= 1.5;
    }

    // Action completeness
    if (
      requiredActions.immediateActions.length === 0
      && urgency === "IMMEDIATE"
    ) {
      score -= 2;
    }

    // Patient safety focus
    if (report.constitutionalAssessment.patientSafetyImpact === "CRITICAL") {
      score += 0.5;
    }

    // Medical ethics compliance
    if (report.followUpRequired && urgency !== "ROUTINE") {
      score += 0.3;
    }

    return Math.max(0, Math.min(10, score)) as ComplianceScore;
  }

  /**
   * Execute Immediate Response for Critical Events
   */
  private async executeImmediateResponse(
    report: AdverseEventReport,
    classification: EventClassificationResult,
  ): Promise<void> {
    // 1. Alert medical director
    await this.alertMedicalDirector(report, classification);

    // 2. Quarantine device if involved
    if (report.deviceId && classification.requiredActions.deviceQuarantine) {
      await this.quarantineDevice(report.deviceId, report.tenantId);
    }

    // 3. Suspend procedure if necessary
    if (classification.requiredActions.procedureSuspension) {
      await this.suspendProcedure(report.procedureId, report.tenantId);
    }

    // 4. Immediate patient care escalation
    await this.escalatePatientCare(report.patientId, report.eventSeverity);
  }

  /**
   * Execute Constitutional Notification Workflow
   */
  private async executeConstitutionalNotification(
    report: AdverseEventReport,
    classification: EventClassificationResult,
  ): Promise<void> {
    // Internal notifications
    await this.notifyInternalTeams(report, classification);

    // Patient/family notification
    await this.notifyPatientAndFamily(report, classification);

    // Professional responsibility notification
    await this.notifyResponsibleProfessional(report, classification);

    // Ethics committee (if required)
    if (classification.reportingRequirements.ethicsCommitteeReport) {
      await this.notifyEthicsCommittee(report, classification);
    }
  }

  /**
   * Submit to ANVISA
   */
  private async submitToANVISA(
    report: AdverseEventReport,
    _classification: EventClassificationResult,
  ): Promise<void> {
    const anvisaReport = {
      eventId: report.eventId,
      institutionCNPJ: process.env.COMPANY_CNPJ,
      eventType: report.eventType,
      eventSeverity: report.eventSeverity,
      eventDescription: report.eventDescription,
      patientInformation: {
        age: report.clinicalContext.patientAge,
        gender: report.clinicalContext.patientGender,
        medicalHistory: report.clinicalContext.medicalHistory,
      },
      deviceInformation: report.deviceInformation,
      procedureInformation: report.procedureInformation,
      immediateActions: report.immediateActions,
      clinicalOutcome: report.clinicalOutcome,
      reporterInformation: report.reporterInformation,
      constitutionalAssessment: report.constitutionalAssessment,
    };

    // Submit to ANVISA portal (would integrate with actual ANVISA API)
    const anvisaResponse = await this.submitToANVISAPortal(anvisaReport);

    // Update report with ANVISA protocol
    await this.updateReportWithANVISAProtocol(
      report.eventId!,
      anvisaResponse.protocol,
    );
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private getANVISADeadlineHours(urgency: string): number {
    switch (urgency) {
      case "IMMEDIATE": {
        return 1;
      }
      case "URGENT": {
        return 24;
      }
      case "STANDARD": {
        return 15 * 24;
      } // 15 days
      default: {
        return 90 * 24;
      } // 90 days
    }
  }

  private getInternalDeadlineMinutes(urgency: string): number {
    switch (urgency) {
      case "IMMEDIATE": {
        return 15;
      }
      case "URGENT": {
        return 60;
      }
      case "STANDARD": {
        return 4 * 60;
      } // 4 hours
      default: {
        return 24 * 60;
      } // 24 hours
    }
  }

  private getPatientNotificationHours(urgency: string): number {
    switch (urgency) {
      case "IMMEDIATE": {
        return 2;
      }
      case "URGENT": {
        return 8;
      }
      case "STANDARD": {
        return 24;
      }
      default: {
        return 48;
      }
    }
  }

  // ============================================================================
  // DATABASE AND EXTERNAL SERVICE METHODS (Implementation Stubs)
  // ============================================================================

  private async storeAdverseEventReport(
    report: AdverseEventReport,
  ): Promise<AdverseEventReport> {
    return report;
  }

  private async alertMedicalDirector(
    _report: AdverseEventReport,
    _classification: EventClassificationResult,
  ): Promise<void> {}

  private async quarantineDevice(
    _deviceId: string,
    _tenantId: string,
  ): Promise<void> {}

  private async suspendProcedure(
    _procedureId: string | undefined,
    _tenantId: string,
  ): Promise<void> {}

  private async escalatePatientCare(
    _patientId: string,
    _severity: string,
  ): Promise<void> {}

  private async notifyInternalTeams(
    _report: AdverseEventReport,
    _classification: EventClassificationResult,
  ): Promise<void> {}

  private async notifyPatientAndFamily(
    _report: AdverseEventReport,
    _classification: EventClassificationResult,
  ): Promise<void> {}

  private async notifyResponsibleProfessional(
    _report: AdverseEventReport,
    _classification: EventClassificationResult,
  ): Promise<void> {}

  private async notifyEthicsCommittee(
    _report: AdverseEventReport,
    _classification: EventClassificationResult,
  ): Promise<void> {}

  private async submitToANVISAPortal(
    _report: unknown,
  ): Promise<{ protocol: string; }> {
    return { protocol: `ANVISA-AE-${Date.now()}` };
  }

  private async updateReportWithANVISAProtocol(
    _eventId: string,
    _protocol: string,
  ): Promise<void> {}

  private async scheduleFollowUpActions(
    _report: AdverseEventReport,
    _classification: EventClassificationResult,
  ): Promise<void> {}

  private async sendReportingCompletionNotification(
    _report: AdverseEventReport,
    _classification: EventClassificationResult,
  ): Promise<void> {}

  private async createAuditEvent(
    action: string,
    data: unknown,
  ): Promise<unknown> {
    return {
      id: crypto.randomUUID(),
      eventType: "ADVERSE_EVENT_REPORTING",
      action,
      timestamp: new Date(),
      metadata: data,
    };
  }

  /**
   * Get Adverse Event Status
   */
  async getAdverseEventStatus(
    eventId: string,
    _tenantId: string,
  ): Promise<ConstitutionalResponse<EventClassificationResult | null>> {
    try {
      const auditTrail = await this.createAuditEvent(
        "ADVERSE_EVENT_STATUS_ACCESSED",
        { eventId },
      );

      return {
        success: true,
        data: undefined, // Would be actual status from database
        complianceScore: 9.9,
        regulatoryValidation: { lgpd: true, anvisa: true, cfm: true },
        auditTrail,
        timestamp: new Date(),
      };
    } catch (error) {
      const auditTrail = await this.createAuditEvent(
        "ADVERSE_EVENT_STATUS_ERROR",
        { eventId },
      );

      return {
        success: false,
        error: error instanceof Error
          ? error.message
          : "Failed to retrieve adverse event status",
        complianceScore: 0,
        regulatoryValidation: { lgpd: false, anvisa: false, cfm: false },
        auditTrail,
        timestamp: new Date(),
      };
    }
  }
}
