// Healthcare Governance Service - CFM/ANVISA Compliance
// Extends base governance with healthcare-specific metrics and policies

import { SupabaseGovernanceService } from "./supabase-governance.service";
import {
  HealthcareGovernanceService as IHealthcareGovernanceService,
  HealthcareMetric,
  CreateHealthcareMetric,
  UpdateHealthcareMetric,
  HealthcareMetricType,
  HealthcareMetricCategory,
  HealthcareMetricStatus,
  HealthcarePolicy,
  CreateHealthcarePolicy,
  PatientSafetyKPI,
  HealthcareAlert,
  HealthcareAuditEvent,
  HealthcareComplianceReport,
  HealthcareDashboardData,
  HealthcareMetricFilters,
  HealthcarePolicyFilters,
  HealthcareAlertFilters,
  ComplianceReportFilters,
  AuditTrailEntry,
} from "@neonpro/types";
import { logHealthcareError, governanceLogger } from '../../../../shared/src/logging/healthcare-logger';
import {
  HealthcareMetricRecord,
  PatientSafetyKPIRecord,
  HealthcarePolicyRecord,
  HealthcareAlertRecord,
  ComplianceReportRecord,
} from "../../types/database-records";

export class HealthcareGovernanceService
  extends SupabaseGovernanceService
  implements IHealthcareGovernanceService
{
  constructor(supabaseUrl: string, supabaseKey: string) {
    super(supabaseUrl, supabaseKey);
  }

  // Healthcare Metrics Management
  async getHealthcareMetrics(
    clinicId: string,
    filters?: HealthcareMetricFilters,
  ): Promise<HealthcareMetric[]> {
    try {
      let query = this.supabase
        .from("healthcare_metrics")
        .select("*")
        .eq("clinic_id", clinicId);

      // Apply filters
      if (filters?.metricType) {
        query = query.eq("metric_type", filters.metricType);
      }
      if (filters?.category) {
        query = query.eq("category", filters.category);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.complianceFramework) {
        query = query.eq("compliance_framework", filters.complianceFramework);
      }
      if (filters?.riskLevel) {
        query = query.eq("risk_level", filters.riskLevel);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) {
        throw new Error(`Failed to fetch healthcare metrics: ${error.message}`);
      }

      return this.mapHealthcareMetrics(data || []);
    } catch (error) {
      logHealthcareError('governance', error, { method: 'getHealthcareMetrics', filters });
      if (error instanceof Error) {
        throw new Error(`Failed to fetch healthcare metrics: ${error.message}`);
      }
      throw new Error("Failed to fetch healthcare metrics: Unknown error");
    }
  }

  async createHealthcareMetric(
    metric: CreateHealthcareMetric,
  ): Promise<HealthcareMetric> {
    try {
      const { data, error } = await this.supabase
        .from("healthcare_metrics")
        .insert({
          clinic_id: metric.clinicId,
          metric_type: metric.metricType,
          name: metric.name,
          description: metric.description,
          category: metric.category,
          current_value: metric.currentValue,
          target_value: metric.targetValue,
          threshold: metric.threshold,
          unit: metric.unit,
          status: metric.status || "ACTIVE",
          compliance_framework: metric.complianceFramework,
          risk_level: metric.riskLevel || "LOW",
          metadata: metric.metadata || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_updated: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create healthcare metric: ${error.message}`);
      }

      // Create audit trail entry
      await this.createHealthcareAuditEntry({
        action: "CREATE",
        resource: "healthcare_metric",
        resourceType: "REPORT",
        resourceId: data.id,
        _userId: "system", // TODO: Get from context
        ipAddress: "127.0.0.1", // TODO: Get from context
        userAgent: "system", // TODO: Get from context
        status: "SUCCESS",
        riskLevel: "LOW",
        additionalInfo: `Created healthcare metric: ${metric.name}`,
        encryptedDetails: { metric },
        healthcareContext: {
          complianceFramework: metric.complianceFramework,
          clinicalContext: `Healthcare metric creation for ${metric.category}`,
        },
      });

      return this.mapHealthcareMetric(data);
    } catch (error) {
      logHealthcareError('governance', error, { method: 'createHealthcareMetric', metric });
      if (error instanceof Error) {
        throw new Error(`Failed to create healthcare metric: ${error.message}`);
      }
      throw new Error("Failed to create healthcare metric: Unknown error");
    }
  }

  async updateHealthcareMetric(
    update: UpdateHealthcareMetric,
  ): Promise<HealthcareMetric> {
    try {
      const updateData: Partial<HealthcareMetricRecord> = {
        updated_at: new Date().toISOString(),
        last_updated: new Date().toISOString(),
      };

      if (update.currentValue !== undefined)
        updateData.current_value = update.currentValue;
      if (update.targetValue !== undefined)
        updateData.target_value = update.targetValue;
      if (update.threshold !== undefined)
        updateData.threshold = update.threshold;
      if (update.status !== undefined) updateData.status = update.status;
      if (update.riskLevel !== undefined)
        updateData.risk_level = update.riskLevel;
      if (update.metadata !== undefined) updateData.metadata = update.metadata;

      const { data, error } = await this.supabase
        .from("healthcare_metrics")
        .update(updateData)
        .eq("id", update.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update healthcare metric: ${error.message}`);
      }

      // Create audit trail entry
      await this.createHealthcareAuditEntry({
        action: "UPDATE",
        resource: "healthcare_metric",
        resourceType: "REPORT",
        resourceId: update.id,
        _userId: "system", // TODO: Get from context
        ipAddress: "127.0.0.1", // TODO: Get from context
        userAgent: "system", // TODO: Get from context
        status: "SUCCESS",
        riskLevel: "LOW",
        additionalInfo: `Updated healthcare metric: ${data.name}`,
        encryptedDetails: { update },
        healthcareContext: {
          complianceFramework: data.compliance_framework,
          clinicalContext: `Healthcare metric update for ${data.category}`,
        },
      });

      return this.mapHealthcareMetric(data);
    } catch (error) {
      logHealthcareError('governance', error, { method: 'updateHealthcareMetric', update });
      if (error instanceof Error) {
        throw new Error(`Failed to update healthcare metric: ${error.message}`);
      }
      throw new Error("Failed to update healthcare metric: Unknown error");
    }
  }

  async deleteHealthcareMetric(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("healthcare_metrics")
        .delete()
        .eq("id", id);

      if (error) {
        throw new Error(`Failed to delete healthcare metric: ${error.message}`);
      }

      // Create audit trail entry
      await this.createHealthcareAuditEntry({
        action: "DELETE",
        resource: "healthcare_metric",
        resourceType: "REPORT",
        resourceId: id,
        _userId: "system", // TODO: Get from context
        ipAddress: "127.0.0.1", // TODO: Get from context
        userAgent: "system", // TODO: Get from context
        status: "SUCCESS",
        riskLevel: "LOW",
        additionalInfo: `Deleted healthcare metric: ${id}`,
        encryptedDetails: { deletedId: id },
        healthcareContext: {
          complianceFramework: "GENERAL",
          clinicalContext: "Healthcare metric deletion",
        },
      });
    } catch (error) {
      logHealthcareError('governance', error, { method: 'deleteHealthcareMetric', metricId });
      if (error instanceof Error) {
        throw new Error(`Failed to delete healthcare metric: ${error.message}`);
      }
      throw new Error("Failed to delete healthcare metric: Unknown error");
    }
  }

  // Patient Safety KPIs
  async getPatientSafetyKPIs(clinicId: string): Promise<PatientSafetyKPI[]> {
    try {
      const { data, error } = await this.supabase
        .from("patient_safety_kpis")
        .select("*")
        .eq("clinic_id", clinicId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(
          `Failed to fetch patient safety KPIs: ${error.message}`,
        );
      }

      return this.mapPatientSafetyKPIs(data || []);
    } catch (error) {
      logHealthcareError('governance', error, { method: 'getPatientSafetyKPIs', clinicId });
      throw error;
    }
  }

  async updatePatientSafetyKPI(
    id: string,
    updates: Partial<PatientSafetyKPI>,
  ): Promise<PatientSafetyKPI> {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await this.supabase
        .from("patient_safety_kpis")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(
          `Failed to update patient safety KPI: ${error.message}`,
        );
      }

      return this.mapPatientSafetyKPI(data);
    } catch (error) {
      logHealthcareError('governance', error, { method: 'updatePatientSafetyKPI', kpiId, update });
      throw error;
    }
  }

  // Healthcare Policies (CFM/ANVISA)
  async getHealthcarePolicies(
    filters?: HealthcarePolicyFilters,
  ): Promise<HealthcarePolicy[]> {
    try {
      let query = this.supabase.from("healthcare_policies").select("*");

      // Apply filters
      if (filters?.regulatoryBody) {
        query = query.eq("regulatory_body", filters.regulatoryBody);
      }
      if (filters?.category) {
        query = query.eq("category", filters.category);
      }
      if (filters?.criticalityLevel) {
        query = query.eq("criticality_level", filters.criticalityLevel);
      }
      if (filters?.applicableService) {
        query = query.contains("applicable_services", [
          filters.applicableService,
        ]);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) {
        throw new Error(
          `Failed to fetch healthcare policies: ${error.message}`,
        );
      }

      return this.mapHealthcarePolicies(data || []);
    } catch (error) {
      logHealthcareError('governance', error, { method: 'getHealthcarePolicies', filters });
      throw error;
    }
  }

  async createHealthcarePolicy(
    policy: CreateHealthcarePolicy,
  ): Promise<HealthcarePolicy> {
    try {
      const { data, error } = await this.supabase
        .from("healthcare_policies")
        .insert({
          name: policy.name,
          description: policy.description,
          category: policy.category,
          regulatory_body: policy.regulatoryBody,
          regulation_number: policy.regulationNumber,
          applicable_services: policy.applicableServices,
          compliance_deadline: policy.complianceDeadline?.toISOString(),
          audit_frequency: policy.auditFrequency,
          criticality_level: policy.criticalityLevel,
          content: policy.content,
          metadata: policy.metadata || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create healthcare policy: ${error.message}`);
      }

      return this.mapHealthcarePolicy(data);
    } catch (error) {
      logHealthcareError('governance', error, { method: 'createHealthcarePolicy', policy });
      throw error;
    }
  }

  async updateHealthcarePolicy(
    id: string,
    updates: Partial<HealthcarePolicy>,
  ): Promise<HealthcarePolicy> {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await this.supabase
        .from("healthcare_policies")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update healthcare policy: ${error.message}`);
      }

      return this.mapHealthcarePolicy(data);
    } catch (error) {
      logHealthcareError('governance', error, { method: 'updateHealthcarePolicy', policyId, update });
      throw error;
    }
  }

  // Real-time Monitoring
  async getHealthcareAlerts(
    clinicId: string,
    filters?: HealthcareAlertFilters,
  ): Promise<HealthcareAlert[]> {
    try {
      let query = this.supabase
        .from("healthcare_alerts")
        .select("*")
        .eq("clinic_id", clinicId);

      // Apply filters
      if (filters?.alertType) {
        query = query.eq("alert_type", filters.alertType);
      }
      if (filters?.severity) {
        query = query.eq("severity", filters.severity);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.assignedTo) {
        query = query.eq("assigned_to", filters.assignedTo);
      }
      if (filters?.dateFrom) {
        query = query.gte("created_at", filters.dateFrom.toISOString());
      }
      if (filters?.dateTo) {
        query = query.lte("created_at", filters.dateTo.toISOString());
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) {
        throw new Error(`Failed to fetch healthcare alerts: ${error.message}`);
      }

      return this.mapHealthcareAlerts(data || []);
    } catch (error) {
      logHealthcareError('governance', error, { method: 'getHealthcareAlerts', filters });
      throw error;
    }
  }

  async createHealthcareAlert(
    alert: Omit<HealthcareAlert, "id" | "createdAt" | "updatedAt">,
  ): Promise<HealthcareAlert> {
    try {
      const { data, error } = await this.supabase
        .from("healthcare_alerts")
        .insert({
          clinic_id: alert.clinicId,
          alert_type: alert.alertType,
          severity: alert.severity,
          title: alert.title,
          description: alert.description,
          source: alert.source,
          triggered_by: alert.triggeredBy,
          status: alert.status,
          assigned_to: alert.assignedTo,
          escalation_level: alert.escalationLevel,
          auto_escalation_time: alert.autoEscalationTime?.toISOString(),
          resolution_deadline: alert.resolutionDeadline?.toISOString(),
          actions: alert.actions,
          metadata: alert.metadata || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create healthcare alert: ${error.message}`);
      }

      return this.mapHealthcareAlert(data);
    } catch (error) {
      logHealthcareError('governance', error, { method: 'createHealthcareAlert', alert });
      throw error;
    }
  }

  async updateHealthcareAlert(
    id: string,
    updates: Partial<HealthcareAlert>,
  ): Promise<HealthcareAlert> {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await this.supabase
        .from("healthcare_alerts")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update healthcare alert: ${error.message}`);
      }

      return this.mapHealthcareAlert(data);
    } catch (error) {
      logHealthcareError('governance', error, { method: 'updateHealthcareAlert', alertId, update });
      throw error;
    }
  }

  // Compliance Reporting
  async generateComplianceReport(
    clinicId: string,
    reportType: HealthcareComplianceReport["reportType"],
    period: { startDate: Date; endDate: Date },
  ): Promise<HealthcareComplianceReport> {
    try {
      // Get healthcare metrics for the period
      const metrics = await this.getHealthcareMetrics(clinicId);

      // Calculate compliance score based on metrics
      const overallScore = this.calculateComplianceScore(metrics);

      // Get violations count
      const violations = await this.getViolationsCount(clinicId, period);

      // Generate recommendations
      const recommendations = this.generateRecommendations(metrics, violations);

      const report: HealthcareComplianceReport = {
        id: crypto.randomUUID(),
        clinicId,
        reportType,
        period,
        overallScore,
        complianceStatus: this.determineComplianceStatus(overallScore),
        metrics,
        violations,
        recommendations,
        nextAuditDate: this.calculateNextAuditDate(reportType),
        generatedBy: "system", // TODO: Get from context
        metadata: {
          generationTimestamp: new Date().toISOString(),
          version: "1.0",
        },
        createdAt: new Date(),
      };

      // Store the report
      const { error } = await this.supabase
        .from("compliance_reports")
        .insert({
          id: report.id,
          clinic_id: report.clinicId,
          report_type: report.reportType,
          period_start: report.period.startDate.toISOString(),
          period_end: report.period.endDate.toISOString(),
          overall_score: report.overallScore,
          compliance_status: report.complianceStatus,
          violations: report.violations,
          recommendations: report.recommendations,
          next_audit_date: report.nextAuditDate.toISOString(),
          generated_by: report.generatedBy,
          metadata: report.metadata,
          created_at: report.createdAt.toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to store compliance report: ${error.message}`);
      }

      return report;
    } catch (error) {
      logHealthcareError('governance', error, { method: 'generateComplianceReport', filters });
      throw error;
    }
  }

  async getComplianceReports(
    clinicId: string,
    filters?: ComplianceReportFilters,
  ): Promise<HealthcareComplianceReport[]> {
    try {
      let query = this.supabase
        .from("compliance_reports")
        .select("*")
        .eq("clinic_id", clinicId);

      // Apply filters
      if (filters?.reportType) {
        query = query.eq("report_type", filters.reportType);
      }
      if (filters?.complianceStatus) {
        query = query.eq("compliance_status", filters.complianceStatus);
      }
      if (filters?.dateFrom) {
        query = query.gte("created_at", filters.dateFrom.toISOString());
      }
      if (filters?.dateTo) {
        query = query.lte("created_at", filters.dateTo.toISOString());
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) {
        throw new Error(`Failed to fetch compliance reports: ${error.message}`);
      }

      return this.mapComplianceReports(data || []);
    } catch (error) {
      logHealthcareError('governance', error, { method: 'getComplianceReports', filters });
      throw error;
    }
  }

  // Integration with Audit System
  async createHealthcareAuditEntry(
    entry: HealthcareAuditEvent,
  ): Promise<AuditTrailEntry> {
    try {
      // Create the base audit entry
      const auditEntry = await this.createAuditEntry({
        action: entry.action,
        resource: entry.resource,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId,
        _userId: entry.userId,
        clinicId: entry.clinicId,
        patientId: entry.patientId,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        sessionId: entry.sessionId,
        status: entry.status,
        riskLevel: entry.riskLevel,
        additionalInfo: entry.additionalInfo,
        encryptedDetails: {
          ...entry.encryptedDetails,
          healthcareContext: entry.healthcareContext,
        },
      });

      return auditEntry;
    } catch (error) {
      logHealthcareError('governance', error, { method: 'createHealthcareAuditEntry', audit });
      if (error instanceof Error) {
        throw new Error(
          `Failed to create healthcare audit entry: ${error.message}`,
        );
      }
      throw new Error("Failed to create healthcare audit entry: Unknown error");
    }
  }

  // Dashboard Data
  async getHealthcareDashboardData(
    clinicId: string,
  ): Promise<HealthcareDashboardData> {
    try {
      // Get all healthcare metrics
      const metrics = await this.getHealthcareMetrics(clinicId);

      // Get active alerts
      const alerts = await this.getHealthcareAlerts(clinicId, {
        status: "ACTIVE",
      });
      const criticalAlerts = alerts.filter(
        (alert) => alert.severity === "CRITICAL",
      ).length;

      // Calculate compliance scores
      const overallComplianceScore = this.calculateComplianceScore(metrics);
      const patientSafetyScore = this.calculatePatientSafetyScore(metrics);

      // Get CFM and ANVISA specific compliance
      const cfmMetrics = metrics.filter((m) => m.complianceFramework === "CFM");
      const anvisaMetrics = metrics.filter(
        (m) => m.complianceFramework === "ANVISA",
      );

      const cfmComplianceScore = this.calculateComplianceScore(cfmMetrics);
      const anvisaComplianceScore =
        this.calculateComplianceScore(anvisaMetrics);

      return {
        overallComplianceScore,
        criticalAlerts,
        activeViolations: alerts.filter(
          (alert) => alert.alertType === "COMPLIANCE_VIOLATION",
        ).length,
        patientSafetyScore,
        cfmComplianceStatus: {
          score: cfmComplianceScore,
          status: this.determineComplianceStatus(cfmComplianceScore),
          lastAudit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          nextAudit: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        },
        anvisaComplianceStatus: {
          score: anvisaComplianceScore,
          status: this.determineComplianceStatus(anvisaComplianceScore),
          lastAudit: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
          nextAudit: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        },
        recentMetrics: metrics.slice(0, 10),
        upcomingDeadlines: {
          policyReviews: 3,
          complianceAudits: 2,
          certificationRenewals: 1,
        },
        trends: {
          complianceScoreTrend: "IMPROVING",
          safetyIncidentTrend: "STABLE",
          alertResolutionTrend: "IMPROVING",
        },
      };
    } catch (error) {
      logHealthcareError('governance', error, { method: 'getHealthcareDashboardData', clinicId });
      throw error;
    }
  }

  // Private helper methods
  private mapHealthcareMetrics(
    data: HealthcareMetricRecord[],
  ): HealthcareMetric[] {
    return data.map((item) => this.mapHealthcareMetric(item));
  }

  private mapHealthcareMetric(data: HealthcareMetricRecord): HealthcareMetric {
    return {
      id: data.id,
      clinicId: data.clinic_id,
      metricType: data.metric_type as HealthcareMetricType,
      name: data.name,
      description: data.description || undefined,
      category: data.category as HealthcareMetricCategory,
      currentValue: data.current_value,
      targetValue: data.target_value,
      threshold: data.threshold,
      unit: data.unit,
      status: data.status as HealthcareMetricStatus,
      complianceFramework: data.compliance_framework,
      riskLevel: data.risk_level as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      lastUpdated: new Date(data.last_updated),
      metadata: data.metadata || {},
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapPatientSafetyKPIs(
    data: PatientSafetyKPIRecord[],
  ): PatientSafetyKPI[] {
    return data.map((item) => this.mapPatientSafetyKPI(item));
  }

  private mapPatientSafetyKPI(data: PatientSafetyKPIRecord): PatientSafetyKPI {
    return {
      id: data.id,
      clinicId: data.clinic_id,
      kpiName: data.kpi_name,
      category: data.category as
        | "MEDICATION_SAFETY"
        | "DIAGNOSTIC_ACCURACY"
        | "TREATMENT_OUTCOMES"
        | "INFECTION_CONTROL",
      currentValue: data.current_value,
      targetValue: data.target_value,
      benchmark: data.benchmark,
      trend: data.trend as "IMPROVING" | "STABLE" | "DECLINING",
      alertThreshold: data.alert_threshold,
      lastIncident: data.last_incident
        ? new Date(data.last_incident)
        : undefined,
      incidentCount: data.incident_count,
      mitigationActions: data.mitigation_actions || [],
      responsibleTeam: data.responsible_team,
      reportingFrequency: data.reporting_frequency as
        | "DAILY"
        | "WEEKLY"
        | "MONTHLY",
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapHealthcarePolicies(
    data: HealthcarePolicyRecord[],
  ): HealthcarePolicy[] {
    return data.map((item) => this.mapHealthcarePolicy(item));
  }

  private mapHealthcarePolicy(data: HealthcarePolicyRecord): HealthcarePolicy {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.category,
      version: data.version || "1.0",
      status: (data.status || "ACTIVE") as
        | "ACTIVE"
        | "DRAFT"
        | "ARCHIVED"
        | "UNDER_REVIEW",
      content: data.content,
      metadata: data.metadata || {},
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      regulatoryBody: data.regulatory_body as "CFM" | "ANVISA" | "MS" | "CRM",
      regulationNumber: data.regulation_number || "",
      applicableServices: data.applicable_services || [],
      complianceDeadline: data.compliance_deadline
        ? new Date(data.compliance_deadline)
        : undefined,
      auditFrequency: data.audit_frequency as
        | "MONTHLY"
        | "QUARTERLY"
        | "ANNUALLY",
      criticalityLevel: data.criticality_level as
        | "LOW"
        | "MEDIUM"
        | "HIGH"
        | "CRITICAL",
      // Add missing properties from PolicyManagement interface
      framework: data.framework as any,
      enforcementRate: data.enforcement_rate || 0,
      violationCount: data.violation_count || 0,
    };
  }

  private mapHealthcareAlerts(
    data: HealthcareAlertRecord[],
  ): HealthcareAlert[] {
    return data.map((item) => this.mapHealthcareAlert(item));
  }

  private mapHealthcareAlert(data: HealthcareAlertRecord): HealthcareAlert {
    return {
      id: data.id,
      clinicId: data.clinic_id,
      alertType: data.alert_type as
        | "COMPLIANCE_VIOLATION"
        | "SAFETY_INCIDENT"
        | "METRIC_THRESHOLD"
        | "POLICY_BREACH",
      severity: data.severity as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      title: data.title,
      description: data.description,
      source: data.source || "",
      triggeredBy: data.triggered_by || "",
      status: data.status as
        | "ACTIVE"
        | "ACKNOWLEDGED"
        | "RESOLVED"
        | "DISMISSED",
      assignedTo: data.assigned_to || undefined,
      escalationLevel: data.escalation_level as any,
      autoEscalationTime: data.auto_escalation_time
        ? new Date(data.auto_escalation_time)
        : undefined,
      resolutionDeadline: data.resolution_deadline
        ? new Date(data.resolution_deadline)
        : undefined,
      actions: data.actions || [],
      metadata: data.metadata || {},
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapComplianceReports(
    data: ComplianceReportRecord[],
  ): HealthcareComplianceReport[] {
    return data.map((item) => ({
      id: item.id,
      clinicId: item.clinic_id,
      reportType: item.report_type as HealthcareComplianceReport["reportType"],
      period: {
        startDate: new Date(item.period_start),
        endDate: new Date(item.period_end),
      },
      overallScore: item.overall_score,
      complianceStatus: item.compliance_status as
        | "COMPLIANT"
        | "NON_COMPLIANT"
        | "UNDER_REVIEW"
        | "CRITICAL",
      metrics: [], // Would need to fetch separately
      violations:
        item.violations !== null && item.violations !== undefined
          ? { count: item.violations, critical: 0, resolved: 0, pending: 0 }
          : { count: 0, critical: 0, resolved: 0, pending: 0 },
      recommendations: item.recommendations || [],
      nextAuditDate: item.next_audit_date
        ? new Date(item.next_audit_date)
        : new Date(),
      generatedBy: item.generated_by,
      approvedBy: item.approved_by || undefined,
      metadata: item.metadata || {},
      createdAt: new Date(item.created_at),
    }));
  }

  private calculateComplianceScore(metrics: HealthcareMetric[]): number {
    if (metrics.length === 0) return 0;

    const scores = metrics.map((metric) => {
      const performance = metric.currentValue / metric.targetValue;
      return Math.min(performance * 100, 100);
    });

    return scores.reduce((sum, _score) => sum + score, 0) / scores.length;
  }

  private calculatePatientSafetyScore(metrics: HealthcareMetric[]): number {
    const safetyMetrics = metrics.filter(
      (m) => m.category === "PATIENT_SAFETY",
    );
    return this.calculateComplianceScore(safetyMetrics);
  }

  private determineComplianceStatus(
    score: number,
  ): "COMPLIANT" | "NON_COMPLIANT" | "UNDER_REVIEW" | "CRITICAL" {
    if (score >= 90) return "COMPLIANT";
    if (score >= 70) return "UNDER_REVIEW";
    if (score >= 50) return "NON_COMPLIANT";
    return "CRITICAL";
  }

  private async getViolationsCount(
    clinicId: string,
    period: { startDate: Date; endDate: Date },
  ) {
    const alerts = await this.getHealthcareAlerts(clinicId, {
      alertType: "COMPLIANCE_VIOLATION",
      dateFrom: period.startDate,
      dateTo: period.endDate,
    });

    return {
      count: alerts.length,
      critical: alerts.filter((a) => a.severity === "CRITICAL").length,
      resolved: alerts.filter((a) => a.status === "RESOLVED").length,
      pending: alerts.filter((a) => a.status === "ACTIVE").length,
    };
  }

  private generateRecommendations(
    metrics: HealthcareMetric[],
    violations: {
      count: number;
      critical: number;
      resolved: number;
      pending: number;
    },
  ): string[] {
    const recommendations: string[] = [];

    // Check for low-performing metrics
    const lowPerformingMetrics = metrics.filter(
      (m) => m.currentValue < m.threshold,
    );
    if (lowPerformingMetrics.length > 0) {
      recommendations.push(
        `Improve performance on ${lowPerformingMetrics.length} metrics below threshold`,
      );
    }

    // Check for high-risk metrics
    const highRiskMetrics = metrics.filter(
      (m) => m.riskLevel === "HIGH" || m.riskLevel === "CRITICAL",
    );
    if (highRiskMetrics.length > 0) {
      recommendations.push(
        `Address ${highRiskMetrics.length} high-risk metrics immediately`,
      );
    }

    // Check for violations
    if (violations.critical > 0) {
      recommendations.push(
        `Resolve ${violations.critical} critical compliance violations`,
      );
    }

    if (recommendations.length === 0) {
      recommendations.push("Continue monitoring current compliance levels");
    }

    return recommendations;
  }

  private calculateNextAuditDate(
    reportType: HealthcareComplianceReport["reportType"],
  ): Date {
    const now = new Date();
    switch (reportType) {
      case "CFM_TELEMEDICINE":
        return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days
      case "ANVISA_ESTABLISHMENT":
        return new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000); // 180 days
      case "PATIENT_SAFETY":
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
      case "COMPREHENSIVE":
        return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 365 days
      default:
        return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days default
    }
  }
}
