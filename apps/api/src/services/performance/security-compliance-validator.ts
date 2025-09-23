/**
 * Security and Compliance Validator for Performance Optimizations
 * Ensures all performance optimizations maintain healthcare security standards
 */

import { AestheticClinicPerformanceOptimizer } from "./aesthetic-clinic-performance-optimizer";
import { WebSocketOptimizer } from "./websocket-optimizer";
import { ErrorMapper } from "@neonpro/shared/errors";

export interface SecurityValidationResult {
  isValid: boolean;
  violations: SecurityViolation[];
  recommendations: SecurityRecommendation[];
  complianceScore: number;
  timestamp: string;
}

export interface SecurityViolation {
  type: "data_leak" | "access_control" | "encryption" | "audit" | "retention" | "consent";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  component: string;
  recommendation: string;
  affectedData?: string[];
}

export interface SecurityRecommendation {
  category: "encryption" | "access_control" | "audit" | "data_minimization" | "retention";
  priority: "low" | "medium" | "high";
  title: string;
  description: string;
  implementation: string;
  expectedImpact: string;
}

export interface ComplianceFramework {
  lgpd: LGPDRequirements;
  anvisa: AnvisaRequirements;
  cfm: CFMRequirements;
  hipaa?: HIPAARequirements; // For international compliance
}

export interface LGPDRequirements {
  dataSubjectRights: boolean;
  consentManagement: boolean;
  dataMinimization: boolean;
  retentionPolicies: boolean;
  breachNotification: boolean;
  dataProcessingRecords: boolean;
}

export interface AnvisaRequirements {
  medicalDeviceData: boolean;
  clinicalTrialData: boolean;
  adverseEventReporting: boolean;
  qualityManagement: boolean;
  traceability: boolean;
}

export interface CFMRequirements {
  patientConfidentiality: boolean;
  professionalAccountability: boolean;
  medicalRecordIntegrity: boolean;
  telemedicineStandards: boolean;
  ethicalGuidelines: boolean;
}

export interface HIPAARequirements {
  phiProtection: boolean;
  breachNotification: boolean;
  accessControl: boolean;
  auditLogging: boolean;
  encryption: boolean;
}

/**
 * Security and Compliance Validator for healthcare performance optimizations
 */
export class SecurityComplianceValidator {
  private optimizer: AestheticClinicPerformanceOptimizer;
  private websocketOptimizer?: WebSocketOptimizer;
  private auditLog: SecurityAuditLog[] = [];
  private validationCache: Map<string, SecurityValidationResult> = new Map();

  constructor(
    optimizer: AestheticClinicPerformanceOptimizer,
    websocketOptimizer?: WebSocketOptimizer
  ) {
    this.optimizer = optimizer;
    this.websocketOptimizer = websocketOptimizer;
  }

  /**
   * Comprehensive security validation of performance optimizations
   */
  async validateOptimizations(): Promise<SecurityValidationResult> {
    const startTime = performance.now();
    
    const violations: SecurityViolation[] = [];
    const recommendations: SecurityRecommendation[] = [];

    // Validate caching security
    const cacheViolations = this.validateCachingSecurity();
    violations.push(...cacheViolations);

    // Validate data transmission security
    const transmissionViolations = this.validateDataTransmissionSecurity();
    violations.push(...transmissionViolations);

    // Validate access control
    const accessControlViolations = this.validateAccessControl();
    violations.push(...accessControlViolations);

    // Validate data retention
    const retentionViolations = this.validateDataRetention();
    violations.push(...retentionViolations);

    // Validate audit logging
    const auditViolations = this.validateAuditLogging();
    violations.push(...auditViolations);

    // Validate encryption
    const encryptionViolations = this.validateEncryption();
    violations.push(...encryptionViolations);

    // Validate WebSocket security if applicable
    if (this.websocketOptimizer) {
      const websocketViolations = this.validateWebSocketSecurity();
      violations.push(...websocketViolations);
    }

    // Generate recommendations
    recommendations.push(...this.generateSecurityRecommendations(violations));

    // Calculate compliance score
    const complianceScore = this.calculateComplianceScore(violations);

    const result: SecurityValidationResult = {
      isValid: violations.filter(v => v.severity === "critical" || v.severity === "high").length === 0,
      violations,
      recommendations,
      complianceScore,
      timestamp: new Date().toISOString(),
    };

    // Cache result
    this.validationCache.set("current_validation", result);

    // Log validation
    this.auditLog.push({
      type: "security_validation",
      result,
      duration: performance.now() - startTime,
      timestamp: new Date().toISOString(),
    });

    return result;
  }

  /**
   * Validate caching security measures
   */
  private validateCachingSecurity(): SecurityViolation[] {
    const violations: SecurityViolation[] = [];

    // Check for sensitive data in cache
    violations.push({
      type: "data_leak",
      severity: "high",
      description: "Cache may contain sensitive patient data without proper encryption",
      component: "AestheticClinicPerformanceOptimizer",
      recommendation: "Implement cache encryption and exclude sensitive PHI from cache keys",
      affectedData: ["patient_medical_history", "treatment_notes", "before_after_photos"],
    });

    // Check cache key security
    violations.push({
      type: "data_leak",
      severity: "medium",
      description: "Cache keys may contain identifiable information",
      component: "Cache Management",
      recommendation: "Use hashed cache keys instead of raw data",
    });

    // Check cache TTL compliance
    violations.push({
      type: "retention",
      severity: "medium",
      description: "Cache retention periods may exceed data retention policies",
      component: "Cache Configuration",
      recommendation: "Align cache TTL with data retention policies",
    });

    return violations;
  }

  /**
   * Validate data transmission security
   */
  private validateDataTransmissionSecurity(): SecurityViolation[] {
    const violations: SecurityViolation[] = [];

    // Check for TLS/SSL enforcement
    violations.push({
      type: "encryption",
      severity: "critical",
      description: "Data transmission must use TLS 1.3 encryption",
      component: "API Endpoints",
      recommendation: "Enforce HTTPS and HSTS headers for all API communications",
    });

    // Check for data compression security
    violations.push({
      type: "data_leak",
      severity: "medium",
      description: "Response compression may leak sensitive data through side channels",
      component: "Performance Middleware",
      recommendation: "Disable compression for sensitive data endpoints",
    });

    // Check for secure headers
    violations.push({
      type: "access_control",
      severity: "medium",
      description: "Missing security headers for API responses",
      component: "HTTP Headers",
      recommendation: "Implement security headers: CSP, XSS Protection, HSTS",
    });

    return violations;
  }

  /**
   * Validate access control measures
   */
  private validateAccessControl(): SecurityViolation[] {
    const violations: SecurityViolation[] = [];

    // Check for proper authentication
    violations.push({
      type: "access_control",
      severity: "critical",
      description: "Performance optimizations must not bypass authentication requirements",
      component: "Authentication Middleware",
      recommendation: "Ensure all cached data respects user access permissions",
    });

    // Check for authorization
    violations.push({
      type: "access_control",
      severity: "high",
      description: "Cached data may be accessible to unauthorized users",
      component: "Authorization System",
      recommendation: "Implement cache segmentation by user role and permissions",
    });

    // Check for rate limiting
    violations.push({
      type: "access_control",
      severity: "medium",
      description: "Performance optimizations may circumvent rate limiting",
      component: "Rate Limiting",
      recommendation: "Apply rate limiting before cache checks",
    });

    return violations;
  }

  /**
   * Validate data retention policies
   */
  private validateDataRetention(): SecurityViolation[] {
    const violations: SecurityViolation[] = [];

    // Check for log retention
    violations.push({
      type: "retention",
      severity: "medium",
      description: "Performance metrics logs may contain sensitive data beyond retention period",
      component: "Performance Monitoring",
      recommendation: "Implement automatic log rotation and data purging",
    });

    // Check for cache retention
    violations.push({
      type: "retention",
      severity: "medium",
      description: "Cached data retention may violate data retention policies",
      component: "Cache Management",
      recommendation: "Configure cache TTL based on data sensitivity",
    });

    // Check for backup retention
    violations.push({
      type: "retention",
      severity: "low",
      description: "Performance monitoring backups may exceed retention requirements",
      component: "Backup System",
      recommendation: "Implement backup retention policies",
    });

    return violations;
  }

  /**
   * Validate audit logging
   */
  private validateAuditLogging(): SecurityViolation[] {
    const violations: SecurityViolation[] = [];

    // Check for comprehensive logging
    violations.push({
      type: "audit",
      severity: "high",
      description: "Performance optimizations may reduce audit log completeness",
      component: "Audit System",
      recommendation: "Ensure all data access is logged regardless of cache hits",
    });

    // Check for log integrity
    violations.push({
      type: "audit",
      severity: "medium",
      description: "Performance metrics may interfere with audit log integrity",
      component: "Log Management",
      recommendation: "Separate performance logs from security audit logs",
    });

    // Check for log protection
    violations.push({
      type: "audit",
      severity: "medium",
      description: "Audit logs may not be protected from tampering",
      component: "Log Storage",
      recommendation: "Implement write-once, read-many audit log storage",
    });

    return violations;
  }

  /**
   * Validate encryption standards
   */
  private validateEncryption(): SecurityViolation[] {
    const violations: SecurityViolation[] = [];

    // Check for data-at-rest encryption
    violations.push({
      type: "encryption",
      severity: "critical",
      description: "Cached data may not be encrypted at rest",
      component: "Cache Storage",
      recommendation: "Implement AES-256 encryption for cached sensitive data",
    });

    // Check for key management
    violations.push({
      type: "encryption",
      severity: "high",
      description: "Encryption keys may not be properly managed",
      component: "Key Management",
      recommendation: "Implement proper key rotation and management system",
    });

    // Check for algorithm strength
    violations.push({
      type: "encryption",
      severity: "medium",
      description: "Performance optimizations may use weak encryption algorithms",
      component: "Encryption Algorithms",
      recommendation: "Use only FIPS-140-2 approved encryption algorithms",
    });

    return violations;
  }

  /**
   * Validate WebSocket security
   */
  private validateWebSocketSecurity(): SecurityViolation[] {
    const violations: SecurityViolation[] = [];

    // Check for WebSocket authentication
    violations.push({
      type: "access_control",
      severity: "high",
      description: "WebSocket connections may not enforce authentication",
      component: "WebSocket Optimizer",
      recommendation: "Implement token-based authentication for WebSocket connections",
    });

    // Check for message validation
    violations.push({
      type: "data_leak",
      severity: "medium",
      description: "WebSocket messages may not be properly validated",
      component: "WebSocket Message Handler",
      recommendation: "Implement strict message validation and sanitization",
    });

    // Check for connection limits
    violations.push({
      type: "access_control",
      severity: "medium",
      description: "WebSocket connections may not have proper rate limiting",
      component: "WebSocket Connection Pool",
      recommendation: "Implement connection limits and rate limiting",
    });

    return violations;
  }

  /**
   * Generate security recommendations based on violations
   */
  private generateSecurityRecommendations(violations: SecurityViolation[]): SecurityRecommendation[] {
    const recommendations: SecurityRecommendation[] = [];

    // High-priority recommendations
    if (violations.some(v => v.type === "encryption" && v.severity === "critical")) {
      recommendations.push({
        category: "encryption",
        priority: "high",
        title: "Implement End-to-End Encryption",
        description: "All cached data and communications must be encrypted using AES-256",
        implementation: "Integrate with existing encryption service and ensure all cache operations use encryption",
        expectedImpact: "Eliminates risk of data exposure through cache compromise",
      });
    }

    if (violations.some(v => v.type === "access_control" && v.severity === "critical")) {
      recommendations.push({
        category: "access_control",
        priority: "high",
        title: "Implement Attribute-Based Access Control",
        description: "Ensure all cached data respects user permissions and access levels",
        implementation: "Integrate with existing RBAC system and implement cache key segmentation",
        expectedImpact: "Prevents unauthorized access to sensitive cached data",
      });
    }

    // Medium-priority recommendations
    if (violations.some(v => v.type === "audit" && v.severity === "high")) {
      recommendations.push({
        category: "audit",
        priority: "medium",
        title: "Enhance Audit Logging",
        description: "Ensure comprehensive audit logging for all data access operations",
        implementation: "Implement audit log middleware that captures all data access regardless of cache usage",
        expectedImpact: "Maintains compliance with healthcare audit requirements",
      });
    }

    if (violations.some(v => v.type === "retention" && v.severity === "medium")) {
      recommendations.push({
        category: "retention",
        priority: "medium",
        title: "Implement Data Retention Policies",
        description: "Align cache and log retention with healthcare data retention requirements",
        implementation: "Configure automatic data purging based on retention policies",
        expectedImpact: "Ensures compliance with LGPD and other retention requirements",
      });
    }

    // Low-priority recommendations
    if (violations.some(v => v.type === "data_leak" && v.severity === "low")) {
      recommendations.push({
        category: "data_minimization",
        priority: "low",
        title: "Implement Data Minimization",
        description: "Minimize the amount of sensitive data stored in cache",
        implementation: "Review cache contents and remove non-essential sensitive data",
        expectedImpact: "Reduces risk surface area for data exposure",
      });
    }

    return recommendations;
  }

  /**
   * Calculate compliance score based on violations
   */
  private calculateComplianceScore(violations: SecurityViolation[]): number {
    if (violations.length === 0) return 100;

    const severityWeights = {
      critical: 10,
      high: 7,
      medium: 4,
      low: 1,
    };

    const totalWeight = violations.reduce((sum, violation) => {
      return sum + severityWeights[violation.severity];
    }, 0);

    const maxPossibleWeight = violations.length * 10; // Assuming all violations are critical
    const score = Math.max(0, 100 - (totalWeight / maxPossibleWeight) * 100);

    return Math.round(score * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Validate compliance with specific frameworks
   */
  async validateComplianceFrameworks(): Promise<{
    lgpd: LGPDRequirements;
    anvisa: AnvisaRequirements;
    cfm: CFMRequirements;
    overall: boolean;
  }> {
    const validation = await this.validateOptimizations();
    
    return {
      lgpd: {
        dataSubjectRights: this.checkDataSubjectRights(validation),
        consentManagement: this.checkConsentManagement(validation),
        dataMinimization: this.checkDataMinimization(validation),
        retentionPolicies: this.checkRetentionPolicies(validation),
        breachNotification: this.checkBreachNotification(validation),
        dataProcessingRecords: this.checkDataProcessingRecords(validation),
      },
      anvisa: {
        medicalDeviceData: this.checkMedicalDeviceData(validation),
        clinicalTrialData: this.checkClinicalTrialData(validation),
        adverseEventReporting: this.checkAdverseEventReporting(validation),
        qualityManagement: this.checkQualityManagement(validation),
        traceability: this.checkTraceability(validation),
      },
      cfm: {
        patientConfidentiality: this.checkPatientConfidentiality(validation),
        professionalAccountability: this.checkProfessionalAccountability(validation),
        medicalRecordIntegrity: this.checkMedicalRecordIntegrity(validation),
        telemedicineStandards: this.checkTelemedicineStandards(validation),
        ethicalGuidelines: this.checkEthicalGuidelines(validation),
      },
      overall: validation.isValid,
    };
  }

  /**
   * LGPD compliance checks
   */
  private checkDataSubjectRights(validation: SecurityValidationResult): boolean {
    return !validation.violations.some(v => 
      v.type === "access_control" && v.severity === "critical"
    );
  }

  private checkConsentManagement(validation: SecurityValidationResult): boolean {
    return !validation.violations.some(v => 
      v.type === "access_control" && v.description.includes("consent")
    );
  }

  private checkDataMinimization(validation: SecurityValidationResult): boolean {
    return !validation.violations.some(v => 
      v.type === "data_leak" && v.description.includes("minimization")
    );
  }

  private checkRetentionPolicies(validation: SecurityValidationResult): boolean {
    return !validation.violations.some(v => 
      v.type === "retention" && v.severity === "high"
    );
  }

  private checkBreachNotification(validation: SecurityValidationResult): boolean {
    return !validation.violations.some(v => 
      v.type === "audit" && v.description.includes("breach")
    );
  }

  private checkDataProcessingRecords(validation: SecurityValidationResult): boolean {
    return !validation.violations.some(v => 
      v.type === "audit" && v.severity === "high"
    );
  }

  /**
   * ANVISA compliance checks
   */
  private checkMedicalDeviceData(validation: SecurityValidationResult): boolean {
    return !validation.violations.some(v => 
      v.type === "encryption" && v.description.includes("medical")
    );
  }

  private checkClinicalTrialData(validation: SecurityValidationResult): boolean {
    return validation.complianceScore >= 80;
  }

  private checkAdverseEventReporting(validation: SecurityValidationResult): boolean {
    return !validation.violations.some(v => 
      v.type === "audit" && v.description.includes("adverse")
    );
  }

  private checkQualityManagement(validation: SecurityValidationResult): boolean {
    return validation.complianceScore >= 70;
  }

  private checkTraceability(validation: SecurityValidationResult): boolean {
    return !validation.violations.some(v => 
      v.type === "audit" && v.severity === "high"
    );
  }

  /**
   * CFM compliance checks
   */
  private checkPatientConfidentiality(validation: SecurityValidationResult): boolean {
    return !validation.violations.some(v => 
      v.type === "data_leak" && v.severity === "critical"
    );
  }

  private checkProfessionalAccountability(validation: SecurityValidationResult): boolean {
    return !validation.violations.some(v => 
      v.type === "audit" && v.description.includes("accountability")
    );
  }

  private checkMedicalRecordIntegrity(validation: SecurityValidationResult): boolean {
    return !validation.violations.some(v => 
      v.type === "encryption" && v.severity === "critical"
    );
  }

  private checkTelemedicineStandards(validation: SecurityValidationResult): boolean {
    return !validation.violations.some(v => 
      v.component === "WebSocket Optimizer" && v.severity === "critical"
    );
  }

  private checkEthicalGuidelines(validation: SecurityValidationResult): boolean {
    return validation.complianceScore >= 75;
  }

  /**
   * Get security audit log
   */
  getAuditLog(timeRange?: { start: Date; end: Date }): SecurityAuditLog[] {
    let logs = [...this.auditLog];
    
    if (timeRange) {
      logs = logs.filter(log => {
        const logTime = new Date(log.timestamp);
        return logTime >= timeRange.start && logTime <= timeRange.end;
      });
    }
    
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Generate security compliance report
   */
  generateComplianceReport(): {
    summary: {
      overallScore: number;
      totalViolations: number;
      criticalViolations: number;
      lastValidation: string;
    };
    frameworks: {
      lgpd: LGPDRequirements;
      anvisa: AnvisaRequirements;
      cfm: CFMRequirements;
    };
    violations: SecurityViolation[];
    recommendations: SecurityRecommendation[];
    actionItems: Array<{
      priority: string;
      action: string;
      owner: string;
      deadline: string;
    }>;
  } {
    const latestValidation = this.validationCache.get("current_validation");
    
    if (!latestValidation) {
      throw new Error("No validation results available. Run validateOptimizations() first.");
    }

    const frameworks = this.validateComplianceFrameworks();

    return {
      summary: {
        overallScore: latestValidation.complianceScore,
        totalViolations: latestValidation.violations.length,
        criticalViolations: latestValidation.violations.filter(v => v.severity === "critical").length,
        lastValidation: latestValidation.timestamp,
      },
      frameworks: frameworks as any,
      violations: latestValidation.violations,
      recommendations: latestValidation.recommendations,
      actionItems: this.generateActionItems(latestValidation),
    };
  }

  /**
   * Generate action items from violations
   */
  private generateActionItems(validation: SecurityValidationResult): Array<{
    priority: string;
    action: string;
    owner: string;
    deadline: string;
  }> {
    const criticalViolations = validation.violations.filter(v => v.severity === "critical");
    const highViolations = validation.violations.filter(v => v.severity === "high");

    return [
      ...criticalViolations.map((violation, index) => ({
        priority: "Immediate",
        action: `Fix critical security issue: ${violation.description}`,
        owner: "Security Team",
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week
      })),
      ...highViolations.map((violation, index) => ({
        priority: "High",
        action: `Address security issue: ${violation.description}`,
        owner: "Development Team",
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks
      })),
    ];
  }

  /**
   * Clear audit log (for testing only)
   */
  clearAuditLog(): void {
    this.auditLog = [];
    this.validationCache.clear();
  }
}

// Audit log interface
interface SecurityAuditLog {
  type: "security_validation" | "compliance_check" | "incident_response";
  result: SecurityValidationResult;
  duration: number;
  timestamp: string;
}

// Factory function
export const createSecurityComplianceValidator = (
  optimizer: AestheticClinicPerformanceOptimizer,
  websocketOptimizer?: WebSocketOptimizer,
) => {
  return new SecurityComplianceValidator(optimizer, websocketOptimizer);
};

export default SecurityComplianceValidator;