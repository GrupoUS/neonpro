/**
 * Service Constitution - Constitutional Governance Framework
 *
 * Implements self-governing service architecture with automated policy enforcement,
 * compliance validation, and governance metrics for NeonPro AI Healthcare Platform.
 *
 * Features:
 * - Constitutional service governance patterns
 * - Automated policy enforcement
 * - Healthcare compliance integration (LGPD, ANVISA, CFM)
 * - Performance governance and SLA monitoring
 * - Real-time governance metrics and reporting
 */

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

// Constitutional governance schemas
const PolicySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.enum(["SECURITY", "PERFORMANCE", "COMPLIANCE", "DATA_GOVERNANCE"]),
  scope: z.enum(["SERVICE", "SYSTEM", "GLOBAL"]),
  rules: z.array(
    z.object({
      condition: z.string(),
      action: z.string(),
      severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
      autoRemediation: z.boolean().default(false),
    }),
  ),
  metadata: z.record(z.unknown()).optional(),
  active: z.boolean().default(true),
  version: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const GovernanceContextSchema = z.object({
  serviceId: z.string(),
  serviceName: z.string(),
  serviceVersion: z.string(),
  operation: z.string(),
  userId: z.string().optional(),
  patientId: z.string().optional(),
  tenantId: z.string().optional(),
  requestId: z.string(),
  timestamp: z.string(),
  environment: z.enum(["development", "staging", "production"]),
  metadata: z.record(z.unknown()).optional(),
});

const ComplianceRequirementSchema = z.object({
  framework: z.enum(["LGPD", "ANVISA", "CFM", "HIPAA"]),
  requirement: z.string(),
  level: z.enum(["MANDATORY", "RECOMMENDED", "OPTIONAL"]),
  validation: z.object({
    type: z.enum(["AUTOMATED", "MANUAL", "HYBRID"]),
    frequency: z.enum(["REAL_TIME", "DAILY", "WEEKLY", "MONTHLY"]),
    criteria: z.array(z.string()),
  }),
});

const GovernanceMetricsSchema = z.object({
  serviceId: z.string(),
  timestamp: z.string(),
  policyCompliance: z.number().min(0).max(100),
  performanceScore: z.number().min(0).max(100),
  securityScore: z.number().min(0).max(100),
  complianceScore: z.number().min(0).max(100),
  totalViolations: z.number().int().min(0),
  criticalViolations: z.number().int().min(0),
  autoRemediations: z.number().int().min(0),
  manualInterventions: z.number().int().min(0),
});

// Type definitions
export type Policy = z.infer<typeof PolicySchema>;
export type GovernanceContext = z.infer<typeof GovernanceContextSchema>;
export type ComplianceRequirement = z.infer<typeof ComplianceRequirementSchema>;
export type GovernanceMetrics = z.infer<typeof GovernanceMetricsSchema>;

export interface ServiceConstitutionConfig {
  supabaseUrl: string;
  supabaseServiceKey: string;
  enableRealTimeMonitoring: boolean;
  enableAutoRemediation: boolean;
  governanceLevel: "BASIC" | "ADVANCED" | "ENTERPRISE";
  complianceFrameworks: ("LGPD" | "ANVISA" | "CFM" | "HIPAA")[];
  performanceThresholds: {
    responseTime: number;
    errorRate: number;
    throughput: number;
  };
  alerting: {
    enabled: boolean;
    channels: ("EMAIL" | "SLACK" | "WEBHOOK")[];
    thresholds: {
      critical: number;
      high: number;
      medium: number;
    };
  };
}

export interface PolicyEvaluationResult {
  policyId: string;
  policyName: string;
  compliant: boolean;
  violations: {
    rule: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    message: string;
    autoRemediation?: string;
  }[];
  remediationActions: {
    action: string;
    automated: boolean;
    priority: number;
  }[];
  metrics: {
    evaluationTime: number;
    confidence: number;
  };
}

/**
 * Service Constitution - Main governance orchestrator
 */
export class ServiceConstitution {
  private readonly config: ServiceConstitutionConfig;
  private readonly supabase: SupabaseClient;
  private readonly policies: Map<string, Policy> = new Map();
  private readonly complianceRequirements: Map<
    string,
    ComplianceRequirement[]
  > = new Map();
  private readonly governanceMetrics: Map<string, GovernanceMetrics> =
    new Map();

  // Real-time monitoring
  private readonly monitoringIntervals: Map<string, NodeJS.Timeout> = new Map();
  private readonly metricsBuffer: GovernanceMetrics[] = [];

  constructor(config: ServiceConstitutionConfig) {
    this.config = config;
    this.supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);

    this.initializeConstitution();
  }

  /**
   * Initialize constitutional governance system
   */
  private async initializeConstitution(): Promise<void> {
    try {
      // Load constitutional policies from Supabase
      await this.loadPolicies();

      // Load compliance requirements
      await this.loadComplianceRequirements();

      // Initialize real-time monitoring
      if (this.config.enableRealTimeMonitoring) {
        await this.startRealTimeMonitoring();
      }

      // Initialize healthcare compliance policies
      await this.initializeHealthcarePolicies();

      // console.log("✅ Service Constitution initialized successfully");
    } catch (error) {
      // console.error("❌ Failed to initialize Service Constitution:", error);
      throw error;
    }
  }

  /**
   * Load governance policies from database
   */
  private async loadPolicies(): Promise<void> {
    const { data: policies, error } = await this.supabase
      .from("governance_policies")
      .select("*")
      .eq("active", true);

    if (error) {
      throw new Error(`Failed to load policies: ${error.message}`);
    }

    for (const policy of policies || []) {
      const validatedPolicy = PolicySchema.parse(policy);
      this.policies.set(validatedPolicy.id, validatedPolicy);
    }

    // console.log(`📋 Loaded ${this.policies.size} constitutional policies`);
  }

  /**
   * Load compliance requirements
   */
  private async loadComplianceRequirements(): Promise<void> {
    for (const framework of this.config.complianceFrameworks) {
      const { data: requirements, error } = await this.supabase
        .from("compliance_requirements")
        .select("*")
        .eq("framework", framework)
        .eq("active", true);

      if (error) {
        console.warn(
          `Failed to load ${framework} requirements:`,
          error.message,
        );
        continue;
      }

      const validatedRequirements = (requirements || []).map((req) =>
        ComplianceRequirementSchema.parse(req),
      );

      this.complianceRequirements.set(framework, validatedRequirements);
    }

    console.log(
      `🏥 Loaded compliance requirements for ${this.complianceRequirements.size} frameworks`,
    );
  }

  /**
   * Initialize healthcare-specific governance policies
   */
  private async initializeHealthcarePolicies(): Promise<void> {
    const healthcarePolicies: Omit<Policy, "createdAt" | "updatedAt">[] = [
      {
        id: "healthcare-data-protection",
        name: "Healthcare Data Protection Policy",
        description: "LGPD compliance for healthcare data processing",
        type: "DATA_GOVERNANCE",
        scope: "GLOBAL",
        version: "1.0.0",
        active: true,
        rules: [
          {
            condition: "patient_data_access",
            action: "validate_consent",
            severity: "CRITICAL",
            autoRemediation: true,
          },
          {
            condition: "data_retention_period > 365_days",
            action: "trigger_data_review",
            severity: "HIGH",
            autoRemediation: false,
          },
        ],
      },
      {
        id: "anvisa-medical-device-compliance",
        name: "ANVISA Medical Device Compliance",
        description: "ANVISA compliance for medical device software",
        type: "COMPLIANCE",
        scope: "SYSTEM",
        version: "1.0.0",
        active: true,
        rules: [
          {
            condition: "medical_procedure_modification",
            action: "audit_trail_required",
            severity: "CRITICAL",
            autoRemediation: true,
          },
          {
            condition: "ai_prediction_confidence < 0.95",
            action: "require_human_validation",
            severity: "HIGH",
            autoRemediation: true,
          },
        ],
      },
      {
        id: "cfm-professional-validation",
        name: "CFM Professional Validation",
        description: "CFM compliance for medical professional validation",
        type: "SECURITY",
        scope: "SERVICE",
        version: "1.0.0",
        active: true,
        rules: [
          {
            condition: "medical_professional_action",
            action: "validate_cfm_license",
            severity: "CRITICAL",
            autoRemediation: true,
          },
        ],
      },
    ];

    for (const policy of healthcarePolicies) {
      const timestamp = new Date().toISOString();
      const fullPolicy: Policy = {
        ...policy,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      this.policies.set(fullPolicy.id, fullPolicy);

      // Store in Supabase
      await this.supabase
        .from("governance_policies")
        .upsert(fullPolicy)
        .select();
    }

    // console.log("🏥 Initialized healthcare governance policies");
  }

  /**
   * Evaluate service governance compliance
   */
  public async evaluateGovernance(
    context: GovernanceContext,
  ): Promise<PolicyEvaluationResult[]> {
    const validatedContext = GovernanceContextSchema.parse(context);
    const results: PolicyEvaluationResult[] = [];

    for (const [policyId, policy] of this.policies) {
      const startTime = performance.now();

      try {
        const result = await this.evaluatePolicy(policy, validatedContext);
        results.push({
          ...result,
          metrics: {
            evaluationTime: performance.now() - startTime,
            confidence: 0.95, // Implement confidence scoring logic
          },
        });

        // Auto-remediation if enabled and violations found
        if (this.config.enableAutoRemediation && !result.compliant) {
          await this.executeAutoRemediation(result, validatedContext);
        }
      } catch (error) {
        // console.error(`Policy evaluation failed for ${policyId}:`, error);

        results.push({
          policyId,
          policyName: policy.name,
          compliant: false,
          violations: [
            {
              rule: "EVALUATION_ERROR",
              severity: "HIGH",
              message: `Policy evaluation failed: ${(error as Error).message}`,
            },
          ],
          remediationActions: [],
          metrics: {
            evaluationTime: performance.now() - startTime,
            confidence: 0,
          },
        });
      }
    }

    // Record governance metrics
    await this.recordGovernanceMetrics(validatedContext, results);

    return results;
  }

  /**
   * Evaluate individual policy
   */
  private async evaluatePolicy(
    policy: Policy,
    context: GovernanceContext,
  ): Promise<Omit<PolicyEvaluationResult, "metrics">> {
    const violations: PolicyEvaluationResult["violations"] = [];
    const remediationActions: PolicyEvaluationResult["remediationActions"] = [];

    for (const rule of policy.rules) {
      const violationFound = await this.evaluateRule(rule, context, policy);

      if (violationFound) {
        violations.push({
          rule: rule.condition,
          severity: rule.severity,
          message: `Policy violation: ${rule.condition}`,
          autoRemediation: rule.autoRemediation ? rule.action : undefined,
        });

        if (rule.autoRemediation) {
          remediationActions.push({
            action: rule.action,
            automated: true,
            priority: this.getSeverityPriority(rule.severity),
          });
        } else {
          remediationActions.push({
            action: `Manual intervention required: ${rule.action}`,
            automated: false,
            priority: this.getSeverityPriority(rule.severity),
          });
        }
      }
    }

    return {
      policyId: policy.id,
      policyName: policy.name,
      compliant: violations.length === 0,
      violations,
      remediationActions: remediationActions.sort(
        (a, b) => b.priority - a.priority,
      ),
    };
  }

  /**
   * Evaluate individual rule
   */
  private async evaluateRule(
    rule: Policy["rules"][0],
    context: GovernanceContext,
    policy: Policy,
  ): Promise<boolean> {
    // Healthcare-specific rule evaluation logic
    switch (rule.condition) {
      case "patient_data_access": {
        return this.evaluatePatientDataAccess(context);
      }

      case "data_retention_period > 365_days": {
        return this.evaluateDataRetention(context);
      }

      case "medical_procedure_modification": {
        return this.evaluateMedicalProcedureModification(context);
      }

      case "ai_prediction_confidence < 0.95": {
        return this.evaluateAIPredictionConfidence(context);
      }

      case "medical_professional_action": {
        return this.evaluateMedicalProfessionalAction(context);
      }

      default: {
        // Generic rule evaluation
        return this.evaluateGenericRule(rule.condition, context);
      }
    }
  }

  /**
   * Healthcare-specific rule evaluations
   */
  private async evaluatePatientDataAccess(
    context: GovernanceContext,
  ): Promise<boolean> {
    if (!context.patientId) {
      return false; // No patient data access
    }

    // Check patient consent in Supabase
    const { data: consent } = await this.supabase
      .from("patient_consent")
      .select("data_processing_consent")
      .eq("patient_id", context.patientId)
      .eq("active", true)
      .single();

    return !consent?.data_processing_consent; // Violation if no consent
  }

  private async evaluateDataRetention(
    context: GovernanceContext,
  ): Promise<boolean> {
    if (!context.patientId) {
      return false;
    }

    const { data: patientData } = await this.supabase
      .from("patient_data_audit")
      .select("created_at")
      .eq("patient_id", context.patientId)
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    if (!patientData) {
      return false;
    }

    const dataAge = Date.now() - new Date(patientData.created_at).getTime();
    const maxRetentionPeriod = 365 * 24 * 60 * 60 * 1000; // 365 days in milliseconds

    return dataAge > maxRetentionPeriod; // Violation if data is too old
  }

  private async evaluateMedicalProcedureModification(
    context: GovernanceContext,
  ): Promise<boolean> {
    return (
      context.operation.includes("procedure") &&
      (context.operation.includes("create") ||
        context.operation.includes("update") ||
        context.operation.includes("delete"))
    );
  }

  private async evaluateAIPredictionConfidence(
    context: GovernanceContext,
  ): Promise<boolean> {
    // Check if this is an AI prediction operation
    if (!context.operation.includes("prediction")) {
      return false;
    }

    // This would typically check the AI model confidence score
    // For now, assume it's passed in metadata
    const confidence = context.metadata?.aiConfidence as number;
    return confidence !== undefined && confidence < 0.95;
  }

  private async evaluateMedicalProfessionalAction(
    context: GovernanceContext,
  ): Promise<boolean> {
    if (!context.userId) {
      return false;
    }

    // Check if user is a medical professional and has valid CFM license
    const { data: professional } = await this.supabase
      .from("medical_professionals")
      .select("cfm_license_valid, cfm_license_expiry")
      .eq("user_id", context.userId)
      .single();

    if (!professional) {
      return true; // Violation: medical action by non-professional
    }

    const licenseExpired =
      professional.cfm_license_expiry &&
      new Date(professional.cfm_license_expiry) < new Date();

    return !professional.cfm_license_valid || licenseExpired;
  }

  private async evaluateGenericRule(
    condition: string,
    context: GovernanceContext,
  ): Promise<boolean> {
    // Implement generic rule evaluation logic
    // This could use a rule engine or simple condition parsing
    return false; // Default: no violation
  }

  /**
   * Execute auto-remediation actions
   */
  private async executeAutoRemediation(
    result: Omit<PolicyEvaluationResult, "metrics">,
    context: GovernanceContext,
  ): Promise<void> {
    for (const action of result.remediationActions.filter((a) => a.automated)) {
      try {
        await this.executeRemediationAction(action.action, context);

        // Log remediation
        await this.supabase.from("governance_remediations").insert({
          policy_id: result.policyId,
          service_id: context.serviceId,
          action: action.action,
          automated: true,
          executed_at: new Date().toISOString(),
          context: context,
        });
      } catch (error) {
        // console.error(`Auto-remediation failed for ${action.action}:`, error);

        // Log failed remediation
        await this.supabase.from("governance_remediation_failures").insert({
          policy_id: result.policyId,
          service_id: context.serviceId,
          action: action.action,
          error: (error as Error).message,
          failed_at: new Date().toISOString(),
          context: context,
        });
      }
    }
  }

  /**
   * Execute specific remediation action
   */
  private async executeRemediationAction(
    action: string,
    context: GovernanceContext,
  ): Promise<void> {
    switch (action) {
      case "validate_consent": {
        await this.remediateConsentValidation(context);
        break;
      }

      case "audit_trail_required": {
        await this.remediateAuditTrail(context);
        break;
      }

      case "require_human_validation": {
        await this.remediateHumanValidation(context);
        break;
      }

      case "validate_cfm_license": {
        await this.remediateCFMLicenseValidation(context);
        break;
      }

      default: {
        throw new Error(`Unknown remediation action: ${action}`);
      }
    }
  }

  /**
   * Remediation implementations
   */
  private async remediateConsentValidation(
    context: GovernanceContext,
  ): Promise<void> {
    if (!context.patientId) {
      return;
    }

    // Create pending consent validation
    await this.supabase.from("pending_consent_validations").insert({
      patient_id: context.patientId,
      service_id: context.serviceId,
      operation: context.operation,
      created_at: new Date().toISOString(),
      status: "PENDING",
    });
  }

  private async remediateAuditTrail(context: GovernanceContext): Promise<void> {
    // Enhanced audit logging for medical procedures
    await this.supabase.from("enhanced_audit_trail").insert({
      service_id: context.serviceId,
      operation: context.operation,
      user_id: context.userId,
      patient_id: context.patientId,
      context: context,
      compliance_required: true,
      created_at: new Date().toISOString(),
    });
  }

  private async remediateHumanValidation(
    context: GovernanceContext,
  ): Promise<void> {
    // Create human validation requirement
    await this.supabase.from("pending_human_validations").insert({
      service_id: context.serviceId,
      operation: context.operation,
      ai_confidence: context.metadata?.aiConfidence,
      context: context,
      status: "PENDING_REVIEW",
      priority: "HIGH",
      created_at: new Date().toISOString(),
    });
  }

  private async remediateCFMLicenseValidation(
    context: GovernanceContext,
  ): Promise<void> {
    if (!context.userId) {
      return;
    }

    // Trigger CFM license validation
    await this.supabase.from("cfm_license_validations").insert({
      user_id: context.userId,
      service_id: context.serviceId,
      operation: context.operation,
      validation_required_at: new Date().toISOString(),
      status: "PENDING",
    });
  }

  /**
   * Get severity priority for sorting
   */
  private getSeverityPriority(
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  ): number {
    const priorities = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
    return priorities[severity];
  }

  /**
   * Record governance metrics
   */
  private async recordGovernanceMetrics(
    context: GovernanceContext,
    results: PolicyEvaluationResult[],
  ): Promise<void> {
    const { length: totalPolicies } = results;
    const compliantPolicies = results.filter((r) => r.compliant).length;
    const totalViolations = results.reduce(
      (sum, r) => sum + r.violations.length,
      0,
    );
    const criticalViolations = results.reduce(
      (sum, r) =>
        sum + r.violations.filter((v) => v.severity === "CRITICAL").length,
      0,
    );
    const autoRemediations = results.reduce(
      (sum, r) => sum + r.remediationActions.filter((a) => a.automated).length,
      0,
    );
    const manualInterventions = results.reduce(
      (sum, r) => sum + r.remediationActions.filter((a) => !a.automated).length,
      0,
    );

    const metrics: GovernanceMetrics = {
      serviceId: context.serviceId,
      timestamp: context.timestamp,
      policyCompliance: (compliantPolicies / totalPolicies) * 100,
      performanceScore: 85, // TODO: Calculate based on actual performance metrics
      securityScore: 90, // TODO: Calculate based on security assessments
      complianceScore: (compliantPolicies / totalPolicies) * 100,
      totalViolations,
      criticalViolations,
      autoRemediations,
      manualInterventions,
    };

    const validatedMetrics = GovernanceMetricsSchema.parse(metrics);

    // Store in local cache
    this.governanceMetrics.set(context.serviceId, validatedMetrics);

    // Buffer for batch insertion
    this.metricsBuffer.push(validatedMetrics);

    // Flush buffer if it's getting large
    if (this.metricsBuffer.length >= 100) {
      await this.flushMetricsBuffer();
    }
  }

  /**
   * Flush metrics buffer to database
   */
  private async flushMetricsBuffer(): Promise<void> {
    if (this.metricsBuffer.length === 0) {
      return;
    }

    try {
      await this.supabase.from("governance_metrics").insert(this.metricsBuffer);

      this.metricsBuffer.length = 0; // Clear buffer
    } catch (error) {
      // console.error("Failed to flush governance metrics:", error);
    }
  }

  /**
   * Start real-time governance monitoring
   */
  private async startRealTimeMonitoring(): Promise<void> {
    // Monitor governance metrics every 5 minutes
    const metricsInterval = setInterval(
      async () => {
        await this.flushMetricsBuffer();
        await this.generateGovernanceReport();
      },
      5 * 60 * 1000,
    );

    this.monitoringIntervals.set("metrics", metricsInterval);

    // console.log("📊 Started real-time governance monitoring");
  }

  /**
   * Generate governance report
   */
  private async generateGovernanceReport(): Promise<void> {
    const services = [...this.governanceMetrics.keys()];

    for (const serviceId of services) {
      const metrics = this.governanceMetrics.get(serviceId);
      if (!metrics) {
        continue;
      }

      // Check for critical issues
      if (metrics.criticalViolations > 0 || metrics.policyCompliance < 80) {
        await this.sendGovernanceAlert({
          serviceId,
          severity: "HIGH",
          message: `Service ${serviceId} has governance issues: ${metrics.criticalViolations} critical violations, ${metrics.policyCompliance.toFixed(
            1,
          )}% compliance`,
          metrics,
        });
      }
    }
  }

  /**
   * Send governance alert
   */
  private async sendGovernanceAlert(alert: {
    serviceId: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    message: string;
    metrics: GovernanceMetrics;
  }): Promise<void> {
    if (!this.config.alerting.enabled) {
      return;
    }

    // Store alert in database
    await this.supabase.from("governance_alerts").insert({
      service_id: alert.serviceId,
      severity: alert.severity,
      message: alert.message,
      metrics: alert.metrics,
      created_at: new Date().toISOString(),
      resolved: false,
    });

    // console.warn(`🚨 Governance Alert [${alert.severity}]: ${alert.message}`);
  }

  /**
   * Get governance dashboard data
   */
  public async getGovernanceDashboard(): Promise<{
    overview: {
      totalServices: number;
      averageCompliance: number;
      totalViolations: number;
      criticalIssues: number;
    };
    services: {
      serviceId: string;
      compliance: number;
      violations: number;
      lastCheck: string;
      status: "HEALTHY" | "WARNING" | "CRITICAL";
    }[];
    trends: {
      compliance: { date: string; value: number }[];
      violations: { date: string; value: number }[];
    };
    alerts: {
      id: string;
      severity: string;
      message: string;
      timestamp: string;
      resolved: boolean;
    }[];
  }> {
    // Get recent metrics
    const { data: metrics } = await this.supabase
      .from("governance_metrics")
      .select("*")
      .gte(
        "timestamp",
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      )
      .order("timestamp", { ascending: false });

    // Get recent alerts
    const { data: alerts } = await this.supabase
      .from("governance_alerts")
      .select("*")
      .gte(
        "created_at",
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      )
      .order("created_at", { ascending: false })
      .limit(50);

    // Process metrics for dashboard
    const servicesMap = new Map<string, GovernanceMetrics>();
    for (const metric of metrics || []) {
      const validated = GovernanceMetricsSchema.parse(metric);
      if (!servicesMap.has(validated.serviceId)) {
        servicesMap.set(validated.serviceId, validated);
      }
    }

    const services = [...servicesMap.values()].map((metric) => ({
      serviceId: metric.serviceId,
      compliance: metric.policyCompliance,
      violations: metric.totalViolations,
      lastCheck: metric.timestamp,
      status: this.getServiceStatus(metric),
    }));

    const { length: totalServices } = services;
    const averageCompliance =
      services.reduce((sum, s) => sum + s.compliance, 0) / totalServices || 0;
    const totalViolations = services.reduce((sum, s) => sum + s.violations, 0);
    const criticalIssues = services.filter(
      (s) => s.status === "CRITICAL",
    ).length;

    // Generate trends (simplified)
    const complianceTrend = this.generateTrendData(
      metrics || [],
      "policyCompliance",
    );
    const violationsTrend = this.generateTrendData(
      metrics || [],
      "totalViolations",
    );

    return {
      overview: {
        totalServices,
        averageCompliance: Math.round(averageCompliance * 100) / 100,
        totalViolations,
        criticalIssues,
      },
      services,
      trends: {
        compliance: complianceTrend,
        violations: violationsTrend,
      },
      alerts: (alerts || []).map((alert) => ({
        id: alert.id,
        severity: alert.severity,
        message: alert.message,
        timestamp: alert.created_at,
        resolved: alert.resolved,
      })),
    };
  }

  /**
   * Get service status based on metrics
   */
  private getServiceStatus(
    metrics: GovernanceMetrics,
  ): "HEALTHY" | "WARNING" | "CRITICAL" {
    if (metrics.criticalViolations > 0 || metrics.policyCompliance < 70) {
      return "CRITICAL";
    }
    if (metrics.totalViolations > 5 || metrics.policyCompliance < 90) {
      return "WARNING";
    }
    return "HEALTHY";
  }

  /**
   * Generate trend data for dashboard
   */
  private generateTrendData(
    metrics: unknown[],
    field: keyof GovernanceMetrics,
  ): { date: string; value: number }[] {
    // Group by date and calculate averages
    const daily = new Map<string, number[]>();

    for (const metric of metrics) {
      const date = new Date(metric.timestamp).toISOString().split("T")[0];
      if (!daily.has(date)) {
        daily.set(date, []);
      }
      daily.get(date)!.push(metric[field] as number);
    }

    return [...daily.entries()]
      .map(([date, values]) => ({
        date,
        value: values.reduce((sum, v) => sum + v, 0) / values.length,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Shutdown governance monitoring
   */
  public async shutdown(): Promise<void> {
    // Clear monitoring intervals
    for (const [name, interval] of this.monitoringIntervals) {
      clearInterval(interval);
      // console.log(`⏹️ Stopped monitoring: ${name}`);
    }

    // Flush remaining metrics
    await this.flushMetricsBuffer();

    // console.log("🏛️ Service Constitution shutdown complete");
  }
}
