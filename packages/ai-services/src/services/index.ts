// AI Provider Services
export * from './provider-management-service';
export * from './healthcare-compliance-service';

// Main exports
export {
  // Provider Management
  ProviderManagementService,
  type ProviderManagementConfig,
  type ProviderMetrics,
  type ProviderAlert,
  type AlertLevel,
  type AlertType,
  
  // Healthcare Compliance
  HealthcareComplianceService,
  type HealthcareComplianceServiceConfig,
  type HealthcareContext,
  type ComplianceCheckResult,
  type ComplianceViolation,
  type ComplianceAuditLog,
  type PIIType,
  type PIIRedactionStrategy,
  type ViolationSeverity,
  type BrazilianRegulatoryFramework,
} from './provider-management-service';

/**
 * Default service instances
 */
export const providerManagementService = ProviderManagementService.getInstance();
export const healthcareComplianceService = HealthcareComplianceService.getInstance();