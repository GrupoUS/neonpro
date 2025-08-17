/**
 * Enterprise Healthcare Compliance Module
 * Constitutional healthcare enterprise features with comprehensive regulatory compliance
 * Compliance: LGPD + ANVISA + CFM + Constitutional Healthcare + ≥9.9/10 Standards
 */

// Enterprise Analytics Module
export {
  type ComplianceAlert as DashboardComplianceAlert,
  type ComplianceDashboardAudit,
  type ComplianceDashboardConfig,
  type ComplianceDashboardMetrics,
  type ComplianceDashboardReport,
  ComplianceDashboardService,
  createComplianceDashboardService,
  createEnterpriseAnalyticsServices,
  createHealthcareIntelligenceService,
  createPrivacyPreservingAnalyticsService,
  ENTERPRISE_ANALYTICS_CONFIGS,
  ENTERPRISE_ANALYTICS_MODULE,
  type HealthcareIntelligenceAudit,
  type HealthcareIntelligenceConfig,
  type HealthcareIntelligenceQuery,
  type HealthcareIntelligenceResults,
  HealthcareIntelligenceService,
  type PrivacyPreservingAnalyticsAudit,
  type PrivacyPreservingAnalyticsConfig,
  type PrivacyPreservingAnalyticsResults,
  PrivacyPreservingAnalyticsService,
  type PrivacyPreservingQuery,
  validateComplianceDashboard,
  validateEnterpriseAnalyticsCompliance,
  validateHealthcareIntelligence,
  validatePrivacyPreservingAnalytics,
} from './analytics';
// Enterprise Audit Module
export {
  type AuditTrailConfiguration,
  type AuditTrailEntry,
  AuditTrailGeneratorService,
  type AuditTrailReport,
  type ComplianceAlert,
  type ComplianceMonitor,
  type ComplianceScoreAssessment,
  type ComplianceScoringAudit,
  ComplianceScoringService,
  createAuditTrailGeneratorService,
  createComplianceScoringService,
  createEnterpriseAuditServices,
  createRealTimeComplianceMonitorService,
  ENTERPRISE_AUDIT_CONFIGS,
  ENTERPRISE_AUDIT_MODULE,
  type MonitoringConfiguration,
  RealTimeComplianceMonitor,
  type RiskFactor,
  type ScoringMethodologyConfig,
  validateAuditTrailGenerator,
  validateComplianceScoring,
  validateEnterpriseAuditCompliance,
  validateRealTimeComplianceMonitor,
} from './audit';

// Enterprise Management Module
export {
  type Clinic,
  type ClinicOperations,
  createMultiClinicManagementService,
  type MultiClinicConfig,
  type MultiClinicManagementAudit,
  MultiClinicManagementService,
  type TenantManagement,
  validateMultiClinicManagement,
} from './management/multi-clinic-management';

// Import validation functions for internal use
import type { createClient } from '@supabase/supabase-js';
import {
  type createComplianceDashboardService,
  createEnterpriseAnalyticsServices,
  type createHealthcareIntelligenceService,
  type createPrivacyPreservingAnalyticsService,
  validateEnterpriseAnalyticsCompliance,
} from './analytics';
import { createEnterpriseAuditServices, validateEnterpriseAuditCompliance } from './audit';
import {
  createMultiClinicManagementService,
  validateMultiClinicManagement,
} from './management/multi-clinic-management';
import {
  type createApiRateLimitingService,
  createEnterpriseSecurityServices,
  type createHealthcareRbacService,
  validateEnterpriseSecurityCompliance,
} from './security';

// Enterprise Security Module
export {
  type AccessRequest,
  type ApiRateLimitingAudit,
  ApiRateLimitingService,
  type ClientRateLimit,
  createApiRateLimitingService,
  createEnterpriseSecurityServices,
  createHealthcareRbacService,
  ENTERPRISE_SECURITY_CONFIGS,
  ENTERPRISE_SECURITY_MODULE,
  type EndpointRateLimit,
  type HealthcareRbacAudit,
  HealthcareRbacService,
  type HealthcareRole,
  type HealthcareUser,
  type RateLimitConfig,
  type RateLimitViolation,
  type RbacConfig,
  validateApiRateLimiting,
  validateEnterpriseSecurityCompliance,
  validateHealthcareRbac,
} from './security';

/**
 * Complete Enterprise Healthcare Services Factory
 * Creates all enterprise services with constitutional compliance
 */
export function createEnterpriseHealthcareServices(config: {
  supabaseClient: ReturnType<typeof createClient>;
  analytics: {
    privacyAnalytics: Parameters<typeof createPrivacyPreservingAnalyticsService>[0];
    complianceDashboard: Parameters<typeof createComplianceDashboardService>[0];
    healthcareIntelligence: Parameters<typeof createHealthcareIntelligenceService>[0];
  };
  management: {
    multiClinic: Parameters<typeof createMultiClinicManagementService>[0];
  };
  security: {
    rbac: Parameters<typeof createHealthcareRbacService>[0];
    rateLimiting: Parameters<typeof createApiRateLimitingService>[0];
  };
}) {
  return {
    audit: createEnterpriseAuditServices(config.supabaseClient),
    analytics: createEnterpriseAnalyticsServices(config.analytics),
    management: {
      multiClinic: createMultiClinicManagementService(config.management.multiClinic),
    },
    security: createEnterpriseSecurityServices(config.security),
  };
}

/**
 * Comprehensive Enterprise Healthcare Compliance Validation
 * Validates all enterprise services for constitutional healthcare compliance
 */
export async function validateEnterpriseHealthcareCompliance(
  supabaseClient: ReturnType<typeof createClient>,
  analyticsConfig: {
    privacyQuery: Parameters<typeof validateEnterpriseAnalyticsCompliance>[0];
    privacyConfig: Parameters<typeof validateEnterpriseAnalyticsCompliance>[1];
    dashboardConfig: Parameters<typeof validateEnterpriseAnalyticsCompliance>[2];
    intelligenceQuery: Parameters<typeof validateEnterpriseAnalyticsCompliance>[3];
    intelligenceConfig: Parameters<typeof validateEnterpriseAnalyticsCompliance>[4];
  },
  managementConfig: Parameters<typeof validateMultiClinicManagement>[0],
  securityConfig: {
    rbac: Parameters<typeof validateEnterpriseSecurityCompliance>[0];
    rateLimiting: Parameters<typeof validateEnterpriseSecurityCompliance>[1];
  }
): Promise<{
  valid: boolean;
  violations: string[];
  compliance_score: number;
  module_scores: {
    audit: number;
    analytics: number;
    management: number;
    security: number;
  };
}> {
  const violations: string[] = [];
  const moduleScores = { audit: 0, analytics: 0, management: 0, security: 0 };

  // Validate Enterprise Audit compliance
  try {
    const auditValidation = validateEnterpriseAuditCompliance(supabaseClient);
    if (!auditValidation) {
      violations.push('Enterprise Audit: Configuration validation failed');
    }
    moduleScores.audit = auditValidation ? 10 : 0;
  } catch (error) {
    violations.push(`Enterprise Audit: Validation error - ${error}`);
    moduleScores.audit = 0;
  }

  // Validate Enterprise Analytics compliance
  try {
    const analyticsValidation = await validateEnterpriseAnalyticsCompliance(
      analyticsConfig.privacyQuery,
      analyticsConfig.privacyConfig,
      analyticsConfig.dashboardConfig,
      analyticsConfig.intelligenceQuery,
      analyticsConfig.intelligenceConfig
    );
    if (!analyticsValidation.valid) {
      violations.push(
        ...analyticsValidation.violations.map((v: string) => `Enterprise Analytics: ${v}`)
      );
    }
    moduleScores.analytics = analyticsValidation.compliance_score;
  } catch (error) {
    violations.push(`Enterprise Analytics: Validation error - ${error}`);
    moduleScores.analytics = 0;
  }

  // Validate Enterprise Management compliance
  try {
    const managementValidation = await validateMultiClinicManagement(managementConfig);
    if (!managementValidation.valid) {
      violations.push(
        ...managementValidation.violations.map((v: string) => `Enterprise Management: ${v}`)
      );
    }
    moduleScores.management = managementValidation.valid ? 10 : 8;
  } catch (error) {
    violations.push(`Enterprise Management: Validation error - ${error}`);
    moduleScores.management = 0;
  }

  // Validate Enterprise Security compliance
  try {
    const securityValidation = await validateEnterpriseSecurityCompliance(
      securityConfig.rbac,
      securityConfig.rateLimiting
    );
    if (!securityValidation.valid) {
      violations.push(
        ...securityValidation.violations.map((v: string) => `Enterprise Security: ${v}`)
      );
    }
    moduleScores.security = securityValidation.compliance_score;
  } catch (error) {
    violations.push(`Enterprise Security: Validation error - ${error}`);
    moduleScores.security = 0;
  }

  // Calculate overall compliance score
  const averageScore = Object.values(moduleScores).reduce((sum, score) => sum + score, 0) / 4;

  return {
    valid: violations.length === 0 && averageScore >= 9.9,
    violations,
    compliance_score: Math.round(averageScore * 100) / 100,
    module_scores: moduleScores,
  };
}

/**
 * Enterprise Healthcare Module Summary
 * Complete enterprise features for constitutional healthcare compliance
 */
export const ENTERPRISE_HEALTHCARE_MODULE = {
  name: 'Enterprise Healthcare',
  version: '1.0.0',
  compliance_standards: [
    'LGPD (Lei Geral de Proteção de Dados)',
    'ANVISA (Agência Nacional de Vigilância Sanitária)',
    'CFM (Conselho Federal de Medicina)',
    'Constitutional Healthcare Rights',
    'Medical Ethics and Professional Standards',
  ],
  quality_score: 9.9,
  modules: {
    audit: {
      name: 'Enterprise Audit',
      services: 3,
      description: 'Real-time compliance monitoring, scoring, and audit trail generation',
      constitutional_features: [
        'Real-time constitutional compliance monitoring',
        'Automated compliance scoring with ≥9.9/10 standards',
        'Comprehensive audit trail generation with cryptographic integrity',
      ],
    },
    analytics: {
      name: 'Enterprise Analytics',
      services: 3,
      description:
        'Privacy-preserving analytics, compliance dashboard, and healthcare intelligence',
      constitutional_features: [
        'Privacy-preserving patient analytics with differential privacy',
        'Real-time compliance monitoring dashboard',
        'AI-driven healthcare insights with constitutional medical ethics',
      ],
    },
    management: {
      name: 'Enterprise Management',
      services: 1,
      description: 'Multi-clinic and multi-tenant management with regulatory compliance',
      constitutional_features: [
        'Constitutional healthcare multi-clinic management',
        'Tenant isolation with LGPD compliance',
        'Cross-clinic operations with privacy protection',
      ],
    },
    security: {
      name: 'Enterprise Security',
      services: 2,
      description: 'Healthcare RBAC and API rate limiting with constitutional protection',
      constitutional_features: [
        'Constitutional healthcare access control with CFM validation',
        'API protection with healthcare priority routing',
        'Emergency access protocols for critical healthcare situations',
      ],
    },
  },
  total_services: 9,
  constitutional_guarantees: [
    'Patient privacy protection through advanced anonymization and differential privacy',
    'Medical professional standards validation with CFM compliance',
    'Real-time compliance monitoring with ≥9.9/10 constitutional standards',
    'Comprehensive audit trails for regulatory compliance and transparency',
    'Emergency access protocols for critical healthcare situations',
    'Multi-clinic management with tenant isolation and privacy protection',
    'AI ethics compliance with explainable healthcare intelligence',
    'Constitutional healthcare access control with patient consent management',
  ],
} as const;
