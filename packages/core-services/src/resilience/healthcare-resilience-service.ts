/**
 * Healthcare-Specific Resilience Service
 *
 * Extends the base resilience framework with healthcare-specific requirements:
 * - LGPD-compliant error handling
 * - Emergency operation prioritization
 * - Medical data protection
 * - Compliance-aware fallback strategies
 */

import {
  ResilienceFramework,
  ResilienceConfig,
  ExecutionContext,
  DEFAULT_HEALTHCARE_RESILIENCE_CONFIG,
  EMERGENCY_RESILIENCE_CONFIG,
  type ResilienceMetrics,
  type ServiceHealth,
} from "./resilience-framework";

import {
  HealthcareDataClassification,
  DataCategory as LGPDDataCategory,
  HealthcareAIUseCase,
} from "@neonpro/shared";

// ============================================================================
// Healthcare-Specific Types
// ============================================================================

export interface HealthcareExecutionContext extends ExecutionContext {
  // Healthcare-specific context
  dataClassification: HealthcareDataClassification;
  lgpdCategories: LGPDDataCategory[];
  healthcareUseCase: HealthcareAIUseCase;
  patientId?: string;
  professionalId?: string;
  requiresPIIProtection: boolean;
  isLifeCritical: boolean;
  requiresConsent: boolean;
}

export interface HealthcareResilienceConfig extends ResilienceConfig {
  // Healthcare-specific settings
  healthcare: {
    // Emergency handling
    emergencyOverrideEnabled: boolean;
    emergencyTimeoutMultiplier: number;

    // Data protection
    piiProtectionEnabled: boolean;
    dataEncryptionRequired: boolean;

    // Compliance
    lgpdAuditLogging: boolean;
    auditRetentionDays: number;

    // Medical device integration (if applicable)
    medicalDeviceIntegration: boolean;
    deviceTimeoutMs: number;

    // Telemedicine resilience
    telemedicinePriority: boolean;
    minimumConnectionQuality: number;
  };
}

// ============================================================================
// Healthcare Resilience Service
// ============================================================================

export class HealthcareResilienceService {
  private resilienceFramework: ResilienceFramework;
  private auditLog: Array<{
    timestamp: Date;
    operation: string;
    _service: string;
    _context: HealthcareExecutionContext;
    success: boolean;
    error?: string;
    latency: number;
    retries: number;
  }> = [];

  constructor(config: HealthcareResilienceConfig) {
    this.resilienceFramework = new ResilienceFramework(config);
  }

  async executeHealthcareOperation<T>(
    serviceName: string,
    operation: () => Promise<T>,
    _context: HealthcareExecutionContext,
  ): Promise<T> {
    const startTime = Date.now();
    let retries = 0;
    let success = false;
    let error: string | undefined;

    try {
      // Apply emergency configuration if needed
      this.getEffectiveConfig(context);

      // Execute with resilience framework
      const result = await this.resilienceFramework.execute(
        serviceName,
        async () => {
          retries++;
          return await operation();
        },
        this.adaptContext(context),
      );

      success = true;
      return result;
    } catch (err) {
      error = (err as Error).message;
      success = false;

      // Apply healthcare-specific error handling
      await this.handleHealthcareError(err as Error, context);

      throw err;
    } finally {
      // Audit log for compliance
      await this.auditHealthcareOperation({
        timestamp: new Date(),
        operation: context.operation,
        _service: serviceName,
        context,
        success,
        error,
        latency: Date.now() - startTime,
        retries: retries - 1,
      });
    }
  }

  private getEffectiveConfig(
    _context: HealthcareExecutionContext,
  ): ResilienceConfig {
    if (context.isEmergency || context.isLifeCritical) {
      return EMERGENCY_RESILIENCE_CONFIG;
    }

    if (
      context.dataClassification ===
      HealthcareDataClassification.PATIENT_SENSITIVE
    ) {
      // Stricter configuration for sensitive data
      return {
        ...DEFAULT_HEALTHCARE_RESILIENCE_CONFIG,
        timeout: {
          ...DEFAULT_HEALTHCARE_RESILIENCE_CONFIG.timeout,
          overallMs:
            DEFAULT_HEALTHCARE_RESILIENCE_CONFIG.timeout.overallMs * 1.5,
        },
      };
    }

    return DEFAULT_HEALTHCARE_RESILIENCE_CONFIG;
  }

  private adaptContext(_context: HealthcareExecutionContext): ExecutionContext {
    return {
      operation: context.operation,
      serviceName: context.serviceName,
      _userId: context.userId,
      patientId: context.patientId,
      isEmergency: context.isEmergency || context.isLifeCritical,
      requiresAudit: true, // Always audit healthcare operations
      metadata: {
        dataClassification: context.dataClassification,
        lgpdCategories: context.lgpdCategories,
        healthcareUseCase: context.healthcareUseCase,
        requiresPIIProtection: context.requiresPIIProtection,
        isLifeCritical: context.isLifeCritical,
      },
    };
  }

  private async handleHealthcareError(
    error: Error,
    _context: HealthcareExecutionContext,
  ): Promise<void> {
    // Specialized error handling for healthcare scenarios

    if (context.isLifeCritical) {
      // For life-critical operations, trigger emergency protocols
      await this.triggerEmergencyProtocol(error, _context);
    }

    if (
      context.dataClassification ===
      HealthcareDataClassification.PATIENT_SENSITIVE
    ) {
      // For sensitive data errors, initiate security review
      await this.initiateSecurityReview(error, _context);
    }

    // LGPD compliance - notify data protection officer for certain errors
    if (context.lgpdCategories.includes(LGPDDataCategory.SENSITIVE_DATA)) {
      await this.notifyDataProtectionError(error, _context);
    }
  }

  private async triggerEmergencyProtocol(
    error: Error,
    _context: HealthcareExecutionContext,
  ): Promise<void> {
    // In a real implementation, this would:
    // 1. Alert medical staff
    // 2. Activate backup systems
    // 3. Notify emergency services if needed
    // 4. Log emergency event for compliance

    console.error("EMERGENCY PROTOCOL TRIGGERED:", {
      error: error.message,
      operation: context.operation,
      patientId: context.patientId,
      timestamp: new Date().toISOString(),
    });
  }

  private async initiateSecurityReview(
    error: Error,
    _context: HealthcareExecutionContext,
  ): Promise<void> {
    // Security review for sensitive data handling errors
    console.warn("SECURITY REVIEW INITIATED:", {
      error: error.message,
      dataClassification: context.dataClassification,
      lgpdCategories: context.lgpdCategories,
      timestamp: new Date().toISOString(),
    });
  }

  private async notifyDataProtectionError(
    error: Error,
    _context: HealthcareExecutionContext,
  ): Promise<void> {
    // LGPD compliance notification
    console.warn("DATA PROTECTION ERROR:", {
      error: error.message,
      lgpdCategories: context.lgpdCategories,
      patientId: context.patientId,
      timestamp: new Date().toISOString(),
    });
  }

  private async auditHealthcareOperation(auditEntry: {
    timestamp: Date;
    operation: string;
    _service: string;
    _context: HealthcareExecutionContext;
    success: boolean;
    error?: string;
    latency: number;
    retries: number;
  }): Promise<void> {
    // Add to audit log
    this.auditLog.push(auditEntry);

    // Keep only last 30 days of audit logs
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    this.auditLog = this.auditLog.filter(
      (entry) => entry.timestamp >= thirtyDaysAgo,
    );

    // In a real implementation, this would persist to audit database
    // and potentially notify compliance monitoring systems
  }

  // Health check specific to healthcare services
  async checkHealthcareServiceHealth(serviceName: string): Promise<{
    isHealthy: boolean;
    responseTime: number;
    lastCheck: Date;
    complianceStatus: "compliant" | "warning" | "non_compliant";
    issues: string[];
  }> {
    const health = this.resilienceFramework.getServiceHealth(serviceName);

    if (!health) {
      return {
        isHealthy: false,
        responseTime: 0,
        lastCheck: new Date(),
        complianceStatus: "non_compliant",
        issues: ["Service not registered with resilience framework"],
      };
    }

    // Healthcare-specific compliance checks
    const issues: string[] = [];
    let complianceStatus: "compliant" | "warning" | "non_compliant" =
      "compliant";

    if (health.successRate < 0.95) {
      issues.push("Service success rate below 95% threshold");
      complianceStatus = "warning";
    }

    if (health.latency > 5000) {
      issues.push("Service response time above 5s threshold");
      complianceStatus = "warning";
    }

    if (health.successRate < 0.8) {
      issues.push("Service success rate critically low");
      complianceStatus = "non_compliant";
    }

    if (!health.isHealthy) {
      issues.push("Service currently unhealthy");
      complianceStatus = "non_compliant";
    }

    return {
      isHealthy: health.isHealthy,
      responseTime: health.latency,
      lastCheck: health.lastCheck,
      complianceStatus,
      issues,
    };
  }

  // Get healthcare-specific metrics
  getHealthcareMetrics(): {
    resilience: ResilienceMetrics;
    audit: {
      totalOperations: number;
      successRate: number;
      averageLatency: number;
      emergencyOperations: number;
      lifeCriticalOperations: number;
      complianceViolations: number;
    };
    services: Array<{
      serviceName: string;
      health: ServiceHealth;
      complianceStatus: "compliant" | "warning" | "non_compliant";
    }>;
  } {
    const services = Array.from(
      new Set(this.auditLog.map((entry) => entry._service)),
    );

    return {
      resilience: this.resilienceFramework.getMetrics(),
      audit: {
        totalOperations: this.auditLog.length,
        successRate: this.calculateSuccessRate(),
        averageLatency: this.calculateAverageLatency(),
        emergencyOperations: this.auditLog.filter(
          (entry) => entry.context.isEmergency || entry.context.isLifeCritical,
        ).length,
        lifeCriticalOperations: this.auditLog.filter(
          (entry) => entry.context.isLifeCritical,
        ).length,
        complianceViolations: this.auditLog.filter(
          (entry) =>
            !entry.success &&
            entry.context.lgpdCategories.includes(
              LGPDDataCategory.SENSITIVE_DATA,
            ),
        ).length,
      },
      services: services.map((serviceName) => {
        const health = this.resilienceFramework.getServiceHealth(serviceName);
        const recentFailures = this.auditLog.filter(
          (entry) => entry.service === serviceName && !entry.success,
        ).length;

        let complianceStatus: "compliant" | "warning" | "non_compliant" =
          "compliant";
        if (recentFailures > 5) complianceStatus = "non_compliant";
        else if (recentFailures > 2) complianceStatus = "warning";

        return {
          serviceName,
          health: health || {
            serviceName,
            isHealthy: false,
            latency: 0,
            successRate: 0,
            lastCheck: new Date(),
            consecutiveFailures: 0,
            consecutiveSuccesses: 0,
          },
          complianceStatus,
        };
      }),
    };
  }

  private calculateSuccessRate(): number {
    if (this.auditLog.length === 0) return 1;

    const successful = this.auditLog.filter((entry) => entry.success).length;
    return successful / this.auditLog.length;
  }

  private calculateAverageLatency(): number {
    if (this.auditLog.length === 0) return 0;

    const totalLatency = this.auditLog.reduce(
      (sum, _entry) => sum + entry.latency,
      0,
    );
    return totalLatency / this.auditLog.length;
  }

  // Generate compliance report
  generateComplianceReport(): {
    reportPeriod: {
      start: Date;
      end: Date;
    };
    lgpdCompliance: {
      totalOperations: number;
      compliantOperations: number;
      nonCompliantOperations: number;
      complianceRate: number;
    };
    serviceAvailability: {
      overallUptime: number;
      criticalServicesUptime: number;
      incidents: Array<{
        _service: string;
        timestamp: Date;
        duration: number;
        impact: "low" | "medium" | "high" | "critical";
      }>;
    };
    recommendations: string[];
  } {
    const end = new Date();
    const start = new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24 hours

    const periodAuditLog = this.auditLog.filter(
      (entry) => entry.timestamp >= start && entry.timestamp <= end,
    );

    const sensitiveDataOperations = periodAuditLog.filter((entry) =>
      entry.context.lgpdCategories.includes(LGPDDataCategory.SENSITIVE_DATA),
    );

    const lgpdCompliance = {
      totalOperations: sensitiveDataOperations.length,
      compliantOperations: sensitiveDataOperations.filter(
        (entry) => entry.success,
      ).length,
      nonCompliantOperations: sensitiveDataOperations.filter(
        (entry) => !entry.success,
      ).length,
      complianceRate:
        sensitiveDataOperations.length > 0
          ? sensitiveDataOperations.filter((entry) => entry.success).length /
            sensitiveDataOperations.length
          : 1,
    };

    // Generate recommendations based on analysis
    const recommendations: string[] = [];

    if (lgpdCompliance.complianceRate < 0.99) {
      recommendations.push(
        "Review and improve LGPD compliance procedures for sensitive health data",
      );
    }

    if (this.calculateSuccessRate() < 0.95) {
      recommendations.push(
        "Implement additional redundancy for critical healthcare services",
      );
    }

    const criticalServices = this.getHealthcareMetrics().services.filter(
      (s) => s.complianceStatus === "non_compliant",
    );

    if (criticalServices.length > 0) {
      recommendations.push(
        `Immediate attention required for ${criticalServices.length} non-compliant services`,
      );
    }

    return {
      reportPeriod: { start, end },
      lgpdCompliance,
      serviceAvailability: {
        overallUptime: this.calculateSuccessRate(),
        criticalServicesUptime: lgpdCompliance.complianceRate,
        incidents: [], // Would be populated from incident tracking system
      },
      recommendations,
    };
  }
}

// ============================================================================
// Default Healthcare Resilience Configuration
// ============================================================================

export const DEFAULT_HEALTHCARE_RESILIENCE_SERVICE_CONFIG: HealthcareResilienceConfig =
  {
    ...DEFAULT_HEALTHCARE_RESILIENCE_CONFIG,
    healthcare: {
      emergencyOverrideEnabled: true,
      emergencyTimeoutMultiplier: 2,
      piiProtectionEnabled: true,
      dataEncryptionRequired: true,
      lgpdAuditLogging: true,
      auditRetentionDays: 365,
      medicalDeviceIntegration: false,
      deviceTimeoutMs: 10000,
      telemedicinePriority: true,
      minimumConnectionQuality: 0.7,
    },
  };
