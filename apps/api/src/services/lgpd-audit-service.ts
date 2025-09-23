import {
  getHealthcarePrismaClient,
  type HealthcarePrismaClient,
} from "../clients/prisma";
import { type LGPDOperationResult } from "../types/lgpd.js";
import { createHealthcareError } from "./createHealthcareError.js";

// LGPD Audit Trail Types
export const AuditAction = z.enum([
  "DATA_ACCESS",
  "DATA_CREATION",
  "DATA_UPDATE",
  "DATA_DELETION",
  "DATA_EXPORT",
  "DATA_SHARE",
  "CONSENT_GRANTED",
  "CONSENT_WITHDRAWN",
  "DATA_BREACH",
  "RIGHT_REQUEST",
  "ANONYMIZATION",
  "RETENTION_POLICY",
  "THIRD_PARTY_TRANSFER",
  "AUTOMATED_DECISION",
  "PROFILE_CREATION",
  "SENSITIVE_DATA_PROCESSING",
]);

export const AuditSeverity = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

export const DataCategory = z.enum([
  "PERSONAL",
  "SENSITIVE",
  "HEALTH",
  "GENETIC",
  "BIOMETRIC",
  "FINANCIAL",
  "IDENTIFICATION",
  "CONTACT",
  "LOCATION",
  "PROFESSIONAL",
]);

export interface AuditTrailEntry {
  id: string;
  _userId?: string;
  patientId?: string;
  action: z.infer<typeof AuditAction>;
  entityType: string;
  entityId: string;
  dataCategory: z.infer<typeof DataCategory>;
  severity: z.infer<typeof AuditSeverity>;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
  complianceReferences?: string[];
  riskLevel?: number;
  automatedDecision?: boolean;
  decisionLogic?: string;
  impactAssessment?: string;
  retentionPeriod?: number;
  createdAt: Date;
}

export interface DataSubjectRequest {
  id: string;
  patientId: string;
  requestType:
    | "ACCESS"
    | "DELETION"
    | "CORRECTION"
    | "PORTABILITY"
    | "OBJECTION";
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "REJECTED";
  description: string;
  requestData?: Record<string, any>;
  response?: string;
  processedAt?: Date;
  processedBy?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DataBreachNotification {
  id: string;
  breachId: string;
  severity: z.infer<typeof AuditSeverity>;
  affectedRecords: number;
  dataCategories: z.infer<typeof DataCategory>[];
  description: string;
  impactAssessment: string;
  mitigationActions: string[];
  affectedPatients: string[];
  notificationDate: Date;
  discoveryDate: Date;
  reportedToANPD?: boolean;
  anpdReportDate?: Date;
  status: "DETECTED" | "INVESTIGATING" | "CONTAINED" | "RESOLVED";
}

/**
 * LGPD Audit Trail Service
 * Comprehensive audit trail for LGPD compliance monitoring
 * Implements requirements from LGPD Art. 37-43
 */
export class LGPDAuditService {
  private prisma: HealthcarePrismaClient;

  constructor(prisma?: HealthcarePrismaClient) {
    this.prisma = prisma || getHealthcarePrismaClient();
  }

  /**
   * Records audit trail entry for data processing operations
   * Complies with LGPD Art. 37 (record keeping)
   */
  async recordAudit(
    entry: Omit<AuditTrailEntry, "id" | "createdAt">,
  ): Promise<LGPDOperationResult> {
    try {
      // Validate required fields
      if (!entry.entityType || !entry.entityId) {
        throw createHealthcareError(
          "INVALID_AUDIT_ENTRY",
          "Entity type and ID are required",
          { entry },
        );
      }

      // Assess risk level automatically if not provided
      const riskLevel =
        entry.riskLevel ||
        this.assessRiskLevel(entry.action, entry.dataCategory);

      // Create audit trail entry
      const auditEntry = await this.prisma.auditTrail.create({
        data: {
          _userId: entry.userId,
          action: entry.action,
          entityType: entry.entityType,
          entityId: entry.entityId,
          metadata: {
            dataCategory: entry.dataCategory,
            severity: entry.severity,
            description: entry.description,
            ipAddress: entry.ipAddress,
            userAgent: entry.userAgent,
            location: entry.location,
            sessionId: entry.sessionId,
            additionalMetadata: entry.metadata,
            complianceReferences: entry.complianceReferences,
            riskLevel,
            automatedDecision: entry.automatedDecision,
            decisionLogic: entry.decisionLogic,
            impactAssessment: entry.impactAssessment,
            retentionPeriod: entry.retentionPeriod,
            patientId: entry.patientId,
            timestamp: new Date().toISOString(),
          },
        },
      });

      // Create separate entry for patient-specific audit if patientId is provided
      if (entry.patientId) {
        await this.prisma.auditTrail.create({
          data: {
            _userId: entry.patientId,
            action: "PATIENT_DATA_OPERATION",
            entityType: "PATIENT_AUDIT",
            entityId: `${entry.entityType}_${entry.entityId}`,
            metadata: {
              originalAction: entry.action,
              originalEntityType: entry.entityType,
              originalEntityId: entry.entityId,
              dataCategory: entry.dataCategory,
              severity: entry.severity,
              description: entry.description,
              riskLevel,
              timestamp: new Date().toISOString(),
            },
          },
        });
      }

      // Check for automated decisions requiring special handling
      if (entry.automatedDecision) {
        await this.handleAutomatedDecisionAudit(auditEntry.id, entry);
      }

      return {
        success: true,
        recordsProcessed: 1,
        operationId: `audit_${auditEntry.id}`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        recordsProcessed: 0,
        operationId: `audit_error_${Date.now()}`,
        timestamp: new Date().toISOString(),
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };
    }
  }

  /**
   * Creates data subject request (LGPD Art. 18 - data subject rights)
   */
  async createDataSubjectRequest(
    patientId: string,
    requestType: DataSubjectRequest["requestType"],
    description: string,
    requestData?: Record<string, any>,
  ): Promise<LGPDOperationResult & { requestId?: string }> {
    try {
      const requestId = this.generateRequestId();

      const requestEntry = await this.prisma.auditTrail.create({
        data: {
          _userId: patientId,
          action: "DATA_SUBJECT_REQUEST",
          entityType: "RIGHT_REQUEST",
          entityId: requestId,
          metadata: {
            requestType,
            description,
            requestData,
            status: "PENDING",
            createdAt: new Date().toISOString(),
            patientId,
          },
        },
      });

      // Create audit trail for request creation
      await this.recordAudit({
        patientId,
        action: "RIGHT_REQUEST",
        entityType: "DATA_SUBJECT_RIGHTS",
        entityId: requestId,
        dataCategory: "PERSONAL",
        severity: "MEDIUM",
        description: `Data subject request created: ${requestType}`,
        metadata: {
          requestType,
          requestId,
        },
      });

      return {
        success: true,
        recordsProcessed: 1,
        operationId: `request_${requestEntry.id}`,
        timestamp: new Date().toISOString(),
        requestId,
      };
    } catch (error) {
      return {
        success: false,
        recordsProcessed: 0,
        operationId: `request_error_${Date.now()}`,
        timestamp: new Date().toISOString(),
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };
    }
  }

  /**
   * Retrieves patient audit trail for data access requests
   */
  async getPatientAuditTrail(
    patientId: string,
    options: {
      startDate?: Date;
      endDate?: Date;
      actionTypes?: z.infer<typeof AuditAction>[];
      limit?: number;
    } = {},
  ): Promise<LGPDOperationResult & { auditTrail?: AuditTrailEntry[] }> {
    try {
      const { startDate, endDate, actionTypes, limit = 100 } = options;

      const whereClause: any = {
        _userId: patientId,
        OR: [
          { action: { in: ["PATIENT_DATA_OPERATION"] } },
          { action: { notIn: ["PATIENT_DATA_OPERATION"] } },
        ],
      };

      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) whereClause.createdAt.gte = startDate;
        if (endDate) whereClause.createdAt.lte = endDate;
      }

      if (actionTypes && actionTypes.length > 0) {
        whereClause.action = { in: actionTypes };
      }

      const auditEntries = await this.prisma.auditTrail.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      const formattedEntries = auditEntries.map((entry) =>
        this.mapToAuditTrailEntry(entry),
      );

      return {
        success: true,
        recordsProcessed: formattedEntries.length,
        operationId: `audit_trail_${Date.now()}`,
        timestamp: new Date().toISOString(),
        auditTrail: formattedEntries,
      };
    } catch (error) {
      return {
        success: false,
        recordsProcessed: 0,
        operationId: `audit_trail_error_${Date.now()}`,
        timestamp: new Date().toISOString(),
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };
    }
  }

  /**
   * Records data breach notification (LGPD Art. 48)
   */
  async recordDataBreach(
    breach: Omit<DataBreachNotification, "id" | "notificationDate">,
  ): Promise<LGPDOperationResult & { breachId?: string }> {
    try {
      const breachId = breach.breachId || this.generateBreachId();
      const notificationDate = new Date();

      const breachEntry = await this.prisma.auditTrail.create({
        data: {
          action: "DATA_BREACH",
          entityType: "SECURITY_INCIDENT",
          entityId: breachId,
          metadata: {
            severity: breach.severity,
            affectedRecords: breach.affectedRecords,
            dataCategories: breach.dataCategories,
            description: breach.description,
            impactAssessment: breach.impactAssessment,
            mitigationActions: breach.mitigationActions,
            affectedPatients: breach.affectedPatients,
            discoveryDate: breach.discoveryDate.toISOString(),
            reportedToANPD: breach.reportedToANPD,
            anpdReportDate: breach.anpdReportDate?.toISOString(),
            status: breach.status,
            notificationDate: notificationDate.toISOString(),
            breachId,
          },
        },
      });

      // Create individual audit entries for affected patients
      for (const patientId of breach.affectedPatients) {
        await this.recordAudit({
          patientId,
          action: "DATA_BREACH_AFFECTED",
          entityType: "SECURITY_INCIDENT",
          entityId: breachId,
          dataCategory: "PERSONAL",
          severity: breach.severity,
          description: `Patient data affected by security breach: ${breach.description}`,
          metadata: {
            breachId,
            breachSeverity: breach.severity,
            affectedDataCategories: breach.dataCategories,
          },
        });
      }

      // Trigger ANPD notification if required
      if (this.requiresANPDNotification(breach)) {
        await this.notifyANPD(breachId, breach);
      }

      return {
        success: true,
        recordsProcessed: 1 + breach.affectedPatients.length,
        operationId: `breach_${breachEntry.id}`,
        timestamp: new Date().toISOString(),
        breachId,
      };
    } catch (error) {
      return {
        success: false,
        recordsProcessed: 0,
        operationId: `breach_error_${Date.now()}`,
        timestamp: new Date().toISOString(),
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };
    }
  }

  /**
   * Generates LGPD compliance report
   */
  async generateComplianceReport(
    options: {
      startDate?: Date;
      endDate?: Date;
      includeStatistics?: boolean;
      includeBreachSummary?: boolean;
    } = {},
  ): Promise<LGPDOperationResult & { report?: any }> {
    try {
      const {
        startDate,
        endDate,
        includeStatistics = true,
        includeBreachSummary = true,
      } = options;

      const report = {
        generatedAt: new Date().toISOString(),
        period: {
          start: startDate?.toISOString(),
          end: endDate?.toISOString(),
        },
        summary: {},
        statistics: null,
        breachSummary: null,
        recommendations: [],
      };

      if (includeStatistics) {
        report.statistics = await this.generateStatistics(startDate, endDate);
      }

      if (includeBreachSummary) {
        report.breachSummary = await this.generateBreachSummary(
          startDate,
          endDate,
        );
      }

      // Generate recommendations based on audit findings
      report.recommendations = await this.generateComplianceRecommendations(
        startDate,
        endDate,
      );

      return {
        success: true,
        recordsProcessed: 1,
        operationId: `compliance_report_${Date.now()}`,
        timestamp: new Date().toISOString(),
        report,
      };
    } catch (error) {
      return {
        success: false,
        recordsProcessed: 0,
        operationId: `compliance_report_error_${Date.now()}`,
        timestamp: new Date().toISOString(),
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };
    }
  }

  // Private helper methods
  private assessRiskLevel(
    action: z.infer<typeof AuditAction>,
    dataCategory: z.infer<typeof DataCategory>,
  ): number {
    const baseRisk: Record<string, number> = {
      DATA_DELETION: 8,
      DATA_EXPORT: 7,
      DATA_SHARE: 6,
      SENSITIVE_DATA_PROCESSING: 9,
      DATA_BREACH: 10,
      AUTOMATED_DECISION: 7,
      DATA_ACCESS: 3,
      DATA_CREATION: 2,
      DATA_UPDATE: 4,
    };

    const categoryMultiplier: Record<string, number> = {
      SENSITIVE: 1.5,
      HEALTH: 1.4,
      GENETIC: 1.6,
      BIOMETRIC: 1.5,
      FINANCIAL: 1.3,
      PERSONAL: 1.0,
      IDENTIFICATION: 1.2,
      CONTACT: 1.0,
      LOCATION: 1.1,
      PROFESSIONAL: 1.1,
    };

    const actionRisk = baseRisk[action] || 5;
    const categoryRisk = categoryMultiplier[dataCategory] || 1.0;

    return Math.min(10, Math.round(actionRisk * categoryRisk));
  }

  private async handleAutomatedDecisionAudit(
    auditId: string,
    entry: Omit<AuditTrailEntry, "id" | "createdAt">,
  ): Promise<void> {
    // Create special audit entry for automated decisions
    await this.prisma.auditTrail.create({
      data: {
        action: "AUTOMATED_DECISION_LOG",
        entityType: "AI_GOVERNANCE",
        entityId: auditId,
        metadata: {
          originalAuditId: auditId,
          decisionLogic: entry.decisionLogic,
          impactAssessment: entry.impactAssessment,
          humanReviewRequired: this.requiresHumanReview(entry),
          timestamp: new Date().toISOString(),
        },
      },
    });
  }

  private requiresHumanReview(
    entry: Omit<AuditTrailEntry, "id" | "createdAt">,
  ): boolean {
    // Determine if automated decision requires human review based on LGPD Art. 20
    const highRiskActions = ["AUTOMATED_DECISION", "PROFILE_CREATION"];
    const sensitiveCategories = ["SENSITIVE", "HEALTH", "GENETIC"];

    return (
      highRiskActions.includes(entry.action) &&
      sensitiveCategories.includes(entry.dataCategory) &&
      (entry.riskLevel || 0) >= 7
    );
  }

  private generateRequestId(): string {
    return `dsr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateBreachId(): string {
    return `breach_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private mapToAuditTrailEntry(audit: any): AuditTrailEntry {
    const metadata = audit.metadata || {};
    return {
      id: audit.id,
      _userId: audit.userId,
      patientId: metadata.patientId,
      action: audit.action,
      entityType: audit.entityType,
      entityId: audit.entityId,
      dataCategory: metadata.dataCategory,
      severity: metadata.severity,
      description: metadata.description,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      location: metadata.location,
      sessionId: metadata.sessionId,
      metadata: metadata.additionalMetadata || metadata,
      complianceReferences: metadata.complianceReferences,
      riskLevel: metadata.riskLevel,
      automatedDecision: metadata.automatedDecision,
      decisionLogic: metadata.decisionLogic,
      impactAssessment: metadata.impactAssessment,
      retentionPeriod: metadata.retentionPeriod,
      createdAt: audit.createdAt,
    };
  }

  private requiresANPDNotification(
    breach: Omit<DataBreachNotification, "id" | "notificationDate">,
  ): boolean {
    // LGPD requires ANPD notification for breaches that may cause significant risk
    return (
      breach.severity === "CRITICAL" ||
      breach.affectedRecords > 100 ||
      breach.dataCategories.includes("SENSITIVE") ||
      breach.dataCategories.includes("HEALTH")
    );
  }

  private async notifyANPD(
    breachId: string,
    breach: Omit<DataBreachNotification, "id" | "notificationDate">,
  ): Promise<void> {
    // Create audit entry for ANPD notification
    await this.prisma.auditTrail.create({
      data: {
        action: "ANPD_NOTIFICATION",
        entityType: "REGULATORY_COMPLIANCE",
        entityId: breachId,
        metadata: {
          breachId,
          notificationDate: new Date().toISOString(),
          reportedToANPD: true,
          anpdReportDate: new Date().toISOString(),
          breachSeverity: breach.severity,
          affectedRecords: breach.affectedRecords,
        },
      },
    });
  }

  private async generateStatistics(
    startDate?: Date,
    endDate?: Date,
  ): Promise<any> {
    // Generate compliance statistics
    const whereClause: any = {};
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = startDate;
      if (endDate) whereClause.createdAt.lte = endDate;
    }

    const [totalOperations, dataSubjectRequests, breaches, automatedDecisions] =
      await Promise.all([
        this.prisma.auditTrail.count({ where: whereClause }),
        this.prisma.auditTrail.count({
          where: { ...whereClause, action: "DATA_SUBJECT_REQUEST" },
        }),
        this.prisma.auditTrail.count({
          where: { ...whereClause, action: "DATA_BREACH" },
        }),
        this.prisma.auditTrail.count({
          where: {
            ...whereClause,
            metadata: { path: ["automatedDecision"], equals: true },
          },
        }),
      ]);

    return {
      totalOperations,
      dataSubjectRequests,
      breaches,
      automatedDecisions,
      period: {
        start: startDate?.toISOString(),
        end: endDate?.toISOString(),
      },
    };
  }

  private async generateBreachSummary(
    startDate?: Date,
    endDate?: Date,
  ): Promise<any> {
    const whereClause: any = { action: "DATA_BREACH" };
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gge = startDate;
      if (endDate) whereClause.createdAt.lte = endDate;
    }

    const breaches = await this.prisma.auditTrail.findMany({
      where: whereClause,
    });

    return {
      totalBreaches: breaches.length,
      bySeverity: this.groupBySeverity(breaches),
      averageResponseTime: this.calculateAverageResponseTime(breaches),
      anpdNotificationRate: this.calculateANPDNotificationRate(breaches),
    };
  }

  private async generateComplianceRecommendations(
    startDate?: Date,
    endDate?: Date,
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // Analyze audit patterns and generate recommendations
    const auditSummary = await this.generateStatistics(startDate, endDate);

    if (auditSummary.breaches > 0) {
      recommendations.push(
        "Implement additional security controls to reduce data breach incidents",
      );
    }

    if (auditSummary.dataSubjectRequests > 10) {
      recommendations.push(
        "Consider automating data subject request processing",
      );
    }

    if (auditSummary.automatedDecisions > auditSummary.totalOperations * 0.5) {
      recommendations.push(
        "Review automated decision processes for human oversight requirements",
      );
    }

    return recommendations;
  }

  private groupBySeverity(breaches: any[]): Record<string, number> {
    return breaches.reduce((acc, _breach) => {
      const severity = breach.metadata?.severity || "UNKNOWN";
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    }, {});
  }

  private calculateAverageResponseTime(breaches: any[]): number {
    // Simplified calculation - in practice would analyze actual response times
    return breaches.length > 0 ? 24 : 0; // 24 hours average
  }

  private calculateANPDNotificationRate(breaches: any[]): number {
    if (breaches.length === 0) return 0;

    const notified = breaches.filter(
      (breach) => breach.metadata?.reportedToANPD,
    ).length;
    return (notified / breaches.length) * 100;
  }
}

// Export singleton instance
export const lgpdAuditService = new LGPDAuditService();
